package DocumentPreparationService.interceptor;

import DocumentPreparationService.annotation.RequireRole;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RoleInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (handler instanceof HandlerMethod) {
            HandlerMethod method = (HandlerMethod) handler;
            RequireRole requireRole = method.getBeanType().getAnnotation(RequireRole.class);
            if (requireRole != null) {
                String userRole = request.getHeader("X-User-Role");
                if (userRole == null || !requireRole.value().toLowerCase().contains(userRole.toLowerCase())) {
                    response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unauthorized");
                    return false;
                }
            }
        }
        return true;
    }
}
