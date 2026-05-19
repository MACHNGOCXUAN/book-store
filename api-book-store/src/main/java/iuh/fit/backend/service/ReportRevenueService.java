package iuh.fit.backend.service;

import java.util.Map;

public interface ReportRevenueService {
    Map<String, Object> getOverViewForAdmin(String mode);
    Map<String, Object> getRevenueReport(String type, Integer year, Integer month, String startDate, String endDate);

    // nhân viên
    Map<String, Object> getOverViewForStaff(String userId, String mode);
//    Map<String, Object> getRevenueReportForStaff(String staffId);
//    Map<String, Object> getBooksSoldByStaff(String staffId);
    Map<String, Object> getStaffRevenue(
            String staffId,
            String type,
            Integer year,
            Integer month,
            String startDate,
            String endDate
    );

}
