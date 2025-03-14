import { Timestamp } from 'firebase/firestore';

export interface ChapterMap {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  isPublic: boolean;
  relationships: {
    sourceChapter: number;
    relatedChapters: number[];
  }[];
} 