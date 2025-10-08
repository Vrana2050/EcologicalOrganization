package DocumentPreparationService.influx;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StatusServiceInflux {
    @Autowired
    private StatusRepository repository;
    public List<StatusLog> getAll()
    {
        return repository.getAll();
    }
    public boolean delete(Long dokumentId,DateRangeDto dateRangeDto)
    {
        return repository.delete(dokumentId,dateRangeDto);
    }
    public StatusLog create(StatusLog statusLog)
    {
        if(repository.save(statusLog))
        {
            return statusLog;
        }
        return null;
    }
    public ReportDto getReport(String projekatId,String dokumentId,DateRangeDto dateRangeDto) {
        ReportDto reportDto = new ReportDto();
        List<StatusAvg> statuses = repository.getStatusAvgs(projekatId,dokumentId,dateRangeDto);
        StatusAvg maxStatusAvg = statuses.get(0);
        for(StatusAvg statusAvg : statuses)
        {
            if(statusAvg.getAvgTime()>maxStatusAvg.getAvgTime())
            {
                maxStatusAvg = statusAvg;
            }
        }
        MaxStatusTime statusTime = repository.getTimeSpentForStatus(maxStatusAvg.statusId,projekatId,dokumentId,dateRangeDto);
        reportDto.setStatuses(statuses);
        reportDto.maxStatusTime = statusTime;
        return reportDto;

    }
}
