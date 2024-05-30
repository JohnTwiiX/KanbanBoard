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

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, TicketComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  columns!: string[];
  tasks!: any[];

  constructor(private settingsService: SettingsService) {

  }

  ngOnInit() {
    this.settingsService.getColumns().subscribe(columns => {
      this.columns = columns;
    });
    this.settingsService.getFromCollection('tasks').subscribe((tasks: Task[]) => {
      this.tasks = tasks;
    });
  }

  drop(event: CdkDragDrop<any>) {
    const task = event.item.data;
    const newColumn = event.container.data;
    if (task.status !== newColumn) {
      this.settingsService.updateTaskColumn(task.id, newColumn);
    };
  }

}
