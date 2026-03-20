import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserDto {
  id: string;
  userName: string;
  fullName: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.apiUrl);
  }

  createUser(user: any): Observable<boolean> {
    return this.http.post<boolean>(this.apiUrl, user);
  }

  updateUser(id: string, user: any): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/${id}`, { id, ...user });
  }

  deleteUser(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }
}
