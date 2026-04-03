package com.taskbar.user_management.controller;

import com.taskbar.user_management.entity.UserProfile;
import com.taskbar.user_management.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserProfileRepository userProfileRepository;

    @GetMapping
    public List<UserProfile> getAllUsers() {
        return userProfileRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfile> getUserById(@PathVariable Long id) {
        Optional<UserProfile> user = userProfileRepository.findById(id);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/auth/{authUserId}")
    public ResponseEntity<UserProfile> getUserByAuthId(@PathVariable Long authUserId) {
        Optional<UserProfile> user = userProfileRepository.findByAuthUserId(authUserId);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public UserProfile createUser(@RequestBody UserProfile userProfile) {
        return userProfileRepository.save(userProfile);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfile> updateUser(@PathVariable Long id, @RequestBody UserProfile details) {
        Optional<UserProfile> userOpt = userProfileRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        UserProfile user = userOpt.get();
        user.setName(details.getName());
        user.setEmail(details.getEmail());
        user.setDepartment(details.getDepartment());
        user.setRole(details.getRole());
        user.setPhone(details.getPhone());
        return ResponseEntity.ok(userProfileRepository.save(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userProfileRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userProfileRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
