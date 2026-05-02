import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0826866258';
const DATABASE_ID = process.env.FIREBASE_DATABASE_ID || 'ai-studio-d29633d9-6f61-4611-a0e6-17f3f0b59e6e';

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
}

function assertEnv() {
  if (!process.env.FIREBASE_CLIENT_EMAIL || !getPrivateKey()) {
    throw new Error(
      'Missing secure Firebase admin environment variables. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in Netlify before using staff recovery controls.'
    );
  }
}

function getAdminApp() {
  if (!getApps().length) {
    assertEnv();
    initializeApp({
      credential: cert({
        projectId: PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: getPrivateKey(),
      }),
      projectId: PROJECT_ID,
    });
  }

  return getApps()[0];
}

export function getAdminServices() {
  const app = getAdminApp();
  return {
    auth: getAuth(app),
    db: getFirestore(app, DATABASE_ID),
  };
}

export async function verifyRequest(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing Firebase ID token.');
  }

  const token = authHeader.slice('Bearer '.length);
  const { auth, db } = getAdminServices();
  const decoded = await auth.verifyIdToken(token);
  const profileSnap = await db.collection('users').doc(decoded.uid).get();
  const profile = profileSnap.exists ? profileSnap.data() : null;

  return {
    auth,
    db,
    decoded,
    profile,
  };
}
