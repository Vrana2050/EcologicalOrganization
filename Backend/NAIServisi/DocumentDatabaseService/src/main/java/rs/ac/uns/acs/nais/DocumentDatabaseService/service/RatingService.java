package rs.ac.uns.acs.nais.DocumentDatabaseService.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import rs.ac.uns.acs.nais.DocumentDatabaseService.model.Rating;
import rs.ac.uns.acs.nais.DocumentDatabaseService.repository.RatingRepository;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    public List<Rating> getAllRatings() {
        return ratingRepository.findAll();
    }

    public Rating getRatingById(String ratingId) {
        return ratingRepository.findById(ratingId)
                .orElseThrow(() -> new NotFoundException("Rating with id: " + ratingId + " not found."));
    }

    public List<Rating> getRatingsByProductId(String productId) {
        return ratingRepository.findByProductId(productId);
    }

    public Rating createRating(Rating rating) {
    	if(rating.getRating() < 1 || rating.getRating() > 5) {
    		return null;
    	}
    	
        return ratingRepository.save(rating);
    }

    public void deleteRating(String ratingId) {
        ratingRepository.deleteById(ratingId);
    }
}
