import {
  Component,
  inject,
  Input,
  OnChanges
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import {
  CorpusDocument
} from '../../../core/models/corpus-document.model';

import {
  DocumentService
} from '../../../core/services/document.service';


@Component({
  selector: 'app-document-metadata',

  standalone: true,

  imports: [
    ReactiveFormsModule
  ],

  templateUrl:
    './document-metadata.html'
})
export class DocumentMetadata
  implements OnChanges {

  @Input({
    required: true
  })
  document!: CorpusDocument;


  private fb =
    inject(FormBuilder);

  private documentService =
    inject(DocumentService);


  saving = false;


  form = this.fb.group({

    resolution: [''],

    approvalDate: [''],

    pages: [
      null as number | null
    ],

    language: ['es'],

    description: [''],

    keywords: [''],

    notes: ['']

  });


  ngOnChanges(): void {

    const metadata =
      this.document?.metadata;

    if (!metadata) {
      return;
    }

    this.form.patchValue({

      resolution:
        metadata.resolution ?? '',

      approvalDate:
        metadata.approvalDate ?? '',

      pages:
        metadata.pages ?? null,

      language:
        metadata.language ?? 'es',

      description:
        metadata.description ?? '',

      keywords:
        metadata.keywords?.join(', ') ?? '',

      notes:
        metadata.notes ?? ''

    });
  }


  async save(): Promise<void> {

    if (!this.document.id) {
      return;
    }

    this.saving = true;

    try {

      const value =
        this.form.getRawValue();

      const keywords =
        (value.keywords ?? '')
          .split(',')
          .map(x => x.trim())
          .filter(x => x.length > 0);

      await this.documentService
        .updateMetadata(
          this.document.id,
          {
            resolution:
              value.resolution?.trim() || null,

            approvalDate:
              value.approvalDate || null,

            pages:
              value.pages,

            language:
              value.language?.trim() || 'es',

            description:
              value.description?.trim() || null,

            keywords,

            notes:
              value.notes?.trim() || null
          }
        );

    } finally {

      this.saving = false;
    }
  }
}