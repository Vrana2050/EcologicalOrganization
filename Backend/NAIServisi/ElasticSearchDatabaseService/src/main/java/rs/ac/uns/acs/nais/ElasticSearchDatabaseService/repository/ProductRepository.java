package rs.ac.uns.acs.nais.ElasticSearchDatabaseService.repository;


import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;
import rs.ac.uns.acs.nais.ElasticSearchDatabaseService.model.Product;
import java.util.List;

@Repository
public interface ProductRepository extends ElasticsearchRepository<Product, String> {
    List<Product> findByNameOrDescription(String name, String description);

    List<Product> findByNameContainingOrDescriptionContaining(String name, String description);

    @Query("{\"bool\": {\"should\": [{\"match\": {\"name\": \"?0\"}}, {\"match\": {\"description\": \"?0\"}}]}}")
    List<Product> findByCustomQuery(String query);

    @Query("{\"match_phrase\":{\"description\":\"?0\"}}")
    List<Product> searchByDescriptionPhrase(String phrase);

    @Query("{\"multi_match\":{\"query\":\"?0\",\"fields\":[\"name^3\",\"description\"],\"fuzziness\":\"AUTO\"}}")
    List<Product> searchByNameOrDescriptionFuzzy(String searchTerm);


    /**
     * Pronalazi proizvode koji tačno odgovaraju zadatom imenu, ali ne sadrže određene reči u opisu.
     * Takođe, omogućava pronalaženje proizvoda koji mogu odgovarati drugim opcionalnim uslovima.
     *
     * @param name ime proizvoda koji se traži
     * @param mustNotTerms reči koje ne smeju biti prisutne u opisu proizvoda
     * @param shouldTerms opcionalni uslovi koji proizvode čine dodatno relevantnim
     * @return lista proizvoda koji zadovoljavaju dati kriterijum
     */
    @Query("{\"bool\":{\"must\":[{\"match\":{\"name\":\"?0\"}}],\"must_not\":[{\"match\":{\"description\":\"?1\"}}],\"should\":[{\"match\":{\"attribute\":\"?2\"}}]}}")
    List<Product> findByNameAndDescriptionNotAndOptional(String name, String mustNotTerms, String shouldTerms);

    /**
     * Pronalazi proizvode na osnovu specifičnih atributa i vrši agregaciju kako bi dobio statistiku o broju proizvoda po svakom atributu.
     *
     * @param attributeName ime atributa po kojem se vrši pretraga
     * @param attributeValue vrednost atributa koja se traži
     * @return lista proizvoda koji zadovoljavaju dati kriterijum
     */
    @Query("{\"nested\":{\"path\":\"attributes\",\"query\":{\"bool\":{\"must\":[{\"match\":{\"attributes.name\":\"?0\"}},{\"match\":{\"attributes.value\":\"?1\"}}]}}},\"aggs\":{\"attribute_stats\":{\"terms\":{\"field\":\"attributes.value.keyword\"}}}}")
    List<Product> findByNestedAttributeAndAggregate(String attributeName, String attributeValue);

    /**
     * Rangira proizvode na osnovu različitih kriterijuma, kao što su relevantnost prema pretraživanom pojmu ili pojava određenih reči u opisu.
     *
     * @param searchTerm pojam pretrage koji se koristi za rangiranje
     * @param boostTerms reči koje, kada se pojave u opisu, daju dodatni skor proizvodu
     * @return lista proizvoda rangiranih na osnovu datih kriterijuma
     */
    @Query("{\"function_score\":{\"query\":{\"multi_match\":{\"query\":\"?0\",\"fields\":[\"name^3\",\"description\"]}},\"functions\":[{\"filter\":{\"match\":{\"description\":\"?1\"}},\"weight\":2}],\"score_mode\":\"sum\",\"boost_mode\":\"multiply\"}}")
    List<Product> findByFunctionScore(String searchTerm, String boostTerms);
}
