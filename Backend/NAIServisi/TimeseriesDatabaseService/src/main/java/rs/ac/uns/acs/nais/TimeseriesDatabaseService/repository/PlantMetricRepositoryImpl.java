package rs.ac.uns.acs.nais.TimeseriesDatabaseService.repository;

import com.influxdb.client.*;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;
import com.influxdb.exceptions.InfluxException;
import com.influxdb.query.FluxRecord;
import com.influxdb.query.FluxTable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import rs.ac.uns.acs.nais.TimeseriesDatabaseService.configuration.InfluxDBConnectionClass;
import rs.ac.uns.acs.nais.TimeseriesDatabaseService.model.PlantMetric;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Repository
public class PlantMetricRepositoryImpl implements PlantMetricRepository {

    private final InfluxDBConnectionClass influxConn;

    @Value("${spring.influx.bucket}") private String bucket;
    @Value("${spring.influx.org}")    private String org;

    public PlantMetricRepositoryImpl(InfluxDBConnectionClass influxConn) {
        this.influxConn = influxConn;
    }



    @Override
    public boolean saveMeasurement(PlantMetric metric) {
        InfluxDBClient client = influxConn.buildConnection();
        try {
            WriteApiBlocking writeApi = client.getWriteApiBlocking();
            if (metric.getCreated() == null) {
                metric.setCreated(Instant.now());
            }
            writeApi.writeMeasurement(WritePrecision.MS, metric);
            return true;
        } catch (InfluxException e) {
            System.out.println("Influx saveMeasurement error: " + e.getMessage());
            return false;
        } finally {
            client.close();
        }
    }

    @Override
    public boolean savePoint(PlantMetric m) {
        InfluxDBClient client = influxConn.buildConnection();
        try {
            WriteApiBlocking w = client.getWriteApiBlocking();
            Instant t = (m.getCreated() != null) ? m.getCreated() : Instant.now();

            Point p = Point.measurement("plant_metrics")
                    .addTag("plant_id", Objects.toString(m.getPlant_id(), "PL-001"))
                    .addTag("room",     Objects.toString(m.getRoom(), "LivingRoom"))
                    .time(t, WritePrecision.MS);

            if (m.getSoil_moisture_pct() != null) p.addField("soil_moisture_pct", m.getSoil_moisture_pct());
            if (m.getTemp_c()            != null) p.addField("temp_c",            m.getTemp_c());
            if (m.getLight_lux()         != null) p.addField("light_lux",         m.getLight_lux());
            if (m.getWatering_ml()       != null) p.addField("watering_ml",       m.getWatering_ml());

            w.writePoint(p);
            return true;
        } catch (InfluxException e) {
            System.out.println("Influx savePoint error: " + e.getMessage());
            return false;
        } finally {
            client.close();
        }
    }



    @Override
    public List<PlantMetric> findAll() {
        String flux = String.format(
                "from(bucket: \"%s\") |> range(start: 0) |> filter(fn: (r) => r._measurement == \"plant_metrics\") |> sort()",
                bucket
        );
        return queryToPlantMetrics(flux);
    }

    @Override
    public List<PlantMetric> findByPlant(String plantId) {
        String flux = String.format(
                "from(bucket: \"%s\") |> range(start: 0) |> filter(fn: (r) => r._measurement == \"plant_metrics\" and r.plant_id == \"%s\") |> sort()",
                bucket, plantId
        );
        return queryToPlantMetrics(flux);
    }

    @Override
    public List<PlantMetric> findByRoom(String room) {
        String flux = String.format(
                "from(bucket: \"%s\") |> range(start: 0) |> filter(fn: (r) => r._measurement == \"plant_metrics\" and r.room == \"%s\") |> sort()",
                bucket, room
        );
        return queryToPlantMetrics(flux);
    }

    private List<PlantMetric> queryToPlantMetrics(String flux) {
        InfluxDBClient client = influxConn.buildConnection();
        try {
            QueryApi queryApi = client.getQueryApi();
            List<PlantMetric> out = new ArrayList<>();
            List<FluxTable> tables = queryApi.query(flux);

            for (FluxTable table : tables) {
                for (FluxRecord r : table.getRecords()) {
                    PlantMetric m = new PlantMetric();
                    m.setPlant_id((String) r.getValueByKey("plant_id"));
                    m.setRoom((String) r.getValueByKey("room"));
                    m.setCreated((Instant) r.getValueByKey("_time"));

                    String field = (String) r.getValueByKey("_field");
                    Object val   = r.getValueByKey("_value");

                    if ("soil_moisture_pct".equals(field) && val instanceof Number) m.setSoil_moisture_pct(((Number) val).doubleValue());
                    if ("temp_c".equals(field)            && val instanceof Number) m.setTemp_c(((Number) val).doubleValue());
                    if ("light_lux".equals(field)         && val instanceof Number) m.setLight_lux(((Number) val).doubleValue());
                    if ("watering_ml".equals(field)       && val instanceof Number) m.setWatering_ml(((Number) val).doubleValue());

                    out.add(m);
                }
            }
            return out;
        } finally {
            client.close();
        }
    }



    @Override
    public boolean deleteByRoom(String room, int hoursBack) {
        InfluxDBClient client = influxConn.buildConnection();
        try {
            DeleteApi deleteApi = client.getDeleteApi();
            OffsetDateTime stop  = OffsetDateTime.now();
            OffsetDateTime start = stop.minusHours(hoursBack);
            String predicate = "_measurement=\"plant_metrics\" AND room=\"" + room + "\"";
            deleteApi.delete(start, stop, predicate, bucket, org);
            return true;
        } catch (InfluxException e) {
            System.out.println("Influx delete error: " + e.getMessage());
            return false;
        } finally {
            client.close();
        }
    }



    @Override
    public int seed(int count) {
        // Upis u intervalu: [now - 30d, now]
        final int daysBack = 30;

        InfluxDBClient client = influxConn.buildConnection();
        try {
            WriteApiBlocking w = client.getWriteApiBlocking();
            java.util.Random rnd = new java.util.Random();
            java.util.List<Point> batch = new java.util.ArrayList<>(Math.min(count, 1000));
            int written = 0;

            String[] plants = {"PL-001","PL-002","PL-003","PL-004"};
            String[] rooms  = {"LivingRoom","Kitchen","Bedroom"};

            java.time.Instant end   = java.time.Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MINUTES);
            java.time.Instant start = end.minus(daysBack, java.time.temporal.ChronoUnit.DAYS);
            long spanMs = java.time.Duration.between(start, end).toMillis();

            for (int i = 0; i < count; i++) {
                // nasumičan timestamp u [start, end)
                long offset = (spanMs <= 0) ? 0 : (Math.abs(rnd.nextLong()) % spanMs);
                java.time.Instant t = start.plusMillis(offset);

                String plant = plants[rnd.nextInt(plants.length)];
                String room  = rooms[rnd.nextInt(rooms.length)];

                double soil = clamp(40 + rnd.nextGaussian() * 15, 5, 90);
                double temp = 20 + rnd.nextGaussian() * 3;
                double lux  = Math.max(0, 300 + rnd.nextGaussian() * 200);
                double water = (rnd.nextInt(600) == 0) ? (200 + rnd.nextInt(200)) : 0;

                Point p = Point.measurement("plant_metrics")
                        .addTag("plant_id", plant)
                        .addTag("room", room)
                        .time(t, WritePrecision.MS)
                        .addField("soil_moisture_pct", soil)
                        .addField("temp_c", temp)
                        .addField("light_lux", lux)
                        .addField("watering_ml", water);

                batch.add(p);
                if (batch.size() == 1000) {
                    w.writePoints(batch);
                    batch.clear();
                }
                written++;
            }

            if (!batch.isEmpty()) {
                w.writePoints(batch);
            }
            return written;

        } catch (InfluxException e) {
            System.out.println("Influx seed error: " + e.getMessage());
            return 0;
        } finally {
            client.close();
        }
    }



    private static double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }






    @Override
    public List<Map<String, Object>> dailyAvgTempMoistureByRoom(int days) {
        String flux = String.format("""
        t = from(bucket: "%2$s")
          |> range(start: -%1$dd)
          |> filter(fn: (r) => r._measurement == "plant_metrics" and r._field == "temp_c")
          |> group(columns: ["room"])
          |> mean()
          |> rename(columns: {_value: "temp_c"})
          |> keep(columns: ["room","temp_c"])


        m = from(bucket: "%2$s")
          |> range(start: -%1$dd)
          |> filter(fn: (r) => r._measurement == "plant_metrics" and r._field == "soil_moisture_pct")
          |> group(columns: ["room"])
          |> mean()
          |> rename(columns: {_value: "soil_moisture_pct"})
          |> keep(columns: ["room","soil_moisture_pct"])

        join(tables: {t: t, m: m}, on: ["room"])
          |> sort(columns: ["room"])
        """, days, bucket);

        return queryToMaps(flux);
    }


    @Override
    public List<Map<String, Object>> wateringFrequencyByPlant(int days) {
        String flux = String.format("""
        from(bucket: "%s")
          |> range(start: -%dd)
          |> filter(fn:(r)=> r._measurement=="plant_metrics" and r._field=="watering_ml")
          |> aggregateWindow(every: 1d, fn: sum, createEmpty: false)
          |> filter(fn:(r)=> r._value > 0.0)
          |> group(columns: ["plant_id"])
          |> count(column: "_value")
          |> rename(columns: {_value: "watering_days"})
          |> sort(columns: ["watering_days"], desc: true)
        """, bucket, days);

        return queryToMaps(flux);
    }


    @Override
    public List<Map<String, Object>> driestPlantPerRoom(int hours) {
        String flux = String.format("""
        from(bucket: "%s")
          |> range(start: -%dh)
          |> filter(fn:(r)=> r._measurement=="plant_metrics" and r._field=="soil_moisture_pct")
          |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
          |> group(columns: ["plant_id", "room"])
          |> mean()
          |> rename(columns: {_value: "avg_moisture"})
          |> group(columns: ["room"])
          |> sort(columns: ["avg_moisture"], desc: false)
          |> limit(n: 1)
          |> keep(columns: ["room","plant_id","avg_moisture"])
        """, bucket, hours);

        return queryToMaps(flux);
    }



    private List<Map<String,Object>> queryToMaps(String flux) {
        InfluxDBClient client = influxConn.buildConnection();
        try {
            QueryApi queryApi = client.getQueryApi();
            List<Map<String,Object>> out = new ArrayList<>();
            List<FluxTable> tables = queryApi.query(flux);
            for (FluxTable t : tables) {
                for (FluxRecord r : t.getRecords()) {
                    Map<String,Object> m = new LinkedHashMap<>();
                    r.getValues().forEach(m::put);
                    out.add(m);
                }
            }
            return out;
        } finally {
            client.close();
        }
    }
}
