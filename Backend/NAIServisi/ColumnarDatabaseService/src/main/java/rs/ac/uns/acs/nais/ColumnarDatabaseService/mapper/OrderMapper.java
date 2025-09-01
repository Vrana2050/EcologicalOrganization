package rs.ac.uns.acs.nais.ColumnarDatabaseService.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.factory.Mappers;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.dto.OrderByCustomerDTO;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.dto.OrderDTO;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.dto.OrderItemDTO;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.entity.OrderByCustomer;
import rs.ac.uns.acs.nais.ColumnarDatabaseService.entity.OrderItem;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    OrderMapper mapper = Mappers.getMapper(OrderMapper.class);

    @Mappings({
            @Mapping(target = "customerId", source = "dto.customerId"),
            @Mapping(target = "orderCreationTimestamp", source = "dto.orderCreationTimestamp"),
            @Mapping(target = "orderId", source = "dto.orderId"),
            @Mapping(target = "orderTotalPrice", source = "dto.orderTotalPrice"),
    })
    OrderByCustomer orderDTOtoOrderByCustomer(OrderDTO dto);

    @Mappings({
            @Mapping(target = "customerId", source = "order.customerId"),
            @Mapping(target = "orderCreationTimestamp", source = "order.orderCreationTimestamp"),
            @Mapping(target = "orderId", source = "order.orderId"),
            @Mapping(target = "orderTotalPrice", source = "order.orderTotalPrice"),
    })
    OrderByCustomerDTO orderByCustomertoDTO(OrderByCustomer order);

    @Mappings({
            @Mapping(target = "productName", source = "itemDto.productName"),
            @Mapping(target = "productId", source = "itemDto.productId"),
            @Mapping(target = "productPrice", source = "itemDto.productPrice"),
            @Mapping(target = "itemQuantity", source = "itemDto.itemQuantity"),
    })
    OrderItem orderItemDTOtoOrderItem(OrderItemDTO itemDto);

    @Mappings({
            @Mapping(target = "productName", source = "item.productName"),
            @Mapping(target = "productId", source = "item.productId"),
            @Mapping(target = "productPrice", source = "item.productPrice"),
            @Mapping(target = "itemQuantity", source = "item.itemQuantity"),
    })
    OrderItemDTO orderItemtoDTO(OrderItem item);

}
