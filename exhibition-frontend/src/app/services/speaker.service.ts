import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Speaker {
  speakerId: number;
  name: string;
  bio: string;
  expertise: string;
  email: string;
  phone: string;
  organization: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpeakerService {
  private apiUrl = `${environment.apiUrl}/speakers`;

  constructor(private http: HttpClient) {}

  getSpeakers(): Observable<Speaker[]> {
    return this.http.get<Speaker[]>(this.apiUrl);
  }

  addSpeaker(speaker: Speaker): Observable<any> {
    return this.http.post(this.apiUrl, speaker);
  }

  updateSpeaker(speaker: Speaker): Observable<any> {
    return this.http.put(`${this.apiUrl}/${speaker.speakerId}`, speaker);
  }

  deleteSpeaker(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getSpeaker(id: number): Observable<Speaker> {
    return this.http.get<Speaker>(`${this.apiUrl}/${id}`);
  }
} 