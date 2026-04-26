import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ExhibitorService } from '../../services/exhibitor.service';
import { AttendeeService } from '../../services/attendee.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-forgot-password',
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
    <div class="forgot-password-container">
      <h2 mat-dialog-title>{{ 'forgotPassword.title' | translate }}</h2>
      <p class="description">{{ 'forgotPassword.description' | translate }}</p>
      
      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>{{ 'forgotPassword.email' | translate }}</mat-label>
          <input matInput type="email" formControlName="email" [placeholder]="'forgotPassword.emailPlaceholder' | translate">
          <mat-icon matSuffix>email</mat-icon>
          <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('required')">{{ 'forgotPassword.emailRequired' | translate }}</mat-error>
          <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('email')">{{ 'forgotPassword.emailInvalid' | translate }}</mat-error>
        </mat-form-field>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">{{ 'forgotPassword.cancel' | translate }}</button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="forgotPasswordForm.invalid || isSubmitting">
            <mat-icon *ngIf="isSubmitting" class="spinning">hourglass_empty</mat-icon>
            {{ isSubmitting ? ('forgotPassword.sending' | translate) : ('forgotPassword.sendReset' | translate) }}
          </button>
        </div>
      </form>

      <div class="help-section">
        <mat-icon>info</mat-icon>
        <div class="help-text">
          <p><strong>{{ 'forgotPassword.helpTitle' | translate }}</strong> {{ 'forgotPassword.helpText' | translate }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      padding: 20px;
      max-width: 400px;
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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }

    .help-section {
      margin-top: 30px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .help-section mat-icon {
      color: #2196f3;
      margin-top: 2px;
    }

    .help-text p {
      margin: 4px 0;
      font-size: 13px;
      color: #555;
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
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ForgotPasswordComponent>,
    private exhibitorService: ExhibitorService,
    private attendeeService: AttendeeService,
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isSubmitting = true;
      const email = this.forgotPasswordForm.get('email')?.value;

      // Check if email exists in exhibitors first
      this.exhibitorService.getExhibitors().subscribe({
        next: (exhibitors) => {
          const exhibitor = exhibitors.find(e => e.email === email);
          if (exhibitor) {
            this.handleExhibitorPasswordReset(exhibitor);
          } else {
            // Check attendees
            this.attendeeService.getAttendees().subscribe({
              next: (attendees) => {
                const attendee = attendees.find(a => a.email === email);
                if (attendee) {
                  this.handleAttendeePasswordReset(attendee);
                } else {
                  this.handleEmailNotFound();
                }
              },
              error: () => this.handleError()
            });
          }
        },
        error: () => this.handleError()
      });
    }
  }

  private handleExhibitorPasswordReset(exhibitor: any): void {
    // Call the backend API to actually reset the password
    this.exhibitorService.resetPassword(exhibitor.email).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.snackBar.open(
          this.translationService.translate('forgotPassword.success', { email: exhibitor.email }),
          this.translationService.translate('form.close'),
          { duration: 6000 }
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Password reset failed:', error);
        this.snackBar.open(
          this.translationService.translate('forgotPassword.failed'),
          this.translationService.translate('form.close'),
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  private handleAttendeePasswordReset(attendee: any): void {
    // Call the backend API to actually reset the password
    this.attendeeService.resetPassword(attendee.email).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.snackBar.open(
          this.translationService.translate('forgotPassword.success', { email: attendee.email }),
          this.translationService.translate('form.close'),
          { duration: 6000 }
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Password reset failed:', error);
        this.snackBar.open(
          this.translationService.translate('forgotPassword.failed'),
          this.translationService.translate('form.close'),
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  private handleEmailNotFound(): void {
    this.isSubmitting = false;
    this.snackBar.open(
      this.translationService.translate('forgotPassword.emailNotFound'),
      this.translationService.translate('form.close'),
      { duration: 5000, panelClass: ['error-snackbar'] }
    );
  }

  private handleError(): void {
    this.isSubmitting = false;
    this.snackBar.open(
      this.translationService.translate('forgotPassword.error'),
      this.translationService.translate('form.close'),
      { duration: 4000, panelClass: ['error-snackbar'] }
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

