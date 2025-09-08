package DocumentPreparationService.service.interfaces;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Projekat;
import DocumentPreparationService.model.Tok;
import DocumentPreparationService.model.TokStatus;

import java.util.Optional;
import java.util.Set;

public interface ITokService extends ICrudService<Tok,Long>{
    TokStatus getFirstStatus(Tok tok);
}
