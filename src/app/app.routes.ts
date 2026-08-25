import { Routes } from '@angular/router';

import {
  DocumentList
} from './features/documents/document-list/document-list';

import {
  DocumentForm
} from './features/documents/document-form/document-form';

import {
  DocumentDetail
} from './features/documents/document-detail/document-detail';

export const routes: Routes = [

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'documents'
  },

  {
    path: 'documents',
    component: DocumentList
  },

  {
    path: 'documents/new',
    component: DocumentForm
  },

  {
    path: 'documents/:id/edit',
    component: DocumentForm
  },

  {
    path: 'documents/:id',
    component: DocumentDetail
  },

  {
    path: '**',
    redirectTo: 'documents'
  }

];