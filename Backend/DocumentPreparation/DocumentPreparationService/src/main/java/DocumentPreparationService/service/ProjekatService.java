package DocumentPreparationService.service;

import DocumentPreparationService.exception.*;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.Projekat;
import DocumentPreparationService.model.Tok;
import DocumentPreparationService.model.enumeration.ProjekatStatus;
import DocumentPreparationService.model.enumeration.Uloga;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IProjekatRepository;
import DocumentPreparationService.service.interfaces.IProjekatService;
import jakarta.transaction.Transactional;
import org.apache.http.protocol.ResponseServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;

@Service
public class ProjekatService extends CrudService<Projekat,Long> implements IProjekatService {

    @Autowired
    private TokService tokService;
    @Autowired
    private IProjekatRepository iProjekatRepository;
    @Autowired
    private KorisnikProjekatService korisnikProjekatService;

    protected ProjekatService(IProjekatRepository repository) {
        super(repository);
    }
    @Transactional(value =  Transactional.TxType.REQUIRED)
    @Override
    public Projekat create(Projekat projekat) {
        try {
            projekat.setProcenatZavrsenosti((float) 0);
            projekat.setDatumKreiranja(LocalDate.now());
            projekat.setStatus(ProjekatStatus.u_toku);
            projekat.validate();
            if(!tokService.findById(projekat.getTokProjekta().getId()).isPresent()){
                throw new NotFoundException("Workflow not found");
            }
            super.create(projekat);
            return projekat;
        }
        catch (DataIntegrityViolationException e) {
            System.out.println(e.getMessage());
            throw new DuplicateKeyException("Duplicate users on same project");
        }
    }
    @Override
    public Projekat update(Projekat newProjekat) {
        return doUpdate(newProjekat, null);
    }

    @Override
    public Projekat update(Projekat newProjekat, Long userId) {
        return doUpdate(newProjekat, userId);
    }

    private Projekat doUpdate(Projekat newProjekat, Long userId) {
        try {
            Projekat oldProjekat = iProjekatRepository.findByIdWithKorisnici(newProjekat.getId())
                    .orElseThrow(() -> new NotFoundException("Project not found"));

            if (userId != null && !oldProjekat.isMenadzer(userId)) {
                throw new ForbiddenException("User not permitted");
            }

            oldProjekat.update(newProjekat);

            return super.update(oldProjekat);

        } catch (DataIntegrityViolationException e) {
            throw new InvalidRequestDataException("Invalid request");
        }
    }
    @Override
    public boolean delete(Long key, Long userId) {
        throw new NotImplementedException("Delete not implemented yet");
    }

    @Override
    public Optional<Projekat> findById(Long id, Long userId) {
            Projekat projekat = iProjekatRepository.findByIdWithKorisnici(id).orElseThrow(() -> new NotFoundException("Project not found"));
            if(!projekat.isOnProject(userId)) {
                return Optional.empty();
            }
            return Optional.of(projekat);
    }

    @Override
    public Set<Projekat> findAll(Long userId) {
        return iProjekatRepository.findDistinctByKorisniciProjekta_KorisnikId(userId);
    }

    @Override
    public Optional<Projekat> findProjectBoardById(Long userId, Long id) {
        Optional<Projekat> projekat = findById(id,userId);
        if (!projekat.isPresent()) {
            return Optional.empty();
        }
        projekat.get().setTokProjekta(tokService.findById(projekat.get().getTokProjekta().getId()).get());
        return projekat;
    }

    @Override
    public Projekat findByIdEager(Long userId, Long projekatId) {
        Projekat projekat = iProjekatRepository.findByIdEager(projekatId).orElseThrow(() -> new NotFoundException("Project not found"));
        korisnikProjekatService.findByUserAndProjekat(userId, projekat.getId()).orElseThrow(() -> new ForbiddenException("User not found on project"));
        return projekat;
    }

    @Override
    public Projekat findByIdEager(Long projekatId) {
        return iProjekatRepository.findByIdEager(projekatId).orElseThrow(() -> new NotFoundException("Project not found"));
    }

    @Override
    public Boolean abandonProject(Long userId, Long projectId) {
        KorisnikProjekat kp = korisnikProjekatService.findByUserAndProjekat(userId, projectId).orElseThrow(() -> new NotFoundException("User not found on project"));
        Projekat projekat = iProjekatRepository.findByIdEager(projectId).orElseThrow(() -> new NotFoundException("Project not found"));
        if(projekat.isMenadzer(userId)) {
            projekat.abandon();
            super.update(projekat);
            return true;
        }
        return false;
    }

    @Override
    public Projekat create(Projekat newProjekat, Long userId) {
        newProjekat.getKorisniciProjekta().add(new KorisnikProjekat(userId,newProjekat, Uloga.menadzer));
        return create(newProjekat);
    }
}
