export interface ChunkRevision {
  id?: string;

  chunkId: string;
  revision: number;

  content: string;

  reason:
    | 'ERROR_OCR'
    | 'ERROR_TRANSCRIPCION'
    | 'ERROR_CHUNKING'
    | 'METADATO_INCORRECTO'
    | 'OTRO';

  observation?: string;

  createdAt?: Date;
}