import { Component, OnInit } from '@angular/core';
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
import { FirebaseService } from '../shared/firebase.service';
import { UserItemsService } from '../shared/user-items.service';

@Component({
    selector: 'app-backlog',
    imports: [MatTableModule, TicketComponent, MatMenuModule, MatButtonModule, MatIconModule],
    templateUrl: './backlog.component.html',
    styleUrl: './backlog.component.scss'
})
export class BacklogComponent {
  backlogTasks!: Task[];
  displayedColumns = ['title', 'description', 'category', 'deadline'];
  priority: { [key: string]: string } = {};
  imageUrls: Map<string, string> = new Map();
  constructor(private settingsService: SettingsService, public dialog: MatDialog, private firebaseService: FirebaseService, private userItemsService: UserItemsService) {
    this.firebaseService.getFromCollection('backlog')?.subscribe((tasks: Task[] | null) => {
      if (tasks) {
        this.backlogTasks = tasks;
        console.log('---------------------------');

        this.loadImageUrls();
      }

    });
    this.settingsService.getPrioritys()
      .subscribe((prioritys: any) => {
        this.priority = prioritys;
      });
  }

  async loadImageUrls() {
    console.log('drin');

    for (const task of this.backlogTasks) {
      const filePath = `images/${task.staff.image}`;
      console.log(this.imageUrls.get(filePath));

      if (!this.imageUrls.has(filePath)) {
        try {
          const url = await this.userItemsService.getImageUrl(filePath);
          this.imageUrls.set(filePath, url);
        } catch (error) {
          console.error('Fehler beim Abrufen der Bild-URL:', error);
        }
      }
    }
  }

  getColorPriority(priority: string): string {
    return this.priority[priority] || 'defaultColor';
  }

  switchToBoard(task: Task) {
    try {
      if (task.id) {
        this.firebaseService.deleteFromCollection('backlog', task.id);
        task.status = 'TO DO';
        this.firebaseService.addToCollection('tasks', task);
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

  async getImageUrl(img: string) {
    const result = await this.userItemsService.getImageUrl(`images/${img}`)
    console.log(result);

    return result
  }
}
