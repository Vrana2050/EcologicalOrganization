package DocumentPreparationService.model;

import DocumentPreparationService.exception.InvalidRequestDataException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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

    @OneToMany(mappedBy = "tok", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<TokStatus> statusi = new HashSet<>();
    public void setStatusi(Set<TokStatus> statusi) {
        this.statusi.clear();
        if(statusi.stream().allMatch(status -> status.getId()!=null)) {
            for(TokStatus tokStatus : statusi) {
                this.statusi.add(tokStatus);
                tokStatus.setTok(this);
            }
        }
        else {
            connectStatusi(statusi);
        }
    }
    private void connectStatusi(Set<TokStatus> statusi) {
        Map<Long, TokStatus> byRefId = statusi.stream()
                .collect(Collectors.toMap(TokStatus::getRefId, ts -> ts));

        for (TokStatus tokStatus : statusi) {
            if (tokStatus.getSledeceStanje() != null) {
                tokStatus.setSledeceStanje(byRefId.get(tokStatus.getSledeceStanje().getRefId()));
            }
            if (tokStatus.getStatusNakonOdbijanja() != null) {
                tokStatus.setStatusNakonOdbijanja(byRefId.get(tokStatus.getStatusNakonOdbijanja().getRefId()));
            }
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
        validateWorkflow();
    }

    private void validateWorkflow() {
        boolean hasEnding =false;
        for(TokStatus tokStatus : statusi) {
            tokStatus.validate();
            if(tokStatus.getSledeceStanje()==null){
                if(hasEnding==true){
                    throw new InvalidRequestDataException("Invalid workflow");
                }
                hasEnding=true;
            }
        }
        if(!hasEnding) throw new InvalidRequestDataException("Invalid workflow");
    }

    public void update(Tok newTok) {
        this.naziv = newTok.getNaziv();
        if(!newTok.getStatusi().isEmpty()) {
            setStatusi(newTok.getStatusi());
        }
        validate();
    }
}