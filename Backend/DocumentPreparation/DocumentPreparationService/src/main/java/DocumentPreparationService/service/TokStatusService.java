package DocumentPreparationService.service;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.TokStatus;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.ITokStatusRepository;
import DocumentPreparationService.service.interfaces.ITokStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class TokStatusService extends CrudService<TokStatus,Long> implements ITokStatusService {
    protected TokStatusService(ITokStatusRepository repository) {
        super(repository);
    }
}
