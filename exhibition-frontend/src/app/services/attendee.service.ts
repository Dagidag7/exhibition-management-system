import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Attendee {
  attendeeId?: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  registrationDate?: string;
  status?: string;
  profilePhoto?: string;
  paymentFee?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AttendeeService {
  private apiUrl = `${environment.apiUrl}/attendees`;

  constructor(private http: HttpClient) {}

  registerAttendee(attendee: Attendee): Observable<Attendee> {
    return this.http.post<Attendee>(this.apiUrl, attendee);
  }

  getAttendees(): Observable<Attendee[]> {
    return this.http.get<Attendee[]>(this.apiUrl);
  }

  getAttendeeById(id: number): Observable<Attendee> {
    return this.http.get<Attendee>(`${this.apiUrl}/${id}`);
  }

  updateAttendee(id: number, attendee: Attendee): Observable<Attendee> {
    return this.http.put<Attendee>(`${this.apiUrl}/${id}`, attendee);
  }

  deleteAttendee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  createPayment(amount: number) {
    return this.http.post(`${this.apiUrl}/api/payment` , { amount });
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email });
  }

  changePassword(id: number, password: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/password`, { password });
  }

  updatePaymentFee(email: string, paymentFee: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/payment-fee`, { email, paymentFee });
  }

  downloadReceipt(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/receipt`, { responseType: 'blob' });
  }

  checkEmailAvailability(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-email`, { email });
  }

  checkPhoneAvailability(phone: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-phone`, { phone });
  }
} 