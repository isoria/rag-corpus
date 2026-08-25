import { Timestamp } from '@angular/fire/firestore';

export type DocumentFileStage =
  | 'ORIGINAL'
  | 'OCR'
  | 'CLEAN'
  | 'STRUCTURED';

export interface DocumentFile {
  id?: string;

  documentId: string;

  stage: DocumentFileStage;

  version: number;

  filename: string;

  storagePath: string;

  mimeType: string;

  size: number;

  sha256: string;

  current: boolean;

  createdAt?: Timestamp;
}