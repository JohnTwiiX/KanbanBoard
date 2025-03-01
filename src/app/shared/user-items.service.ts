import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';
import { doc, getDoc, setDoc, getFirestore, onSnapshot } from 'firebase/firestore';
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

  unsubscribeUserItems: any;

  constructor(private router: Router) {

  }

  async checkUserCredentials(user: User): Promise<void> {
    await user.reload();
    if (user.emailVerified && !user.isAnonymous) {
      await this.setUserItems(user, {
        'display_name': user.displayName || 'anonym user',
        'email': user.email || 'anonym user',
        'role': 'user',
        'permissions': 'read',
        'projects': []
      });
    } else {
      this.router.navigate(['/verified']);
    }
  }

  async setUserItems(user: User, userItem: UserItems): Promise<void> {
    const firestore = getFirestore();
    const userDocRef = doc(firestore, `users/${user.uid}`);
    const userDocRefPrivate = doc(firestore, `users/${user.uid}/private/privateData`);

    const privateItems = {
      'email': userItem.email,
      'role': userItem.role,
      'permissions': userItem.permissions,
      'projects': userItem.projects
    };

    const publicItems = {
      'display_name': userItem.display_name,
      'image': userItem.image || ''
    }

    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
      console.log('Dokument existiert bereits');
    } else {
      await setDoc(userDocRef, publicItems);
      await setDoc(userDocRefPrivate, privateItems);
      console.log('Dokument erfolgreich geschrieben!');
    }
  }

  getUserItems(user: User): void {
    const firestore = getFirestore();
    const userDocRef = doc(firestore, `users/${user.uid}/private/privateData`);
    // onSnapshot für Echtzeit-Updates
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userItemsData = docSnapshot.data() as UserItems;
        this.isUserItemsSet = true;
        this.userItemsSubject.next(userItemsData);
      } else {
        this.userItemsSubject.next(null);
        this.isUserItemsSet = false;
      }
    }, (error) => {
      console.error("Error fetching user items:", error);
      this.userItemsSubject.next(null);
      this.isUserItemsSet = false;
    });

    // Optional: Speichere den unsubscribe-Callback, falls du die Listener später beenden möchtest
    this.unsubscribeUserItems = unsubscribe;
  }

  deleteUserItems() {
    this.userItemsSubject.next(null);
    if (this.unsubscribeUserItems)
      this.unsubscribeUserItems();

    this.isUserItemsSet = false;
  }

}
