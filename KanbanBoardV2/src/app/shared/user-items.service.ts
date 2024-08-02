import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { UserItems } from '../types/UserItems';
import { BehaviorSubject, catchError, from, Observable } from 'rxjs';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class UserItemsService {
  private userItemsSubject: BehaviorSubject<UserItems | null> = new BehaviorSubject<UserItems | null>(null);
  public userItems$: Observable<UserItems | null> = this.userItemsSubject.asObservable();
  isUserItemsSet: boolean = false;

  private imageCache: Map<string, string> = new Map(); // caching in Angular

  constructor(private router: Router, private firestore: Firestore, private storage: Storage) {
    this.loadCacheFromLocalStorage();
  }

  /**
   * that's load the image url from LocalStorage
   */
  private loadCacheFromLocalStorage() {
    const storedCache = localStorage.getItem('imageCache');
    if (storedCache) {
      this.imageCache = new Map<string, string>(JSON.parse(storedCache));
    }
  }

  async checkEmailVerificationAndAssignRole(user: User): Promise<void> {
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        await this.setUserItems(user, {
          'display_name': user.displayName,
          'Email': user.email,
          'role': 'user',
          'uid': user.uid,
          'img': 'profile-dummy.png'
        });
        this.router.navigate(['/board']);  // or wherever you want to redirect the user
      } else {
        this.router.navigate(['/verified']);
      }
    }
  }

  async googleLoginCheck(user: User) {
    if (user) {
      const userDocRef = doc(this.firestore, `users/${this.getStorageName(user.uid, user.displayName || 'anonym user')}`);

      const docSnapshot = await getDoc(userDocRef);

      if (!docSnapshot.exists()) {
        await this.setUserItems(user, {
          'display_name': user.displayName,
          'Email': user.email,
          'role': 'user',
          'uid': user.uid
        });
      }
    }
  }

  async setUserItems(user: User, userItem: any): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${this.getStorageName(user.uid, user.displayName || 'anonym user')}`);

    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
      console.log('Document already exists');
    } else {
      await setDoc(userDocRef, userItem);
      console.log('Document successfully written!');
    }
  }

  getStorageName(uid: string, displayName: string) {
    let first_name = displayName.split(' ')[0]
    return `${first_name}-${uid}`
  }

  async getUserItems(user: User) {
    const userDocRef = doc(this.firestore, `users/${this.getStorageName(user.uid, user.displayName || 'anonym user')}`);
    let userItemsResult = await getDoc(userDocRef);
    let userItemsData = userItemsResult.data()
    this.userItemsSubject.next(userItemsData as UserItems);
    this.isUserItemsSet = true;
    return userItemsData as UserItems;
  }

  async getImageUrl(filePath: string): Promise<string> {
    if (this.imageCache.has(filePath)) {
      return this.imageCache.get(filePath)!;
    }

    try {
      const storageRef = ref(this.storage, filePath);
      const url = await getDownloadURL(storageRef);
      this.imageCache.set(filePath, url);
      this.saveCacheToLocalStorage();
      return url;
    } catch (error) {
      console.error('Fehler beim Abrufen der URL:', error);
      throw error;
    }
  }

  private saveCacheToLocalStorage() {
    localStorage.setItem('imageCache', JSON.stringify(Array.from(this.imageCache.entries())));
  }
}
