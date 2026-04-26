import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AttendeeService } from '../../services/attendee.service';
import { ExhibitorService, Exhibitor } from '../../services/exhibitor.service';
import { ProductService } from '../../services/product.service';
import { ConferenceService, Conference } from '../../services/conference.service';
import { AddExhibitorComponent } from '../../components/add-exhibitor/add-exhibitor.component';
import { AddConferenceComponent } from '../../components/add-conference/add-conference.component';
import { SpeakerService, Speaker } from '../../services/speaker.service';
import { AddSpeakerComponent } from '../../components/add-speaker/add-speaker.component';
import { PartnerService, Partner } from '../../services/partner.service';
import { AddPartnerComponent } from '../../components/add-partner/add-partner.component';
import { SponsorService, Sponsor } from '../../services/sponsor.service';
import { AddSponsorComponent } from '../../components/add-sponsor/add-sponsor.component';
import { EditExhibitorComponent } from '../../components/edit-exhibitor/edit-exhibitor.component';
import { AddProductComponent } from '../../components/add-product/add-product.component';
import { DatabaseManagementComponent } from '../../components/database-management/database-management.component';
import { TranslatePipe } from '../../pipes/translate.pipe';


interface UserWithStatus {
  id: number;
  name: string;
  email: string;
  contactPerson?: string;
  status: string;
  [key: string]: any;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DatabaseManagementComponent,
    TranslatePipe
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  currentUser: any;
  activeTab: string = 'dashboard';
  dashboardStats = {
    totalUsers: 0,
    totalExhibitors: 0,
    totalAttendees: 0,
    totalProducts: 0,
    totalConferences: 0,
    totalSpeakers: 0,
    totalPartners: 0,
    totalSponsors: 0
  };
  
  attendees: UserWithStatus[] = [];
  exhibitors: UserWithStatus[] = [];
  products: any[] = [];
  conferences: Conference[] = [];
  speakers: Speaker[] = [];
  partners: Partner[] = [];
  sponsors: Sponsor[] = [];
  
  attendeeDisplayedColumns = ['name', 'email', 'phone', 'status'];
  exhibitorDisplayedColumns = ['companyName', 'email', 'contactPerson', 'boothNumber', 'floorNumber', 'status', 'productIds', 'actions'];
  productDisplayedColumns = ['productId', 'name', 'description', 'category', 'exhibitorId', 'actions'];
  speakerDisplayedColumns = ['name', 'email', 'bio', 'expertise', 'organization', 'actions'];
  conferenceDisplayedColumns = ['title', 'description', 'date', 'time', 'floorNumber', 'speaker', 'actions'];
  partnerDisplayedColumns = ['name', 'contactPerson', 'email', 'partnershipType', 'benefits', 'actions'];
  sponsorDisplayedColumns = ['name', 'contactPerson', 'email', 'contributionAmount', 'benefits', 'actions'];

  databaseOperations = [
    { operation: 'Backup Database', description: 'Create a backup of the current database', status: 'Available' },
    { operation: 'Restore Database', description: 'Restore database from a backup file', status: 'Available' },
    { operation: 'Optimize Tables', description: 'Optimize database tables for better performance', status: 'Available' },
    { operation: 'Check Database Health', description: 'Run diagnostics on database health', status: 'Available' }
  ];
  
  displayedColumnsDatabase = ['operation', 'description', 'status', 'actions'];

  constructor(
    private authService: AuthService,
    private attendeeService: AttendeeService,
    private exhibitorService: ExhibitorService,
    private productService: ProductService,
    private conferenceService: ConferenceService,
    private speakerService: SpeakerService,
    private partnerService: PartnerService,
    private sponsorService: SponsorService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  openAddAttendeeDialog(): void {
    this.snackBar.open('Add attendee functionality coming soon', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  openAddConferenceDialog() {
    const dialogRef = this.dialog.open(AddConferenceComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe((result: Conference) => {
      if (result) {
        console.log('Conference added, reloading data...');
        this.loadDashboardData(); 
        this.snackBar.open('Conference added successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  openAddProductDialog(): void {
    const dialogRef = this.dialog.open(AddProductComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDashboardData();
      }
    });
  }

  editProduct(product: any): void {
    const dialogRef = this.dialog.open(AddProductComponent, {
      width: '500px',
      data: { product: product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDashboardData();
      }
    });
  }

  deleteProduct(product: any): void {
    if (confirm(`Are you sure you want to delete the product "${product.name}"?`)) {
      this.productService.deleteProduct(product.productId).subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
        }
      });
    }
  }

  loadProductIdsForExhibitors(): void {
    // Load all products to get product IDs for each exhibitor
    this.productService.getProducts().subscribe({
      next: (allProducts) => {
        // Set products for the admin panel
        this.products = allProducts;
        this.dashboardStats.totalProducts = allProducts.length;
        
        // Group products by exhibitor ID
        const productsByExhibitor = allProducts.reduce((acc: any, product: any) => {
          const exhibitorId = product.exhibitorId;
          if (!acc[exhibitorId]) {
            acc[exhibitorId] = [];
          }
          acc[exhibitorId].push(product.productId);
          return acc;
        }, {});

        // Update exhibitors with their product IDs
        this.exhibitors = this.exhibitors.map(exhibitor => ({
          ...exhibitor,
          productIds: productsByExhibitor[exhibitor['exhibitorId']] 
            ? productsByExhibitor[exhibitor['exhibitorId']].join(', ') 
            : 'N/A'
        }));
      },
      error: (error) => {
        console.error('Error loading products for exhibitor product IDs:', error);
      }
    });
  }

  loadDashboardData(): void {
    console.log('Loading dashboard data...');
    
    this.attendeeService.getAttendees().subscribe({
      next: (attendees: any[]) => {
        console.log('Raw attendees from backend:', attendees);
        this.attendees = attendees.map(attendee => ({
          ...attendee,
          id: attendee.attendeeId, 
          status: (attendee as any).status || 'active'
        }));
        console.log('Processed attendees:', this.attendees);
        this.dashboardStats.totalAttendees = attendees.length;
      },
      error: (error) => {
        console.error('Error loading attendees:', error);
      }
    });

    this.exhibitorService.getExhibitors().subscribe({
      next: (exhibitors: any[]) => {
        console.log('Raw exhibitors from backend:', exhibitors);
        this.exhibitors = exhibitors.map(exhibitor => ({
          ...exhibitor,
          id: exhibitor.exhibitorId,
          status: (exhibitor as any).status || 'active' 
        }));
        console.log('Processed exhibitors:', this.exhibitors);
        this.dashboardStats.totalExhibitors = exhibitors.length;
        console.log('Exhibitors loaded:', this.exhibitors);
        
        // Load product IDs for each exhibitor
        this.loadProductIdsForExhibitors();
      },
      error: (error) => {
        console.error('Error loading exhibitors:', error);
      }
    });

    // Products are loaded in loadProductIdsForExhibitors method to avoid duplicate API calls

    forkJoin({
      conferences: this.conferenceService.getConferences(),
      speakers: this.speakerService.getSpeakers()
    }).subscribe({
      next: ({ conferences, speakers }) => {
        this.conferences = conferences || [];
        this.dashboardStats.totalConferences = this.conferences.length;
        const speakerMap = new Map<string, Speaker>();
        (speakers || []).forEach(s => speakerMap.set((s.name || '').trim().toLowerCase(), s));
        const seen = new Set<string>();
        this.speakers = [];
        this.conferences.forEach(conf => {
          const speakerName = (conf.speaker || '').trim();
          if (speakerName && !seen.has(speakerName.toLowerCase())) {
            seen.add(speakerName.toLowerCase());
            const existing = speakerMap.get(speakerName.toLowerCase());
            this.speakers.push(existing ? { ...existing } : {
              speakerId: 0,
              name: speakerName,
              email: '',
              bio: '',
              expertise: '',
              phone: '',
              organization: ''
            });
          }
        });
        this.dashboardStats.totalSpeakers = this.speakers.length;
      },
      error: (error) => {
        console.error('Error loading conferences/speakers:', error);
      }
    });

          this.partnerService.getPartners().subscribe({
        next: (partners) => {
          this.partners = partners;
          this.dashboardStats.totalPartners = partners.length;
          console.log('Partners loaded:', this.partners);
        },
        error: (error) => { console.error('Error loading partners:', error); }
      });

    this.sponsorService.getSponsors().subscribe({
      next: (sponsors) => {
        this.sponsors = sponsors;
        this.dashboardStats.totalSponsors = sponsors.length;
        console.log('Sponsors loaded:', this.sponsors);
      },
      error: (error) => { console.error('Error loading sponsors:', error); }
    });
  }



  toggleUserStatus(user: UserWithStatus): void {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    console.log('Toggling user status:', { userId: user.id, oldStatus: user.status, newStatus });
    
    if (this.exhibitors.includes(user)) {
      const exhibitorData = {
        exhibitorId: user['exhibitorId'] || user.id,
        companyName: user['companyName'],
        contactPerson: user.contactPerson || '',
        email: user.email,
        boothNumber: user['boothNumber'] || '',
        productIds: user['productIds'] || '',
        logoUrl: user['logoUrl'] || '',
        status: newStatus
      };
      
      user.status = newStatus;
      console.log('Updated exhibitor status in UI:', user.status);
      
      this.exhibitorService.updateExhibitor(user.id, exhibitorData).subscribe({
        next: (response) => {
          console.log('Exhibitor status update response:', response);
          this.snackBar.open(`Exhibitor ${newStatus} successfully`, 'Close', { duration: 3000 });
          setTimeout(() => this.loadDashboardData(), 500);
        },
        error: (error) => {
          user.status = user.status === 'active' ? 'inactive' : 'active';
          console.error('Error updating exhibitor status:', error);
          this.snackBar.open('Error updating exhibitor status', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteUser(user: UserWithStatus): void {
    if (this.attendees.includes(user)) {
      this.attendeeService.deleteAttendee(user.id).subscribe({
        next: (response) => {
          this.attendees = this.attendees.filter(a => a.id !== user.id);
          this.snackBar.open('Attendee deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting attendee:', error);
          this.snackBar.open('Error deleting attendee', 'Close', { duration: 3000 });
        }
      });
    } else if (this.exhibitors.includes(user)) {
      this.exhibitorService.deleteExhibitor(user.id).subscribe({
        next: (response) => {
          this.exhibitors = this.exhibitors.filter(e => e.id !== user.id);
          this.snackBar.open('Exhibitor deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting exhibitor:', error);
          this.snackBar.open('Error deleting exhibitor', 'Close', { duration: 3000 });
        }
      });
    }
  }

  editUser(user: UserWithStatus, type: 'attendee' | 'exhibitor'): void {
    if (type === 'attendee') {
      this.snackBar.open('Attendee editing is not available', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    } else {
      this.editExhibitor(user);
    }
  }

  editExhibitor(exhibitor: UserWithStatus): void {
    const dialogRef = this.dialog.open(EditExhibitorComponent, { 
      width: '600px',
      data: { exhibitor: exhibitor }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadDashboardData();
        this.snackBar.open('Exhibitor updated successfully!', 'Close', { 
          duration: 3000, 
          horizontalPosition: 'center', 
          verticalPosition: 'top' 
        });
      }
    });
  }

  requestExhibitorPayment(user: UserWithStatus): void {
    const paymentLink = prompt('Paste the Stripe Payment Link for this exhibitor:');
    if (!paymentLink) { return; }
    const email = user.email || '';
    if (!email || !email.trim()) {
      this.snackBar.open('Exhibitor has no email. Add email in Edit, then use Request Payment.', 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }
    
    const companyName = user['companyName'] || user.contactPerson || 'Exhibitor';
    
    // Send payment request via backend API
    this.exhibitorService.sendPaymentRequest(email, companyName, paymentLink).subscribe({
      next: (response) => {
        this.snackBar.open('Payment request email sent successfully to ' + email, 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Failed to send payment request:', error);
        this.snackBar.open('Failed to send payment request email. Check console for details.', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  addExhibitor(): void {
    this.snackBar.open('Add exhibitor functionality coming soon', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  assignBooth(exhibitor: UserWithStatus): void {
    this.snackBar.open('Booth assignment functionality coming soon', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getStatusColor(status: string): string {
    return status === 'active' ? 'accent' : 'warn';
  }

  getFormattedDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      if (dateString.includes(',')) {
        const parts = dateString.split(',').map(p => parseInt(p.trim()));
        if (parts.length >= 3) {
          const date = new Date(parts[0], parts[1] - 1, parts[2]); 
          return date.toLocaleDateString();
        }
      } else {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      }
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
    }
    
    return dateString || 'N/A';
  }

  openAddExhibitorDialog() {
    const dialogRef = this.dialog.open(AddExhibitorComponent, {
      width: '400px'
    });
  
    dialogRef.afterClosed().subscribe((result: Exhibitor) => {
      if (result) {
        this.exhibitorService.addExhibitor(result).subscribe({
          next: () => {
            console.log('Exhibitor added, reloading data...');
            this.loadDashboardData(); 
            this.snackBar.open('Exhibitor added successfully! Default password: Welcome123', 'Close', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Error adding exhibitor:', err);
            const errorMessage = err.error?.error || err.error?.message || err.message || 'Unknown error occurred';
            this.snackBar.open('Failed to add exhibitor: ' + errorMessage, 'Close', {
              duration: 8000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  openAddSpeakerDialog() {
    const dialogRef = this.dialog.open(AddSpeakerComponent, { width: '600px' });
    dialogRef.afterClosed().subscribe((result: Speaker) => {
      if (result) {
        this.loadDashboardData();
        this.snackBar.open('Speaker added successfully!', 'Close', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
      }
    });
  }

  openAddPartnerDialog() {
    const dialogRef = this.dialog.open(AddPartnerComponent, { width: '600px' });
    dialogRef.afterClosed().subscribe((result: Partner) => {
      if (result) {
        this.loadDashboardData();
        this.snackBar.open('Partner added successfully!', 'Close', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
      }
    });
  }

  editPartner(partner: Partner) {
    const dialogRef = this.dialog.open(AddPartnerComponent, { 
      width: '600px',
      data: { partner: partner }
    });
    dialogRef.afterClosed().subscribe((result: Partner) => {
      if (result) {
        this.loadDashboardData();
        this.snackBar.open('Partner updated successfully!', 'Close', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
      }
    });
  }

  deletePartner(partner: Partner) {
    if (confirm(`Are you sure you want to delete partner "${partner.name}"?`)) {
      this.partnerService.deletePartner(partner.partnerId).subscribe({
        next: () => {
          this.loadDashboardData();
          this.snackBar.open('Partner deleted successfully!', 'Close', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
        },
        error: (error) => {
          this.snackBar.open('Error deleting partner: ' + error.message, 'Close', { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' });
        }
      });
    }
  }

  openAddSponsorDialog() {
    const dialogRef = this.dialog.open(AddSponsorComponent, { width: '600px' });
    dialogRef.afterClosed().subscribe((result: Sponsor) => {
      if (result) {
        this.sponsorService.createSponsor(result).subscribe({
          next: () => {
            this.loadDashboardData();
            this.snackBar.open('Sponsor added successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            const errorMessage = err.error?.error || err.error?.message || err.message || 'Unknown error occurred';
            this.snackBar.open('Failed to add sponsor: ' + errorMessage, 'Close', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  requestSponsorPayment(sponsor: Sponsor): void {
    const paymentLink = prompt('Paste the Stripe Payment Link for this sponsor:');
    if (!paymentLink) { return; }
    const email = sponsor.email || '';
    if (!email || !email.trim()) {
      this.snackBar.open('Sponsor has no email. Add email in Edit, then use Request Payment.', 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }
    const subject = encodeURIComponent('Sponsor Registration Payment');
    const body = encodeURIComponent(
      `Dear ${sponsor.contactPerson || sponsor.name || 'Sponsor'},\n\n` +
      `Please complete your sponsor registration payment using the secure link below.\n\n` +
      `${paymentLink}\n\n` +
      `If you have any questions, reply to this email.\n\n` +
      `Best regards,\nAdmin`
    );
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_self');
  }

  editSponsor(sponsor: Sponsor): void {
    const dialogRef = this.dialog.open(AddSponsorComponent, { 
      width: '600px',
      data: { sponsor: sponsor }
    });
    dialogRef.afterClosed().subscribe((result: Sponsor) => {
      if (result) {
        this.loadDashboardData();
        this.snackBar.open('Sponsor updated successfully!', 'Close', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
      }
    });
  }

  deleteSponsor(sponsor: Sponsor): void {
    if (confirm(`Are you sure you want to delete sponsor "${sponsor.name}"?`)) {
      const id = sponsor.sponsorId;
      if (id == null) return;
      this.sponsorService.deleteSponsor(id).subscribe({
        next: () => {
          this.sponsors = this.sponsors.filter(s => s.sponsorId !== sponsor.sponsorId);
          this.dashboardStats.totalSponsors--;
          this.snackBar.open('Sponsor deleted successfully!', 'Close', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
        },
        error: (error) => {
          this.snackBar.open('Error deleting sponsor: ' + error.message, 'Close', { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' });
        }
      });
    }
  }

  editSpeaker(speaker: Speaker): void {
    const dialogRef = this.dialog.open(AddSpeakerComponent, { 
      width: '600px',
      data: { speaker: speaker }
    });
    dialogRef.afterClosed().subscribe((result: Speaker) => {
      if (result) {
        this.loadDashboardData();
        this.snackBar.open('Speaker updated successfully!', 'Close', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
      }
    });
  }

  deleteSpeaker(speaker: Speaker): void {
    if (confirm(`Are you sure you want to delete speaker "${speaker.name}"? This will remove the speaker from all conferences.`)) {
      const speakerName = (speaker.name || '').trim();
      if (!speakerName) {
        this.snackBar.open('Cannot delete speaker without a name.', 'Close', { duration: 3000 });
        return;
      }
      if (speaker.speakerId && speaker.speakerId > 0) {
        this.speakerService.deleteSpeaker(speaker.speakerId).subscribe({
          next: () => {
            this.loadDashboardData();
            this.snackBar.open('Speaker deleted successfully!', 'Close', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
          },
          error: (error) => {
            this.snackBar.open('Error deleting speaker: ' + error.message, 'Close', { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' });
          }
        });
      } else {
        this.conferenceService.clearSpeakerFromConferences(speakerName).subscribe({
          next: () => {
            this.loadDashboardData();
            this.snackBar.open('Speaker removed from conferences successfully!', 'Close', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
          },
          error: (error) => {
            this.snackBar.open('Error removing speaker: ' + error.message, 'Close', { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' });
          }
        });
      }
    }
  }

  editConference(conference: Conference): void {
    const dialogRef = this.dialog.open(AddConferenceComponent, { 
      width: '600px',
      data: { conference: conference }
    });
    dialogRef.afterClosed().subscribe((result: Conference) => {
      if (result) {
        this.loadDashboardData();
        this.snackBar.open('Conference updated successfully!', 'Close', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
      }
    });
  }

  deleteConference(conference: Conference): void {
    if (confirm(`Are you sure you want to delete conference "${conference.title}"?`)) {
      this.conferenceService.deleteConference(conference.conferenceId).subscribe({
        next: () => {
          this.conferences = this.conferences.filter(c => c.conferenceId !== conference.conferenceId);
          this.dashboardStats.totalConferences--;
          this.snackBar.open('Conference deleted successfully!', 'Close', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' });
        },
        error: (error) => {
          this.snackBar.open('Error deleting conference: ' + error.message, 'Close', { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' });
        }
      });
    }
  }
}