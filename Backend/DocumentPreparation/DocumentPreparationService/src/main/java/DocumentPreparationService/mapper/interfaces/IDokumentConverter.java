package DocumentPreparationService.mapper.interfaces;

import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.model.Dokument;
import org.springframework.stereotype.Component;

public interface IDokumentConverter extends IBaseConverter<Dokument, DokumentDto> {
}
