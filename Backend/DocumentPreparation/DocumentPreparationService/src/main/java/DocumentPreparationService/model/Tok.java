package DocumentPreparationService.model;

import DocumentPreparationService.exception.InvalidRequestDataException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "tok")
public class Tok {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "naziv")
    private String naziv;

    @OneToMany(mappedBy = "tok", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TokStatus> statusi = new HashSet<>();
    public void setStatusi(Set<TokStatus> statusi) {
        this.statusi.clear();
        for(TokStatus tokStatus : statusi) {
            this.statusi.add(tokStatus);
            tokStatus.setTok(this);
        }
    }
    public Tok(){}
    public Tok(Long id, String naziv, Set<TokStatus> statusi) {
        validate();
    }
    public void validate(){
        if(this.naziv == null || this.naziv.isEmpty()) throw new InvalidRequestDataException("Name is required");
        if(this.statusi == null || this.statusi.isEmpty()) throw new InvalidRequestDataException("Status is required");
        boolean hasBeggining =false;
        boolean hasEnding =false;
        for(TokStatus tokStatus : statusi) {
            tokStatus.validate();
          if(tokStatus.getPrethodnoStanje()==null)
          {
              if(hasBeggining==true){
                  throw new InvalidRequestDataException("Invalid workflow");
              }
              hasBeggining=true;
          }
          else if(tokStatus.getSledeceStanje()==null){
              if(hasEnding==true){
                  throw new InvalidRequestDataException("Invalid workflow");
              }
              hasEnding=true;
          }
        }
    }
}