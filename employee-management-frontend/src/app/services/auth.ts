import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export function authGuard(): boolean {
  const token = localStorage.getItem('authToken');
  if (token) {
    return true;
  }
  return false;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private router: Router) {
    const token = localStorage.getItem('authToken');
    this.isLoggedInSubject.next(!!token);
  }

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('authToken', 'fake-jwt-token');
      localStorage.setItem('username', username);
      this.isLoggedInSubject.next(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    this.isLoggedInSubject.next(false);
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}
