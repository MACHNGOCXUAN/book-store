package iuh.fit.backend.controller;

import iuh.fit.backend.dto.requests.OrderFilter;
import iuh.fit.backend.dto.responses.OrderFullDetailDTO;
import iuh.fit.backend.model.Order;
import iuh.fit.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping()
    public ResponseEntity<?> getAllOrderFilter(@RequestBody OrderFilter orderFilter) {
        Page<OrderFullDetailDTO> ordersPage = orderService.getOrdersFilter(orderFilter);
        List<OrderFullDetailDTO> orders = ordersPage.getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("data", orders);

        Map<String, Object> paging = new HashMap<>();
        paging.put("curPage", ordersPage.getNumber() + 1);
        paging.put("limitPage", ordersPage.getSize());
        paging.put("totalRows", ordersPage.getTotalElements());
        paging.put("totalPage", ordersPage.getTotalPages());

        response.put("paging", paging);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable("id") String id) {
        System.out.println("getOrderById: " + id);
        OrderFullDetailDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }
}