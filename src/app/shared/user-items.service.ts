import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { UserItems } from '../types/UserItems';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { getDownloadURL, ref, getStorage } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class UserItemsService {
  private userItemsSubject: BehaviorSubject<UserItems | null> = new BehaviorSubject<UserItems | null>(null);
  public userItems$: Observable<UserItems | null> = this.userItemsSubject.asObservable();
  isUserItemsSet: boolean = false;

  private imageCache: Map<string, string> = new Map();

  constructor(private router: Router) {
    // this.loadCacheFromLocalStorage();
  }

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
          'display_name': user.displayName || 'anonym user',
          'Email': user.email || 'anonym user',
          'role': 'user',
          'uid': user.uid,
          'image': 'profile-dummy.png'
        });
        this.router.navigate(['/board']);
      } else {
        this.router.navigate(['/verified']);
      }
    }
  }

  async googleLoginCheck(user: User) {
    if (user) {
      const firestore = getFirestore();
      const userDocRef = doc(firestore, `users/${this.getStorageName(user.uid, user.displayName || 'anonym user')}`);

      const docSnapshot = await getDoc(userDocRef);

      if (!docSnapshot.exists()) {
        await this.setUserItems(user, {
          'display_name': user.displayName || 'anonym user',
          'Email': user.email || 'anonym user',
          'role': 'user',
          'uid': user.uid,
          'image': 'profile-dummy.png'
        });
      }
    }
  }

  async setUserItems(user: User, userItem: UserItems): Promise<void> {
    const firestore = getFirestore();
    const userDocRef = doc(firestore, `users/${this.getStorageName(user.uid, user.displayName || 'anonym user')}`);

    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
      console.log('Dokument existiert bereits');
    } else {
      await setDoc(userDocRef, userItem);
      console.log('Dokument erfolgreich geschrieben!');
    }
  }

  getStorageName(uid: string, displayName: string) {
    let first_name = displayName.split(' ')[0];
    return `${first_name}-${uid}`;
  }

  getUserItems(user: User): Observable<UserItems | null> {
    const firestore = getFirestore();
    const userDocRef = doc(firestore, `users/${this.getStorageName(user.uid, user.displayName || 'anonym user')}`);
    return from(getDoc(userDocRef).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        const userItemsData = docSnapshot.data() as UserItems;
        this.userItemsSubject.next(userItemsData);
        this.isUserItemsSet = true;
        return userItemsData;
      } else {
        this.userItemsSubject.next(null);
        return null;
      }
    }));
  }

  // async getImageUrl(filePath: string): Promise<string> {
  //   if (this.imageCache.has(filePath)) {
  //     return this.imageCache.get(filePath)!;
  //   }

  //   try {
  //     const storage = getStorage();
  //     const storageRef = ref(storage, filePath);
  //     const url = await getDownloadURL(storageRef);
  //     this.imageCache.set(filePath, url);
  //     this.saveCacheToLocalStorage();
  //     return url;
  //   } catch (error) {
  //     console.error('Fehler beim Abrufen der URL:', error);
  //     throw error;
  //   }
  // }

  private saveCacheToLocalStorage() {
    localStorage.setItem('imageCache', JSON.stringify(Array.from(this.imageCache.entries())));
  }
}
