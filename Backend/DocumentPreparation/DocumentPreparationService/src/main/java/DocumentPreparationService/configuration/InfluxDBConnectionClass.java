package DocumentPreparationService.configuration;

import DocumentPreparationService.influx.StatusLog;
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
            status.setDatum(Instant.now());
            Point point = Point.measurement("statuses")
                    .addTag("projekatId", status.getProjekatId())
                    .addTag("dokumentId", status.getDokumentId())
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

    /*public List<StatusLog> findAllByCustomerId(InfluxDBClient influxDBClient, String customerId) {
        String fluxForCustomer = "from(bucket:\"nais_bucket\") |> range(start:0) |> filter(fn: (r) => r[\"_measurement\"] == \"purchases\" and r[\"customer_id\"] == \"%s\") |> sort() |> yield(name: \"sort\")";
        String queryForCustomer = String.format(fluxForCustomer, customerId);
        QueryApi queryApi = influxDBClient.getQueryApi();
        List<Purchase> purchases = getPurchases(queryApi, queryForCustomer);
        return purchases;
    }*/

    /*public List<Purchase> findAllByProductId(InfluxDBClient influxDBClient, String productId) {
        String fluxForProduct = "from(bucket:\"nais_bucket\") |> range(start:0) |> filter(fn: (r) => r[\"_measurement\"] == \"purchases\" and r[\"product_id\"] == \"%s\") |> sort() |> yield(name: \"sort\")";
        String queryForProduct = String.format(fluxForProduct, productId);
        QueryApi queryApi = influxDBClient.getQueryApi();
        List<Purchase> purchases = getPurchases(queryApi, queryForProduct);
        return purchases;
    }*/


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
}