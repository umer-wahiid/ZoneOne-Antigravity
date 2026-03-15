import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameCategoryService } from '../../../core/services/game-category.service';
import { take } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-game-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ColorPickerModule,
    ButtonModule
  ],
  template: `
    <div class="form-wrapper">
      <p-button icon="pi pi-arrow-left" label="Back to Categories" [text]="true" (onClick)="goBack()" [style]="{'margin-bottom': '2rem'}"></p-button>
      
      <div class="form-container">
        <div class="form-header">
          <h2 class="title">{{ isEditMode ? 'Edit' : 'Create' }} Category</h2>
          <p class="subtitle">{{ isEditMode ? 'Update existing gaming zone details' : 'Configure a new gaming zone category' }}</p>
        </div>

        <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-4">
          <div class="form-group flex flex-column gap-2 mb-4">
            <label for="name" class="font-semibold text-secondary">Category Name</label>
            <input pInputText id="name" formControlName="name" placeholder="e.g. Virtual Reality Setup" 
                   [ngClass]="{'ng-invalid ng-dirty': f['name'].invalid && (f['name'].dirty || f['name'].touched)}" class="w-full">
            <small *ngIf="f['name'].invalid && (f['name'].dirty || f['name'].touched)" class="text-red-400">
              Name is required.
            </small>
          </div>

          <div class="form-group flex flex-column gap-2 mb-4">
            <label for="description" class="font-semibold text-secondary">Description</label>
            <textarea pTextarea id="description" formControlName="description" rows="3" placeholder="Describe the zone's equipment and vibe..."
                      [ngClass]="{'ng-invalid ng-dirty': f['description'].invalid && (f['description'].dirty || f['description'].touched)}" class="w-full"></textarea>
             <small *ngIf="f['description'].invalid && (f['description'].dirty || f['description'].touched)" class="text-red-400">
              Description is required.
            </small>
          </div>

          <div class="form-row flex gap-5 mb-5">
            <div class="form-group flex flex-column gap-2 flex-1">
              <label for="themeColor" class="font-semibold text-secondary">Theme Color</label>
              <div class="flex align-items-center gap-3 bg-darker p-3 border-round border-1 border-gray-200">
                <p-colorPicker formControlName="themeColor"></p-colorPicker>
                <span class="font-mono text-primary">{{ f['themeColor'].value }}</span>
              </div>
            </div>

            <div class="form-group flex flex-column gap-2 flex-1">
              <label for="iconUrl" class="font-semibold text-secondary">Icon URL (optional)</label>
              <input pInputText id="iconUrl" formControlName="iconUrl" placeholder="/assets/icons/default.svg" class="w-full">
            </div>
          </div>

          <div class="form-actions flex justify-content-end gap-3 mt-4 pt-4 border-top-1 border-gray-200">
            <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="goBack()"></p-button>
            <p-button type="submit" [label]="isEditMode ? 'Save Changes' : 'Create Category'" [disabled]="categoryForm.invalid"></p-button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-wrapper {
      max-width: 800px;
      margin: 0 auto;
      animation: slideIn var(--transition-normal);
    }

    .form-container {
      background-color: var(--bg-card);
      border-radius: var(--border-radius-lg);
      padding: 3rem;
      border: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: 0 10px 40px rgba(0,0,0,0.05);
    }

    .form-header {
      margin-bottom: 2.5rem;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      padding-bottom: 1.5rem;

      .title {
        font-size: 2rem;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }
      .subtitle { color: var(--text-muted); }
    }

    .bg-darker { background-color: var(--bg-darker); }
    .text-secondary { color: var(--text-secondary); }
    .text-red-400 { color: #fc8181; }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* Minimal flex utility classes for Primeflex absence since user hasn't explicitly installed PrimeFlex */
    .flex { display: flex; }
    .flex-column { flex-direction: column; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 1rem; }
    .gap-4 { gap: 1.5rem; }
    .gap-5 { gap: 2rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mb-5 { margin-bottom: 2rem; }
    .mt-4 { margin-top: 1.5rem; }
    .pt-4 { padding-top: 1.5rem; }
    .p-3 { padding: 1rem; }
    .flex-1 { flex: 1; }
    .w-full { width: 100%; }
    .align-items-center { align-items: center; }
    .justify-content-end { justify-content: flex-end; }
    .font-semibold { font-weight: 600; }
    .font-mono { font-family: monospace; }
    .border-round { border-radius: 6px; }
    .border-1 { border: 1px solid; }
    .border-top-1 { border-top: 1px solid; }
    .border-gray-200 { border-color: rgba(0,0,0,0.1); }
  `]
})
export class GameCategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditMode = false;
  categoryId: string | null = null;

  private fb = inject(FormBuilder);
  private categorySvc = inject(GameCategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      themeColor: ['#00e5ff'],
      iconUrl: ['/assets/icons/default.svg']
    });
  }

  get f() { return this.categoryForm.controls; }

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');

    if (this.categoryId) {
      this.isEditMode = true;
      this.categorySvc.getCategoryById(this.categoryId).pipe(take(1)).subscribe({
        next: (category) => {
          if (category) {
            this.categoryForm.patchValue({
              name: category.name,
              description: category.description,
              themeColor: category.themeColor,
              iconUrl: category.iconUrl
            });
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load category.' });
          this.goBack();
        }
      });
    }
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;

    const formValue = this.categoryForm.value;

    if (this.isEditMode && this.categoryId) {
      this.categorySvc.updateCategory(this.categoryId, formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Category updated successfully!' });
          this.goBack();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update category.' })
      });
    } else {
      this.categorySvc.addCategory(formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Category created successfully!' });
          this.goBack();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create category.' })
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/categories']);
  }
}
