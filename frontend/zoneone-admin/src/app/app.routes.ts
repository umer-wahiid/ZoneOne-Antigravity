import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./core/layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
        children: [
            { path: '', redirectTo: 'categories', pathMatch: 'full' },
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
            }
        ]
    }
];
