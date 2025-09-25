package DocumentPreparationService.configuration;


import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.HandlerMethod;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.media.StringSchema;

@Configuration
public class SwaggerConfig {

    @Bean
    public OperationCustomizer addGlobalHeader() {
        return (Operation operation, HandlerMethod handlerMethod) -> {
            operation.addParametersItem(new Parameter()
                    .in(ParameterIn.HEADER.toString())
                    .name("X-USER-ROLE")
                    .required(false)
                    .schema(new StringSchema()));
            return operation;
        };
    }
}
