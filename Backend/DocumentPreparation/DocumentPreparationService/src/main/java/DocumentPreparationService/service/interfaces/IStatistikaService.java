package DocumentPreparationService.service.interfaces;

import DocumentPreparationService.dto.analiza.AnalizaDto;
import DocumentPreparationService.dto.analiza.DokumentAnaliza;

public interface IStatistikaService {
    public AnalizaDto getProjectAnalysis(Long userId, Long projekatId );
    public AnalizaDto getDokumentAnalysis(Long userId, Long dokumentId );

}
