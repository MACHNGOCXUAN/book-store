package iuh.fit.backend.service.impl;

import iuh.fit.backend.repository.ReportCustomerRepository;
import iuh.fit.backend.service.ReportCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportCustomerImpl implements ReportCustomerService {

    private final ReportCustomerRepository reportCustomerRepository;

    @Override
    public Map<String, Object> getCustomerReport(String type, Integer year, Integer month, String startDate, String endDate) {
        Map<String, Object> result = new HashMap<>();
        List<Object[]> rows = new ArrayList<>();

        try {
            // ======================================
            // ✅ 1️⃣ Thống kê KH mới theo thời gian
            // ======================================
            switch (type) {
                case "year" -> {
                    if (year != null)
                        rows = reportCustomerRepository.countNewCustomersByMonth(year);
                }
                case "month" -> {
                    if (year != null && month != null)
                        rows = reportCustomerRepository.countNewCustomersByDay(year, month);
                }
                case "range" -> {
                    if (startDate != null && endDate != null) {
                        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                        LocalDateTime start = LocalDate.parse(startDate, fmt).atStartOfDay();
                        LocalDateTime end = LocalDate.parse(endDate, fmt).atTime(LocalTime.MAX);
                        rows = reportCustomerRepository.countNewCustomersByRange(start, end);
                    }
                }
                default -> rows = reportCustomerRepository.countNewCustomersByMonth(LocalDate.now().getYear());
            }

            // ✅ Tổng hợp dữ liệu KH mới
            List<Map<String, Object>> newCustomers = new ArrayList<>();
            long totalNew = 0;
            for (Object[] row : rows) {
                String label = row[0].toString();
                long total = ((Number) row[1]).longValue();
                totalNew += total;

                Map<String, Object> map = new LinkedHashMap<>();
                map.put("label", label);
                map.put("total", total);
                newCustomers.add(map);
            }

            // ======================================
            // ✅ 2️⃣ Top KH có nhiều đơn hàng nhất
            // ======================================
            List<Object[]> topCustomers = reportCustomerRepository.topCustomersByOrderCount();
            List<Map<String, Object>> topList = new ArrayList<>();
            for (Object[] row : topCustomers) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("name", row[0]);
                map.put("totalOrders", row[1]);
                topList.add(map);
            }

            // ======================================
            // ✅ 3️⃣ Tổng hợp kết quả trả về
            // ======================================
            result.put("newCustomers", newCustomers);
            result.put("totalNewCustomers", totalNew);
            result.put("topCustomers", topList);
            result.put("totalCustomers", reportCustomerRepository.count());

        } catch (Exception e) {
            result.put("error", "Lỗi thống kê khách hàng: " + e.getMessage());
        }

        return result;
    }
}
