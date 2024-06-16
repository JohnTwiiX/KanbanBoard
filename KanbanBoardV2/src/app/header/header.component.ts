import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../shared/auth.service';
import { TimerComponent } from '../timer/timer.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatMenuModule, MatButtonModule, MatIconModule, TimerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  value = '';
  constructor(private authService: AuthService) { }

  logout() {
    this.authService.logout();
  }

  isAnonym() {
    return this.authService.getUser()?.isAnonymous
  }

  isUser() {
    return this.authService.getUser();
  }
}
