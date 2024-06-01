import { Component } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(public authService: AuthService) { }

  loginWithGoogle() {
    this.authService.loginWithGoogle().then((result) => {
      console.log("User signed in: ", result.user);
    }).catch((error) => {
      console.error("Error: ", error);
    });
  }

  loginWithEmail() {
    this.authService.loginWithEmail(this.email, this.password).then((result) => {
      console.log("User signed in: ", result.user);
    }).catch((error) => {
      console.error("Error: ", error);
    });
  }

  registerWithEmail() {
    this.authService.registerWithEmail(this.email, this.password).then((result) => {
      console.log("User registered: ", result.user);
    }).catch((error) => {
      console.error("Error: ", error);
    });
  }

  loginAnonymously() {
    this.authService.loginAnonymously().then((result) => {
      console.log("Guest signed in: ", result.user);
    }).catch((error) => {
      console.error("Error: ", error);
    });
  }

  logout() {
    this.authService.logout();
  }

}
