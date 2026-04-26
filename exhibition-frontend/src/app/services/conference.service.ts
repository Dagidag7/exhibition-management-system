import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Conference {
  conferenceId: number;
  title: string;
  description: string;
  date: string;
  time: string;
  floorNumber: string;
  speaker: string;
  startTime?: string;
  endTime?: string;
  speakerIds?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConferenceService {
  private apiUrl = 'http://localhost:8888/conferences';

  constructor(private http: HttpClient) {}

  getConferences(): Observable<Conference[]> {
    return this.http.get<Conference[]>(this.apiUrl);
  }

  addConference(conference: Conference): Observable<any> {
    return this.http.post(this.apiUrl, conference);
  }

  updateConference(conference: Conference): Observable<any> {
    return this.http.put(`${this.apiUrl}/${conference.conferenceId}`, conference);
  }

  deleteConference(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getConference(id: number): Observable<Conference> {
    return this.http.get<Conference>(`${this.apiUrl}/${id}`);
  }

  clearSpeakerFromConferences(speakerName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/clear-speaker`, { speakerName });
  }
} 