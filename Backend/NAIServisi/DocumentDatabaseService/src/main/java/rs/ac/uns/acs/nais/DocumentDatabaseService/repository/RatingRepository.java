package rs.ac.uns.acs.nais.DocumentDatabaseService.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import rs.ac.uns.acs.nais.DocumentDatabaseService.model.Rating;

public interface RatingRepository extends MongoRepository<Rating, String> {
	
    List<Rating> findByProductId(String productId);

}