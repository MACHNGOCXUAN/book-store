package iuh.fit.backend.service;

import java.util.Map;

public interface ReportBookService {
    Map<String, Object> getBookReport(String type, Integer year, Integer month, String startDate, String endDate);

}
