package rs.ac.uns.acs.nais.RelationalDatabaseService.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import rs.ac.uns.acs.nais.RelationalDatabaseService.model.Address;

public interface AddressRepository extends JpaRepository<Address, Long> {

}
