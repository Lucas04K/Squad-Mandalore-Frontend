import {PrimaryButtonComponent} from "../buttons/primary-button/primary-button.component";
import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {SecondaryButtonComponent} from "../buttons/secondary-button/secondary-button.component";
import {IconComponent} from "../icon/icon.component";
import {PasswordBoxComponent} from "../password-box/password-box.component";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AlertComponent} from "../alert/alert.component";
import {AlertService} from "../../shared/alert.service";
import {UtilService} from "../../shared/service-util";
import {TrainerPostSchema, TrainerResponseSchema, TrainersService} from "../../shared/generated";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-create-trainer-modal',
  standalone: true,
  imports: [PrimaryButtonComponent, SecondaryButtonComponent, IconComponent, PasswordBoxComponent, ReactiveFormsModule, AlertComponent, NgClass],
  templateUrl: './create-trainer-modal.component.html',
  styleUrl: './create-trainer-modal.component.scss',
})
export class CreateTrainerModalComponent implements OnInit{
  @Input({required: true}) modal: any;
  @Input() selectedTrainer?: TrainerResponseSchema;
  @Output() trainerCallback = new EventEmitter<FormGroup>();

  trainerForm;
  constructor(private formBuilder: FormBuilder, private alertService: AlertService, private utilService: UtilService, private trainerService: TrainersService){
    this.trainerForm = this.formBuilder.group({
      username: ['', Validators.required],
      unhashed_password: ['', [Validators.required, utilService.passwordValidator()]],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    if(this.selectedTrainer){
      this.trainerForm.patchValue({
        username: this.selectedTrainer.username,
        email: this.selectedTrainer.email,
        firstname: this.selectedTrainer.firstname,
        lastname: this.selectedTrainer.lastname,
      })
    }
  }

  onSubmit(){
    this.trainerCallback.emit(this.trainerForm);
  }
}
