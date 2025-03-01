import { Injectable } from '@angular/core';
import { Auth, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInAnonymously, signOut, User, sendEmailVerification, updateProfile, sendPasswordResetEmail, updateEmail, onAuthStateChanged } from 'firebase/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../environments/environment';
import { UserItemsService } from './user-items.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private app: FirebaseApp;
  public auth: Auth;


  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  private timeIsOver = false;

  interval: any

  constructor(private router: Router, private userItemsService: UserItemsService) {
    this.app = initializeApp(firebaseConfig);
    // Firebase-Dienste bereitstellen
    this.auth = getAuth(this.app);
    onAuthStateChanged(this.auth, (user) => {
      if (user && user.emailVerified) {
        this.checkLoginTime(user);
        if (!userItemsService.isUserItemsSet) {
          userItemsService.getUserItems(user);
        }
      } else {
        clearInterval(this.interval);
      }
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
        this.router.navigate(['/verified']);
      }
    } catch (error) {
      console.error('Registration error: ', error);
      throw error;
    }
  }


  async loginWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }


  async loginWithGoogle(): Promise<void> {
    await signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  checkLoginTime(user: User) {
    const lastSignInTime = user.metadata.lastSignInTime;

    if (lastSignInTime) {
      const lastSignInMillis = new Date(lastSignInTime).getTime();
      const currentTime = new Date().getTime();
      const twoHoursInMillis = 2 * 60 * 60 * 1000;

      if (currentTime - lastSignInMillis >= twoHoursInMillis) {
        this.logout();
      } else {
        this.interval = setInterval(() => {
          const currentTime = new Date().getTime();
          if (currentTime - lastSignInMillis >= twoHoursInMillis) {

            this.logout();
          }
        }, 60000);
      }
    } else {
      console.warn('lastSignInTime ist nicht definiert.');
    }
  }

  async loginAnonymously(): Promise<void> {
    const userCredential = await signInAnonymously(this.auth);
    const user = userCredential.user;
    this.setAnonymousLoginFlag(user.uid);
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
    clearInterval(this.interval);
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
