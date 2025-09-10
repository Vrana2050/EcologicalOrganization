package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.KorisnikProjekatDto;
import DocumentPreparationService.dto.StatistikaProjektaDto;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.mapper.interfaces.IStatistikaProjektaConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.StatistikaProjekta;
import org.springframework.stereotype.Component;

@Component
public class StatistikaProjektaConverter extends BaseMapper<StatistikaProjekta, StatistikaProjektaDto> implements IStatistikaProjektaConverter {
    @Override
    public StatistikaProjekta ToEntity(StatistikaProjektaDto dokumentDto) {

        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    public StatistikaProjektaDto ToDto(StatistikaProjekta dokument) {
        throw new UnsupportedOperationException("Not supported yet.");

    }
}
