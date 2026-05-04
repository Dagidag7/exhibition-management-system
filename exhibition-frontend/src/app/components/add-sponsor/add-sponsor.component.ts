import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SponsorService, Sponsor } from '../../services/sponsor.service';
import { ValidationService } from '../../services/validation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ImageUploadComponent } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-add-sponsor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    ImageUploadComponent
  ],
  templateUrl: './add-sponsor.component.html',
  styleUrls: ['./add-sponsor.component.css']
})
export class AddSponsorComponent implements OnInit {
  sponsorForm: FormGroup;
  isEditMode = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private sponsorService: SponsorService,
    private dialogRef: MatDialogRef<AddSponsorComponent>,
    private validationService: ValidationService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { sponsor?: Sponsor }
  ) {
    this.sponsorForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      contactPerson: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.maxLength(255)]],
      contributionAmount: ['', [Validators.required, Validators.min(0), this.contributionAmountValidator.bind(this)]],
      benefits: [''],
      logoUrl: [''],
      floorNumber: ['', [Validators.maxLength(10)]]
    });
  }

  ngOnInit(): void {
    if (this.data?.sponsor) {
      this.isEditMode = true;
      
      // Check if contribution amount is valid, if not, reset to nearest valid amount
      const allowedAmounts = [5000, 10000, 50000, 100000];
      let contributionAmount = this.data.sponsor.contributionAmount;
      
      if (!allowedAmounts.includes(contributionAmount)) {
        // Find nearest valid amount
        if (contributionAmount < 7500) {
          contributionAmount = 5000;
        } else if (contributionAmount < 30000) {
          contributionAmount = 10000;
        } else if (contributionAmount < 75000) {
          contributionAmount = 50000;
        } else {
          contributionAmount = 100000;
        }
      }
      
      this.sponsorForm.patchValue({
        name: this.data.sponsor.name,
        contactPerson: this.data.sponsor.contactPerson,
        email: this.data.sponsor.email || '',
        contributionAmount: contributionAmount,
        benefits: this.data.sponsor.benefits || '',
        logoUrl: this.data.sponsor.logoUrl || '',
        floorNumber: this.data.sponsor.floorNumber || ''
      });
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) return;

    if (this.isEditMode) {
      this.loading = true;
      const formValue = this.sponsorForm.value;
      const id = this.data.sponsor!.sponsorId;
      if (id == null) return;
      const payload: Sponsor = {
        sponsorId: id,
        name: formValue.name?.trim() ?? '',
        contactPerson: formValue.contactPerson?.trim() ?? '',
        email: formValue.email?.trim() ?? undefined,
        contributionAmount: Number(formValue.contributionAmount) || 0,
        benefits: formValue.benefits?.trim() ?? '',
        logoUrl: formValue.logoUrl?.trim() ?? '',
        floorNumber: formValue.floorNumber?.trim() ?? undefined
      };
      this.sponsorService.updateSponsor(id, payload).subscribe({
        next: (response) => {
          this.snackBar.open('Sponsor updated successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(response);
        },
        error: (error) => {
          this.snackBar.open('Error updating sponsor: ' + (error.error?.error || error.message), 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
    } else {
      // New sponsor: close with form value; admin will call createSponsor (like exhibitor)
      this.dialogRef.close(this.sponsorForm.value);
    }
  }

  onLogoUploaded(url: string): void {
    this.sponsorForm.patchValue({ logoUrl: url });
  }

  contributionAmountValidator(control: any): { [key: string]: any } | null {
    const allowedAmounts = [5000, 10000, 50000, 100000];
    const value = Number(control.value);
    
    if (control.value && !allowedAmounts.includes(value)) {
      return { 'invalidAmount': true };
    }
    
    return null;
  }

  validateForm(): boolean {
    const formValue = this.sponsorForm.value;

    const nameValidation = this.validationService.validateCompanyName(formValue.name);
    if (!nameValidation.isValid) {
      this.snackBar.open('Sponsor Name: ' + nameValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    const contactPersonValidation = this.validationService.validateName(formValue.contactPerson);
    if (!contactPersonValidation.isValid) {
      this.snackBar.open('Contact Person: ' + contactPersonValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    if (!formValue.contributionAmount || formValue.contributionAmount <= 0) {
      this.snackBar.open('Contribution amount must be greater than 0', 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate contribution amount - only allow specific values
    const allowedAmounts = [5000, 10000, 50000, 100000];
    const contributionAmount = Number(formValue.contributionAmount);
    if (!allowedAmounts.includes(contributionAmount)) {
      this.snackBar.open('Contribution amount must be one of: $5,000, $10,000, $50,000, or $100,000', 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    if (formValue.email && formValue.email.trim() !== '') {
      const emailValidation = this.validationService.validateEmail(formValue.email);
      if (!emailValidation.isValid) {
        this.snackBar.open(emailValidation.message, 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        return false;
      }
    }

    return true;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
