package com.mrsdeores.controllers;

import com.mrsdeores.repository.AddressRepository;
import com.mrsdeores.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    AddressRepository addressRepository;

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserAnalytics() {
        long totalUsers = userRepository.count();

        // Approximate active users (this would be better with lastLogin or order
        // history)
        // For now using total users as a placeholder or could join with orders
        long activeUsers = totalUsers;

        // City distribution
        List<String> cities = addressRepository.findAll().stream()
                .map(addr -> addr.getCity().trim().toUpperCase())
                .collect(Collectors.toList());

        Map<String, Long> cityDistribution = cities.stream()
                .collect(Collectors.groupingBy(c -> c, Collectors.counting()));

        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", totalUsers);
        response.put("activeUsers", activeUsers);
        response.put("cityDistribution", cityDistribution);

        return ResponseEntity.ok(response);
    }
}
