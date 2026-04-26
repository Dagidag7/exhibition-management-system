import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Partner, PartnerService } from '../../services/partner.service';
import { ValidationService } from '../../services/validation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-add-partner',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    TranslatePipe
  ],
  templateUrl: './add-partner.component.html',
  styleUrls: ['./add-partner.component.css']
})
export class AddPartnerComponent implements OnInit {
  partnerForm: FormGroup;
  isEditMode = false;
  partnerId?: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPartnerComponent>,
    private partnerService: PartnerService,
    private validationService: ValidationService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { partner?: Partner }
  ) {
    this.partnerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      contactPerson: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      partnershipType: ['', [Validators.required, Validators.maxLength(100)]],
      benefits: ['']
    });
  }

  ngOnInit(): void {
    if (this.data?.partner) {
      this.isEditMode = true;
      this.partnerId = this.data.partner.partnerId;
      this.partnerForm.patchValue({
        name: this.data.partner.name,
        contactPerson: this.data.partner.contactPerson,
        partnershipType: this.data.partner.partnershipType,
        benefits: this.data.partner.benefits || ''
      });
    }
  }

  onSubmit() {
    if (this.validateForm()) {
      const formValue = this.partnerForm.value;
      
      if (this.isEditMode && this.partnerId) {
        // Update existing partner
        const updateData: Partner = {
          partnerId: this.partnerId,
          name: formValue.name,
          contactPerson: formValue.contactPerson,
          email: formValue.email,
          partnershipType: formValue.partnershipType,
          benefits: formValue.benefits
        };
        
        this.partnerService.updatePartner(this.partnerId, updateData).subscribe({
          next: (response) => {
            this.snackBar.open('Partner updated successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.dialogRef.close(response);
          },
          error: (error) => {
            this.snackBar.open('Failed to update partner: ' + (error.error?.message || error.message), 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      } else {
        // Create new partner
        const partner: Omit<Partner, 'partnerId'> = {
          name: formValue.name,
          contactPerson: formValue.contactPerson,
          email: formValue.email,
          partnershipType: formValue.partnershipType,
          benefits: formValue.benefits
        };
        
        this.partnerService.createPartner(partner).subscribe({
          next: (response) => {
            this.snackBar.open('Partner added successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.dialogRef.close(response);
          },
          error: (error) => {
            this.snackBar.open('Failed to add partner: ' + (error.error?.message || error.message), 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      }
    }
  }

  validateForm(): boolean {
    const formValue = this.partnerForm.value;

    // Validate partner name
    const nameValidation = this.validationService.validateCompanyName(formValue.name);
    if (!nameValidation.isValid) {
      this.snackBar.open('Partner Name: ' + nameValidation.message, 'Close', {
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

    // Validate partnership type
    const partnershipTypeValidation = this.validationService.validateCompanyName(formValue.partnershipType);
    if (!partnershipTypeValidation.isValid) {
      this.snackBar.open('Partnership Type: ' + partnershipTypeValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    return true;
  }

  onCancel() {
    this.dialogRef.close();
  }
} 