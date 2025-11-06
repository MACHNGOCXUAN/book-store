package iuh.fit.backend.service.impl;

import iuh.fit.backend.repository.OrderDetailRepository;
import iuh.fit.backend.repository.OrderRepository;
import iuh.fit.backend.repository.ReportOrderRepository;
import iuh.fit.backend.service.ReportOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportOrderImpl implements ReportOrderService {

    private final ReportOrderRepository reportOrderRepository;
private  final OrderDetailRepository orderDetailRepository;
private final OrderRepository orderRepository;
    @Override
    public Map<String, Object> getOrderReport(String type, Integer year, Integer month, String startDate, String endDate) {
        Map<String, Object> result = new HashMap<>();
        List<Object[]> rows = new ArrayList<>();

        try {
            switch (type) {
                // ======================================
                // ✅ 1️⃣ Thống kê đơn hàng theo NĂM
                // ======================================
                case "year" -> {
                    if (year != null)
                        rows = reportOrderRepository.sumOrderByMonth(year);
                }

                // ======================================
                // ✅ 2️⃣ Thống kê đơn hàng theo THÁNG
                // ======================================
                case "month" -> {
                    if (year != null && month != null)
                        rows = reportOrderRepository.sumOrderByDay(year, month);
                }

                // ======================================
                // ✅ 3️⃣ Thống kê đơn hàng theo KHOẢNG THỜI GIAN
                // ======================================
                case "range" -> {
                    if (startDate != null && endDate != null) {
                        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                        LocalDateTime start = LocalDate.parse(startDate, fmt).atStartOfDay();
                        LocalDateTime end = LocalDate.parse(endDate, fmt).atTime(LocalTime.MAX);
                        rows = reportOrderRepository.sumOrderByRange(start, end);
                    }
                }

                // ======================================
                // ✅ 4️⃣ Thống kê theo THỂ LOẠI SÁCH
                // ======================================
                case "category" -> {
                    // Lọc theo tháng cụ thể
                    if (year != null && month != null) {
                        rows = reportOrderRepository.sumBooksByCategoryInMonth(year, month);
                    }
                    // Lọc theo năm
                    else if (year != null) {
                        rows = reportOrderRepository.sumBooksByCategoryInYear(year);
                    }
                    // Lọc theo khoảng thời gian
                    else if (startDate != null && endDate != null) {
                        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                        LocalDateTime start = LocalDate.parse(startDate, fmt).atStartOfDay();
                        LocalDateTime end = LocalDate.parse(endDate, fmt).atTime(LocalTime.MAX);
                        rows = reportOrderRepository.sumBooksByCategoryInRange(start, end);
                    }

                    // ✅ Không có dữ liệu
                    if (rows.isEmpty()) {
                        result.put("data", Collections.emptyList());
                        result.put("totalSold", 0);
                        return result;
                    }

                    // ✅ Chuyển dữ liệu cho frontend
                    List<Map<String, Object>> categoryData = new ArrayList<>();
                    long totalSold = 0;

                    for (Object[] row : rows) {
                        String category = row[0] != null ? row[0].toString() : "Không xác định";
                        long total = ((Number) row[1]).longValue();
                        totalSold += total;

                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("category", category);
                        map.put("totalSold", total);
                        categoryData.add(map);
                    }

                    result.put("data", categoryData);
                    result.put("totalSold", totalSold);
                    return result;
                }

                // ======================================
                // ⚠️ Loại thống kê không hợp lệ
                // ======================================
                default -> {
                    result.put("message", "⚠️ Loại thống kê không hợp lệ!");
                    return result;
                }
            }

            // ======================================
            // ✅ Xử lý dữ liệu thống kê ĐƠN HÀNG
            // ======================================
            Map<String, Map<String, Long>> grouped = new LinkedHashMap<>();

            for (Object[] row : rows) {
                if (row[0] == null || row[1] == null) continue;

                String label = String.valueOf(row[0]);
                String status = row[1].toString().toUpperCase();
                Long total = ((Number) row[2]).longValue();

                grouped.putIfAbsent(label, new LinkedHashMap<>());
                grouped.get(label).put(status, total);
            }

            // ✅ Các trạng thái cần hiển thị
            List<String> allStatuses = List.of("PENDING", "PROCESSING", "COMPLETED", "CANCELLED");

            // ✅ Thêm 0 cho trạng thái thiếu
            for (Map<String, Long> map : grouped.values()) {
                for (String s : allStatuses) {
                    map.putIfAbsent(s, 0L);
                }
            }

            // ✅ Chuyển sang danh sách cho frontend
            List<Map<String, Object>> data = new ArrayList<>();
            for (var entry : grouped.entrySet()) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("label", entry.getKey());
                map.putAll(entry.getValue());
                data.add(map);
            }

            // ✅ Tổng đơn hàng
            long totalOrders = rows.stream()
                    .filter(r -> r.length > 2 && r[2] != null)
                    .mapToLong(r -> ((Number) r[2]).longValue())
                    .sum();

            result.put("data", data);
            result.put("totalOrders", totalOrders);
            return result;

        } catch (Exception e) {
            result.put("error", "Lỗi xử lý thống kê: " + e.getMessage());
            return result;
        }
    }
    // staff
    public Map<String, Object> getOrderReportForStaff(String staffId, String type, Integer year, Integer month, String startDate, String endDate) {

        List<Map<String, Object>> chart = new ArrayList<>();

        if (type.equals("month")) {
            year = (year == null) ? LocalDate.now().getYear() : year;
            List<Object[]> rs = orderRepository.sumOrdersByMonthInYearForStaff(staffId, year);

            rs.forEach(row -> chart.add(Map.of(
                    "label", "Tháng " + row[0],
                    "orders", ((Number) row[1]).intValue()
            )));
        }

        else if (type.equals("monthnumber")) {
            year = (year == null) ? LocalDate.now().getYear() : year;
            List<Object[]> rs = orderRepository.sumOrdersByDayInMonthForStaff(staffId, year, month);

            rs.forEach(row -> chart.add(Map.of(
                    "label", "Ngày " + row[0],
                    "orders", ((Number) row[1]).intValue()
            )));
        }

        else if (type.equals("range")) {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
            List<Object[]> rs = orderRepository.sumOrdersByDateRangeForStaff(staffId, start, end);

            rs.forEach(row -> chart.add(Map.of(
                    "label", row[0].toString(),
                    "orders", ((Number) row[1]).intValue()
            )));
        }

        return Map.of("chartData", chart);
    }


}
