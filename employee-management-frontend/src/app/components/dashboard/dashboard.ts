import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { EmployeeService } from '../../services/employee';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  totalEmployees = 0;
  activeEmployees = 0;
  inactiveEmployees = 0;
  private chart: Chart | null = null;
  private subscription: Subscription | null = null;
  private routerSub: Subscription | null = null;

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.urlAfterRedirects.includes('/dashboard')) {
        this.loadStats();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  loadStats(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    console.log('Loading dashboard stats...');
    this.subscription = this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        console.log('Dashboard stats loaded:', employees);
        this.totalEmployees = employees.length;
        this.activeEmployees = employees.filter(e => e.isActive).length;
        this.inactiveEmployees = employees.filter(e => !e.isActive).length;
        this.cdr.detectChanges();
        this.initChart();
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.cdr.detectChanges();
      }
    });
  }

  initChart(): void {
    const ctx = document.getElementById('employeeChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Inactive'],
        datasets: [{
          data: [this.activeEmployees, this.inactiveEmployees],
          backgroundColor: [
            '#10b981',
            '#f59e0b'
          ],
          borderColor: [
            '#065f46',
            '#b45309'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 14
              },
              color: '#1e3c72'
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }
}
