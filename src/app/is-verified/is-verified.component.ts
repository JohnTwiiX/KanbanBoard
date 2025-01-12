import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { UserItemsService } from '../shared/user-items.service';

@Component({
  selector: 'app-is-verified',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './is-verified.component.html',
  styleUrl: './is-verified.component.scss'
})
export class IsVerifiedComponent implements OnInit, OnDestroy {
  private intervalId: any;
  constructor(private authService: AuthService, private userItemsService: UserItemsService) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userItemsService.checkEmailVerificationAndAssignRole(user);
      this.intervalId = setInterval(() => {
        this.userItemsService.checkEmailVerificationAndAssignRole(user);
      }, 5000);
    }
  }

  sendVerification() {
    this.authService.sendVerification();
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed to avoid memory leaks
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
