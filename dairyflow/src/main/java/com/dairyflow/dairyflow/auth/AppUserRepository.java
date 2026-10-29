
package com.dairyflow.dairyflow.auth;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AppUserRepository
        extends MongoRepository<AppUser, String> {

    Optional<AppUser> findByPhone(String phone);

    boolean existsByPhone(String phone);
}
