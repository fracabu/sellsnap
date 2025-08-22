import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export const signUp = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    };
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const signIn = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    };
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error('Errore durante il logout');
  }
};

export const onAuthChange = (callback: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });
    } else {
      callback(null);
    }
  });
};

const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Utente non trovato';
    case 'auth/wrong-password':
      return 'Password incorretta';
    case 'auth/email-already-in-use':
      return 'Email già in uso';
    case 'auth/weak-password':
      return 'Password troppo debole';
    case 'auth/invalid-email':
      return 'Email non valida';
    default:
      return 'Errore di autenticazione';
  }
};