import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { GameRoom } from '../models/game-room.model';

@Injectable({
    providedIn: 'root'
})
export class GameRoomService {
    private http = inject(HttpClient);
    private apiUrl = 'https://localhost:7157/api/GameRooms';

    private roomsSubject = new BehaviorSubject<GameRoom[]>([]);
    public rooms$ = this.roomsSubject.asObservable();

    constructor() {
        this.refreshRooms();
    }

    private refreshRooms(): void {
        this.http.get<GameRoom[]>(this.apiUrl).subscribe(rooms => {
            this.roomsSubject.next(rooms);
        });
    }

    getRooms(): Observable<GameRoom[]> {
        return this.rooms$;
    }

    getRoomById(id: string): Observable<GameRoom> {
        return this.http.get<GameRoom>(`${this.apiUrl}/${id}`);
    }

    addRoom(room: Omit<GameRoom, 'id' | 'gameCategoryName'>): Observable<string> {
        return this.http.post<string>(this.apiUrl, room).pipe(
            tap(() => this.refreshRooms())
        );
    }

    updateRoom(id: string, updates: Partial<GameRoom>): Observable<void> {
        const payload = { id, ...updates };
        return this.http.put<void>(`${this.apiUrl}/${id}`, payload).pipe(
            tap(() => this.refreshRooms())
        );
    }

    deleteRoom(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => this.refreshRooms())
        );
    }
}
