package com.mrsdeores.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mrsdeores.repository.AdminInvitationRepository;
import com.mrsdeores.security.AuthContext;
import com.mrsdeores.models.AdminInvitation;
import com.mrsdeores.models.User;
import com.mrsdeores.models.Role;
import com.mrsdeores.models.ERole;
import com.mrsdeores.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    AdminInvitationRepository adminInvitationRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        if (AuthContext.isAdminAttempt()) {
            AdminInvitation admin = adminInvitationRepository
                    .findByUsernameOrEmailOrPhone(identifier, identifier, identifier)
                    .orElseThrow(() -> new UsernameNotFoundException(
                            "Admin Not Found with credentials: " + identifier));

            // Map AdminInvitation fields to User model for compatibility with existing
            // UserDetailsImpl.build
            User adminUser = new User();
            adminUser.setUsername(admin.getUsername());
            adminUser.setEmail(admin.getEmail());
            adminUser.setPassword(admin.getPassword());

            // Admin role is implicit for isolated admins
            Role adminRole = new Role(ERole.ROLE_ADMIN);
            adminUser.setRoles(java.util.Collections.singleton(adminRole));

            return UserDetailsImpl.build(adminUser);
        }

        User user = userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(
                        () -> new UsernameNotFoundException("User Not Found with username or email: " + identifier));

        return UserDetailsImpl.build(user);
    }
}
