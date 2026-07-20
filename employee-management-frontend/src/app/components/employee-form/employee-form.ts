import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService, Employee } from '../../services/employee';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css'
})
export class EmployeeForm implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.employeeForm = this.fb.group({
      employeeName: ['', [Validators.required, Validators.minLength(2)]],
      contactNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      emailId: ['', [Validators.required, Validators.email]],
      deptId: ['', Validators.required],
      password: ['', Validators.required],
      gender: ['', Validators.required],
      role: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.employeeId) {
      this.isEditMode = true;
      this.loadEmployee();
    }
  }

  loadEmployee(): void {
    this.loading = true;
    this.employeeService.getEmployee(this.employeeId!).subscribe({
      next: (emp) => {
        this.employeeForm.patchValue({
          employeeName: emp.employeeName,
          contactNo: emp.contactNo,
          emailId: emp.emailId,
          deptId: emp.deptId,
          password: emp.password,
          gender: emp.gender,
          role: emp.role,
          isActive: emp.isActive
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load employee';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) return;

    this.loading = true;
    this.error = null;
    const employeeData: Employee = this.employeeForm.value;
    employeeData.isActive = (employeeData.isActive as any) === true || (employeeData.isActive as any) === 'true';

    if (this.isEditMode && this.employeeId) {
      this.employeeService.updateEmployee(this.employeeId, employeeData).subscribe({
        next: () => {
          this.router.navigate(['/employees']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to update employee';
          this.loading = false;
        }
      });
    } else {
      this.employeeService.createEmployee(employeeData).subscribe({
        next: () => {
          this.employeeForm.reset();
          this.router.navigate(['/employees']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to create employee';
          this.loading = false;
        }
      });
    }
  }
}