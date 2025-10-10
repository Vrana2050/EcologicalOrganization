package DocumentPreparationService.repository;

import DocumentPreparationService.model.DokumentRevizija;
import DocumentPreparationService.model.Fajl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface IFajlRepository extends ICrudRepository<Fajl, Long> {

    @Query(value = """
        SELECT f.id,
               f.podatak,
               f.verzija,
               f.datum_kreiranja,
               f.naziv,
               f.ekstenzija
        FROM fajl f
        JOIN dokument_aktivni_fajl daf ON daf.fajl_id = f.id
        WHERE daf.dokument_id = :dokumentId
        """, nativeQuery = true)
    Set<Fajl> getFajloviForRevizija(@Param("dokumentId") Long dokumentId);
    @Query(value = """
    SELECT
      t.id,
      t.podatak,
      t.verzija,
      t.datum_kreiranja,
      t.naziv,
      t.ekstenzija
    FROM TABLE(GET_ALL_VERSIONS(:aktivniFajlId)) t
    ORDER BY t.verzija, t.id
    OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    """, nativeQuery = true)
    Set<Fajl> findOtherVersions(
            @Param("aktivniFajlId") Long aktivniFajlId,
            @Param("offset") int offset,
            @Param("limit") int limit
    );

    @Query("""
    SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END
    FROM Fajl f
    JOIN f.dokumenti d
    WHERE f.id = :id and d.id != :dokumentId
""")
    boolean fileExistsInOtherDocument(@Param("id") Long id,@Param("dokumentId") Long dokumentId);
}
