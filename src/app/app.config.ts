import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp } from 'firebase/app'; // Verwende die native Firebase SDK Methode
import { getAuth } from 'firebase/auth'; // Firebase Auth aus dem SDK
import { getFirestore } from 'firebase/firestore'; // Firebase Firestore aus dem SDK
import { firebaseConfig } from '../environments/environment.development'; // Deine Firebase Konfiguration
import { getStorage } from 'firebase/storage'; // Firebase Storage aus dem SDK
import { AuthService } from './shared/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    // Initialisiere Firebase direkt in der App
    // Firebase-Dienste sind nicht direkt über importProvidersFrom zu integrieren
    // Firebase muss in einem Service initialisiert werden
  ]
};
