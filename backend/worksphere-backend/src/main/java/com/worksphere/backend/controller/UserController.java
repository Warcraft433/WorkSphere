package com.worksphere.backend.controller;

import com.worksphere.backend.dto.CreateSubAdminDto;
import com.worksphere.backend.dto.PasswordChangeDto;
import com.worksphere.backend.dto.UpdateModulesDto;
import com.worksphere.backend.entity.User;
import com.worksphere.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService service;

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return service.findAll().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("username", u.getUsername());
            m.put("role", u.getRole().name());
            m.put("status", u.getStatus() != null && u.getStatus());
            m.put("mustChangePassword", u.getMustChangePassword() != null && u.getMustChangePassword());
            m.put("allowedModules", u.getAllowedModules() != null ? u.getAllowedModules() : "");
            m.put("employeeId", u.getEmployee() != null ? u.getEmployee().getId() : null);
            return m;
        }).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        User u = service.findById(id);
        if (u == null) return ResponseEntity.notFound().build();
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("username", u.getUsername());
        m.put("role", u.getRole().name());
        m.put("status", u.getStatus() != null && u.getStatus());
        m.put("allowedModules", u.getAllowedModules() != null ? u.getAllowedModules() : "");
        return ResponseEntity.ok(m);
    }

    @PostMapping("/sub-admin")
    public ResponseEntity<?> createSubAdmin(@RequestBody CreateSubAdminDto dto) {
        try {
            User created = service.createSubAdmin(dto.username(), dto.password(), dto.allowedModules());
            Map<String, Object> result = new HashMap<>();
            result.put("id", created.getId());
            result.put("username", created.getUsername());
            result.put("role", created.getRole().name());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/modules")
    public ResponseEntity<?> updateModules(@PathVariable Long id, @RequestBody UpdateModulesDto dto) {
        try {
            User updated = service.updateAllowedModules(id, dto.allowedModules());
            Map<String, Object> result = new HashMap<>();
            result.put("id", updated.getId());
            result.put("allowedModules", updated.getAllowedModules());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        try {
            User updated = service.toggleStatus(id, body.get("status"));
            Map<String, Object> result = new HashMap<>();
            result.put("id", updated.getId());
            result.put("status", updated.getStatus());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/enable-employee/{employeeId}")
    public ResponseEntity<?> enableEmployeeLogin(@PathVariable Long employeeId) {
        try {
            User user = service.enableEmployeeLogin(employeeId);
            Map<String, Object> result = new HashMap<>();
            result.put("id", user.getId());
            result.put("username", user.getUsername());
            result.put("message", "Employee login enabled. Initial password is the hire date (YYYY-MM-DD). Employee must change password on first login.");
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.deleteById(id); }

    @PutMapping("/me/password")
    public ResponseEntity<?> updatePassword(@RequestBody PasswordChangeDto dto) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            service.changePassword(username, dto.getCurrentPassword(), dto.getNewPassword());
            return ResponseEntity.ok("Password updated successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating password");
        }
    }
}
