package iuh.fit.backend.service.impl;

import iuh.fit.backend.repository.ReportBookRepository;
import iuh.fit.backend.repository.ReportOrderBookStaffRepository;
import iuh.fit.backend.service.ReportBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportBookImpl implements ReportBookService {

    private final ReportBookRepository reportBookRepository;
    private final ReportOrderBookStaffRepository reportOrderBookStaffRepository;

    @Override
    public Map<String, Object> getBookReport(String type, Integer year, Integer month, String startDate, String endDate) {
        Map<String, Object> result = new HashMap<>();
        List<Object[]> rows = new ArrayList<>();

        try {
            // ======================================
            // ✅ 1️⃣ Thống kê sách bán chạy
            // ======================================
            switch (type) {
                case "year" -> {
                    if (year != null)
                        rows = reportBookRepository.sumBooksSoldByMonth(year);
                }
                case "month" -> {
                    if (year != null && month != null)
                        rows = reportBookRepository.sumBooksSoldByDay(year, month);
                }
                case "range" -> {
                    if (startDate != null && endDate != null) {
                        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                        LocalDateTime start = LocalDate.parse(startDate, fmt).atStartOfDay();
                        LocalDateTime end = LocalDate.parse(endDate, fmt).atTime(LocalTime.MAX);
                        rows = reportBookRepository.sumBooksSoldByRange(start, end);
                    }
                }
                default -> rows = reportBookRepository.topSellingBooks();
            }

            // ✅ Chuyển đổi dữ liệu
            List<Map<String, Object>> data = new ArrayList<>();
            long totalSold = 0;

            for (Object[] row : rows) {
                String title = row[0].toString();
                long total = ((Number) row[1]).longValue();
                totalSold += total;

                Map<String, Object> map = new LinkedHashMap<>();
                map.put("bookTitle", title);
                map.put("totalSold", total);
                data.add(map);
            }

            result.put("data", data);
            result.put("totalSold", totalSold);

            // ======================================
            // ✅ 2️⃣ Sách tồn kho thấp
            // ======================================
            List<Object[]> lowStockRows = reportBookRepository.findLowStockBooks();
            List<Map<String, Object>> lowStock = new ArrayList<>();

            for (Object[] row : lowStockRows) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("bookId", row[0]);
                map.put("bookTitle", row[1]);
                map.put("stock", row[2]);
                lowStock.add(map);
            }

            result.put("lowStockBooks", lowStock);
            result.put("lowStockCount", lowStock.size());

        } catch (Exception e) {
            result.put("error", "Lỗi thống kê sách: " + e.getMessage());
        }

        return result;
    }
// staff
@Override
public Map<String, Object> getBookReportForStaff(
        String staffId, String type, Integer year, Integer month,
        String startDate, String endDate
) {

    List<Object[]> rows;

    switch (type.toLowerCase()) {
        case "year" -> rows = reportOrderBookStaffRepository.topBooksByYear(staffId, year);
        case "month" -> rows = reportOrderBookStaffRepository.topBooksByMonth(staffId, year, month);
        case "range" -> {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
            rows = reportOrderBookStaffRepository.topBooksByRange(staffId, start, end);
        }
        default -> rows = reportOrderBookStaffRepository.topBooksAll(staffId);
    }

    List<Map<String, Object>> list = new ArrayList<>();
    for (Object[] r : rows) {
        list.add(Map.of(
                "title", r[0],
                "quantity", ((Number) r[1]).intValue()
        ));
    }

    return Map.of("topBooks", list);
}

}
