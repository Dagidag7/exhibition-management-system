import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { AttendeeService } from '../../services/attendee.service';
import { ExhibitorService } from '../../services/exhibitor.service';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-database-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatTableModule,
    MatTooltipModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './database-management.component.html',
  styleUrls: ['./database-management.component.css']
})
export class DatabaseManagementComponent implements OnInit {
  users: any[] = [];
  selectedUser: any = null;
  loading = false;
  
  displayedColumns: string[] = ['id', 'name', 'email', 'role'];

  constructor(
    private attendeeService: AttendeeService,
    private exhibitorService: ExhibitorService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    
    // Load both attendees and exhibitors
    Promise.all([
      this.attendeeService.getAttendees().toPromise(),
      this.exhibitorService.getExhibitors().toPromise()
    ]).then(([attendees, exhibitors]) => {
      this.users = [
        ...(attendees || []).map((attendee: any) => ({ ...attendee, userType: 'attendee' })),
        ...(exhibitors || []).map((exhibitor: any) => ({ ...exhibitor, userType: 'exhibitor' })),
        // Add admin user manually if not present
        { id: 0, name: 'Admin User', email: 'dagimawitkelem129@gmail.com', userType: 'admin', registrationDate: new Date().toISOString() }
      ];
      this.loading = false;
    }).catch(error => {
      console.error('Failed to load users:', error);
      this.loading = false;
      this.snackBar.open(this.translationService.translate('database.failedToLoadUsers'), this.translationService.translate('form.close'), { duration: 3000 });
    });
  }

  getUserRole(user: any): string {
    if (user.userType === 'exhibitor') {
      return 'Exhibitor';
    } else if (user.userType === 'attendee') {
      return 'Attendee';
    } else if (user.email === 'dagimawitkelem129@gmail.com') {
      return 'Admin';
    }
    return 'User';
  }

  getTranslatedRole(user: any): string {
    const role = this.getUserRole(user);
    if (role === 'Exhibitor') {
      return this.translationService.translate('database.roleExhibitor');
    } else if (role === 'Attendee') {
      return this.translationService.translate('database.roleAttendee');
    } else if (role === 'Admin') {
      return this.translationService.translate('database.roleAdmin');
    }
    return this.translationService.translate('database.roleUser');
  }

  getRoleColor(user: any): string {
    const role = this.getUserRole(user);
    switch (role) {
      case 'Admin':
        return 'warn';
      case 'Exhibitor':
        return 'primary';
      case 'Attendee':
        return 'accent';
      default:
        return 'primary';
    }
  }

  getStatusColor(status: string): string {
    return status === 'active' ? 'accent' : 'warn';
  }

  getFormattedDate(date: any): string {
    if (!date) return 'N/A';
    
    try {
      if (typeof date === 'string') {
        return new Date(date).toLocaleDateString();
      } else if (date instanceof Date) {
        return date.toLocaleDateString();
      } else {
        return new Date(date).toLocaleDateString();
      }
    } catch (error) {
      return 'N/A';
    }
  }

  getExhibitorCount(): number {
    return this.users.filter(user => user.userType === 'exhibitor').length;
  }

  getAdminCount(): number {
    return this.users.filter(user => this.getUserRole(user) === 'Admin').length;
  }

  getActiveCount(): number {
    return this.users.filter(user => user.status === 'active').length;
  }

  toggleUserStatus(user: any): void {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const userId = user.id || user.exhibitorId || user.attendeeId;
    
    if (!userId) {
      this.snackBar.open('User ID not found', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    
    if (user.userType === 'exhibitor') {
      // Immediately update the UI for better user experience
      user.status = newStatus;
      
      this.exhibitorService.updateExhibitor(userId, { ...user, status: newStatus }).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open(this.translationService.translate('database.exhibitorStatusUpdated', { status: newStatus }), this.translationService.translate('form.close'), { duration: 3000 });
          // Refresh the data to ensure consistency with backend
          setTimeout(() => this.loadUsers(), 500);
        },
        error: (error) => {
          user.status = user.status === 'active' ? 'inactive' : 'active';
          console.error('Failed to update exhibitor status:', error);
          this.loading = false;
          this.snackBar.open('Failed to update exhibitor status', 'Close', { duration: 3000 });
        }
      });
    } else if (user.userType === 'attendee') {
      user.status = newStatus;
      
      this.attendeeService.updateAttendee(userId, { ...user, status: newStatus }).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open(this.translationService.translate('database.attendeeStatusUpdated', { status: newStatus }), this.translationService.translate('form.close'), { duration: 3000 });
          // Refresh the data to ensure consistency with backend
          setTimeout(() => this.loadUsers(), 500);
        },
        error: (error) => {
          // Revert the UI change if backend update failed
          user.status = user.status === 'active' ? 'inactive' : 'active';
          console.error('Failed to update attendee status:', error);
          this.loading = false;
          this.snackBar.open(this.translationService.translate('userManagement.failedToUpdateAttendee'), this.translationService.translate('form.close'), { duration: 3000 });
        }
      });
    }
  }

  deleteUser(user: any): void {
    const userId = user.id || user.exhibitorId || user.attendeeId;
    const userName = user.name || user.companyName;
    
    if (!userId) {
      this.snackBar.open('User ID not found', 'Close', { duration: 3000 });
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${userName}? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      this.loading = true;
      
      if (user.userType === 'exhibitor') {
        this.exhibitorService.deleteExhibitor(userId).subscribe({
          next: (response) => {
            this.users = this.users.filter(u => (u.id || u.exhibitorId) !== userId);
            this.loading = false;
            this.snackBar.open(this.translationService.translate('database.exhibitorDeleted'), this.translationService.translate('form.close'), { duration: 3000 });
          },
          error: (error) => {
            console.error('Failed to delete exhibitor:', error);
            this.loading = false;
            this.snackBar.open(this.translationService.translate('userManagement.failedToDeleteExhibitor'), this.translationService.translate('form.close'), { duration: 3000 });
          }
        });
      } else if (user.userType === 'attendee') {
        this.attendeeService.deleteAttendee(userId).subscribe({
          next: (response) => {
            this.users = this.users.filter(u => (u.id || u.attendeeId) !== userId);
            this.loading = false;
            this.snackBar.open(this.translationService.translate('database.attendeeDeleted'), this.translationService.translate('form.close'), { duration: 3000 });
          },
          error: (error) => {
            console.error('Failed to delete attendee:', error);
            this.loading = false;
            this.snackBar.open(this.translationService.translate('database.failedToDeleteAttendee'), this.translationService.translate('form.close'), { duration: 3000 });
          }
        });
      }
    }
  }

  editUser(user: any): void {
    // Don't allow editing admin users
    if (user.email === 'dagimawitkelem129@gmail.com') {
      this.snackBar.open(this.translationService.translate('userManagement.adminCannotEdit'), this.translationService.translate('form.close'), { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(EditUserComponent, {
      width: '600px',
      data: { user: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        // Update the user in the local array
        const index = this.users.findIndex(u => 
          (u.id || u.exhibitorId || u.attendeeId) === (user.id || user.exhibitorId || user.attendeeId)
        );
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...result.user };
        }
        this.snackBar.open(this.translationService.translate('database.userUpdated'), this.translationService.translate('form.close'), { duration: 3000 });
      }
    });
  }
} 