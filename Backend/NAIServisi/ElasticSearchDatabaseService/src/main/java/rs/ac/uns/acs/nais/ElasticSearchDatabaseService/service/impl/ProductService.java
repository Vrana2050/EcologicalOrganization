package rs.ac.uns.acs.nais.ElasticSearchDatabaseService.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rs.ac.uns.acs.nais.ElasticSearchDatabaseService.model.Product;
import rs.ac.uns.acs.nais.ElasticSearchDatabaseService.repository.ProductRepository;
import rs.ac.uns.acs.nais.ElasticSearchDatabaseService.service.IProductService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import java.util.List;



@Service
public class ProductService implements IProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public void save(Product product) {
        productRepository.save(product);
    }

    public List<Product> findByNameOrDescription(String name, String description) {
        return productRepository.findByNameOrDescription(name, description);
    }

    public List<Product> findByNameContainingOrDescriptionContaining(String name, String description) {
        return productRepository.findByNameContainingOrDescriptionContaining(name, description);
    }

    public List<Product> findByCustomQuery(String query) {
        return productRepository.findByCustomQuery(query);
    }

    public List<Product> searchByDescriptionPhrase(String phrase) {
        return productRepository.searchByDescriptionPhrase(phrase);
    }

    public List<Product> searchByNameOrDescriptionFuzzy(String searchTerm) {
        return productRepository.searchByNameOrDescriptionFuzzy(searchTerm);
    }

    public List<Product> findByNameAndDescriptionNotAndOptional(String name, String mustNotTerms, String shouldTerms) {
        return productRepository.findByNameAndDescriptionNotAndOptional(name, mustNotTerms, shouldTerms);
    }


    public List<Product> findByFunctionScore(String searchTerm, String boostTerms) {
        return productRepository.findByFunctionScore(searchTerm, boostTerms);
    }
/* 
    public byte[] export(List<Product> products) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        Document document = new Document();

        String filename = "podaci/" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy-HH-mm-ss")) + ".pdf";

        PdfWriter.getInstance(document, byteArrayOutputStream);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, Font.BOLD);

        Paragraph title = new Paragraph("PRODUCTS REPORT", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        PdfPTable reportTable = new PdfPTable(3);
        reportTable.setWidthPercentage(100);

        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.BOLD);
        PdfPCell headerCell1 = new PdfPCell(new Paragraph("Product", headerFont));
        PdfPCell headerCell2 = new PdfPCell(new Paragraph("Description", headerFont));
        PdfPCell headerCell3 = new PdfPCell(new Paragraph("ID", headerFont));

        headerCell1.setBackgroundColor(new Color(110, 231, 234, 255));
        headerCell2.setBackgroundColor(new Color(110, 231, 234, 255));
        headerCell3.setBackgroundColor(new Color(110, 231, 234, 255));

        reportTable.addCell(headerCell1);
        reportTable.addCell(headerCell2);
        reportTable.addCell(headerCell3);

        for (Product product : products) {
            reportTable.addCell(product.getName());
            reportTable.addCell(product.getDescription());
            reportTable.addCell(product.getId());
        }

        document.add(reportTable);
        document.close();

        try (FileOutputStream fileOutputStream = new FileOutputStream(filename)) {
            byteArrayOutputStream.writeTo(fileOutputStream);
        }

        return byteArrayOutputStream.toByteArray();
    }
    */
}