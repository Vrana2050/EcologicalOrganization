package rs.ac.uns.acs.nais.TimeseriesDatabaseService.service;

import org.springframework.stereotype.Service;
import rs.ac.uns.acs.nais.TimeseriesDatabaseService.model.PlantMetric;
import rs.ac.uns.acs.nais.TimeseriesDatabaseService.repository.PlantMetricRepository;

import java.util.List;
import java.util.Map;

@Service
public class PlantMetricService {

    private final PlantMetricRepository repo;

    public PlantMetricService(PlantMetricRepository repo) {
        this.repo = repo;
    }

    /* ============== CREATE ============== */
    public boolean saveMeasurement(PlantMetric metric) { return repo.saveMeasurement(metric); }
    public boolean savePoint(PlantMetric metric)       { return repo.savePoint(metric); }

    /* ================ READ ============== */
    public List<PlantMetric> findAll()                { return repo.findAll(); }
    public List<PlantMetric> findByPlant(String id)   { return repo.findByPlant(id); }
    public List<PlantMetric> findByRoom(String room)  { return repo.findByRoom(room); }

    /* ============== DELETE ============== */
    public boolean deleteByRoom(String room, int hoursBack) { return repo.deleteByRoom(room, hoursBack); }

    /* ================ SEED ============== */
    public int seed(int count) { return repo.seed(count); }

    /* ============= ANALYTICS ============ */
    public List<Map<String,Object>> dailyAvgTempMoistureByRoom(int days) {
        return repo.dailyAvgTempMoistureByRoom(days);
    }
    public List<Map<String,Object>> wateringFrequencyByPlant( int days) {
        return repo.wateringFrequencyByPlant( days);
    }
    public List<Map<String,Object>> driestPlantPerRoom(int hours) {
        return repo.driestPlantPerRoom(hours);
    }
}
