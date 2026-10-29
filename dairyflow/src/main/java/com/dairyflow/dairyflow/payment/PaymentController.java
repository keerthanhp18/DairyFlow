
package com.dairyflow.dairyflow.payment;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dairyflow.dairyflow.advance.Advance;
import com.dairyflow.dairyflow.advance.AdvanceRepository;
import com.dairyflow.dairyflow.delivery.Delivery;
import com.dairyflow.dairyflow.delivery.DeliveryRepository;
import com.dairyflow.dairyflow.farmer.Farmer;
import com.dairyflow.dairyflow.farmer.FarmerRepository;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final AdvanceRepository advanceRepository;
    private final DeliveryRepository deliveryRepository;
    private final FarmerRepository farmerRepository;

    public PaymentController(
            PaymentRepository paymentRepository,
            AdvanceRepository advanceRepository,
            DeliveryRepository deliveryRepository,
            FarmerRepository farmerRepository) {
        this.paymentRepository = paymentRepository;
        this.advanceRepository = advanceRepository;
        this.deliveryRepository = deliveryRepository;
        this.farmerRepository = farmerRepository;
    }

    @GetMapping
    public List<Payment> getPayments() {
        return paymentRepository.findAll();
    }

    @PostMapping("/calculate")
    public ResponseEntity<?> calculatePayment(
            @RequestBody Map<String, String> request) {

        String farmerId = request.get("farmerId");
        String startDate = request.get("startDate");
        String endDate = request.get("endDate");

        if (farmerId == null || farmerId.isBlank()
                || startDate == null || endDate == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Farmer and payment dates are required."));
        }

        LocalDate start;
        LocalDate end;

        try {
            start = LocalDate.parse(startDate);
            end = LocalDate.parse(endDate);
        } catch (Exception ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Dates must use YYYY-MM-DD format."));
        }

       
        long days = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;

        if (end.isBefore(start) || days > 10) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Select a payment period of at most 10 days."));
        }


        var existing = paymentRepository
                .findByFarmerIdAndStartDateAndEndDate(
                        farmerId, startDate, endDate);

        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }

        var farmerOptional = farmerRepository.findById(farmerId);

        if (farmerOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Farmer not found."));
        }

        Farmer farmer = farmerOptional.get();

        List<Delivery> deliveries =
                deliveryRepository.findByFarmerId(farmerId);

        double gross = deliveries.stream()
                .filter(d -> "Accepted".equals(d.getStatus()))
                .filter(d -> !LocalDate.parse(d.getDate()).isBefore(start))
                .filter(d -> !LocalDate.parse(d.getDate()).isAfter(end))
                .mapToDouble(Delivery::getAmount)
                .sum();

        List<Advance> advances =
                advanceRepository.findByFarmerId(farmerId);

        double outstanding = advances.stream()
                .mapToDouble(a -> Math.max(
                        0, a.getAmount() - a.getDeductedAmount()))
                .sum();

        double deduction = Math.min(gross, outstanding);
        double netPayable = gross - deduction;

        double remaining = outstanding - deduction;

        // Apply the deduction to advances, oldest first.
        advances.sort((a, b) ->
                a.getDate().compareTo(b.getDate()));

        double amountLeftToDeduct = deduction;

        for (Advance advance : advances) {
            double balance = Math.max(
                    0, advance.getAmount() - advance.getDeductedAmount());

            double applied = Math.min(balance, amountLeftToDeduct);

            if (applied > 0) {
                advance.setDeductedAmount(
                        advance.getDeductedAmount() + applied);
                advanceRepository.save(advance);
                amountLeftToDeduct -= applied;
            }

            if (amountLeftToDeduct <= 0) {
                break;
            }
        }

        Payment payment = new Payment();
        payment.setFarmerId(farmerId);
        payment.setFarmer(farmer.getName());
        payment.setStartDate(startDate);
        payment.setEndDate(endDate);
        payment.setGrossAmount(round(gross));
        payment.setAdvanceDeducted(round(deduction));
        payment.setNetPayable(round(netPayable));
        payment.setOutstandingAdvance(round(remaining));
        payment.setStatus("Calculated");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentRepository.save(payment));
    }

    private double round(double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }
}
