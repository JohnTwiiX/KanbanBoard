import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SettingsService } from '../shared/settings.service';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';
import { MatMenuModule } from '@angular/material/menu';
import { Task } from '../types/Task';
import { DialogEditComponent } from '../dialog-edit/dialog-edit.component';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [MatCardModule, NgClass, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent {
  @Input() task: any;
  priority: { [key: string]: string } = {};

  constructor(private settingsService: SettingsService, public dialog: MatDialog) {
    this.settingsService.getPrioritys()
      .subscribe((prioritys: any) => {
        this.priority = prioritys;
      });
  }

  getColorPriority(priority: string): string {
    return this.priority[priority] || 'defaultColor';
  }
  openDialog() {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: { title: this.task.title, id: this.task.id, col: 'tasks' }
    });
    dialogRef.afterClosed
  }

  switchToBacklog(task: Task) {
    try {
      if (task.id) {
        this.settingsService.deleteFromCollection('tasks', task.id);
        task.status = 'BACKLOG';
        this.settingsService.addToCollection('backlog', task);
      }
    } catch (error) {
      console.error('Error switching task to board:', error);
    }
  }

  editTask(task: Task) {
    this.openDialogEdit(task);
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

  openDialogEdit(task: Task) {
    const dialogRef = this.dialog.open(DialogEditComponent, {
      data: { task: task }
    });
    dialogRef.afterClosed
  }



  deleteTicket() {
    this.openDialog()
    // this.settingsService.deleteFromCollection('tasks', this.task.id)
  }
}
