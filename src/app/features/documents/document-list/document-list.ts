import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DocumentService } from '../../../core/services/document.service';

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

  private documentService =
    inject(DocumentService);

  documents$ =
    this.documentService.documents$;
}