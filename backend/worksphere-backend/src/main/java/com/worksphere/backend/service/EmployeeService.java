package com.worksphere.backend.service;
import com.worksphere.backend.entity.Employee;
import com.worksphere.backend.entity.User;
import com.worksphere.backend.repository.UserRepository;
import com.worksphere.backend.repository.EmployeeRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    public Page<Employee> findAll(Pageable pageable) { return repository.findAll(pageable); }
    public List<Employee> findAll() { return repository.findAll(); }
    public Employee findById(Long id) { return repository.findById(id).orElse(null); }
    public Employee save(Employee entity) { 
        boolean isNew = entity.getId() == null;
        Employee saved = repository.save(entity); 
        
        if (isNew) {
            User user = new User();
            user.setUsername(saved.getEmail()); // Using email as username for employees
            user.setPassword(passwordEncoder.encode("password123")); // Default password
            user.setRole(User.Role.EMPLOYEE);
            user.setStatus(true);
            user.setEmployee(saved);
            userRepository.save(user);
        }
        return saved;
    }
    public void deleteById(Long id) { repository.deleteById(id); }
}
