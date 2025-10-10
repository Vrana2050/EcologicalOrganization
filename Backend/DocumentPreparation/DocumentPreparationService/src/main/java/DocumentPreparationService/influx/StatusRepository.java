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

    public List<StatusAvg> getStatusAvgs(String projekatId, DateRangeDto dateRangeDto,List<Long>  finishedDokumentIds) {
        InfluxDBClient influxDBClient = inConn.buildConnection();
        List<StatusAvg> statuses= inConn.getReport(influxDBClient,projekatId,dateRangeDto,finishedDokumentIds);
        influxDBClient.close();
        return statuses;
    }

    public MaxStatusTime getTimeSpentForStatus(Long statusId, String dokumentId, DateRangeDto dateRangeDto, List<Long> finishedDokumentIds) {
        InfluxDBClient influxDBClient = inConn.buildConnection();
        MaxStatusTime maxStatus= inConn.getTimeSpentForStatus(influxDBClient,statusId,dokumentId,dateRangeDto,finishedDokumentIds);
        influxDBClient.close();
        return maxStatus;
    }

    public List<Long> getDokumentsOnProject(String projekatId) {
        InfluxDBClient influxDBClient = inConn.buildConnection();
        List<Long> dokumentIds = inConn.getDokumentsOnProject(influxDBClient,projekatId);
        influxDBClient.close();
        return dokumentIds;
    }

    public List<Long> getAllFinishedDocuments(String projekatId,List<Long> dokumentIds) {
        InfluxDBClient influxDBClient = inConn.buildConnection();
        List<Long> finishedDocumentIds = inConn.getAllFinishedDocuments(influxDBClient,projekatId,dokumentIds);
        influxDBClient.close();
        return finishedDocumentIds;
    }
}
