package com.mrsdeores.repository;

import com.mrsdeores.models.PasswordResetToken;
import com.mrsdeores.models.User;
import com.mrsdeores.models.AdminInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUser(User user);

    void deleteByAdminInvitation(AdminInvitation adminInvitation);
}
