package DocumentPreparationService.influx;

import DocumentPreparationService.configuration.InfluxDBConnectionClass;
import com.influxdb.client.InfluxDBClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class StatusRepository {
    @Autowired
    private final InfluxDBConnectionClass inConn;

    public StatusRepository(InfluxDBConnectionClass influxDBConnectionClass) {
        this.inConn = influxDBConnectionClass;
    }

    public boolean save(StatusLog statusLog) {

        InfluxDBClient influxDBClient = inConn.buildConnection();
        boolean isSuccess = inConn.save(influxDBClient, statusLog);
        influxDBClient.close();
        return isSuccess;
    }


    public List<StatusLog> getAll() {
        InfluxDBClient influxDBClient = inConn.buildConnection();
        List<StatusLog> purchases= inConn.findAll(influxDBClient);
        influxDBClient.close();
        return purchases;
    }
    public Boolean delete(Long dokumentId,DateRangeDto dateRangeDto) {
        InfluxDBClient influxDBClient = inConn.buildConnection();
        boolean isSuccess = inConn.deleteRecord(influxDBClient,dokumentId.toString(),dateRangeDto.start,dateRangeDto.end);
        influxDBClient.close();
        return isSuccess;
    }
}
