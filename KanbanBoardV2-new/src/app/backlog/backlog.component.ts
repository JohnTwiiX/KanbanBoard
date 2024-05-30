import { Component } from '@angular/core';
import { SettingsService } from '../shared/settings.service';
import { Task } from '../types/Task';
import { MatTableModule } from '@angular/material/table';
import { TicketComponent } from '../ticket/ticket.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';
import { DialogEditComponent } from '../dialog-edit/dialog-edit.component';

@Component({
  selector: 'app-backlog',
  standalone: true,
  imports: [MatTableModule, TicketComponent, MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './backlog.component.html',
  styleUrl: './backlog.component.scss'
})
export class BacklogComponent {
  backlogTasks!: Task[]
  displayedColumns = ['title', 'description', 'category', 'deadline'];
  priority: { [key: string]: string } = {};
  constructor(private settingsService: SettingsService, public dialog: MatDialog) {
    this.settingsService.getFromCollection('backlog').subscribe((tasks: Task[]) => {
      this.backlogTasks = tasks;
    });
    this.settingsService.getPrioritys()
      .subscribe((prioritys: any) => {
        this.priority = prioritys;
      });
  }

  getColorPriority(priority: string): string {
    return this.priority[priority] || 'defaultColor';
  }

  switchToBoard(task: Task) {
    try {
      if (task.id) {
        this.settingsService.deleteFromCollection('backlog', task.id);
        task.status = 'TO DO';
        this.settingsService.addToCollection('tasks', task);
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
      data: { title: task.title, id: task.id, col: 'backlog' }
    });
    dialogRef.afterClosed
  }

  openDialogEdit(task: Task) {
    const dialogRef = this.dialog.open(DialogEditComponent, {
      data: { task: task }
    });
    dialogRef.afterClosed
  }

}
