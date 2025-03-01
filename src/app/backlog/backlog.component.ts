import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../shared/settings.service';
import { Task } from '../types/Task';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';
import { FirebaseService } from '../shared/firebase.service';
import { UserItemsService } from '../shared/user-items.service';
import { DialogEditComponent } from '../dialog-edit/dialog-edit.component';
import { TicketComponent } from '../ticket/ticket.component';
import { UserItems } from '../types/UserItems';
import { DialogViewComponent } from '../dialog-view/dialog-view.component';

@Component({
  selector: 'app-backlog',
  imports: [MatTableModule, MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './backlog.component.html',
  styleUrl: './backlog.component.scss'
})
export class BacklogComponent {
  backlogTasks!: Task[];
  displayedColumns = ['title', 'description', 'category', 'deadline'];
  priority: { [key: string]: string } = {};
  userItems: UserItems | null = null;
  constructor(private settingsService: SettingsService, public dialog: MatDialog, private firebaseService: FirebaseService, private userItemsService: UserItemsService) {
    this.firebaseService.tasks$.subscribe((tasks: Task[] | null) => {
      if (tasks) {
        this.backlogTasks = tasks.filter(task => task.status === 'BACKLOG');

        // this.loadImageUrls();
      }

    });
    this.settingsService.getPrioritys()
      .subscribe((prioritys: any) => {
        this.priority = prioritys;
      });

    userItemsService.userItems$.subscribe((userItems: UserItems | null) => {
      if (userItems) {
        this.userItems = userItems;
      }
    });
  }

  getColorPriority(priority: string): string {
    return this.priority[priority] || 'defaultColor';
  }

  switchToBoard(task: Task) {
    try {
      if (task.id) {
        this.firebaseService.updateTaskColumn(task.id, 'TO DO');
      }
    } catch (error) {
      console.error('Error switching task to board:', error);
    }
  }

  openTaskDialog(task: Task) {
    const dialogRef = this.dialog.open(DialogViewComponent, {
      data: { task: task }
    });
    dialogRef.afterClosed
  }
}
