import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CorpusDocument } from '../../../core/models/corpus-document.model';
import { DocumentFile, DocumentFileStage } from '../../../core/models/document-file.model';
import { DocumentService } from '../../../core/services/document.service';
import { DocumentFileService } from '../../../core/services/document-file.service';
import { DocumentMetadata } from '../document-metadata/document-metadata';
import { ChunkEditor } from '../../chunks/chunk-editor/chunk-editor';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    DocumentMetadata,
    ChunkEditor
  ],
  templateUrl: './document-detail.html',
  styleUrl: './document-detail.css'
})
export class DocumentDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private documentService = inject(DocumentService);
  private fileService = inject(DocumentFileService);
  document: CorpusDocument | null = null;
  files$: Observable<DocumentFile[]> | null = null;
  selectedFiles: Partial< Record<DocumentFileStage, File[]>> = {};
  uploadingStage: DocumentFileStage | null = null;
  errorMessage = '';

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.document = await this.documentService.getById(id);

    if (!this.document) {
      return;
    }

    this.files$ =
      this.fileService.files$(id);
  }

  onFilesSelected( event: Event, stage: DocumentFileStage ): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles[stage] = input.files
        ? Array.from(input.files)
        : [];
  }

  async upload( stage: DocumentFileStage ): Promise<void> {
    if (!this.document?.id) {
      return;
    }

    const files = this.selectedFiles[stage];

    if (!files?.length) {
      return;
    }

    this.errorMessage = '';
    this.uploadingStage = stage;

    try {

      await this.fileService.uploadFiles(
        this.document.id,
        this.document.code,
        stage,
        files
      );

      this.selectedFiles[stage] = [];

      /*
       * Recargamos los datos generales
       * porque processingStage cambió.
       */
      this.document =
        await this.documentService.getById(
          this.document.id
        );

    } catch (error) {

      console.error(error);

      this.errorMessage =
        `No se pudieron cargar los archivos de la etapa ${stage}.`;

    } finally {

      this.uploadingStage = null;
    }
  }


  hasFilesSelected(
    stage: DocumentFileStage
  ): boolean {

    return !!this.selectedFiles[stage]?.length;
  }


  formatBytes(
    bytes: number
  ): string {

    if (!bytes) {
      return '0 B';
    }

    const units = [
      'B',
      'KB',
      'MB',
      'GB'
    ];

    const index =
      Math.floor(
        Math.log(bytes) /
        Math.log(1024)
      );

    return (
      (
        bytes /
        Math.pow(1024, index)
      ).toFixed(2) +
      ' ' +
      units[index]
    );
  }
}