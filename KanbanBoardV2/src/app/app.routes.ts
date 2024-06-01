import { Routes } from '@angular/router';
import { BoardComponent } from './board/board.component';
import { BacklogComponent } from './backlog/backlog.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { HelpScreenComponent } from './help-screen/help-screen.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'backlog', component: BacklogComponent },
    { path: 'addTask', component: AddTaskComponent },
    { path: 'help', component: HelpScreenComponent }
];
