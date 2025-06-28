// content-section.component.ts - AUTOPLAY EEMALDATUD

import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontPageSection, ContentItem } from '../../models/jupiter.models';
import { ContentItemComponent } from '../content-item/content-item.component';

@Component({
  selector: 'app-content-section',
  standalone: true,
  imports: [CommonModule, ContentItemComponent],
  template: `
    <div class="content-section" *ngIf="section">
      <!-- Section Header with Title and Controls -->
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

      <!-- Items Counter and Page Info -->
      <div class="section-info">
        <div class="items-counter">
          {{ getVisibleItemsCount() }} / {{ section.data.length }} elementi
        </div>
        <div class="page-indicator" *ngIf="!showAll && hasMultiplePages()">
          {{ currentPage + 1 }} / {{ maxPages }}
        </div>
      </div>

      <!-- Carousel Mode (Limited Items with Navigation) -->
      <div class="carousel-container" *ngIf="!showAll">
        <div
          class="carousel-track"
          #carouselTrack
          [style.transform]="'translateX(' + translateX + 'px)'"
        >
          <app-content-item
            *ngFor="let item of section.data; trackBy: trackByItem; let i = index"
            [content]="item"
            (itemClick)="onItemClick($event)"
            class="carousel-item"
            [attr.data-index]="i"
          >
          </app-content-item>
        </div>
      </div>

      <!-- Grid Mode (Show All Items) -->
      <div class="grid-container" *ngIf="showAll">
        <app-content-item
          *ngFor="let item of section.data; trackBy: trackByItem"
          [content]="item"
          (itemClick)="onItemClick($event)"
          class="grid-item"
        >
        </app-content-item>
      </div>

      <!-- AUTOPLAY PROGRESS BAR EEMALDATUD -->
    </div>
  `,
  styleUrl: './content-section.component.scss'
})
export class ContentSectionComponent implements OnInit {
  @Input() section!: FrontPageSection;
  @ViewChild('carouselTrack', { static: false }) carouselTrack!: ElementRef;

  // Carousel settings
  showAll = false;
  itemsPerPage = 6;
  currentPage = 0;
  maxPages = 0;
  translateX = 0;
  itemWidth = 300; // 280px width + 20px gap

  ngOnInit(): void {
    this.calculatePages();
  }

  // Page calculations
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

  // Navigation
  scrollLeft(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateTransform();
    }
  }

  scrollRight(): void {
    if (this.currentPage < this.maxPages - 1) {
      this.currentPage++;
      this.updateTransform();
    }
  }

  updateTransform(): void {
    this.translateX = -(this.currentPage * this.itemsPerPage * this.itemWidth);
  }

  // Show All toggle
  toggleShowAll(): void {
    this.showAll = !this.showAll;

    if (!this.showAll) {
      this.currentPage = 0;
      this.translateX = 0;
    }

    console.log(`${this.section.header}: showAll = ${this.showAll}`);
  }

  // Event handlers
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

  // Utility functions
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
}
