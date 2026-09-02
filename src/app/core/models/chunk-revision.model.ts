import { Timestamp } from '@angular/fire/firestore';
import { ChunkMetadata } from './chunk.model';

export type ChunkRevisionReason =
  | 'ERROR_OCR'
  | 'ERROR_TRANSCRIPCION'
  | 'ERROR_CHUNKING'
  | 'METADATO_INCORRECTO'
  | 'OTRO';

export interface ChunkRevision {
  id?: string;
  revision: number;
  sourceFileId: string;
  sequence: number;
  content: string;
  pageStart: number | null;
  pageEnd: number | null;
  metadata: ChunkMetadata;
  active: boolean;
  reason: ChunkRevisionReason;
  observation: string | null;
  createdAt?: Timestamp;
}