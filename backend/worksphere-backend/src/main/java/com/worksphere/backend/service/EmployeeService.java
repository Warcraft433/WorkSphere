package com.worksphere.backend.service;

import com.worksphere.backend.entity.Employee;
import com.worksphere.backend.entity.User;
import com.worksphere.backend.repository.UserRepository;
import com.worksphere.backend.repository.EmployeeRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeRepository repository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;

    public Page<Employee> findAll(Pageable pageable) { return repository.findAll(pageable); }
    public List<Employee> findAll() { return repository.findAll(); }
    public Employee findById(Long id) { return repository.findById(id).orElse(null); }

    public Employee save(Employee entity) {
        boolean isNew = entity.getId() == null;
        Employee saved = repository.save(entity);

        if (isNew) {
            // Only create user account if one doesn't already exist for this employee
            boolean userExists = userRepository.findAll().stream()
                .anyMatch(u -> u.getEmployee() != null && u.getEmployee().getId().equals(saved.getId()));

            if (!userExists) {
                User user = new User();
                user.setUsername(saved.getEmail());
                user.setPassword(passwordEncoder.encode("password123"));
                user.setRole(User.Role.EMPLOYEE);
                user.setStatus(true);
                user.setMustChangePassword(false);
                user.setEmployee(saved);
                userRepository.save(user);
            }

            // Log the activity
            String actor = "system";
            try {
                var auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated()) {
                    actor = auth.getName();
                }
            } catch (Exception ignored) {}

            activityLogService.log(
                "EMPLOYEE_CREATED",
                actor + " added employee " + saved.getFirstName() + " " + saved.getLastName(),
                actor,
                saved.getId()
            );
        }
        return saved;
    }

    public void deleteById(Long id) {
        Employee emp = repository.findById(id).orElse(null);
        if (emp != null) {
            String actor = "system";
            try {
                var auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null) actor = auth.getName();
            } catch (Exception ignored) {}
            activityLogService.log(
                "EMPLOYEE_DELETED",
                actor + " deleted employee " + emp.getFirstName() + " " + emp.getLastName(),
                actor,
                id
            );
        }
        repository.deleteById(id);
    }
}
