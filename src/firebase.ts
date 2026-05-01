import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with long polling enabled for better compatibility in sandboxed environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);
export const sendAdminPasswordReset = (email: string) => sendPasswordResetEmail(auth, email);

// Connection test - only run once and handle errors gracefully
async function testConnection() {
  try {
    // Attempting a light read to verify connection
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection established.");
  } catch (error) {
    // We ignore 403 (Permission Denied) because that's expected for this test path
    // We only care about connectivity errors
    if (error instanceof Error && (error.message.includes('unavailable') || error.message.includes('offline'))) {
      console.warn("Firestore connectivity warning: The client may be operating in offline mode.", error.message);
    }
  }
}
testConnection();
