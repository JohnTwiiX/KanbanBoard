import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../shared/auth.service';
import { TimerComponent } from '../timer/timer.component';
import { UserItemsService } from '../shared/user-items.service';
import { UserItems } from '../types/UserItems';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-header',
  imports: [MatMenuModule, MatButtonModule, MatIconModule, TimerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  value = '';
  isLoggedIn!: User | null;

  userItems!: UserItems | null
  constructor(private authService: AuthService, private userItemsService: UserItemsService, private router: Router) {
    this.userItemsService.userItems$.subscribe({
      next: (user: UserItems | null) => {
        this.userItems = user
      }
    });

    this.authService.isLoggedIn().subscribe({
      next: isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
      }
    })
  }

  switchTo() {
    this.router.navigate(['/settings']);
  }

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
