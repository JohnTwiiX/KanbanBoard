import { Component, Input, OnInit, Optional } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, Validators, FormsModule, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { SettingsService } from '../shared/settings.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { Priority } from '../types/Priority';
import { Router } from '@angular/router';
import { Task } from '../types/Task';
import { MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from '../shared/firebase.service';
import { UserObj } from '../types/User';
import { UserItemsService } from '../shared/user-items.service';
import { UserItems } from '../types/UserItems';
import { SubTasks } from '../types/SubTasks';
import { MatDividerModule } from '@angular/material/divider';
import { DialogEditComponent } from '../dialog-edit/dialog-edit.component';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../shared/auth.service';
import { User } from 'firebase/auth';


@Component({
  selector: 'app-add-task',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, ReactiveFormsModule, MatSelectModule, MatButtonModule, MatTooltipModule, MatIconModule, MatDividerModule, MatChipsModule, MatSelectModule],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'de-DE' }, provideNativeDateAdapter()],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss'
})
export class AddTaskComponent implements OnInit {
  @Input() task: Task | undefined
  title = '';
  description = '';
  categoriesControl = new FormControl<string | null>(null, Validators.required);
  prioritiesControl = new FormControl<string | null>(null, Validators.required);
  projectControl = new FormControl<string | null>(null);
  selectFormControl = new FormControl('', Validators.required);
  categories!: string[];
  priorities!: Priority[];
  staffs!: UserObj[];
  projects!: string[]
  selectedStaffIndex: number = 0; // Initial index
  selectedStaff!: UserObj;

  dueDateControl = new FormControl(); // FormControl to hold the selected date

  imageUrls = ['person.png', 'tiger.png', 'bee.png'];
  userItems!: UserItems | null;

  isDialogOpen: boolean = false;
  selectedOption: 'categories' | 'projects' | null = null;
  newItemSelected = new FormControl<string>('', {
    validators: [Validators.required, this.letterOnlyValidator],
    nonNullable: true,
  });
  value = '';
  subTasks: SubTasks[] = [];
  subTaskEdit = false;
  subTaskChange = '';

  currentUser!: User
  isAllProjects = false;

  letterOnlyValidator(control: AbstractControl): ValidationErrors | null {
    const regex = /^[A-Za-z]+$/; // Regex for letters only
    const valid = regex.test(control.value || '');
    return valid ? null : { letterOnly: true }; // Returns an error if invalid
  }
  // Method to set the selected date
  selectDate(event: any) {
    this.dueDateControl.setValue(event.value);
  }
  constructor(
    private firebaseService: FirebaseService,
    private settingsService: SettingsService,
    private router: Router,
    @Optional() private dialogRef: MatDialogRef<DialogEditComponent>,
    private userItemsService: UserItemsService,
    private authService: AuthService,
  ) {
    this.settingsService.getCategories().subscribe(categories => {
      if (categories)
        this.categories = categories;
    });
    this.settingsService.getPrioritys().subscribe(priorities => {
      if (priorities)
        this.priorities = Object.entries(priorities).map(([key, value]) => ({ key, value }));
    });
    this.settingsService.getProjects().subscribe(projects => {
      if (projects)
        this.projects = projects;
    });
    this.firebaseService.users$.subscribe(staffs => {
      if (staffs) {
        this.staffs = staffs;
        // this.loadImageUrls();
        staffs.forEach((staff, index) => {
          if (staff.uid === authService.getUser()?.uid) {
            this.selectedStaff = staff;
          }
        })

      }
    });
    this.userItemsService.userItems$.subscribe({
      next: (user: UserItems | null) => {
        this.userItems = user
        if (!(user?.permissions === 'read-write')) {
          this.router.navigate(['/board']);
        }
        if (user?.projects[0] === 'All') {
          this.isAllProjects = true;
        } else {
          this.isAllProjects = false;
        }
      }
    })

    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    })


  }

  ngOnInit(): void {
    if (this.task) {
      this.title = this.task.title;
      this.categoriesControl.setValue(this.task.category);
      this.prioritiesControl.setValue(this.task.priority);
      if (this.task.deadline)
        this.dueDateControl.setValue(this.stringToDate(this.task.deadline));
      this.description = this.task.description;
      this.selectedStaffIndex = this.findStaffIndexById(this.task.staff.image);
      if (this.task.project)
        this.projectControl.setValue(this.task.project);
      if (this.task.subTasks)
        this.subTasks = [...this.task.subTasks];
    }
  }

  findStaffIndexById(path: string): number {
    const keysArray = Array.from(this.imageUrls);
    console.log(path);
    console.log(keysArray);

    return keysArray.findIndex(key => key === path);
  }

  get selectedStaffImage() {

    const valuesArray = Array.from(this.imageUrls);
    return valuesArray[this.selectedStaffIndex];
  }

  changeSelectedStaff() {
    // Increment the index or reset to 0 if it reaches the end
    this.selectedStaffIndex = (this.selectedStaffIndex + 1) % this.staffs.length;
  }

  async saveTask() {
    if (this.categoriesControl.value && this.prioritiesControl.value && this.userItems) {
      const ticketNumber = `Ticket-${await this.firebaseService.getSetTicketNumber()}`;
      let task: Task = {
        title: this.title,
        category: this.categoriesControl.value.toString(),
        priority: this.prioritiesControl.value.toString(),
        description: this.description,
        staff: {
          name: this.selectedStaff.display_name,
          image: this.selectedStaff.image
        },
        status: 'BACKLOG',
        createdAt: this.formatCurrentDate(),
        ticketNumber: ticketNumber,
        creator: (this.staffs.filter(staff => staff.uid === this.currentUser.uid)[0]?.display_name),
      }
      if (this.projectControl.value) {
        task = {
          ...task,
          project: this.projectControl.value
        }
      }
      if (this.dueDateControl.value) {
        task = {
          ...task,
          deadline: this.formatDate(this.dueDateControl.value)
        }
      }
      if (this.subTasks.length > 0) {
        task = {
          ...task,
          subTasks: this.subTasks
        }
      }
      this.firebaseService.addToCollection(task);
      this.navigateTo('/backlog');
    }
  }

  async saveEditedTask() {
    if (this.categoriesControl.value && this.prioritiesControl.value && this.task?.id && this.userItems) {
      let task: Task = {
        title: this.title,
        category: this.categoriesControl.value.toString(),
        priority: this.prioritiesControl.value.toString(),
        description: this.description,
        staff: {
          name: this.selectedStaff.display_name,
          image: this.selectedStaff.image
        },
        status: this.task.status,
        createdAt: this.task.createdAt ? this.task.createdAt : this.formatCurrentDate(),
        ticketNumber: this.task.ticketNumber || `Ticket-${await this.firebaseService.getSetTicketNumber()}`,
        creator: this.task.creator || this.userItems?.display_name
      }
      if (this.projectControl.value) {
        task = {
          ...task,
          project: this.projectControl.value
        }
      }
      if (this.dueDateControl.value) {
        console.log(this.dueDateControl.value);

        task = {
          ...task,
          deadline: this.formatDate(this.dueDateControl.value)
        }
      }
      if (this.subTasks.length > 0) {
        task = {
          ...task,
          subTasks: this.subTasks
        }
      }
      this.firebaseService.updateTask(this.task.id, task);
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
  dialogControl() {
    if (this.newItemSelected.valid) {
      return false;
    } else return true
  }

  private formatCurrentDate(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0'); // Tag mit führender Null
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Monat mit führender Null, Monate sind 0-indexiert
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
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

  openAddDialog(value: 'projects' | 'categories') {
    this.selectedOption = value;
    this.isDialogOpen = true;
  }

  closeAddDialog() {
    this.selectedOption = null;
    this.newItemSelected.setValue('');
    this.isDialogOpen = false;
  }

  async saveNewItem() {
    const id = this.settingsService.getSettingsId();
    if (this.newItemSelected.value && this.selectedOption && id) {
      await this.firebaseService.updateSettingsKey(
        id,
        this.selectedOption,
        this.newItemSelected.value,
        'add');
      this.closeAddDialog();
    }
  }

  addToSubTasks() {
    if (!this.value) return;
    this.subTasks.push({
      title: this.value,
      checked: false
    });
    this.value = '';
  }

  deleteSubTask(id: number) {
    this.subTasks.splice(id, 1);
  }

  changeSubTask(id: number) {
    this.subTasks.forEach((task, index) => {
      if (index === id) {
        task.title = this.subTaskChange;
      };
    });
    this.subTaskEdit = false;
  }

  editSubTask() {
    if (this.subTaskEdit) {
      this.subTaskEdit = false;
    } else {
      this.subTaskEdit = true;
    }
  }
}
