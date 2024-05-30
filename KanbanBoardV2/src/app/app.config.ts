import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';


export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), provideAnimationsAsync(), importProvidersFrom(provideFirebaseApp(() => initializeApp({ "projectId": "kanbanboard-john", "appId": "1:915177048419:web:ecd3d1b98b34f4b3046b56", "storageBucket": "kanbanboard-john.appspot.com", "apiKey": "AIzaSyAZJuYw4XeaSTh4mJB-YnDci9whqK12tl8", "authDomain": "kanbanboard-john.firebaseapp.com", "messagingSenderId": "915177048419", "measurementId": "G-4K563XD5PX" }))), importProvidersFrom(provideAuth(() => getAuth())), importProvidersFrom(provideFirestore(() => getFirestore())),]
};
