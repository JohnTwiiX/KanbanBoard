import { Routes } from '@angular/router';
import { BoardComponent } from './board/board.component';
import { BacklogComponent } from './backlog/backlog.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { HelpScreenComponent } from './help-screen/help-screen.component';

export const routes: Routes = [
    { path: '', component: BoardComponent },
    { path: 'backlog', component: BacklogComponent },
    { path: 'addTask', component: AddTaskComponent },
    { path: 'help', component: HelpScreenComponent }
];
