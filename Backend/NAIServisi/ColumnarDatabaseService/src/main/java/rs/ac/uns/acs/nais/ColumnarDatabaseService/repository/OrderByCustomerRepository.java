package rs.ac.uns.acs.nais.ColumnarDatabaseService.repository;

import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.data.cassandra.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.entity.OrderByCustomer;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderByCustomerRepository extends CassandraRepository<OrderByCustomer, Long> {

    @Query("SELECT COUNT(*) FROM orders_by_customer WHERE customer_id = ?0")
    Long countOrdersByCustomerId(Long customerId);

    @Query("SELECT * FROM orders_by_customer WHERE customer_id = ?0")
    List<OrderByCustomer> getOrdersByCustomer(Long customerID);

    @Query("SELECT AVG(order_total_price) FROM orders_by_customer WHERE customer_id = ?0")
    Double findAverageOrderPriceForCustomer(Long customerID);

    @Query("SELECT * FROM orders_by_customer " +
            "WHERE order_creation_timestamp >= :startTime AND order_creation_timestamp < :endTime ALLOW FILTERING")
    List<OrderByCustomer> getOrdersBetweenDates(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);


}
