package com.mrsdeores.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mrsdeores.models.User;
import com.mrsdeores.models.ERole;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsernameOrEmail(String username, String email);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    long countByLastLoginAtAfter(LocalDateTime since);

    java.util.List<User> findByLastLoginAtAfter(LocalDateTime since);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    java.util.List<User> findByRoleName(@Param("roleName") ERole roleName);
}
