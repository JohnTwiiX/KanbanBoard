import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputChipsComponent } from './input-chips.component';
import { signal, WritableSignal } from '@angular/core';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('InputChipsComponent', () => {
  let component: InputChipsComponent;
  let fixture: ComponentFixture<InputChipsComponent>;

  const mockSignal: WritableSignal<string[]> = signal(['Initial', 'Values']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        InputChipsComponent,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule
      ],
      providers: [
        provideAnimations()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InputChipsComponent);
    component = fixture.componentInstance;
    component.signal = mockSignal; // Provide mock signal
    component.title = 'Test Title'; // Set other inputs as needed
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.signal).toBeDefined();
    expect(component.title).toBe('Test Title');
  });

  it('should add a chip and update signal', () => {
    const initialLength = component.signal().length;
    const inputEvent = { value: 'New Chip', chipInput: { clear: () => { } } } as MatChipInputEvent;

    component.add(inputEvent);

    expect(component.signal().length).toBe(initialLength + 1);
    expect(component.signal()).toContain('New Chip');
  });

  it('should remove a chip and update signal', () => {
    const chipToRemove = 'Initial';
    const initialLength = component.signal().length;

    component.remove(chipToRemove);

    expect(component.signal().length).toBe(initialLength - 1);
    expect(component.signal()).not.toContain(chipToRemove);
  });

  it('should edit a chip and update signal', () => {
    const initialChips = ['Initial'];
    component.signal = signal(initialChips);

    const oldChip = 'Initial';
    const newChip = 'Edited Chip';
    const event = { value: newChip } as MatChipEditedEvent;

    component.edit(oldChip, event);

    // Get the updated signal value
    const updatedChips = component.signal();

    // Check that the old chip was replaced by the new chip
    expect(updatedChips).toContain(newChip);
    expect(updatedChips).not.toContain(oldChip);
  });

  it('should not add an empty chip', () => {
    const initialLength = component.signal().length;
    const inputEvent = { value: '', chipInput: { clear: () => { } } } as MatChipInputEvent;

    component.add(inputEvent);

    expect(component.signal().length).toBe(initialLength);
  });
});
