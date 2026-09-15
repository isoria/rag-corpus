import {
  Timestamp
} from '@angular/fire/firestore';

export type ChunkCreationMethod =
  | 'CLEAN_SELECTION'
  | 'STRUCTURED_SELECTION'
  | 'STRUCTURED_AUTOMATIC';

export interface ChunkSourceSpan {
  nodeId: string;

  startChar: number;
  endChar: number;

  pageStart: number | null;
  pageEnd: number | null;

  textSha256?: string;
}

export interface ChunkStructuredSource {
  fileId: string;
  fileVersion: number;

  nodeIds: string[];
}

export interface ChunkCleanSource {
  fileId: string;
  fileVersion: number;
  sha256?: string | null;
}

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

  creationMethod: ChunkCreationMethod;

  cleanSource?: ChunkCleanSource;

  structuredSource?: ChunkStructuredSource | null;

  sourceSpans?: ChunkSourceSpan[];

  pageStart: number | null;
  pageEnd: number | null;

  metadata: ChunkMetadata;
  
  active: boolean;
  revision: number;
 
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}