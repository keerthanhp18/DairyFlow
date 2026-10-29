
package com.dairyflow.dairyflow.advance;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "advances")
public class Advance {

    @Id
    private String id;

    private String farmerId;
    private String farmer;
    private String date;
    private double amount;
    private double deductedAmount;
    private String note;

    public Advance() {
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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public double getDeductedAmount() {
    return deductedAmount;
}

public void setDeductedAmount(double deductedAmount) {
    this.deductedAmount = deductedAmount;
}

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
