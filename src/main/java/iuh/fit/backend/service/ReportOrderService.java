package iuh.fit.backend.service;

import org.springframework.stereotype.Service;

import java.util.Map;
public interface ReportOrderService {
    Map<String, Object> getOrderReport(String type, Integer year, Integer month, String startDate, String endDate);
    Map<String, Object> getOrderReportForStaff(String staffId, String type, Integer year, Integer month, String startDate, String endDate);
}

