'use client';
import {useEffect, useState} from 'react';
import {FirebaseApp, initializeApp} from 'firebase/app';
import {Auth, getAuth} from 'firebase/auth';
import {Firestore, getFirestore} from 'firebase/firestore';
import {FirebaseProvider} from './provider';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

export function FirebaseClientProvider({children}: {children: React.ReactNode}) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!app) {
          const response = await fetch('/__/firebase/init.json');
          
          if (!response.ok) {
            throw new Error('Firebase config not found');
          }
          
          const firebaseConfig = await response.json();
          app = initializeApp(firebaseConfig);
          auth = getAuth(app);
          firestore = getFirestore(app);
        }
        setServices({app, auth: auth!, firestore: firestore!});
      } catch (err) {
        console.warn('Firebase initialization failed, continuing without Firebase:', err);
        setError('Firebase not available');
        // No lanzar error, permitir que la app continúe sin Firebase
      }
    };

    initialize();
  }, []);

  // Si hay error de Firebase, renderizar children sin FirebaseProvider
  if (error) {
    return <>{children}</>;
  }

  // Si no hay servicios aún, mostrar loading
  if (!services) {
    return null;
  }

  return (
    <FirebaseProvider
      app={services.app}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}

import {FirebaseProvider, useAuth, useFirebase, useFirebaseApp, useFirestore} from './provider';
import {FirebaseClientProvider} from './client-provider';
import {useUser} from './auth/use-user';

// This is a barrel file. More exports will be added here as features are built.
export {
  FirebaseProvider,
  useAuth,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  FirebaseClientProvider,
  useUser,
};
