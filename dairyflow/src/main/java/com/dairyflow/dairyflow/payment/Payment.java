
package com.dairyflow.dairyflow.payment;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    private String farmerId;
    private String farmer;
    private String startDate;
    private String endDate;
    private double grossAmount;
    private double advanceDeducted;
    private double netPayable;
    private double outstandingAdvance;
    private String status;

    public Payment() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(String farmerId) {
        this.farmerId = farmerId;
    }

    public String getFarmer() {
        return farmer;
    }

    public void setFarmer(String farmer) {
        this.farmer = farmer;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public double getGrossAmount() {
        return grossAmount;
    }

    public void setGrossAmount(double grossAmount) {
        this.grossAmount = grossAmount;
    }

    public double getAdvanceDeducted() {
        return advanceDeducted;
    }

    public void setAdvanceDeducted(double advanceDeducted) {
        this.advanceDeducted = advanceDeducted;
    }

    public double getNetPayable() {
        return netPayable;
    }

    public void setNetPayable(double netPayable) {
        this.netPayable = netPayable;
    }

    public double getOutstandingAdvance() {
        return outstandingAdvance;
    }

    public void setOutstandingAdvance(double outstandingAdvance) {
        this.outstandingAdvance = outstandingAdvance;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
