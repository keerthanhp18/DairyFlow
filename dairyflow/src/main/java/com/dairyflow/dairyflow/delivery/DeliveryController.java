
package com.dairyflow.dairyflow.delivery;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dairyflow.dairyflow.farmer.Farmer;
import com.dairyflow.dairyflow.farmer.FarmerRepository;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "http://localhost:5173")
public class DeliveryController {

    private final DeliveryRepository deliveryRepository;
    private final FarmerRepository farmerRepository;

    public DeliveryController(
            DeliveryRepository deliveryRepository,
            FarmerRepository farmerRepository) {
        this.deliveryRepository = deliveryRepository;
        this.farmerRepository = farmerRepository;
    }

    @GetMapping
    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> addDelivery(
            @RequestBody Delivery request) {

        if (request.getFarmerId() == null
                || request.getDate() == null
                || request.getShift() == null
                || request.getDate().isBlank()
                || request.getShift().isBlank()
                || !Double.isFinite(request.getLitres())
                || request.getLitres() <= 0
                || !Double.isFinite(request.getFat())
                || request.getFat() < 0
                || request.getFat() > 9) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Invalid entry. Litres must be above zero and fat must be between 0 and 9."));
        }

        var farmerOptional =
                farmerRepository.findById(request.getFarmerId());

        if (farmerOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Farmer not found."));
        }

        boolean duplicate =
                deliveryRepository
                        .existsByFarmerIdAndDateAndShiftAndStatusNot(
                                request.getFarmerId(),
                                request.getDate(),
                                request.getShift(),
                                "Cancelled");

        if (duplicate) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message",
                            "A delivery already exists for this farmer, date and shift."));
        }

        Farmer farmer = farmerOptional.get();

        double rate = Math.round(request.getFat() * 8 * 100.0) / 100.0;
        String status = request.getFat() < 3 ? "Rejected" : "Accepted";
        double amount = status.equals("Rejected")
                ? 0
                : Math.round(request.getLitres() * rate * 100.0) / 100.0;

        Delivery delivery = new Delivery();
        delivery.setFarmerId(request.getFarmerId());
        delivery.setFarmer(farmer.getName());
        delivery.setDate(request.getDate());
        delivery.setShift(request.getShift());
        delivery.setLitres(request.getLitres());
        delivery.setFat(request.getFat());
        delivery.setRate(rate);
        delivery.setAmount(amount);
        delivery.setStatus(status);

        Delivery saved = deliveryRepository.save(delivery);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
