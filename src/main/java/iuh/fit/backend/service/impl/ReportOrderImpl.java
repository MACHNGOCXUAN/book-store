package iuh.fit.backend.service.impl;

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

    @Override
    public Map<String, Object> getOrderReport(String type, Integer year, Integer month, String startDate, String endDate) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> data = new ArrayList<>();
        long totalOrders = 0L;

        List<Object[]> rows = new ArrayList<>();

        // ✅ Xử lý từng loại thống kê
        switch (type) {
            case "year" -> {
                if (year != null)
                    rows = reportOrderRepository.sumOrderByMonth(year);
            }
            case "month" -> {
                if (year != null && month != null)
                    rows = reportOrderRepository.sumOrderByDay(year, month);
            }
            case "range" -> {
                if (startDate != null && endDate != null) {
                    DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                    LocalDateTime start = LocalDate.parse(startDate, fmt).atStartOfDay();
                    LocalDateTime end = LocalDate.parse(endDate, fmt).atTime(LocalTime.MAX);
                    rows = reportOrderRepository.sumOrderByRange(start, end);
                }
            }
            default -> {
                result.put("message", "⚠️ Loại thống kê không hợp lệ!");
                return result;
            }
        }

        // ✅ Chuyển Object[] → Map
        for (Object[] row : rows) {
            if (row[0] == null || row[1] == null) continue;

            Map<String, Object> map = new HashMap<>();
            map.put("label", row[0]);
            // tháng / ngày / date
            map.put("status", row[1].toString()); // trạng thái đơn hàng
            map.put("totalOrders", row[2]);       // tổng số đơn theo trạng thái
            data.add(map);

            Number count = (Number) row[2];
            if (count != null) totalOrders += count.longValue();
        }

        result.put("data", data);
        result.put("totalOrders", totalOrders);
        return result;
    }
}
