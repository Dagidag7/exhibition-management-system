import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExhibitorService } from './exhibitor.service';
import { ConferenceService } from './conference.service';

export interface Floor {
  floorId: number;
  floorNumber: number;
  layoutImage?: string;
  exhibitorIds?: string;
  conferenceIds?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FloorService {
  private apiUrl = 'http://localhost:8888/floors';

  constructor(
    private http: HttpClient,
    private exhibitorService: ExhibitorService,
    private conferenceService: ConferenceService
  ) {}

  getFloors(): Observable<Floor[]> {
    return this.http.get<Floor[]>(this.apiUrl);
  }

  getFloorById(id: number): Observable<Floor> {
    return this.http.get<Floor>(`${this.apiUrl}/${id}`);
  }

  createFloor(floor: Omit<Floor, 'floorId'>): Observable<Floor> {
    return this.http.post<Floor>(this.apiUrl, floor);
  }

  updateFloor(id: number, floor: Floor): Observable<Floor> {
    return this.http.put<Floor>(`${this.apiUrl}/${id}`, floor);
  }

  deleteFloor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Validation methods for floor management
  validateFloorCapacity(floorNumber: number, excludeExhibitorId?: number): Observable<{isValid: boolean, message: string, exhibitorCount: number}> {
    return this.exhibitorService.getExhibitors().pipe(
      map(exhibitors => {
        const floorExhibitors = exhibitors.filter(exhibitor => 
          exhibitor.floorNumber === floorNumber.toString() && 
          exhibitor.exhibitorId !== excludeExhibitorId
        );
        
        if (floorExhibitors.length >= 10) {
          return {
            isValid: false,
            message: `Floor ${floorNumber} already has ${floorExhibitors.length} exhibitors. Maximum 10 exhibitors allowed per floor.`,
            exhibitorCount: floorExhibitors.length
          };
        }
        
        return {
          isValid: true,
          message: `Floor ${floorNumber} has ${floorExhibitors.length} exhibitors. Can add ${10 - floorExhibitors.length} more.`,
          exhibitorCount: floorExhibitors.length
        };
      })
    );
  }

  validateConferenceFloorAvailability(floorNumber: number, excludeConferenceId?: number): Observable<{isValid: boolean, message: string, conferenceCount: number}> {
    return this.conferenceService.getConferences().pipe(
      map(conferences => {
        // Normalize floor numbers for comparison (remove spaces, convert to lowercase)
        const normalizedInputFloor = floorNumber.toString().toLowerCase().replace(/\s+/g, '');
        
        const floorConferences = conferences.filter(conference => {
          const normalizedConferenceFloor = conference.floorNumber?.toLowerCase().replace(/\s+/g, '') || '';
          return normalizedConferenceFloor === normalizedInputFloor && 
                 conference.conferenceId !== excludeConferenceId;
        });
        
        if (floorConferences.length >= 1) {
          return {
            isValid: false,
            message: `Floor ${floorNumber} already has a conference scheduled. Only one conference allowed per floor.`,
            conferenceCount: floorConferences.length
          };
        }
        
        return {
          isValid: true,
          message: `Floor ${floorNumber} is available for conference scheduling.`,
          conferenceCount: floorConferences.length
        };
      })
    );
  }

  getFloorOccupancy(floorNumber: number): Observable<{exhibitorCount: number, conferenceCount: number, exhibitors: any[], conferences: any[]}> {
    return forkJoin({
      exhibitors: this.exhibitorService.getExhibitors(),
      conferences: this.conferenceService.getConferences()
    }).pipe(
      map(data => {
        const floorExhibitors = data.exhibitors.filter(exhibitor => 
          exhibitor.floorNumber === floorNumber.toString()
        );
        const floorConferences = data.conferences.filter(conference => 
          conference.floorNumber === floorNumber.toString()
        );
        
        return {
          exhibitorCount: floorExhibitors.length,
          conferenceCount: floorConferences.length,
          exhibitors: floorExhibitors,
          conferences: floorConferences
        };
      })
    );
  }
} 