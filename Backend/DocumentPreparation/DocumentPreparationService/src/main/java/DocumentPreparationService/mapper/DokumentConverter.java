package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.*;
import DocumentPreparationService.mapper.interfaces.IDokumentConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.Projekat;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class DokumentConverter extends BaseMapper<Dokument, DokumentDto> implements IDokumentConverter {

    private ProjekatConverter projekatConverter;
    private FajlConverter fajlConverter;
    private KorisnikProjekatConverter korisnikConverter;
    private TokConverter tokConverter;
    private TokStatusConverter tokStatusConverter;
    private DokumentRevizijaConverter dokumentRevizijaConverter;
    private DokumentAktivniFajlConverter dokumentAktivniFajlConverter;



    private ProjekatConverter getProjekatConverter() {
        if (projekatConverter == null) projekatConverter = new ProjekatConverter();
        return projekatConverter;
    }

    private FajlConverter getFajlConverter() {
        if (fajlConverter == null) fajlConverter = new FajlConverter();
        return fajlConverter;
    }

    private KorisnikProjekatConverter getKorisnikConverter() {
        if (korisnikConverter == null) korisnikConverter = new KorisnikProjekatConverter();
        return korisnikConverter;
    }

    private TokConverter getTokConverter() {
        if (tokConverter == null) tokConverter = new TokConverter();
        return tokConverter;
    }

    private DokumentRevizijaConverter getDokumentRevizijaConverter() {
        if (dokumentRevizijaConverter == null) dokumentRevizijaConverter = new DokumentRevizijaConverter();
        return dokumentRevizijaConverter;
    }
    private TokStatusConverter getTokStatusConverter() {
        if (tokStatusConverter == null) tokStatusConverter = new TokStatusConverter();
        return tokStatusConverter;
    }
    private DokumentAktivniFajlConverter getDokumentAktivniFajlConverter() {
        if (dokumentAktivniFajlConverter == null) dokumentAktivniFajlConverter = new DokumentAktivniFajlConverter();
        return dokumentAktivniFajlConverter;
    }

    @Override
    public Dokument ToEntity(DokumentDto dto) {
        if (dto == null) return null;

        Dokument dokument = new Dokument();
        dokument.setId(dto.getId());
        dokument.setNaziv(dto.getNaziv());
        dokument.setOpis(dto.getOpis());
        if(dto.getPrioritet()!=null)
        {
            dokument.setPrioritet(dto.getPrioritet());
        }
        dokument.setRokZavrsetka(dto.getRokZavrsetka());
        dokument.setPoslednjaIzmena(dto.getPoslednjaIzmena());
        dokument.setProcenatZavrsenosti(dto.getProcenatZavrsenosti());
        dokument.setDatumKreiranja(dto.getDatumKreiranja());

        if (dto.getProjekat() != null) {
            dokument.setProjekat(getProjekatConverter().ToEntity(dto.getProjekat()));
        }

        if (dto.getTokIzradeDokumenta() != null) {
            dokument.setTokIzradeDokumenta(getTokConverter().ToEntity(dto.getTokIzradeDokumenta()));
        }

        if (dto.getStatus() != null) {
            dokument.setStatus(getTokStatusConverter().ToEntity(dto.getStatus()));
        }

        if (dto.getRoditeljDokument() != null) {
            dokument.setRoditeljDokument(ToEntity(dto.getRoditeljDokument()));
        }

        if (dto.getVlasnik() != null) {
            dokument.setVlasnik(getKorisnikConverter().ToEntity(dto.getVlasnik()));
        }
        if (dto.getIzmenaOd() != null) {
            dokument.setIzmenaOd(getKorisnikConverter().ToEntity(dto.getIzmenaOd()));
        }

        if (dto.getGlavniFajl() != null) {
            dokument.setGlavniFajl(getFajlConverter().ToEntity(dto.getGlavniFajl()));
        }

        if (dto.getAktivniFajlovi() != null) {
            dokument.setAktivniFajlovi(getDokumentAktivniFajlConverter().ToEntities(dto.getAktivniFajlovi()));
        }

        if (dto.getSviFajlovi() != null) {
            dokument.setSviFajlovi(getFajlConverter().ToEntities(dto.getSviFajlovi()));
        }

        if (dto.getZavisiOd() != null) {
            dokument.setZavisiOd(ToEntities(dto.getZavisiOd()));
        }

        if (dto.getZavisnici() != null) {
            dokument.setZavisnici(ToEntities(dto.getZavisnici()));
        }

        if (dto.getDodeljeniKorisnici() != null) {
            dokument.setDodeljeniKorisnici(getKorisnikConverter().ToEntities(dto.getDodeljeniKorisnici()));
        }

        return dokument;
    }

    @Override
    public DokumentDto ToDto(Dokument dokument) {
        if (dokument == null) return null;

        DokumentDto dto = new DokumentDto();
        dto.setId(dokument.getId());
        dto.setNaziv(dokument.getNaziv());
        dto.setOpis(dokument.getOpis());
        dto.setPrioritet(dokument.getPrioritet());
        dto.setPripremna_verzija(dokument.getPripremna_verzija());
        dto.setPoslednjaIzmena(dokument.getPoslednjaIzmena());
        dto.setProcenatZavrsenosti(dokument.getProcenatZavrsenosti());
        dto.setRokZavrsetka(dokument.getRokZavrsetka());
        dto.setDatumKreiranja(dokument.getDatumKreiranja());

        if (Hibernate.isInitialized(dokument.getProjekat())) {
            dto.setProjekat(getProjekatConverter().ToDto(dokument.getProjekat()));
        }
        else if(dokument.getProjekat() != null) {
            ProjekatDto projekatDto = new ProjekatDto();
            projekatDto.setId(dokument.getProjekat().getId());
            dto.setProjekat(projekatDto);
        }

        if (Hibernate.isInitialized(dokument.getTokIzradeDokumenta()) && dokument.getTokIzradeDokumenta() != null) {
            dto.setTokIzradeDokumenta(getTokConverter().ToDto(dokument.getTokIzradeDokumenta()));
        }
        else if (dokument.getTokIzradeDokumenta() != null) {
            TokDto tokDto = new TokDto();
            tokDto.setId(dokument.getTokIzradeDokumenta().getId());
            dto.setTokIzradeDokumenta(tokDto);
        }

        if (Hibernate.isInitialized(dokument.getStatus()) && dokument.getStatus() != null) {
            dto.setStatus(getTokStatusConverter().ToDto(dokument.getStatus()));
        } else if (dokument.getStatus() != null) {
            TokStatusDto statusDto = new TokStatusDto();
            statusDto.setId(dokument.getStatus().getId());
            dto.setStatus(statusDto);
        }

        if (Hibernate.isInitialized(dokument.getRoditeljDokument()) &&  dokument.getRoditeljDokument() != null) {
            dto.setRoditeljDokument(ToDto(dokument.getRoditeljDokument()));
        } else if (dokument.getRoditeljDokument() != null) {
            DokumentDto roditelj = new DokumentDto();
            roditelj.setId(dokument.getRoditeljDokument().getId());
            dto.setRoditeljDokument(roditelj);
        }

        if (Hibernate.isInitialized(dokument.getVlasnik()) &&  dokument.getVlasnik() != null) {
            dto.setVlasnik(getKorisnikConverter().ToDto(dokument.getVlasnik()));
        } else if (dokument.getVlasnik() != null) {
            KorisnikProjekatDto vlasnikDto = new KorisnikProjekatDto();
            vlasnikDto.setId(dokument.getVlasnik().getId());
            dto.setVlasnik(vlasnikDto);
        }
        if (Hibernate.isInitialized(dokument.getIzmenaOd()) &&   dokument.getIzmenaOd() != null) {
            dto.setIzmenaOd(getKorisnikConverter().ToDto(dokument.getIzmenaOd()));
        } else if (dokument.getIzmenaOd() != null) {
            KorisnikProjekatDto izmenaOdDto = new KorisnikProjekatDto();
            izmenaOdDto.setId(dokument.getIzmenaOd().getId());
            dto.setIzmenaOd(izmenaOdDto);
        }

        if (Hibernate.isInitialized(dokument.getGlavniFajl()) &&   dokument.getGlavniFajl() != null) {
            dto.setGlavniFajl(getFajlConverter().ToDto(dokument.getGlavniFajl()));
        } else if (dokument.getGlavniFajl() != null) {
            FajlDto fajlDto = new FajlDto();
            fajlDto.setId(dokument.getGlavniFajl().getId());
            dto.setGlavniFajl(fajlDto);
        }

        if (Hibernate.isInitialized(dokument.getAktivniFajlovi())) {
            dto.setAktivniFajlovi(getDokumentAktivniFajlConverter().ToDtos(dokument.getAktivniFajlovi()));
        }

        if (Hibernate.isInitialized(dokument.getSviFajlovi())) {
            dto.setSviFajlovi(getFajlConverter().ToDtos(dokument.getSviFajlovi()));
        }

        if (Hibernate.isInitialized(dokument.getZavisiOd())) {
            dto.setZavisiOd(ToDtos(dokument.getZavisiOd()));
        }

        if (Hibernate.isInitialized(dokument.getZavisnici())) {
            dto.setZavisnici(ToDtos(dokument.getZavisnici()));
        }

        if (Hibernate.isInitialized(dokument.getDodeljeniKorisnici())) {
            dto.setDodeljeniKorisnici(getKorisnikConverter().ToDtos(dokument.getDodeljeniKorisnici()));
        }
        if (Hibernate.isInitialized(dokument.getRevizije())) {
            dto.setRevizije(getDokumentRevizijaConverter().ToDtos(dokument.getRevizije()));
        }

        return dto;
    }
}
