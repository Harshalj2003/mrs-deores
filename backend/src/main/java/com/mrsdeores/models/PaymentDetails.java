package com.mrsdeores.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_details")
@Data
@NoArgsConstructor
public class PaymentDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_method")
    private String paymentMethod; // e.g., "CARD", "UPI", "MOCK"

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "status")
    private String status; // "PENDING", "COMPLETED", "FAILED"

    @Column(name = "payment_date")
    private LocalDateTime paymentDate = LocalDateTime.now();

    @OneToOne(mappedBy = "paymentDetails")
    private Order order;
}
