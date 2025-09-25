package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.dto.DokumentRevizijaDto;
import DocumentPreparationService.dto.KorisnikProjekatDto;
import DocumentPreparationService.dto.RevizijaIzmenaDto;
import DocumentPreparationService.mapper.interfaces.IDokumentRevizijaConverter;
import DocumentPreparationService.mapper.interfaces.IKorisnikProjekatConverter;
import DocumentPreparationService.mapper.interfaces.IRevizijaIzmenaConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.KorisnikProjekat;
import DocumentPreparationService.model.RevizijaIzmena;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

@Component
public class RevizijaIzmenaConverter extends BaseMapper<RevizijaIzmena, RevizijaIzmenaDto> implements IRevizijaIzmenaConverter {

    private DokumentRevizijaConverter dokumentRevizijaConverter;

    private DokumentRevizijaConverter getDokumentRevizijaConverter() {
        if (dokumentRevizijaConverter == null) dokumentRevizijaConverter = new DokumentRevizijaConverter();
        return dokumentRevizijaConverter;
    }

    @Override
    public RevizijaIzmena ToEntity(RevizijaIzmenaDto dto) {
        if (dto == null) return null;

        RevizijaIzmena entity = new RevizijaIzmena();
        entity.setId(dto.getId());
        entity.setIzmena(dto.getIzmena());
        entity.setIspravljena(dto.getIspravljena());
        entity.setDatumIspravljanja(dto.getDatumIspravljanja());

        if (dto.getDokumentRevizijaId() != null) {
            DokumentRevizija dokumentRevizija = new  DokumentRevizija();
            dokumentRevizija.setId(dto.getDokumentRevizijaId());
            entity.setRevizija(dokumentRevizija);
        }

        return entity;
    }

    @Override
    public RevizijaIzmenaDto ToDto(RevizijaIzmena entity) {
        if (entity == null) return null;

        RevizijaIzmenaDto dto = new RevizijaIzmenaDto();
        dto.setId(entity.getId());
        dto.setIzmena(entity.getIzmena());
        dto.setIspravljena(entity.getIspravljena());
        dto.setDokumentRevizijaId(entity.getRevizija().getId());
        dto.setDatumIspravljanja(entity.getDatumIspravljanja());

        return dto;
    }
}
