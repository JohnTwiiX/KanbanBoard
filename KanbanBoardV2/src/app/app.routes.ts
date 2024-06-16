import { Routes } from '@angular/router';
import { BoardComponent } from './board/board.component';
import { BacklogComponent } from './backlog/backlog.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { HelpScreenComponent } from './help-screen/help-screen.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { authGuard } from './shared/auth.guard';
import { IsVerifiedComponent } from './is-verified/is-verified.component';

export const routes: Routes = [
    { path: 'backlog', component: BacklogComponent, canActivate: [authGuard] },
    { path: 'addTask', component: AddTaskComponent, canActivate: [authGuard] },
    { path: 'help', component: HelpScreenComponent, canActivate: [authGuard] },
    { path: 'board', component: BoardComponent, canActivate: [authGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'verified', component: IsVerifiedComponent },
    { path: '', redirectTo: '/board', pathMatch: 'full' },
];
