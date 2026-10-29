
package com.dairyflow.dairyflow.advance;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AdvanceRepository
        extends MongoRepository<Advance, String> {

    List<Advance> findByFarmerId(String farmerId);
}
