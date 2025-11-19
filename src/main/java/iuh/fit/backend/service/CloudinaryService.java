package iuh.fit.backend.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    /**
     * Upload file lên Cloudinary và trả về URL của ảnh
     * @param file MultipartFile từ request
     * @return URL của ảnh đã upload
     * @throws IOException nếu có lỗi khi upload
     */
    String uploadImage(MultipartFile file) throws IOException;

    /**
     * Xóa ảnh trên Cloudinary theo public_id
     * @param publicId Public ID của ảnh cần xóa
     * @throws IOException nếu có lỗi khi xóa
     */
    void deleteImage(String publicId) throws IOException;
}

