package rs.ac.uns.acs.nais.GatewayService.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {  // sada postoji bean Builder-a
        return WebClient.builder();
    }

    @Bean
    public WebClient userMgmtWebClient(WebClient.Builder builder) {
        return builder.baseUrl("http://localhost:8000/").build();
    }
}
