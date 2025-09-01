package rs.ac.uns.acs.nais.RelationalDatabaseService.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import rs.ac.uns.acs.nais.RelationalDatabaseService.model.User;


public interface UserRepository extends JpaRepository<User, Long>{

    User findByEmail(String email);
}
