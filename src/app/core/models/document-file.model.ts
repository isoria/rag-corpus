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
  sourceFileIds: string[];   //esto es importante
  current: boolean;
  createdAt?: Timestamp;
  url?: string;
}

