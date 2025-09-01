package rs.ac.uns.acs.nais.ColumnarDatabaseService.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrderDTO {

    private Long customerId;
    private List<OrderItemDTO> items;
    // Redis ne podržava keširanje objekata koji sadrže LocalDateTime direktno.
    // Zbog toga koristimo JSON serializer i deserializer za LocalDateTime
    // i formatiramo LocalDateTime kao string prilikom serijalizacije
    // kako bi se omogućilo keširanje u Redis-u.
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime orderCreationTimestamp;
    private Double orderTotalPrice;
    private UUID orderId;

    public List<OrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }

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
