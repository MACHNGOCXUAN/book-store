package iuh.fit.backend.controller;

import iuh.fit.backend.model.Order;
import iuh.fit.backend.repository.OrderRepository;
import iuh.fit.backend.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportRevenueService reportService;
    private final ReportOrderService reportOrderService;
    private final ReportBookService reportBookService;
    private final ReportCustomerService reportCustomerService;
    private  final OrderRepository orderRepository;
    private final ReportStaffForAdminService reportStaffForAdminService;

    // =====================================================
    // 🔹 1️⃣ Tổng quan (overview): hôm nay hoặc tất cả
    // =====================================================
    @GetMapping("/admin/overview")
    public ResponseEntity<Map<String, Object>> getOverViewForAdmin(
            @RequestParam(defaultValue = "today") String mode
    ) {
        System.out.println("đã vô tới đây");
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
// 🔥 Top nhân viên doanh thu cao (ADMIN)
// =====================================================
    @GetMapping("/admin/staff")
    public ResponseEntity<Map<String, Object>> getTopStaffForAdmin(
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        Map<String, Object> result = reportStaffForAdminService.getTopStaff(type, year, month, startDate, endDate);
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

    // report staff
    // =====================================================
// 🔹 1️⃣ Tổng quan cho nhân viên (overview cho STAFF)
// =====================================================
    @GetMapping("/staff/overview")
    public ResponseEntity<Map<String, Object>> getOverViewForStaff(
            @RequestParam String userId,
            @RequestParam(defaultValue = "today") String mode
    ) {
        Map<String, Object> result = reportService.getOverViewForStaff(userId, mode);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/staff/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueForStaff(
            @RequestParam String staffId,
            @RequestParam String type,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        Map<String, Object> result = reportService.getStaffRevenue(staffId, type, year, month, startDate, endDate);
        return ResponseEntity.ok(result);
    }
@GetMapping("/staff/orders")
public ResponseEntity<Map<String, Object>> getOrderReportForStaff(
        @RequestParam String staffId,
        @RequestParam String type,
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate
) {
    Map<String, Object> result = reportOrderService.getOrderReportForStaff(staffId, type, year, month, startDate, endDate);
    System.out.println("kết quả là"+result);
    return ResponseEntity.ok(result);
}
    @GetMapping("/staff/books")
    public ResponseEntity<Map<String, Object>> getBookReportForStaff(
            @RequestParam String staffId,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        Map<String, Object> result = reportBookService.getBookReportForStaff(
                staffId, type, year, month, startDate, endDate
        );
        return ResponseEntity.ok(result);
    }


}
