package DocumentPreparationService.configuration;

import DocumentPreparationService.influx.*;
import com.influxdb.client.*;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;
import com.influxdb.exceptions.InfluxException;
import com.influxdb.query.FluxRecord;
import com.influxdb.query.FluxTable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Component
public class InfluxDBConnectionClass {

    @Value("${spring.influx.token}")
    private String token;

    @Value("${spring.influx.bucket}")
    private String bucket;

    @Value("${spring.influx.org}")
    private String org;

    @Value("${spring.influx.url}")
    private String url;

    public InfluxDBClient buildConnection() {
        setToken(token);
        setBucket(bucket);
        setOrg(org);
        setUrl(url);
        return InfluxDBClientFactory.create(getUrl(), getToken().toCharArray(), getOrg(), getBucket());
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getBucket() {
        return bucket;
    }

    public void setBucket(String bucket) {
        this.bucket = bucket;
    }

    public String getOrg() {
        return org;
    }

    public void setOrg(String org) {
        this.org = org;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public boolean save(InfluxDBClient influxDBClient, StatusLog status) {
        boolean flag = false;
        try {
            WriteApiBlocking writeApi = influxDBClient.getWriteApiBlocking();
            Point point = Point.measurement("statuses")
                    .addTag("projekatId", status.getProjekatId())
                    .addTag("dokumentId", status.getDokumentId())
                    .addTag("korisnikId", status.getKorisnikId())
                    .time(status.getDatum(), WritePrecision.MS);

            if (status.getPrethodnoStanjeId()!= null) point.addField("prethodnoStanjeId", status.getPrethodnoStanjeId());
            if (status.getNovoStanjeId() != null) point.addField("novoStanjeId", status.getNovoStanjeId());

            writeApi.writePoint(point);
            System.out.println("Sacuvao");
            flag = true;
        } catch (InfluxException e) {
            System.out.println("Exception!!" + e.getMessage());
        }
        return flag;
    }


    public List<StatusLog> findAll(InfluxDBClient influxDBClient) {
        String flux = "from(bucket:\"iis_bucket\") |> range(start:0) |> filter(fn: (r) => r[\"_measurement\"] == \"statuses\") |> sort() |> yield(name: \"sort\")";
        QueryApi queryApi = influxDBClient.getQueryApi();
        List<StatusLog> statuses = getStatuses(queryApi, flux);
        return statuses;
    }

    private List<StatusLog> getStatuses(QueryApi queryApi, String flux) {
        List<StatusLog> statuses = new ArrayList<>();
        List<FluxTable> tables = queryApi.query(flux);
        for (FluxTable fluxTable : tables) {
            List<FluxRecord> records = fluxTable.getRecords();
            for (FluxRecord fluxRecord : records) {
                StatusLog status = new StatusLog();
                status.setDatum((Instant) fluxRecord.getValueByKey("_time"));
                status.setProjekatId((String) fluxRecord.getValueByKey("projekatId"));
                status.setDokumentId((String) fluxRecord.getValueByKey("dokumentId"));
                String field = (String) fluxRecord.getValueByKey("_field");
                Object val   = fluxRecord.getValueByKey("_value");
                if ("novoStanjeId".equals(field) && val instanceof Number)status.setNovoStanjeId(((Number) val).longValue());
                if ("prethodnoStanjeId".equals(field) && val instanceof Number) status.setPrethodnoStanjeId(((Number) val).longValue());
                statuses.add(status);
            }
        }
        return statuses;
    }

    public boolean deleteRecord(InfluxDBClient influxDBClient, String dokumentId,OffsetDateTime fromDatum,OffsetDateTime toDatum) {
        boolean flag = false;
        DeleteApi deleteApi = influxDBClient.getDeleteApi();

        try {
            String predicate = "_measurement=\"statuses\" AND dokumentId = \"" +
                    dokumentId +
                    "\"";


            deleteApi.delete(fromDatum, toDatum, predicate, bucket, org);

            flag = true;
        } catch (InfluxException ie) {
            System.out.println("InfluxException: " + ie);
        }
        return flag;
    }

    public List<StatusAvg> getReport(InfluxDBClient influxDBClient, String projekatId, DateRangeDto dateRangeDto,List<Long> finishedDokumentIds) {
        String start = dateRangeDto != null && dateRangeDto.getStart() != null
                ? dateRangeDto.getStart().toInstant().toString()
                : "-30d";

        String stop = dateRangeDto != null && dateRangeDto.getEnd() != null
                ? dateRangeDto.getEnd().toInstant().toString()
                : "now()";

        // 🧱 Dinamički filter — koristi projekatId ili dokumentId ako postoji
        StringBuilder idFilter = new StringBuilder("r.projekatId == \"" + projekatId + "\"");

        if (finishedDokumentIds != null && !finishedDokumentIds.isEmpty()) {
            String docsCondition = finishedDokumentIds.stream()
                    .map(id -> "r.dokumentId == \"" + id + "\"")
                    .collect(Collectors.joining(" or "));
            idFilter.append(" and (").append(docsCondition).append(")");
        }

        // 🔹 Flux upit
        String flux = String.format("""
            from(bucket: "iis_bucket")
              |> range(start: %s, stop: %s)
              |> filter(fn: (r) => r._measurement == "statuses")
              |> filter(fn: (r) => r._field == "novoStanjeId")
              |> filter(fn: (r) => %s)
              |> filter(fn: (r) => r._value != -1)
              |> sort(columns: ["_time"])
              |> elapsed(unit: 1s)
              |> filter(fn: (r) => exists r.elapsed)
              |> group(columns: ["_value"], mode: "by")
              |> mean(column: "elapsed")
              |> rename(columns: {_value: "statusId", elapsed: "avg_duration_seconds"})
              |> yield(name: "avg_duration_per_status")
            """, start, stop, idFilter);

        // 🧩 Query execution
        QueryApi queryApi = influxDBClient.getQueryApi();
        List<FluxTable> tables = queryApi.query(flux);

        List<StatusAvg> results = new ArrayList<>();

        for (FluxTable table : tables) {
            for (FluxRecord record : table.getRecords()) {
                Long statusId = ((Long) record.getValueByKey("statusId"));
                Double avg = record.getValueByKey("avg_duration_seconds") != null
                        ? ((Number) record.getValueByKey("avg_duration_seconds")).doubleValue()
                        : null;

                results.add(new StatusAvg(statusId, avg));
            }
        }
        return results;
    }


    public MaxStatusTime getTimeSpentForStatus(InfluxDBClient influxDBClient,Long statusId, String projekatId, DateRangeDto dateRangeDto, List<Long> finishedDokumentIds) {

        // 📅 Dinamički opseg (ili poslednjih 30 dana ako nije zadat)
        String start = (dateRangeDto != null && dateRangeDto.getStart() != null)
                ? dateRangeDto.getStart().toString()
                : "-30d";
        String stop = (dateRangeDto != null && dateRangeDto.getEnd() != null)
                ? dateRangeDto.getEnd().toString()
                : "now()";

        // 🧩 Dinamički deo filtera
        StringBuilder filterBuilder = new StringBuilder(
                String.format("r.projekatId == \"%s\"", projekatId));

        // 🧩 Lista dokumenata (ako postoji)
        if (finishedDokumentIds != null && !finishedDokumentIds.isEmpty()) {
            String docConditions = finishedDokumentIds.stream()
                    .map(id -> String.format("r.dokumentId == \"%s\"", id))
                    .collect(Collectors.joining(" or "));
            filterBuilder.append(" and (").append(docConditions).append(")");
        }

        // 🧮 Flux upit
        String flux = String.format("""
    from(bucket: "iis_bucket")
      |> range(start: %s, stop: %s)
      |> filter(fn: (r) => r._measurement == "statuses")
      |> filter(fn: (r) => r._field == "novoStanjeId")
      |> filter(fn: (r) => r.projekatId == "%s")
      |> sort(columns: ["_time"])
      |> elapsed(unit: 1s)
      |> filter(fn: (r) => exists r.elapsed)
      |> filter(fn: (r) => r._value == %d and r._value != -1)
      |> group()
      |> sum(column: "elapsed")
      |> rename(columns: {elapsed: "total_duration_seconds"})
      |> yield(name: "total_duration_for_status")
    """, start, stop, projekatId, statusId);

        QueryApi queryApi = influxDBClient.getQueryApi();
        List<FluxTable> tables = queryApi.query(flux);

        if (tables.isEmpty() || tables.get(0).getRecords().isEmpty()) {
            return new MaxStatusTime(statusId, 0.0);
        }

        FluxRecord record = tables.get(0).getRecords().get(0);
        Double totalDuration = record.getValueByKey("total_duration_seconds") != null
                ? ((Number) record.getValueByKey("total_duration_seconds")).doubleValue()
                : 0.0;

        return new MaxStatusTime(statusId, totalDuration);
    }

    public List<Long> getDokumentsOnProject(InfluxDBClient influxDBClient, String projekatId) {

        String flux = String.format("""
        from(bucket: "iis_bucket")
          |> range(start: 0)
          |> filter(fn: (r) => r._measurement == "statuses")
          |> filter(fn: (r) => r.projekatId == "%s")
          |> keep(columns: ["dokumentId"])
          |> distinct(column: "dokumentId")
    """, projekatId);

        QueryApi queryApi = influxDBClient.getQueryApi();

        List<FluxTable> tables = queryApi.query(flux);

        return tables.stream()
                .flatMap(table -> table.getRecords().stream())
                .map(record -> {
                    try {
                        return Long.parseLong(record.getValueByKey("dokumentId").toString());
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<Long> getAllFinishedDocuments(InfluxDBClient influxDBClient,String projekatId, List<Long> dokumentIds) {
        if (dokumentIds == null || dokumentIds.isEmpty()) {
            return List.of();
        }

        // Formatiraj listu ID-jeva u Influx-ov format ["1","2","3"]
        String idSet = dokumentIds.stream()
                .map(Object::toString)
                .map(id -> "\"" + id + "\"")
                .collect(Collectors.joining(", "));

        String flux = String.format("""
        from(bucket: "iis_bucket")
          |> range(start: 0)
          |> filter(fn: (r) => r._measurement == "statuses")
          |> filter(fn: (r) => contains(value: r.dokumentId, set: [%s]))
          |> filter(fn: (r) => r.projekatId == "%s")
          |> filter(fn: (r) => r._field == "novoStanjeId")
          |> filter(fn: (r) => r._value == -1)
          |> keep(columns: ["dokumentId"])
          |> distinct(column: "dokumentId")
        """, idSet, projekatId);

        QueryApi queryApi = influxDBClient.getQueryApi();

        List<FluxTable> tables = queryApi.query(flux);

        return tables.stream()
                .flatMap(table -> table.getRecords().stream())
                .map(record -> {
                    try {
                        return Long.parseLong(record.getValueByKey("dokumentId").toString());
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    public UserChangesDto getNumberOfStatusChangesByUser(InfluxDBClient influxDBClient, String korisnikId, String projekatId, DateRangeDto dateRangeDto) {
        String start = (dateRangeDto != null && dateRangeDto.getStart() != null)
                ? dateRangeDto.getStart().toInstant().toString()
                : "-30d";
        String stop = (dateRangeDto != null && dateRangeDto.getEnd() != null)
                ? dateRangeDto.getEnd().toInstant().toString()
                : "now()";

        String flux = String.format("""
        from(bucket: "iis_bucket")
          |> range(start: %s, stop: %s)
          |> filter(fn: (r) => r._measurement == "statuses")
          |> filter(fn: (r) => r._field == "novoStanjeId")
          |> filter(fn: (r) => r.korisnikId == "%s")
          |> filter(fn: (r) => r.projekatId == "%s")
          |> group(columns: ["korisnikId", "projekatId", "dokumentId"])
          |> count(column: "_value")
          |> rename(columns: {_value: "num_changes"})
          |> sort(columns: ["num_changes"], desc: true)
          |> limit(n: 1)
          |> yield(name: "most_changed_document")
        """, start, stop, korisnikId, projekatId);

        QueryApi queryApi = influxDBClient.getQueryApi();
        List<FluxTable> tables = queryApi.query(flux);

        if (tables.isEmpty() || tables.get(0).getRecords().isEmpty()) {
            return new UserChangesDto(korisnikId, projekatId, 0,null);
        }

        FluxRecord record = tables.get(0).getRecords().get(0);
        String documentId = record.getValueByKey("dokumentId").toString();
        int numChanges = ((Number) record.getValueByKey("num_changes")).intValue();

        return new UserChangesDto(korisnikId, projekatId, numChanges,documentId);
    }

    public UserDocuments getAllDocumentsByUser(InfluxDBClient influxDBClient, String korisnikId, DateRangeDto dateRangeDto) {
        String start = (dateRangeDto != null && dateRangeDto.getStart() != null)
                ? dateRangeDto.getStart().toInstant().toString()
                : "-30d";
        String stop = (dateRangeDto != null && dateRangeDto.getEnd() != null)
                ? dateRangeDto.getEnd().toInstant().toString()
                : "now()";

        // 🔹 Flux upit — ograničen na jednog korisnika
        String flux = String.format("""
        from(bucket: "iis_bucket")
          |> range(start: %s, stop: %s)
          |> filter(fn: (r) => r._measurement == "statuses")
          |> filter(fn: (r) => r._field == "novoStanjeId")
          |> filter(fn: (r) => r.korisnikId == "%s")
          |> group(columns: ["korisnikId", "dokumentId"])
          |> distinct(column: "dokumentId")
          |> group(columns: ["korisnikId"])
          |> keep(columns: ["korisnikId", "dokumentId"])
          |> sort(columns: ["dokumentId"])
        """, start, stop, korisnikId);

        QueryApi queryApi = influxDBClient.getQueryApi();
        List<FluxTable> tables = queryApi.query(flux);

        List<Long> dokumenti = new ArrayList<>();

        // 📊 Parsiraj sve jedinstvene dokumentId vrednosti
        for (FluxTable table : tables) {
            for (FluxRecord record : table.getRecords()) {
                Object docIdVal = record.getValueByKey("dokumentId");
                if (docIdVal != null) {
                    try {
                        dokumenti.add(Long.parseLong(docIdVal.toString()));
                    } catch (NumberFormatException ignored) {
                    }
                }
            }
        }
        return new UserDocuments(korisnikId, dokumenti);
    }
    public UserStatusDurationDto getStatusDuration(
            InfluxDBClient influxDBClient,
            String korisnikId,
            String dokumentId,
            Long statusId,
            DateRangeDto dateRangeDto) {

        // ⏰ Vremenski opseg
        String start = (dateRangeDto != null && dateRangeDto.getStart() != null)
                ? dateRangeDto.getStart().toInstant().toString()
                : "-60d";
        String stop = (dateRangeDto != null && dateRangeDto.getEnd() != null)
                ? dateRangeDto.getEnd().toInstant().toString()
                : "now()";

        // 🔹 Flux upit
        String flux = String.format("""
        from(bucket: "iis_bucket")
          |> range(start: %s, stop: %s)
          |> filter(fn: (r) => r._measurement == "statuses")
          |> filter(fn: (r) => r._field == "novoStanjeId")
          |> filter(fn: (r) => r.korisnikId == "%s")
          |> filter(fn: (r) => r.dokumentId == "%s")
          |> filter(fn: (r) => r._value == %d)
          |> sort(columns: ["_time"])
          |> elapsed(unit: 1s)
          |> filter(fn: (r) => exists r.elapsed)
          |> group(columns: ["korisnikId", "dokumentId", "_value"])
          |> sum(column: "elapsed")
          |> map(fn: (r) => ({ 
                korisnikId: r.korisnikId,
                dokumentId: r.dokumentId,
                statusId: r._value,
                days_spent: float(v: r.elapsed) / 86400.0
              }))
          |> yield(name: "days_spent_on_doc_status")
        """, start, stop, korisnikId, dokumentId, statusId);

        // 📊 Izvrši upit
        QueryApi queryApi = influxDBClient.getQueryApi();
        List<FluxTable> tables = queryApi.query(flux);

        // 🧮 Parsiranje rezultata
        if (!tables.isEmpty() && !tables.get(0).getRecords().isEmpty()) {
            FluxRecord record = tables.get(0).getRecords().get(0);

            String korisnik = record.getValueByKey("korisnikId").toString();
            String dokument = record.getValueByKey("dokumentId").toString();
            Long status = record.getValueByKey("statusId") != null
                    ? ((Number) record.getValueByKey("statusId")).longValue()
                    : null;
            Double daysSpent = record.getValueByKey("days_spent") != null
                    ? ((Number) record.getValueByKey("days_spent")).doubleValue()
                    : 0.0;

            return new UserStatusDurationDto(korisnik, dokument, status, daysSpent);
        }

        return new UserStatusDurationDto(korisnikId, dokumentId, statusId, 0.0);
    }

}