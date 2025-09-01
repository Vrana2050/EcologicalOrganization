package rs.ac.uns.acs.nais.ColumnarDatabaseService.entity;

import org.springframework.data.cassandra.core.cql.Ordering;
import org.springframework.data.cassandra.core.cql.PrimaryKeyType;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyColumn;
import org.springframework.data.cassandra.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("orders_by_customer")
public class OrderByCustomer {

    @PrimaryKeyColumn(name = "customer_id", type = PrimaryKeyType.PARTITIONED)
    private Long customerId;

    @PrimaryKeyColumn(name = "order_creation_timestamp", ordinal = 0, ordering = Ordering.DESCENDING)
    private LocalDateTime orderCreationTimestamp;

    @PrimaryKeyColumn(name = "order_id", ordinal = 1, ordering = Ordering.ASCENDING)
    private UUID orderId;

    @Column("order_total_price")
    private Double orderTotalPrice;

    public LocalDateTime getOrderCreationTimestamp() {
        return orderCreationTimestamp;
    }

    public void setOrderCreationTimestamp(LocalDateTime orderCreationTimestamp) {
        this.orderCreationTimestamp = orderCreationTimestamp;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public Double getOrderTotalPrice() {
        return orderTotalPrice;
    }

    public void setOrderTotalPrice(Double orderTotalPrice) {
        this.orderTotalPrice = orderTotalPrice;
    }
}