import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
  MatDialog,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SettingsService } from '../shared/settings.service';
import { FirebaseService } from '../shared/firebase.service';

interface DialogData {
  title: string,
  id: string,
  col: string
}

@Component({
  selector: 'app-dialog-delete',
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  templateUrl: './dialog-delete.component.html',
  styleUrl: './dialog-delete.component.scss'
})
export class DialogDeleteComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private firebaseService: FirebaseService, private dialog: MatDialog) { }

  deleteTask() {
    this.firebaseService.deleteFromCollection(this.data.col, this.data.id);
    this.dialog.closeAll();
  }

}
