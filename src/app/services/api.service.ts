import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { ApiResponse, FrontPageSection } from '../models/jupiter.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = 'https://services.err.ee/api/v2/category/getByUrl?url=video&domain=jupiter.err.ee';

  constructor(private http: HttpClient) {}

  getJupiterContent(): Observable<FrontPageSection[]> {
    return this.http.get<ApiResponse>(this.API_URL)
      .pipe(
        timeout(10000),
        retry(2),
        map(response => this.processApiResponse(response)),
        catchError(this.handleError.bind(this))
      );
  }

  private processApiResponse(response: ApiResponse): FrontPageSection[] {

    if (!response?.data?.category?.frontPage) {
      console.warn('frontPage andmed puuduvad või on tühjad');
      return [];
    }

    const frontPageSections = response.data.category.frontPage;

    let filteredSections = frontPageSections.filter(section => {
      return section.data && Array.isArray(section.data) && section.data.length > 0;
    });


    const highTimelineSections = filteredSections.filter(section => section.highTimeline);

    if (highTimelineSections.length > 0) {
      return highTimelineSections;
    }

    if (filteredSections.length === 0) {
      console.warn('Ei leidnud ühtegi sektsiooni andmetega!');
      return [];
    }

    return filteredSections;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Viga andmete laadimisel';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Ühenduse viga: ${error.error.message}`;
    } else if (error.status === 0) {
      errorMessage = 'Ühendus serveriga ebaõnnestus. Kontrollige internetiühendust või CORS seadeid.';
    } else if (error.status >= 400 && error.status < 500) {
      errorMessage = `Kliendi viga (${error.status}): ${error.message}`;
    } else if (error.status >= 500) {
      errorMessage = `Serveri viga (${error.status}): ${error.message}`;
    } else {
      errorMessage = `Tundmatu viga: ${error.message}`;
    }

    console.error('API Error:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      url: error.url
    });

    return throwError(() => new Error(errorMessage));
  }
}
