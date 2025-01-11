import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AuthService } from './shared/auth.service';
import { CommonModule } from '@angular/common';
import { User } from 'firebase/auth';


@Component({
    selector: 'app-root',
    imports: [RouterOutlet, HeaderComponent, FooterComponent, RouterLink, RouterLinkActive, CommonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'KanbanBoardV2';
  isLoggedIn!: User | null;
  constructor(private router: Router, private authService: AuthService) {
    this.authService.isLoggedIn().subscribe({
      next: user => {
        this.isLoggedIn = user;
      }
    })
  }

  isAuthPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/register';
  }
}
