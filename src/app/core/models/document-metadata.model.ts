export interface DocumentMetadata {
  resolution?: string | null;
  approvalDate?: string | null;
  pages?: number | null;
  language?: string | null;
  description?: string | null;
  keywords?: string[];
  notes?: string | null;
}