// content-section.component.ts - TÄIUSTATUD VERSIOON

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontPageSection, ContentItem } from '../../models/jupiter.models';
import { ContentItemComponent } from '../content-item/content-item.component';

@Component({
  selector: 'app-content-section',
  standalone: true,
  imports: [CommonModule, ContentItemComponent],
  template: `
    <div class="content-section" *ngIf="section">
      <!-- Section Header with Title and Show All Button -->
      <div class="section-header">
        <h2 class="section-title">{{ section.header }}</h2>
        <button
          *ngIf="hasMoreItems()"
          class="show-all-btn"
          (click)="toggleShowAll()"
        >
          {{ showAll ? 'Näita vähem' : 'Kuva kõik' }}
          <span class="btn-icon">{{ showAll ? '←' : '→' }}</span>
        </button>
      </div>

      <!-- Items Counter -->
      <div class="items-counter">
        {{ getVisibleItemsCount() }} / {{ section.data.length }} elementi
      </div>

      <!-- Content - kasutab sinu olemasolevaid klasse -->
      <div class="content-container" [class.grid-mode]="showAll">
        <div class="horizontal-scroll-container" *ngIf="!showAll">
          <div class="content-row">
            <app-content-item
              *ngFor="let item of getVisibleItems(); trackBy: trackByItem"
              [content]="item"
            >
            </app-content-item>
          </div>
        </div>

        <div class="content-wrapper" *ngIf="showAll">
          <app-content-item
            *ngFor="let item of getVisibleItems(); trackBy: trackByItem"
            [content]="item"
          >
          </app-content-item>
        </div>
      </div>
    </div>
  `,
  styleUrl: './content-section.component.scss'
})
export class ContentSectionComponent {
  @Input() section!: FrontPageSection;

  showAll = false;
  maxInitialItems = 10; // Alguses näita ainult 10 elementi

  getVisibleItems(): ContentItem[] {
    if (!this.section?.data) return [];

    if (this.showAll) {
      return this.section.data;
    }

    return this.section.data.slice(0, this.maxInitialItems);
  }

  getVisibleItemsCount(): number {
    return this.getVisibleItems().length;
  }

  hasMoreItems(): boolean {
    return this.section?.data?.length > this.maxInitialItems;
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
    console.log(`${this.section.header}: showAll = ${this.showAll}`);
  }

  trackByItem(index: number, item: ContentItem): string {
    return item.id;
  }

  getTitle(item: ContentItem): string {
    return item.heading || item.headline || item.title || 'Pealkiri puudub';
  }

  getDescription(item: ContentItem): string {
    const itemAny = item as any;
    return item.lead || itemAny.description || itemAny.summary || '';
  }

  getImageUrl(item: ContentItem): string {
    // Sama loogika mis varem
    if (item.verticalPhotos) {
      if (Array.isArray(item.verticalPhotos)) {
        if (item.verticalPhotos.length > 0) {
          const photo = item.verticalPhotos[0];
          if (photo.photoUrlOriginal) return photo.photoUrlOriginal;
          if (photo.photoUrlBase) return photo.photoUrlBase;
          return this.extractImageUrl(photo) || this.getPlaceholderImage();
        }
      }
      else if (typeof item.verticalPhotos === 'object') {
        const photoKeys = Object.keys(item.verticalPhotos);
        if (photoKeys.length > 0) {
          const preferredSizes = ['medium', 'large', 'original', 'small', 'thumbnail'];
          for (const size of preferredSizes) {
            if (photoKeys.includes(size)) {
              const photoObj = item.verticalPhotos as { [key: string]: any };
              const photo = photoObj[size];
              const imageUrl = this.extractImageUrl(photo);
              if (imageUrl) return imageUrl;
            }
          }
        }
      }
    }

    const itemAny = item as any;
    if (itemAny.image && typeof itemAny.image === 'string') {
      return itemAny.image;
    }

    return this.getPlaceholderImage();
  }

  private extractImageUrl(photo: any): string | null {
    if (!photo) return null;

    if (photo.photoUrlOriginal) return photo.photoUrlOriginal;
    if (photo.photoUrlBase) return photo.photoUrlBase;

    if (typeof photo === 'string') return photo;

    if (typeof photo === 'object' && photo !== null) {
      const possibleFields = ['src', 'url', 'href', 'link', 'image', 'original'];
      for (const field of possibleFields) {
        if (photo[field] && typeof photo[field] === 'string') {
          return photo[field];
        }
      }
    }

    return null;
  }

  private getPlaceholderImage(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
  }

  isVideo(item: ContentItem): boolean {
    return item.type === 'video' ||
      item.type === 'livestream' ||
      item.type === 'series' ||
      item.type === 'movie' ||
      item.type === 'episode';
  }

  onImageError(event: any): void {
    console.log('Pildi laadimine ebaõnnestus:', event.target.src);
    event.target.src = this.getPlaceholderImage();
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
}
