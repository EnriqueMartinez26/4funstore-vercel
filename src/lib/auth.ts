"use client";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  nombre?: string;
}

export class AuthService {
  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Error parsing user:", error);
      return null;
    }
  }

  static setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  }

  static clearUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  static isAuthenticated(): boolean {
    return this.getUser() !== null;
  }
}
