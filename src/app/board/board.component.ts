import { Component } from '@angular/core';
import { SettingsService } from '../shared/settings.service';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import { Task } from '../types/Task';
import { FirebaseService } from '../shared/firebase.service';
import { AuthService } from '../shared/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TicketComponent } from '../ticket/ticket.component';

@Component({
  selector: 'app-board',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, TicketComponent, MatButtonModule, FormsModule, MatInputModule, MatIconModule, CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  columns!: string[];
  tasks!: any[] | null;
  isDialogOpen: boolean = false;
  selectedTask: Task | null = null;

  searchTerm: string = '';
  filteredTasks: Task[] = [];
  isTaskBeingDragged = '';

  constructor(private settingsService: SettingsService, private firebaseService: FirebaseService) {

  }

  ngOnInit() {

    this.settingsService.getColumns().subscribe(columns => {

      if (columns) {
        this.columns = columns;
      }
    });
    this.firebaseService.tasks$.subscribe((tasks: Task[] | null) => {
      if (tasks) {
        this.checkTasks(tasks);
        this.tasks = tasks;
        if (this.searchTerm) {
          this.filterTasks();
        } else {
          this.filteredTasks = tasks;
        };
        this.filteredTasks = this.sortTasksByCreatedAt(this.filteredTasks);
      } else {
        this.tasks = tasks;
      }
    });
  }

  sortTasksByCreatedAt(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => this.parseDate(b.createdAt).getTime() - this.parseDate(a.createdAt).getTime());
  }

  parseDate(dateString: string): Date {
    if (dateString) {
      const [day, month, year] = dateString.split('.').map(Number);
      return new Date(year, month - 1, day); // month - 1, weil Monate von 0 bis 11 gehen
    } else {
      return new Date();
    }

  }

  filterTasks() {
    if (this.tasks) {
      this.filteredTasks = this.tasks.filter(task =>
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task?.project?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      console.log(this.filteredTasks);
    };
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

  // Handle the drag entered event
  onDragEntered(event: any, column: string) {
    const element = event.container.element.nativeElement.children[0] as HTMLElement
    console.log('ich drag den', element);
    if (element.classList.value.includes('no-task') && event.container.data === column) {
      this.isTaskBeingDragged = column;
    } else {
      this.isTaskBeingDragged = '';
    }
  }

  checkTasks(tasks: Task[]) {
    const today = new Date();
    tasks.forEach((task) => {
      if (task.closedAt && task.status === 'DONE' && task.id) {
        const diffTime = today.getTime() - this.stringToDate(task.closedAt).getTime();
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44)
        if (diffMonths > 1) {
          console.log(`Task "${task.title}" ist älter als ein Monat.`);
          this.firebaseService.deleteFromCollection(task.id);
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

  isTaskInColumn(column: string) {
    return this.filteredTasks.some(task => task.status === column);
  }
}
