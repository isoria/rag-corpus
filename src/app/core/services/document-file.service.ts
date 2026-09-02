import { inject, Injectable } from '@angular/core';

import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from '@angular/fire/firestore';

import {
  Storage,
  ref,
  uploadBytes
} from '@angular/fire/storage';

import { Observable, forkJoin, from, of, switchMap, map } from 'rxjs';

import {
  DocumentFile,
  DocumentFileStage
} from '../models/document-file.model';

import {
  getDownloadURL
} from '@angular/fire/storage';

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

    const q = query(
      filesRef,
      orderBy('createdAt', 'asc')
    );

  return (
    collectionData(q, {
      idField: 'id'
    }) as Observable<DocumentFile[]>
  ).pipe(

    switchMap(files => {

      if (files.length === 0) {
        return of([]);
      }

      return forkJoin(
        files.map(file => {

          const fileRef = ref(
            this.storage,
            file.storagePath
          );

          return from(
            getDownloadURL(fileRef)
          ).pipe(
            map(url => ({
              ...file,
              url
            }))
          );

        })
      );
        })

  );
  }


  async uploadFiles(
    documentId: string,
    documentCode: string,
    stage: DocumentFileStage,
    files: File[]
  ): Promise<void> {

    if (files.length === 0) {
      return;
    }

    const version =
      await this.getNextVersion(
        documentId,
        stage
      );

    const sourceFileIds =
      await this.getPreviousStageFileIds(
        documentId,
        stage
      );

    await this.markPreviousAsNotCurrent(
      documentId,
      stage
    );

    for (const file of files) {

      await this.uploadSingleFile(
        documentId,
        documentCode,
        stage,
        version,
        file,
        sourceFileIds
      );
    }

    await this.updateDocumentStage(
      documentId,
      stage
    );
  }


  private async uploadSingleFile(
    documentId: string,
    documentCode: string,
    stage: DocumentFileStage,
    version: number,
    file: File,
    sourceFileIds: string[]
  ): Promise<void> {

    const sha256 =
      await this.calculateSha256(file);

    const stageDirectory =
      stage.toLowerCase();

    const storagePath =
      `corpus/${documentCode}/${stageDirectory}/v${version}/${file.name}`;

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
          file.type ||
          'application/octet-stream',

        customMetadata: {
          documentId,
          documentCode,
          stage,
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

    await addDoc(
      filesRef,
      {
        documentId,
        stage,
        version,

        filename:
          file.name,

        storagePath,

        mimeType:
          file.type ||
          'application/octet-stream',

        size:
          file.size,

        sha256,

        sourceFileIds,

        current: true,

        createdAt:
          serverTimestamp()
      }
    );
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

    const promises =
      snapshot.docs.map(
        item => {

          const fileRef = doc(
            this.firestore,
            'documents',
            documentId,
            'files',
            item.id
          );

          return updateDoc(
            fileRef,
            {
              current: false
            }
          );
        }
      );

    await Promise.all(promises);
  }


  private previousStage(
    stage: DocumentFileStage
  ): DocumentFileStage | null {

    switch (stage) {

      case 'OCR':
        return 'ORIGINAL';

      case 'CLEAN':
        return 'OCR';

      case 'STRUCTURED':
        return 'CLEAN';

      default:
        return null;
    }
  }


  private async getPreviousStageFileIds(
    documentId: string,
    stage: DocumentFileStage
  ): Promise<string[]> {

    const previous =
      this.previousStage(stage);

    if (!previous) {
      return [];
    }

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
        previous
      ),

      where(
        'current',
        '==',
        true
      )
    );

    const snapshot =
      await getDocs(q);

    return snapshot.docs.map(
      item => item.id
    );
  }


  private async updateDocumentStage(
    documentId: string,
    stage: DocumentFileStage
  ): Promise<void> {

    const stageMap: Record<
      DocumentFileStage,
      string
    > = {

      ORIGINAL:
        'INGESTED',

      OCR:
        'OCR',

      CLEAN:
        'CLEAN',

      STRUCTURED:
        'METADATA'
    };

    const documentRef = doc(
      this.firestore,
      'documents',
      documentId
    );

    await updateDoc(
      documentRef,
      {
        processingStage:
          stageMap[stage],

        updatedAt:
          serverTimestamp()
      }
    );
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

  async readTextFile(
    storagePath: string
  ): Promise<string> {

    const storageRef =
      ref(
        this.storage,
        storagePath
      );

    const url =
      await getDownloadURL(
        storageRef
      );

    const response =
      await fetch(url);

    if (!response.ok) {

      throw new Error(
        'No se pudo leer el archivo.'
      );
    }

    return response.text();
  }
}