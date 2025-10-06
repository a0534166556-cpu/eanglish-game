'use client';

import { useState, useEffect } from 'react';

export default function useAuthUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (newUser: any) => {
    setUser(newUser);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  useEffect(() => {
    const checkUser = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const userStr = localStorage.getItem('user');
          console.log('useAuthUser - localStorage user:', userStr);
          if (userStr) {
            const parsedUser = JSON.parse(userStr);
            console.log('useAuthUser - parsed user:', parsedUser);
            setUser(parsedUser);
          } else {
            console.log('useAuthUser - no user in localStorage');
          }
        } else {
          console.log('useAuthUser - window or localStorage not available');
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        // Optional: clear corrupted item
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('user');
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure window is available
    const timer = setTimeout(checkUser, 100);
    return () => clearTimeout(timer);
  }, []);

  return { user, loading, updateUser };
} 