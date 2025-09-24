package DocumentPreparationService.service.interfaces;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Fajl;

import java.util.Set;

public interface IFajlService extends ICrudService<Fajl,Long> {

    public Fajl uploadFajl(Long dokumentId, Long userId, Fajl newFajl);

    Set<Fajl> findAllByDokument(Long dokumentId, Long userId);

    Set<Fajl> findAllActiveByDokument(Long dokumentId, Long userId);

    Set<Fajl> findAllByDokumentForRevizija(Long dokumentId, Long userId);

    Set<Fajl> findAllFileVersions(Long aktivniFajlId, Long userId,int page, int size);
}
