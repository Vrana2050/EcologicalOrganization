package DocumentPreparationService.influx;

import com.influxdb.client.InfluxDBClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class SeederService {
    @Autowired
    private StatusRepository repository;
    private final Random random = new Random();


    public void seedStatuses(int count) {
        List<StatusLog> logs = new ArrayList<>();
        Instant now = Instant.now();

        for (int i = 0; i < count; i++) {
            Instant datum = now.minus(random.nextInt(30), ChronoUnit.DAYS)
                    .minus(random.nextInt(24), ChronoUnit.HOURS)
                    .minus(random.nextInt(60), ChronoUnit.MINUTES);

            String projekatId = "100" + (random.nextInt(3) + 1);
            String dokumentId = String.valueOf(2000 + random.nextInt(100));
            long prethodno = 1000 + random.nextInt(5);
            long novo = prethodno + 1;
            repository.save(new StatusLog(datum, dokumentId, projekatId, prethodno, novo));
        }
    }
}
