import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChunkHistory } from './chunk-history';

describe('ChunkHistory', () => {
  let component: ChunkHistory;
  let fixture: ComponentFixture<ChunkHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChunkHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChunkHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
