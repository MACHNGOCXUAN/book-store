package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.Order;
import iuh.fit.backend.model.enums.OrderStatus;
import iuh.fit.backend.repository.*;
import iuh.fit.backend.service.ReportRevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportRevenueImpl implements ReportRevenueService {

    private final ReportRevenueRepository orderRepository;
    private final BookRepository bookRepository;
    private final ReportCustomerRepository customerRepository;

    // =====================================================
    // 🔹 1️⃣ Tổng quan (overview) - hôm nay / tất cả
    // =====================================================
    @Override
    public Map<String, Object> getOverViewForAdmin(String mode) {
        Map<String, Object> report = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();
        List<Order> orders;

        // ✅ Mặc định: thống kê hôm nay
        if (mode == null || mode.isEmpty() || mode.equalsIgnoreCase("today")) {
            orders = orderRepository.findByOrderDateBetween(
                    Date.valueOf(today),
                    Date.valueOf(today)
            );
            report.put("mode", "Hôm nay");
        } else {
            // ✅ Nếu mode = "all" hoặc khác => thống kê toàn bộ
            orders = orderRepository.findAll();
            report.put("mode", "Tất cả");
        }

        // ✅ Đơn hàng & doanh thu
        long totalOrders = orders.size();
        long completedOrders = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();

        double totalRevenue = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .mapToDouble(Order::getTotalAmount)
                .sum();

        double totalProfit = totalRevenue * 0.2; // giả định 20% lợi nhuận

        // ✅ Dữ liệu thật từ DB
        long totalBooks = bookRepository.count();
        long totalCustomers;

        if (mode.equalsIgnoreCase("today")) {
            // chỉ đếm khách hàng đăng ký hôm nay
            totalCustomers = customerRepository.countByRegistrationDate(today);
        } else {
            // tổng khách hàng trong hệ thống
            totalCustomers = customerRepository.count();
        }

        report.put("date", today);
        report.put("totalOrders", totalOrders);
        report.put("completedOrders", completedOrders);
        report.put("totalRevenue", totalRevenue);
        report.put("totalProfit", totalProfit);
        report.put("totalBooks", totalBooks);
        report.put("totalCustomers", totalCustomers);

        return report;
    }

    // =====================================================
    // 🔹 2️⃣ Báo cáo doanh thu & lợi nhuận chi tiết
    // =====================================================
    @Override
    public Map<String, Object> getRevenueReport(String type, Integer year, Integer month, String startDate, String endDate) {
        List<Map<String, Object>> chartData = new ArrayList<>();

        // 🧭 Lấy dữ liệu theo loại
        switch (type.toLowerCase()) {
            case "month" -> chartData = getRevenueByMonth(year);
            case "monthnumber" -> chartData = getRevenueByDayOfMonth(year, month);
            case "year" -> chartData = getRevenueByYear();
            case "compare5years" -> chartData = getRevenue5Years();
            case "topdays" -> chartData = getTopRevenueDays();
            case "range" -> chartData = getRevenueByRange(startDate, endDate);
            default -> chartData = Collections.emptyList();
        }

        double totalRevenue = 0;
        double totalProfit = 0;
        long completedOrders = 0;

        if (!chartData.isEmpty()) {
            for (Map<String, Object> item : chartData) {
                Object rev = item.get("revenue");
                Object prof = item.get("profit");
                if (rev != null) totalRevenue += Double.parseDouble(rev.toString());
                if (prof != null) totalProfit += Double.parseDouble(prof.toString());
            }

            // ✅ Đếm số đơn hoàn thành phù hợp
            switch (type.toLowerCase()) {
                case "year", "month" -> completedOrders = orderRepository.countCompletedByYear(year);
                case "monthnumber" -> completedOrders = orderRepository.countCompletedByMonth(year, month);
                case "range" -> {
                    LocalDate start = LocalDate.parse(startDate);
                    LocalDate end = LocalDate.parse(endDate);
                    completedOrders = orderRepository.countCompletedByRange(Date.valueOf(start), Date.valueOf(end));
                }
                default -> completedOrders = orderRepository.countByStatus(OrderStatus.COMPLETED);
            }
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalRevenue", totalRevenue);
        summary.put("totalProfit", totalProfit);
        summary.put("completedOrders", completedOrders);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("chartData", chartData);
        result.put("summary", summary);
        return result;
    }

    // =====================================================
    // 🔹 3️⃣ Các hàm phụ cho từng loại thống kê
    // =====================================================
    private List<Map<String, Object>> getRevenueByMonth(Integer year) {
        return mapResult(orderRepository.sumRevenueByMonth(year), "Tháng");
    }

    private List<Map<String, Object>> getRevenueByDayOfMonth(Integer year, Integer month) {
        return mapResult(orderRepository.sumRevenueByDay(year, month), "Ngày");
    }

    private List<Map<String, Object>> getRevenueByYear() {
        return mapResult(orderRepository.sumRevenueByYear(), "Năm");
    }

    private List<Map<String, Object>> getRevenue5Years() {
        int currentYear = LocalDate.now().getYear();
        int startYear = currentYear - 4;
        return mapResult(orderRepository.sumRevenueInRangeYears(startYear, currentYear), "Năm");
    }

    private List<Map<String, Object>> getTopRevenueDays() {
        return mapResult(orderRepository.findTopRevenueDays(), "");
    }

    private List<Map<String, Object>> getRevenueByRange(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return mapResult(orderRepository.sumRevenueByRange(Date.valueOf(start), Date.valueOf(end)), "");
    }

    // =====================================================
    // 🔹 4️⃣ Map kết quả SQL → Object
    // =====================================================
    private List<Map<String, Object>> mapResult(List<Object[]> results, String prefix) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("label", prefix + " " + row[0]);
            map.put("revenue", row[1]);
            map.put("profit", row.length > 2 ? row[2] : 0.0);
            list.add(map);
        }
        return list;
    }
}
