import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttendeeService } from '../../services/attendee.service';
import { ExhibitorService } from '../../services/exhibitor.service';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  userForm: FormGroup;
  userTypes = ['attendee', 'exhibitor'];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private attendeeService: AttendeeService,
    private exhibitorService: ExhibitorService,
    private validationService: ValidationService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: any }
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      companyName: [''],
      contactPerson: [''],
      boothNumber: [''],
      floorNumber: [''],
      status: ['active', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data?.user) {
      this.populateForm();
    }
  }

  populateForm(): void {
    const user = this.data.user;
    this.userForm.patchValue({
      name: user.name || user.companyName || '',
      email: user.email || '',
      phone: user.phone || '',
      companyName: user.companyName || '',
      contactPerson: user.contactPerson || '',
      boothNumber: user.boothNumber || '',
      floorNumber: user.floorNumber || '',
      status: user.status || 'active'
    });
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.valid) {
      this.loading = true;
      const formValue = this.userForm.value;
      const user = this.data.user;
      const userId = user.id || user.exhibitorId || user.attendeeId;

      try {
        if (user.userType === 'exhibitor') {
          const exhibitorData = {
            exhibitorId: userId,
            companyName: formValue.companyName || formValue.name,
            contactPerson: formValue.contactPerson || formValue.name,
            email: formValue.email,
            boothNumber: formValue.boothNumber,
            floorNumber: formValue.floorNumber,
            status: formValue.status,
            productIds: user.productIds || '', // Preserve existing productIds
            logoUrl: user.logoUrl || '', // Preserve existing logoUrl
            password: user.password || '', // Preserve existing password
            passwordChanged: user.passwordChanged || false // Preserve existing passwordChanged status
          };

          await this.exhibitorService.updateExhibitor(userId, exhibitorData).toPromise();
          this.snackBar.open('Exhibitor updated successfully!', 'Close', { duration: 3000 });
        } else if (user.userType === 'attendee') {
          const attendeeData = {
            name: formValue.name,
            email: formValue.email,
            phone: formValue.phone,
            password: user.password || '', // Preserve existing password or use empty string
            status: formValue.status
          };

          await this.attendeeService.updateAttendee(userId, attendeeData).toPromise();
          this.snackBar.open('Attendee updated successfully!', 'Close', { duration: 3000 });
        }

        this.dialogRef.close({ success: true, user: { ...user, ...formValue } });
      } catch (error) {
        console.error('Error updating user:', error);
        this.snackBar.open('Failed to update user. Please try again.', 'Close', { duration: 3000 });
      } finally {
        this.loading = false;
      }
    } else {
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', { duration: 3000 });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getUserTypeLabel(): string {
    return this.data.user.userType === 'exhibitor' ? 'Exhibitor' : 'Attendee';
  }

  shouldShowExhibitorFields(): boolean {
    return this.data.user.userType === 'exhibitor';
  }
}


