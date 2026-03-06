package com.mrsdeores.repository;

import com.mrsdeores.models.AdminInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminInvitationRepository extends JpaRepository<AdminInvitation, Long> {
    Optional<AdminInvitation> findByEmailAndPhoneAndInviteToken(String email, String phone, String inviteToken);

    Optional<AdminInvitation> findByUsername(String username);

    Optional<AdminInvitation> findByEmail(String email);

    Optional<AdminInvitation> findByEmailIgnoreCase(String email);

    Optional<AdminInvitation> findByUsernameOrEmail(String username, String email);

    Optional<AdminInvitation> findByUsernameOrEmailOrPhone(String username, String email, String phone);

    List<AdminInvitation> findAllByOrderByCreatedAtDesc();

    Optional<AdminInvitation> findByIsDefaultAdminTrue();
}
