package iuh.fit.backend.controller;

import iuh.fit.backend.dto.requests.CreateOrderRequestDTO;
import iuh.fit.backend.dto.requests.OrderFilter;
import iuh.fit.backend.dto.requests.UpdateStatusOrderDTO;
import iuh.fit.backend.dto.responses.OrderFullDetailDTO;
import iuh.fit.backend.model.Order;
import iuh.fit.backend.model.User;
import iuh.fit.backend.service.OrderService;
import iuh.fit.backend.service.UserService;
import iuh.fit.backend.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
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
    private final JwtUtils jwtUtils;
    private final UserService userService;

    @PostMapping()
    public ResponseEntity<?> getAllOrderFilter(@RequestBody OrderFilter orderFilter, @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing Authorization header");
        }
        String token = authHeader.substring(7);
        String userId = jwtUtils.getUserIdFromToken(token);
        User user = userService.findUserById(userId);

        Page<OrderFullDetailDTO> ordersPage = orderService.getOrdersFilter(orderFilter, user);
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

    @PutMapping("/update-status")
    public  ResponseEntity<?> updateOrder(@RequestBody UpdateStatusOrderDTO updateStatusOrderDTO, @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing Authorization header");
        }
        String token = authHeader.substring(7);
        String userId = jwtUtils.getUserIdFromToken(token);
        User user = userService.findUserById(userId);
        boolean isSuccess = orderService.updateOrderStatus(updateStatusOrderDTO, user);
        if (isSuccess) {
            return ResponseEntity.ok(Map.of("message", "Cập nhật thành công!"));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật thất bại!"));
        }
    }

    @PostMapping("/createOrder")
    public ResponseEntity<?> createOrder(
            @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Missing Authorization header"));
        }

        String token = authHeader.substring(7);
        String userId = jwtUtils.getUserIdFromToken(token);

        User user = userService.findUserById(userId);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid token or user not found"));
        }

        try {
            OrderFullDetailDTO createdOrder = orderService.createOrder(request, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create order: " + e.getMessage()));
        }
    }
}