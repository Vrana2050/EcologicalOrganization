package DocumentPreparationService.service;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.RevizijaIzmena;
import DocumentPreparationService.repository.ICrudRepository;
import DocumentPreparationService.repository.IRevizijaIzmenaRepository;
import DocumentPreparationService.service.interfaces.IRevizijaIzmenaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class RevizijaIzmenaServica extends CrudService<RevizijaIzmena,Long> implements IRevizijaIzmenaService {

    protected RevizijaIzmenaServica(IRevizijaIzmenaRepository repository) {
        super(repository);
    }
}
