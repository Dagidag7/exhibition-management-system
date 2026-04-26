import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { SponsorService } from '../../services/sponsor.service';
import { ExhibitorService } from '../../services/exhibitor.service';
import { ProductService } from '../../services/product.service';
import { ConferenceService } from '../../services/conference.service';
import { RegisterAttendeeComponent } from '../../components/register-attendee/register-attendee.component';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    TranslatePipe
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  sponsors: any[] = [];
  exhibitors: any[] = [];
  products: any[] = [];
  conferences: any[] = [];
  currentYear = new Date().getFullYear();
  private conferenceRefreshInterval: any;
  currentLanguage = 'en';
  languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹' }
  ];

  constructor(
    private sponsorService: SponsorService,
    private exhibitorService: ExhibitorService,
    private productService: ProductService,
    private conferenceService: ConferenceService,
    private dialog: MatDialog,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadSponsors();
    this.loadExhibitors();
    this.loadProducts();
    this.loadConferences();
    
    this.conferenceRefreshInterval = setInterval(() => {
      this.loadConferences();
    }, 60000);
    
    this.translationService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
    this.currentLanguage = this.translationService.getCurrentLanguage();
  }

  ngOnDestroy(): void {
    if (this.conferenceRefreshInterval) {
      clearInterval(this.conferenceRefreshInterval);
    }
  }

  onLanguageChange(language: any): void {
    console.log('Language changed to:', language);
    if (typeof language === 'string') {
      this.currentLanguage = language;
      this.translationService.setLanguage(language);
    }
  }

  loadSponsors(): void {
    this.sponsorService.getSponsors().subscribe({
      next: (sponsors) => {
        // Normalize sponsor logo URLs
        this.sponsors = (sponsors || []).map(sponsor => {
          let logoUrl = sponsor.logoUrl;
          if (!logoUrl || logoUrl === 'null' || logoUrl === 'undefined' || logoUrl.trim() === '') {
            logoUrl = '';
          } else {
            // Ensure logoUrl is properly formatted - if it's a relative path, make it absolute
            logoUrl = logoUrl.trim();
            if (logoUrl && !logoUrl.startsWith('http') && !logoUrl.startsWith('/')) {
              logoUrl = 'http://localhost:8888/' + logoUrl;
            } else if (logoUrl && logoUrl.startsWith('/') && !logoUrl.startsWith('http')) {
              logoUrl = 'http://localhost:8888' + logoUrl;
            }
          }
          return {
            ...sponsor,
            logoUrl: logoUrl
          };
        });
        console.log('Normalized sponsors with logos:', this.sponsors.map(s => ({ name: s.name, logoUrl: s.logoUrl })));
      },
      error: (error) => {
        console.error('Error loading sponsors:', error);
      }
    });
  }


  onImageError(event: any, exhibitor: any): void {
    exhibitor.imageError = true;
    console.log(`Failed to load image for ${exhibitor.companyName}:`, exhibitor.logoUrl);
  }

  onImageLoad(event: any, exhibitor: any): void {
    exhibitor.imageError = false;
    console.log(`Successfully loaded image for ${exhibitor.companyName}`);
  }

   loadExhibitors(): void {
    this.exhibitorService.getExhibitors().subscribe({
      next: (exhibitors) => {
        console.log('Loaded exhibitors:', exhibitors);
        // Filter to only show active exhibitors (case-insensitive: 'active', 'ACTIVE', etc.)
        this.exhibitors = exhibitors
          .filter(exhibitor => (exhibitor.status || '').toLowerCase() === 'active')
          .map(exhibitor => ({
            ...exhibitor,
            imageError: false
          }));
      },
      error: (error) => {
        console.error('Error loading exhibitors:', error);
      }
    });
   }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (allProducts) => {
        this.exhibitorService.getExhibitors().subscribe({
          next: (exhibitors) => {
            const activeExhibitorIds = exhibitors
              .filter(exhibitor => exhibitor.status === 'active')
              .map(exhibitor => exhibitor.exhibitorId);
            
            // Filter products: only show products from active exhibitors and products that are active (if status field exists)
            // Also normalize image URLs
            this.products = (allProducts || []).filter(product => 
              activeExhibitorIds.includes(product.exhibitorId) &&
              (!product.status || (product.status || '').toLowerCase() === 'active')
            ).map(product => {
              // Normalize imageUrl
              let imageUrl = product.imageUrl;
              if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || imageUrl.trim() === '') {
                imageUrl = '';
              } else {
                // Ensure imageUrl is properly formatted - if it's a relative path, make it absolute
                imageUrl = imageUrl.trim();
                if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                  imageUrl = 'http://localhost:8888/' + imageUrl;
                } else if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
                  imageUrl = 'http://localhost:8888' + imageUrl;
                }
              }
              return {
                ...product,
                imageUrl: imageUrl
              };
            });
            console.log('Normalized products with images:', this.products.map(p => ({ name: p.name, imageUrl: p.imageUrl })));
          },
          error: (error) => {
            console.error('Error loading exhibitors for product filtering:', error);
            // Fallback: show all active products with normalized URLs
            this.products = (allProducts || []).filter(product => 
              !product.status || (product.status || '').toLowerCase() === 'active'
            ).map(product => {
              let imageUrl = product.imageUrl;
              if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || imageUrl.trim() === '') {
                imageUrl = '';
              } else {
                imageUrl = imageUrl.trim();
                if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                  imageUrl = 'http://localhost:8888/' + imageUrl;
                } else if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
                  imageUrl = 'http://localhost:8888' + imageUrl;
                }
              }
              return {
                ...product,
                imageUrl: imageUrl
              };
            });
          }
        });
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.products = [];
      }
    });
  }

  loadConferences(): void {
    this.conferenceService.getConferences().subscribe({
      next: (conferences) => {
        this.conferences = conferences;
      },
      error: (error) => {
        console.error('Error loading conferences:', error);
      }
    });
  }

  getFormattedDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  }

  getFormattedTime(timeString: string): string {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  }

  openRegisterDialog(): void {
    const dialogRef = this.dialog.open(RegisterAttendeeComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Registration successful');
      }
    });
  }



  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
