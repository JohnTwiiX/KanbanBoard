import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SettingsService } from '../../../../KanbanBoard/src/app/shared/settings.service';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { DialogDeleteComponent } from '../../../../KanbanBoard/src/app/dialog-delete/dialog-delete.component';
import { MatMenuModule } from '@angular/material/menu';
import { Task } from '../types/Task';
import { DialogEditComponent } from '../dialog-edit/dialog-edit.component';
import { FirebaseService } from '../../../../KanbanBoard/src/app/shared/firebase.service';
import { UserItemsService } from '../../../../KanbanBoard/src/app/shared/user-items.service';
import { TicketViewComponent } from '../ticket-view/ticket-view.component';
import { DialogViewComponent } from '../../../../KanbanBoard/src/app/dialog-view/dialog-view.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-ticket',
  imports: [MatCardModule, NgClass, MatIconModule, MatButtonModule, MatMenuModule, TicketViewComponent, MatProgressBarModule],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
  @Input() task!: Task;
  priority: { [key: string]: string } = {};
  imageUrl: any = '../../assets/img/profile-dummy.png'

  isTaskDialogOpen: boolean = false;

  constructor(private settingsService: SettingsService, public dialog: MatDialog, private firebaseService: FirebaseService, private userItemsService: UserItemsService) {
    this.settingsService.getPrioritys()
      .subscribe((prioritys: any) => {
        this.priority = prioritys;
      });
  }

  get getProgress(): number {
    if (!this.task.subTasks || this.task.subTasks.length === 0) {
      return 0;
    }

    const totalSubTasks = this.task.subTasks.length;
    const checkedSubTasks = this.getCheckedSubTasks;
    return (checkedSubTasks / totalSubTasks) * 100;
  }

  get getCheckedSubTasks() {
    if (!this.task.subTasks || this.task.subTasks.length === 0) {
      return 0;
    }
    return this.task.subTasks.filter(subTask => subTask.checked).length;
  }

  async ngOnInit() {
    // this.imageUrl = await this.userItemsService.getImageUrl(`images/${this.task.staff.image}`)
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

  editTask(task: Task) {
    this.openDialogEdit(task);
  }

  openDialogEdit(task: Task) {
    const dialogRef = this.dialog.open(DialogEditComponent, {
      data: { task: task }
    });
    dialogRef.afterClosed
  }


}
