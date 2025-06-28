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
  showAllFavorites = false;
  favoritesItemsPerPage = 6;
  currentFavoritePage = 0;
  maxFavoritePages = 0;
  favoritesTranslateX = 0;
  favoritesItemWidth = 220;


  private autoScrollInterval: any = null;
  private autoScrollEnabled = true;
  autoScrollDelay = 10000;

  loading = false;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadContent();
    this.loadFavorites();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  loadContent(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getJupiterContent().subscribe({
      next: (sections: FrontPageSection[]) => {
        if (sections && Array.isArray(sections) && sections.length > 0) {
          this.contentSections = sections;
        } else {
          this.contentSections = [];
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.message || 'Tundmatu viga';
        this.loading = false;
        this.contentSections = [];
      }
    });
  }

  loadFavorites(): void {
    try {
      const stored = localStorage.getItem('jupiter_favorites');
      this.favorites = stored ? JSON.parse(stored) : [];
      this.calculateFavoritePages();

      if (this.hasMultipleFavoritePages() && !this.showAllFavorites) {
        this.startAutoScroll();
      }
    } catch (error) {
      console.error('Viga lemmikute laadimisel:', error);
      this.favorites = [];
    }
  }

  calculateFavoritePages(): void {
    if (!this.favorites || this.favorites.length === 0) {
      this.maxFavoritePages = 0;
      return;
    }
    this.maxFavoritePages = Math.ceil(this.favorites.length / this.favoritesItemsPerPage);
  }

  hasMultipleFavoritePages(): boolean {
    return this.maxFavoritePages > 1;
  }

  scrollFavoritesLeft(): void {
    if (this.currentFavoritePage > 0) {
      this.currentFavoritePage--;
      this.updateFavoritesTransform();
      this.restartAutoScroll();
    }
  }

  scrollFavoritesRight(): void {
    if (this.currentFavoritePage < this.maxFavoritePages - 1) {
      this.currentFavoritePage++;
      this.updateFavoritesTransform();
      this.restartAutoScroll();
    }
  }

  updateFavoritesTransform(): void {
    this.favoritesTranslateX = -(this.currentFavoritePage * this.favoritesItemsPerPage * this.favoritesItemWidth);
  }

  toggleShowAllFavorites(): void {
    this.showAllFavorites = !this.showAllFavorites;

    if (!this.showAllFavorites) {
      this.currentFavoritePage = 0;
      this.favoritesTranslateX = 0;
      if (this.hasMultipleFavoritePages()) {
        this.startAutoScroll();
      }
    } else {
      this.stopAutoScroll();
    }
  }

  onFavoriteToggle(event: {item: ContentItem, isFavorite: boolean}): void {
    this.loadFavorites();
  }

  clearAllFavorites(): void {
    if (confirm('Kas oled kindel, et tahad kõik lemmikud kustutada?')) {
      localStorage.removeItem('jupiter_favorites');
      this.favorites = [];
      this.showAllFavorites = false;
      this.currentFavoritePage = 0;
      this.favoritesTranslateX = 0;
      this.maxFavoritePages = 0;
    }
  }

  shouldShowFavoritesSection(): boolean {
    return true;
  }

  onItemClick(item: ContentItem): void {
    if (item.id) {
      const title = item.heading || item.headline || item.title || '';
      const urlSlug = this.generateUrlSlug(title);
      const jupiterUrl = `https://jupiter.err.ee/${item.id}/${urlSlug}`;
      window.open(jupiterUrl, '_blank');
    }
  }

  retryLoad(): void {
    this.loadContent();
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

  private startAutoScroll(): void {
    if (!this.autoScrollEnabled || this.showAllFavorites || !this.hasMultipleFavoritePages()) {
      return;
    }

    this.stopAutoScroll();

    this.autoScrollInterval = setInterval(() => {
      if (!this.showAllFavorites && this.hasMultipleFavoritePages()) {
        this.autoScrollNext();
      } else {
        this.stopAutoScroll();
      }
    }, this.autoScrollDelay);
  }

  private stopAutoScroll(): void {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  private restartAutoScroll(): void {
    this.stopAutoScroll();
    setTimeout(() => {
      if (!this.showAllFavorites && this.hasMultipleFavoritePages()) {
        this.startAutoScroll();
      }
    }, 2000);
  }

  private autoScrollNext(): void {
    if (this.currentFavoritePage < this.maxFavoritePages - 1) {
      this.currentFavoritePage++;
    } else {
      this.currentFavoritePage = 0;
    }
    this.updateFavoritesTransform();
  }

  onFavoritesMouseEnter(): void {
    this.autoScrollEnabled = false;
    this.stopAutoScroll();
  }

  onFavoritesMouseLeave(): void {
    this.autoScrollEnabled = true;
    setTimeout(() => {
      if (!this.showAllFavorites && this.hasMultipleFavoritePages()) {
        this.startAutoScroll();
      }
    }, 1000);
  }
}
