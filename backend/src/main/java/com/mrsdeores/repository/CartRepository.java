package com.mrsdeores.repository;

import com.mrsdeores.models.Cart;
import com.mrsdeores.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);

    Optional<Cart> findBySessionId(String sessionId);
}
