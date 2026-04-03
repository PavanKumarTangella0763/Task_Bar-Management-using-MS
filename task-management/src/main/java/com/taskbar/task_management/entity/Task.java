package com.taskbar.task_management.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status = "TODO";

    private String priority = "MEDIUM";

    private Long assignedUserId;

    private String assignedUsername;

    private LocalDate dueDate;

    private LocalDateTime createdAt = LocalDateTime.now();
}
