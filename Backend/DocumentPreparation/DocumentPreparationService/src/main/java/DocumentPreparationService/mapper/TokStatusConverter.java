package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.*;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.mapper.interfaces.ITokStatusConverter;
import DocumentPreparationService.model.*;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

@Component
public class TokStatusConverter extends BaseMapper<TokStatus, TokStatusDto> implements ITokStatusConverter {

    private TokConverter tokConverter;
    private StatusConverter statusConverter;

    private TokConverter getTokConverter() {
        if (tokConverter == null) tokConverter = new TokConverter();
        return tokConverter;
    }

    private StatusConverter getStatusConverter() {
        if (statusConverter == null) statusConverter = new StatusConverter();
        return statusConverter;
    }

    @Override
    public TokStatus ToEntity(TokStatusDto dto) {
        if (dto == null) return null;

        TokStatus entity = new TokStatus();
        entity.setId(dto.getId());
        entity.setRefId(dto.getRefId());
        if(dto.getTokId() != null)
        {
            Tok tok = new Tok();
            tok.setId(dto.getTokId());
            entity.setTok(tok);
        }
        if (dto.getTrenutnoStanje() != null) {
            entity.setTrenutnoStanje(getStatusConverter().ToEntity(dto.getTrenutnoStanje()));
        }

        if (dto.getSledeceStanje() != null) {
            entity.setSledeceStanje(ToEntity(dto.getSledeceStanje()));
        }

        if (dto.getStatusNakonOdbijanja() != null) {
            entity.setStatusNakonOdbijanja(ToEntity(dto.getStatusNakonOdbijanja()));
        }

        return entity;
    }

    @Override
    public TokStatusDto ToDto(TokStatus entity) {
        if (entity == null) return null;

        TokStatusDto dto = new TokStatusDto();
        dto.setId(entity.getId());
        TokDto tokDto = new TokDto();
        tokDto.setId(entity.getId());

        if (Hibernate.isInitialized(entity.getTrenutnoStanje()) && entity.getTrenutnoStanje() != null) {
            dto.setTrenutnoStanje(getStatusConverter().ToDto(entity.getTrenutnoStanje()));
        } else if (entity.getTrenutnoStanje() != null) {
            StatusDto statusDto = new StatusDto();
            statusDto.setId(entity.getTrenutnoStanje().getId());
            dto.setTrenutnoStanje(statusDto);
        }
        if(entity.getSledeceStanje() != null) {
            TokStatusDto sledeceStanje = new TokStatusDto();
            sledeceStanje.setId(entity.getSledeceStanje().getId());
            dto.setSledeceStanje(sledeceStanje);
        }
        if(entity.getStatusNakonOdbijanja() != null) {
            TokStatusDto stanjeNakonOdbijanja = new TokStatusDto();
            stanjeNakonOdbijanja.setId(entity.getStatusNakonOdbijanja().getId());
            dto.setStatusNakonOdbijanja(stanjeNakonOdbijanja);
        }

        return dto;
    }
}
