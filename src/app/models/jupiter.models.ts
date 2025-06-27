// jupiter.models.ts - TÄIELIK PARANDATUD VERSIOON

// API tagastab objekti struktuuri
export interface ApiResponse {
  data: {
    category: {
      frontPage: FrontPageSection[];
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

export interface FrontPageSection {
  header: string;           // API kasutab 'header', mitte 'title'
  headerUrl: string;
  highTimeline: boolean;
  liveBlock: boolean;
  manual: {
    highTimeline: boolean;
    banner: boolean;
  };
  data: ContentItem[];
  [key: string]: any;
}

export interface ContentItem {
  id: string;
  heading?: string;         // API kasutab peamiselt 'heading'
  headline?: string;        // backup
  title?: string;          // backup
  lead?: string;
  published?: string;
  type?: 'video' | 'audio' | 'article' | 'livestream' | 'series' | 'movie' | 'episode' | string;
  image?: string;
  verticalPhotos?: any;    // Lihtsustatud - võib olla array, objekt või midagi muud
  duration?: string;
  length?: string;
  url?: string;
  [key: string]: any;
}

export interface PhotoObject {
  src?: string;
  url?: string;
  href?: string;
  link?: string;
  image?: string;
  original?: string;
  alt?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

// Photo size types
export type PhotoSize = 'small' | 'medium' | 'large' | 'original' | 'thumbnail' | 'preview';

// Type guard functions for better type safety
export function isValidContentItem(item: any): item is ContentItem {
  return item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    (typeof item.title === 'string' ||
      typeof item.headline === 'string' ||
      typeof item.heading === 'string');
}

export function hasVerticalPhotos(item: ContentItem): boolean {
  return !!(item.verticalPhotos &&
    (Array.isArray(item.verticalPhotos) && item.verticalPhotos.length > 0) ||
    (typeof item.verticalPhotos === 'object' && Object.keys(item.verticalPhotos).length > 0));
}

export function isVideoContent(item: ContentItem): boolean {
  return item.type === 'video' ||
    item.type === 'livestream' ||
    item.type === 'series' ||
    item.type === 'movie' ||
    item.type === 'episode';
}

// Utility type for extracting image URLs
export interface ImageSource {
  url: string;
  size?: PhotoSize;
  width?: number;
  height?: number;
}
