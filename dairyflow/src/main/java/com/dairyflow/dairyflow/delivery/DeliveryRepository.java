package com.dairyflow.dairyflow.delivery;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DeliveryRepository
        extends MongoRepository<Delivery, String> {

    boolean existsByFarmerIdAndDateAndShiftAndStatusNot(
            String farmerId,
            String date,
            String shift,
            String status
    );

    List<Delivery> findByFarmerId(String farmerId);

    List<Delivery> findByDate(String date);
}