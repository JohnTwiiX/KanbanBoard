import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Staff } from '../types/Staff';
import { Task } from '../types/Task';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import { Router } from '@angular/router';
import { Priorities, Settings } from '../types/Settings';
import { UserObj } from '../types/User';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private columns: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null)
  private categories: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null)
  private priorities: BehaviorSubject<Priorities | null> = new BehaviorSubject<Priorities | null>(null);
  private projects: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);
  private staffs: BehaviorSubject<UserObj[] | null> = new BehaviorSubject<UserObj[] | null>(null);
  private id!: string;
  constructor(private firebaseService: FirebaseService, private authService: AuthService) {
    this.init();
  }

  init() {
    this.initTasks()
    this.initSettings()
  }

  initSettings() {
    this.firebaseService.initCollection('settings');
    this.firebaseService.getSettingsCollection()?.subscribe({
      next: (value: any) => {
        if (value.length === 0 && this.authService.getUser()) {
          this.setDefaultSettings();
        } else {

          this.columns.next(value.columns);
          this.categories.next(value.categories);
          this.priorities.next(value.priorities);
          this.projects.next(value.projects);
          this.id = value.id;
        }
      },
      error: e => console.error(e)
    })
    this.firebaseService.getUsers()?.subscribe({
      next: (value: any) => {
        const result = value.map((user: any) => ({
          display_name: user.display_name,
          uid: user.uid,
          image: user.image
        }))
        this.staffs.next(result);

      }
    })


  }

  initTasks() {
    const user = this.authService.getUser()?.isAnonymous ? 'anonym' : 'user';
    this.firebaseService.initCollection(user);
  }

  private setDefaultSettings() {
    const settings = {
      columns: ['TO DO', 'SCHEDULED', 'IN PROGRESS', 'DONE'],
      categories: ["Development", "Web", "Marketing", "Product", "Sale", "Management"],
      priorities: {
        'low': 'rgb(235, 211, 52)',
        'medium': 'rgb(235, 211, 52)',
        'important': 'rgb(55, 52, 235)',
        'high': 'rgb(235, 52, 52)'
      },
      projects: [],
    };
    this.firebaseService.setDefaultSettings(settings)
  }

  getColumns(): Observable<string[] | null> {
    return this.columns.asObservable();
  }

  getCategories(): Observable<string[] | null> {
    return this.categories.asObservable();
  }

  getProjects(): Observable<string[] | null> {
    return this.projects.asObservable();
  }

  getPrioritys(): Observable<Priorities | null> {
    return this.priorities.asObservable();
  }

  getStaffs(): Observable<UserObj[] | null> {
    return this.staffs.asObservable();
  }

  updateColumns(newColumns: string[]): void {
    this.columns.next(newColumns);
  }

  getUser() {
    return this.authService.getUser();
  }

  getSettingsId() {
    return this.id;
  }

}
