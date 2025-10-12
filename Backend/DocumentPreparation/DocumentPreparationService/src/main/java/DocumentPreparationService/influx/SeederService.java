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

        // više projekata
        String[] projectIds = {"1001", "1002", "1003"};

        // definisan workflow (od početka do kraja)
        List<Long> workflowStatuses = List.of(1000L, 1001L, 1002L, 1003L, 1004L, 1005L, -1L);

        for (int i = 0; i < brojDokumenata; i++) {

            // svaki dokument pripada tačno jednom projektu
            String projekatId = projectIds[random.nextInt(projectIds.length)];
            String dokumentId = String.valueOf(2000 + i);

            // koliko će koraka preći (uvek barem 3 statusa)
            int maxTransitions = 3 + random.nextInt(workflowStatuses.size() - 2);

            // početak workflowa
            Instant vreme = now.minus(random.nextInt(30), ChronoUnit.DAYS);

            for (int s = 0; s < maxTransitions; s++) {
                String korisnikId = String.valueOf(2001 + random.nextInt(50));

                Long prethodnoStanje = workflowStatuses.get(s);
                Long novoStanje = workflowStatuses.get(s + 1);

                // povećaj vreme za 1–3 dana
                vreme = vreme.plus(random.nextInt(3) + 1, ChronoUnit.DAYS)
                        .plus(random.nextInt(12), ChronoUnit.HOURS);

                // dodaj log
                logs.add(new StatusLog(
                        vreme,
                        dokumentId,
                        projekatId,
                        prethodnoStanje,
                        novoStanje,
                        korisnikId
                ));

                // ako smo došli do završnog statusa (-1), prekini
                if (novoStanje == -1L)
                    break;
            }
        }

        // ovde pozoveš servis za upis u Influx ili repozitorijum
        logs.forEach(l -> System.out.println(l));

    // opcionalno sortiraj po datumu radi realističnijeg izgleda
        logs.sort(Comparator.comparing(StatusLog::getDatum));

        logs.forEach(repository::save);

        System.out.println("✅ Generated " + logs.size() );
    }

}
