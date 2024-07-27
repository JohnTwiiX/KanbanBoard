import { Component } from '@angular/core';
import { SettingsService } from '../shared/settings.service';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import { TicketComponent } from '../ticket/ticket.component';
import { Task } from '../types/Task';
import { FirebaseService } from '../shared/firebase.service';
import { AuthService } from '../shared/auth.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, TicketComponent, MatButtonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  columns!: string[];
  tasks!: any[] | null;
  isDialogOpen: boolean = false;
  selectedTask: Task | null = null;

  constructor(private settingsService: SettingsService, private firebaseService: FirebaseService) {

  }

  ngOnInit() {

    this.settingsService.getColumns().subscribe(columns => {
      if (columns) {
        this.columns = columns;
      }
    });
    this.firebaseService.getFromCollection('tasks')?.subscribe((tasks: Task[] | null) => {
      if (tasks)
        this.checkTasks(tasks);
      this.tasks = tasks;
    });
  }

  drop(event: CdkDragDrop<any>) {
    const task = event.item.data;
    const newColumn = event.container.data;
    if (task.status !== newColumn) {
      if (newColumn === 'DONE' && !task.closedAt) {
        const updatedTask = {
          ...task,
          status: newColumn,
          closedAt: this.formatCurrentDate()
        }
        this.firebaseService.updateTask(task.id, updatedTask);
      }
      if (newColumn !== 'DONE' && task.closedAt) {
        this.openDialog(task);
      } else {
        this.firebaseService.updateTaskColumn(task.id, newColumn);
      }
    };

  }

  checkTasks(tasks: Task[]) {
    const today = new Date();
    tasks.forEach((task) => {
      if (task.closedAt && task.status === 'DONE' && task.id) {
        const diffTime = today.getTime() - this.stringToDate(task.closedAt).getTime();
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44)
        if (diffMonths > 1) {
          console.log(`Task "${task.title}" ist älter als ein Monat.`);
          this.firebaseService.deleteFromCollection('tasks', task.id);
          task.status = 'BACKLOG';
          this.firebaseService.moveToDeleted(task);
        }
      }
    })
  }

  private formatCurrentDate(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0'); // Tag mit führender Null
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Monat mit führender Null, Monate sind 0-indexiert
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  private stringToDate(dateString: string): Date {
    const [day, month, year] = dateString.split('.').map(Number);
    return new Date(year, month - 1, day);
  }

  openDialog(task: Task) {
    this.selectedTask = task;
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.selectedTask = null;
    this.isDialogOpen = false;
  }

  reopenTask() {
    if (this.selectedTask) {
      const updatedTask = {
        ...this.selectedTask,
        status: 'TO DO'
      };
      delete updatedTask.closedAt; // Entferne die closedAt-Eigenschaft

      if (updatedTask.id)
        this.firebaseService.updateTask(updatedTask.id, updatedTask)
      this.closeDialog();
    }

  }

}
