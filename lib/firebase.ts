import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Transaction, UserProfile, AccountMode } from './types';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/* CRITICAL: The app will break without this line */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export function isAuthCancellation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string; message?: string };
  const code = err.code || '';
  const message = err.message || '';
  return (
    code === 'auth/user-cancelled' ||
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    message.includes('auth/user-cancelled') ||
    message.includes('auth/popup-closed-by-user') ||
    message.includes('user-cancelled')
  );
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  const path = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore: client is offline or network unavailable.");
    }
    // Document might simply not exist yet, which still confirms valid server handshake
    return false;
  }
}

// Firebase Auth Helpers
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    if (isAuthCancellation(error)) {
      // User cancelled or closed the login popup; handled cleanly
      return null;
    }
    const err = error as { code?: string; message?: string };
    if (err?.code === 'auth/popup-blocked') {
      console.warn('Google Sign-in popup blocked by browser.');
      throw new Error('A janela pop-up foi bloqueada pelo navegador. Permita pop-ups para autenticar com o Google.');
    }
    if (err?.code === 'auth/unauthorized-domain' || (err?.message && err.message.includes('auth/unauthorized-domain'))) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'seu domínio';
      console.warn('Firebase auth/unauthorized-domain for host:', currentHost);
      throw new Error(`Domínio não autorizado no Firebase (${currentHost}). Adicione este domínio no Firebase Console > Authentication > Settings > Authorized domains.`);
    }
    console.warn('Google Sign-in did not complete:', err?.message || error);
    throw error;
  }
}

export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase sign-out failed:', error);
  }
}

// Cloud Synchronization for Transactions
export async function syncTransactionsToCloud(
  userId: string,
  transactions: Transaction[],
  accountMode: AccountMode
): Promise<void> {
  if (!userId) return;
  const basePath = `users/${userId}/transactions`;

  try {
    // Write in batch for atomic integrity
    const batch = writeBatch(db);
    const existingSnap = await getDocs(collection(db, basePath));

    // Delete existing remote transactions for this accountMode that were removed locally
    existingSnap.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.accountMode === accountMode && !transactions.some(t => String(t.id) === docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    // Upsert all local transactions
    transactions.forEach(t => {
      const docRef = doc(db, basePath, String(t.id));
      const payload = {
        id: Number(t.id),
        date: t.date,
        nome: t.nome || '',
        ticker: t.ticker.toUpperCase(),
        classe: t.classe || 'Ação',
        qtd: Number(t.qtd) || 0,
        valorUn: Number(t.valorUn) || 0,
        valorTotal: Number(t.valorTotal) || 0,
        tipo: t.tipo || 'ENTRADA',
        dividendo: Number(t.dividendo) || 0,
        userId,
        accountMode,
        ...(t.observacoes ? { observacoes: t.observacoes.slice(0, 500) } : {})
      };
      batch.set(docRef, payload);
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, basePath);
  }
}

// Fetch Cloud Transactions
export async function fetchTransactionsFromCloud(
  userId: string,
  accountMode: AccountMode
): Promise<Transaction[]> {
  if (!userId) return [];
  const basePath = `users/${userId}/transactions`;

  try {
    const snap = await getDocs(collection(db, basePath));
    const items: Transaction[] = [];

    snap.docs.forEach(docSnap => {
      const d = docSnap.data();
      if (d.accountMode === accountMode) {
        items.push({
          id: Number(d.id),
          date: d.date,
          nome: d.nome,
          ticker: d.ticker,
          classe: d.classe,
          qtd: Number(d.qtd),
          valorUn: Number(d.valorUn),
          valorTotal: Number(d.valorTotal),
          tipo: d.tipo,
          dividendo: Number(d.dividendo || 0),
          observacoes: d.observacoes || undefined
        });
      }
    });

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, basePath);
  }
}

// Save User Profile to Cloud
export async function syncProfileToCloud(userId: string, profile: UserProfile): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}/profile/main`;
  try {
    await setDoc(doc(db, 'users', userId, 'profile', 'main'), {
      userId,
      email: profile.email,
      ...(profile.nome ? { nome: profile.nome } : {}),
      ...(profile.telefone ? { telefone: profile.telefone } : {})
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Fetch User Profile from Cloud
export async function fetchProfileFromCloud(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  const path = `users/${userId}/profile/main`;
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'profile', 'main'));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      nome: data.nome || '',
      telefone: data.telefone || '',
      email: data.email || '',
      senha: '', // passwords never stored in firestore
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// Register with Email and Password
export async function registerWithEmailPassword(
  email: string,
  password: string,
  nome?: string,
  telefone?: string
): Promise<{ user: User; profile: UserProfile }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    if (nome && cred.user) {
      try {
        await updateProfile(cred.user, { displayName: nome });
      } catch (e) {
        console.warn('Could not update displayName:', e);
      }
    }

    const profile: UserProfile = {
      nome: nome || '',
      telefone: telefone || '',
      email: cleanEmail,
      senha: password,
    };

    // Save profile to Firestore immediately
    await syncProfileToCloud(cred.user.uid, profile);

    return { user: cred.user, profile };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'auth/email-already-in-use') {
      throw new Error('Este e-mail já está cadastrado. Faça login ou recupere sua senha.');
    }
    if (err.code === 'auth/weak-password') {
      throw new Error('A senha é muito fraca. Digite pelo menos 6 caracteres.');
    }
    if (err.code === 'auth/invalid-email') {
      throw new Error('O formato do e-mail é inválido.');
    }
    throw error;
  }
}

// Login with Email and Password across devices
export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<{ user: User; profile: UserProfile; transactions: Transaction[] }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const userId = cred.user.uid;

    // Load user profile from Firestore or fallback to user credentials
    let cloudProfile: UserProfile | null = null;
    try {
      cloudProfile = await fetchProfileFromCloud(userId);
    } catch (e) {
      console.warn('Could not fetch cloud profile, using auth info:', e);
    }

    const profile: UserProfile = {
      nome: cloudProfile?.nome || cred.user.displayName || cleanEmail.split('@')[0],
      telefone: cloudProfile?.telefone || '',
      email: cleanEmail,
      senha: password,
    };

    // Load transactions from Firestore
    let transactions: Transaction[] = [];
    try {
      transactions = await fetchTransactionsFromCloud(userId, 'real') || [];
    } catch (e) {
      console.warn('Could not fetch cloud transactions:', e);
    }

    return { user: cred.user, profile, transactions };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/wrong-password'
    ) {
      throw new Error('E-mail ou senha incorretos no banco de dados. Verifique suas credenciais.');
    }
    if (err.code === 'auth/invalid-email') {
      throw new Error('O formato do e-mail é inválido.');
    }
    if (err.code === 'auth/too-many-requests') {
      throw new Error('Muitas tentativas sem sucesso. Aguarde alguns instantes e tente novamente.');
    }
    throw error;
  }
}

// Send Password Reset Email
export async function sendResetPassword(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  await sendPasswordResetEmail(auth, cleanEmail);
}

