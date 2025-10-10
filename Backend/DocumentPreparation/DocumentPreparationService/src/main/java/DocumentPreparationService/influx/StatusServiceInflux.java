package DocumentPreparationService.influx;

import DocumentPreparationService.dto.StatusCreateLogDto;
import DocumentPreparationService.dto.StatusLogDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatusServiceInflux {
    @Autowired
    private StatusRepository repository;
    @Autowired
    private final ApplicationEventPublisher eventPublisher;


    @EventListener
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleDocumentStatusUpdated(StatusCreateLogDto statusLog) {
        try {
            StatusLog log = new StatusLog();
            log.setPrethodnoStanjeId(statusLog.getPrethodnoStanjeId());
            log.setNovoStanjeId(statusLog.getNovoStanjeId());
            log.setDatum(statusLog.getDatum());
            log.setProjekatId(statusLog.getProjekatId());
            log.setDokumentId(statusLog.getDokumentId());
            //throw new Exception();
            repository.save(log);
        } catch (Exception ex) {
            eventPublisher.publishEvent(new StatusLogDto(statusLog.datum,statusLog.dokumentId,statusLog.projekatId,statusLog.prethodnoStanjeId,statusLog.novoStanjeId));
        }
    }
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
    public ReportDto getReport(String projekatId,DateRangeDto dateRangeDto) {

        List<Long> dokumentIds =  repository.getDokumentsOnProject(projekatId);
        System.out.println("dokumentIds = " + dokumentIds);
        List<Long> finishedDokumentIds = repository.getAllFinishedDocuments(projekatId,dokumentIds);
        System.out.println("finishedDokumentIds = " + finishedDokumentIds);
            ReportDto reportDto = new ReportDto();
            List<StatusAvg> statuses = repository.getStatusAvgs(projekatId,dateRangeDto,finishedDokumentIds);
            StatusAvg maxStatusAvg = statuses.get(0);
            for(StatusAvg statusAvg : statuses)
            {
                if(statusAvg.getAvgTime()>maxStatusAvg.getAvgTime())
                {
                    maxStatusAvg = statusAvg;
                }
            }
            System.out.println(maxStatusAvg.statusId);
            MaxStatusTime statusTime = repository.getTimeSpentForStatus(maxStatusAvg.statusId,projekatId,dateRangeDto,finishedDokumentIds);

            reportDto.setStatuses(statuses);
            reportDto.maxStatusTime = statusTime;
            reportDto.setEntityId(Long.parseLong(projekatId));
        return reportDto;

    }
}
