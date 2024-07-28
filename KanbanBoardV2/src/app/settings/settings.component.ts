import { SettingsService } from '../shared/settings.service';
import { Priorities } from '../types/Settings';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, inject, Signal, signal } from '@angular/core';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { InputChipsComponent } from '../input-chips/input-chips.component';
import { MatButtonModule } from '@angular/material/button';
import { FirebaseService } from '../shared/firebase.service';
export interface Fruit {
  name: string;
}
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatFormFieldModule, MatChipsModule, MatIconModule, InputChipsComponent, MatButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  // categories!: string[] | null;
  // projects!: string[] | null;
  priorities!: Priorities;
  readonly categories = signal<string[]>([]);
  readonly projects = signal<string[]>([]);
  isDialogOpen: boolean = false;
  isSettingsChanged: boolean = false;
  constructor(private settingsService: SettingsService, private firebaseService: FirebaseService) {
    this.settingsService.getCategories().subscribe({
      next: value => {
        if (value)
          this.categories.update(() => value);
      }
    });
    this.settingsService.getPrioritys().subscribe({
      next: value => {
        if (value)
          this.priorities = value;
      }
    });
    this.settingsService.getProjects().subscribe({
      next: value => {
        if (value)
          this.projects.update(() => value);
      }
    });
  }

  saveSettings() {
    const settings = {
      columns: ['TO DO', 'SCHEDULED', 'IN PROGRESS', 'DONE'],
      categories: this.categories.apply(this),
      priorities: this.priorities,
      projects: this.projects.apply(this)
    };
    this.firebaseService.updateSettings(this.settingsService.getSettingsId(), settings);
    this.closeDialog();
  }

  changeSettingsValue(changed: boolean): void {
    if (changed) {
      this.isSettingsChanged = changed
    }
  }

  onColorChange(key: 'high' | 'low' | 'medium', event: Event): void {
    if (event.target) {
      const input = event.target as HTMLInputElement
      console.log(input.value);
      this.priorities[key] = input.value;
      this.isSettingsChanged = true;
    }
  }

  get objectKeys() {
    return ['high', 'medium', 'low'] as ['high', 'medium', 'low']
  }

  openDialog() {
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isSettingsChanged = false;
    this.isDialogOpen = false;
  }
}
