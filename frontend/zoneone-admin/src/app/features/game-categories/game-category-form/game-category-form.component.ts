import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameCategoryService } from '../../../core/services/game-category.service';
import { take } from 'rxjs';

@Component({
    selector: 'app-game-category-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="form-wrapper">
      <button class="back-btn" (click)="goBack()">← Back to Categories</button>
      
      <div class="form-container">
        <div class="form-header">
          <h2 class="title">{{ isEditMode ? 'Edit' : 'Create' }} Category</h2>
          <p class="subtitle">{{ isEditMode ? 'Update existing gaming zone details' : 'Configure a new gaming zone category' }}</p>
        </div>

        <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="neon-form">
          <div class="form-group">
            <label for="name">Category Name</label>
            <input type="text" id="name" formControlName="name" placeholder="e.g. Virtual Reality Setup" 
                   [class.is-invalid]="f['name'].invalid && (f['name'].dirty || f['name'].touched)">
            <div *ngIf="f['name'].invalid && (f['name'].dirty || f['name'].touched)" class="invalid-feedback">
              Name is required.
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" formControlName="description" rows="3" placeholder="Describe the zone's equipment and vibe..."
                      [class.is-invalid]="f['description'].invalid && (f['description'].dirty || f['description'].touched)"></textarea>
             <div *ngIf="f['description'].invalid && (f['description'].dirty || f['description'].touched)" class="invalid-feedback">
              Description is required.
            </div>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label for="themeColor">Theme Color</label>
              <div class="color-picker-wrapper">
                <input type="color" id="themeColor" formControlName="themeColor">
                <span class="color-value">{{ f['themeColor'].value }}</span>
              </div>
            </div>

            <div class="form-group half">
              <label for="iconUrl">Icon URL (optional)</label>
              <input type="text" id="iconUrl" formControlName="iconUrl" placeholder="/assets/icons/default.svg">
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="goBack()">Cancel</button>
            <button type="submit" class="btn-submit" [disabled]="categoryForm.invalid">
              {{ isEditMode ? 'Save Changes' : 'Create Category' }}
            </button>
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

    .back-btn {
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-bottom: 2rem;
      display: inline-flex;
      align-items: center;
      transition: color var(--transition-fast);

      &:hover {
        color: var(--text-primary);
      }
    }

    .form-container {
      background-color: var(--bg-card);
      border-radius: var(--border-radius-lg);
      padding: 3rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    .form-header {
      margin-bottom: 2.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 1.5rem;

      .title {
        font-size: 2rem;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }
      .subtitle { color: var(--text-muted); }
    }

    .neon-form {
      .form-group {
        margin-bottom: 1.5rem;
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.95rem;
        }

        input[type="text"], textarea {
          width: 100%;
          padding: 1rem;
          background-color: var(--bg-darker);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--border-radius-sm);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 1rem;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

          &:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary-glow);
            outline: none;
          }

          &.is-invalid {
            border-color: #ff3333;
            &:focus { box-shadow: 0 0 0 3px rgba(255, 51, 51, 0.2); }
          }
        }
        
        textarea { resize: vertical; min-height: 100px; }
      }

      .form-row {
        display: flex;
        gap: 1.5rem;
        .half { flex: 1; }
      }
    }

    .color-picker-wrapper {
      display: flex;
      align-items: center;
      gap: 1rem;
      background-color: var(--bg-darker);
      padding: 0.5rem 1rem;
      border-radius: var(--border-radius-sm);
      border: 1px solid rgba(255,255,255,0.1);

      input[type="color"] {
        -webkit-appearance: none;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        padding: 0;
        background: none;

        &::-webkit-color-swatch-wrapper { padding: 0; }
        &::-webkit-color-swatch { border: none; border-radius: 50%; }
      }

      .color-value {
        font-family: monospace;
        color: var(--text-primary);
      }
    }

    .invalid-feedback {
      color: #ff3333;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.05);

      button {
        padding: 0.75rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        border-radius: var(--border-radius-sm);
        transition: all var(--transition-fast);
      }

      .btn-cancel {
        background-color: transparent;
        color: var(--text-secondary);
        border: 1px solid rgba(255,255,255,0.1);
        
        &:hover {
          background-color: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
      }

      .btn-submit {
        background-color: var(--primary);
        color: var(--bg-darker);
        box-shadow: 0 0 15px var(--primary-glow);

        &:hover:not(:disabled) {
          background-color: #00cce6;
          transform: translateY(-2px);
        }

        &:disabled {
          background-color: rgba(255,255,255,0.1);
          color: var(--text-muted);
          box-shadow: none;
          cursor: not-allowed;
          transform: none;
        }
      }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
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
            this.categorySvc.getCategoryById(this.categoryId).pipe(take(1)).subscribe(category => {
                if (category) {
                    this.categoryForm.patchValue({
                        name: category.name,
                        description: category.description,
                        themeColor: category.themeColor,
                        iconUrl: category.iconUrl
                    });
                }
            });
        }
    }

    onSubmit(): void {
        if (this.categoryForm.invalid) return;

        const formValue = this.categoryForm.value;

        if (this.isEditMode && this.categoryId) {
            this.categorySvc.updateCategory(this.categoryId, formValue).subscribe(() => {
                this.goBack();
            });
        } else {
            this.categorySvc.addCategory(formValue).subscribe(() => {
                this.goBack();
            });
        }
    }

    goBack(): void {
        this.router.navigate(['/categories']);
    }
}
