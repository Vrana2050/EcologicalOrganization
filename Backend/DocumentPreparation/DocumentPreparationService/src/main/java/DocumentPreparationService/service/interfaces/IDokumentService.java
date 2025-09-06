package DocumentPreparationService.service.interfaces;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.repository.IDokumentRepository;
import org.springframework.beans.factory.annotation.Autowired;

public interface IDokumentService extends ICrudService<Dokument,Long> {

}
