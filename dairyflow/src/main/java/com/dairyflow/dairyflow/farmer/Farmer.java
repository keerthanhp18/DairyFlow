
package com.dairyflow.dairyflow.farmer;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "farmers")
public class Farmer {

    @Id
    private String id;

    private String name;
    private String village;
    private String phone;

    public Farmer() {
    }

    public Farmer(String name, String village, String phone) {
        this.name = name;
        this.village = village;
        this.phone = phone;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
