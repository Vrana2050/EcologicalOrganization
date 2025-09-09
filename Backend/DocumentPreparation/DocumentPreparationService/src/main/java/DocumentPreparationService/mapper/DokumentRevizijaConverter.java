package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.*;
import DocumentPreparationService.mapper.interfaces.IBaseConverter;
import DocumentPreparationService.mapper.interfaces.IDokumentConverter;
import DocumentPreparationService.mapper.interfaces.IDokumentRevizijaConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Projekat;
import DocumentPreparationService.model.RevizijaIzmena;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;
@Component
public class DokumentRevizijaConverter extends BaseMapper<DokumentRevizija, DokumentRevizijaDto>
        implements IDokumentRevizijaConverter {

    private DokumentConverter dokumentConverter;
    private KorisnikProjekatConverter korisnikConverter;
    private TokStatusConverter tokStatusConverter;
    private RevizijaIzmenaConverter revizijaIzmenaConverter;

    private DokumentConverter getDokumentConverter() {
        if (dokumentConverter == null) dokumentConverter = new DokumentConverter();
        return dokumentConverter;
    }

    private KorisnikProjekatConverter getKorisnikConverter() {
        if (korisnikConverter == null) korisnikConverter = new KorisnikProjekatConverter();
        return korisnikConverter;
    }

    private TokStatusConverter getTokStatusConverter() {
        if (tokStatusConverter == null) tokStatusConverter = new TokStatusConverter();
        return tokStatusConverter;
    }

    private RevizijaIzmenaConverter getRevizijaIzmenaConverter() {
        if (revizijaIzmenaConverter == null) revizijaIzmenaConverter = new RevizijaIzmenaConverter();
        return revizijaIzmenaConverter;
    }

    @Override
    public DokumentRevizija ToEntity(DokumentRevizijaDto dto) {
        if (dto == null) return null;

        DokumentRevizija entity = new DokumentRevizija();
        entity.setId(dto.getId());
        entity.setOdobreno(dto.getOdobreno());

        if (dto.getDokument() != null) {
            entity.setDokument(getDokumentConverter().ToEntity(dto.getDokument()));
        }

        if (dto.getPregledac() != null) {
            entity.setPregledac(getKorisnikConverter().ToEntity(dto.getPregledac()));
        }

        if (dto.getTrenutniStatus() != null) {
            entity.setTrenutniStatus(getTokStatusConverter().ToEntity(dto.getTrenutniStatus()));
        }

        if (dto.getIzmene() != null) {
            Set<RevizijaIzmenaDto> izmeneDto = dto.getIzmene();
            entity.setIzmene(getRevizijaIzmenaConverter().ToEntities(izmeneDto));
        }

        return entity;
    }

    @Override
    public DokumentRevizijaDto ToDto(DokumentRevizija entity) {
        if (entity == null) return null;

        DokumentRevizijaDto dto = new DokumentRevizijaDto();
        dto.setId(entity.getId());
        dto.setOdobreno(entity.getOdobreno());

        if (Hibernate.isInitialized(entity.getDokument())) {
            DokumentDto dokumentDto = new DokumentDto();
            dokumentDto.setId(entity.getDokument().getId());
            dto.setDokument(dokumentDto);
        } else if (entity.getDokument() != null) {
            DokumentDto dokumentDto = new DokumentDto();
            dokumentDto.setId(entity.getDokument().getId());
            dto.setDokument(dokumentDto);
        }

        if (Hibernate.isInitialized(entity.getPregledac())) {
            dto.setPregledac(getKorisnikConverter().ToDto(entity.getPregledac()));
        } else if (entity.getPregledac() != null) {
            KorisnikProjekatDto korisnikDto = new KorisnikProjekatDto();
            korisnikDto.setId(entity.getPregledac().getId());
            dto.setPregledac(korisnikDto);
        }

        if (Hibernate.isInitialized(entity.getTrenutniStatus())) {
            dto.setTrenutniStatus(getTokStatusConverter().ToDto(entity.getTrenutniStatus()));
        } else if (entity.getTrenutniStatus() != null) {
            TokStatusDto statusDto = new TokStatusDto();
            statusDto.setId(entity.getTrenutniStatus().getId());
            dto.setTrenutniStatus(statusDto);
        }

        if (Hibernate.isInitialized(entity.getIzmene())) {
            Set<RevizijaIzmenaDto> izmene = getRevizijaIzmenaConverter().ToDtos(entity.getIzmene());
            dto.setIzmene(izmene);
        }

        return dto;
    }
}

