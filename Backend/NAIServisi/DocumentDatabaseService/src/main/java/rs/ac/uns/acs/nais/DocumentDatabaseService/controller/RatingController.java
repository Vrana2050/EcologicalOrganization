package rs.ac.uns.acs.nais.DocumentDatabaseService.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import rs.ac.uns.acs.nais.DocumentDatabaseService.model.Rating;
import rs.ac.uns.acs.nais.DocumentDatabaseService.service.RatingService;

@RestController
@RequestMapping("/ratings")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @GetMapping
    public ResponseEntity<List<Rating>> getAllRatings() {
        List<Rating> ratings = ratingService.getAllRatings();
        return new ResponseEntity<>(ratings, HttpStatus.OK);
    }

    @GetMapping("/{ratingId}")
    public ResponseEntity<Rating> getRatingById(@PathVariable String ratingId) {
        Rating rating = ratingService.getRatingById(ratingId);
        return new ResponseEntity<>(rating, HttpStatus.OK);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Rating>> getRatingsByProductId(@PathVariable String productId) {
        List<Rating> ratings = ratingService.getRatingsByProductId(productId);
        return new ResponseEntity<>(ratings, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> createRating(@RequestBody Rating rating) {
        Rating createdRating = ratingService.createRating(rating);

        if (createdRating == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Price must be between 1 and 5!");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(createdRating);
    }

    @DeleteMapping("/{ratingId}")
    public ResponseEntity<Void> deleteRating(@PathVariable String ratingId) {
        ratingService.deleteRating(ratingId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
