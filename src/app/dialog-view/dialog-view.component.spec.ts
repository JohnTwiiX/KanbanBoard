import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogViewComponent } from './dialog-view.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { firebaseConfig } from '../../environments/environment.dev';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { Task } from '../types/Task';

describe('DialogViewComponent', () => {
  let component: DialogViewComponent;
  let fixture: ComponentFixture<DialogViewComponent>;
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'This is a test task',
    status: 'In Progress',
    category: 'development',
    createdAt: '01.08.2024',
    priority: 'high',
    staff: {
      name: 'John',
      image: 'img/john.png'
    }
  };

  const mockFunc = (task: Task) => {
    console.log('Function executed with task:', task);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogViewComponent],
      providers: [
        importProvidersFrom(provideFirebaseApp(() => initializeApp(firebaseConfig))),
        importProvidersFrom(provideAuth(() => getAuth())),
        importProvidersFrom(provideFirestore(() => getFirestore())),
        importProvidersFrom(provideStorage(() => getStorage())),
        { provide: MAT_DIALOG_DATA, useValue: { task: mockTask, func: mockFunc } },
        { provide: MatDialogRef, useValue: {} },

      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DialogViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
