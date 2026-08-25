import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { DocumentService } from '../../../core/services/document.service';
import {
  CorpusDocumentInput,
  ValidityStatus
} from '../../../core/models/corpus-document.model';

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './document-form.html',
  styleUrl: './document-form.css'
})
export class DocumentForm implements OnInit {

  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  documentId: string | null = null;

  saving = false;

  form = this.fb.group({

    title: [
      '',
      [
        Validators.required
      ]
    ],

    documentType: [
      '',
      [
        Validators.required
      ]
    ],

    year: [
      new Date().getFullYear()
    ],

    responsibleUnit: [
      ''
    ],

    publicationDate: [
      ''
    ],

    validityStatus: [
      'VIGENTE' as ValidityStatus,
      [
        Validators.required
      ]
    ],

    sourceUrl: [
      ''
    ]

  });


  async ngOnInit(): Promise<void> {

    this.documentId =
      this.route.snapshot.paramMap.get('id');

    if (!this.documentId) {
      return;
    }

    const document =
      await this.documentService.getById(
        this.documentId
      );

    if (!document) {
      return;
    }

    this.form.patchValue({

      title:
        document.title,

      documentType:
        document.documentType,

      year:
        document.year,

      responsibleUnit:
        document.responsibleUnit ?? '',

      publicationDate:
        document.publicationDate ?? '',

      validityStatus:
        document.validityStatus,

      sourceUrl:
        document.sourceUrl ?? ''

    });
  }


  async save(): Promise<void> {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    this.saving = true;

    try {

      const value =
        this.form.getRawValue();

      const data: CorpusDocumentInput = {

        title:
          value.title!.trim(),

        documentType:
          value.documentType!.trim(),

        year:
          value.year ?? null,

        responsibleUnit:
          value.responsibleUnit?.trim() || null,

        publicationDate:
          value.publicationDate || null,

        validityStatus:
          value.validityStatus!,

        sourceUrl:
          value.sourceUrl?.trim() || null

      };


      if (this.documentId) {

        await this.documentService.update(
          this.documentId,
          data
        );

      } else {

        // await this.documentService.create(
        //   data
        // );
      }

      await this.router.navigate([
        '/documents'
      ]);

    } finally {

      this.saving = false;
    }
  }


  cancel(): void {

    this.router.navigate([
      '/documents'
    ]);
  }
}