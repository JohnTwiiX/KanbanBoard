import { Injectable } from '@angular/core';
import {
  Auth, authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  User,
  sendEmailVerification,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SettingsService } from './settings.service';
import { UserItemsService } from './user-items.service';
import { UserItems } from '../types/UserItems';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  private timeIsOver = false;

  constructor(private auth: Auth, private router: Router, private userItemsService: UserItemsService) {
    this.user$ = authState(this.auth);

  }

  async registerWithEmail(email: string, password: string, displayName: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      this.sendVerification();
      if (user) {
        await updateProfile(user, { displayName });
        this.setTimeInStorage();
        this.router.navigate(['/verified']);
      }
    } catch (error) {
      console.error('Registration error: ', error);
      throw error;
    }
  }

  async loginWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
    this.setTimeInStorage();
    this.router.navigate(['/board']);
  }

  async loginWithGoogle(): Promise<void> {
    const user = (await signInWithPopup(this.auth, new GoogleAuthProvider())).user;
    console.log(user);
    await this.userItemsService.googleLoginCheck(user);
    this.setTimeInStorage();
    this.router.navigate(['/board']);
  }

  async loginAnonymously(): Promise<void> {
    const user = await signInAnonymously(this.auth);
    this.setAnonymousLoginFlag(user.user.uid);
    this.setTimeInStorage();
    this.router.navigate(['/board']);
  }

  isAlreadyAnonymouslyLoggedIn(): boolean {
    return localStorage.getItem('anonymousUserId') !== null;
  }

  setAnonymousLoginFlag(userId: string): void {
    localStorage.setItem('anonymousUserId', userId);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    localStorage.removeItem('loginTime');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): Observable<User | null> {
    return this.user$.pipe(
      map(user => user)
    );
  }

  async sendVerification() {
    const user = this.getUser();
    if (user) {
      await sendEmailVerification(user);
      console.log('Verification email sent.');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Error sending password reset email', error);
    }
  }

  // Method to update the user's email
  async updateEmail(newEmail: string): Promise<void> {
    const user = this.getUser();

    if (!user) {
      return Promise.reject('No user logged in');
    }

    try {
      await updateEmail(user, newEmail);
      console.log('Email updated successfully');
    } catch (error) {
      console.error('Error updating email', error);
    }
  }


  setTimeInStorage() {
    const loginTimestamp = Date.now();
    localStorage.setItem('loginTime', JSON.stringify(loginTimestamp));
  }

  getUser() {
    return this.auth.currentUser
  }

  isAnonymous(): Observable<boolean> {
    return authState(this.auth).pipe(
      map(user => user ? user.isAnonymous : false)
    );
  }



  setTimeOver() {
    this.timeIsOver = true;
  }

  isTimeOver() {
    return this.timeIsOver;
  }
}
