import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface UploadResponse {
  success: boolean;
  message: string;
  fileUrl: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Upload a file to the backend
   * @param file The file to upload
   * @param category The category (logos, products, sponsors, landing, misc)
   * @returns Observable with the upload response containing the file URL
   */
  uploadFile(file: File, category: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(`${this.API_URL}/api/upload/${category}`, formData).pipe(
      map((response: any) => {
        // Normalize URL - ensure it's a full URL if it's relative
        let fileUrl = response.fileUrl;
        if (fileUrl && fileUrl.startsWith('/')) {
          fileUrl = `${this.API_URL}${fileUrl}`;
        }
        return {
          ...response,
          fileUrl: fileUrl
        };
      })
    );
  }

  /**
   * Delete a file from the backend
   * @param fileUrl The URL of the file to delete
   * @returns Observable with the delete response
   */
  deleteFile(fileUrl: string): Observable<any> {
    // Extract path from URL (remove domain if present)
    let path = fileUrl;
    if (path.includes(this.API_URL)) {
      path = path.replace(this.API_URL, '');
    }
    
    return this.http.delete(`${this.API_URL}/api/files${path}`);
  }
}

