package com.taskbar.user_management.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_profiles")
@Data
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long authUserId;

    private String name;

    private String email;

    private String department;

    private String role = "MEMBER";

    private String phone;
}
