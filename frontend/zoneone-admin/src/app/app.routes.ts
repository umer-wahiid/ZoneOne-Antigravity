import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        loadComponent: () => import('./core/layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'categories',
                loadComponent: () => import('./features/game-categories/game-category-list/game-category-list.component').then(m => m.GameCategoryListComponent)
            },
            {
                path: 'categories/new',
                loadComponent: () => import('./features/game-categories/game-category-form/game-category-form.component').then(m => m.GameCategoryFormComponent)
            },
            {
                path: 'categories/edit/:id',
                loadComponent: () => import('./features/game-categories/game-category-form/game-category-form.component').then(m => m.GameCategoryFormComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
            },
            {
                path: 'rooms',
                loadComponent: () => import('./features/game-rooms/game-room-list/game-room-list.component').then(m => m.GameRoomListComponent)
            },
            {
                path: 'rooms/new',
                loadComponent: () => import('./features/game-rooms/game-room-form/game-room-form.component').then(m => m.GameRoomFormComponent)
            },
            {
                path: 'rooms/edit/:id',
                loadComponent: () => import('./features/game-rooms/game-room-form/game-room-form.component').then(m => m.GameRoomFormComponent)
            },
            {
                path: 'extras',
                loadComponent: () => import('./features/extras/extra-list/extra-list.component').then(m => m.ExtraListComponent)
            },
            {
                path: 'extras/new',
                loadComponent: () => import('./features/extras/extra-form/extra-form.component').then(m => m.ExtraFormComponent)
            },
            {
                path: 'extras/edit/:id',
                loadComponent: () => import('./features/extras/extra-form/extra-form.component').then(m => m.ExtraFormComponent)
            }
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];
