package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.*;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.mapper.interfaces.ITokStatusConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.TokStatus;
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

        if (dto.getTok() != null) {
            entity.setTok(getTokConverter().ToEntity(dto.getTok()));
        }

        if (dto.getTrenutnoStanje() != null) {
            entity.setTrenutnoStanje(getStatusConverter().ToEntity(dto.getTrenutnoStanje()));
        }

        if (dto.getSledeceStanje() != null) {
            entity.setSledeceStanje(getStatusConverter().ToEntity(dto.getSledeceStanje()));
        }

        if (dto.getPrethodnoStanje() != null) {
            entity.setPrethodnoStanje(getStatusConverter().ToEntity(dto.getPrethodnoStanje()));
        }

        if (dto.getStatusNakonOdbijanja() != null) {
            entity.setStatusNakonOdbijanja(getStatusConverter().ToEntity(dto.getStatusNakonOdbijanja()));
        }

        return entity;
    }

    @Override
    public TokStatusDto ToDto(TokStatus entity) {
        if (entity == null) return null;

        TokStatusDto dto = new TokStatusDto();
        dto.setId(entity.getId());

        if (Hibernate.isInitialized(entity.getTok()) && entity.getTok() != null) {
            dto.setTok(getTokConverter().ToDto(entity.getTok()));
        } else if (entity.getTok() != null) {
            TokDto tokDto = new TokDto();
            tokDto.setId(entity.getTok().getId());
            dto.setTok(tokDto);
        }

        if (Hibernate.isInitialized(entity.getTrenutnoStanje()) && entity.getTrenutnoStanje() != null) {
            dto.setTrenutnoStanje(getStatusConverter().ToDto(entity.getTrenutnoStanje()));
        } else if (entity.getTrenutnoStanje() != null) {
            StatusDto statusDto = new StatusDto();
            statusDto.setId(entity.getTrenutnoStanje().getId());
            dto.setTrenutnoStanje(statusDto);
        }

        if (Hibernate.isInitialized(entity.getSledeceStanje()) && entity.getSledeceStanje() != null) {
            dto.setSledeceStanje(getStatusConverter().ToDto(entity.getSledeceStanje()));
        } else if (entity.getSledeceStanje() != null) {
            StatusDto statusDto = new StatusDto();
            statusDto.setId(entity.getSledeceStanje().getId());
            dto.setSledeceStanje(statusDto);
        }

        if (Hibernate.isInitialized(entity.getPrethodnoStanje()) && entity.getPrethodnoStanje() != null) {
            dto.setPrethodnoStanje(getStatusConverter().ToDto(entity.getPrethodnoStanje()));
        } else if (entity.getPrethodnoStanje() != null) {
            StatusDto statusDto = new StatusDto();
            statusDto.setId(entity.getPrethodnoStanje().getId());
            dto.setPrethodnoStanje(statusDto);
        }

        if (Hibernate.isInitialized(entity.getStatusNakonOdbijanja()) && entity.getStatusNakonOdbijanja() != null) {
            dto.setStatusNakonOdbijanja(getStatusConverter().ToDto(entity.getStatusNakonOdbijanja()));
        } else if (entity.getStatusNakonOdbijanja() != null) {
            StatusDto statusDto = new StatusDto();
            statusDto.setId(entity.getStatusNakonOdbijanja().getId());
            dto.setStatusNakonOdbijanja(statusDto);
        }

        return dto;
    }
}
