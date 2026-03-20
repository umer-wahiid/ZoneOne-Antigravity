import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GameCategoryService } from '../../../core/services/game-category.service';
import { GameCategory } from '../../../core/models/game-category.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ColorPickerModule } from 'primeng/colorpicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game-category-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ColorPickerModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  template: `
    <div class="list-container p-4">
      <div class="list-header flex justify-content-between align-items-end mb-4">
        <div>
          <h1 class="page-title text-4xl font-bold mb-1">Games</h1>
          <p class="page-subtitle text-600">Manage games and their settings</p>
        </div>
        <p-button label="Add New Game" icon="pi pi-plus" (onClick)="showDialog()"></p-button>
      </div>

      <p-table #dt [value]="(categories$ | async) || []" [tableStyle]="{ 'min-width': '50rem' }" responsiveLayout="scroll"
               [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5, 10, 25]"
               [showGridlines]="false" [stripedRows]="true"
               [globalFilterFields]="['name', 'description']"
               styleClass="p-datatable-sm">
        <ng-template pTemplate="caption">
            <div class="flex justify-content-end">
                <p-iconField iconPosition="left">
                    <p-inputIcon styleClass="pi pi-search" />
                    <input pInputText type="text" #filter (input)="dt.filterGlobal(filter.value, 'contains')" placeholder="Search games..." />
                </p-iconField>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>Icon</th>
            <th pSortableColumn="name">
              <div class="flex align-items-center gap-2">
                Name <p-sortIcon field="name"></p-sortIcon>
                <p-columnFilter type="text" field="name" display="menu"></p-columnFilter>
              </div>
            </th>
            <th pSortableColumn="description">
              <div class="flex align-items-center gap-2">
                Description <p-sortIcon field="description"></p-sortIcon>
                <p-columnFilter type="text" field="description" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>Theme Color</th>
            <th class="text-right">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-category>
          <tr>
            <td>
              <div class="icon-preview" [style.background-color]="category.themeColor + '33'">
                <img [src]="category.iconUrl || '/assets/icons/default.svg'" alt="icon" onerror="this.src='/assets/icons/table-tennis.svg'">
              </div>
            </td>
            <td class="font-bold">{{ category.name }}</td>
            <td class="text-600 text-sm">{{ category.description }}</td>
            <td>
              <div class="color-indicator">
                <span class="color-dot" [style.background-color]="category.themeColor"></span>
                {{ category.themeColor }}
              </div>
            </td>
            <td class="text-right">
              <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" (onClick)="editCategory(category)" [style]="{'margin-right': '0.5rem'}"></p-button>
              <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="deleteCategory(category)"></p-button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="text-center p-4 text-500">No Games found. Try adding one!</td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Category Form Dialog -->
      <p-dialog [(visible)]="displayDialog" [header]="isEditMode ? 'Edit Game' : 'Create Game'" 
                [modal]="true" [style]="{width: '550px'}" styleClass="p-fluid shadow-6"
                [draggable]="false" [resizable]="false" [dismissableMask]="true">
        <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()" class="flex flex-column gap-3 mt-3">
          <div class="field">
            <label for="name" class="font-bold block mb-2 text-secondary">Game Name</label>
            <input pInputText id="name" formControlName="name" placeholder="e.g. Virtual Reality Setup" class="w-full" />
            <small *ngIf="f['name'].invalid && f['name'].touched" class="text-red-400">
              Name is required.
            </small>
          </div>

          <div class="field">
            <label for="description" class="font-bold block mb-2 text-secondary">Description</label>
            <textarea pTextarea id="description" formControlName="description" rows="3" 
                      placeholder="Describe the zone's equipment and vibe..." class="w-full"></textarea>
             <small *ngIf="f['description'].invalid && f['description'].touched" class="text-red-400">
              Description is required.
            </small>
          </div>

          <div class="flex gap-4">
            <div class="field flex-1">
              <label for="themeColor" class="font-bold block mb-2 text-secondary">Theme Color</label>
              <div class="flex align-items-center gap-3 bg-darker p-2 border-round border-1 border-300">
                <p-colorPicker formControlName="themeColor"></p-colorPicker>
                <span class="font-mono text-primary text-sm">{{ f['themeColor'].value }}</span>
              </div>
            </div>

            <div class="field flex-1">
              <label for="iconUrl" class="font-bold block mb-2 text-secondary">Icon URL (optional)</label>
              <input pInputText id="iconUrl" formControlName="iconUrl" placeholder="/assets/icons/default.svg" class="w-full" />
            </div>
          </div>

          <div class="flex justify-content-end gap-2 mt-4">
            <p-button label="Cancel" icon="pi pi-times" (onClick)="displayDialog = false" 
                     styleClass="p-button-text p-button-secondary"></p-button>
            <p-button label="Save" icon="pi pi-check" type="submit" [loading]="submitting()"
                     [disabled]="categoryForm.invalid" styleClass="p-button-theme"></p-button>
          </div>
        </form>
      </p-dialog>

      <p-confirmDialog header="Delete Confirmation" icon="pi pi-exclamation-triangle"></p-confirmDialog>
    </div>
  `,
  styles: [`
    .list-container {
      animation: fadeIn 0.3s ease-out;
    }

    .icon-preview {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 24px;
        height: 24px;
      }
    }

    .color-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: monospace;
      
      .color-dot {
        width: 16px;
        height: 16px;
        border-radius: 4px;
      }
    }

    .text-right { text-align: right; }
    .text-secondary { color: #475569; }
    .text-red-400 { color: #ef4444; }
    .bg-darker { background-color: #f8fafc; }
    .border-300 { border-color: #cbd5e1; }

    ::ng-deep {
      .p-button-theme {
        background: #055a87 !important;
        border-color: #055a87 !important;
        
        &:hover {
          background: #044a6e !important;
          border-color: #044a6e !important;
        }
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class GameCategoryListComponent implements OnInit {
  private categorySvc = inject(GameCategoryService);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  categories$: Observable<GameCategory[]> = this.categorySvc.categories$;

  displayDialog = false;
  isEditMode = false;
  selectedCategoryId: string | null = null;
  submitting = signal(false);

  categoryForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    themeColor: ['#055a87'],
    iconUrl: ['/assets/icons/default.svg']
  });

  get f() { return this.categoryForm.controls; }

  ngOnInit() { }

  showDialog() {
    this.isEditMode = false;
    this.selectedCategoryId = null;
    this.categoryForm.reset({
      themeColor: '#055a87',
      iconUrl: '/assets/icons/default.svg'
    });
    this.displayDialog = true;
  }

  editCategory(category: GameCategory) {
    this.isEditMode = true;
    this.selectedCategoryId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      themeColor: category.themeColor,
      iconUrl: category.iconUrl
    });
    this.displayDialog = true;
  }

  saveCategory() {
    if (this.categoryForm.invalid) return;

    this.submitting.set(true);
    const formValue = this.categoryForm.value;

    if (this.isEditMode && this.selectedCategoryId) {
      this.categorySvc.updateCategory(this.selectedCategoryId, formValue as any).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Game updated successfully!' });
          this.displayDialog = false;
          this.submitting.set(false);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update game.' });
          this.submitting.set(false);
        }
      });
    } else {
      this.categorySvc.addCategory(formValue as any).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Game created successfully!' });
          this.displayDialog = false;
          this.submitting.set(false);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create game.' });
          this.submitting.set(false);
        }
      });
    }
  }

  deleteCategory(category: GameCategory): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the "${category.name}" category?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.categorySvc.deleteCategory(category.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: 'Record deleted successfully' });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete category' });
          }
        });
      }
    });
  }
}
