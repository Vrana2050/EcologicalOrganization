package DocumentPreparationService.service;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Status;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IStatusRepository;
import DocumentPreparationService.service.interfaces.IStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class StatusService extends CrudService<Status,Long> implements IStatusService {
    protected StatusService(IStatusRepository repository) {
        super(repository);
    }
    @Override
    public Status create(Status entity) {
        entity.validate();
        return super.create(entity);
    }
}
