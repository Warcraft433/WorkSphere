package com.worksphere.backend.controller;
import com.worksphere.backend.entity.User;
import com.worksphere.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import com.worksphere.backend.dto.PasswordChangeDto;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService service;

    @GetMapping
    public List<User> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public User create(@RequestBody User entity) { return service.save(entity); }

    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody User entity) {
        entity.setId(id);
        return service.save(entity);
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
