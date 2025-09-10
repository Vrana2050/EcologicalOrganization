package DocumentPreparationService.service;

import DocumentPreparationService.dto.TokStatusDto;
import DocumentPreparationService.exception.NotFoundException;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.TokStatus;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.ITokStatusRepository;
import DocumentPreparationService.service.interfaces.IStatusService;
import DocumentPreparationService.service.interfaces.ITokStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class TokStatusService extends CrudService<TokStatus,Long> implements ITokStatusService {
    @Autowired
    private IStatusService statusService;
    protected TokStatusService(ITokStatusRepository repository) {
        super(repository);
    }

    @Override
    public TokStatus create(TokStatus tokStatus) {
        if(tokStatus.getTrenutnoStanje().getId()!=null)
        {
            tokStatus.setTrenutnoStanje(statusService.findById(tokStatus.getTrenutnoStanje().getId()).orElseThrow(() -> new NotFoundException("Status not found")));
        }
        return super.create(tokStatus);
    }

}
