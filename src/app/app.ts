// app.ts - TÄIELIK FAIL

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';
import { ContentSectionComponent } from './components/content-section/content-section.component';
import { FrontPageSection, ContentItem } from './models/jupiter.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ContentSectionComponent], // ContentSectionComponent on siin
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

        // Kontrollime andmeid enne määramist
        if (sections && Array.isArray(sections) && sections.length > 0) {
          this.contentSections = sections;
          console.log('🎯 contentSections määratud:', this.contentSections.length);

          // Kontrollime esimese sektsiooni
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

  onItemClick(item: ContentItem): void {
    console.log('🖱️ Kliki sisu:', item);

    if (item.id) {
      // Genereeri õige URL formaat
      const title = item.heading || item.headline || item.title || '';
      const urlSlug = this.generateUrlSlug(title);

      // Jupiter ERR õige URL formaat: https://jupiter.err.ee/[ID]/[slug]
      const jupiterUrl = `https://jupiter.err.ee/${item.id}/${urlSlug}`;

      console.log('🔗 Avan URL:', jupiterUrl);
      console.log('📝 Genereeritud slug:', urlSlug);
      window.open(jupiterUrl, '_blank');
    } else {
      console.warn('⚠️ Elemendil puudub ID, ei saa avada');
    }
  }

  // URL slug genereerimiseks
  private generateUrlSlug(title: string): string {
    if (!title) return '';

    return title
      .toLowerCase()
      .trim()
      // Asenda eesti tähed
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/õ/g, 'o')
      // Eemalda kõik mis pole tähed, numbrid või tühikud
      .replace(/[^a-z0-9\s-]/g, '')
      // Asenda tühikud ja mitmed sidumärgid ühe sidumärgiga
      .replace(/[\s-]+/g, '-')
      // Eemalda sidumärgid algusest ja lõpust
      .replace(/^-+|-+$/g, '');
  }

  retryLoad(): void {
    console.log('🔄 Retry load');
    this.loadContent();
  }

  // "Kuva kõik" functionality
  toggleShowAll(section: FrontPageSection): void {
    this.sectionShowAllState[section.header] = !this.sectionShowAllState[section.header];
    console.log(`${section.header}: showAll = ${this.sectionShowAllState[section.header]}`);
  }

  getSectionShowAll(section: FrontPageSection): boolean {
    return this.sectionShowAllState[section.header] || false;
  }

  getVisibleItems(section: FrontPageSection): ContentItem[] {
    if (!section?.data) return [];

    const showAll = this.getSectionShowAll(section);
    if (showAll) {
      return section.data;
    }

    return section.data.slice(0, 10); // Näita ainult 10 elementi
  }

  // TrackBy functions for better performance
  trackBySection(index: number, section: FrontPageSection): string {
    return section.header + '_' + index;
  }

  trackByItem(index: number, item: ContentItem): string {
    return item.id + '_' + index;
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

  // Test method to check if sections have data
  hasValidSections(): boolean {
    return this.contentSections &&
      Array.isArray(this.contentSections) &&
      this.contentSections.length > 0;
  }

  // Test method to get first section for debugging
  getFirstSection(): FrontPageSection | null {
    return this.hasValidSections() ? this.contentSections[0] : null;
  }

  // Test method to get first few items from first section
  getFirstSectionItems(count: number = 3): ContentItem[] {
    const firstSection = this.getFirstSection();
    if (firstSection && firstSection.data && Array.isArray(firstSection.data)) {
      return firstSection.data.slice(0, count);
    }
    return [];
  }
}
