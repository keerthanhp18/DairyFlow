
package com.dairyflow.dairyflow.advance;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dairyflow.dairyflow.farmer.Farmer;
import com.dairyflow.dairyflow.farmer.FarmerRepository;

@RestController
@RequestMapping("/api/advances")
@CrossOrigin(origins = "http://localhost:5173")
public class AdvanceController {

    private final AdvanceRepository advanceRepository;
    private final FarmerRepository farmerRepository;

    public AdvanceController(
            AdvanceRepository advanceRepository,
            FarmerRepository farmerRepository) {
        this.advanceRepository = advanceRepository;
        this.farmerRepository = farmerRepository;
    }

    @GetMapping
    public List<Advance> getAllAdvances() {
        return advanceRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> addAdvance(
            @RequestBody Advance request) {

        if (request.getFarmerId() == null
                || request.getFarmerId().isBlank()
                || request.getDate() == null
                || request.getDate().isBlank()
                || !Double.isFinite(request.getAmount())
                || request.getAmount() <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Enter a valid farmer, date and advance amount."));
        }

        var farmerOptional =
                farmerRepository.findById(request.getFarmerId());

        if (farmerOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Farmer not found."));
        }

        Farmer farmer = farmerOptional.get();

        Advance advance = new Advance();
        advance.setFarmerId(request.getFarmerId());
        advance.setFarmer(farmer.getName());
        advance.setDate(request.getDate());
        advance.setAmount(
                Math.round(request.getAmount() * 100.0) / 100.0);
        advance.setDeductedAmount(0);
        advance.setNote(
                request.getNote() == null ? "" : request.getNote());

        Advance saved = advanceRepository.save(advance);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
