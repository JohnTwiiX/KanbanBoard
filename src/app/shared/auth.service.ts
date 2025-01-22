import { Injectable } from '@angular/core';
import { Auth, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInAnonymously, signOut, User, sendEmailVerification, updateProfile, sendPasswordResetEmail, updateEmail, onAuthStateChanged } from 'firebase/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SettingsService } from './settings.service';
import { UserItemsService } from './user-items.service';
import { UserItems } from '../types/UserItems';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private app: FirebaseApp;
  public auth: Auth;


  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  private timeIsOver = false;

  constructor(private router: Router, private userItemsService: UserItemsService) {
    this.app = initializeApp(firebaseConfig);
    // Firebase-Dienste bereitstellen
    this.auth = getAuth(this.app);
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  async registerWithEmail(email: string, password: string, displayName: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      const user = userCredential.user;
      await this.sendVerification();
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
    const userCredential = await signInWithPopup(this.auth, new GoogleAuthProvider());
    const user = userCredential.user;
    console.log(user);
    await this.userItemsService.googleLoginCheck(user);
    this.setTimeInStorage();
    this.router.navigate(['/board']);
  }



  async loginAnonymously(): Promise<void> {
    const userCredential = await signInAnonymously(this.auth);
    const user = userCredential.user;
    this.setAnonymousLoginFlag(user.uid);
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
    return this.auth.currentUser;
  }


  isAnonymous(): Observable<boolean> {
    return this.user$.pipe(
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
