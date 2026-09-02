import {
  Timestamp
} from '@angular/fire/firestore';

export interface ChunkMetadata {
  documentTitle?: string;
  documentType?: string;
  chapter?: string;
  chapterTitle?: string;
  section?: string;
  article?: string;
  subsection?: string;
  validity?: string;
  [key: string]:
    string |
    number |
    boolean |
    null |
    undefined;
}

export interface Chunk {
  id?: string;
  code: string;
  documentId: string;
  sourceFileId: string;
  sequence: number;
  content: string;
  pageStart: number | null;
  pageEnd: number | null;
  metadata: ChunkMetadata;
  active: boolean;
  revision: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}