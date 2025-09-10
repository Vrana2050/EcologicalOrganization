package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.KorisnikProjekatDto;
import DocumentPreparationService.dto.ObavestenjeDto;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.mapper.interfaces.IObavestenjeConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.Obavestenje;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

@Component
public class ObavestenjeConverter extends BaseMapper<Obavestenje, ObavestenjeDto> implements IObavestenjeConverter {

    private DokumentConverter dokumentConverter;

    private DokumentConverter getDokumentConverter() {
        if (dokumentConverter == null) dokumentConverter = new DokumentConverter();
        return dokumentConverter;
    }

    @Override
    public Obavestenje ToEntity(ObavestenjeDto dto) {
        if (dto == null) return null;

        Obavestenje entity = new Obavestenje();
        entity.setId(dto.getId());
        entity.setPoruka(dto.getPoruka());
        entity.setKorisnikId(dto.getKorisnikId());
        entity.setProcitana(dto.getProcitana());

        if (dto.getDokument() != null) {
            entity.setDokument(getDokumentConverter().ToEntity(dto.getDokument()));
        }

        return entity;
    }

    @Override
    public ObavestenjeDto ToDto(Obavestenje entity) {
        if (entity == null) return null;

        ObavestenjeDto dto = new ObavestenjeDto();
        dto.setId(entity.getId());
        dto.setPoruka(entity.getPoruka());
        dto.setKorisnikId(entity.getKorisnikId());
        dto.setProcitana(entity.getProcitana());

        if (Hibernate.isInitialized(entity.getDokument())) {
            dto.setDokument(getDokumentConverter().ToDto(entity.getDokument()));
        } else if (entity.getDokument() != null) {
            DokumentDto dokumentDto = new DokumentDto();
            dokumentDto.setId(entity.getDokument().getId());
            dto.setDokument(dokumentDto);
        }

        return dto;
    }
}
