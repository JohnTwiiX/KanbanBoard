import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputChipsComponent } from './input-chips.component';

describe('InputChipsComponent', () => {
  let component: InputChipsComponent;
  let fixture: ComponentFixture<InputChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputChipsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InputChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
