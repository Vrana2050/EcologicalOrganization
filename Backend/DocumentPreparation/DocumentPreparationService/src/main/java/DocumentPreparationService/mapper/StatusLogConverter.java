package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.KorisnikProjekatDto;
import DocumentPreparationService.dto.StatusLogDto;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.mapper.interfaces.IStatusLogConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.StatusLog;
import org.springframework.stereotype.Component;

@Component
public class StatusLogConverter extends BaseMapper<StatusLog, StatusLogDto> implements IStatusLogConverter {
    @Override
    public StatusLog ToEntity(StatusLogDto dokumentDto) {

        throw new UnsupportedOperationException("Not supported yet.");

    }

    @Override
    public StatusLogDto ToDto(StatusLog dokument) {
        throw new UnsupportedOperationException("Not supported yet.");

    }
}
