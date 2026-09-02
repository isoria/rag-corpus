import {
  inject,
  Injectable
} from '@angular/core';

import {
  Firestore,
  collection,
  getDocs,
  query,
  where
} from '@angular/fire/firestore';

import {
  Chunk
} from '../models/chunk.model';


@Injectable({
  providedIn: 'root'
})
export class ExportService {

  private firestore =
    inject(Firestore);


  async exportJsonl(): Promise<number> {

    const documentsRef =
      collection(
        this.firestore,
        'documents'
      );

    const documentsSnapshot =
      await getDocs(
        documentsRef
      );


    const exported:
      {
        documentCode: string;
        sequence: number;
        data: unknown;
      }[] = [];


    for (
      const documentSnapshot
      of documentsSnapshot.docs
    ) {

      const documentData =
        documentSnapshot.data();

      const documentCode =
        String(
          documentData['code']
        );


      const chunksRef =
        collection(
          this.firestore,
          'documents',
          documentSnapshot.id,
          'chunks'
        );


      const chunksQuery =
        query(
          chunksRef,

          where(
            'active',
            '==',
            true
          )
        );


      const chunksSnapshot =
        await getDocs(
          chunksQuery
        );


      for (
        const chunkSnapshot
        of chunksSnapshot.docs
      ) {

        const chunk =
          chunkSnapshot.data() as Chunk;


        exported.push({

          documentCode,

          sequence:
            chunk.sequence,

          data: {

            page_content:
              chunk.content,

            metadata: {

              document_id:
                documentSnapshot.id,

              document_code:
                documentCode,

              chunk_id:
                chunkSnapshot.id,

              chunk_code:
                chunk.code,

              source_file_id:
                chunk.sourceFileId,

              page_start:
                chunk.pageStart,

              page_end:
                chunk.pageEnd,

              ...chunk.metadata
            }
          }
        });
      }
    }


    exported.sort(
      (a, b) => {

        const documentCompare =
          a.documentCode.localeCompare(
            b.documentCode
          );

        if (
          documentCompare !== 0
        ) {
          return documentCompare;
        }

        return (
          a.sequence -
          b.sequence
        );
      }
    );


    const jsonl =
      exported
        .map(
          item =>
            JSON.stringify(
              item.data
            )
        )
        .join('\n');


    const blob =
      new Blob(
        [jsonl],
        {
          type:
            'application/x-ndjson;charset=utf-8'
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const anchor =
      window.document
        .createElement('a');

    anchor.href =
      url;

    anchor.download =
      'chunks.jsonl';

    anchor.click();


    URL.revokeObjectURL(
      url
    );


    return exported.length;
  }
}