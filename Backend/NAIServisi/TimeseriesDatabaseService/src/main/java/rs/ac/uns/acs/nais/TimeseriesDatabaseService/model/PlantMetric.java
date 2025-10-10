package rs.ac.uns.acs.nais.TimeseriesDatabaseService.model;

import com.influxdb.annotations.Column;
import com.influxdb.annotations.Measurement;

import java.time.Instant;

@Measurement(name = "plant_metrics")
public class PlantMetric {

    @Column(tag = true)
    private String plant_id;

    @Column(tag = true)
    private String room;

    @Column
    private Double soil_moisture_pct;

    @Column
    private Double temp_c;

    @Column
    private Double light_lux;

    @Column
    private Double watering_ml;

    @Column(timestamp = true)
    private Instant created;

    public String getPlant_id() { return plant_id; }
    public void setPlant_id(String plant_id) { this.plant_id = plant_id; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public Double getSoil_moisture_pct() { return soil_moisture_pct; }
    public void setSoil_moisture_pct(Double soil_moisture_pct) { this.soil_moisture_pct = soil_moisture_pct; }

    public Double getTemp_c() { return temp_c; }
    public void setTemp_c(Double temp_c) { this.temp_c = temp_c; }

    public Double getLight_lux() { return light_lux; }
    public void setLight_lux(Double light_lux) { this.light_lux = light_lux; }

    public Double getWatering_ml() { return watering_ml; }
    public void setWatering_ml(Double watering_ml) { this.watering_ml = watering_ml; }

    public Instant getCreated() { return created; }
    public void setCreated(Instant created) { this.created = created; }
}
