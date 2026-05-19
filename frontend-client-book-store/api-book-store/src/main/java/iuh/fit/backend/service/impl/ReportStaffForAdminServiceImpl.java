package iuh.fit.backend.service.impl;

import iuh.fit.backend.repository.ReportStaffForAdminReponsitory;
import iuh.fit.backend.service.ReportStaffForAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportStaffForAdminServiceImpl implements ReportStaffForAdminService {

    private final ReportStaffForAdminReponsitory repo;

    @Override
    public Map<String, Object> getTopStaff(String type, Integer year, Integer month, String startDate, String endDate) {

        List<Object[]> raw;

        switch (type.toLowerCase()) {
            case "year" -> {
                year = (year == null) ? LocalDate.now().getYear() : year;
                raw = repo.topStaffByYear(year);
            }
            case "month" -> {
                year = (year == null) ? LocalDate.now().getYear() : year;
                month = (month == null) ? LocalDate.now().getMonthValue() : month;
                raw = repo.topStaffByMonth(year, month);
            }
            case "range" -> {
                LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
                LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
                raw = repo.topStaffByRange(start, end);
            }
            default -> raw = repo.topStaffAllTime(); // "all"
        }

        List<Map<String, Object>> resultList = new ArrayList<>();
        int rank = 1;

        for (Object[] row : raw) {
            resultList.add(Map.of(
                    "rank", rank++,
                    "staffId", row[0],
                    "staffName", row[1],
                    "revenue", ((Number) row[2]).doubleValue()
            ));
        }

        return Map.of("topStaff", resultList);
    }
}
