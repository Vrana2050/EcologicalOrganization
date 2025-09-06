package DocumentPreparationService.service;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Tok;
import DocumentPreparationService.model.TokStatus;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.ITokRepository;
import DocumentPreparationService.service.interfaces.IStatusService;
import DocumentPreparationService.service.interfaces.ITokService;
import DocumentPreparationService.service.interfaces.ITokStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TokService extends CrudService<Tok,Long> implements ITokService {
    @Autowired
    private IStatusService statusService;
    protected TokService(ITokRepository repository) {
        super(repository);
    }
    @Override
    @Transactional
    public Tok create(Tok newTok) {
        newTok.validate();
        for(TokStatus tokStatus : newTok.getStatusi()){
            tokStatus.setTrenutnoStanje(statusService.create(tokStatus.getTrenutnoStanje()));
        }
        for(TokStatus tokStatus : newTok.getStatusi()){
            if(tokStatus.getPrethodnoStanje() != null){
                tokStatus.setPrethodnoStanje(newTok.getStatusi().stream().filter(ts-> ts.getSledeceStanje().getNaziv().equals(tokStatus.getTrenutnoStanje().getNaziv())).findFirst().get().getTrenutnoStanje());
            }
            if(tokStatus.getSledeceStanje() != null){
                tokStatus.setSledeceStanje(newTok.getStatusi().stream().filter(ts-> ts.getTrenutnoStanje().getNaziv().equals(tokStatus.getSledeceStanje().getNaziv())).findFirst().get().getTrenutnoStanje());
            }
            if(tokStatus.getStatusNakonOdbijanja() != null){
                tokStatus.setStatusNakonOdbijanja(newTok.getStatusi().stream().filter(ts-> ts.getTrenutnoStanje().getNaziv().equals(tokStatus.getStatusNakonOdbijanja().getNaziv())).findFirst().get().getTrenutnoStanje());
            }
        }
        return  super.create(newTok);
    }
    @Override
    public Tok update(Tok newTok) {

    }
}
