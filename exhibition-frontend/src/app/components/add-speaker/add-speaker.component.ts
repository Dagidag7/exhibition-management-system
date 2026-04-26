import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Speaker, SpeakerService } from '../../services/speaker.service';
import { ValidationService } from '../../services/validation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-add-speaker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './add-speaker.component.html',
  styleUrls: ['./add-speaker.component.css']
})
export class AddSpeakerComponent implements OnInit {
  speakerForm: FormGroup;
  isEditMode: boolean = false;
  speakerId?: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddSpeakerComponent>,
    private speakerService: SpeakerService,
    private validationService: ValidationService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.speakerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      bio: [''],
      expertise: ['', Validators.maxLength(200)],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      phone: ['', Validators.maxLength(20)],
      organization: ['', Validators.maxLength(100)]
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.speaker) {
      this.isEditMode = true;
      this.speakerId = this.data.speaker.speakerId;
      this.speakerForm.patchValue({
        name: this.data.speaker.name,
        bio: this.data.speaker.bio || '',
        expertise: this.data.speaker.expertise || '',
        email: this.data.speaker.email || '',
        phone: this.data.speaker.phone || '',
        organization: this.data.speaker.organization || ''
      });
    }
  }

  onSubmit() {
    if (this.validateForm()) {
      const formValue = this.speakerForm.value;
      
      if (this.isEditMode && this.speakerId) {
        const speaker: Speaker = {
          speakerId: this.speakerId,
          name: formValue.name,
          bio: formValue.bio,
          expertise: formValue.expertise,
          email: formValue.email,
          phone: formValue.phone,
          organization: formValue.organization
        };
        this.speakerService.updateSpeaker(speaker).subscribe({
          next: () => {
            this.snackBar.open('Speaker updated successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.dialogRef.close(speaker);
          },
          error: (error) => {
            this.snackBar.open('Failed to update speaker: ' + (error.error?.message || error.message), 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      } else {
        const speaker: Speaker = {
          speakerId: 0,
          name: formValue.name,
          bio: formValue.bio,
          expertise: formValue.expertise,
          email: formValue.email,
          phone: formValue.phone,
          organization: formValue.organization
        };
        this.speakerService.addSpeaker(speaker).subscribe({
          next: () => {
            this.snackBar.open('Speaker added successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.dialogRef.close(speaker);
          },
          error: (error) => {
            this.snackBar.open('Failed to add speaker: ' + (error.error?.message || error.message), 'Close', {
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
    const formValue = this.speakerForm.value;

    // Validate name
    const nameValidation = this.validationService.validateName(formValue.name);
    if (!nameValidation.isValid) {
      this.snackBar.open(nameValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate email if provided
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

    // Validate phone if provided
    if (formValue.phone && formValue.phone.trim() !== '') {
      const phoneValidation = this.validationService.validatePhone(formValue.phone);
      if (!phoneValidation.isValid) {
        this.snackBar.open(phoneValidation.message, 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        return false;
      }
    }

    // Validate organization if provided
    if (formValue.organization && formValue.organization.trim() !== '') {
      const organizationValidation = this.validationService.validateCompanyName(formValue.organization);
      if (!organizationValidation.isValid) {
        this.snackBar.open('Organization: ' + organizationValidation.message, 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        return false;
      }
    }

    return true;
  }

  onCancel() {
    this.dialogRef.close();
  }
} 