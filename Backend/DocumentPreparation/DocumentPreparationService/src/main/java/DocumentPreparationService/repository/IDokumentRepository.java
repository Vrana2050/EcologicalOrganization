package DocumentPreparationService.repository;

import DocumentPreparationService.model.Dokument;
import DocumentPreparationService.model.KorisnikProjekat;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;

@Repository
public interface IDokumentRepository extends ICrudRepository<Dokument, Long> {

    Set<Dokument> findAllByZavisiOdIn(Set<Dokument> zavisiOds);
    @Query("SELECT d FROM Dokument d " +
            "LEFT JOIN FETCH d.projekat " +
            "LEFT JOIN FETCH d.tokIzradeDokumenta " +
            "LEFT JOIN FETCH d.status " +
            "LEFT JOIN FETCH d.roditeljDokument " +
            "LEFT JOIN FETCH d.vlasnik " +
            "LEFT JOIN FETCH d.zavisiOd " +
            "LEFT JOIN FETCH d.dodeljeniKorisnici " +
            "LEFT JOIN FETCH d.revizije " +
            "WHERE d.id = :id")
    Optional<Dokument> findByIdEager(@Param("id") Long id);
    @Query("SELECT d FROM Dokument d " +
            "LEFT JOIN FETCH d.dodeljeniKorisnici "+
            "LEFT JOIN FETCH d.status "+
            "WHERE d.id = :id")
    Optional<Dokument> findByIdWithDodeljeniciAndStatus(@Param("id") Long id);


    @Query("SELECT DISTINCT d FROM Dokument d " +
            "JOIN d.dodeljeniKorisnici k " +
            "WHERE k IN :korisnici")
    Set<Dokument> findAllByAnyDodeljeniKorisnici(@Param("korisnici") Set<KorisnikProjekat> korisnici);
    @Query("SELECT d FROM Dokument d " +
            "LEFT JOIN FETCH d.sviFajlovi "+
            "WHERE d.id = :dokumentId")
    Optional<Dokument> findByIdWithSviFajlovi(Long dokumentId);
    @Query("SELECT d FROM Dokument d " +
            "LEFT JOIN FETCH d.glavniFajl " +
            "LEFT JOIN FETCH d.zavisiOd " +
            "LEFT JOIN FETCH d.dodeljeniKorisnici " +
            "WHERE d.projekat.id = :projekatId and d.roditeljDokument is null")
    Set<Dokument> getAllBoardDocumentsByProjectId(long projekatId);
    @Query("SELECT d FROM Dokument d " +
            "LEFT JOIN FETCH d.glavniFajl " +
            "LEFT JOIN FETCH d.zavisiOd " +
            "LEFT JOIN FETCH d.dodeljeniKorisnici " +
            "WHERE d.roditeljDokument.id = :parentDocumentId")
    Set<Dokument> getAllBoardDocumentsByParentDocumentId(Long parentDocumentId);

    @Query("SELECT d FROM Dokument d " +
            "WHERE d.roditeljDokument.id = :parentDocumentId")
    Set<Dokument> getAllDokumentiOnRoditeljDokument(Long parentDocumentId);
    @Query("SELECT d FROM Dokument d " +
            "WHERE d.projekat.id = :projekatId AND d.roditeljDokument is null ")
    Set<Dokument> getAllDokumentiOnProjekat(Long projekatId);

    Set<Dokument> findAllByIdIn(Collection<Long> ids);
}