package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.DokumentRevizijaDto;
import DocumentPreparationService.dto.KorisnikProjekatDto;
import DocumentPreparationService.dto.ProjekatDto;
import DocumentPreparationService.mapper.interfaces.IBaseConverter;
import DocumentPreparationService.mapper.interfaces.IDokumentRevizijaConverter;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.Projekat;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;
@Component
public class KorisnikProjekatConverter extends BaseMapper<KorisnikProjekat, KorisnikProjekatDto> implements IKorisnikProjekatConverter {

    private ProjekatConverter projekatConverter;
    private DokumentConverter dokumentConverter;

    private ProjekatConverter getProjekatConverter() {
        if (projekatConverter == null) projekatConverter = new ProjekatConverter();
        return projekatConverter;
    }

    private DokumentConverter getDokumentConverter() {
        if (dokumentConverter == null) dokumentConverter = new DokumentConverter();
        return dokumentConverter;
    }

    @Override
    public KorisnikProjekat ToEntity(KorisnikProjekatDto dto) {
        if (dto == null) return null;

        KorisnikProjekat entity = new KorisnikProjekat();
        entity.setId(dto.getId());
        entity.setKorisnikId(dto.getKorisnikId());
        entity.setUlogaUProjektu(dto.getUlogaUProjektu());
        Projekat projekat = new Projekat();
        projekat.setId(dto.getProjekatId());
        entity.setProjekat(projekat);

        if (dto.getDokumenti() != null) {
            entity.setDokumenti(getDokumentConverter().ToEntities(dto.getDokumenti()));
        }

        return entity;
    }

    @Override
    public KorisnikProjekatDto ToDto(KorisnikProjekat entity) {
        if (entity == null) return null;

        KorisnikProjekatDto dto = new KorisnikProjekatDto();
        dto.setId(entity.getId());
        dto.setKorisnikId(entity.getKorisnikId());
        dto.setUlogaUProjektu(entity.getUlogaUProjektu());
        dto.setProjekatId(entity.getProjekat().getId());
        if (Hibernate.isInitialized(entity.getDokumenti())) {
            dto.setDokumenti(getDokumentConverter().ToDtos(entity.getDokumenti()));
        }

        return dto;
    }
}
