import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionDto } from '../models/session.model';

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private http = inject(HttpClient);
    private apiUrl = 'https://localhost:7157/api/Sessions';

    calculateSession(payload: { gameRoomId: string, startTime: string, endTime: string, numberOfPersons: number }): Observable<{ amount: number }> {
        return this.http.post<{ amount: number }>(`${this.apiUrl}/calculate`, payload);
    }

    startSession(payload: { gameRoomId: string, gameCategoryId: string, startTime: string, endTime: string, numberOfPersons: number }): Observable<{ id: string }> {
        return this.http.post<{ id: string }>(`${this.apiUrl}/start`, payload);
    }

    getActiveSessions(): Observable<SessionDto[]> {
        return this.http.get<SessionDto[]>(`${this.apiUrl}/active`);
    }
}
