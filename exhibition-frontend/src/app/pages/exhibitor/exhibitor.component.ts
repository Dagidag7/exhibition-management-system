import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';


import { ProductService } from '../../services/product.service';
import { FloorService } from '../../services/floor.service';
import { AuthService, User } from '../../services/auth.service';
import { ExhibitorService } from '../../services/exhibitor.service';


import { AddProductComponent } from '../../components/add-product/add-product.component';
import { ChangePasswordComponent } from '../../components/change-password/change-password.component';


import { Product } from '../../services/product.service';
import { Floor } from '../../services/floor.service';
import { EditProfileComponent } from '../../components/edit-profile/edit-profile.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-exhibitor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
    MatTabsModule,
    MatProgressBarModule,
    MatListModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe
  ],
  templateUrl: './exhibitor.component.html',
  styleUrls: ['./exhibitor.component.css']
})
export class ExhibitorComponent implements OnInit {
  dashboardStats = {
    totalProducts: 0,
    activeProducts: 0,
    boothNumber: '',
    floorNumber: '',
    profileCompletion: 0
  };

  products: Product[] = [];
  floorInfo: Floor | null = null;

  displayedColumnsProducts = ['productId', 'name', 'description', 'category', 'imageUrl', 'actions'];

  activeTab = 0; 

  setActiveTab(index: number): void {
    this.activeTab = index;
  }

  currentExhibitor: any = null;

  constructor(
    private productService: ProductService,
    private floorService: FloorService,
    private authService: AuthService,
    private exhibitorService: ExhibitorService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user from auth service:', currentUser);
    
    if (!currentUser || currentUser.role !== 'exhibitor') {
      console.log('User is not an exhibitor, redirecting...');
      this.router.navigate(['/login']);
      return;
    }

    // Load fresh exhibitor data from backend to ensure consistency
    this.exhibitorService.getExhibitorById(currentUser.id).subscribe({
      next: (exhibitorData) => {
        console.log('Exhibitor data loaded from backend:', exhibitorData);
        this.currentExhibitor = exhibitorData;
        
        // Update localStorage with fresh data from backend
        const updatedUser = {
          ...currentUser,
          companyName: exhibitorData.companyName,
          company_name: exhibitorData.companyName,
          contactPerson: exhibitorData.contactPerson,
          name: exhibitorData.contactPerson,
          email: exhibitorData.email,
          boothNumber: exhibitorData.boothNumber,
          booth_number: exhibitorData.boothNumber,
          floorNumber: exhibitorData.floorNumber,
          floor_number: exhibitorData.floorNumber,
          logoUrl: exhibitorData.logoUrl,
          logo_url: exhibitorData.logoUrl,
          status: exhibitorData.status
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Failed to load exhibitor data from backend:', err);
        // Fallback to localStorage data if backend fetch fails
        this.currentExhibitor = {
          exhibitorId: currentUser.id,
          companyName: currentUser['companyName'] || currentUser['company_name'] || 'Company Name',
          contactPerson: currentUser['contactPerson'] || currentUser.name || 'Contact Person',  
          email: currentUser.email,
          boothNumber: currentUser['boothNumber'] || currentUser['booth_number'] || 'A-15',
          floorNumber: currentUser['floorNumber'] || currentUser['floor_number'] || '1',
          logoUrl: currentUser['logoUrl'] || currentUser['logo_url'] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTUwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjNjY3ZWVhIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RXhoaWJpdG9yPC90ZXh0Pgo8L3N2Zz4K',
          status: currentUser['status'] || 'active'
        };
        console.log('Current exhibitor data set from localStorage:', this.currentExhibitor);
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData(): void {
    if (!this.currentExhibitor) return;

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products.filter(p => p.exhibitorId === this.currentExhibitor.exhibitorId);
        this.dashboardStats.totalProducts = this.products.length;
        this.dashboardStats.activeProducts = this.products.filter(p => p.status === 'active').length;
        console.log('Products loaded:', this.products);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
        this.products = [];
      }
    });

    
    this.floorService.getFloors().subscribe({
      next: (floors) => {
        console.log('All floors from API:', floors);
        this.floorInfo = floors.find(f => f.floorNumber.toString() === this.currentExhibitor.floorNumber.toString()) || null;
        console.log('Floor info loaded:', this.floorInfo);
        
        if (!this.floorInfo) {
          this.floorInfo = {
            floorId: 1,
            floorNumber: parseInt(this.currentExhibitor.floorNumber) || 1,
            layoutImage: 'https://via.placeholder.com/400x300/667eea/ffffff?text=Floor+Layout',
            exhibitorIds: '1,2,3,4,5',
            conferenceIds: '1,2,3'
          };
          console.log('Using fallback floor info:', this.floorInfo);
        }
      },
      error: (error) => {
        console.error('Error loading floor info:', error);
        this.floorInfo = {
          floorId: 1,
          floorNumber: parseInt(this.currentExhibitor.floorNumber) || 1,
          layoutImage: 'https://via.placeholder.com/400x300/667eea/ffffff?text=Floor+Layout',
          exhibitorIds: '1,2,3,4,5',
          conferenceIds: '1,2,3'
        };
        console.log('Using mock floor info:', this.floorInfo);
      }
    });

    this.dashboardStats.boothNumber = this.currentExhibitor.boothNumber;
    this.dashboardStats.floorNumber = this.currentExhibitor.floorNumber;

  }

 
  openAddProductDialog(): void {
    const dialogRef = this.dialog.open(AddProductComponent, {
      width: '600px',
      // From exhibitor dashboard: lock to current exhibitor and hide exhibitor selector
      data: { exhibitorId: this.currentExhibitor.exhibitorId, fromExhibitorDashboard: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDashboardData();
        this.snackBar.open('Product added successfully', 'Close', { duration: 3000 });
      }
    });
  }

  editProduct(product: Product): void {
    const dialogRef = this.dialog.open(AddProductComponent, {
      width: '600px',
      data: { product, isEditMode: true, fromExhibitorDashboard: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDashboardData();
        this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.productId).subscribe({
        next: () => {
          this.loadDashboardData();
          this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getStatusColor(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') return '#4caf50'; // Green
    if (statusLower === 'inactive') return '#f44336'; // Red
    if (statusLower === 'suspended') return '#ff9800'; // Orange
    return '#9e9e9e'; // Gray for unknown
  }

  getStatusText(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') return 'userManagement.statusActive';
    if (statusLower === 'inactive') return 'userManagement.statusInactive';
    if (statusLower === 'suspended') return 'userManagement.statusSuspended';
    return status;
  }

  getFormattedDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }


  getExhibitorCount(): number {
    if (!this.floorInfo?.exhibitorIds) return 0;
    return this.floorInfo.exhibitorIds.split(',').filter(id => id.trim()).length;
  }


  openChangePasswordDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '450px',
      data: { exhibitorId: this.currentExhibitor.exhibitorId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
      }
    });
  }

  loadExhibitor() {
  if (!this.currentExhibitor?.exhibitorId) return;

  this.exhibitorService.getExhibitorById(this.currentExhibitor.exhibitorId).subscribe({
    next: (data) => {
      this.currentExhibitor = data;
      this.loadDashboardData(); // Refresh products and stats after profile update
    },
    error: (err: any) => {
      console.error('Error loading exhibitor:', err);
    }
  });
}


  openEditProfile() {
    const dialogRef = this.dialog.open(EditProfileComponent, {
      width: '400px',
      data: { exhibitor: this.currentExhibitor }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Updating exhibitor with data:', result);
        
        this.exhibitorService.updateExhibitor(
          this.currentExhibitor.exhibitorId,
          result
        ).subscribe({
          next: (response) => {
            console.log('Update response:', response);
            
            // Check if response contains the updated exhibitor object
            let updatedExhibitor = response;
            if (typeof response === 'object' && response.exhibitorId) {
              // Backend returned the full updated exhibitor object
              updatedExhibitor = response;
            } else {
              // Backend returned only a message, use the form data
              updatedExhibitor = { ...this.currentExhibitor, ...result };
            }
            
            // Update the current exhibitor data
            this.currentExhibitor = updatedExhibitor;
            
            // Refresh exhibitor data from backend to ensure consistency
            this.exhibitorService.getExhibitorById(this.currentExhibitor.exhibitorId).subscribe({
              next: (freshData) => {
                this.currentExhibitor = freshData;
                // Update local storage with fresh data from backend
                const currentUser = this.authService.getCurrentUser();
                if (currentUser) {
                  const updatedUser = {
                    ...currentUser,
                    companyName: freshData.companyName,
                    company_name: freshData.companyName,
                    contactPerson: freshData.contactPerson,
                    name: freshData.contactPerson,
                    email: freshData.email,
                    boothNumber: freshData.boothNumber,
                    booth_number: freshData.boothNumber,
                    floorNumber: freshData.floorNumber,
                    floor_number: freshData.floorNumber,
                    logoUrl: freshData.logoUrl,
                    logo_url: freshData.logoUrl,
                    status: freshData.status
                  };
                  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                }
                
                // Refresh the dashboard data
                this.loadDashboardData();
                this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
              },
              error: (fetchErr) => {
                console.error('Failed to fetch updated exhibitor:', fetchErr);
                // Still update with what we have
                const currentUser = this.authService.getCurrentUser();
                if (currentUser) {
                  const updatedUser = {
                    ...currentUser,
                    companyName: updatedExhibitor.companyName,
                    company_name: updatedExhibitor.companyName,
                    contactPerson: updatedExhibitor.contactPerson,
                    name: updatedExhibitor.contactPerson,
                    email: updatedExhibitor.email,
                    boothNumber: updatedExhibitor.boothNumber,
                    booth_number: updatedExhibitor.boothNumber,
                    floorNumber: updatedExhibitor.floorNumber,
                    floor_number: updatedExhibitor.floorNumber,
                    logoUrl: updatedExhibitor.logoUrl,
                    logo_url: updatedExhibitor.logoUrl,
                    status: updatedExhibitor.status
                  };
                  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                }
                this.loadDashboardData();
                this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
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

  downloadReceipt(): void {
    if (!this.currentExhibitor || !this.currentExhibitor.exhibitorId) {
      this.snackBar.open('Unable to download receipt. Exhibitor information is missing.', 'Close', { duration: 3000 });
      return;
    }

    this.exhibitorService.downloadReceipt(this.currentExhibitor.exhibitorId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exhibitor-receipt-${this.currentExhibitor!.exhibitorId}.png`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed to download exhibitor receipt:', err);
        this.snackBar.open('Failed to download receipt. Please try again later.', 'Close', { duration: 3000 });
      }
    });
  }
}

