package com.worksphere.backend.service;

import com.worksphere.backend.entity.Employee;
import com.worksphere.backend.entity.User;
import com.worksphere.backend.repository.EmployeeRepository;
import com.worksphere.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> findAll() { return repository.findAll(); }
    public User findById(Long id) { return repository.findById(id).orElse(null); }

    public User save(User entity) {
        // If this is a new user with a plain (not encoded) password, encode it
        if (entity.getId() == null && entity.getPassword() != null && !entity.getPassword().startsWith("$2a$")) {
            entity.setPassword(passwordEncoder.encode(entity.getPassword()));
        }
        return repository.save(entity);
    }

    public void deleteById(Long id) { repository.deleteById(id); }

    /**
     * Creates a SUB_ADMIN account. Only ADMIN should call this.
     */
    public User createSubAdmin(String username, String rawPassword, String allowedModules) {
        if (repository.findByUsername(username) != null) {
            throw new IllegalArgumentException("Username already exists: " + username);
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(User.Role.SUB_ADMIN);
        user.setStatus(true);
        user.setMustChangePassword(true);
        user.setAllowedModules(allowedModules);
        return repository.save(user);
    }

    /**
     * Updates the modules a SUB_ADMIN can access.
     */
    public User updateAllowedModules(Long userId, String modules) {
        User user = repository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setAllowedModules(modules);
        return repository.save(user);
    }

    /**
     * Enables employee login using their hire date as the initial password.
     */
    public User enableEmployeeLogin(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        // Check if account already exists for this employee
        User existing = repository.findAll().stream()
            .filter(u -> u.getEmployee() != null && u.getEmployee().getId().equals(employeeId))
            .findFirst().orElse(null);

        String tempPassword = emp.getHireDate() != null
            ? emp.getHireDate().toString()  // e.g. "2024-03-15"
            : "changeme123";

        if (existing != null) {
            existing.setStatus(true);
            existing.setMustChangePassword(true);
            existing.setPassword(passwordEncoder.encode(tempPassword));
            return repository.save(existing);
        }

        // Use employee ID as username (e.g. "EMP001")
        String empUsername = "EMP" + String.format("%03d", empId(emp));
        if (repository.findByUsername(empUsername) != null) {
            empUsername = emp.getEmail(); // fallback to email
        }

        User user = new User();
        user.setEmployee(emp);
        user.setUsername(empUsername);
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setRole(User.Role.EMPLOYEE);
        user.setStatus(true);
        user.setMustChangePassword(true);
        return repository.save(user);
    }

    private Long empId(Employee emp) {
        return emp.getId();
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = repository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Incorrect current password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        repository.save(user);
    }

    public User toggleStatus(Long id, boolean status) {
        User user = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus(status);
        return repository.save(user);
    }
}
