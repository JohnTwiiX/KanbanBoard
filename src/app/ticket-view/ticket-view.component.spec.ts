import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketViewComponent } from './ticket-view.component';

import { getAuth, provideAuth } from '@angular/fire/auth';
import { importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { firebaseConfig } from '../../environments/environment.dev';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { MatDialogRef } from '@angular/material/dialog';
import { Priorities } from '../types/Settings';
import { Task } from '../types/Task';
import { SettingsService } from '../shared/settings.service';
import { of } from 'rxjs';

describe('TicketViewComponent', () => {
  let component: TicketViewComponent;
  let fixture: ComponentFixture<TicketViewComponent>;
  let mockSettingsService: jasmine.SpyObj<SettingsService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<TicketViewComponent>>;

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
    mockSettingsService = jasmine.createSpyObj('SettingsService', ['getPrioritys']);
    mockSettingsService.getPrioritys.and.returnValue(of(mockPriorities));

    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [TicketViewComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        importProvidersFrom(provideFirebaseApp(() => initializeApp(firebaseConfig))),
        importProvidersFrom(provideAuth(() => getAuth())),
        importProvidersFrom(provideFirestore(() => getFirestore())),
        importProvidersFrom(provideStorage(() => getStorage())),
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TicketViewComponent);
    component = fixture.componentInstance;
    component.task = mockTask;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the task title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h2').textContent).toContain('Test Task');
  });

  it('should close the dialog on editTask', () => {
    component.editTask();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should emit openDialogEdit event on editTask', () => {
    spyOn(component.openDialogEdit, 'emit');
    component.editTask();
    expect(component.openDialogEdit.emit).toHaveBeenCalled();
  });

  it('should return correct color for medium priority', () => {
    expect(component.getColor).toBe('#FF0000');
  });

});
