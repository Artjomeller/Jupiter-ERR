import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentItem } from '../../models/jupiter.models';

@Component({
  selector: 'app-content-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="content-item"
      (click)="onItemClick()"
      [title]="getTitle()"
    >
      <div class="image-container">
        <img
          [src]="getImageUrl()"
          [alt]="getTitle()"
          class="content-image"
          loading="lazy"
          (error)="onImageError($event)"
        >
      </div>

      <div class="content-type-badge">
        {{ getTypeLabel() }}
      </div>

      <div *ngIf="getDuration()" class="duration-badge">
        {{ getDuration() }}
      </div>

      <button
        class="favorite-btn"
        [class.active]="isFavorite()"
        (click)="toggleFavorite($event)"
        [title]="isFavorite() ? 'Eemalda lemmikutest' : 'Lisa lemmikutesse'"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      <div class="content-info-overlay">
        <h3 class="content-title">{{ getTitle() }}</h3>

        <p *ngIf="getDescription()" class="content-description">
          {{ getDescription() }}
        </p>

        <div class="content-meta-info">
          <time *ngIf="content.published" class="content-date">
            {{ formatDate(content.published) }}
          </time>

          <div class="content-tags" *ngIf="getGenres().length > 0">
            <span class="content-tag" *ngFor="let tag of getGenres().slice(0, 3)">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <div *ngIf="isVideo()" class="play-button-overlay">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </article>
  `,
  styleUrl: './content-item.component.scss'
})
export class ContentItemComponent implements OnDestroy {
  @Input() content!: ContentItem;
  @Output() itemClick = new EventEmitter<ContentItem>();
  @Output() favoriteToggle = new EventEmitter<{item: ContentItem, isFavorite: boolean}>();

  ngOnDestroy(): void {
  }

  onItemClick(): void {
    this.itemClick.emit(this.content);
  }

  isFavorite(): boolean {
    try {
      const favorites = JSON.parse(localStorage.getItem('jupiter_favorites') || '[]');
      return favorites.some((fav: ContentItem) => fav.id === this.content.id);
    } catch {
      return false;
    }
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();

    try {
      const favorites = JSON.parse(localStorage.getItem('jupiter_favorites') || '[]');
      const isCurrentlyFavorite = favorites.some((fav: ContentItem) => fav.id === this.content.id);

      let updatedFavorites;
      if (isCurrentlyFavorite) {

        updatedFavorites = favorites.filter((fav: ContentItem) => fav.id !== this.content.id);
      } else {

        updatedFavorites = [...favorites, this.content];
      }

      localStorage.setItem('jupiter_favorites', JSON.stringify(updatedFavorites));

      this.favoriteToggle.emit({
        item: this.content,
        isFavorite: !isCurrentlyFavorite
      });

    } catch (error) {
      console.error('Viga lemmikute salvestamisel:', error);
    }
  }

  getTitle(): string {
    return this.content.heading || this.content.headline || this.content.title || 'Pealkiri puudub';
  }

  getDescription(): string {
    const contentAny = this.content as any;

    const possibleDescriptions = [
      this.content.lead,
      contentAny.description,
      contentAny.summary,
      contentAny.text,
      contentAny.content,
      contentAny.excerpt,
      contentAny.intro,
      contentAny.abstract,
      contentAny.subtitle,
      contentAny.body
    ];

    for (const desc of possibleDescriptions) {
      if (desc && typeof desc === 'string' && desc.trim().length > 20) {
        return desc.trim();
      }
    }

    return this.generateFallbackDescription();
  }

  private generateFallbackDescription(): string {
    const title = this.getTitle();

    switch (this.content.type) {
      case 'series':
        return `"${title}" on põnev sari, mis pakub kvaliteetset meelelahutust. Vaata kõiki episoode Jupiter portaalis.`;
      case 'video':
        return `"${title}" on videoklipp, mis sisaldab huvitavat sisu. Vaata kohe Jupiter portaalis.`;
      case 'movie':
        return `"${title}" on film, mis pakub suurt vaatamisnaudingust. Vaata täispikka filmi Jupiter portaalis.`;
      case 'livestream':
        return `"${title}" on otseülekanne, mis toob sündmused otse sinu ekraanile.`;
      case 'audio':
        return `"${title}" on audiosisu, mida saad kuulata Jupiter portaalis.`;
      case 'article':
        return `"${title}" on artikkel, mis sisaldab huvitavat informatsiooni ja analüüsi.`;
      case 'episode':
        return `"${title}" on episood sarjast. Jälgi kõiki episoode Jupiter portaalis.`;
      default:
        return `"${title}" on kvaliteetne sisu Jupiter portaalis. Avasta rohkem huvitavat sisu.`;
    }
  }

  getImageUrl(): string {
    if (this.content.verticalPhotos) {
      if (Array.isArray(this.content.verticalPhotos)) {
        if (this.content.verticalPhotos.length > 0) {
          const photo = this.content.verticalPhotos[0];
          if (photo.photoUrlOriginal) return photo.photoUrlOriginal;
          if (photo.photoUrlBase) return photo.photoUrlBase;
          const imageUrl = this.extractImageUrl(photo);
          if (imageUrl) return imageUrl;
        }
      } else if (typeof this.content.verticalPhotos === 'object') {
        const photoKeys = Object.keys(this.content.verticalPhotos);
        if (photoKeys.length > 0) {
          const preferredSizes = ['large', 'original', 'medium', 'small'];
          for (const size of preferredSizes) {
            if (photoKeys.includes(size)) {
              const photo = this.content.verticalPhotos[size];
              const imageUrl = this.extractImageUrl(photo);
              if (imageUrl) return imageUrl;
            }
          }
        }
      }
    }

    const contentAny = this.content as any;
    const fallbackUrl = this.content.image || contentAny.photo || contentAny.thumbnail;
    if (fallbackUrl) return fallbackUrl;
    return this.getPlaceholderImage();
  }

  private extractImageUrl(photo: any): string | null {
    if (!photo) return null;
    if (photo.photoUrlOriginal) return photo.photoUrlOriginal;
    if (photo.photoUrlBase) return photo.photoUrlBase;
    return photo.src || photo.url || photo.href || photo.link || photo.image || photo.original || null;
  }

  private getPlaceholderImage(): string {
    return `data:image/svg+xml;charset=UTF-8,%3Csvg width='280' height='420' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial,sans-serif' font-size='16' fill='%23999' text-anchor='middle' dy='.3em'%3EEi pilti%3C/text%3E%3C/svg%3E`;
  }

  isVideo(): boolean {
    return this.content.type === 'video' ||
      this.content.type === 'livestream' ||
      this.content.type === 'series' ||
      this.content.type === 'movie' ||
      this.content.type === 'episode';
  }

  getTypeLabel(): string {
    switch (this.content.type) {
      case 'video': return 'Video';
      case 'livestream': return 'Otse-eetris';
      case 'audio': return 'Audio';
      case 'article': return 'Artikkel';
      case 'series': return 'Sari';
      case 'movie': return 'Film';
      case 'episode': return 'Episood';
      default: return this.content.type || 'Sisu';
    }
  }

  getDuration(): string | null {
    const contentAny = this.content as any;
    return contentAny.duration || contentAny.length || null;
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Täna';
      else if (diffDays === 1) return 'Eile';
      else if (diffDays < 7) return `${diffDays} päeva tagasi`;
      else return date.toLocaleDateString('et-EE', { day: 'numeric', month: 'short' });
    } catch {
      return dateString;
    }
  }

  onImageError(event: any): void {
    event.target.src = this.getPlaceholderImage();
  }

  getGenres(): string[] {
    const contentAny = this.content as any;
    const genres = contentAny.genres || contentAny.categories || contentAny.tags;

    if (Array.isArray(genres)) {
      return genres
        .filter(genre => {
          const lowerGenre = genre.toLowerCase();
          const currentType = this.getTypeLabel().toLowerCase();
          return lowerGenre !== currentType &&
            lowerGenre !== 'video' &&
            lowerGenre !== 'sari' &&
            lowerGenre !== 'film' &&
            lowerGenre !== 'movie' &&
            lowerGenre !== 'series' &&
            lowerGenre !== 'episode' &&
            lowerGenre !== 'episood';
        })
        .slice(0, 3);
    }

    if (typeof genres === 'string') {
      return genres.split(',')
        .map(g => g.trim())
        .filter(genre => {
          const lowerGenre = genre.toLowerCase();
          const currentType = this.getTypeLabel().toLowerCase();
          return lowerGenre !== currentType &&
            lowerGenre !== 'video' &&
            lowerGenre !== 'sari' &&
            lowerGenre !== 'film' &&
            lowerGenre !== 'movie' &&
            lowerGenre !== 'series' &&
            lowerGenre !== 'episode' &&
            lowerGenre !== 'episood';
        })
        .slice(0, 3);
    }
    return [];
  }
}
