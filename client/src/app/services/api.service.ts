import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly BASE_URL = 'https://valorant-api.com/v1';

  constructor(private http: HttpClient) {}

  getMaps(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/maps`);
  }

  getAgents(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/agents?isPlayableCharacter=true&language=pt-BR`);
  }
}
