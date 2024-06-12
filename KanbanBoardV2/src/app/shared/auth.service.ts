import { Injectable } from '@angular/core';
import {
  Auth, authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  User
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

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    this.user$ = authState(this.auth);
    this.backlogCollection = collection(this.firestore, 'backlog');
    this.anonymousBacklogCollection = collection(this.firestore, 'anonymousBacklog');
    this.boardCollection = collection(this.firestore, 'tasks');
    this.anonymousBoardCollection = collection(this.firestore, 'anonymousBoard');
  }

  async registerWithEmail(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, password);
    this.router.navigate(['/board']);
  }

  async loginWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
    this.router.navigate(['/board']);
  }

  async loginWithGoogle(): Promise<void> {
    await signInWithPopup(this.auth, new GoogleAuthProvider());
    this.router.navigate(['/board']);
  }

  async loginAnonymously(): Promise<void> {
    await signInAnonymously(this.auth);
    this.router.navigate(['/board']);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user)
    );
  }

  getUser(): Observable<any> {
    return authState(this.auth);
  }

  isAnonymous(): Observable<boolean> {
    return authState(this.auth).pipe(
      map(user => user ? user.isAnonymous : false)
    );
  }

  getCollection(col: string) {
    const user = this.auth.currentUser;
    console.log(user);

    if (user && user.isAnonymous) {
      if (col === 'tasks') return this.anonymousBoardCollection;
      return this.anonymousBacklogCollection;
    } else {
      if (col === 'tasks') return this.boardCollection;
      return this.backlogCollection;
    }
  }
}
