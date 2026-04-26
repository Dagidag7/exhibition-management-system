import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkAuth(route);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkAuth(childRoute);
  }

  private checkAuth(route: ActivatedRouteSnapshot): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: route.url.join('/') } });
      return of(false);
    }

    // Check user status from backend to ensure it's current
    return this.authService.checkUserStatusFromBackend().pipe(
      map(isActive => {
        if (!isActive) {
          // User is deactivated, logout and redirect with message
          this.authService.logout();
          this.router.navigate(['/login'], { 
            queryParams: { 
              message: 'Your account has been deactivated. Please contact an administrator.' 
            } 
          });
          return false;
        }

        const requiredRole = route.data['role'];
        if (requiredRole && !this.authService.hasRole(requiredRole)) {
          // Redirect based on user's actual role
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            if (currentUser.role === 'admin') {
              this.router.navigate(['/admin']);
            } else if (currentUser.role === 'exhibitor') {
              this.router.navigate(['/exhibitor']);
            } else {
              // For attendees, redirect to landing page
              this.router.navigate(['/']);
            }
          } else {
            this.router.navigate(['/']);
          }
          return false;
        }

        return true;
      }),
      catchError(() => {
        // If there's an error checking status, assume user is not active for security
        this.authService.logout();
        this.router.navigate(['/login'], { 
          queryParams: { 
            message: 'Unable to verify account status. Please log in again.' 
          } 
        });
        return of(false);
      })
    );
  }
} 