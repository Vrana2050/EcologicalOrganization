package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.KorisnikProjekatDto;
import DocumentPreparationService.dto.TokDto;
import DocumentPreparationService.dto.TokStatusDto;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.mapper.interfaces.ITokConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.Tok;
import DocumentPreparationService.model.TokStatus;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
@Component
public class TokConverter extends BaseMapper<Tok, TokDto> implements ITokConverter {

    private TokStatusConverter tokStatusConverter;

    private TokStatusConverter getTokStatusConverter() {
        if (tokStatusConverter == null) tokStatusConverter = new TokStatusConverter();
        return tokStatusConverter;
    }

    @Override
    public Tok ToEntity(TokDto dto) {
        if (dto == null) return null;

        Tok entity = new Tok();
        entity.setId(dto.getId());
        entity.setNaziv(dto.getNaziv());
        if (dto.getStatusi() != null) {
            entity.setStatusi(getTokStatusConverter().ToEntities(dto.getStatusi()));
        }

        return entity;
    }

    @Override
    public TokDto ToDto(Tok entity) {
        if (entity == null) return null;

        TokDto dto = new TokDto();
        dto.setId(entity.getId());
        dto.setNaziv(entity.getNaziv());

        if (Hibernate.isInitialized(entity.getStatusi())) {
            dto.setStatusi(getTokStatusConverter().ToDtos(entity.getStatusi()));
        }

        return dto;
    }
}
