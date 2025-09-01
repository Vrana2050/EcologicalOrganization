package rs.ac.uns.acs.nais.DocumentDatabaseService.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import rs.ac.uns.acs.nais.DocumentDatabaseService.model.Product;

public interface ProductRepository extends MongoRepository<Product, String> {
	
}
