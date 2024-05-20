import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  API: string = 'https://valorant-api.com/v1';
  constructor(private http: HttpClient) {}
  getAgents(): Observable<any> {
    return this.http.get<any>(`${this.API}/agents`);
  }
}
