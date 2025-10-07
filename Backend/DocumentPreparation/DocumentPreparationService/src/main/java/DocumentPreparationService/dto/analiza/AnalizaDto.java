package DocumentPreparationService.dto.analiza;

import DocumentPreparationService.dto.DokumentDto;
import DocumentPreparationService.model.Status;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class AnalizaDto {
        private EntityDto entitet_Analize;
        private List<DokumentAnaliza> dokument_Analize;
        private NajsporijiStatusDto najsporijiStatus;
        private NajproblematicnijiDokumentDto najproblematicnijiDokument;
        private NajveceKasnjenjeDto najveceKasnjenje;
        private List<StatusTrajanjeDto> trajanjeEntitetaPoStanjima;
        private BigDecimal procenatRokaEntiteta;
}
