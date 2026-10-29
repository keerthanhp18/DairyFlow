
package com.dairyflow.dairyflow.payment;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface PaymentRepository
        extends MongoRepository<Payment, String> {

    Optional<Payment> findByFarmerIdAndStartDateAndEndDate(
            String farmerId,
            String startDate,
            String endDate
    );
}
