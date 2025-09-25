package DocumentPreparationService.exception;

import java.util.List;

public class InvalidRequestDataException extends RuntimeException {
    public InvalidRequestDataException(String message) {
        super(message);
    }
    public InvalidRequestDataException(List<String> messages) {
        super(String.join("; ", messages));
    }
}
