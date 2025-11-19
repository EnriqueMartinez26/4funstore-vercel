"use client";

import { User, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useAuth } from "@/firebase/provider";

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Si no hay auth disponible, intentar cargar usuario de localStorage
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser({
              uid: parsedUser.id || parsedUser.uid,
              email: parsedUser.email,
              displayName: parsedUser.nombre || parsedUser.displayName,
            } as User);
          } catch (error) {
            console.error("Error parsing stored user:", error);
          }
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      
      // Sincronizar con localStorage
      if (typeof window !== 'undefined') {
        if (firebaseUser) {
          localStorage.setItem('user', JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          }));
        } else {
          localStorage.removeItem('user');
        }
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading, auth };
}

export { useAuth };
