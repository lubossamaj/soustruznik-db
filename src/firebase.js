/**
 * firebase.js – inicializace Firebase pro Soustružník DB
 *
 * Konfigurace se čte z Vite env proměnných (soubor .env nebo .env.local).
 *
 * Požadavky Firebase Console:
 *  - Firestore Database (nativní režim)
 *  - Web app zaregistrovaná v projektu
 *  - Firebase Storage se NEPOUŽÍVÁ – fotky jsou uloženy jako
 *    komprimovaný base64 přímo v dokumentech Firestore.
 */

import { initializeApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from 'firebase/firestore'

// Konfigurace z Vite env proměnných (prefix VITE_ = přístupné v prohlížeči)
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Inicializace Firebase aplikace
const app = initializeApp(firebaseConfig)

/**
 * Firestore s offline persistencí přes IndexedDB.
 * persistentMultipleTabManager zajišťuje správnou synchronizaci
 * při otevření více karet/oken prohlížeče současně.
 *
 * Pokud inicializace selže (prohlížeč bez podpory), fallback
 * na základní Firestore bez offline cache.
 */
export const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  } catch (e) {
    console.warn('Soustružník DB: Offline persistence se nepodařilo aktivovat.', e)
    return getFirestore(app)
  }
})()
