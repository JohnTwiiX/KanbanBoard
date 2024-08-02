import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Task } from '../types/Task';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../shared/settings.service';
import { Priorities } from '../types/Settings';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogViewComponent } from '../dialog-view/dialog-view.component';

@Component({
  selector: 'app-ticket-view',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatButtonModule],
  templateUrl: './ticket-view.component.html',
  styleUrl: './ticket-view.component.scss'
})
export class TicketViewComponent implements OnInit {

  @Input() task!: Task;
  // @Input() openEditDialog!: (task: Task) => void
  @Output("openDialogEdit") openDialogEdit: EventEmitter<any> = new EventEmitter();
  priorities!: Priorities | null;

  constructor(public dialogRef: MatDialogRef<DialogViewComponent>, private settingsService: SettingsService) {
    this.settingsService.getPrioritys().subscribe({
      next: value => this.priorities = value
    })

  }

  ngOnInit(): void {
    console.log(this.task);
  }

  get getColor() {
    if (this.priorities) {
      const key = this.task.priority as 'high' | 'medium' | 'low'
      return this.priorities[key]
    } else {
      return null
    }
  }

  editTask() {
    console.log(this.dialogRef);
    this.dialogRef.close();

    this.openDialogEdit.emit();
  }
}
