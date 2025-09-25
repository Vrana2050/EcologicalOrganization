package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.DokumentRevizijaDto;
import DocumentPreparationService.dto.FajlDto;
import DocumentPreparationService.dto.RevizijaIzmenaDto;
import DocumentPreparationService.mapper.interfaces.IBaseConverter;
import DocumentPreparationService.mapper.interfaces.IDokumentRevizijaConverter;
import DocumentPreparationService.mapper.interfaces.IFajlConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Fajl;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
@Component
public class FajlConverter extends BaseMapper<Fajl, FajlDto> implements IFajlConverter {
    @Override
    public Fajl ToEntity(FajlDto dto) {
        if (dto == null) return null;

        Fajl entity = new Fajl();
        entity.setId(dto.getId());
        entity.setNaziv(dto.getNaziv());
        entity.setEkstenzija(dto.getEkstenzija());
        entity.setVerzija(dto.getVerzija());
        entity.setDatumKreiranja(dto.getDatumKreiranja());
        entity.setPodatak(dto.getPodatak());
        return entity;
    }

    @Override
    public FajlDto ToDto(Fajl entity) {
        if (entity == null) return null;

        FajlDto dto = new FajlDto();
        dto.setId(entity.getId());
        dto.setNaziv(entity.getNaziv());
        dto.setEkstenzija(entity.getEkstenzija());
        dto.setVerzija(entity.getVerzija());
        dto.setDatumKreiranja(entity.getDatumKreiranja());
        dto.setPodatak(entity.getPodatak());
        return dto;
    }

}
