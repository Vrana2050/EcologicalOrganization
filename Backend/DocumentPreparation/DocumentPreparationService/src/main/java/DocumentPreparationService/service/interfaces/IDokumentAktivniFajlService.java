package DocumentPreparationService.service.interfaces;

import DocumentPreparationService.model.DokumentAktivniFajl;
import DocumentPreparationService.model.DokumentRevizija;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public interface IDokumentAktivniFajlService extends ICrudService<DokumentAktivniFajl,Long>{
    Set<DokumentAktivniFajl> findByDokumentIdWithFajl(Long dokumentId);

    DokumentAktivniFajl findByDokumentAndFajl(Long dokumentId, Long fajlId);
}
