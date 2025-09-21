package rs.ac.uns.acs.nais.GatewayService.config;

import lombok.Data;
import lombok.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class UserManagementAuthGatewayFilterFactory
        extends AbstractGatewayFilterFactory<UserManagementAuthGatewayFilterFactory.Config> {

    private final WebClient userMgmtWebClient;
    private final Environment environment;

    // ✅ Jedini konstruktor: prima WebClient i poziva super(Config.class)
    public UserManagementAuthGatewayFilterFactory(WebClient userMgmtWebClient, Environment environment) {
        super(Config.class);
        this.userMgmtWebClient = userMgmtWebClient;
        this.environment = environment;
    }

    @Data
    public static class Config {
        private String validatePath = "/auth/user-credentials";
        private boolean propagateRoles = true;
    }

    @Override
    public GatewayFilter apply(Config config) {
        System.out.println("Applying UserManagementAuthGatewayFilterFactory with validatePath: " + config.getValidatePath());
        return (exchange, chain) -> {
            var req = exchange.getRequest();
            var auth = req.getHeaders().getFirst("Authorization");

            if (auth == null || auth.isBlank()) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            return userMgmtWebClient.get()
                    .uri(System.getenv().getOrDefault(
                            "USER_MGMT_AUTH_URL",
                            "http://localhost:8000/auth/user-credentials"
                    ))
                    .header("Authorization", auth)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, resp -> Mono.error(new RuntimeException("Auth failed")))
                    .bodyToMono(UserInfo.class)
                    .flatMap(userInfo -> {
                        ServerHttpRequest mutated = exchange.getRequest().mutate()
                                .header("X-USER-ID", userInfo.id())
                                .header("X-EMAIL", userInfo.email())
                                .header("X-USER-ROLE",userInfo.role())
                                .build();
                        return chain.filter(exchange.mutate().request(mutated).build());
                    })
                    .onErrorResume(ex -> {
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete();
                    });
        };
    }

    public record UserInfo(String email, String id, String role) {}

}

