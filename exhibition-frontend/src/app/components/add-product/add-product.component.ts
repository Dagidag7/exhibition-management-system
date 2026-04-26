import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ProductService, Product } from '../../services/product.service';
import { ExhibitorService, Exhibitor } from '../../services/exhibitor.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidationService } from '../../services/validation.service';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    ImageUploadComponent,
    TranslatePipe
  ],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  isEditMode: boolean = false;
  productId?: number;
  exhibitors: Exhibitor[] = [];
  /** When true, exhibitor field is hidden - used in exhibitor dashboard where product belongs to current exhibitor only */
  hideExhibitorField = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private exhibitorService: ExhibitorService,
    private validationService: ValidationService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.hideExhibitorField = !!data?.fromExhibitorDashboard;
    const exhibitorId = data?.exhibitorId ?? data?.product?.exhibitorId ?? null;
    const exhibitorValidators = this.hideExhibitorField ? [] : [Validators.required];
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      category: ['', [Validators.maxLength(50)]],
      imageUrl: [''],
      exhibitorId: [exhibitorId, exhibitorValidators]
    });
  }


  ngOnInit(): void {
    if (!this.hideExhibitorField) {
      this.exhibitorService.getExhibitors().subscribe({
        next: (list) => this.exhibitors = list,
        error: () => this.snackBar.open('Could not load exhibitors', 'Close', { duration: 3000 })
      });
    }
    if (this.data && this.data.product) {
      this.isEditMode = true;
      this.productId = this.data.product.productId;
      this.productForm.patchValue({
        name: this.data.product.name,
        description: this.data.product.description || '',
        category: this.data.product.category || '',
        imageUrl: this.data.product.imageUrl || '',
        exhibitorId: this.data.product.exhibitorId
      });
    } else if (this.data?.exhibitorId != null) {
      this.productForm.patchValue({ exhibitorId: this.data.exhibitorId });
    }
  }
  onSubmit(): void {
    if (this.validateForm()) {
      const productData = this.productForm.value;
      
      if (this.isEditMode && this.productId) {
        this.productService.updateProduct(this.productId, { ...productData, productId: this.productId }).subscribe({
          next: (response) => {
            this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.snackBar.open('Error updating product', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.productService.createProduct(productData).subscribe({
          next: (response) => {
            this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.snackBar.open('Error creating product', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  validateForm(): boolean {
    const formValue = this.productForm.value;

    // Validate product name
    const nameValidation = this.validationService.validateCompanyName(formValue.name);
    if (!nameValidation.isValid) {
      this.snackBar.open('Product Name: ' + nameValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate category if provided
    if (formValue.category && formValue.category.trim() !== '') {
      const categoryValidation = this.validationService.validateCompanyName(formValue.category);
      if (!categoryValidation.isValid) {
        this.snackBar.open('Category: ' + categoryValidation.message, 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        return false;
      }
    }

    // Validate image URL if provided
    if (formValue.imageUrl && formValue.imageUrl.trim() !== '') {
      const urlValidation = this.validationService.validateUrl(formValue.imageUrl);
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

  onImageUploaded(url: string) {
    this.productForm.patchValue({ imageUrl: url });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 