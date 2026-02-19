package com.mrsdeores.config;

import com.mrsdeores.models.Category;
import com.mrsdeores.models.ERole;
import com.mrsdeores.models.Product;
import com.mrsdeores.models.Role;
import com.mrsdeores.repository.CategoryRepository;
import com.mrsdeores.repository.ProductRepository;
import com.mrsdeores.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.findByName(ERole.ROLE_USER).isEmpty()) {
            roleRepository.save(new Role(ERole.ROLE_USER));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
        }

        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category("Traditional Snacks",
                    "Crispy and authentic homemade snacks",
                    "https://images.unsplash.com/photo-1601050690597-df0568f70968?auto=format&fit=crop&w=800&q=80"));
            Category premixes = categoryRepository.save(new Category("Instant Premixes",
                    "Ready-to-cook homemade premixes",
                    "https://images.unsplash.com/photo-1589113177863-26312a033215?auto=format&fit=crop&w=800&q=80"));
            Category masalas = categoryRepository.save(new Category("Handmade Masalas",
                    "Freshly grounded traditional spices",
                    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"));

            productRepository
                    .save(new Product("Puran Poli Premix", "Traditional high-quality Puran Poli stuffing premix.",
                            new BigDecimal("250.00"), new BigDecimal("199.00"), premixes));
            productRepository
                    .save(new Product("Ukadiche Modak Flour", "Finely grounded rice flour for authentic Modaks.",
                            new BigDecimal("150.00"), new BigDecimal("120.00"), premixes));
            productRepository.save(new Product("Ladoo Masala", "Signature blend of spices for Nutritious Ladoos.",
                    new BigDecimal("300.00"), new BigDecimal("240.00"), masalas));
            productRepository.save(new Product("Besan Ladoo Premix", "Instant mix for perfectly textured Besan Ladoos.",
                    new BigDecimal("280.00"), new BigDecimal("220.00"), premixes));
        }
    }
}
