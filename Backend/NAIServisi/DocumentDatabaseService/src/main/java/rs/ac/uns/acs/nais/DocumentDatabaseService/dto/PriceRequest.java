package rs.ac.uns.acs.nais.DocumentDatabaseService.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PriceRequest {
    private double value;
    private LocalDate startDate;
    private LocalDate endDate;
    
	public double getValue() {
		return value;
	}
	public void setValue(double value) {
		this.value = value;
	}
	public LocalDate getStartDate() {
		return startDate;
	}
	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}
	public LocalDate getEndDate() {
		return endDate;
	}
	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}

    
}
