// src/app/app.ts - LÕPLIK PARANDATUD VERSIOON

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service';
import { ContentSectionComponent } from './components/content-section/content-section.component';
import { ContentItemComponent } from './components/content-item/content-item.component';
import { FrontPageSection, ContentItem } from './models/jupiter.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ContentSectionComponent, ContentItemComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Jupiter ERR';
  contentSections: FrontPageSection[] = [];
  favorites: ContentItem[] = [];

  // Lemmikute karusell seaded - 6 KAARTI nagu teistes kategooriates
  showAllFavorites = false;
  favoritesItemsPerPage = 6; // OLULINE: 6 mitte 4!
  currentFavoritePage = 0;
  maxFavoritePages = 0;
  favoritesTranslateX = 0;
  favoritesItemWidth = 220; // 200px kaart + 20px gap = 220px PER KAART

  // AUTOMAATNE KARUSELL
  private autoScrollInterval: any = null;
  private autoScrollEnabled = true;
  autoScrollDelay = 10000; // 10 sekundit

  loading = false;
  error: string | null = null;

  constructor(private apiService: ApiService) {
    console.log('🚀 App constructor käivitub');
  }

  ngOnInit(): void {
    console.log('🔄 ngOnInit käivitub');
    this.loadContent();
    this.loadFavorites();
  }

  ngOnDestroy(): void {
    // Puhasta automaatne karusell
    this.stopAutoScroll();
  }

  loadContent(): void {
    console.log('📡 loadContent käivitub');
    this.loading = true;
    this.error = null;

    this.apiService.getJupiterContent().subscribe({
      next: (sections: FrontPageSection[]) => {
        console.log('✅ Laetud sektsioonid:', sections);
        console.log('📊 Sektsioonide arv:', sections.length);

        if (sections && Array.isArray(sections) && sections.length > 0) {
          this.contentSections = sections;
          console.log('🎯 contentSections määratud:', this.contentSections.length);
        } else {
          console.warn('⚠️ Sektsioonid on tühjad või vale formaadis');
          this.contentSections = [];
        }

        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Viga andmete laadimisel:', err);
        this.error = err.message || 'Tundmatu viga';
        this.loading = false;
        this.contentSections = [];
      }
    });
  }

  // LEMMIKUTE FUNKTSIOONID
  loadFavorites(): void {
    try {
      const stored = localStorage.getItem('jupiter_favorites');
      this.favorites = stored ? JSON.parse(stored) : [];
      console.log('📚 Laetud lemmikud:', this.favorites.length);
      this.calculateFavoritePages();

      // Käivita automaatne karusell kui on mitu lehte
      if (this.hasMultipleFavoritePages() && !this.showAllFavorites) {
        this.startAutoScroll();
      }
    } catch (error) {
      console.error('Viga lemmikute laadimisel:', error);
      this.favorites = [];
    }
  }

  // LEMMIKUTE KARUSELL LOOGIKA (sama nagu content-section komponendis)
  calculateFavoritePages(): void {
    if (!this.favorites || this.favorites.length === 0) {
      this.maxFavoritePages = 0;
      return;
    }
    this.maxFavoritePages = Math.ceil(this.favorites.length / this.favoritesItemsPerPage);
    console.log('📊 Arvutatakse lemmikute lehed:', {
      totalFavorites: this.favorites.length,
      itemsPerPage: this.favoritesItemsPerPage,
      maxPages: this.maxFavoritePages
    });
  }

  hasMultipleFavoritePages(): boolean {
    const result = this.maxFavoritePages > 1;
    console.log('🔢 Kas lemmikutel on mitu lehte?', {
      maxPages: this.maxFavoritePages,
      hasMultiple: result
    });
    return result;
  }

  scrollFavoritesLeft(): void {
    if (this.currentFavoritePage > 0) {
      this.currentFavoritePage--;
      this.updateFavoritesTransform();
      console.log('◀️ Lemmikud skrollin vasakule, leht:', this.currentFavoritePage);
    }

    // Restart auto scroll after manual interaction
    this.restartAutoScroll();
  }

  scrollFavoritesRight(): void {
    if (this.currentFavoritePage < this.maxFavoritePages - 1) {
      this.currentFavoritePage++;
      this.updateFavoritesTransform();
      console.log('▶️ Lemmikud skrollin paremale, leht:', this.currentFavoritePage);
    } else {
      console.log('🚫 Lemmikud - ei saa enam paremale, jõudsin lõppu');
    }

    // Restart auto scroll after manual interaction
    this.restartAutoScroll();
  }

  updateFavoritesTransform(): void {
    // PARANDATUD ARVUTUS - lehe suurus * kaartide arv lehel * kaardi laius
    this.favoritesTranslateX = -(this.currentFavoritePage * this.favoritesItemsPerPage * this.favoritesItemWidth);

    console.log('📊 Lemmikute karusell liigub:', {
      currentPage: this.currentFavoritePage,
      itemsPerPage: this.favoritesItemsPerPage,
      itemWidth: this.favoritesItemWidth,
      translateX: this.favoritesTranslateX,
      calculation: `-(${this.currentFavoritePage} * ${this.favoritesItemsPerPage} * ${this.favoritesItemWidth}) = ${this.favoritesTranslateX}`
    });

    // DEBUG: force element update
    setTimeout(() => {
      console.log('🔍 DOM element transform:',
        document.querySelector('.content-section .carousel-track')?.getAttribute('style')
      );
    }, 100);
  }

  toggleShowAllFavorites(): void {
    this.showAllFavorites = !this.showAllFavorites;

    if (!this.showAllFavorites) {
      this.currentFavoritePage = 0;
      this.favoritesTranslateX = 0;
      // Käivita automaatne karusell kui läheme tagasi karusell režiimi
      if (this.hasMultipleFavoritePages()) {
        this.startAutoScroll();
      }
    } else {
      // Peata automaatne karusell kui läheme "kuva kõik" režiimi
      this.stopAutoScroll();
    }

    console.log(`Lemmikud: showAll = ${this.showAllFavorites}`);
  }

  onFavoriteToggle(event: {item: ContentItem, isFavorite: boolean}): void {
    console.log('💖 Lemmik muudetud:', event);
    this.loadFavorites(); // Uuenda lemmikute nimekirja ja arvuta lehed uuesti
  }

  removeFavorite(event: Event, item: ContentItem): void {
    event.stopPropagation(); // Väldi kaardi kliki

    try {
      const favorites = JSON.parse(localStorage.getItem('jupiter_favorites') || '[]');
      const updatedFavorites = favorites.filter((fav: ContentItem) => fav.id !== item.id);
      localStorage.setItem('jupiter_favorites', JSON.stringify(updatedFavorites));
      this.loadFavorites();
      console.log('💔 Eemaldatud lemmikutest:', this.getFavoriteTitle(item));
    } catch (error) {
      console.error('Viga lemmiku eemaldamisel:', error);
    }
  }

  clearAllFavorites(): void {
    if (confirm('Kas oled kindel, et tahad kõik lemmikud kustutada?')) {
      localStorage.removeItem('jupiter_favorites');
      this.favorites = [];
      this.showAllFavorites = false;
      this.currentFavoritePage = 0;
      this.favoritesTranslateX = 0;
      this.maxFavoritePages = 0;
      console.log('🗑️ Kõik lemmikud kustutatud');
    }
  }

  shouldShowFavoritesSection(): boolean {
    return true; // Näita alati lemmikute sektsiooni, isegi kui tühi
  }

  onItemClick(item: ContentItem): void {
    console.log('🖱️ Kliki sisu:', item);

    if (item.id) {
      const title = item.heading || item.headline || item.title || '';
      const urlSlug = this.generateUrlSlug(title);
      const jupiterUrl = `https://jupiter.err.ee/${item.id}/${urlSlug}`;

      console.log('🔗 Avan URL:', jupiterUrl);
      window.open(jupiterUrl, '_blank');
    } else {
      console.warn('⚠️ Elemendil puudub ID, ei saa avada');
    }
  }

  retryLoad(): void {
    console.log('🔄 Retry load');
    this.loadContent();
  }

  // Lemmikute helper meetodid (kui vaja, aga enam ei kasuta eraldi kaarte)
  getFavoriteTitle(item: ContentItem): string {
    return item.heading || item.headline || item.title || 'Pealkiri puudub';
  }

  getFavoriteDescription(item: ContentItem): string {
    const contentAny = item as any;
    return item.lead || contentAny.description || contentAny.summary || 'Kirjeldus puudub';
  }

  getFavoriteTypeLabel(item: ContentItem): string {
    switch (item.type) {
      case 'video': return 'Video';
      case 'livestream': return 'Otse-eetris';
      case 'audio': return 'Audio';
      case 'article': return 'Artikkel';
      case 'series': return 'Sari';
      case 'movie': return 'Film';
      case 'episode': return 'Episood';
      default: return item.type || 'Sisu';
    }
  }

  // Utility functions
  trackBySection(index: number, section: FrontPageSection): string {
    return section.header + '_' + index;
  }

  trackByItem(index: number, item: ContentItem): string {
    return item.id;
  }

  private generateUrlSlug(title: string): string {
    if (!title) return '';

    return title
      .toLowerCase()
      .trim()
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/õ/g, 'o')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ========== AUTOMAATNE KARUSELL ==========

  private startAutoScroll(): void {
    if (!this.autoScrollEnabled || this.showAllFavorites || !this.hasMultipleFavoritePages()) {
      return;
    }

    this.stopAutoScroll(); // Esmalt peata olemasolev

    this.autoScrollInterval = setInterval(() => {
      if (!this.showAllFavorites && this.hasMultipleFavoritePages()) {
        this.autoScrollNext();
      } else {
        this.stopAutoScroll();
      }
    }, this.autoScrollDelay);

    console.log('🔄 Automaatne karusell käivitatud (10s interval)');
  }

  private stopAutoScroll(): void {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
      console.log('⏹️ Automaatne karusell peatatud');
    }
  }

  private restartAutoScroll(): void {
    // Restart auto scroll after manual interaction (with delay)
    this.stopAutoScroll();

    setTimeout(() => {
      if (!this.showAllFavorites && this.hasMultipleFavoritePages()) {
        this.startAutoScroll();
      }
    }, 2000); // 2 sekundi paus pärast manuaalset kliki
  }

  private autoScrollNext(): void {
    if (this.currentFavoritePage < this.maxFavoritePages - 1) {
      // Mine järgmisele lehele
      this.currentFavoritePage++;
      console.log('🔄 Automaatne karusell: järgmine leht ->', this.currentFavoritePage);
    } else {
      // Jõudsime lõppu, mine tagasi esimesele lehele
      this.currentFavoritePage = 0;
      console.log('🔄 Automaatne karusell: tagasi esimesele lehele');
    }

    this.updateFavoritesTransform();
  }

  // Peata automaatne karusell kui kasutaja hoverdab üle
  onFavoritesMouseEnter(): void {
    this.autoScrollEnabled = false;
    this.stopAutoScroll();
    console.log('🖱️ Mouse hover - automaatne karusell peatatud');
  }

  // Käivita automaatne karusell kui kasutaja eemaldab hiire
  onFavoritesMouseLeave(): void {
    this.autoScrollEnabled = true;

    setTimeout(() => {
      if (!this.showAllFavorites && this.hasMultipleFavoritePages()) {
        this.startAutoScroll();
      }
    }, 1000); // 1 sekundi paus

    console.log('🖱️ Mouse leave - automaatne karusell taaskäivitatud');
  }
}
