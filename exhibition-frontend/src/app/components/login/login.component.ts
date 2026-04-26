import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { RegisterAttendeeComponent } from '../register-attendee/register-attendee.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ChangePasswordComponent, ChangePasswordData } from '../change-password/change-password.component';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    MatSnackBarModule,
    MatSelectModule,
    TranslatePipe
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginData = { email: '', password: '' };
  hidePassword = true;
  isSubmitting = false;
  currentLanguage = 'en';
  languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Check for deactivation message in query params
    const message = this.route.snapshot.queryParams['message'];
    if (message) {
      this.snackBar.open(message, 'Close', { 
        duration: 8000,
        panelClass: ['error-snackbar']
      });
      // Clear the message from URL
      this.router.navigate(['/login'], { replaceUrl: true });
    }
    
    // Initialize language
    this.translationService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
    this.currentLanguage = this.translationService.getCurrentLanguage();
  }

  onLanguageChange(language: any): void {
    if (typeof language === 'string') {
      this.currentLanguage = language;
      this.translationService.setLanguage(language);
    }
  }

  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    console.log('Form submitted', this.loginData);
    
    if (!this.loginData.email || !this.loginData.password) {
      this.snackBar.open('Please fill in all fields', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    console.log('Calling authService.login...');
    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        // Check if user has a temporary password (from forgot password flow)
        if (this.isTemporaryPassword(this.loginData.password) || this.isTemporaryPasswordFromResponse(response.user)) {
          this.showChangePasswordDialog(response.user);
        } else {
          // Normal login flow
          if (response.user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else if (response.user.role === 'exhibitor') {
            this.router.navigate(['/exhibitor']);
          } else if (response.user.role === 'attendee') {
            this.router.navigate(['/attendee']);
          } else {
            this.snackBar.open(this.translationService.translate('login.loginSuccess'), 'Close', { duration: 3000 });
            this.router.navigate(['/']);
          }
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Login error:', error);
        this.snackBar.open(this.translationService.translate('login.loginFailed'), 'Close', { duration: 3000 });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  goToAttendeeRegistration(): void {
    const dialogRef = this.dialog.open(RegisterAttendeeComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Registration successful! You can now login.', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  goToExhibitorRegistration(): void {
    this.snackBar.open('Exhibitor registration is managed by administrators. Please contact admin for account creation.', 'Close', {
      duration: 6000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }

  openForgotPasswordDialog(): void {
    const dialogRef = this.dialog.open(ForgotPasswordComponent, {
      width: '450px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Password reset instructions sent to your email!', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  private isTemporaryPassword(password: string): boolean {
    // Check if password matches the pattern of temporary passwords (8 characters, alphanumeric)
    // This is a simple heuristic - in production, you might want to store a flag in the database
    return password.length === 8 && /^[a-zA-Z0-9]+$/.test(password);
  }

  private isTemporaryPasswordFromResponse(user: any): boolean {
    // Check if the user object indicates they have a temporary password
    // This is based on the password_changed field (false means temporary password)
    return user && user.passwordChanged === false;
  }

  private showChangePasswordDialog(user: any): void {
    const changePasswordData: ChangePasswordData = {
      userType: user.role,
      userId: user.id,
      userEmail: user.email,
      userName: user.name || user.companyName || 'User'
    };

    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '500px',
      disableClose: true,
      data: changePasswordData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Password changed successfully, proceed with normal login flow
        this.snackBar.open('Password changed successfully! Logging you in...', 'Close', { 
          duration: 3000 
        });
        
        // Navigate based on user role
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (user.role === 'exhibitor') {
          this.router.navigate(['/exhibitor']);
        } else if (user.role === 'attendee') {
          this.router.navigate(['/attendee']);
        } else {
          this.router.navigate(['/']);
        }
      } else {
        // User cancelled or failed to change password, stay on login page
        this.snackBar.open('Please change your password to continue.', 'Close', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onBackdropClick(event: MouseEvent): void {
    // If click is on the backdrop (login-container or login-background), navigate back to landing
    const target = event.target as HTMLElement;
    if (target.classList.contains('login-container') || 
        target.classList.contains('login-background') ||
        target.classList.contains('animated-bg') ||
        target.classList.contains('floating-shapes') ||
        target.classList.contains('shape')) {
      this.router.navigate(['/']);
    }
  }
} 