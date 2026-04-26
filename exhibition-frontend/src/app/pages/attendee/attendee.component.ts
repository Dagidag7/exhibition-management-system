import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';

import { AuthService, User } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ExhibitorService } from '../../services/exhibitor.service';
import { AttendeeService, Attendee } from '../../services/attendee.service';
import { ProductService, Product } from '../../services/product.service';
import { SponsorService, Sponsor } from '../../services/sponsor.service';
import { PartnerService, Partner } from '../../services/partner.service';
import { ChangePasswordComponent } from '../../components/change-password/change-password.component';
import { EditAttendeeProfileComponent } from '../../components/edit-attendee-profile/edit-attendee-profile.component';

@Component({
  selector: 'app-attendee',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatListModule,
    MatGridListModule,
    RouterModule,
    MatTabsModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatExpansionModule,
    MatSelectModule,
    TranslatePipe
  ],
  templateUrl: './attendee.component.html',
  styleUrls: ['./attendee.component.css']
})
export class AttendeeComponent implements OnInit {
  currentUser: User | null = null;
  currentAttendee: Attendee | null = null;
  exhibitors: any[] = [];
  allExhibitors: any[] = []; // Store all exhibitors for filtering
  filteredExhibitors: any[] = [];
  sponsors: Sponsor[] = [];
  allSponsors: Sponsor[] = []; // Store all sponsors for filtering
  filteredSponsors: Sponsor[] = [];
  partners: Partner[] = [];
  allPartners: Partner[] = []; // Store all partners for filtering
  filteredPartners: Partner[] = [];
  loading = false;
  loadingSponsors = false;
  loadingPartners = false;
  activeTab = 0;
  searchQuery: string = '';
  expandedExhibitors: Set<number> = new Set();
  exhibitorProducts: Map<number, Product[]> = new Map();
  loadingProducts: Set<number> = new Set();
  stats = {
    totalExhibitors: 0,
    totalSponsors: 0,
    totalPartners: 0
  };

  constructor(
    private authService: AuthService,
    private exhibitorService: ExhibitorService,
    private attendeeService: AttendeeService,
    private productService: ProductService,
    private sponsorService: SponsorService,
    private partnerService: PartnerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser || this.currentUser.role !== 'attendee') {
      this.router.navigate(['/login']);
      return;
    }

    // Load attendee data from backend
    if (this.currentUser.id) {
      this.attendeeService.getAttendeeById(this.currentUser.id).subscribe({
        next: (attendeeData) => {
          this.currentAttendee = attendeeData;
          // Update currentUser with profile photo if available
          if (attendeeData.profilePhoto && this.currentUser) {
            this.currentUser = {
              ...this.currentUser,
              profilePhoto: attendeeData.profilePhoto
            } as User;
          }
        },
        error: (err) => {
          console.error('Failed to load attendee data:', err);
        }
      });
    }
    
    this.loadExhibitors();
    this.loadSponsors();
    this.loadPartners();
  }

  setActiveTab(index: number): void {
    this.activeTab = index;
  }

  loadExhibitors(): void {
    this.loading = true;
    this.exhibitorService.getExhibitors().subscribe({
      next: (exhibitors) => {
        const activeExhibitors = (exhibitors || []).filter(e => e.status === 'active').map(e => {
          // Normalize logoUrl - handle null, undefined, or invalid values
          if (!e.logoUrl || e.logoUrl === 'null' || e.logoUrl === 'undefined' || e.logoUrl.trim() === '') {
            e.logoUrl = '';
          } else {
            // Ensure logoUrl is properly formatted - if it's a relative path, make it absolute
            const logoUrl = e.logoUrl.trim();
            if (logoUrl && !logoUrl.startsWith('http') && !logoUrl.startsWith('/')) {
              e.logoUrl = 'http://localhost:8888/' + logoUrl;
            } else if (logoUrl && logoUrl.startsWith('/') && !logoUrl.startsWith('http')) {
              e.logoUrl = 'http://localhost:8888' + logoUrl;
            }
          }
          return e;
        });
        console.log('Loaded exhibitors with logos:', activeExhibitors.map(e => ({ name: e.companyName, logoUrl: e.logoUrl })));
        this.allExhibitors = activeExhibitors;
        this.filteredExhibitors = activeExhibitors;
        this.exhibitors = activeExhibitors; // Keep for backward compatibility
        this.applySearchFilter();
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load exhibitors:', error);
        this.loading = false;
      }
    });
  }

  applySearchFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    // Filter exhibitors
    if (!query) {
      this.filteredExhibitors = this.allExhibitors;
    } else {
      this.filteredExhibitors = this.allExhibitors.filter(exhibitor => 
        exhibitor.companyName?.toLowerCase().includes(query) ||
        exhibitor.boothNumber?.toLowerCase().includes(query) ||
        exhibitor.floorNumber?.toLowerCase().includes(query)
      );
    }
    
    // Filter sponsors
    if (!query) {
      this.filteredSponsors = this.allSponsors;
    } else {
      this.filteredSponsors = this.allSponsors.filter(sponsor => 
        sponsor.name?.toLowerCase().includes(query) ||
        sponsor.contactPerson?.toLowerCase().includes(query) ||
        sponsor.benefits?.toLowerCase().includes(query)
      );
    }
    
    // Filter partners
    if (!query) {
      this.filteredPartners = this.allPartners;
    } else {
      this.filteredPartners = this.allPartners.filter(partner => 
        partner.name?.toLowerCase().includes(query) ||
        partner.contactPerson?.toLowerCase().includes(query) ||
        partner.partnershipType?.toLowerCase().includes(query) ||
        partner.benefits?.toLowerCase().includes(query)
      );
    }
    
    // Update exhibitors reference for backward compatibility
    this.exhibitors = this.filteredExhibitors;
    this.calculateStats();
  }

  onSearchChange(): void {
    this.applySearchFilter();
  }

  toggleExhibitorProducts(exhibitorId: number): void {
    if (this.expandedExhibitors.has(exhibitorId)) {
      this.expandedExhibitors.delete(exhibitorId);
    } else {
      this.expandedExhibitors.add(exhibitorId);
      this.loadExhibitorProducts(exhibitorId);
    }
  }

  loadExhibitorProducts(exhibitorId: number): void {
    if (this.exhibitorProducts.has(exhibitorId)) {
      return; // Already loaded
    }

    this.loadingProducts.add(exhibitorId);
    this.productService.getProductsByExhibitor(exhibitorId).subscribe({
      next: (products) => {
        this.exhibitorProducts.set(exhibitorId, products || []);
        this.loadingProducts.delete(exhibitorId);
      },
      error: (error) => {
        console.error('Failed to load products:', error);
        this.exhibitorProducts.set(exhibitorId, []);
        this.loadingProducts.delete(exhibitorId);
      }
    });
  }

  isExhibitorExpanded(exhibitorId: number): boolean {
    return this.expandedExhibitors.has(exhibitorId);
  }

  getExhibitorProducts(exhibitorId: number): Product[] {
    return this.exhibitorProducts.get(exhibitorId) || [];
  }

  isLoadingProducts(exhibitorId: number): boolean {
    return this.loadingProducts.has(exhibitorId);
  }

  loadSponsors(): void {
    this.loadingSponsors = true;
    this.sponsorService.getSponsors().subscribe({
      next: (sponsors) => {
        // Normalize logoUrl - handle null, undefined, or invalid values
        const normalizedSponsors = (sponsors || []).map(s => {
          if (!s.logoUrl || s.logoUrl === 'null' || s.logoUrl === 'undefined' || s.logoUrl.trim() === '') {
            s.logoUrl = '';
          } else {
            // Ensure logoUrl is properly formatted - if it's a relative path, make it absolute
            const logoUrl = s.logoUrl.trim();
            if (logoUrl && !logoUrl.startsWith('http') && !logoUrl.startsWith('/')) {
              s.logoUrl = 'http://localhost:8888/' + logoUrl;
            } else if (logoUrl && logoUrl.startsWith('/') && !logoUrl.startsWith('http')) {
              s.logoUrl = 'http://localhost:8888' + logoUrl;
            }
          }
          return s;
        });
        console.log('Loaded sponsors with logos:', normalizedSponsors.map(s => ({ name: s.name, logoUrl: s.logoUrl })));
        this.allSponsors = normalizedSponsors;
        this.filteredSponsors = normalizedSponsors;
        this.sponsors = normalizedSponsors; // Keep for backward compatibility
        this.applySearchFilter();
        this.loadingSponsors = false;
        this.calculateStats();
      },
      error: (error) => {
        console.error('Failed to load sponsors:', error);
        this.loadingSponsors = false;
      }
    });
  }

  loadPartners(): void {
    this.loadingPartners = true;
    this.partnerService.getPartners().subscribe({
      next: (partners) => {
        this.allPartners = partners || [];
        this.filteredPartners = partners || [];
        this.partners = partners || []; // Keep for backward compatibility
        this.applySearchFilter();
        this.loadingPartners = false;
        this.calculateStats();
      },
      error: (error) => {
        console.error('Failed to load partners:', error);
        this.loadingPartners = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.snackBar.open(this.translationService.translate('message.loggedOut'), 'Close', { duration: 3000 });
  }

  calculateStats(): void {
    this.stats.totalExhibitors = this.allExhibitors.length;
    this.stats.totalSponsors = this.allSponsors.length;
    this.stats.totalPartners = this.allPartners.length;
  }

  hasSearchResults(): boolean {
    return this.searchQuery.trim().length > 0;
  }

  hasExhibitorResults(): boolean {
    return this.filteredExhibitors.length > 0;
  }

  hasSponsorResults(): boolean {
    return this.filteredSponsors.length > 0;
  }

  hasPartnerResults(): boolean {
    return this.filteredPartners.length > 0;
  }

  getFloorExhibitors(floorNumber: string, exhibitorList?: any[]): any[] {
    const listToFilter = exhibitorList || this.filteredExhibitors;
    return listToFilter.filter(e => e.floorNumber === floorNumber && e.status === 'active');
  }
  
  getUniqueFloors(exhibitorList?: any[]): string[] {
    const listToUse = exhibitorList || this.filteredExhibitors;
    const floors = new Set(listToUse.map(e => e.floorNumber).filter(f => f));
    return Array.from(floors).sort();
  }


  openChangePasswordDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '450px',
      data: {
        userId: this.currentUser?.id,
        userType: 'attendee'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
        // Optionally log out user to re-login with new password
        // this.authService.logout();
        // this.router.navigate(['/login']);
      }
    });
  }

  openEditProfile(): void {
    if (!this.currentAttendee) {
      this.snackBar.open('Unable to load attendee profile', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(EditAttendeeProfileComponent, {
      width: '400px',
      data: { attendee: this.currentAttendee }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.attendeeService.updateAttendee(
          this.currentAttendee!.attendeeId!,
          result
        ).subscribe({
          next: (response) => {
            // Refresh attendee data from backend
            this.attendeeService.getAttendeeById(this.currentUser!.id!).subscribe({
              next: (freshData) => {
                this.currentAttendee = freshData;
                // Update localStorage with fresh data
                const updatedUser = {
                  ...this.currentUser!,
                  name: freshData.name,
                  email: freshData.email,
                  profilePhoto: freshData.profilePhoto
                } as User;
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                this.currentUser = updatedUser;
                this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
              },
              error: (err) => {
                console.error('Failed to fetch updated attendee:', err);
                this.snackBar.open('Profile updated, but failed to refresh data', 'Close', { duration: 3000 });
              }
            });
          },
          error: (err) => {
            console.error('Update failed', err);
            this.snackBar.open('Failed to update profile. Please try again.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  // Get payment fee from attendee data
  getPaymentFee(): number {
    if (this.currentAttendee && this.currentAttendee.paymentFee) {
      return this.currentAttendee.paymentFee;
    }
    return 0;
  }

  downloadReceipt(): void {
    if (!this.currentAttendee || !this.currentAttendee.attendeeId) {
      this.snackBar.open('Unable to download receipt. Attendee information is missing.', 'Close', { duration: 3000 });
      return;
    }

    this.attendeeService.downloadReceipt(this.currentAttendee.attendeeId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendee-receipt-${this.currentAttendee!.attendeeId}.png`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed to download attendee receipt:', err);
        this.snackBar.open('Failed to download receipt. Please try again later.', 'Close', { duration: 3000 });
      }
    });
  }

  // Handle profile photo loading errors
  onProfilePhotoError(): void {
    if (this.currentAttendee) {
      this.currentAttendee.profilePhoto = undefined;
    }
  }

  // Check if exhibitor has a valid logo URL
  hasValidLogo(exhibitor: any): boolean {
    if (!exhibitor) {
      return false;
    }
    // Handle both logoUrl and LogoUrl (case insensitive check)
    const logoUrlValue = exhibitor.logoUrl || exhibitor.LogoUrl || '';
    if (!logoUrlValue) {
      return false;
    }
    const logoUrl = logoUrlValue.toString().trim();
    const isValid = logoUrl !== '' && 
           logoUrl !== 'null' && 
           logoUrl !== 'undefined' &&
           logoUrl.toLowerCase() !== 'null';
    if (isValid) {
      // Normalize to lowercase property name for consistency
      if (exhibitor.LogoUrl && !exhibitor.logoUrl) {
        exhibitor.logoUrl = exhibitor.LogoUrl;
      }
    }
    return isValid;
  }

  // Check if sponsor has a valid logo URL
  hasValidSponsorLogo(sponsor: any): boolean {
    if (!sponsor) {
      return false;
    }
    // Handle both logoUrl and LogoUrl (case insensitive check)
    const logoUrlValue = sponsor.logoUrl || sponsor.LogoUrl || '';
    if (!logoUrlValue) {
      return false;
    }
    const logoUrl = logoUrlValue.toString().trim();
    const isValid = logoUrl !== '' && 
           logoUrl !== 'null' && 
           logoUrl !== 'undefined' &&
           logoUrl.toLowerCase() !== 'null';
    if (isValid) {
      // Normalize to lowercase property name for consistency
      if (sponsor.LogoUrl && !sponsor.logoUrl) {
        sponsor.logoUrl = sponsor.LogoUrl;
      }
    }
    return isValid;
  }

  // Handle sponsor logo loading successfully
  onSponsorLogoLoad(event: any, sponsor: any): void {
    console.log('Sponsor logo loaded successfully for:', sponsor.name, 'URL:', sponsor.logoUrl);
  }

  // Handle sponsor logo loading errors
  onSponsorLogoError(event: any, sponsor: any): void {
    console.error('Sponsor logo failed to load for:', sponsor.name, 'URL:', sponsor.logoUrl);
    sponsor.logoUrl = ''; // Clear the logoUrl so placeholder shows
    sponsor._logoFailed = true; // Custom flag to indicate error
    this.filteredSponsors = [...this.filteredSponsors]; // Force change detection
  }

  // Handle logo loading successfully
  onLogoLoad(event: any, exhibitor: any): void {
    console.log('Logo loaded successfully for:', exhibitor.companyName);
  }

  // Handle logo loading errors
  onLogoError(event: any, exhibitor: any): void {
    console.error('Logo failed to load for exhibitor:', exhibitor.companyName, 'URL:', exhibitor.logoUrl);
    // Clear the logoUrl so placeholder shows
    exhibitor.logoUrl = '';
    exhibitor._logoFailed = true;
    // Force change detection
    this.filteredExhibitors = [...this.filteredExhibitors];
  }
}

