import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DocumentService } from '../../../core/services/document.service';

import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink
  ],
  templateUrl: './document-list.html',
  styleUrl: './document-list.css'
})
export class DocumentList {

  readonly exportService =
    inject(ExportService);

  exporting = false;

  exportMessage = '';

  private documentService =
    inject(DocumentService);

  documents$ =
    this.documentService.documents$;

  async exportDataset(): Promise<void> {

  this.exporting =
    true;

  try {

    const count =
      await this.exportService
        .exportJsonl();

    this.exportMessage =
      `${count} chunks exportados.`;

  } finally {

    this.exporting =
      false;
  }
}
}