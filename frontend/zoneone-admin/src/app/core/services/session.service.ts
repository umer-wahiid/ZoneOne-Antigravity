import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionDto } from '../models/session.model';

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private http = inject(HttpClient);
    private apiUrl = 'https://localhost:7157/api/Bookings';

    calculateSession(payload: { gameRoomId: string, startTime: string, endTime: string, numberOfPersons: number }): Observable<{ amount: number }> {
        return this.http.post<{ amount: number }>(`${this.apiUrl}/calculate`, payload);
    }

    checkoutBooking(payload: { customerName: string, customerPhone: string, paymentStatus: string, items: any[] }): Observable<{ id: string }> {
        return this.http.post<{ id: string }>(`${this.apiUrl}/checkout`, payload);
    }
}
