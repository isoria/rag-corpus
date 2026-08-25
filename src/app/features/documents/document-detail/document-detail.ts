import {
  AsyncPipe,
  DatePipe
} from '@angular/common';

import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { Observable } from 'rxjs';

import {
  CorpusDocument
} from '../../../core/models/corpus-document.model';

import {
  DocumentFile
} from '../../../core/models/document-file.model';

import {
  DocumentService
} from '../../../core/services/document.service';

import {
  DocumentFileService
} from '../../../core/services/document-file.service';


@Component({
  selector: 'app-document-detail',
  standalone: true,

  imports: [
    AsyncPipe,
    RouterLink
  ],

  templateUrl:
    './document-detail.html',

  styleUrl:
    './document-detail.css'
})
export class DocumentDetail
  implements OnInit {

  private route =
    inject(ActivatedRoute);

  private documentService =
    inject(DocumentService);

  private documentFileService =
    inject(DocumentFileService);


  document:
    CorpusDocument | null = null;

  files$:
    Observable<DocumentFile[]> | null = null;

  selectedFile:
    File | null = null;

  uploading =
    false;

  errorMessage =
    '';


  async ngOnInit(): Promise<void> {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.document =
      await this.documentService.getById(id);

    if (!this.document) {
      return;
    }

    this.files$ =
      this.documentFileService.files$(id);
  }


  onFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    this.selectedFile =
      input.files?.[0] ?? null;
  }


  async uploadOriginal(): Promise<void> {

    if (
      !this.document?.id ||
      !this.selectedFile
    ) {
      return;
    }

    this.errorMessage = '';
    this.uploading = true;

    try {

      await this.documentFileService
        .uploadOriginal(
          this.document.id,
          this.document.code,
          this.selectedFile
        );

      this.selectedFile = null;

    } catch (error) {

      console.error(error);

      this.errorMessage =
        'No se pudo cargar el archivo.';

    } finally {

      this.uploading = false;
    }
  }


  formatBytes(
    bytes: number
  ): string {

    if (bytes === 0) {
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