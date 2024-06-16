import { Component } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { RouterLink } from '@angular/router';
import { FormControl, Validators, FormsModule, ReactiveFormsModule, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', '../login/login.component.scss']
})
export class RegisterComponent {
  formControl = new FormGroup({
    email: new FormControl('', { validators: [Validators.required, Validators.email], updateOn: 'change' }),
    password: new FormControl('', { validators: [Validators.required], updateOn: 'change' }),
    confirmPassword: new FormControl('', { validators: [Validators.required], updateOn: 'change' })
  }, { validators: this.passwordMatchValidator });

  isError = false;

  constructor(private authService: AuthService) { }

  get email() {
    return this.formControl.get('email');
  }

  get password() {
    return this.formControl.get('password');
  }

  get confirmPassword() {
    return this.formControl.get('confirmPassword');
  }

  register() {
    if (this.formControl.valid) {
      this.authService.registerWithEmail(this.formControl.value.email as string, this.formControl.value.password as string).catch(() => {
        this.isError = true;
      });
    } else {
      console.log('Form is not valid');
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordsNotMatching: true };
  }
}
