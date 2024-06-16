import { Injectable } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isLoggedIn().pipe(
    switchMap(isLoggedIn => {
      if (isLoggedIn) {
        if (isLoggedIn.isAnonymous && authService.isTimeOver()) {
          router.navigate(['/anonym']);
          return of(false);
        } else if (isLoggedIn && !isLoggedIn.isAnonymous && !isLoggedIn.emailVerified) {
          if (!state.url.includes('/verified')) router.navigate(['/verified']);
          return of(true);
        }
        const loginTime = localStorage.getItem('loginTime');
        const currentTime = Date.now();
        const oneDayInMilliseconds = 7 * 24 * 60 * 60 * 1000;
        if (loginTime) {
          if (currentTime - parseInt(loginTime, 10) >= oneDayInMilliseconds) {
            authService.logout();
            router.navigate(['/login']);
            return of(false);
          } else {
            authService.setTimeInStorage();
            return of(true);
          }
        } else {
          authService.logout();
          router.navigate(['/login']);
          return of(false);
        }
      } else {
        authService.logout();
        router.navigate(['/login']);
        return of(false);
      }
    })
  );
};
