
package com.dairyflow.dairyflow.farmer;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/farmers")
@CrossOrigin(origins = "http://localhost:5173")
public class FarmerController {

    private final FarmerRepository farmerRepository;

    public FarmerController(FarmerRepository farmerRepository) {
        this.farmerRepository = farmerRepository;
    }

    @PostMapping
    public Farmer addFarmer(@RequestBody Farmer farmer) {

        if (farmer.getName() == null
                || farmer.getName().isBlank()
                || farmer.getVillage() == null
                || farmer.getVillage().isBlank()
                || farmer.getPhone() == null
                || !farmer.getPhone().matches("[0-9]{10}")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter farmer name, village and a 10-digit phone number"
            );
        }

       return farmerRepository.save(farmer);
    }

    @GetMapping
    public List<Farmer> getAllFarmers() {
        return farmerRepository.findAll();
    }
}
