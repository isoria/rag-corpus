export interface Chunk {
  id?: string;

  code: string;
  documentId: string;
  sourceFileId?: string;

  sequence: number;

  content: string;

  pageStart?: number;
  pageEnd?: number;

  chapter?: string;
  chapterTitle?: string;

  section?: string;
  article?: string;
  subsection?: string;

  active: boolean;
  revision: number;

  metadata?: Record<string, unknown>;

  createdAt?: Date;
  updatedAt?: Date;
}