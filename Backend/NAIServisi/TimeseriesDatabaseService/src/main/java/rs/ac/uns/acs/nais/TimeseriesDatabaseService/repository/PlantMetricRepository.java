// src/main/java/rs/ac/uns/acs/nais/TimeseriesDatabaseService/repository/PlantMetricRepository.java
package rs.ac.uns.acs.nais.TimeseriesDatabaseService.repository;

import rs.ac.uns.acs.nais.TimeseriesDatabaseService.model.PlantMetric;

import java.util.List;
import java.util.Map;

public interface PlantMetricRepository {

    boolean saveMeasurement(PlantMetric metric);  // POJO (@Measurement/@Column)
    boolean savePoint(PlantMetric metric);        // ručno kroz Point

    List<PlantMetric> findAll();
    List<PlantMetric> findByPlant(String plantId);
    List<PlantMetric> findByRoom(String room);


    boolean deleteByRoom(String room, int hoursBack);

    // SEED (≥2000 slogova)
    int seed(int count);

    // ANALYTICS (3 složena upita)
    List<Map<String,Object>> dailyAvgTempMoistureByRoom(int days);
    List<Map<String,Object>> wateringFrequencyByPlant(int days);
    List<Map<String,Object>> driestPlantPerRoom(int hours);
}
