import { SettingsService } from '../shared/settings.service';
import { Priorities } from '../types/Settings';
import { Component, signal } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { InputChipsComponent } from '../input-chips/input-chips.component';
import { MatButtonModule } from '@angular/material/button';
import { FirebaseService } from '../shared/firebase.service';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
export interface Fruit {
  name: string;
}
@Component({
    selector: 'app-settings',
    imports: [MatFormFieldModule, MatChipsModule, MatIconModule, InputChipsComponent, MatButtonModule, FormsModule, ReactiveFormsModule, MatInputModule],
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
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);

  constructor(private settingsService: SettingsService, private firebaseService: FirebaseService, private router: Router, private authService: AuthService) {
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

  switchTo(page: string) {
    this.router.navigate(['/reset-password']);
  }

  updateEmail() {
    if (this.emailFormControl.value)
      this.authService.updateEmail(this.emailFormControl.value)
        .then(() => {
          alert('Email updated successfully');
        })
        .catch(error => {
          console.error('Error updating email:', error);
          alert('Error updating email');
        });
  }
}
