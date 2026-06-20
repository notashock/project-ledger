package com.trustledger.config;

import com.trustledger.model.AppUser;
import com.trustledger.model.enums.UserRole;
import com.trustledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final jakarta.persistence.EntityManager entityManager;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void run(String... args) throws Exception {
        AppUser admin;
        if (userRepository.count() == 0) {
            admin = AppUser.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role(UserRole.ROLE_ADMIN)
                    .build();
            admin = userRepository.save(admin);
            System.out.println("Default admin user seeded: admin / admin123");
        } else {
            admin = userRepository.findByUsername("admin").orElse(null);
            if (admin == null) {
                admin = userRepository.findAll().get(0);
            }
        }

        if (admin != null) {
            // Migrate existing data that doesn't have a user_id
            String[] entities = {"Farmer", "Godown", "CropPurchase", "BulkPurchase", "LedgerDebit", "InventoryLog", "DailyRate"};
            for (String entity : entities) {
                int updated = entityManager.createQuery("UPDATE " + entity + " e SET e.user = :admin WHERE e.user IS NULL")
                        .setParameter("admin", admin)
                        .executeUpdate();
                if (updated > 0) {
                    System.out.println("Migrated " + updated + " " + entity + " records to admin user.");
                }
            }
        }
    }
}
