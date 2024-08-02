import { Component, Input, OnInit } from '@angular/core';
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
import { FirebaseService } from '../shared/firebase.service';
import { UserItemsService } from '../shared/user-items.service';
import { TicketViewComponent } from '../ticket-view/ticket-view.component';
import { DialogViewComponent } from '../dialog-view/dialog-view.component';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [MatCardModule, NgClass, MatIconModule, MatButtonModule, MatMenuModule, TicketViewComponent],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
  @Input() task: any;
  priority: { [key: string]: string } = {};
  imageUrl: any = '../../assets/img/profile-dummy.png'

  isTaskDialogOpen: boolean = false;

  constructor(private settingsService: SettingsService, public dialog: MatDialog, private firebaseService: FirebaseService, private userItemsService: UserItemsService) {
    this.settingsService.getPrioritys()
      .subscribe((prioritys: any) => {
        this.priority = prioritys;
      });
  }

  async ngOnInit() {
    this.imageUrl = await this.userItemsService.getImageUrl(`images/${this.task.staff.image}`)
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

  openTaskDialog() {
    const dialogRef = this.dialog.open(DialogViewComponent, {
      data: { task: this.task, func: this.editTask.bind(this) }
    });
    dialogRef.afterClosed
  }


  switchToBacklog(task: Task) {
    try {
      if (task.id) {
        this.firebaseService.deleteFromCollection('tasks', task.id);
        task.status = 'BACKLOG';
        this.firebaseService.addToCollection('backlog', task);
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
