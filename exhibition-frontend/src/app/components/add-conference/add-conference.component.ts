import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Conference, ConferenceService } from '../../services/conference.service';
import { FloorService } from '../../services/floor.service';
import { ValidationService } from '../../services/validation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-add-conference',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslatePipe
  ],
  templateUrl: './add-conference.component.html',
  styleUrls: ['./add-conference.component.css']
})
export class AddConferenceComponent implements OnInit {
  conferenceForm: FormGroup;
  isEditMode: boolean = false;
  conferenceId?: number;
  minDate: string; // Minimum date (today)

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddConferenceComponent>,
    private conferenceService: ConferenceService,
    private floorService: FloorService,
    private validationService: ValidationService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
            // Set minimum date to today
            const today = new Date();
            this.minDate = today.toISOString().split('T')[0];
            
            this.conferenceForm = this.fb.group({
              title: ['', [Validators.required, Validators.maxLength(200)]],
              description: ['', Validators.required],
              date: ['', Validators.required],
              time: ['', Validators.required],
              floorNumber: ['', Validators.required],
              speaker: ['', Validators.required]
            });
  }

  ngOnInit(): void {
    if (this.data && this.data.conference) {
      this.isEditMode = true;
      this.conferenceId = this.data.conference.conferenceId;
              this.conferenceForm.patchValue({
                title: this.data.conference.title,
                description: this.data.conference.description,
                date: this.data.conference.date,
                time: this.data.conference.time,
                floorNumber: this.data.conference.floorNumber,
                speaker: this.data.conference.speaker
              });
    }
  }

  async onSubmit() {
    console.log('Form submitted');
    console.log('Form valid:', this.conferenceForm.valid);
    console.log('Form value:', this.conferenceForm.value);
    console.log('Form errors:', this.conferenceForm.errors);
    
    const isValid = await this.validateForm();
    if (isValid) {
      console.log('Form validation passed');
      const formValue = this.conferenceForm.value;
      
      if (this.isEditMode && this.conferenceId) {
                const conference: Conference = {
                  conferenceId: this.conferenceId,
                  title: formValue.title,
                  description: formValue.description,
                  date: formValue.date,
                  time: formValue.time,
                  floorNumber: formValue.floorNumber,
                  speaker: formValue.speaker
                };
        this.conferenceService.updateConference(conference).subscribe({
          next: () => {
            this.snackBar.open('Conference updated successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.dialogRef.close(conference);
          },
          error: (error) => {
            this.snackBar.open('Failed to update conference: ' + (error.error?.error || error.error?.message || error.message), 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      } else {
                const conference: Conference = {
                  conferenceId: 0,
                  title: formValue.title,
                  description: formValue.description,
                  date: formValue.date,
                  time: formValue.time,
                  floorNumber: formValue.floorNumber,
                  speaker: formValue.speaker
                };
        this.conferenceService.addConference(conference).subscribe({
          next: () => {
            this.snackBar.open('Conference added successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.dialogRef.close(conference);
          },
          error: (error) => {
            this.snackBar.open('Failed to add conference: ' + (error.error?.error || error.error?.message || error.message), 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      }
    }
  }

  async validateForm(): Promise<boolean> {
    console.log('Starting form validation');
    const formValue = this.conferenceForm.value;
    console.log('Form value for validation:', formValue);

    // Validate title
    const titleValidation = this.validationService.validateCompanyName(formValue.title);
    if (!titleValidation.isValid) {
      this.snackBar.open('Title: ' + titleValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate description
    if (!formValue.description || formValue.description.trim() === '') {
      this.snackBar.open('Description is required', 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate date is not in the past
    if (formValue.date) {
      const selectedDate = new Date(formValue.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare only dates
      
      if (selectedDate < today) {
        this.snackBar.open('Conference date cannot be in the past. Please select today or a future date.', 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        return false;
      }
    }

    // Validate floor number
    if (!formValue.floorNumber || formValue.floorNumber.trim() === '') {
      this.snackBar.open('Floor number is required', 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate floor availability for conference
    try {
      const floorValidation = await this.floorService.validateConferenceFloorAvailability(
        parseInt(formValue.floorNumber), 
        this.isEditMode ? this.conferenceId : undefined
      ).toPromise();
      
      if (floorValidation && !floorValidation.isValid) {
        this.snackBar.open(floorValidation.message, 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        return false;
      }
    } catch (error) {
      this.snackBar.open('Error validating floor availability. Please try again.', 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate speaker
    const speakerValidation = this.validationService.validateName(formValue.speaker);
    if (!speakerValidation.isValid) {
      this.snackBar.open('Speaker: ' + speakerValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    return true;
  }

  checkFloorAvailability() {
    const floorNumber = this.conferenceForm.get('floorNumber')?.value;
    if (floorNumber && floorNumber.trim()) {
      this.floorService.validateConferenceFloorAvailability(
        parseInt(floorNumber), 
        this.isEditMode ? this.conferenceId : undefined
      ).subscribe({
        next: (validation) => {
          if (!validation.isValid) {
            this.snackBar.open(validation.message, 'Close', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['warning-snackbar']
            });
          }
        },
        error: (error) => {
          console.error('Error checking floor availability:', error);
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 