package DocumentPreparationService.service;

import DocumentPreparationService.dto.analiza.*;
import DocumentPreparationService.service.interfaces.IStatistikaService;
import oracle.sql.ARRAY;
import oracle.sql.STRUCT;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;

@Service
public class AnalizaService implements IStatistikaService {
    @Autowired
    private DataSource dataSource;

    @Override
    public AnalizaDto getProjectAnalysis(Long userId, Long projekatId) {
        return getAnaliza(projekatId, null);
    }

    @Override
    public AnalizaDto getDokumentAnalysis(Long userId, Long dokumentId) {
        return getAnaliza(null, dokumentId);
    }

    private AnalizaDto getAnaliza(Long projekatId, Long dokumentId) {
        AnalizaDto result = new AnalizaDto();
        Long id = null;
        try (Connection conn = dataSource.getConnection();
             CallableStatement stmt = conn.prepareCall("SELECT get_analiza(?, ?) FROM dual")) {

            if (projekatId != null) {
                stmt.setLong(1, projekatId);
                id = projekatId;
            } else {
                stmt.setNull(1, java.sql.Types.INTEGER);
                id = dokumentId;
            }

            if (dokumentId != null) {
                stmt.setLong(2, dokumentId);
            } else {
                stmt.setNull(2, java.sql.Types.INTEGER);
            }

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    STRUCT struct = (STRUCT) rs.getObject(1); // ceo t_analiza
                    if (struct == null) return result;

                    Object[] attrs = struct.getAttributes();
                    AnalizaDto dto = new AnalizaDto();

                    // 0) naziv
                    dto.setEntitet_Analize(new EntityDto(
                            id,
                            attrs[0] != null ? (String) attrs[0] : null
                    ));

                    // 1) analiza_podDokumenata
                    dto.setDokument_Analize(attrs[1] != null ? mapDokumentStatistika((ARRAY) attrs[1]) : List.of());

                    // 2) najsporiji_status
                    dto.setNajsporijiStatus(attrs[2] != null ? mapNajsporiji((STRUCT) attrs[2]) : null);

                    // 3) najproblematicniji_dokument
                    dto.setNajproblematicnijiDokument(attrs[3] != null ? mapNajproblematicniji((STRUCT) attrs[3]) : null);

                    // 4) najvece_kasnjenje
                    dto.setNajveceKasnjenje(attrs[4] != null ? mapNajveceKasnjenje((STRUCT) attrs[4]) : null);

                    // 5) status_analiza_entiteta
                    dto.setTrajanjeEntitetaPoStanjima(attrs[5] != null ? mapStatusTrajanje((ARRAY) attrs[5]) : List.of());

                    // 6) procenat_roka_entiteta
                    dto.setProcenatRokaEntiteta(attrs[6] != null ? (BigDecimal) attrs[6] : null);

                    return dto;
                }
            }
        } catch (SQLException ex) {
            System.out.println("SQL error: " + ex.getMessage());
        }
        return result;
    }

    private List<EntityDto> mapZavisniDokumenti(ARRAY array) throws SQLException {
        if (array == null) return List.of();
        Object[] values = (Object[]) array.getArray();
        List<EntityDto> list = new ArrayList<>();
        for (Object obj : values) {
            if (obj == null) continue;
            STRUCT struct = (STRUCT) obj;
            Object[] attrs = struct.getAttributes();
            EntityDto dto = new EntityDto();
            dto.setId(attrs[0] != null ? ((BigDecimal) attrs[0]).longValue() : null);
            dto.setNaziv(attrs[1] != null ? (String) attrs[1] : null);
            list.add(dto);
        }
        return list;
    }

    private List<StatusTrajanjeDto> mapStatusTrajanje(ARRAY array) throws SQLException {
        if (array == null) return List.of();
        Object[] values = (Object[]) array.getArray();
        List<StatusTrajanjeDto> list = new ArrayList<>();
        for (Object obj : values) {
            if (obj == null) continue;
            STRUCT struct = (STRUCT) obj;
            Object[] attrs = struct.getAttributes();
            StatusTrajanjeDto dto = new StatusTrajanjeDto();
            dto.setStanje(attrs[0] != null ? ((BigDecimal) attrs[0]).intValue() : null);
            dto.setTrajanjeDani(attrs[1] != null ? (BigDecimal) attrs[1] : null);
            dto.setNaziv(attrs[2] != null ? (String) attrs[2] : null);
            list.add(dto);
        }
        return list;
    }

    private List<DokumentAnaliza> mapDokumentStatistika(ARRAY array) throws SQLException {
        if (array == null) return List.of();
        Object[] values = (Object[]) array.getArray();
        List<DokumentAnaliza> list = new ArrayList<>();
        for (Object obj : values) {
            if (obj == null) continue;
            STRUCT struct = (STRUCT) obj;
            Object[] attrs = struct.getAttributes();

            DokumentAnaliza dto = new DokumentAnaliza();
            if (attrs[0] != null) {
                Object[] docAttrs = ((STRUCT) attrs[0]).getAttributes();
                dto.setDokument(new EntityDto(
                        docAttrs[0] != null ? ((BigDecimal) docAttrs[0]).longValue() : null,
                        docAttrs[1] != null ? (String) docAttrs[1] : null
                ));
            }
            dto.setProcenatRoka(attrs[1] != null ? (BigDecimal) attrs[1] : null);
            dto.setBrojVracanja(attrs[2] != null ? ((BigDecimal) attrs[2]).intValue() : null);
            dto.setZavisniDokumenti(attrs[3] != null ? mapZavisniDokumenti((ARRAY) attrs[3]) : List.of());
            dto.setTrajanjePoStanjima(attrs[4] != null ? mapStatusTrajanje((ARRAY) attrs[4]) : List.of());

            list.add(dto);
        }
        return list;
    }

    private NajsporijiStatusDto mapNajsporiji(STRUCT struct) throws SQLException {
        if (struct == null) return null;
        Object[] attrs = struct.getAttributes();
        NajsporijiStatusDto dto = new NajsporijiStatusDto();
        dto.setStatusId(attrs[0] != null ? ((BigDecimal) attrs[0]).intValue() : null);
        dto.setNaziv(attrs[1] != null ? (String) attrs[1] : null);
        dto.setProsecnoVremeZadrzavanja(attrs[2] != null ? (BigDecimal) attrs[2] : null);
        return dto;
    }

    private NajproblematicnijiDokumentDto mapNajproblematicniji(STRUCT struct) throws SQLException {
        if (struct == null) return null;
        Object[] attrs = struct.getAttributes();
        NajproblematicnijiDokumentDto dto = new NajproblematicnijiDokumentDto();
        if (attrs[0] != null) {
            STRUCT docStruct = (STRUCT) attrs[0];
            Object[] docAttrs = docStruct.getAttributes();
            dto.setDokument(new EntityDto(
                    docAttrs[0] != null ? ((BigDecimal) docAttrs[0]).longValue() : null,
                    docAttrs[1] != null ? (String) docAttrs[1] : null
            ));
        }
        dto.setBrojVracanja(attrs[1] != null ? ((BigDecimal) attrs[1]).intValue() : null);
        return dto;
    }

    private NajveceKasnjenjeDto mapNajveceKasnjenje(STRUCT struct) throws SQLException {
        if (struct == null) return null;
        Object[] attrs = struct.getAttributes();
        NajveceKasnjenjeDto dto = new NajveceKasnjenjeDto();
        if (attrs[0] != null) {
            STRUCT docStruct = (STRUCT) attrs[0];
            Object[] docAttrs = docStruct.getAttributes();
            dto.setDokument(new EntityDto(
                    docAttrs[0] != null ? ((BigDecimal) docAttrs[0]).longValue() : null,
                    docAttrs[1] != null ? (String) docAttrs[1] : null
            ));
        }
        dto.setDanaZakasnjenja(attrs[1] != null ? ((BigDecimal) attrs[1]).intValue() : null);
        return dto;
    }
}
