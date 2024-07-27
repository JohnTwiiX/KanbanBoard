import { Component } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent {
  remainingTime!: number; // 5 Minuten in Sekunden
  intervalId: any;

  constructor(private authService: AuthService, private router: Router) {
    this.setTime();
  }

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startTimer(): void {
    this.intervalId = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        this.stopTimer();
        this.authService.setTimeOver();
        this.router.navigate(['/anonym']);
      }
    }, 1000);
  }

  stopTimer(): void {
    clearInterval(this.intervalId);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${this.pad(minutes)}:${this.pad(remainingSeconds)}`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  setTime() {
    const time = localStorage.getItem('loginTime');
    if (time) {
      const timeInt = 300 + Math.floor(JSON.parse(time) / 1000);
      const now = Math.floor(Date.now() / 1000);
      console.log(timeInt - 300);
      console.log(timeInt);
      console.log(now);
      console.log(timeInt - now);
      console.log(timeInt - now < 300);

      if (timeInt - now <= 300) {
        this.remainingTime = timeInt - now;
      } else {
        this.authService.logout();
      }
    } else {
      this.authService.logout();
    }

  }

}
