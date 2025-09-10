package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.KorisnikProjekatDto;
import DocumentPreparationService.dto.StatistikaProjektnihDokumenataDto;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.mapper.interfaces.IStatistikaProjektnihDokumenataConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.StatistikaProjektnihDokumenata;
import org.springframework.stereotype.Component;

@Component
public class StatistikaProjektnihDokumenataConverter extends BaseMapper<StatistikaProjektnihDokumenata, StatistikaProjektnihDokumenataDto> implements IStatistikaProjektnihDokumenataConverter {
    @Override
    public StatistikaProjektnihDokumenata ToEntity(StatistikaProjektnihDokumenataDto dokumentDto) {

        throw new UnsupportedOperationException("Not supported yet.");

    }

    @Override
    public StatistikaProjektnihDokumenataDto ToDto(StatistikaProjektnihDokumenata dokument) {
        throw new UnsupportedOperationException("Not supported yet.");

    }
}
