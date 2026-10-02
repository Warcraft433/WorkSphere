package com.worksphere.backend.service;
import com.worksphere.backend.entity.User;
import com.worksphere.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public List<User> findAll() { return repository.findAll(); }
    public User findById(Long id) { return repository.findById(id).orElse(null); }
    public User save(User entity) { return repository.save(entity); }
    public void deleteById(Long id) { repository.deleteById(id); }

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = repository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Incorrect current password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
    }
}
