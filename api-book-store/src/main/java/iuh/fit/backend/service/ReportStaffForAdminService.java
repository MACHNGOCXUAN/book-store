package iuh.fit.backend.service;

import java.util.Map;

public interface ReportStaffForAdminService {

    Map<String, Object> getTopStaff(String type, Integer year, Integer month, String startDate, String endDate);

}
