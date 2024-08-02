import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnonymousViewComponent } from './anonymous-view.component';

describe('AnonymousViewComponent', () => {
  let component: AnonymousViewComponent;
  let fixture: ComponentFixture<AnonymousViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnonymousViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnonymousViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
