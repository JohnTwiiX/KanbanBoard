import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-is-verified',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  templateUrl: './is-verified.component.html',
  styleUrl: './is-verified.component.scss'
})
export class IsVerifiedComponent {
  constructor(private authService: AuthService) { }

  sendVerification() {
    this.authService.sendVerification();
  }
}
