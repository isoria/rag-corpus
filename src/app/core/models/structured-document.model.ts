export interface StructuredNodeSource {
  start_char: number;
  end_char: number;

  page_start: number | null;
  page_end: number | null;
}

export interface StructuredNode {
  id: string;

  type: string;

  number: string | null;
  title: string | null;

  text: string;

  source: StructuredNodeSource;

  text_sha256: string | null;

  chunkable: boolean;

  children: StructuredNode[];
}

export interface StructuredDocument {
  schema_version: string;

  source_clean: {
    file_id: string;
    version: number;
    sha256: string | null;
  };

  structure: StructuredNode[];
}