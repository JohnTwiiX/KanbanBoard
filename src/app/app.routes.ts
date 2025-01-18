import { Routes } from '@angular/router';
import { BoardComponent } from './board/board.component';
import { BacklogComponent } from './backlog/backlog.component';
import { HelpScreenComponent } from './help-screen/help-screen.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { authGuard } from './shared/auth.guard';
import { IsVerifiedComponent } from './is-verified/is-verified.component';
import { AnonymousViewComponent } from './anonymous-view/anonymous-view.component';
import { SettingsComponent } from './settings/settings.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PoliciesComponent } from './policies/policies.component';
import { LegalComponent } from './legal/legal.component';
import { AddTaskComponent } from './add-task/add-task.component';


export const routes: Routes = [
    { path: 'backlog', component: BacklogComponent, canActivate: [authGuard] },
    { path: 'addTask', component: AddTaskComponent, canActivate: [authGuard] },
    { path: 'help', component: HelpScreenComponent, canActivate: [authGuard] },
    { path: 'board', component: BoardComponent, canActivate: [authGuard] },
    { path: 'verified', component: IsVerifiedComponent, canActivate: [authGuard] },
    { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
    { path: 'anonym', component: AnonymousViewComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'policies', component: PoliciesComponent },
    { path: 'legal', component: LegalComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login', pathMatch: 'full' },
];
