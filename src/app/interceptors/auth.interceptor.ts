import { HttpInterceptorFn } from '@angular/common/http';
import { LocalStorageService } from '../shared/local-storage.service';
import { inject } from '@angular/core';
import { EMPTY, catchError, switchMap } from 'rxjs';
import { AuthService, Token } from '../shared/generated';
import { AuthExtentionService } from '../shared/auth-extention.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const localStorageService = inject(LocalStorageService);
    const authService = inject(AuthService);
    const authExtService = inject(AuthExtentionService);

    // First case and Second case: login or refresh token request
    if (req.url.includes('auth/login') || req.url.includes('auth/refresh')) {
        return next(req);
    }

    // Third case: any other request
    const accessToken = localStorageService.getItem('access_token');
    if (accessToken) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    }

    return next(req).pipe(
        catchError(error => {
            if (error.status !== 401) {
                throw error;
            }

            // Triggers token refresh and retries the request if access token is invalid
            const refreshToken = localStorageService.getItem('refresh_token');
            if (!refreshToken) {
                // Handle case where there's no refresh token
                authExtService.logout;
                return EMPTY;
            }

            return authService.refreshAccessTokenAuthRefreshPost(refreshToken as string).pipe(
                switchMap((token: Token) => {
                    localStorageService.setItem('access_token', token.access_token);
                    localStorageService.setItem('refresh_token', token.refresh_token);

                    // Clone the request with the new token and retry
                    req = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token.access_token}`
                        }
                    });

                    return next(req);
                }),
                catchError(() => {
                    // Handle case where refresh token is also invalid
                    authExtService.logout();
                    return EMPTY;
                })
            );
        })
    );
}
