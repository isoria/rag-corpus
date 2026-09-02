import { Timestamp } from '@angular/fire/firestore';
import { DocumentMetadata } from './document-metadata.model';

export type ProcessingStage =
  | 'INGESTED'
  | 'OCR'
  | 'CLEAN'
  | 'METADATA'
  | 'CHUNKED'
  | 'READY';

export type ValidityStatus =
  | 'VIGENTE'
  | 'DEROGADO'
  | 'DESCONOCIDO';

export interface CorpusDocument {
  id?: string;
  code: string;
  title: string;
  documentType: string;
  year: number | null;
  responsibleUnit: string | null;
  publicationDate: string | null;
  validityStatus: ValidityStatus;
  processingStage: ProcessingStage;
  sourceUrl: string | null;
  metadata?: DocumentMetadata;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type CorpusDocumentInput = Omit<
  CorpusDocument,
  'id' | 'code' | 'processingStage' | 'createdAt' | 'updatedAt'
>;