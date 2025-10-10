package DocumentPreparationService.controller.Projekat;

import DocumentPreparationService.annotation.RequireRole;
import DocumentPreparationService.dto.analiza.AnalizaDto;
import DocumentPreparationService.dto.ProjekatDto;
import DocumentPreparationService.mapper.interfaces.IProjekatConverter;
import DocumentPreparationService.model.Projekat;
import DocumentPreparationService.service.interfaces.IProjekatService;
import DocumentPreparationService.service.interfaces.IStatistikaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/docPrep/project")
@RequireRole(value = "managerOrEmployee")
public class ProjekatController {
    @Autowired
    private IProjekatService projekatService;
    @Autowired
    private IProjekatConverter mapper;
    @Autowired
    private IStatistikaService statistikaService;

    @GetMapping("/{id}")
    public ResponseEntity<ProjekatDto> getById(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long id) {
        return projekatService.findById(id,userId)
                .map(entity -> ResponseEntity.ok(mapper.ToDto(entity)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
    @GetMapping("/eager/{id}")
    public ResponseEntity<ProjekatDto> getByIdEager(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long id) {
        return ResponseEntity.ok(mapper.ToDto(projekatService.findByIdEager(userId,id)));
    }

    @GetMapping
    public ResponseEntity<Set<ProjekatDto>> getAll(@RequestHeader(name = "X-USER-ID") Long userId) {
        Set<Projekat> entities = projekatService.findAll(userId);
        return ResponseEntity.ok(mapper.ToDtos(entities));
    }
    @GetMapping("/board/{id}")
    public ResponseEntity<ProjekatDto> getProjectBoardById(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long id) {
        return projekatService.findProjectBoardById(userId,id)
                .map(entity -> ResponseEntity.ok(mapper.ToDto(entity)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
    @GetMapping("/analysis/{projectId}")
    public ResponseEntity<AnalizaDto> getProjectReport(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long projectId) {
        return ResponseEntity.ok(statistikaService.getProjectAnalysis(userId,projectId));
    }
    @PatchMapping("/abandon/{projectId}")
    public ResponseEntity<Boolean> abandonProject(@RequestHeader(name = "X-USER-ID") Long userId, @PathVariable Long projectId) {
        return ResponseEntity.ok(projekatService.abandonProject(userId,projectId));
    }

}
