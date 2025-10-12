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


    public void seedStatuses(int brojDokumenata) {
        List<StatusLog> logs = new ArrayList<>();
        Instant now = Instant.now();
        Random random = new Random();

        String[] projectIds = {"1001", "1002", "1003"};

        List<Long> workflowStatuses = List.of(1000L, 1001L, 1002L, 1003L, 1004L, 1005L, -1L);

        for (int i = 0; i < brojDokumenata; i++) {

            String projekatId = projectIds[random.nextInt(projectIds.length)];
            String dokumentId = String.valueOf(2000 + i);

            int maxTransitions = 3 + random.nextInt(workflowStatuses.size() - 2);

            Instant vreme = now.minus(random.nextInt(30), ChronoUnit.DAYS);

            for (int s = 0; s < maxTransitions; s++) {
                String korisnikId = String.valueOf(2001 + random.nextInt(50));

                Long prethodnoStanje = workflowStatuses.get(s);
                Long novoStanje = workflowStatuses.get(s + 1);

                vreme = vreme.plus(random.nextInt(3) + 1, ChronoUnit.DAYS)
                        .plus(random.nextInt(12), ChronoUnit.HOURS);

                logs.add(new StatusLog(
                        vreme,
                        dokumentId,
                        projekatId,
                        prethodnoStanje,
                        novoStanje,
                        korisnikId
                ));

                if (novoStanje == -1L)
                    break;
            }
        }

        logs.forEach(l -> System.out.println(l));

        logs.sort(Comparator.comparing(StatusLog::getDatum));

        logs.forEach(repository::save);

        System.out.println("✅ Generated " + logs.size() );
    }

}
