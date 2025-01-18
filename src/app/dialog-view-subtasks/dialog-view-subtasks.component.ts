import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
import { Task } from '../types/Task';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubTasks } from '../types/SubTasks';

@Component({
  selector: 'app-dialog-view-subtasks',
  imports: [MatDialogContent, MatCheckboxModule, FormsModule, CommonModule],
  templateUrl: './dialog-view-subtasks.component.html',
  styleUrl: './dialog-view-subtasks.component.scss'
})
export class DialogViewSubtasksComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { subtasks: SubTasks[]; func: (subTask: SubTasks, isChecked: boolean) => void }) { }

}
