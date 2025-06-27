// content-item.component.ts - PARANDATUD VERSIOON

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentItem } from '../../models/jupiter.models';

@Component({
  selector: 'app-content-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="content-item" (click)="onItemClick()" [title]="getTitle()">
      <div class="image-container">
        <img
          [src]="getImageUrl()"
          [alt]="getTitle()"
          class="content-image"
          loading="lazy"
          (error)="onImageError($event)"
        >

        <!-- Video overlay -->
        <div *ngIf="isVideo()" class="video-overlay">
          <div class="play-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        <!-- Duration badge -->
        <div *ngIf="getDuration()" class="duration-badge">
          {{ getDuration() }}
        </div>

        <!-- Hover overlay -->
        <div class="hover-overlay">
          <div class="hover-content">
            <div class="play-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="content-info">
        <h3 class="content-title">{{ getTitle() }}</h3>
        <p *ngIf="getDescription()" class="content-description">
          {{ getDescription() }}
        </p>
        <div class="content-meta">
          <time *ngIf="content.published" class="content-date">
            {{ formatDate(content.published) }}
          </time>
          <span *ngIf="content.type" class="content-type">{{ getTypeLabel() }}</span>
        </div>
      </div>
    </article>
  `,
  styleUrl: './content-item.component.scss'
})
export class ContentItemComponent {
  @Input() content!: ContentItem;
  @Output() itemClick = new EventEmitter<ContentItem>();

  onItemClick(): void {
    this.itemClick.emit(this.content);
  }

  getTitle(): string {
    console.log('getTitle called for:', this.content.id, {
      heading: this.content.heading,
      headline: this.content.headline,
      title: this.content.title
    });
    return this.content.heading || this.content.headline || this.content.title || 'Pealkiri puudub';
  } // PARANDATUD: lisatud puuduv sulg

  getDescription(): string {
    return this.content.lead || (this.content as any).description || (this.content as any).summary || '';
  }

  getImageUrl(): string {
    console.log('getImageUrl called for:', this.content.id, {
      verticalPhotos: this.content.verticalPhotos,
      isArray: Array.isArray(this.content.verticalPhotos),
      keys: this.content.verticalPhotos ? Object.keys(this.content.verticalPhotos) : 'none'
    });

    // Kontroll kas verticalPhotos on array või objekt
    if (this.content.verticalPhotos) {
      // Kui on array
      if (Array.isArray(this.content.verticalPhotos)) {
        if (this.content.verticalPhotos.length > 0) {
          const photo = this.content.verticalPhotos[0];
          console.log('Array photo object:', photo);

          // Otsi ERR-i spetsiifilisi URL välju
          if (photo.photoUrlOriginal) {
            console.log('Using photoUrlOriginal:', photo.photoUrlOriginal);
            return photo.photoUrlOriginal;
          }
          if (photo.photoUrlBase) {
            console.log('Using photoUrlBase:', photo.photoUrlBase);
            return photo.photoUrlBase;
          }

          // Proovi standardseid välju
          const imageUrl = this.extractImageUrl(photo);
          if (imageUrl) {
            console.log('Using extracted URL:', imageUrl);
            return imageUrl;
          }
        }
      }
      // Kui on objekt
      else if (typeof this.content.verticalPhotos === 'object') {
        const photoKeys = Object.keys(this.content.verticalPhotos);

        if (photoKeys.length > 0) {
          // Eelistame järjekorda: medium, large, original, small
          const preferredSizes = ['medium', 'large', 'original', 'small'];

          for (const size of preferredSizes) {
            if (photoKeys.includes(size)) {
              const photo = this.content.verticalPhotos[size];
              const imageUrl = this.extractImageUrl(photo);
              if (imageUrl) {
                console.log(`Using ${size} photo:`, imageUrl);
                return imageUrl;
              }
            }
          }

          // Kui preferred sizes ei ole, võtame esimese saadaoleva
          for (const key of photoKeys) {
            const photo = this.content.verticalPhotos[key];
            const imageUrl = this.extractImageUrl(photo);
            if (imageUrl) {
              console.log(`Using ${key} photo:`, imageUrl);
              return imageUrl;
            }
          }
        }
      }
    }

    // Fallback otsing teistest väljadest
    const contentAny = this.content as any;
    const fallbackUrl = this.content.image ||
      contentAny.photo ||
      contentAny.thumbnail ||
      contentAny.img ||
      contentAny.picture;

    if (fallbackUrl) {
      console.log('Using fallback image:', fallbackUrl);
      return fallbackUrl;
    }

    console.log('No image found, using placeholder');
    return this.getPlaceholderImage();
  }

  private extractImageUrl(photo: any): string | null {
    if (!photo) return null;

    // ERR-i spetsiifilised väljad (prioriteet)
    if (photo.photoUrlOriginal) return photo.photoUrlOriginal;
    if (photo.photoUrlBase) return photo.photoUrlBase;

    // Standardsed väljad
    return photo.src ||
      photo.url ||
      photo.href ||
      photo.link ||
      photo.image ||
      photo.original ||
      null;
  }

  private getPlaceholderImage(): string {
    return `data:image/svg+xml;charset=UTF-8,%3Csvg width='280' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial,sans-serif' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3EEi pilti%3C/text%3E%3C/svg%3E`;
  }

  isVideo(): boolean {
    return this.content.type === 'video' || this.content.type === 'livestream' || this.content.type === 'series' || this.content.type === 'movie';
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
      default: return this.content.type || '';
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

      if (diffDays === 0) {
        return 'Täna';
      } else if (diffDays === 1) {
        return 'Eile';
      } else if (diffDays < 7) {
        return `${diffDays} päeva tagasi`;
      } else {
        return date.toLocaleDateString('et-EE', {
          day: 'numeric',
          month: 'short'
        });
      }
    } catch {
      return dateString;
    }
  }

  onImageError(event: any): void {
    console.log('Pildi laadimine ebaõnnestus:', event.target.src);
    event.target.src = this.getPlaceholderImage();
  }
}
