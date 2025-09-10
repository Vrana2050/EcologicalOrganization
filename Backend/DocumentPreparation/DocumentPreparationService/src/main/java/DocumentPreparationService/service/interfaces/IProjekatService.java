package DocumentPreparationService.service.interfaces;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Projekat;

import java.util.Optional;
import java.util.Set;

public interface IProjekatService extends ICrudService<Projekat,Long>{
    public Projekat create(Projekat entity,Long userId);
    public Projekat update(Projekat entity,Long userId);
    public boolean delete(Long id,Long userId);
    public Optional<Projekat> findById(Long id,Long userId);
    public Set<Projekat> findAll(Long userId);
}
