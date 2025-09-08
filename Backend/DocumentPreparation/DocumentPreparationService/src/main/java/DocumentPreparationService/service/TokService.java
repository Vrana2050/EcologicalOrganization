package DocumentPreparationService.service;

import DocumentPreparationService.exception.ForbiddenException;
import DocumentPreparationService.exception.InvalidRequestDataException;
import DocumentPreparationService.exception.NotFoundException;
import DocumentPreparationService.model.*;
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

import java.util.*;

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
        for(TokStatus tokStatus : newTok.getStatusi())
        {
            if(tokStatus.getTrenutnoStanje().getId()!=null)
            {
                Status status = statusService.findById(tokStatus.getTrenutnoStanje().getId()).orElseThrow(() -> new NotFoundException("Status not found"));
                tokStatus.setTrenutnoStanje(status);
            }
            else
            {
                tokStatus.setTrenutnoStanje(statusService.create(tokStatus.getTrenutnoStanje()));
            }
        }
        newTok.validate();
        return  super.create(newTok);
    }
    @Override
    public Tok update(Tok newTok) {
        try {
            Tok oldTok = tokRepository.findById(newTok.getId()).orElseThrow(() -> new NotFoundException("Tok not found"));
            for(TokStatus tokStatus : newTok.getStatusi())
            {
                if(tokStatus.getTrenutnoStanje().getId()!=null)
                {
                    Status status = statusService.findById(tokStatus.getTrenutnoStanje().getId()).orElseThrow(() -> new NotFoundException("Status not found"));
                    tokStatus.setTrenutnoStanje(status);
                }
                else
                {
                    tokStatus.setTrenutnoStanje(statusService.create(tokStatus.getTrenutnoStanje()));
                }
            }
            oldTok.update(newTok);

            return super.update(oldTok);

        } catch (DataIntegrityViolationException e) {
            throw new InvalidRequestDataException("Invalid request");
        }
    }

    @Override
    public TokStatus getFirstStatus(Tok tok) {
        Set<Long> nextStatusIds = new HashSet<>();
        for (TokStatus ts : tok.getStatusi()) {
            if (ts.getSledeceStanje() != null) {
                nextStatusIds.add(ts.getSledeceStanje().getId());
            }
        }
        for (TokStatus ts : tok.getStatusi()) {
            if (!nextStatusIds.contains(ts.getId())) {
                return ts;
            }
        }
        return null;
    }
}
