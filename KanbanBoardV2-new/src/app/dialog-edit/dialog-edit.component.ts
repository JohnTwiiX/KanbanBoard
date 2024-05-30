import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SettingsService } from '../shared/settings.service';
import { AddTaskComponent } from '../add-task/add-task.component';
import { Task } from '../types/Task';

interface DialogData {
  task: Task
}

@Component({
  selector: 'app-dialog-edit',
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, AddTaskComponent],
  templateUrl: './dialog-edit.component.html',
  styleUrl: './dialog-edit.component.scss'
})
export class DialogEditComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private settingsService: SettingsService) { }

  saveTask() {

  }
}
