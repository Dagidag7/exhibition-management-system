import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Sponsor {
  sponsorId?: number;
  name: string;
  contactPerson: string;
  email?: string;
  contributionAmount: number;
  benefits: string;
  logoUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class SponsorService {
  private apiUrl = `${environment.apiUrl}/sponsors`;

  constructor(private http: HttpClient) {}

  getSponsors(): Observable<Sponsor[]> {
    return this.http.get<Sponsor[]>(this.apiUrl);
  }

  getSponsorById(id: number): Observable<Sponsor> {
    return this.http.get<Sponsor>(`${this.apiUrl}/${id}`);
  }

  createSponsor(sponsor: Omit<Sponsor, 'sponsorId'>): Observable<Sponsor> {
    return this.http.post<Sponsor>(this.apiUrl, sponsor);
  }

  updateSponsor(id: number, sponsor: Sponsor): Observable<Sponsor> {
    return this.http.put<Sponsor>(`${this.apiUrl}/${id}`, sponsor);
  }

  deleteSponsor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  createPayment(amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/payment`, { amount });
  }
}