import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements OnInit {
  @Input() currentImageUrl: string | null = null;
  @Input() category: string = 'misc';
  @Input() label: string = 'Image';
  @Input() required: boolean = false;

  @Output() imageUrlChange = new EventEmitter<string>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  uploadError: string | null = null;
  uploadedUrl: string | null = null;

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];

  constructor(
    private fileUploadService: FileUploadService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Set initial preview if current image URL exists
    if (this.currentImageUrl) {
      this.uploadedUrl = this.currentImageUrl;
      this.previewUrl = this.normalizeUrl(this.currentImageUrl);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.handleFileSelection(file);
    }
  }

  handleFileSelection(file: File): void {
    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.uploadError = 'Please select a valid image file (JPEG, PNG, GIF, WebP, BMP, or SVG)';
      this.selectedFile = null;
      this.previewUrl = null;
      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.uploadError = 'File size must be less than 10MB';
      this.selectedFile = null;
      this.previewUrl = null;
      return;
    }

    this.selectedFile = file;
    this.uploadError = null;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Auto-upload after selection
    this.uploadFile();
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.uploadError = 'No file selected';
      return;
    }

    this.uploading = true;
    this.uploadError = null;

    this.fileUploadService.uploadFile(this.selectedFile, this.category).subscribe({
      next: (response) => {
        this.uploadedUrl = response.fileUrl;
        this.previewUrl = this.normalizeUrl(response.fileUrl);
        this.imageUrlChange.emit(response.fileUrl);
        this.uploading = false;
        this.selectedFile = null;
        this.snackBar.open('Image uploaded successfully', 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        this.uploadError = error.error?.error || 'Upload failed. Please try again.';
        this.uploading = false;
        console.error('Upload error:', error);
      }
    });
  }

  removeImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.uploadedUrl = null;
    this.uploadError = null;
    this.imageUrlChange.emit('');
    
    // Reset file input
    const fileInput = document.getElementById(`file-input-${this.category}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onBrowseClick(): void {
    const fileInput = document.getElementById(`file-input-${this.category}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  normalizeUrl(url: string): string {
    if (!url) return '';
    // If URL is already absolute (starts with http), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If URL is relative (starts with /), prepend backend URL
    if (url.startsWith('/')) {
      return `http://localhost:8888${url}`;
    }
    // Otherwise, assume it's a relative path from backend
    return `http://localhost:8888/${url}`;
  }

  getDisplayImage(): string | null {
    if (this.previewUrl) {
      return this.previewUrl;
    }
    return null;
  }
}




