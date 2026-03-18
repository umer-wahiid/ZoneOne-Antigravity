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

    checkoutBooking(payload: { customerName: string, customerPhone: string, paymentStatus: string, paidAmount: number, items: any[], extras?: any[] }): Observable<{ id: string }> {
        return this.http.post<{ id: string }>(`${this.apiUrl}/checkout`, payload);
    }

    updateBooking(id: string, payload: { id: string, customerName: string, customerPhone: string, paymentStatus: string, paidAmount: number, items: any[], extras?: any[] }): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
    }

    getBookings(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    deleteBooking(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
