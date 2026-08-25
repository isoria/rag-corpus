import { inject, Injectable } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  addDoc
} from '@angular/fire/firestore';

import {
  Storage,
  ref,
  uploadBytes
} from '@angular/fire/storage';

import { Observable } from 'rxjs';

import {
  DocumentFile,
  DocumentFileStage
} from '../models/document-file.model';


@Injectable({
  providedIn: 'root'
})
export class DocumentFileService {

  private firestore = inject(Firestore);
  private storage = inject(Storage);


  files$(
    documentId: string
  ): Observable<DocumentFile[]> {

    const filesRef = collection(
      this.firestore,
      'documents',
      documentId,
      'files'
    );

    return collectionData(
      filesRef,
      {
        idField: 'id'
      }
    ) as Observable<DocumentFile[]>;
  }


  async uploadOriginal(
    documentId: string,
    documentCode: string,
    file: File
  ): Promise<string> {

    const version =
      await this.getNextVersion(
        documentId,
        'ORIGINAL'
      );

    const sha256 =
      await this.calculateSha256(file);

    await this.markPreviousAsNotCurrent(
      documentId,
      'ORIGINAL'
    );

    const storagePath =
      `corpus/${documentCode}/original/v${version}/${file.name}`;

    const storageRef =
      ref(
        this.storage,
        storagePath
      );

    await uploadBytes(
      storageRef,
      file,
      {
        contentType:
          file.type || 'application/octet-stream',

        customMetadata: {
          documentId,
          documentCode,
          stage: 'ORIGINAL',
          version: String(version),
          sha256
        }
      }
    );

    const filesRef = collection(
      this.firestore,
      'documents',
      documentId,
      'files'
    );

    const result = await addDoc(
      filesRef,
      {
        documentId,

        stage: 'ORIGINAL',

        version,

        filename:
          file.name,

        storagePath,

        mimeType:
          file.type || 'application/octet-stream',

        size:
          file.size,

        sha256,

        current:
          true,

        createdAt:
          serverTimestamp()
      }
    );

    return result.id;
  }


  private async getNextVersion(
    documentId: string,
    stage: DocumentFileStage
  ): Promise<number> {

    const filesRef = collection(
      this.firestore,
      'documents',
      documentId,
      'files'
    );

    const q = query(
      filesRef,
      where(
        'stage',
        '==',
        stage
      )
    );

    const snapshot =
      await getDocs(q);

    if (snapshot.empty) {
      return 1;
    }

    const versions =
      snapshot.docs.map(
        item =>
          Number(
            item.data()['version'] ?? 0
          )
      );

    return Math.max(...versions) + 1;
  }


  private async markPreviousAsNotCurrent(
    documentId: string,
    stage: DocumentFileStage
  ): Promise<void> {

    const filesRef = collection(
      this.firestore,
      'documents',
      documentId,
      'files'
    );

    const q = query(
      filesRef,

      where(
        'stage',
        '==',
        stage
      ),

      where(
        'current',
        '==',
        true
      )
    );

    const snapshot =
      await getDocs(q);

    for (
      const fileSnapshot
      of snapshot.docs
    ) {

      const fileRef = doc(
        this.firestore,
        'documents',
        documentId,
        'files',
        fileSnapshot.id
      );

      await updateDoc(
        fileRef,
        {
          current: false
        }
      );
    }
  }


  private async calculateSha256(
    file: File
  ): Promise<string> {

    const buffer =
      await file.arrayBuffer();

    const hashBuffer =
      await crypto.subtle.digest(
        'SHA-256',
        buffer
      );

    const hashArray =
      Array.from(
        new Uint8Array(hashBuffer)
      );

    return hashArray
      .map(
        byte =>
          byte
            .toString(16)
            .padStart(2, '0')
      )
      .join('');
  }
}