package DocumentPreparationService.influx;

import com.influxdb.client.InfluxDBClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
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
        Random random = new Random();

        // simulacija više projekata
        String[] projectIds = {"1001", "1002", "1003"};

        // definisani statusi u workflowu (npr. 1000–1005)
        List<Long> possibleStatuses = List.of(1000L, 1001L, 1002L, 1003L, 1004L, 1005L);

        for (int i = 0; i < 1000; i++) {
            String projekatId = projectIds[random.nextInt(projectIds.length)];
            String dokumentId = String.valueOf(2000 + random.nextInt(100));

            // broj promena statusa za ovaj dokument
            int transitions = 1 + random.nextInt(6); // 2–7 promena
            long currentStatus = possibleStatuses.get(random.nextInt(possibleStatuses.size()));

            for (int t = 0; t < transitions; t++) {
                // vreme unazad po slučajnom intervalu
                Instant datum = now
                        .minus(random.nextInt(30), ChronoUnit.DAYS)
                        .minus(random.nextInt(24), ChronoUnit.HOURS)
                        .minus(random.nextInt(60), ChronoUnit.MINUTES);

                long prethodnoStanje = currentStatus;

                // ponekad ide napred, ponekad nazad
                int nextIndex = Math.min(possibleStatuses.indexOf(prethodnoStanje) + 1, possibleStatuses.size() - 1);
                currentStatus = possibleStatuses.get(nextIndex);

                // mali broj dokumenata stigne u finalno stanje
                Double r = random.nextDouble(10);
                if (r < 1) {
                    System.out.println("-1");
                    logs.add(new StatusLog(datum, dokumentId, projekatId, prethodnoStanje, -1L));
                    break; // prestani da praviš dalje logove za ovaj dokument
                } else {
                    logs.add(new StatusLog(datum, dokumentId, projekatId, prethodnoStanje, currentStatus));
                }
            }
        }

        // opcionalno sortiraj po datumu radi realističnijeg izgleda
        logs.sort(Comparator.comparing(StatusLog::getDatum));

        logs.forEach(repository::save);

        System.out.println("✅ Generated " + logs.size() + " status logs for " +
                count + " random document transitions.");
    }

}
