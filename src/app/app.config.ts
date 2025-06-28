// app.config.ts - LIHTSUSTATUD VERSIOON (routes eemaldatud)

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // provideRouter(routes), // EEMALDATUD - ei ole vaja
    provideHttpClient(
      withInterceptorsFromDi(),
      withFetch() // Use fetch API for better CORS support
    )
  ]
};
