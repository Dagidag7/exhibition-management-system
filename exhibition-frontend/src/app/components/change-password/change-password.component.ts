import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ExhibitorService } from '../../services/exhibitor.service';
import { AttendeeService } from '../../services/attendee.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface ChangePasswordData {
  userType: 'exhibitor' | 'attendee';
  userId: number;
  userEmail: string;
  userName: string;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslatePipe
  ],
  template: `
    <div class="change-password-container">
      <h2 mat-dialog-title>{{ 'profile.changePasswordTitle' | translate }}</h2>
      <p class="description">{{ 'profile.changePasswordDescription' | translate }}</p>
      
      <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>{{ 'profile.newPassword' | translate }}</mat-label>
          <input 
            matInput 
            [type]="hideNewPassword ? 'password' : 'text'" 
            formControlName="newPassword" 
            [placeholder]="'profile.enterNewPassword' | translate">
          <button 
            mat-icon-button 
            matSuffix 
            type="button"
            (click)="hideNewPassword = !hideNewPassword"
            [attr.aria-label]="'profile.newPassword' | translate"
            [attr.aria-pressed]="hideNewPassword">
            <mat-icon>{{hideNewPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
          </button>
          <mat-error *ngIf="changePasswordForm.get('newPassword')?.hasError('required')">{{ 'profile.passwordRequired' | translate }}</mat-error>
          <mat-error *ngIf="changePasswordForm.get('newPassword')?.hasError('minlength')">{{ 'profile.passwordMinLength' | translate }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>{{ 'profile.confirmNewPassword' | translate }}</mat-label>
          <input 
            matInput 
            [type]="hideConfirmPassword ? 'password' : 'text'" 
            formControlName="confirmPassword" 
            [placeholder]="'profile.confirmNewPasswordPlaceholder' | translate">
          <button 
            mat-icon-button 
            matSuffix 
            type="button"
            (click)="hideConfirmPassword = !hideConfirmPassword"
            [attr.aria-label]="'profile.confirmPassword' | translate"
            [attr.aria-pressed]="hideConfirmPassword">
            <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
          </button>
          <mat-error *ngIf="changePasswordForm.get('confirmPassword')?.hasError('required')">{{ 'profile.confirmRequired' | translate }}</mat-error>
          <mat-error *ngIf="changePasswordForm.get('confirmPassword')?.hasError('passwordMismatch')">{{ 'profile.passwordsDoNotMatch' | translate }}</mat-error>
        </mat-form-field>

        <div class="password-requirements">
          <h4>{{ 'profile.passwordRequirements' | translate }}</h4>
          <ul>
            <li>{{ 'profile.reqMinLength' | translate }}</li>
            <li>{{ 'profile.reqLetter' | translate }}</li>
            <li>{{ 'profile.reqNumber' | translate }}</li>
          </ul>
        </div>

        <div class="form-actions">
          <button 
            mat-raised-button 
            color="primary" 
            type="submit"
            [disabled]="changePasswordForm.invalid || isSubmitting">
            <mat-icon *ngIf="isSubmitting" class="spinning">hourglass_empty</mat-icon>
            {{ isSubmitting ? ('profile.changing' | translate) : ('profile.changePassword' | translate) }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .change-password-container {
      padding: 20px;
      max-width: 450px;
    }

    .description {
      color: #666;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .password-requirements {
      margin: 20px 0;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .password-requirements h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #333;
    }

    .password-requirements ul {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: #555;
    }

    .password-requirements li {
      margin: 4px 0;
    }

    .form-actions {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  isSubmitting = false;
  hideNewPassword = true;
  hideConfirmPassword = true;

constructor(
  private fb: FormBuilder,
  private dialogRef: MatDialogRef<ChangePasswordComponent>,
  @Inject(MAT_DIALOG_DATA) public data: ChangePasswordData,
  private exhibitorService: ExhibitorService,
  private attendeeService: AttendeeService,
  private snackBar: MatSnackBar,
  private translationService: TranslationService
) {
    this.changePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  
  passwordValidator(control: any) {
    const value = control.value;
    if (!value) return null;
    
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    
    if (!hasLetter || !hasNumber) {
      return { passwordRequirements: true };
      }
    return null;
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (!newPassword || !confirmPassword) return null;
    
    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.changePasswordForm.valid) {
      this.isSubmitting = true;
      const newPassword = this.changePasswordForm.get('newPassword')?.value;

      if (this.data.userType === 'exhibitor') {
        this.exhibitorService.changePassword(this.data.userId, newPassword).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.snackBar.open(
              this.translationService.translate('profile.changePasswordSuccess'),
              this.translationService.translate('form.close'),
              { duration: 5000 }
            );
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Password change failed:', error);
            this.snackBar.open(
              this.translationService.translate('profile.changePasswordFailed'),
              this.translationService.translate('form.close'),
              { duration: 5000, panelClass: ['error-snackbar'] }
            );
          }
        });
      } else if (this.data.userType === 'attendee') {
        this.attendeeService.changePassword(this.data.userId, newPassword).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.snackBar.open(
              this.translationService.translate('profile.changePasswordSuccess'),
              this.translationService.translate('form.close'),
              { duration: 5000 }
            );
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Password change failed:', error);
            this.snackBar.open(
              this.translationService.translate('profile.changePasswordFailed'),
              this.translationService.translate('form.close'),
              { duration: 5000, panelClass: ['error-snackbar'] }
            );
          }
        });
      }
    }
  }
}