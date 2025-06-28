// content-section.component.ts - TÄIELIK FAIL AUTOMAATSE KARUSELLIGA

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
        <div class="page-indicator" *ngIf="!showAll && hasMultiplePages()">
          {{ currentPage + 1 }} / {{ maxPages }}
        </div>
      </div>

      <!-- Carousel Mode (Limited Items with Navigation) -->
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

      <!-- Grid Mode (Show All Items) -->
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

  // Carousel settings - 6 KAARTI
  showAll = false;
  itemsPerPage = 6;
  currentPage = 0;
  maxPages = 0;
  translateX = 0;
  itemWidth = 220; // 200px kaart + 20px gap = 220px

  // AUTOMAATNE KARUSELL
  private autoScrollInterval: any = null;
  private autoScrollEnabled = true;
  autoScrollDelay = 10000; // 10 sekundit

  ngOnInit(): void {
    this.calculatePages();

    // Käivita automaatne karusell kui on mitu lehte
    if (this.hasMultiplePages() && !this.showAll) {
      this.startAutoScroll();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  // Page calculations
  calculatePages(): void {
    if (!this.section?.data) return;
    this.maxPages = Math.ceil(this.section.data.length / this.itemsPerPage);
    console.log('📊 Arvutatakse lehed sektsioonile:', this.section.header, {
      totalItems: this.section.data.length,
      itemsPerPage: this.itemsPerPage,
      maxPages: this.maxPages
    });
  }

  hasMultiplePages(): boolean {
    const result = this.maxPages > 1;
    console.log('🔢 Kas on mitu lehte?', {
      maxPages: this.maxPages,
      hasMultiple: result,
      section: this.section?.header
    });
    return result;
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
      console.log('◀️ Skrollin vasakule, leht:', this.currentPage);
    }

    // Restart auto scroll after manual interaction
    this.restartAutoScroll();
  }

  scrollRight(): void {
    if (this.currentPage < this.maxPages - 1) {
      this.currentPage++;
      this.updateTransform();
      console.log('▶️ Skrollin paremale, leht:', this.currentPage);
    } else {
      console.log('🚫 Ei saa enam paremale, jõudsin lõppu');
    }

    // Restart auto scroll after manual interaction
    this.restartAutoScroll();
  }

  updateTransform(): void {
    // Lihtsam ja usaldusväärsem translateX arvutus
    this.translateX = -(this.currentPage * this.itemsPerPage * this.itemWidth);
    console.log('📊 Karusell liigub:', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      itemWidth: this.itemWidth,
      translateX: this.translateX
    });
  }

  // Show All toggle
  toggleShowAll(): void {
    this.showAll = !this.showAll;

    if (!this.showAll) {
      this.currentPage = 0;
      this.translateX = 0;
      // Käivita automaatne karusell kui läheme tagasi karusell režiimi
      if (this.hasMultiplePages()) {
        this.startAutoScroll();
      }
    } else {
      // Peata automaatne karusell kui läheme "kuva kõik" režiimi
      this.stopAutoScroll();
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

  onFavoriteToggle(event: {item: ContentItem, isFavorite: boolean}): void {
    // Edasta event parent komponendile
    this.favoriteToggle.emit(event);
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

  // ========== AUTOMAATNE KARUSELL ==========

  private startAutoScroll(): void {
    if (!this.autoScrollEnabled || this.showAll || !this.hasMultiplePages()) {
      return;
    }

    this.stopAutoScroll(); // Esmalt peata olemasolev

    this.autoScrollInterval = setInterval(() => {
      if (!this.showAll && this.hasMultiplePages()) {
        this.autoScrollNext();
      } else {
        this.stopAutoScroll();
      }
    }, this.autoScrollDelay);

    console.log(`🔄 ${this.section.header}: Automaatne karusell käivitatud (10s interval)`);
  }

  private stopAutoScroll(): void {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
      console.log(`⏹️ ${this.section.header}: Automaatne karusell peatatud`);
    }
  }

  private restartAutoScroll(): void {
    // Restart auto scroll after manual interaction (with delay)
    this.stopAutoScroll();

    setTimeout(() => {
      if (!this.showAll && this.hasMultiplePages()) {
        this.startAutoScroll();
      }
    }, 2000); // 2 sekundi paus pärast manuaalset kliki
  }

  private autoScrollNext(): void {
    if (this.currentPage < this.maxPages - 1) {
      // Mine järgmisele lehele
      this.currentPage++;
      console.log(`🔄 ${this.section.header}: Automaatne karusell -> leht ${this.currentPage}`);
    } else {
      // Jõudsime lõppu, mine tagasi esimesele lehele
      this.currentPage = 0;
      console.log(`🔄 ${this.section.header}: Automaatne karusell -> tagasi esimesele lehele`);
    }

    this.updateTransform();
  }

  // Peata automaatne karusell kui kasutaja hoverdab üle
  onMouseEnter(): void {
    this.autoScrollEnabled = false;
    this.stopAutoScroll();
    console.log(`🖱️ ${this.section.header}: Mouse hover - automaatne karusell peatatud`);
  }

  // Käivita automaatne karusell kui kasutaja eemaldab hiire
  onMouseLeave(): void {
    this.autoScrollEnabled = true;

    setTimeout(() => {
      if (!this.showAll && this.hasMultiplePages()) {
        this.startAutoScroll();
      }
    }, 1000); // 1 sekundi paus

    console.log(`🖱️ ${this.section.header}: Mouse leave - automaatne karusell taaskäivitatud`);
  }
}
