package rs.ac.uns.acs.nais.ColumnarDatabaseService.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.stereotype.Service;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.dto.OrderByCustomerDTO;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.dto.OrderDTO;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.dto.OrderItemDTO;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.entity.OrderItem;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.repository.OrderByCustomerRepository;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.repository.OrderItemRepository;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static rs.ac.uns.acs.nais.ColumnarDatabaseService.mapper.OrderMapper.mapper;

@Service
@EnableCaching // Anotacija koja omogućava keširanje u okviru servisa
public class OrderService {

    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private OrderByCustomerRepository orderByCustomerRepository;


    /*
        Anotacija omogućava keširanje povratne vrednosti.
        Metoda će se uvek izvršiti i rezultat će se keširati,
        bez obzira na prethodno postojanje keša.
    */
    @CachePut(value = "orders" ,key = "#orderDTO.orderId")
    public OrderDTO createOrder(OrderDTO orderDTO) {

        orderDTO.setOrderCreationTimestamp(LocalDateTime.now(Clock.systemUTC()));
        orderDTO.setOrderId(UUID.randomUUID());

        orderByCustomerRepository.save(mapper.orderDTOtoOrderByCustomer(orderDTO));

        for (OrderItemDTO itemDTO : orderDTO.getItems()){
            OrderItem item = mapper.orderItemDTOtoOrderItem(itemDTO);
            item.setOrderId(orderDTO.getOrderId());
            item.setOrderCreationTimestamp(orderDTO.getOrderCreationTimestamp());
            item.setOrderTotalPrice(orderDTO.getOrderTotalPrice());
            item.setCustomerId(orderDTO.getCustomerId());
            orderItemRepository.save(item);
        }

        return orderDTO;
    }

    public Long countOrdersByCustomerId(Long customerID){
        return orderByCustomerRepository.countOrdersByCustomerId(customerID);
    }

    public List<OrderByCustomerDTO> getOrdersByCustomer(Long customerID){
        return orderByCustomerRepository.getOrdersByCustomer(customerID)
                .stream()
                .map(mapper::orderByCustomertoDTO)
                .collect(Collectors.toList());
    }

    /*
        Anotacija omogućava dobavljanje porudžbina iz keša ukoliko keširana vrednost postoji.
        Ukoliko ne postoji, vrednost se dobavlja iz repozitorijuma, a zatim se kešira.
        parametri:
            -value: naziv keša
            -key: ključ keša postavljen na prosleđeni orderId
            -condition: dodatni uslovi koji se proveravaju pre keširanja
        */
    @Cacheable(value = "orders", key = "#orderId", condition = "#orderId!=null")
    public Optional<OrderDTO> getOrderById(UUID orderId) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderID(orderId);

        if (orderItems.isEmpty()) {
            return Optional.empty();
        } else {
            OrderDTO orderDTO = mapOrderItemsToOrderDTO(orderItems);
            return Optional.of(orderDTO);
        }
    }

    private OrderDTO mapOrderItemsToOrderDTO(List<OrderItem> orderItems) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setOrderId(orderItems.get(0).getOrderId());
        orderDTO.setOrderCreationTimestamp(orderItems.get(0).getOrderCreationTimestamp());
        orderDTO.setOrderTotalPrice(orderItems.get(0).getOrderTotalPrice());
        orderDTO.setCustomerId(orderItems.get(0).getCustomerId());

        orderDTO.setItems(orderItems.stream()
                .map(mapper::orderItemtoDTO)
                .collect(Collectors.toList()));

        return orderDTO;
    }

    public Double findAverageOrderPriceForCustomer(Long customerID){
        return orderByCustomerRepository.findAverageOrderPriceForCustomer(customerID);
    }

    public List<OrderByCustomerDTO> getOrdersFromCurrentDay(){
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);


        return orderByCustomerRepository.getOrdersBetweenDates(startOfDay, endOfDay)
                .stream()
                .map(mapper::orderByCustomertoDTO)
                .collect(Collectors.toList());
    }
}
