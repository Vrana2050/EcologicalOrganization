package rs.ac.uns.acs.nais.RelationalDatabaseService.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import rs.ac.uns.acs.nais.RelationalDatabaseService.model.Country;

public interface CountryRepository extends JpaRepository<Country, Long>{

}
