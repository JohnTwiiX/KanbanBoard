import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogViewSubtasksComponent } from './dialog-view-subtasks.component';

describe('DialogViewSubtasksComponent', () => {
  let component: DialogViewSubtasksComponent;
  let fixture: ComponentFixture<DialogViewSubtasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogViewSubtasksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogViewSubtasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
