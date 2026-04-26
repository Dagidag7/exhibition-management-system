import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';
import { FloorService } from '../../services/floor.service';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-add-exhibitor',
  templateUrl: './add-exhibitor.component.html',
  styleUrls: ['./add-exhibitor.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    ImageUploadComponent,
    TranslatePipe
  ]
})
export class AddExhibitorComponent {
  exhibitor: any = {};

  constructor(
    private dialogRef: MatDialogRef<AddExhibitorComponent>,
    private validationService: ValidationService,
    private floorService: FloorService,
    private snackBar: MatSnackBar
  ) {}

  onSubmit() {
    this.validateForm().then(isValid => {
      if (isValid) {
        this.dialogRef.close(this.exhibitor);
        // Success message will be handled by the parent component (AdminComponent)
      }
    });
  }

  async validateForm(): Promise<boolean> {
    // Validate company name
    const companyNameValidation = this.validationService.validateCompanyName(this.exhibitor.companyName);
    if (!companyNameValidation.isValid) {
      this.snackBar.open(companyNameValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate contact person name
    const contactPersonValidation = this.validationService.validateName(this.exhibitor.contactPerson);
    if (!contactPersonValidation.isValid) {
      this.snackBar.open('Contact Person: ' + contactPersonValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate email
    const emailValidation = this.validationService.validateEmail(this.exhibitor.email);
    if (!emailValidation.isValid) {
      this.snackBar.open(emailValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate booth number (basic validation)
    if (!this.exhibitor.boothNumber || this.exhibitor.boothNumber.trim() === '') {
      this.snackBar.open('Booth number is required', 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate floor number (basic validation)
    if (!this.exhibitor.floorNumber || this.exhibitor.floorNumber.trim() === '') {
      this.snackBar.open('Floor number is required', 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate floor capacity
    try {
      const floorValidation = await this.floorService.validateFloorCapacity(parseInt(this.exhibitor.floorNumber)).toPromise();
      if (floorValidation && !floorValidation.isValid) {
        this.snackBar.open(floorValidation.message, 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        return false;
      }
    } catch (error) {
      this.snackBar.open('Error validating floor capacity. Please try again.', 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate logo URL if provided
    if (this.exhibitor.logoUrl && this.exhibitor.logoUrl.trim() !== '') {
      const urlValidation = this.validationService.validateUrl(this.exhibitor.logoUrl);
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
    this.exhibitor.logoUrl = url;
  }

  onCancel() {
    this.dialogRef.close();
  }
}