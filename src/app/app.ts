// app.ts - LIHTSUSTATUD VERSIOON (routes eemaldatud)

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service';
import { ContentSectionComponent } from './components/content-section/content-section.component';
import { FrontPageSection, ContentItem } from './models/jupiter.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ContentSectionComponent], // RouterOutlet eemaldatud
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  title = 'Jupiter ERR';
  contentSections: FrontPageSection[] = [];
  loading = false;
  error: string | null = null;

  constructor(private apiService: ApiService) {
    console.log('🚀 App constructor käivitub');
  }

  ngOnInit(): void {
    console.log('🔄 ngOnInit käivitub');
    this.loadContent();
  }

  loadContent(): void {
    console.log('📡 loadContent käivitub');
    this.loading = true;
    this.error = null;

    this.apiService.getJupiterContent().subscribe({
      next: (sections) => {
        console.log('✅ Laetud sektsioonid:', sections);
        console.log('📊 Sektsioonide arv:', sections.length);

        if (sections && Array.isArray(sections) && sections.length > 0) {
          this.contentSections = sections;
          console.log('🎯 contentSections määratud:', this.contentSections.length);

          if (this.contentSections[0]) {
            console.log('🔍 Esimene sektsioon:', {
              header: this.contentSections[0].header,
              dataLength: this.contentSections[0].data?.length,
              firstItem: this.contentSections[0].data?.[0]
            });
          }
        } else {
          console.warn('⚠️ Sektsioonid on tühjad või vale formaadis');
          this.contentSections = [];
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Viga andmete laadimisel:', err);
        this.error = err.message || 'Tundmatu viga';
        this.loading = false;
        this.contentSections = [];
      }
    });
  }

  retryLoad(): void {
    console.log('🔄 Retry load');
    this.loadContent();
  }

  // TrackBy functions for better performance
  trackBySection(index: number, section: FrontPageSection): string {
    return section.header + '_' + index;
  }

  // Debug helper methods
  getDebugInfo(): any {
    return {
      loading: this.loading,
      error: this.error,
      sectionsCount: this.contentSections.length,
      sectionsType: typeof this.contentSections,
      isArray: Array.isArray(this.contentSections),
      firstSection: this.contentSections[0] ? {
        header: this.contentSections[0].header,
        dataLength: this.contentSections[0].data?.length
      } : null
    };
  }

  hasValidSections(): boolean {
    return this.contentSections &&
      Array.isArray(this.contentSections) &&
      this.contentSections.length > 0;
  }

  // Statistics methods for UI
  getTotalItemsCount(): number {
    return this.contentSections.reduce((total, section) => {
      return total + (section.data?.length || 0);
    }, 0);
  }

  getActiveAutoplayCount(): number {
    // Return number of sections that have more than 6 items (will have autoplay)
    return this.contentSections.filter(section =>
      section.data && section.data.length > 6
    ).length;
  }
}
