import {
  AsyncPipe,
} from '@angular/common';

import {
  Component,
  inject,
  Input,
  OnChanges
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  ChunkRevision
} from '../../../core/models/chunk-revision.model';

import {
  ChunkService
} from '../../../core/services/chunk.service';


@Component({
  selector:
    'app-chunk-history',

  standalone: true,

  imports: [
    AsyncPipe,
  ],

  templateUrl:
    './chunk-history.html'
})
export class ChunkHistory
  implements OnChanges {

  @Input({
    required: true
  })
  documentId!: string;


  @Input({
    required: true
  })
  chunkId!: string;


  private chunkService =
    inject(ChunkService);


  revisions$:
    Observable<ChunkRevision[]> | null =
      null;


  ngOnChanges(): void {

    if (
      !this.documentId ||
      !this.chunkId
    ) {
      return;
    }

    this.revisions$ =
      this.chunkService.revisions$(
        this.documentId,
        this.chunkId
      );
  }
}