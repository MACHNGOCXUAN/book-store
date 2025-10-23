package iuh.fit.backend.service;

import java.util.Map;

public interface ReportRevenueService {
    Map<String, Object> getOverViewForAdmin();
    Map<String, Object> getRevenueReport(String type, Integer year, Integer month, String startDate, String endDate);
}
