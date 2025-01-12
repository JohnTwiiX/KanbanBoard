import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { Task } from '../types/Task';
import { TicketViewComponent } from '../ticket-view/ticket-view.component';

@Component({
  selector: 'app-dialog-view',
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, TicketViewComponent],
  templateUrl: './dialog-view.component.html',
  styleUrl: './dialog-view.component.scss'
})
export class DialogViewComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { task: Task; func: (task: Task) => void }) { }

}
