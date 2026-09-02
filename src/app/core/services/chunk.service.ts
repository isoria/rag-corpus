import {
  inject,
  Injectable
} from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  doc,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc
} from '@angular/fire/firestore';

import {
  Observable
} from 'rxjs';

import {
  Chunk,
  ChunkMetadata
} from '../models/chunk.model';

import {
  ChunkRevision,
  ChunkRevisionReason
} from '../models/chunk-revision.model';


export interface ChunkInput {

  sourceFileId: string;

  sequence?: number;

  content: string;

  pageStart: number | null;

  pageEnd: number | null;

  metadata: ChunkMetadata;
}


@Injectable({
  providedIn: 'root'
})
export class ChunkService {

  private firestore =
    inject(Firestore);


  chunks$(
    documentId: string
  ): Observable<Chunk[]> {

    const chunksRef =
      collection(
        this.firestore,
        'documents',
        documentId,
        'chunks'
      );

    const q =
      query(
        chunksRef,
        orderBy('sequence', 'asc')
      );

    return collectionData(
      q,
      {
        idField: 'id'
      }
    ) as Observable<Chunk[]>;
  }


  revisions$(
    documentId: string,
    chunkId: string
  ): Observable<ChunkRevision[]> {

    const revisionsRef =
      collection(
        this.firestore,
        'documents',
        documentId,
        'chunks',
        chunkId,
        'revisions'
      );

    const q =
      query(
        revisionsRef,
        orderBy('revision', 'desc')
      );

    return collectionData(
      q,
      {
        idField: 'id'
      }
    ) as Observable<ChunkRevision[]>;
  }


  async create(
    documentId: string,
    documentCode: string,
    input: ChunkInput
  ): Promise<string> {

    const counterRef =
      doc(
        this.firestore,
        'documents',
        documentId,
        'counters',
        'chunks'
      );

    return runTransaction(
      this.firestore,

      async transaction => {

        const counterSnapshot =
          await transaction.get(
            counterRef
          );

        const next =
          counterSnapshot.exists()
            ? Number(
                counterSnapshot
                  .data()['last'] ?? 0
              ) + 1
            : 1;


        const code =
          `${documentCode}-CHK${String(next).padStart(4, '0')}`;


        const chunkRef =
          doc(
            collection(
              this.firestore,
              'documents',
              documentId,
              'chunks'
            )
          );


        transaction.set(
          counterRef,
          {
            last: next
          },
          {
            merge: true
          }
        );


        transaction.set(
          chunkRef,
          {
            code,

            documentId,

            sourceFileId:
              input.sourceFileId,

            sequence:
              input.sequence ?? next,

            content:
              input.content.trim(),

            pageStart:
              input.pageStart,

            pageEnd:
              input.pageEnd,

            metadata:
              this.cleanMetadata(
                input.metadata
              ),

            active: true,

            revision: 1,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()
          }
        );


        const documentRef =
          doc(
            this.firestore,
            'documents',
            documentId
          );

        transaction.update(
          documentRef,
          {
            processingStage:
              'CHUNKED',

            updatedAt:
              serverTimestamp()
          }
        );


        return chunkRef.id;
      }
    );
  }


  async updateWithRevision(
    documentId: string,
    chunkId: string,
    input: ChunkInput,
    reason: ChunkRevisionReason,
    observation: string | null
  ): Promise<void> {

    const chunkRef =
      doc(
        this.firestore,
        'documents',
        documentId,
        'chunks',
        chunkId
      );


    const revisionRef =
      doc(
        collection(
          this.firestore,
          'documents',
          documentId,
          'chunks',
          chunkId,
          'revisions'
        )
      );


    await runTransaction(
      this.firestore,

      async transaction => {

        const snapshot =
          await transaction.get(
            chunkRef
          );

        if (!snapshot.exists()) {

          throw new Error(
            'Chunk no encontrado.'
          );
        }


        const current =
          snapshot.data() as Chunk;


        /*
         * Guardamos el estado ANTERIOR
         * del chunk.
         */
        transaction.set(
          revisionRef,
          {
            revision:
              current.revision,

            sourceFileId:
              current.sourceFileId,

            sequence:
              current.sequence,

            content:
              current.content,

            pageStart:
              current.pageStart ?? null,

            pageEnd:
              current.pageEnd ?? null,

            metadata:
              this.cleanMetadata(
                current.metadata ?? {}
              ),

            active:
              current.active,

            reason,

            observation:
              observation?.trim() || null,

            createdAt:
              serverTimestamp()
          }
        );


        /*
         * Actualizamos el chunk.
         */
        transaction.update(
          chunkRef,
          {
            sourceFileId:
              input.sourceFileId,

            sequence:
              input.sequence ??
              current.sequence,

            content:
              input.content.trim(),

            pageStart:
              input.pageStart,

            pageEnd:
              input.pageEnd,

            metadata:
              this.cleanMetadata(
                input.metadata
              ),

            revision:
              current.revision + 1,

            updatedAt:
              serverTimestamp()
          }
        );
      }
    );
  }


  async deactivate(
    documentId: string,
    chunkId: string
  ): Promise<void> {

    const chunkRef =
      doc(
        this.firestore,
        'documents',
        documentId,
        'chunks',
        chunkId
      );

    await updateDoc(
      chunkRef,
      {
        active: false,
        updatedAt: serverTimestamp()
      }
    );
  }


  async activate(
    documentId: string,
    chunkId: string
  ): Promise<void> {

    const chunkRef =
      doc(
        this.firestore,
        'documents',
        documentId,
        'chunks',
        chunkId
      );

    await updateDoc(
      chunkRef,
      {
        active: true,
        updatedAt: serverTimestamp()
      }
    );
  }


  private cleanMetadata(
    metadata: ChunkMetadata
  ): ChunkMetadata {

    return Object.fromEntries(

      Object.entries(metadata)
        .filter(
          ([_, value]) =>
            value !== undefined
        )

    ) as ChunkMetadata;
  }
}