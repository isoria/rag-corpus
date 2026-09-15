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
import {
  StructuredDocument,
  StructuredNode
} from '../../../core/models/structured-document.model';

import {
  ChunkSourceSpan
} from '../../../core/models/chunk.model';

interface SelectableStructuredNode {
  node: StructuredNode;

  path: string[];

  selected: boolean;
}

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

  sourceMode:
    'CLEAN' | 'STRUCTURED' =
    'CLEAN';

  structuredFile:
    DocumentFile | null =
    null;

  structuredDocument:
    StructuredDocument | null =
    null;

  structuredNodes:
    SelectableStructuredNode[] =
    [];

  pendingSourceSpans:
    ChunkSourceSpan[] =
    [];

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
    sourceFileId: ['', Validators.required],
    pageStart: [null as number | null],
    pageEnd: [null as number | null],
    chapter: [''],
    chapterTitle: [''],
    section: [''],
    article: [''],
    subsection: [''],
    content: ['', Validators.required]
  });

  ngOnInit(): void {
    if (!this.document.id) {
      return;
    }
    this.files$ = this.fileService.files$(this.document.id);
    this.chunks$ = this.chunkService.chunks$(this.document.id);
  }

  async selectSource(file: DocumentFile): Promise<void> {
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
      this.sourceText = await this.fileService.readTextFile(file.storagePath);
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
    if (this.form.invalid || !this.document.id) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    try {
      const value = this.form.getRawValue();
      const selectedNodeIds =
        this.pendingSourceSpans
          .map(span => span.nodeId)
          .filter(
            (id): id is string =>
              id !== null
          );

      const input = {
        sourceFileId:
          value.sourceFileId!,

        content:
          value.content!,

        creationMethod:
          this.sourceMode === 'STRUCTURED'
            ? 'STRUCTURED_SELECTION' as const
            : 'CLEAN_SELECTION' as const,

        cleanSource: {
          fileId:
            value.sourceFileId!,

          fileVersion:
            this.structuredDocument
              ?.source_clean.version ?? 1,

          sha256:
            this.structuredDocument
              ?.source_clean.sha256 ?? null
        },

        structuredSource:
          this.sourceMode === 'STRUCTURED' &&
            this.structuredFile?.id
            ? {
              fileId:
                this.structuredFile.id,

              fileVersion:
                this.structuredFile.version ?? 1,

              nodeIds:
                selectedNodeIds
            }
            : null,

        sourceSpans:
          this.pendingSourceSpans,

        pageStart:
          value.pageStart,

        pageEnd:
          value.pageEnd,

        metadata: {
          documentTitle:
            this.document.title,

          documentType:
            this.document.documentType,

          validity:
            this.document.validityStatus,

          chapter:
            value.chapter || undefined,

          chapterTitle:
            value.chapterTitle || undefined,

          section:
            value.section || undefined,

          article:
            value.article || undefined,

          subsection:
            value.subsection || undefined
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
    this.observation = '';
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

  async selectStructuredSource(
    file: DocumentFile
  ): Promise<void> {

    const raw =
      await this.fileService
        .readTextFile(
          file.storagePath
        );

    console.log(raw);

      
    const parsed =
      JSON.parse(raw) as StructuredDocument;

    console.log(parsed)

    if (
      !parsed.source_clean ||
      !Array.isArray(parsed.structure)
    ) {
      throw new Error(
        'El JSON estructurado no tiene el formato esperado.'
      );
    }

    this.sourceMode =
      'STRUCTURED';

    console.log("tipo:", this.sourceMode)

    this.structuredFile =
      file;

    this.structuredDocument =
      parsed;

    this.structuredNodes =
      this.structuredNodes.map(
        item => ({
          ...item,
          selected: false
        })
      );
    this.form.patchValue({
      sourceFileId:
        parsed.source_clean.file_id
    });
  }

  private flattenNodes(
    nodes: StructuredNode[],
    ancestors: string[] = []
  ): SelectableStructuredNode[] {

    return nodes.flatMap(node => {

      const label =
        [
          node.type,
          node.number,
          node.title
        ]
          .filter(Boolean)
          .join(' ');

      const path = [
        ...ancestors,
        label
      ];

      const current:
        SelectableStructuredNode[] =
        node.chunkable &&
          node.text?.trim()
          ? [{
            node,
            path,
            selected: false
          }]
          : [];

      return [
        ...current,

        ...this.flattenNodes(
          node.children ?? [],
          path
        )
      ];
    });
  }

  buildChunkFromSelectedNodes(): void {

    const selected =
      this.structuredNodes
        .filter(
          item => item.selected
        )
        .sort(
          (a, b) =>
            a.node.source.start_char -
            b.node.source.start_char
        );

    if (selected.length === 0) {
      return;
    }

    const content =
      selected
        .map(
          item =>
            item.node.text.trim()
        )
        .join('\n\n');

    this.pendingSourceSpans = [];
      // selected.map(item => ({
      //   nodeId:
      //     item.node.id,

      //   startChar:
      //     item.node.source.start_char,

      //   endChar:
      //     item.node.source.end_char,

      //   pageStart:
      //     item.node.source.page_start,

      //   pageEnd:
      //     item.node.source.page_end,

      //   textSha256:
      //     item.node.text_sha256
      // }));

    const pagesStart =
      this.pendingSourceSpans
        .map(span => span.pageStart)
        .filter(
          (page): page is number =>
            page !== null
        );

    const pagesEnd =
      this.pendingSourceSpans
        .map(span => span.pageEnd)
        .filter(
          (page): page is number =>
            page !== null
        );

    this.form.patchValue({
      content,

      pageStart:
        pagesStart.length
          ? Math.min(...pagesStart)
          : null,

      pageEnd:
        pagesEnd.length
          ? Math.max(...pagesEnd)
          : null
    });
  }
}