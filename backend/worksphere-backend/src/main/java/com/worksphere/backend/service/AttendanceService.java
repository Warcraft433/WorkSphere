package com.worksphere.backend.service;

import com.worksphere.backend.entity.Attendance;
import com.worksphere.backend.entity.Employee;
import com.worksphere.backend.repository.AttendanceRepository;
import com.worksphere.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository repository;
    private final EmployeeRepository employeeRepository;
    private final ActivityLogService activityLogService;

    public List<Attendance> findAll() { return repository.findAll(); }

    public Attendance clockIn(Long employeeId) {
        LocalDate today = LocalDate.now();

        // Use proper query instead of full table scan
        List<Attendance> todayRecords = repository.findByEmployeeIdAndWorkDate(employeeId, today);
        if (!todayRecords.isEmpty()) {
            Attendance existing = todayRecords.get(todayRecords.size() - 1);
            if (existing.getCheckOut() == null) {
                throw new IllegalStateException("Already clocked in. Please clock out first.");
            }
        }

        Employee emp = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        Attendance attendance = new Attendance();
        attendance.setEmployee(emp);
        attendance.setWorkDate(today);
        attendance.setCheckIn(LocalTime.now());
        attendance.setStatus(Attendance.Status.PRESENT);

        Attendance saved = repository.save(attendance);

        // Log activity
        String actor = getActor();
        activityLogService.log(
            "CLOCK_IN",
            emp.getFirstName() + " " + emp.getLastName() + " clocked in",
            actor,
            employeeId
        );

        return saved;
    }

    public Attendance clockOut(Long attendanceId) {
        Attendance attendance = repository.findById(attendanceId)
            .orElseThrow(() -> new IllegalArgumentException("Attendance record not found"));

        if (attendance.getCheckOut() != null) {
            throw new IllegalStateException("Already clocked out.");
        }

        LocalTime out = LocalTime.now();
        attendance.setCheckOut(out);

        long hours = Duration.between(attendance.getCheckIn(), out).toHours();
        attendance.setStatus(hours < 6 ? Attendance.Status.HALF_DAY : Attendance.Status.PRESENT);

        Attendance saved = repository.save(attendance);

        // Log activity
        String actor = getActor();
        String empName = attendance.getEmployee() != null
            ? attendance.getEmployee().getFirstName() + " " + attendance.getEmployee().getLastName()
            : "Unknown";
        activityLogService.log(
            "CLOCK_OUT",
            empName + " clocked out (worked " + hours + "h)",
            actor,
            attendance.getEmployee() != null ? attendance.getEmployee().getId() : null
        );

        return saved;
    }

    private String getActor() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) return auth.getName();
        } catch (Exception ignored) {}
        return "system";
    }
}
