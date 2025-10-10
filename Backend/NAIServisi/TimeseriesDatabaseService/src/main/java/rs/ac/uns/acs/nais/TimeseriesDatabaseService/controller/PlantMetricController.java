package rs.ac.uns.acs.nais.TimeseriesDatabaseService.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rs.ac.uns.acs.nais.TimeseriesDatabaseService.model.PlantMetric;
import rs.ac.uns.acs.nais.TimeseriesDatabaseService.service.PlantMetricService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/plants.json")
public class PlantMetricController {

    private final PlantMetricService svc;

    public PlantMetricController(PlantMetricService svc) {
        this.svc = svc;
    }

    @PostMapping("/write")
    public ResponseEntity<Boolean> writeMeasurement(@RequestBody PlantMetric body) {
        return ResponseEntity.ok(svc.saveMeasurement(body));
    }

    @PostMapping("/write-point")
    public ResponseEntity<Boolean> writePoint(@RequestBody PlantMetric body) {
        return ResponseEntity.ok(svc.savePoint(body));
    }



    @GetMapping("/all")
    public ResponseEntity<List<PlantMetric>> findAll() {
        return ResponseEntity.ok(svc.findAll());
    }

    @GetMapping("/by-plant")
    public ResponseEntity<List<PlantMetric>> byPlant(@RequestParam String plantId) {
        return ResponseEntity.ok(svc.findByPlant(plantId));
    }

    @GetMapping("/by-room")
    public ResponseEntity<List<PlantMetric>> byRoom(@RequestParam String room) {
        return ResponseEntity.ok(svc.findByRoom(room));
    }


    @DeleteMapping("/delete-by-room")
    public ResponseEntity<Boolean> deleteByRoom(
            @RequestParam String room,
            @RequestParam(defaultValue = "168") int hoursBack
    ) {
        return ResponseEntity.ok(svc.deleteByRoom(room, hoursBack));
    }



    @PostMapping("/seed")
    public ResponseEntity<Integer> seed(@RequestParam(defaultValue = "2200") int count) {
        return ResponseEntity.ok(svc.seed(count));
    }




    @GetMapping("/analytics/daily-temp-moisture")
    public ResponseEntity<List<Map<String,Object>>> dailyAvgTempMoisture(
            @RequestParam(defaultValue = "1") int days
    ) {
        return ResponseEntity.ok(svc.dailyAvgTempMoistureByRoom(days));
    }

    @GetMapping("/analytics/watering-frequency")
    public ResponseEntity<List<Map<String,Object>>> topWatering(
            @RequestParam(defaultValue = "30") int days
    ) {
        return ResponseEntity.ok(svc.wateringFrequencyByPlant(days));
    }


    @GetMapping("/analytics/driest-plant")
    public ResponseEntity<List<Map<String,Object>>> drynessRisk(
            @RequestParam(defaultValue = "48") int hours
    ) {
        return ResponseEntity.ok(svc.driestPlantPerRoom(hours));
    }
}
