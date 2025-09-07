package DocumentPreparationService.service;

import DocumentPreparationService.exception.ForbiddenException;
import DocumentPreparationService.exception.InvalidRequestDataException;
import DocumentPreparationService.exception.NotFoundException;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Projekat;
import DocumentPreparationService.model.Tok;
import DocumentPreparationService.model.TokStatus;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.ITokRepository;
import DocumentPreparationService.service.interfaces.IStatusService;
import DocumentPreparationService.service.interfaces.ITokService;
import DocumentPreparationService.service.interfaces.ITokStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Service
public class TokService extends CrudService<Tok,Long> implements ITokService {
    @Autowired
    private IStatusService statusService;
    @Autowired
    private ITokRepository tokRepository;
    protected TokService(ITokRepository repository) {
        super(repository);
    }
    @Override
    @Transactional
    public Tok create(Tok newTok) {
        newTok.validate();
        return  super.create(newTok);
    }
    @Override
    public Tok update(Tok newTok) {
        try {
            Tok oldTok = tokRepository.findById(newTok.getId()).orElseThrow(() -> new NotFoundException("Project not found"));

            oldTok.update(newTok);

            return super.update(oldTok);

        } catch (DataIntegrityViolationException e) {
            throw new InvalidRequestDataException("Invalid request");
        }
    }
}
