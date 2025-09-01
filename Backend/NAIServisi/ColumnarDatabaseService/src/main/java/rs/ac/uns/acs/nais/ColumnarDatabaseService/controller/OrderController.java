package rs.ac.uns.acs.nais.ColumnarDatabaseService.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.dto.OrderByCustomerDTO;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.dto.OrderDTO;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.service.OrderService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@RequestBody OrderDTO dto) {
        OrderDTO createdOrder = orderService.createOrder(dto);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @GetMapping("/count/{customerId}")
    public Long countOrdersByCustomerId(@PathVariable Long customerId) {
        return orderService.countOrdersByCustomerId(customerId);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderByCustomerDTO>> getOrdersByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable UUID orderId) {
        Optional<OrderDTO> orderDTOOptional = orderService.getOrderById(orderId);
        if (orderDTOOptional.isPresent()) {
            return ResponseEntity.ok(orderDTOOptional.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/average-price/customer/{customerId}")
    public ResponseEntity<Double> getOrderById(@PathVariable Long customerId) {
        return  ResponseEntity.ok(orderService.findAverageOrderPriceForCustomer(customerId));
    }

    @GetMapping("/today-orders")
    public  ResponseEntity<List<OrderByCustomerDTO>> getOrdersFromCurrentDay(){
        return ResponseEntity.ok(orderService.getOrdersFromCurrentDay());
    }
}
