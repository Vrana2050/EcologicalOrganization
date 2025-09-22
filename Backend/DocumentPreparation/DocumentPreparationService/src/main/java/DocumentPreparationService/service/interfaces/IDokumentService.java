package DocumentPreparationService.service.interfaces;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Fajl;
import DocumentPreparationService.model.Projekat;
import DocumentPreparationService.repository.IDokumentRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;
import java.util.Set;

public interface IDokumentService extends ICrudService<Dokument,Long> {
    public Dokument create(Dokument entity, Long userId);
    public Dokument update(Dokument entity,Long userId);
    public boolean delete(Long id,Long userId);
    public Dokument findById(Long id, Long userId);
    public Set<Dokument> findAll(Long userId);
    public Dokument updateStatus(Dokument newDokument,Long userId);
    public Dokument getDokumentWithFiles(Long dokumentId);
    public Dokument updateDokumentFiles(Dokument dokument, Long userId);
    Set<Fajl> getDokumentSveFajlove(Long dokumentId, Long userId);

    Set<Fajl> getDokumentAktivneFajlove(Long dokumentId, Long userId);

    Set<Dokument> findAllBoardDocumentsByProjectId(Long userId, Long projectId);

    Set<Dokument> findAllBoardDocumentsByParentDocumentId(Long userId, Long parentDocumentId);
}
