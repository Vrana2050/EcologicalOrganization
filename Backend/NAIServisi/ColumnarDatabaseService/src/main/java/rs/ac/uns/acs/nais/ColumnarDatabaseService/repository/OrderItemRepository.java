package rs.ac.uns.acs.nais.ColumnarDatabaseService.repository;

import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.data.cassandra.repository.Query;
import org.springframework.stereotype.Repository;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.entity.OrderItem;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends CassandraRepository<OrderItem, UUID> {

    @Query("SELECT * FROM order_items WHERE order_id = ?0")
    List<OrderItem> findByOrderID(UUID orderId);
}