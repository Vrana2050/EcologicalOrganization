package rs.ac.uns.acs.nais.ColumnarDatabaseService.entity;

import org.springframework.data.cassandra.core.cql.Ordering;
import org.springframework.data.cassandra.core.cql.PrimaryKeyType;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyColumn;
import org.springframework.data.cassandra.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;


@Table("order_items")
public class OrderItem {

    @PrimaryKeyColumn(name = "order_id", type = PrimaryKeyType.PARTITIONED)
    private UUID orderId;

    @PrimaryKeyColumn(name = "product_name", ordinal = 0, ordering = Ordering.ASCENDING)
    private String productName;

    @PrimaryKeyColumn(name = "product_id", ordinal = 1, ordering = Ordering.ASCENDING)
    private String productId;

    @Column("product_price")
    private Double productPrice;

    @Column("item_quantity")
    private int itemQuantity;

    @Column("order_creation_timestamp")
    private LocalDateTime orderCreationTimestamp;

    @Column("order_total_price")
    private Double orderTotalPrice;

    @Column("customer_id")
    private Long customerId;

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public Double getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(Double productPrice) {
        this.productPrice = productPrice;
    }

    public int getItemQuantity() {
        return itemQuantity;
    }

    public void setItemQuantity(int itemQuantity) {
        this.itemQuantity = itemQuantity;
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

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
}