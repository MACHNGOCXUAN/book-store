package iuh.fit.backend.service.impl;

import iuh.fit.backend.dto.responses.OrderFullDetailDTO;
import iuh.fit.backend.model.*;
import iuh.fit.backend.repository.OrderRepository;
import iuh.fit.backend.repository.PaymentRepository;
import iuh.fit.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    private OrderFullDetailDTO convertToOrderFullDetailDTO(Order order) {
        OrderFullDetailDTO dto = new OrderFullDetailDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());

        if (order.getCustomer() != null) {
            OrderFullDetailDTO.CustomerInfoDTO customerDTO = new OrderFullDetailDTO.CustomerInfoDTO();
            customerDTO.setUserId(order.getCustomer().getUserId());
            customerDTO.setFullName(order.getCustomer().getFullName());
            customerDTO.setPhoneNumber(order.getCustomer().getPhoneNumber());
            customerDTO.setEmail(order.getCustomer().getEmail());
            customerDTO.setAddress(order.getCustomer().getAddress());
            dto.setCustomer(customerDTO);
        }

        if (order.getPayments() != null) {
            OrderFullDetailDTO.PaymentInfoDTO paymentDTO = new OrderFullDetailDTO.PaymentInfoDTO();

            Payment payment = new Payment();

            paymentDTO.setPaymentId(payment.getPaymentId());
            paymentDTO.setAmount(payment.getAmount());
            paymentDTO.setMethod(payment.getMethod());
            dto.setPayment(paymentDTO);
        }

        return dto;
    }
}