package iuh.fit.backend.service;

import java.util.Map;

public interface ReportCustomerService {
    Map<String, Object> getCustomerReport(String type, Integer year, Integer month, String startDate, String endDate);

}
