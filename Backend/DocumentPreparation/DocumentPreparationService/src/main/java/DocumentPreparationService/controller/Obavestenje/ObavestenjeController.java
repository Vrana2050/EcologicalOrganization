package DocumentPreparationService.controller.Obavestenje;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.dto.ObavestenjeDto;
import DocumentPreparationService.mapper.interfaces.IObavestenjeConverter;
import DocumentPreparationService.model.Obavestenje;
import DocumentPreparationService.service.interfaces.IObavestenjeService;
import jakarta.ws.rs.PATCH;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/docPrep/notification")
@RequireRole(value = "managerOrEmployee")

public class ObavestenjeController {
    @Autowired
    private IObavestenjeService obavestenjeService;
    @Autowired
    private IObavestenjeConverter mapper;
    @PATCH
    public ResponseEntity<ObavestenjeDto> markAsRead(@RequestHeader(name = "X-USER-ID") Long userId, @RequestBody ObavestenjeDto dto) {
        Obavestenje savedEntity = obavestenjeService.markAsRead(mapper.ToEntity(dto), userId);
        return new ResponseEntity<>(mapper.ToDto(savedEntity), HttpStatus.CREATED);
    }
    @GetMapping("/{id}")
    public ResponseEntity<ObavestenjeDto> getById(@PathVariable Long id) {
        return obavestenjeService.findById(id)
                .map(entity -> ResponseEntity.ok(mapper.ToDto(entity)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
    @GetMapping
    public ResponseEntity<Set<ObavestenjeDto>> getAllForUser(@RequestHeader(name = "X-USER-ID") Long userId) {
        Set<Obavestenje> entities = obavestenjeService.findAllForUser(userId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }


}
