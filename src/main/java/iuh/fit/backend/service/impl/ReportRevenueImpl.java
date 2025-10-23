package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.Order;
import iuh.fit.backend.model.enums.OrderStatus;
import iuh.fit.backend.repository.ReportRevenueRepository;
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

    @Override
    public Map<String, Object> getOverViewForAdmin() {
        Map<String, Object> report = new LinkedHashMap<>();
        List<Order> orders = orderRepository.findAll();

        long totalOrders = orders.size();
        long completedOrders = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();
        double totalRevenue = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .mapToDouble(Order::getTotalAmount)
                .sum();

        report.put("totalOrders", totalOrders);
        report.put("completedOrders", completedOrders);
        report.put("totalRevenue", totalRevenue);
        report.put("totalBooks", 5);
        report.put("totalCustomers", 3);

        return report;
    }

    // =========================================
    // 🚀 Báo cáo doanh thu linh hoạt
    // =========================================
    @Override
    public Map<String, Object> getRevenueReport(String type, Integer year, Integer month, String startDate, String endDate) {
        List<Map<String, Object>> chartData = new ArrayList<>();

        // Xác định dữ liệu biểu đồ
        switch (type.toLowerCase()) {
            case "month":
                chartData = getRevenueByMonth(year);
                break;
            case "monthnumber":
                chartData = getRevenueByDayOfMonth(year, month);
                break;
            case "year":
                chartData = getRevenueByYear();
                break;
            case "compare5years":
                chartData = getRevenue5Years();
                break;
            case "topdays":
                chartData = getTopRevenueDays();
                break;
            case "range":
                chartData = getRevenueByRange(startDate, endDate);
                break;
            default:
                chartData = Collections.emptyList();
        }

        // ✅ Tính tổng doanh thu và số đơn hoàn thành trong dữ liệu này
        double totalRevenue = 0;
        long completedOrders = 0;

        if (chartData != null && !chartData.isEmpty()) {
            for (Map<String, Object> item : chartData) {
                Object rev = item.get("revenue");
                if (rev != null) totalRevenue += Double.parseDouble(rev.toString());
            }

            completedOrders = orderRepository.countByStatus(OrderStatus.COMPLETED);
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalRevenue", totalRevenue);
        summary.put("completedOrders", completedOrders);

        // ✅ Gói trả về đúng định dạng frontend cần
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("chartData", chartData);
        result.put("summary", summary);
        return result;
    }

    // ========== Các hàm phụ thống kê ==========
    private List<Map<String, Object>> getRevenueByMonth(Integer year) {
        List<Object[]> results = orderRepository.sumRevenueByMonth(year);
        return mapResult(results, "Tháng");
    }

    private List<Map<String, Object>> getRevenueByDayOfMonth(Integer year, Integer month) {
        List<Object[]> results = orderRepository.sumRevenueByDay(year, month);
        return mapResult(results, "Ngày");
    }

    private List<Map<String, Object>> getRevenueByYear() {
        List<Object[]> results = orderRepository.sumRevenueByYear();
        return mapResult(results, "Năm");
    }

    private List<Map<String, Object>> getRevenue5Years() {
        int currentYear = LocalDate.now().getYear();
        int startYear = currentYear - 4;
        List<Object[]> results = orderRepository.sumRevenueInRangeYears(startYear, currentYear);
        return mapResult(results, "Năm");
    }

    private List<Map<String, Object>> getTopRevenueDays() {
        List<Object[]> results = orderRepository.findTopRevenueDays();
        return mapResult(results, "");
    }

    private List<Map<String, Object>> getRevenueByRange(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        List<Object[]> results = orderRepository.sumRevenueByRange(Date.valueOf(start), Date.valueOf(end));
        return mapResult(results, "");
    }

    private List<Map<String, Object>> mapResult(List<Object[]> results, String prefix) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("label", prefix + " " + row[0].toString());
            map.put("revenue", row[1]);
            list.add(map);
        }
        return list;
    }
}
