package rs.ac.uns.acs.nais.ColumnarDatabaseService.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class OrderByCustomerDTO {


    private Long customerId;
    private LocalDateTime orderCreationTimestamp;
    private Double orderTotalPrice;
    private UUID orderId;

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public LocalDateTime getOrderCreationTimestamp() {
        return orderCreationTimestamp;
    }

    public void setOrderCreationTimestamp(LocalDateTime orderCreationTimestamp) {
        this.orderCreationTimestamp = orderCreationTimestamp;
    }

    public Double getOrderTotalPrice() {
        return orderTotalPrice;
    }

    public void setOrderTotalPrice(Double orderTotalPrice) {
        this.orderTotalPrice = orderTotalPrice;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }
}
