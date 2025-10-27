package iuh.fit.backend.controller;

import iuh.fit.backend.service.ReportBookService;
import iuh.fit.backend.service.ReportCustomerService;
import iuh.fit.backend.service.ReportOrderService;
import iuh.fit.backend.service.ReportRevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportRevenueService reportService;
    private final ReportOrderService reportOrderService;
    private final ReportBookService reportBookService;
    private final ReportCustomerService reportCustomerService;

    // =====================================================
    // 🔹 1️⃣ Tổng quan (overview): hôm nay hoặc tất cả
    // =====================================================
    @GetMapping("/admin/overview")
    public ResponseEntity<Map<String, Object>> getOverViewForAdmin(
            @RequestParam(defaultValue = "today") String mode
    ) {
        Map<String, Object> result = reportService.getOverViewForAdmin(mode);
        return ResponseEntity.ok(result);
    }

    // =====================================================
    // 🔹 2️⃣ Báo cáo doanh thu
    // =====================================================
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport(
            @RequestParam String type,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        Map<String, Object> result = reportService.getRevenueReport(type, year, month, startDate, endDate);
        return ResponseEntity.ok(result);
    }

    // =====================================================
    // 🔹 3️⃣ Báo cáo đơn hàng
    // =====================================================
    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getOrderReport(
            @RequestParam String type,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        Map<String, Object> result = reportOrderService.getOrderReport(type, year, month, startDate, endDate);
        return ResponseEntity.ok(result);
    }

    // =====================================================
    // 🔹 4️⃣ Báo cáo sách
    // =====================================================
    @GetMapping("/books")
    public ResponseEntity<Map<String, Object>> getBookReport(
            @RequestParam(defaultValue = "year") String type,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        Map<String, Object> result = reportBookService.getBookReport(type, year, month, startDate, endDate);
        return ResponseEntity.ok(result);
    }

    // =====================================================
    // 🔹 5️⃣ Báo cáo khách hàng
    // =====================================================
    @GetMapping("/customers")
    public ResponseEntity<Map<String, Object>> getCustomerReport(
            @RequestParam(defaultValue = "year") String type,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        Map<String, Object> result = reportCustomerService.getCustomerReport(type, year, month, startDate, endDate);
        return ResponseEntity.ok(result);
    }
}
