import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsVerifiedComponent } from './is-verified.component';

import { getAuth, provideAuth } from '@angular/fire/auth';
import { importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { firebaseConfig } from '../../environments/environment';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

describe('IsVerifiedComponent', () => {
  let component: IsVerifiedComponent;
  let fixture: ComponentFixture<IsVerifiedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IsVerifiedComponent],
      providers: [
        importProvidersFrom(provideFirebaseApp(() => initializeApp(firebaseConfig))),
        importProvidersFrom(provideAuth(() => getAuth())),
        importProvidersFrom(provideFirestore(() => getFirestore())),
        importProvidersFrom(provideStorage(() => getStorage())),
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(IsVerifiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
