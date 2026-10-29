
package com.dairyflow.dairyflow.farmer;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface FarmerRepository
        extends MongoRepository<Farmer, String> {
}
