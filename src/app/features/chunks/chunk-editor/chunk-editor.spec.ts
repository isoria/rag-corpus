import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChunkEditor } from './chunk-editor';

describe('ChunkEditor', () => {
  let component: ChunkEditor;
  let fixture: ComponentFixture<ChunkEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChunkEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChunkEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
