import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

export function useFirebaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        },
        (err) => {
          console.error('Auth error:', err);
          setError(err.message);
          setLoading(false);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.error('Firebase auth setup error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      return () => {};
    }
  }, []);

  return { user, loading, error };
}
