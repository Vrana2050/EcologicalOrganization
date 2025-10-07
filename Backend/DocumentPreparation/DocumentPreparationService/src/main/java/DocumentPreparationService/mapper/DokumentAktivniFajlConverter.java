package DocumentPreparationService.mapper;

import DocumentPreparationService.dto.*;
import DocumentPreparationService.mapper.interfaces.IDokumentAktivniFajlConverter;
import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentAktivniFajl;
import DocumentPreparationService.model.Fajl;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.util.Set;
@Component
public class DokumentAktivniFajlConverter extends BaseMapper<DokumentAktivniFajl,DokumentAktivniFajlDto> implements IDokumentAktivniFajlConverter {
    private FajlConverter fajlConverter;
    private FajlConverter getFajlConverter() {
        if (fajlConverter == null) fajlConverter = new FajlConverter();
        return fajlConverter;
    }
    @Override
    public DokumentAktivniFajl ToEntity(DokumentAktivniFajlDto dto) {
        if (dto == null) return null;

        DokumentAktivniFajl dokumentAktivniFajl = new DokumentAktivniFajl();
        dokumentAktivniFajl.setId(dto.getId());
        if(dto.getDokumentId() != null){
            Dokument dokument = new Dokument();
            dokument.setId(dto.getDokumentId());
            dokumentAktivniFajl.setDokument(dokument);
        }
        if(dto.getFajl() != null){
            dokumentAktivniFajl.setFajl(getFajlConverter().ToEntity(dto.getFajl()));
        }


        return dokumentAktivniFajl;
    }

    @Override
    public DokumentAktivniFajlDto ToDto(DokumentAktivniFajl dokumentAktivniFajl) {
        if (dokumentAktivniFajl == null) return null;

        DokumentAktivniFajlDto dto = new DokumentAktivniFajlDto();
        dto.setId(dokumentAktivniFajl.getId());
        dto.setDokumentId(dokumentAktivniFajl.getDokument().getId());
        if(Hibernate.isInitialized(dokumentAktivniFajl.getFajl())){
            dto.setFajl(getFajlConverter().ToDto(dokumentAktivniFajl.getFajl()));
        }
        else{
            FajlDto fajlDto = new FajlDto();
            fajlDto.setId(dokumentAktivniFajl.getFajl().getId());
            dto.setFajl(fajlDto);
        }


        return dto;
    }
}
