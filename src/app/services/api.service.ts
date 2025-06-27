// api.service.ts - ASENDA KOGU FAIL

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
    console.log('=== API VASTUSE ANALÜÜS ===');
    console.log('Täielik API vastus:', response);

    if (!response?.data?.category?.frontPage) {
      console.warn('frontPage andmed puuduvad või on tühjad');
      console.log('Response struktuuri kontroll:', {
        hasData: !!response?.data,
        hasCategory: !!response?.data?.category,
        hasFrontPage: !!response?.data?.category?.frontPage
      });
      return [];
    }

    const frontPageSections = response.data.category.frontPage;
    console.log('FrontPage sektsioonid kokku:', frontPageSections.length);

    // Analüüsi iga sektsiooni
    frontPageSections.forEach((section, index) => {
      console.log(`\n--- SEKTSIOON ${index + 1}: "${section.header}" ---`);
      console.log('Sektsiooni andmed:', {
        header: section.header,
        headerUrl: section.headerUrl,
        highTimeline: section.highTimeline,
        dataLength: section.data?.length || 0,
        hasData: !!section.data,
        isDataArray: Array.isArray(section.data)
      });

      // Analüüsi esimest elementi
      if (section.data && Array.isArray(section.data) && section.data.length > 0) {
        const firstItem = section.data[0];
        console.log('  Esimene element:', {
          id: firstItem.id,
          title: firstItem.title || firstItem.headline,
          type: firstItem.type,
          hasVerticalPhotos: !!firstItem.verticalPhotos,
          verticalPhotosKeys: firstItem.verticalPhotos ? Object.keys(firstItem.verticalPhotos) : [],
          hasImage: !!firstItem.image,
          allKeys: Object.keys(firstItem).slice(0, 10)
        });

        if (firstItem.verticalPhotos) {
          console.log('  VerticalPhotos struktuur:', firstItem.verticalPhotos);
        }
      }
    });

    // Filtreeri sektsioonid
    let filteredSections = frontPageSections.filter(section => {
      const hasValidData = section.data && Array.isArray(section.data) && section.data.length > 0;
      const isHighTimeline = section.highTimeline === true;

      console.log(`\nFiltreering "${section.header}":`, {
        hasValidData,
        isHighTimeline,
        dataLength: section.data?.length || 0,
        willInclude: hasValidData && isHighTimeline
      });

      return hasValidData && isHighTimeline;
    });

    // Kui ei leia ühtegi highTimeline sektsiooni, võta kõik andmetega
    if (filteredSections.length === 0) {
      console.log('\n⚠️ Ei leidnud ühtegi highTimeline: true sektsiooni andmetega!');
      console.log('Võtame kõik sektsioonid, mis sisaldavad andmeid...');

      filteredSections = frontPageSections.filter(section => {
        const hasData = section.data && Array.isArray(section.data) && section.data.length > 0;
        if (hasData) {
          console.log(`  ✅ "${section.header}" - ${section.data.length} elementi`);
        }
        return hasData;
      });
    }

    console.log('\n=== LÕPLIK TULEMUS ===');
    console.log(`Kasutamiseks valitud ${filteredSections.length} sektsiooni:`);
    filteredSections.forEach(section => {
      console.log(`  📁 ${section.header}: ${section.data.length} elementi`);
    });

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

    console.error('API Error Details:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      url: error.url,
      error: error.error
    });

    return throwError(() => new Error(errorMessage));
  }
}
