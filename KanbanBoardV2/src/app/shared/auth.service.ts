import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, signOut, authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) { }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  registerWithEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  loginAnonymously() {
    return signInAnonymously(this.auth);
  }

  logout() {
    return signOut(this.auth);
  }

  getUser(): Observable<any> {
    return authState(this.auth);
  }

  isAnonymous(): Observable<boolean> {
    return authState(this.auth).pipe(
      map(user => user ? user.isAnonymous : false)
    );
  }
}
