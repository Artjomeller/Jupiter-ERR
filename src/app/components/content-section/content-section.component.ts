import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontPageSection, ContentItem } from '../../models/jupiter.models';
import { ContentItemComponent } from '../content-item/content-item.component';

@Component({
  selector: 'app-content-section',
  standalone: true,
  imports: [CommonModule, ContentItemComponent],
  template: `
    <div class="content-section" *ngIf="section">

      <div class="section-header">
        <h2 class="section-title">{{ section.header }}</h2>
        <div class="section-controls">
          <div class="carousel-controls" *ngIf="!showAll && hasMultiplePages()">
            <button
              class="nav-btn nav-btn-left"
              (click)="scrollLeft()"
              [disabled]="currentPage === 0"
              title="Eelmine"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <button
              class="nav-btn nav-btn-right"
              (click)="scrollRight()"
              [disabled]="currentPage >= maxPages - 1"
              title="Järgmine"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>
          <button
            *ngIf="hasMoreItems()"
            class="show-all-btn"
            (click)="toggleShowAll()"
          >
            {{ showAll ? 'Näita vähem' : 'Kuva kõik' }}
            <span class="btn-icon">{{ showAll ? '←' : '→' }}</span>
          </button>
        </div>
      </div>

      <div class="section-info">
        <div class="page-indicator" *ngIf="!showAll && hasMultiplePages()">
          {{ currentPage + 1 }} / {{ maxPages }}
        </div>
      </div>

      <div
        class="carousel-container"
        *ngIf="!showAll"
        (mouseenter)="onMouseEnter()"
        (mouseleave)="onMouseLeave()">
        <div
          class="carousel-track"
          #carouselTrack
          [style.transform]="'translateX(' + translateX + 'px)'"
        >
          <app-content-item
            *ngFor="let item of section.data; trackBy: trackByItem; let i = index"
            [content]="item"
            (itemClick)="onItemClick($event)"
            (favoriteToggle)="onFavoriteToggle($event)"
            class="carousel-item"
            [attr.data-index]="i"
          >
          </app-content-item>
        </div>
      </div>

      <div class="grid-container" *ngIf="showAll">
        <app-content-item
          *ngFor="let item of section.data; trackBy: trackByItem"
          [content]="item"
          (itemClick)="onItemClick($event)"
          (favoriteToggle)="onFavoriteToggle($event)"
          class="grid-item"
        >
        </app-content-item>
      </div>
    </div>
  `,
  styleUrl: './content-section.component.scss'
})
export class ContentSectionComponent implements OnInit, OnDestroy {
  @Input() section!: FrontPageSection;
  @Output() favoriteToggle = new EventEmitter<{item: ContentItem, isFavorite: boolean}>();
  @ViewChild('carouselTrack', { static: false }) carouselTrack!: ElementRef;

  showAll = false;
  itemsPerPage = 6;
  currentPage = 0;
  maxPages = 0;
  translateX = 0;
  itemWidth = 220; // 200px kaart + 20px gap = 220px

  private autoScrollInterval: any = null;
  private autoScrollEnabled = true;
  autoScrollDelay = 10000; // 10 sekundit

  ngOnInit(): void {
    this.calculatePages();

    if (this.hasMultiplePages() && !this.showAll) {
      this.startAutoScroll();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  calculatePages(): void {
    if (!this.section?.data) return;
    this.maxPages = Math.ceil(this.section.data.length / this.itemsPerPage);
  }

  hasMultiplePages(): boolean {
    return this.maxPages > 1;
  }

  hasMoreItems(): boolean {
    return this.section?.data?.length > this.itemsPerPage;
  }

  getVisibleItemsCount(): number {
    if (this.showAll) {
      return this.section?.data?.length || 0;
    }
    return Math.min(this.itemsPerPage, this.section?.data?.length || 0);
  }

  scrollLeft(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateTransform();
    }
    this.restartAutoScroll();
  }

  scrollRight(): void {
    if (this.currentPage < this.maxPages - 1) {
      this.currentPage++;
      this.updateTransform();
    }
    this.restartAutoScroll();
  }

  updateTransform(): void {
    this.translateX = -(this.currentPage * this.itemsPerPage * this.itemWidth);
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;

    if (!this.showAll) {
      this.currentPage = 0;
      this.translateX = 0;
      if (this.hasMultiplePages()) {
        this.startAutoScroll();
      }
    } else {
      this.stopAutoScroll();
    }
  }

  onItemClick(item: ContentItem): void {
    if (item.id) {
      const title = item.heading || item.headline || item.title || '';
      const urlSlug = this.generateUrlSlug(title);
      const jupiterUrl = `https://jupiter.err.ee/${item.id}/${urlSlug}`;
      window.open(jupiterUrl, '_blank');
    }
  }

  onFavoriteToggle(event: {item: ContentItem, isFavorite: boolean}): void {
    this.favoriteToggle.emit(event);
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

  trackByItem(index: number, item: ContentItem): string {
    return item.id;
  }

  private startAutoScroll(): void {
    if (!this.autoScrollEnabled || this.showAll || !this.hasMultiplePages()) {
      return;
    }

    this.stopAutoScroll();

    this.autoScrollInterval = setInterval(() => {
      if (!this.showAll && this.hasMultiplePages()) {
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
      if (!this.showAll && this.hasMultiplePages()) {
        this.startAutoScroll();
      }
    }, 2000);
  }

  private autoScrollNext(): void {
    if (this.currentPage < this.maxPages - 1) {
      this.currentPage++;
    } else {
      this.currentPage = 0;
    }
    this.updateTransform();
  }

  onMouseEnter(): void {
    this.autoScrollEnabled = false;
    this.stopAutoScroll();
  }

  onMouseLeave(): void {
    this.autoScrollEnabled = true;
    setTimeout(() => {
      if (!this.showAll && this.hasMultiplePages()) {
        this.startAutoScroll();
      }
    }, 1000);
  }
}
