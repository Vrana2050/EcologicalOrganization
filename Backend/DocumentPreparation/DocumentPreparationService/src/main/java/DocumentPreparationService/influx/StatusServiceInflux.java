package DocumentPreparationService.influx;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatusServiceInflux {
    @Autowired
    private StatusRepository repository;
    public List<StatusLog> getAll()
    {
        return repository.getAll();
    }
    public boolean delete(Long dokumentId,DateRangeDto dateRangeDto)
    {
        return repository.delete(dokumentId,dateRangeDto);
    }
    public StatusLog create(StatusLog statusLog)
    {
        if(repository.save(statusLog))
        {
            return statusLog;
        }
        return null;
    }
}
