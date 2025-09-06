package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.KorisnikProjekatDto;
import DocumentPreparationService.dto.StatusDto;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.mapper.interfaces.IStatusConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.Status;
import org.springframework.stereotype.Component;

@Component
public class StatusConverter extends BaseMapper<Status, StatusDto> implements  IStatusConverter {

    @Override
    public Status ToEntity(StatusDto dto) {
        if (dto == null) return null;

        Status entity = new Status();
        entity.setId(dto.getId());
        entity.setNaziv(dto.getNaziv());
        entity.setPotrebnoOdobrenjeZaPrelazak(dto.getPotrebnoOdobrenjeZaPrelazak());
        entity.setDozvolaMenjanjaZaVlasnika(dto.getDozvolaMenjanjaZaVlasnika());
        entity.setDozvolaDodavanjaZaVlasnika(dto.getDozvolaDodavanjaZaVlasnika());
        entity.setDozvolaBrisanjaZaVlasnika(dto.getDozvolaBrisanjaZaVlasnika());
        entity.setDozvolaCitanjaZaVlasnika(dto.getDozvolaCitanjaZaVlasnika());
        entity.setDozvolaMenjanjaZaZaduzenog(dto.getDozvolaMenjanjaZaZaduzenog());
        entity.setDozvolaDodavanjaZaZaduzenog(dto.getDozvolaDodavanjaZaZaduzenog());
        entity.setDozvolaBrisanjaZaZaduzenog(dto.getDozvolaBrisanjaZaZaduzenog());
        entity.setDozvolaCitanjaZaZaduzenog(dto.getDozvolaCitanjaZaZaduzenog());

        return entity;
    }

    @Override
    public StatusDto ToDto(Status entity) {
        if (entity == null) return null;

        StatusDto dto = new StatusDto();
        dto.setId(entity.getId());
        dto.setNaziv(entity.getNaziv());
        dto.setPotrebnoOdobrenjeZaPrelazak(entity.getPotrebnoOdobrenjeZaPrelazak());
        dto.setDozvolaMenjanjaZaVlasnika(entity.getDozvolaMenjanjaZaVlasnika());
        dto.setDozvolaDodavanjaZaVlasnika(entity.getDozvolaDodavanjaZaVlasnika());
        dto.setDozvolaBrisanjaZaVlasnika(entity.getDozvolaBrisanjaZaVlasnika());
        dto.setDozvolaCitanjaZaVlasnika(entity.getDozvolaCitanjaZaVlasnika());
        dto.setDozvolaMenjanjaZaZaduzenog(entity.getDozvolaMenjanjaZaZaduzenog());
        dto.setDozvolaDodavanjaZaZaduzenog(entity.getDozvolaDodavanjaZaZaduzenog());
        dto.setDozvolaBrisanjaZaZaduzenog(entity.getDozvolaBrisanjaZaZaduzenog());
        dto.setDozvolaCitanjaZaZaduzenog(entity.getDozvolaCitanjaZaZaduzenog());

        return dto;
    }
}
