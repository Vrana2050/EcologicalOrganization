package DocumentPreparationService.repository;

import DocumentPreparationService.model.Dokument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.Set;

@NoRepositoryBean
public interface ICrudRepository<Entity,KeyType> extends JpaRepository<Entity, KeyType> {
}
