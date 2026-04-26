import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExhibitorService, Exhibitor } from '../../services/exhibitor.service';
import { ValidationService } from '../../services/validation.service';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-edit-exhibitor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    ImageUploadComponent,
    TranslatePipe
  ],
  templateUrl: './edit-exhibitor.component.html',
  styleUrls: ['./edit-exhibitor.component.css']
})
export class EditExhibitorComponent implements OnInit {
  exhibitorForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private exhibitorService: ExhibitorService,
    private dialogRef: MatDialogRef<EditExhibitorComponent>,
    private validationService: ValidationService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { exhibitor: Exhibitor }
  ) {
    this.exhibitorForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.maxLength(100)]],
      contactPerson: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      boothNumber: ['', [Validators.required]],
      productIds: [''],
      logoUrl: [''],
      floorNumber: [''],
      status: ['active', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.data?.exhibitor) {
      this.exhibitorForm.patchValue({
        companyName: this.data.exhibitor.companyName,
        contactPerson: this.data.exhibitor.contactPerson,
        email: this.data.exhibitor.email,
        boothNumber: this.data.exhibitor.boothNumber,
        productIds: this.data.exhibitor.productIds || '',
        logoUrl: this.data.exhibitor.logoUrl || '',
        floorNumber: this.data.exhibitor.floorNumber || '',
        status: this.data.exhibitor.status || 'active'
      });
    }
  }

  onSubmit(): void {
    if (this.validateForm()) {
      this.loading = true;
      const formData = this.exhibitorForm.value;
      
      const updateData: Exhibitor = {
        exhibitorId: this.data.exhibitor.exhibitorId,
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        boothNumber: formData.boothNumber,
        logoUrl: formData.logoUrl,
        floorNumber: formData.floorNumber,
        status: formData.status,
        passwordChanged: this.data.exhibitor.passwordChanged 
      };
      
      console.log('Sending update data:', updateData);
      
      this.exhibitorService.updateExhibitor(this.data.exhibitor.exhibitorId, updateData).subscribe({
        next: (response) => {
          this.snackBar.open('Exhibitor updated successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error updating exhibitor:', error);
          const errorMessage = error.error?.error || error.error?.message || error.message || 'Unknown error occurred';
          this.snackBar.open('Error updating exhibitor: ' + errorMessage, 'Close', { 
            duration: 8000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
    }
  }

  validateForm(): boolean {
    const formValue = this.exhibitorForm.value;

    // Validate company name
    const companyNameValidation = this.validationService.validateCompanyName(formValue.companyName);
    if (!companyNameValidation.isValid) {
      this.snackBar.open(companyNameValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate contact person name
    const contactPersonValidation = this.validationService.validateName(formValue.contactPerson);
    if (!contactPersonValidation.isValid) {
      this.snackBar.open('Contact Person: ' + contactPersonValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate email
    const emailValidation = this.validationService.validateEmail(formValue.email);
    if (!emailValidation.isValid) {
      this.snackBar.open(emailValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate booth number
    if (!formValue.boothNumber || formValue.boothNumber.trim() === '') {
      this.snackBar.open('Booth number is required', 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate logo URL if provided
    if (formValue.logoUrl && formValue.logoUrl.trim() !== '') {
      const urlValidation = this.validationService.validateUrl(formValue.logoUrl);
      if (!urlValidation.isValid) {
        this.snackBar.open(urlValidation.message, 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        return false;
      }
    }

    return true;
  }


  onLogoUploaded(url: string) {
    this.exhibitorForm.patchValue({ logoUrl: url });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 