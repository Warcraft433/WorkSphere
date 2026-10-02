package com.worksphere.backend.config;

import com.worksphere.backend.entity.Department;
import com.worksphere.backend.entity.User;
import com.worksphere.backend.repository.DepartmentRepository;
import com.worksphere.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataSeeder runs on startup.
 * ONLY creates the default admin account and core departments if they don't already exist.
 * It DOES NOT generate random employees, payroll, or attendance records.
 *
 * To create sample/test data, use the development seed endpoint:
 *   POST /api/dev/seed  (only available in dev profile)
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Ensure the default admin account exists
        if (userRepository.findByUsername("admin") == null) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            admin.setStatus(true);
            admin.setMustChangePassword(false);
            userRepository.save(admin);
            System.out.println("[WorkSphere] Default Admin account created. Login: admin / admin123");
        }

        // 2. Create core departments if none exist
        if (departmentRepository.count() == 0) {
            String[][] departments = {
                {"Engineering",     "San Francisco"},
                {"Human Resources", "New York"},
                {"Sales",           "Chicago"},
                {"Finance",         "Boston"},
                {"Marketing",       "Los Angeles"}
            };
            for (String[] d : departments) {
                Department dept = new Department();
                dept.setName(d[0]);
                dept.setLocation(d[1]);
                departmentRepository.save(dept);
            }
            System.out.println("[WorkSphere] Core departments created.");
        }

        System.out.println("[WorkSphere] Startup complete. No sample employees or payroll were auto-generated.");
        System.out.println("[WorkSphere] Note: Using H2 in-memory database — data resets on restart (by design for portfolio demo).");
    }
}
