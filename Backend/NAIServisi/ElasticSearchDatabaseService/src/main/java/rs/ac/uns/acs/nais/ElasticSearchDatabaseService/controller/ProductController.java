package rs.ac.uns.acs.nais.ElasticSearchDatabaseService.controller;

import org.springframework.web.bind.annotation.*;
import rs.ac.uns.acs.nais.ElasticSearchDatabaseService.model.Product;
import rs.ac.uns.acs.nais.ElasticSearchDatabaseService.service.impl.ProductService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

import java.util.List;

@RestController
@RequestMapping("/products.json")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public void addProduct(@RequestBody Product product) {
        productService.save(product);
    }

    @GetMapping("findByNameOrDescription")
    public List<Product> findByNameOrDescription(@RequestParam(value = "name") String name,
                                                 @RequestParam(value = "description") String description) {
        return productService.findByNameOrDescription(name, description);
    }

    @GetMapping("findByNameContainingOrDescriptionContaining")
    public List<Product> findByNameContainingOrDescriptionContaining(@RequestParam(value = "name") String name,
                                                                     @RequestParam(value = "description") String description) {
        return productService.findByNameContainingOrDescriptionContaining(name, description);
    }

    @GetMapping("findByCustomQuery")
    public List<Product> findByCustomQuery(@RequestParam(value = "query") String query) {
        return productService.findByCustomQuery(query);
    }

    @GetMapping("searchByDescriptionPhrase")
    public List<Product> searchByDescriptionPhrase(@RequestParam(value = "phrase") String phrase) {
        return productService.searchByDescriptionPhrase(phrase);
    }

    @GetMapping("searchByNameOrDescriptionFuzzy")
    public List<Product> searchByNameOrDescriptionFuzzy(@RequestParam(value = "searchTerm") String searchTerm) {
        return productService.searchByNameOrDescriptionFuzzy(searchTerm);
    }

    @GetMapping("findByNameAndDescriptionNotAndOptional")
    public List<Product> findByNameAndDescriptionNotAndOptional(@RequestParam(value = "name") String name,
                                                                @RequestParam(value = "mustNotTerms") String mustNotTerms,
                                                                @RequestParam(value = "shouldTerms") String shouldTerms) {
        return productService.findByNameAndDescriptionNotAndOptional(name, mustNotTerms, shouldTerms);
    }


    @GetMapping("findByFunctionScore")
    public List<Product> findByFunctionScore(@RequestParam(value = "searchTerm") String searchTerm,
                                             @RequestParam(value = "boostTerms") String boostTerms) {
        return productService.findByFunctionScore(searchTerm, boostTerms);
    }
/* 
    @GetMapping(value = "/export-pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportPdf() {
        List<Product> products = productService.findByCustomQuery("brown shorts"); 
        try {
            byte[] pdfContents = productService.export(products);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "products.pdf");

            return ResponseEntity.ok()
                                 .headers(headers)
                                 .body(pdfContents);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
*/
}