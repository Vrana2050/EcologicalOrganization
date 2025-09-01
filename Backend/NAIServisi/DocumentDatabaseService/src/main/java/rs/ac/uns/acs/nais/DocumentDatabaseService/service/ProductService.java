package rs.ac.uns.acs.nais.DocumentDatabaseService.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.ws.rs.NotFoundException;
import rs.ac.uns.acs.nais.DocumentDatabaseService.dto.PriceRequest;
import rs.ac.uns.acs.nais.DocumentDatabaseService.model.Price;
import rs.ac.uns.acs.nais.DocumentDatabaseService.model.Product;
import rs.ac.uns.acs.nais.DocumentDatabaseService.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(String productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product with id: " + productId + "  not found."));
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(String productId) {
        productRepository.deleteById(productId);
    }
    
    public Product addPriceToProduct(String productId, PriceRequest request) {
    	Optional<Product> optionalProduct = productRepository.findById(productId);

        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            
            List<Price> prices = product.getPrices();
            if (prices == null) {
                prices = new ArrayList<>();
            }
            Price newPrice = new Price();
            newPrice.setValue(request.getValue());
            newPrice.setStartDate(request.getStartDate());
            newPrice.setEndDate(request.getEndDate());
            prices.add(newPrice);

            product.setPrices(prices);
            return productRepository.save(product); 
        }
        return null;
    }
}
