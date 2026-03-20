import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UserService, UserDto } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    SelectModule,
    PasswordModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  template: `
    <div class="list-container p-4">
      <div class="list-header flex justify-content-between align-items-end mb-4">
        <div>
          <h1 class="page-title text-4xl font-bold mb-1">User Management</h1>
          <p class="page-subtitle text-600">Configure system access and user roles</p>
        </div>
        <p-button label="Add New User" icon="pi pi-plus" (onClick)="showDialog()"></p-button>
      </div>

      <p-table #dt [value]="users()" [loading]="loading()" responsiveLayout="scroll"
               [paginator]="true" [rows]="10" [rowsPerPageOptions]="[5, 10, 25]"
               [showGridlines]="true" [stripedRows]="true"
               [globalFilterFields]="['fullName', 'userName', 'role']"
               styleClass="p-datatable-sm shadow-2">
        <ng-template pTemplate="caption">
            <div class="flex justify-content-end">
                <p-iconField iconPosition="left">
                    <p-inputIcon styleClass="pi pi-search" />
                    <input pInputText type="text" #filter (input)="dt.filterGlobal(filter.value, 'contains')" 
                           placeholder="Search users..." />
                </p-iconField>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="fullName">
              <div class="flex-header">
                Full Name <p-sortIcon field="fullName"></p-sortIcon>
                <p-columnFilter type="text" field="fullName" display="menu"></p-columnFilter>
              </div>
            </th>
            <th pSortableColumn="userName">
              <div class="flex-header">
                User Name <p-sortIcon field="userName"></p-sortIcon>
                <p-columnFilter type="text" field="userName" display="menu"></p-columnFilter>
              </div>
            </th>
            <th pSortableColumn="role">
               <div class="flex-header">
                  Role <p-sortIcon field="role"></p-sortIcon>
                  <p-columnFilter field="role" matchMode="equals" display="menu">
                    <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                        <p-select [ngModel]="value" [options]="roles" (onChange)="filter($event.value)" 
                                 placeholder="Any" [showClear]="true" appendTo="body"
                                 optionLabel="label" optionValue="value">
                        </p-select>
                    </ng-template>
                  </p-columnFilter>
               </div>
            </th>
            <th class="text-right">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-user>
          <tr>
            <td class="font-bold">{{ user.fullName }}</td>
            <td class="font-mono">{{ user.userName }}</td>
            <td>
               <span class="role-badge">
                  {{ user.role }}
               </span>
            </td>
            <td class="text-right">
              <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info" 
                       (onClick)="editUser(user)" [style]="{'margin-right': '0.5rem'}"></p-button>
              <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" 
                       (onClick)="deleteUser(user)" [disabled]="user.userName.toLowerCase() === 'admin'"></p-button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="4" class="text-center p-4 text-secondary">No system users found.</td>
          </tr>
        </ng-template>
      </p-table>

      <!-- User Form Dialog -->
      <p-dialog [(visible)]="displayDialog" [header]="isEditMode ? 'Edit User' : 'Create User'" 
                [modal]="true" [style]="{width: '500px'}" styleClass="p-fluid shadow-6"
                [draggable]="false" [resizable]="false">
        <form [formGroup]="userForm" (ngSubmit)="saveUser()" class="flex flex-column gap-3 mt-3">
          
          <div class="field">
            <label for="userName" class="font-bold block mb-2 text-secondary">User Name</label>
            <input pInputText id="userName" formControlName="userName" placeholder="e.g. jdoe" class="w-full" />
            <small *ngIf="f['userName'].invalid && f['userName'].touched" class="text-red-400">
              User Name is required.
            </small>
          </div>

          <div class="field">
            <label for="password" class="font-bold block mb-2 text-secondary">
                Password {{ isEditMode ? '(Optional)' : '' }}
            </label>
            <p-password id="password" formControlName="password" [toggleMask]="true" [feedback]="false"
                        placeholder="{{ isEditMode ? 'Enter only to change' : 'Enter secure password' }}" 
                        styleClass="w-full" inputStyleClass="w-full">
            </p-password>
            <small *ngIf="f['password'].invalid && f['password'].touched && !isEditMode" class="text-red-400">
              Password is required.
            </small>
          </div>

          <div class="field">
            <label for="fullName" class="font-bold block mb-2 text-secondary">Full Name</label>
            <input pInputText id="fullName" formControlName="fullName" placeholder="e.g. John Doe" class="w-full" />
            <small *ngIf="f['fullName'].invalid && f['fullName'].touched" class="text-red-400">
              Full Name is required.
            </small>
          </div>

          <div class="field">
            <label for="role" class="font-bold block mb-2 text-secondary">Role</label>
            <p-select [options]="roles" formControlName="role" placeholder="Select a Role" 
                       appendTo="body" optionLabel="label" optionValue="value" class="w-full"></p-select>
          </div>

          <div class="flex justify-content-end gap-2 mt-4">
            <p-button label="Cancel" icon="pi pi-times" (onClick)="displayDialog = false" 
                     styleClass="p-button-text p-button-secondary"></p-button>
            <p-button label="Save" icon="pi pi-check" type="submit" [loading]="submitting()"
                     [disabled]="userForm.invalid" styleClass="p-button-theme"></p-button>
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

    .page-title { color: #1e293b; }
    .page-subtitle { color: #64748b; }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      background: rgba(5, 90, 135, 0.1); 
      color: #055a87;
      border: 1px solid rgba(5, 90, 135, 0.2);
    }

    .flex-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 600; }
    .font-mono { font-family: monospace; }
    .text-secondary { color: #475569; }
    .text-red-400 { color: #ef4444; }

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
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  users = signal<UserDto[]>([]);
  loading = signal(false);
  submitting = signal(false);
  
  displayDialog = false;
  isEditMode = false;
  selectedUserId: string | null = null;

  roles = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Manager', value: 'Manager' },
    { label: 'Counter Staff', value: 'CounterStaff' }
  ];

  userForm = this.fb.group({
    userName: ['', Validators.required],
    fullName: ['', Validators.required],
    password: ['', Validators.required],
    role: ['CounterStaff', Validators.required]
  });

  get f() { return this.userForm.controls; }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
        this.loading.set(false);
      }
    });
  }

  showDialog() {
    this.isEditMode = false;
    this.selectedUserId = null;
    this.userForm.reset({ role: 'CounterStaff' });
    this.userForm.get('password')?.setValidators(Validators.required);
    this.userForm.get('password')?.updateValueAndValidity();
    this.displayDialog = true;
  }

  editUser(user: UserDto) {
    this.isEditMode = true;
    this.selectedUserId = user.id;
    this.userForm.patchValue({
      userName: user.userName,
      fullName: user.fullName,
      role: user.role,
      password: ''
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.displayDialog = true;
  }

  saveUser() {
    if (this.userForm.invalid) return;

    this.submitting.set(true);
    const formValue = this.userForm.getRawValue();

    if (this.isEditMode && this.selectedUserId) {
      this.userService.updateUser(this.selectedUserId, { 
        userName: formValue.userName,
        fullName: formValue.fullName, 
        role: formValue.role,
        password: formValue.password 
      }).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully' });
          this.loadUsers();
          this.displayDialog = false;
          this.submitting.set(false);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error || 'Update failed' });
          this.submitting.set(false);
        }
      });
    } else {
      this.userService.createUser(formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created successfully' });
          this.loadUsers();
          this.displayDialog = false;
          this.submitting.set(false);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error || 'Creation failed' });
          this.submitting.set(false);
        }
      });
    }
  }

  deleteUser(user: UserDto) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user "${user.userName}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted successfully' });
            this.loadUsers();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error || 'Delete failed' });
          }
        });
      }
    });
  }
}
