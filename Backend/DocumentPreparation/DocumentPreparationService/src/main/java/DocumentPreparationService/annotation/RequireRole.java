package DocumentPreparationService.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE}) // možeš je staviti i na klasu i na metodu
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    String value();
}
