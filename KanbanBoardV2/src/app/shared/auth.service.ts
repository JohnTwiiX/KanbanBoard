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
  sendEmailVerification
} from '@angular/fire/auth';
import { CollectionReference, Firestore, collection } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;
  private backlogCollection: CollectionReference<any>;
  private anonymousBacklogCollection: CollectionReference<any>;
  private boardCollection: CollectionReference<any>;
  private anonymousBoardCollection: CollectionReference<any>;

  private timeIsOver = false;

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    this.user$ = authState(this.auth);
    this.anonymousBacklogCollection = collection(this.firestore, 'anonymousBacklog');
    this.anonymousBoardCollection = collection(this.firestore, 'anonymousBoard');
    this.backlogCollection = collection(this.firestore, 'backlog');
    this.boardCollection = collection(this.firestore, 'tasks');
  }

  async registerWithEmail(email: string, password: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      this.sendVerification();
      if (user) {
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
    await signInWithPopup(this.auth, new GoogleAuthProvider());
    this.setTimeInStorage();
    this.router.navigate(['/board']);
  }

  async loginAnonymously(): Promise<void> {
    const user = await signInAnonymously(this.auth);
    this.setAnonymousLoginFlag(user.user.uid)
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
    const user = this.auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
      console.log('Verification email sent.');
    }
  }


  setTimeInStorage() {
    const loginTimestamp = Date.now();
    localStorage.setItem('loginTime', loginTimestamp.toString());
  }

  getUser() {
    return this.auth.currentUser
  }

  isAnonymous(): Observable<boolean> {
    return authState(this.auth).pipe(
      map(user => user ? user.isAnonymous : false)
    );
  }

  getCollection(col: string) {
    const user = this.auth.currentUser;
    if (user && user.isAnonymous) {
      if (col === 'tasks') return this.anonymousBoardCollection;
      return this.anonymousBacklogCollection;
    } else {
      if (col === 'tasks') return this.boardCollection;
      return this.backlogCollection;
    }
  }

  setTimeOver() {
    this.timeIsOver = true;
  }

  isTimeOver() {
    return this.timeIsOver;
  }
}
