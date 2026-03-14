import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { GameCategory } from '../models/game-category.model';

@Injectable({
    providedIn: 'root'
})
export class GameCategoryService {
    private http = inject(HttpClient);
    private apiUrl = 'https://localhost:7157/api/GameCategories';

    private categoriesSubject = new BehaviorSubject<GameCategory[]>([]);
    public categories$ = this.categoriesSubject.asObservable();

    constructor() {
        this.refreshCategories();
    }

    private refreshCategories(): void {
        this.http.get<GameCategory[]>(this.apiUrl).subscribe(categories => {
            this.categoriesSubject.next(categories);
        });
    }

    getCategories(): Observable<GameCategory[]> {
        return this.categories$;
    }

    getCategoryById(id: string): Observable<GameCategory> {
        return this.http.get<GameCategory>(`${this.apiUrl}/${id}`);
    }

    addCategory(category: Omit<GameCategory, 'id'>): Observable<string> {
        return this.http.post<string>(this.apiUrl, category).pipe(
            tap(() => this.refreshCategories())
        );
    }

    updateCategory(id: string, updates: Partial<GameCategory>): Observable<void> {
        const payload = { id, ...updates };
        return this.http.put<void>(`${this.apiUrl}/${id}`, payload).pipe(
            tap(() => this.refreshCategories())
        );
    }

    deleteCategory(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => this.refreshCategories())
        );
    }
}
