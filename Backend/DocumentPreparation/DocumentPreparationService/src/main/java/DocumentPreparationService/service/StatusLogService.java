package DocumentPreparationService.service;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.StatusLog;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IStatusLogRepository;
import DocumentPreparationService.service.interfaces.IStatusLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class StatusLogService extends CrudService<StatusLog,Long> implements IStatusLogService {
    protected StatusLogService(IStatusLogRepository repository) {
        super(repository);
    }
}
