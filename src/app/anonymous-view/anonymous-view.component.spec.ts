import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnonymousViewComponent } from './anonymous-view.component';

import { getAuth, provideAuth } from '@angular/fire/auth';
import { importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { firebaseConfig } from '../../environments/environment.dev';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { routes } from '../app.routes';

describe('AnonymousViewComponent', () => {
  let component: AnonymousViewComponent;
  let fixture: ComponentFixture<AnonymousViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnonymousViewComponent],
      providers: [
        importProvidersFrom(provideFirebaseApp(() => initializeApp(firebaseConfig))),
        importProvidersFrom(provideAuth(() => getAuth())),
        importProvidersFrom(provideFirestore(() => getFirestore())),
        importProvidersFrom(provideStorage(() => getStorage())),
        { provide: ActivatedRoute, useValue: routes }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AnonymousViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
