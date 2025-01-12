import { SettingsService } from '../shared/settings.service';
import { Priorities } from '../types/Settings';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, Signal, signal, WritableSignal } from '@angular/core';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-input-chips',
    imports: [MatFormFieldModule, MatChipsModule, MatIconModule],
    templateUrl: './input-chips.component.html',
    styleUrl: './input-chips.component.scss'
})
export class InputChipsComponent {
  @Input() signal!: WritableSignal<string[]>;
  @Input() title!: string;
  // @Input() isChanged!: boolean;
  @Output() isChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  // readonly categories = signal<string[]>([]);
  // readonly projects = signal<string[]>([]);
  readonly announcer = inject(LiveAnnouncer);

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.signal.update(items => [...items, value]);
    }
    this.isChanged.emit(true);
    // Clear the input value
    event.chipInput!.clear();
  }

  remove(item: string): void {
    this.signal.update(items => {
      const index = items.indexOf(item);
      this.isChanged.emit(true);
      if (index < 0) {
        return items;
      }

      items.splice(index, 1);
      // this.announcer.announce(`Removed ${fruit.name}`);
      return [...items];
    });
  }

  edit(item: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(item);
      return;
    }

    // Edit existing fruit
    this.signal.update(items => {
      const index = items.indexOf(item);
      this.isChanged.emit(true);
      if (index >= 0) {
        items[index] = value;
        return [...items];
      }
      return items;
    });
  }

}
