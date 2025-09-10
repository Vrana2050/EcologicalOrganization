package DocumentPreparationService.service.interfaces;

import DocumentPreparationService.model.DokumentRevizija;

import java.util.Set;

public interface IDokumentRevizijaService extends ICrudService<DokumentRevizija,Long>{
    Set<DokumentRevizija> create(Set<DokumentRevizija> dokumentRevizija, Long userId);

    Set<DokumentRevizija> findAllByDokument(Long dokumentId, Long userId);
    Set<DokumentRevizija> findAllByDokumentState(Long dokumentId, Long userId);
    Set<DokumentRevizija> update(Set<DokumentRevizija> dokumentRevizija, Long userId);


}
