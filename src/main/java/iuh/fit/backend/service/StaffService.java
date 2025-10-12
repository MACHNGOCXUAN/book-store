package iuh.fit.backend.service;

import iuh.fit.backend.model.Staff;
import iuh.fit.backend.requests.StaffCreateDto;
import iuh.fit.backend.requests.UserUpdateStatusDto;
import iuh.fit.backend.requests.UserFilter;
import org.springframework.data.domain.Page;

import java.util.ArrayList;

public interface StaffService {
    Staff getStaffById(String staffId);
    ArrayList<Staff> getAllStaff();
    Page<Staff> getStaffsFilter(UserFilter userFilter);
    boolean addStaff(StaffCreateDto staffCreateDto);
    boolean updateStaff(StaffCreateDto staffCreateDto);
    boolean deleteStaff(String staffId);
    boolean updateStatusStaff(UserUpdateStatusDto staffUpdateStatusDto);
}
