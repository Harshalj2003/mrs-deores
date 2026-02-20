package com.mrsdeores.repository;

import com.mrsdeores.models.AdminInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminInvitationRepository extends JpaRepository<AdminInvitation, Long> {
    Optional<AdminInvitation> findByEmailAndPhoneAndInviteToken(String email, String phone, String inviteToken);
}
