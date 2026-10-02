package com.worksphere.backend.service;

import com.worksphere.backend.entity.Attendance;
import com.worksphere.backend.entity.Employee;
import com.worksphere.backend.repository.AttendanceRepository;
import com.worksphere.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
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

    public List<Attendance> findAll() { return repository.findAll(); }

    public Attendance clockIn(Long employeeId) {
        LocalDate today = LocalDate.now();
        List<Attendance> todayRecords = repository.findAll().stream()
            .filter(a -> a.getEmployee().getId().equals(employeeId) && a.getWorkDate().equals(today))
            .toList();

        if (!todayRecords.isEmpty()) {
            Attendance existing = todayRecords.get(todayRecords.size() - 1);
            if (existing.getCheckOut() == null) {
                throw new IllegalStateException("You are already clocked in. Please clock out first.");
            }
        }

        Employee emp = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        Attendance attendance = new Attendance();
        attendance.setEmployee(emp);
        attendance.setWorkDate(today);
        attendance.setCheckIn(LocalTime.now());
        attendance.setStatus(Attendance.Status.PRESENT); // default, updated on checkout
        
        return repository.save(attendance);
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
        if (hours < 6) {
            attendance.setStatus(Attendance.Status.HALF_DAY);
        } else {
            attendance.setStatus(Attendance.Status.PRESENT);
        }

        return repository.save(attendance);
    }
}
