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
import { MatIconModule } from '@angular/material/icon';
import { ValidationService } from '../../services/validation.service';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-edit-attendee-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    ImageUploadComponent,
    TranslatePipe
  ],
  templateUrl: './edit-attendee-profile.component.html',
  styleUrl: './edit-attendee-profile.component.css'
})
export class EditAttendeeProfileComponent {
  Form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditAttendeeProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private validationService: ValidationService,
    private snackBar: MatSnackBar
  ) {
    this.Form = this.fb.group({
      name: [data.attendee.name, [Validators.required, Validators.maxLength(100)]],
      email: [data.attendee.email, [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: [data.attendee.phone, [Validators.required, Validators.maxLength(20)]],
      profilePhoto: [data.attendee.profilePhoto || null, [Validators.maxLength(500)]]
    });
  }

  save() {
    if (this.validateForm()) {
      const formData = this.Form.getRawValue();
      const updatedData = {
        attendeeId: this.data.attendee.attendeeId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        profilePhoto: formData.profilePhoto,
        password: this.data.attendee.password,
        status: this.data.attendee.status || 'active'
      };
      this.dialogRef.close(updatedData);
    }
  }

  onProfilePhotoUploaded(url: string | null) {
    this.Form.patchValue({ profilePhoto: url });
  }

  validateForm(): boolean {
    const formValue = this.Form.value;

    // Validate name
    const nameValidation = this.validationService.validateName(formValue.name);
    if (!nameValidation.isValid) {
      this.snackBar.open('Name: ' + nameValidation.message, 'Close', {
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

    // Validate phone
    if (!formValue.phone || formValue.phone.trim() === '') {
      this.snackBar.open('Phone number is required', 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    return true;
  }

  close() {
    this.dialogRef.close();
  }
}

