import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

import { getAuth, provideAuth } from '@angular/fire/auth';
import { importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { firebaseConfig } from '../../environments/environment.development';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        importProvidersFrom(provideFirebaseApp(() => initializeApp(firebaseConfig))),
        importProvidersFrom(provideAuth(() => getAuth())),
        importProvidersFrom(provideFirestore(() => getFirestore())),
        importProvidersFrom(provideStorage(() => getStorage())),
      ]
    });
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
