import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketComponent } from './ticket.component';

import { getAuth, provideAuth } from '@angular/fire/auth';
import { importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { firebaseConfig } from '../../environments/environment.dev';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { Task } from '../types/Task';
import { Priorities } from '../types/Settings';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserItemsService } from '../../../../KanbanBoard/src/app/shared/user-items.service';
import { FirebaseService } from '../../../../KanbanBoard/src/app/shared/firebase.service';
import { SettingsService } from '../../../../KanbanBoard/src/app/shared/settings.service';
import { of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { DialogViewComponent } from '../../../../KanbanBoard/src/app/dialog-view/dialog-view.component';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';

describe('TicketComponent', () => {
  let component: TicketComponent;
  let fixture: ComponentFixture<TicketComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let firebaseServiceSpy: jasmine.SpyObj<FirebaseService>;
  let userItemsServiceSpy: jasmine.SpyObj<UserItemsService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

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

  const mockPriorities: Priorities = {
    high: '#FF0000',
    medium: '#FFFF00',
    low: '#00FF00'
  };

  beforeEach(async () => {
    settingsServiceSpy = jasmine.createSpyObj('SettingsService', ['getPrioritys']);
    settingsServiceSpy.getPrioritys.and.returnValue(of(mockPriorities));

    firebaseServiceSpy = jasmine.createSpyObj('FirebaseService', ['deleteFromCollection', 'addToCollection']);
    userItemsServiceSpy = jasmine.createSpyObj('UserItemsService', ['getImageUrl']);
    userItemsServiceSpy.getImageUrl.and.returnValue(Promise.resolve('mock-image-url'));

    // Mock MatDialog
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    // Mock the return value of dialog.open()
    dialogSpy.open.and.returnValue({
      afterClosed: of(true), // Mock afterClosed observable
    } as any);
    await TestBed.configureTestingModule({
      imports: [
        TicketComponent,
        MatCardModule,
        NgClass,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatDialogModule,
      ],
      providers: [
        importProvidersFrom(provideFirebaseApp(() => initializeApp(firebaseConfig))),
        importProvidersFrom(provideAuth(() => getAuth())),
        importProvidersFrom(provideFirestore(() => getFirestore())),
        importProvidersFrom(provideStorage(() => getStorage())),
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
        { provide: UserItemsService, useValue: userItemsServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TicketComponent);
    component = fixture.componentInstance;
    component.task = mockTask;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize imageUrl on init', async () => {
    await component.ngOnInit();
    expect(component.imageUrl).toBe('mock-image-url');
  });

  it('should return correct color for priority', () => {
    expect(component.getColorPriority('medium')).toBe('#FFFF00');
  });

  it('should open the delete dialog', () => {
    component.openDialog();
    expect(dialogSpy.open).toHaveBeenCalledWith(DialogDeleteComponent, {
      data: { title: mockTask.title, id: mockTask.id, col: 'tasks' },
    });
  });

  it('should switch task to backlog', () => {
    component.switchToBacklog(mockTask);
    if (mockTask.id)
      expect(firebaseServiceSpy.deleteFromCollection).toHaveBeenCalledWith('tasks', mockTask.id);
    expect(firebaseServiceSpy.addToCollection).toHaveBeenCalledWith('backlog', {
      ...mockTask,
      status: 'BACKLOG',
    });
  });

  it('should open task dialog', () => {
    component.openTaskDialog();
    expect(dialogSpy.open).toHaveBeenCalledWith(DialogViewComponent, {
      data: { task: mockTask, func: jasmine.any(Function) },
    });
  });
});
