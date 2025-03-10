import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Task } from '../types/Task';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../shared/settings.service';
import { Priorities } from '../types/Settings';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogViewComponent } from '../dialog-view/dialog-view.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { SubTasks } from '../types/SubTasks';
import { FirebaseService } from '../shared/firebase.service';
import { MatMenuModule } from '@angular/material/menu';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';
import { MatIconModule } from '@angular/material/icon';
import { DialogViewSubtasksComponent } from '../dialog-view-subtasks/dialog-view-subtasks.component';
import { UserItemsService } from '../shared/user-items.service';
import { UserItems } from '../types/UserItems';

@Component({
  selector: 'app-ticket-view',
  imports: [CommonModule, MatChipsModule, MatButtonModule, MatCheckboxModule, FormsModule, MatMenuModule, MatIconModule],
  templateUrl: './ticket-view.component.html',
  styleUrl: './ticket-view.component.scss'
})
export class TicketViewComponent implements OnInit {

  @Input() task!: Task;
  // @Input() openEditDialog!: (task: Task) => void
  @Output("openDialogEdit") openDialogEdit: EventEmitter<any> = new EventEmitter();
  priorities!: Priorities | null;
  userItems: UserItems | null = null;

  constructor(public dialogRef: MatDialogRef<DialogViewComponent>, private settingsService: SettingsService, private firebaseService: FirebaseService, public dialog: MatDialog, private userItemsService: UserItemsService) {
    this.settingsService.getPrioritys().subscribe({
      next: value => this.priorities = value
    })
    userItemsService.userItems$.subscribe(userItems => {
      if (userItems) {
        this.userItems = userItems;
      }
    })
  }

  ngOnInit(): void {
    console.log(this.task);
  }

  get getColor() {
    if (this.priorities && this.task) {
      const key = this.task.priority as 'high' | 'medium' | 'low';
      return this.priorities[key];
    } else {
      return null;
    }
  }

  editTask() {
    console.log(this.dialogRef);
    this.dialogRef.close();

    this.openDialogEdit.emit();
  }

  switchTo(task: Task) {
    try {
      if (task.id) {
        const status = task.status === 'BACKLOG' ? 'TO DO' : 'BACKLOG';

        this.firebaseService.updateTaskColumn(task.id, status);
        this.dialog.closeAll();
      }
    } catch (error) {
      console.error('Error switching task to board:', error);
    }
  }

  deleteTask(task: Task) {
    this.openDialogDelete(task)
  }

  openDialogDelete(task: Task) {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: { title: task.title, id: task.id, col: 'tasks' }
    });
    dialogRef.afterClosed
  }

  openSubtaskDialog() {
    const dialogSubtaskRef = this.dialog.open(DialogViewSubtasksComponent, {
      data: { subtasks: this.task.subTasks, func: this.onSubTaskCheckedChange.bind(this) }
    });
    dialogSubtaskRef.afterClosed
  }

  onSubTaskCheckedChange(subTask: SubTasks, isChecked: boolean): void {
    if (!(this.userItems?.permissions === 'read-write')) return
    subTask.checked = isChecked;
    // Additional logic can be added here, e.g., updating progress, saving state, etc.
    console.log(`${subTask.title} is now ${isChecked ? 'checked' : 'unchecked'}`);
    if (this.task.id)
      this.firebaseService.updateSubTask(this.task.id, subTask)
  }
}
