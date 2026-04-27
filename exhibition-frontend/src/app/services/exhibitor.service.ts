import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Exhibitor {
  id?: number;          
  exhibitorId: number; 
  companyName: string;
  contactPerson: string;
  email: string;
  boothNumber: string;
  productIds?: number;
  logoUrl: string;
  floorNumber?: string;
  status?: string;
  passwordChanged?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExhibitorService {
  private apiUrl = `${environment.apiUrl}/exhibitors`;

  constructor(private http: HttpClient) {}

  addExhibitor(exhibitor: Exhibitor): Observable<any> {
    return this.http.post(this.apiUrl, exhibitor);
  }

  getExhibitors(): Observable<Exhibitor[]> {
    return this.http.get<Exhibitor[]>(this.apiUrl);
  }

  getExhibitorById(id: number): Observable<Exhibitor> {
    return this.http.get<Exhibitor>(`${this.apiUrl}/${id}`);
  }

  updateExhibitor(id: number, data: any): Observable<any> {
    console.log("data....",data)
  return this.http.put(`${this.apiUrl}/${id}`, data);
}
  deleteExhibitor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  changePassword(id: number, password: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/password`, { password });
  }

  checkExhibitorStatus(id: number): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/${id}/status`);
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email });
  }

  downloadReceipt(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/receipt`, { responseType: 'blob' });
  }

  sendPaymentRequest(email: string, companyName: string, paymentLink: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-payment-request`, { email, companyName, paymentLink });
  }
}
