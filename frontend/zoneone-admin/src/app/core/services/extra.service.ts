import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Extra } from '../models/extra.model';

@Injectable({
    providedIn: 'root'
})
export class ExtraService {
    private http = inject(HttpClient);
    private apiUrl = 'https://localhost:7157/api/Extras';

    private extrasSubject = new BehaviorSubject<Extra[]>([]);
    public extras$ = this.extrasSubject.asObservable();

    constructor() {
        this.refreshExtras();
    }

    private refreshExtras(): void {
        this.http.get<Extra[]>(this.apiUrl).subscribe(extras => {
            this.extrasSubject.next(extras);
        });
    }

    getExtras(): Observable<Extra[]> {
        return this.extras$;
    }

    addExtra(extra: Omit<Extra, 'id'>): Observable<string> {
        return this.http.post<string>(this.apiUrl, extra).pipe(
            tap(() => this.refreshExtras())
        );
    }

    updateExtra(id: string, updates: Partial<Extra>): Observable<void> {
        const payload = { id, ...updates };
        return this.http.put<void>(`${this.apiUrl}/${id}`, payload).pipe(
            tap(() => this.refreshExtras())
        );
    }

    deleteExtra(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => this.refreshExtras())
        );
    }
}
