import { AsyncPipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CorpusDocument } from '../../../core/models/corpus-document.model';
import { DocumentFile } from '../../../core/models/document-file.model';
import { Chunk } from '../../../core/models/chunk.model';
import { DocumentFileService } from '../../../core/services/document-file.service';
import { ChunkService } from '../../../core/services/chunk.service';
import { ChunkRevisionReason } from '../../../core/models/chunk-revision.model';
import { ChunkHistory } from '../chunk-history/chunk-history';

@Component({
  selector: 'app-chunk-editor',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    ChunkHistory,
  ],
  templateUrl:
    './chunk-editor.html'
})

export class ChunkEditor implements OnInit {

  @Input({ 
    required: true
  }) document!: CorpusDocument;

  private fb = inject(FormBuilder);
  private fileService = inject(DocumentFileService);
  readonly chunkService = inject(ChunkService);

  files$!: Observable<DocumentFile[]>;
  chunks$!: Observable<Chunk[]>;
  editingChunk: Chunk | null = null;
  reason: ChunkRevisionReason = 'ERROR_OCR';

  numTokens = 0;
  
  observation = '';
  historyChunk: Chunk | null = null;
  sourceText = '';
  saving = false;


  form = this.fb.group({
    sourceFileId: [ '', Validators.required],
    pageStart: [ null as number | null ],
    pageEnd: [ null as number | null ],
    chapter: [''],
    chapterTitle: [''],
    section: [''],
    article: [''],
    subsection: [''],
    content: [ '', Validators.required ]
  });

  ngOnInit(): void {
    if (!this.document.id) {
      return;
    }
    this.files$ = this.fileService.files$(this.document.id);
    this.chunks$ = this.chunkService.chunks$(this.document.id);
  }

  async selectSource( file: DocumentFile ): Promise<void> {
    this.form.patchValue({
      sourceFileId:
        file.id ?? ''
    });
    if (
      file.mimeType.startsWith('text/') ||
      file.filename.endsWith('.txt') ||
      file.filename.endsWith('.md') ||
      file.filename.endsWith('.json')
    ) {
      this.sourceText = await this.fileService.readTextFile( file.storagePath );
    } 
    else {
      this.sourceText = 'El archivo seleccionado no es un archivo de texto.';
    }
  }

  copySelection(): void {
    const selection = window.getSelection()?.toString();
    if (!selection) {
      return;
    }
    this.form.patchValue({
      content: selection
    });
  }
  
  countTokens(): void {
    const selection = window.getSelection()?.toString();
    if (!selection) {
      return;
    }
    const tokens = selection.split(/\s+/).filter(token => token.length > 0);
    this.numTokens = tokens.length;
  }


  async save(): Promise<void> {
    if ( this.form.invalid || !this.document.id ){
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    try {
      const value = this.form.getRawValue();
      const input = {
        sourceFileId: value.sourceFileId!,
        content: value.content!,
        pageStart: value.pageStart,
        pageEnd: value.pageEnd,
        metadata: {
          documentTitle: this.document.title,
          documentType: this.document.documentType,
          validity: this.document.validityStatus,
          chapter: value.chapter || undefined,
          chapterTitle: value.chapterTitle || undefined,
          section: value.section || undefined,
          article:  value.article || undefined,
          subsection: value.subsection || undefined
        }
      };
      if (this.editingChunk?.id) {
        await this.chunkService.updateWithRevision(
            this.document.id,
            this.editingChunk.id,
            input,
            this.reason,
            this.observation
          );
      } 
      else {
        await this.chunkService.create(
            this.document.id,
            this.document.code,
            input
          );
      }
      this.editingChunk = null;
      this.observation = '';
      this.form.patchValue({
        content: '',
        article: '',
        subsection: ''
      });
    } 
    finally {
      this.saving = false;
    }
  }

  edit(chunk: Chunk): void {
    this.editingChunk = chunk;
    this.form.patchValue({
      sourceFileId: chunk.sourceFileId,
      pageStart: chunk.pageStart,
      pageEnd: chunk.pageEnd,
      chapter: chunk.metadata.chapter ?? '',
      chapterTitle: chunk.metadata.chapterTitle ?? '',
      section: chunk.metadata.section ?? '',
      article: chunk.metadata.article ?? '',
      subsection: chunk.metadata.subsection ?? '',
      content: chunk.content
    });
    this.reason = 'ERROR_OCR';
    this.observation =  '';
  }

  cancelEdit(): void {
    this.editingChunk = null;
    this.observation = '';
    this.form.patchValue({
      content: '',
      article: '',
      subsection: ''

    });
  }
}