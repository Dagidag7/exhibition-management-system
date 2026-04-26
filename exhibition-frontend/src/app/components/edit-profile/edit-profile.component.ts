import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidationService } from '../../services/validation.service';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    ImageUploadComponent,
    TranslatePipe
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent {
  Form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private validationService: ValidationService,
    private snackBar: MatSnackBar
  ) {
    this.Form = this.fb.group({
      companyName: [data.exhibitor.companyName, [Validators.required, Validators.maxLength(100)]],
      contactPerson: [data.exhibitor.contactPerson, [Validators.required, Validators.maxLength(100)]],
      email: [data.exhibitor.email, [Validators.required, Validators.email, Validators.maxLength(100)]],
      logoUrl: [this.data.exhibitor.logoUrl, [Validators.maxLength(500)]]
    });
  }

  save() {
    if (this.validateForm()) {
      const formData = this.Form.getRawValue();
      const updatedData = {
        exhibitorId: this.data.exhibitor.exhibitorId,
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        logoUrl: formData.logoUrl,
        boothNumber: this.data.exhibitor.boothNumber,
        productIds: this.data.exhibitor.productIds,
        floorNumber: this.data.exhibitor.floorNumber,
        status: this.data.exhibitor.status
      };
      this.dialogRef.close(updatedData);
    }
  }

  validateForm(): boolean {
    const formValue = this.Form.value;

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
    this.Form.patchValue({ logoUrl: url });
  }

  close() {
    this.dialogRef.close();
  }
}
