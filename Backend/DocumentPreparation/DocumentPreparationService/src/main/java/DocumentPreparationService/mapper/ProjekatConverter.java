package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.KorisnikProjekatDto;
import DocumentPreparationService.dto.ProjekatDto;
import DocumentPreparationService.dto.TokDto;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.mapper.interfaces.IProjekatConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.Projekat;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;
@Component
public class ProjekatConverter extends BaseMapper<Projekat, ProjekatDto>  implements IProjekatConverter {

    private TokConverter tokConverter;
    private DokumentConverter dokumentConverter;
    private KorisnikProjekatConverter korisnikConverter;

    private TokConverter getTokConverter() {
        if (tokConverter == null) tokConverter = new TokConverter();
        return tokConverter;
    }

    private DokumentConverter getDokumentConverter() {
        if (dokumentConverter == null) dokumentConverter = new DokumentConverter();
        return dokumentConverter;
    }

    private KorisnikProjekatConverter getKorisnikConverter() {
        if (korisnikConverter == null) korisnikConverter = new KorisnikProjekatConverter();
        return korisnikConverter;
    }

    @Override
    public Projekat ToEntity(ProjekatDto dto) {
        if (dto == null) return null;

        Projekat entity = new Projekat();
        entity.setId(dto.getId());
        entity.setNaziv(dto.getNaziv());
        entity.setStatus(dto.getStatus());
        entity.setRokZavrsetka(dto.getRokZavrsetka());
        if (dto.getTokProjekta() != null) {
            entity.setTokProjekta(getTokConverter().ToEntity(dto.getTokProjekta()));
        }

        if (dto.getDokumenti() != null) {
            entity.setDokumenti(getDokumentConverter().ToEntities(dto.getDokumenti()));
        }

        if (dto.getKorisniciProjekta() != null) {
            entity.setKorisniciProjekta(getKorisnikConverter().ToEntities(dto.getKorisniciProjekta()));
        }

        return entity;
    }

    @Override
    public ProjekatDto ToDto(Projekat entity) {
        if (entity == null) return null;

        ProjekatDto dto = new ProjekatDto();
        dto.setId(entity.getId());
        dto.setNaziv(entity.getNaziv());
        dto.setStatus(entity.getStatus());
        dto.setRokZavrsetka(entity.getRokZavrsetka());

        if (Hibernate.isInitialized(entity.getTokProjekta())) {
            dto.setTokProjekta(getTokConverter().ToDto(entity.getTokProjekta()));
        } else if (entity.getTokProjekta() != null) {
            TokDto tokDto = new TokDto();
            tokDto.setId(entity.getTokProjekta().getId());
            dto.setTokProjekta(tokDto);
        }

        if (Hibernate.isInitialized(entity.getDokumenti())) {
            dto.setDokumenti(getDokumentConverter().ToDtos(entity.getDokumenti()));
        }

        if (Hibernate.isInitialized(entity.getKorisniciProjekta())) {
            dto.setKorisniciProjekta(getKorisnikConverter().ToDtos(entity.getKorisniciProjekta()));
        }

        return dto;
    }
}
