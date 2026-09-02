import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import {
  CorpusDocument,
  CorpusDocumentInput
} from '../models/corpus-document.model';

import {
  DocumentMetadata
} from '../models/document-metadata.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private firestore = inject(Firestore);

  private documentsCollection =
    collection(this.firestore, 'documents');

  readonly documents$: Observable<CorpusDocument[]> =
    collectionData(
      query(
        this.documentsCollection,
        orderBy('code', 'asc')
      ),
      {
        idField: 'id'
      }
    ) as Observable<CorpusDocument[]>;


  async create(data: CorpusDocumentInput): Promise<string> {

    const counterRef =
      doc(this.firestore, 'counters', 'documents');

    return runTransaction(
      this.firestore,

      async transaction => {

        const counterSnapshot =
          await transaction.get(counterRef);

        let next = 1;

        if (counterSnapshot.exists()) {
          next =
            (counterSnapshot.data()['last'] ?? 0) + 1;
        }

        const code =
          `DOC${String(next).padStart(6, '0')}`;

        const documentRef =
          doc(this.documentsCollection);

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
          documentRef,
          {
            ...data,

            code,

            processingStage: 'INGESTED',

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
        );

        return documentRef.id;
      }
    );
  }


  async getById(
    id: string
  ): Promise<CorpusDocument | null> {

    const documentRef =
      doc(this.firestore, 'documents', id);

    const snapshot =
      await getDoc(documentRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    } as CorpusDocument;
  }


  async update(
    id: string,
    data: CorpusDocumentInput
  ): Promise<void> {

    const documentRef =
      doc(this.firestore, 'documents', id);

    await updateDoc(
      documentRef,
      {
        ...data,
        updatedAt: serverTimestamp()
      }
    );
  }

  async updateMetadata(
  documentId: string,
  metadata: DocumentMetadata
): Promise<void> {

  const documentRef = doc(
    this.firestore,
    'documents',
    documentId
  );

  await updateDoc(
    documentRef,
    {
      metadata,

      processingStage:
        'METADATA',

      updatedAt:
        serverTimestamp()
    }
  );
}
}