package com.worksphere.backend.controller;

import com.worksphere.backend.entity.ActivityLog;
import com.worksphere.backend.entity.Attendance;
import com.worksphere.backend.entity.LeaveRequest;
import com.worksphere.backend.repository.AttendanceRepository;
import com.worksphere.backend.repository.DepartmentRepository;
import com.worksphere.backend.repository.EmployeeRepository;
import com.worksphere.backend.repository.LeaveRequestRepository;
import com.worksphere.backend.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import com.worksphere.backend.entity.Employee;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;
    private final ActivityLogService activityLogService;

    @GetMapping("/stats")
    public DashboardStats getStats() {
        long employees = employeeRepository.count();
        long departments = departmentRepository.count();
        long pendingLeaves = leaveRequestRepository.countByStatus(LeaveRequest.Status.PENDING);

        // Today's attendance stats
        LocalDate today = LocalDate.now();
        List<Attendance> todayAttendance = attendanceRepository.findAll().stream()
            .filter(a -> a.getWorkDate() != null && a.getWorkDate().equals(today))
            .toList();

        long presentToday = todayAttendance.stream()
            .filter(a -> a.getStatus() == Attendance.Status.PRESENT || a.getCheckIn() != null)
            .count();

        long clockedIn = todayAttendance.stream()
            .filter(a -> a.getCheckIn() != null && a.getCheckOut() == null)
            .count();

        return new DashboardStats(employees, departments, pendingLeaves, presentToday, clockedIn);
    }

    @GetMapping("/activity")
    public List<ActivityLog> getRecentActivity() {
        return activityLogService.getRecent(10);
    }

    public record DashboardStats(
        long totalEmployees,
        long totalDepartments,
        long pendingLeaves,
        long presentToday,
        long clockedIn
    ) {}

    @GetMapping("/employees")
    public List<EmployeeOverviewDto> getEmployeeOverview(@RequestParam(required = false, defaultValue = "") String search) {
        LocalDate today = LocalDate.now();
        List<Attendance> todayAttendance = attendanceRepository.findByWorkDate(today);
        
        List<Employee> employees;
        if (search != null && !search.trim().isEmpty()) {
            employees = employeeRepository.search(search);
        } else {
            employees = employeeRepository.findAll();
        }
        
        return employees.stream().map(emp -> {
            boolean isClockedIn = todayAttendance.stream()
                .anyMatch(a -> a.getEmployee().getId().equals(emp.getId()) && a.getCheckIn() != null && a.getCheckOut() == null);
            return new EmployeeOverviewDto(
                emp.getId(), 
                emp.getFirstName(), 
                emp.getLastName(), 
                emp.getDepartment() != null ? emp.getDepartment().getName() : "No Dept", 
                isClockedIn
            );
        }).limit(search.isEmpty() ? 6 : 50).toList();
    }

    public record EmployeeOverviewDto(Long id, String firstName, String lastName, String department, boolean clockedIn) {}
}
