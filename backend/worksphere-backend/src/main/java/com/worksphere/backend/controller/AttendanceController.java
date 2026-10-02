package com.worksphere.backend.controller;

import com.worksphere.backend.entity.Attendance;
import com.worksphere.backend.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendances")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {
    
    private final AttendanceService service;

    @GetMapping
    public List<Attendance> getAll() { return service.findAll(); }

    @PostMapping("/clock-in/{employeeId}")
    public ResponseEntity<?> clockIn(@PathVariable Long employeeId) {
        try {
            return ResponseEntity.ok(service.clockIn(employeeId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/clock-out/{id}")
    public ResponseEntity<?> clockOut(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.clockOut(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
