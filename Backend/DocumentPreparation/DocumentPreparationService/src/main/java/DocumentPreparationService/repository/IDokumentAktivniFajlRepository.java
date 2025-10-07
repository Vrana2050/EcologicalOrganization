package DocumentPreparationService.repository;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.DokumentAktivniFajl;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface IDokumentAktivniFajlRepository extends ICrudRepository<DokumentAktivniFajl, Long> {
    @Query("""
   select daf
  from DokumentAktivniFajl daf
  join fetch daf.fajl
  where daf.dokument.id = :dokumentId
""")
    Set<DokumentAktivniFajl> findByDokumentIdWithFajl(@Param("dokumentId") Long dokumentId);

    DokumentAktivniFajl findByDokument_IdAndFajl_Id(Long dokumentId, Long fajlId);
}
