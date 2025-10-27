package iuh.fit.backend.service;

import iuh.fit.backend.model.ChatSession;
import iuh.fit.backend.model.Staff;
import iuh.fit.backend.dto.requests.StaffCreateDto;
import iuh.fit.backend.dto.requests.UserUpdateStatusDto;
import iuh.fit.backend.dto.requests.UserFilter;
import org.springframework.data.domain.Page;

import java.util.ArrayList;
import java.util.List;

public interface StaffService {
    Staff getStaffById(String staffId);
    ArrayList<Staff> getAllStaff();
    Page<Staff> getStaffsFilter(UserFilter userFilter);
    boolean addStaff(StaffCreateDto staffCreateDto);
    boolean updateStaff(StaffCreateDto staffCreateDto);
    boolean deleteStaff(String staffId);
    boolean updateStatusStaff(UserUpdateStatusDto staffUpdateStatusDto);
    List<ChatSession> getSessionsByStaffId(String staffId);
    List<ChatSession> getCustomersChattingWithStaff(String staffId);
    List<ChatSession> getStaffsChattingWithCustomer(String customerId);
}
