import { Component, Input, OnInit, Optional } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { SettingsService } from '../shared/settings.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { Priority } from '../types/Priority';
import { Staff } from '../types/Staff';
import { Router } from '@angular/router';
import { Task } from '../types/Task';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogEditComponent } from '../dialog-edit/dialog-edit.component';


@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, ReactiveFormsModule, MatSelectModule, MatButtonModule, MatTooltipModule, MatIconModule],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'de-DE' }, provideNativeDateAdapter()],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss'
})
export class AddTaskComponent implements OnInit {
  @Input() task: Task | undefined
  title = '';
  description = '';
  selectedDueDate: Date | any = new Date();
  categoriesControl = new FormControl<string | null>(null, Validators.required);
  prioritiesControl = new FormControl<string | null>(null, Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  categories!: string[];
  priorities!: Priority[];
  staffs!: Staff[];
  selectedStaffIndex: number = 0; // Initial index

  dueDateControl = new FormControl(new Date); // FormControl to hold the selected date

  // Method to set the selected date
  selectDate(event: any) {
    this.dueDateControl.setValue(event.value);
  }
  constructor(private settingsService: SettingsService, private router: Router, @Optional() private dialogRef: MatDialogRef<DialogEditComponent>) {
    this.settingsService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
    this.settingsService.getPrioritys().subscribe(priorities => {
      this.priorities = Object.entries(priorities).map(([key, value]) => ({ key, value }));
    });
    this.settingsService.getStaffs().subscribe(staffs => {
      this.staffs = staffs;
    });

  }

  ngOnInit(): void {
    if (this.task) {
      this.title = this.task.title;
      this.categoriesControl.setValue(this.task.category);
      this.prioritiesControl.setValue(this.task.priority);
      this.dueDateControl.setValue(this.stringToDate(this.task.deadline));
      this.description = this.task.description;
      this.selectedStaffIndex = this.findStaffIndexById(this.task.staff.name);
    }
  }

  findStaffIndexById(name: string): number {
    return this.staffs.findIndex(staff => staff.name === name);
  }

  get selectedStaff(): Staff {
    return this.staffs[this.selectedStaffIndex];
  }

  changeSelectedStaff() {
    // Increment the index or reset to 0 if it reaches the end
    this.selectedStaffIndex = (this.selectedStaffIndex + 1) % this.staffs.length;
  }

  saveTask() {
    if (this.categoriesControl.value && this.prioritiesControl.value) {
      const task: Task = {
        title: this.title,
        category: this.categoriesControl.value.toString(),
        priority: this.prioritiesControl.value.toString(),
        description: this.description,
        staff: {
          name: this.selectedStaff.name,
          image: this.selectedStaff.img
        },
        status: 'BACKLOG',
        deadline: this.formatDate(this.selectedDueDate)
      }
      this.settingsService.addToCollection('backlog', task);
      this.navigateTo('/backlog');
    }
  }

  saveEditedTask() {
    if (this.categoriesControl.value && this.prioritiesControl.value && this.task?.id) {
      const task: Task = {
        title: this.title,
        category: this.categoriesControl.value.toString(),
        priority: this.prioritiesControl.value.toString(),
        description: this.description,
        staff: {
          name: this.selectedStaff.name,
          image: this.selectedStaff.img
        },
        status: this.task.status,
        deadline: this.formatDate(this.selectedDueDate)
      }
      this.settingsService.updateTask(this.task.id, task);
      this.dialogRef.close();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  controlForm() {
    if (this.title && this.categoriesControl.value && this.prioritiesControl.value) {
      return false;
    } else return true
  }

  private formatDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  private stringToDate(dateString: string): Date {
    const [day, month, year] = dateString.split('.').map(Number);
    return new Date(year, month - 1, day);
  }

  navigateTo(url: string): void {
    this.router.navigateByUrl(url);
  }
}
