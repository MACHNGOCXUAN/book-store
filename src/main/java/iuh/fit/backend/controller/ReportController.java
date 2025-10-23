package iuh.fit.backend.controller;

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

    @GetMapping("/admin/overview")
    public Map<String, Object> getOverViewForAdmin() {
        return reportService.getOverViewForAdmin();
    }

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueReport(
            @RequestParam String type,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    )
    {
        Map<String, Object> result = reportService.getRevenueReport(type, year, month, startDate, endDate);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrderReport(
            @RequestParam String type,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        Map<String, Object> result = reportOrderService.getOrderReport(type, year, month, startDate, endDate);
        return ResponseEntity.ok(result);
    }



}
