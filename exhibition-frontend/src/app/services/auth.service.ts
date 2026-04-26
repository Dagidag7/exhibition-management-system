import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name?: string;
  companyName?: string;
  email: string;
  role: 'admin' | 'exhibitor' | 'attendee';
  phone?: string;
  boothNumber?: string;
  floorNumber?: string;
  logoUrl?: string;
  status?: string;
  [key: string]: any;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
    
    this.setupPeriodicStatusCheck();
  }


   getDisplayName(user: User | null): string {
    if (!user) return '';
    if (user.role === 'exhibitor') {
      return user.companyName || 'Exhibitor';
    } else {
      return user.name || 'User';
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
        
        this.refreshUserDataFromBackend(response.user.id).subscribe(
          freshUser => {
            if (freshUser) {
              localStorage.setItem('currentUser', JSON.stringify(freshUser));
              this.currentUserSubject.next(freshUser);
              
              if (freshUser.role !== 'admin') {
                this.performImmediateStatusCheck().subscribe();
              }
            }
          },
          error => {
            console.error('Failed to refresh user data:', error);
          }
        );
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isExhibitor(): boolean {
    return this.hasRole('exhibitor');
  }

  isUserActive(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (user.role === 'admin') return true;
    
    if (user.role === 'exhibitor' || user.role === 'attendee') {
      return user.status === 'active';
    }
    
    return false;
  }

  checkUserStatusFromBackend(): Observable<boolean> {
    const user = this.getCurrentUser();
    if (!user) return of(false);
    
    if (user.role === 'admin') return of(true);
    
    if (user.role === 'exhibitor') {
      return this.http.get<{ status: string }>(`${this.API_URL}/auth/users/${user.id}/status`).pipe(
        map((response: { status: string }) => {
          const status = response.status;
          // If status is null, undefined, or empty, default to 'active' (trust user's current session)
          return status === 'active' || !status || status.trim() === '';
        }),
        catchError((error) => {
          console.error('Backend status check failed:', error);
          // If backend check fails, trust the user's current status in localStorage
          // Only log out if explicitly marked as inactive
          const currentStatus = user.status;
          if (currentStatus === 'inactive' || currentStatus === 'suspended') {
            return of(false);
          }
          // For network errors or if status is null/undefined/active, allow access
          return of(true);
        })
      );
    }
    
    if (user.role === 'attendee') {
      return this.http.get<{ status: string }>(`${this.API_URL}/auth/users/${user.id}/status`).pipe(
        map((response: { status: string }) => {
          const status = response.status;
          return status === 'active' || !status || status.trim() === '';
        }),
        catchError((error) => {
          console.error('Backend status check failed:', error);
          const currentStatus = user.status;
          if (currentStatus === 'inactive' || currentStatus === 'suspended') {
            return of(false);
          }
          return of(true);
        })
      );
    }
    
    return of(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  refreshUserData(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/auth/me`);
  }

  refreshUserDataFromBackend(userId: number): Observable<User | null> {
    // Skip refresh for admin user (ID 0) as it's not stored in backend
    if (userId === 0) {
      return of(null);
    }
    
    return this.http.get<User>(`${this.API_URL}/auth/users/${userId}`).pipe(
      map((user: User) => user),
      catchError((error: any) => {
        console.error('Failed to refresh user data:', error);
        return of(null);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  }

  private setupPeriodicStatusCheck(): void {
    setInterval(() => {
      const user = this.getCurrentUser();
      if (user && user.role !== 'admin') {
        this.checkUserStatusFromBackend().subscribe(
          isActive => {
            if (!isActive) {
              console.log('User status check failed - logging out deactivated user');
              this.forceLogoutForDeactivatedUser();
            }
          },
          error => {
            console.error('Periodic status check failed:', error);
            // Only log out if explicitly marked as inactive or suspended
            // Network errors should not log out active users
            if (user.status === 'inactive' || user.status === 'suspended') {
              console.log('User status is inactive/suspended, forcing logout');
              this.forceLogoutForDeactivatedUser();
            }
            // Otherwise, trust the current session and continue
          }
        );
      }
    }, 30000); 
  }

  canAccessRoute(route: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (user.role === 'admin') return true;
    
    if (!this.isUserActive()) return false;
    
    if (route.startsWith('/exhibitor') && user.role !== 'exhibitor') return false;
    if (route.startsWith('/attendee') && user.role !== 'attendee') return false;
    
    return true;
  }

  forceLogoutForDeactivatedUser(): void {
    this.logout();
    window.location.href = '/login?message=Your account has been deactivated. Please contact an administrator.';
  }

  performImmediateStatusCheck(): Observable<boolean> {
    const user = this.getCurrentUser();
    if (!user || user.role === 'admin') {
      return of(true);
    }
    
    return this.checkUserStatusFromBackend().pipe(
      tap(isActive => {
        if (!isActive) {
          console.log('Immediate status check failed - user is deactivated');
          this.forceLogoutForDeactivatedUser();
        }
      }),
      catchError(error => {
        console.error('Immediate status check failed:', error);
        // Only log out if explicitly marked as inactive or suspended
        if (user.status === 'inactive' || user.status === 'suspended') {
          console.log('User status is inactive/suspended, forcing logout');
          this.forceLogoutForDeactivatedUser();
          return of(false);
        }
        // For network errors, allow access (trust current session)
        return of(true);
      })
    );
  }
} 