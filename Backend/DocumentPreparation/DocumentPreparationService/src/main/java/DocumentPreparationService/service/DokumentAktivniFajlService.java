package DocumentPreparationService.service;

import DocumentPreparationService.dto.DokumentAktivniFajlDto;
import DocumentPreparationService.model.DokumentAktivniFajl;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IDokumentAktivniFajlRepository;
import DocumentPreparationService.repository.IDokumentRepository;
import DocumentPreparationService.service.interfaces.IDokumentAktivniFajlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;
@Service
public class DokumentAktivniFajlService extends CrudService<DokumentAktivniFajl,Long> implements IDokumentAktivniFajlService {
    @Autowired
    private IDokumentAktivniFajlRepository repository;
    protected DokumentAktivniFajlService(IDokumentAktivniFajlRepository repository) {
        super(repository);
    }

    @Override
    public Set<DokumentAktivniFajl> findByDokumentIdWithFajl(Long dokumentId) {
        return repository.findByDokumentIdWithFajl(dokumentId);
    }

    @Override
    public DokumentAktivniFajl findByDokumentAndFajl(Long dokumentId, Long fajlId) {
        return repository.findByDokument_IdAndFajl_Id(dokumentId,fajlId);
    }
}
