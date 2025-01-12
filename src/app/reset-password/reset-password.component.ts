import { Component } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, MatButtonModule, MatInputModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  email: string = '';

  constructor(private authService: AuthService, private location: Location) { }

  resetPassword() {
    this.authService.resetPassword(this.email)
      .then(() => {
        this.location.back()
        alert('Password reset email sent');
      })
      .catch(error => {
        console.error('Error resetting password:', error);
        alert('Error resetting password');
      });
  }

}
