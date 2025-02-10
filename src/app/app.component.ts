import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AuthService } from './shared/auth.service';
import { CommonModule } from '@angular/common';
import { User } from 'firebase/auth';
import { UserItemsService } from './shared/user-items.service';
import { UserItems } from './types/UserItems';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'KanbanBoardV2';
  isLoggedIn!: User | null;
  userItems: UserItems | null = null;
  constructor(private router: Router, private authService: AuthService, private userItemsService: UserItemsService) {
    this.authService.isLoggedIn().subscribe({
      next: user => {
        this.isLoggedIn = user;
      }
    })

    userItemsService.userItems$.subscribe((userItems: UserItems | null) => {
      if (userItems) {
        this.userItems = userItems;
      }
    });
  }

  isAuthPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/register';
  }
}
