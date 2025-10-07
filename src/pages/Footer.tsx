import { MessageCircle, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="text-slate-800 border-t border-slate-100 pt-5" style={{backgroundColor: '#FFF8E1', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'}}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Thông tin */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4 text-lg">Thông tin</h3>
            <ul className="space-y-2 text-sm">
              {[
                "Giới thiệu",
                "Tiêu chí bán hàng",
                "Điều khoản sử dụng",
                "Bảo mật thông tin",
                "Liên hệ",
              ].map((t, i) => (
                <li key={i}  className="flex items-center gap-2">
                  <span className="text-lg leading-none">•</span>
                  <a
                    style={{textDecoration: 'none', cursor: 'pointer', color: '#475569'}}
                    href="#"
                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ khách hàng */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4 text-lg">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              {[
                "Hướng dẫn mua hàng",
                "Hình thức thanh toán",
                "Quy định đổi sản phẩm",
                "Câu hỏi thường gặp",
                "Yêu cầu đổi sản phẩm",
              ].map((t, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-lg leading-none">•</span>
                  <a 
                    style={{textDecoration: 'none', cursor: 'pointer', color: '#475569'}}
                    href="#"
                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hướng dẫn cơ bản */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4 text-lg">Hướng dẫn cơ bản</h3>
            <ul className="space-y-2 text-sm">
              {[
                "Hướng dẫn kỹ thuật",
                "Hướng dẫn tải sản phẩm",
                "Hướng dẫn cập nhật sản phẩm",
                "Yêu cầu sản phẩm mới",
                "Tin cập nhật",
              ].map((t, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-lg leading-none">•</span>
                  <a
                    style={{textDecoration: 'none', cursor: 'pointer', color: '#475569'}}
                    href="#"
                    className="text-slate-600 hover:text-indigo-600 transition-colors "
                  >
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4 text-lg">Nhận tin tức</h3>
            <p className="text-sm text-slate-600 mb-4">
              Đăng ký để nhận thông tin sách mới, giảm giá và sự kiện.
            </p>

            
            <div className="mt-6">
              <p className="text-sm text-slate-700 font-semibold mb-2">Liên hệ nhanh</p>
              <div className="flex items-center gap-4">
                {/* Zalo (xanh dương) */}
                <a
                  href="#"
                  aria-label="Zalo"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-sky-200 bg-white text-sky-600 hover:bg-sky-50 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>

                {/* Phone (xanh lá) */}
                <a href="tel:0999000000" className="inline-flex items-center gap-2 group">
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-green-100 text-green-700 group-hover:bg-green-200 transition-colors">
                    <Phone className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-green-700 group-hover:text-green-800 font-medium">
                    0990 000 000
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-600">
              <p className="font-semibold mb-1 tracking-wide">THIẾT KẾ & HỖ TRỢ WEBSITE</p>
              <p>
                Hotline kỹ thuật:{" "}
                <span className="font-semibold text-slate-900">0990 000 000</span>
              </p>
              <p>
                Email:{" "}
                <a href="mailto:email@gmail.com" className="text-indigo-600 hover:underline">
                  email@gmail.com
                </a>
              </p>
            </div>

            <div className="flex items-center gap-6">
              <nav className="hidden md:flex gap-4 text-sm">
                <a href="#" className="text-slate-600 hover:text-indigo-600 hover:underline">
                  Chính sách
                </a>
                <a href="#" className="text-slate-600 hover:text-indigo-600 hover:underline">
                  FAQ
                </a>
                <a href="#" className="text-slate-600 hover:text-indigo-600 hover:underline">
                  Hỗ trợ
                </a>
              </nav>

              <div className="flex gap-3">
                {/* Facebook (xanh biển) */}
                <a
                  href="#"
                  aria-label="Facebook"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.99 3.66 9.13 8.44 9.9v-7.02H8.08v-2.88h2.36V9.41c0-2.33 1.39-3.62 3.52-3.62.99 0 1.85.07 2.1.11v2.43h-1.44c-1.13 0-1.35.54-1.35 1.33v1.74h2.7l-.43 2.88h-2.27v7.02C18.34 21.2 22 17.06 22 12.07z" />
                  </svg>
                </a>

                {/* Twitter/X (tông xanh trời nhẹ hoặc bạn có thể đổi sang đen) */}
                <a
                  href="#"
                  aria-label="Twitter"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-sky-200 bg-white text-sky-500 hover:bg-sky-50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M22 5.92c-.63.28-1.3.47-2.01.56.72-.43 1.27-1.11 1.53-1.92-.67.4-1.41.69-2.2.85C18.5 4.6 17.5 4 16.36 4c-1.72 0-3.12 1.4-3.12 3.12 0 .24.03.48.08.71C9.69 7.68 6.13 5.9 3.9 3.07c-.27.46-.42 1-.42 1.58 0 1.08.55 2.03 1.4 2.59-.52-.02-1.01-.16-1.44-.4v.04c0 1.52 1.08 2.79 2.5 3.08-.26.07-.53.11-.81.11-.2 0-.39-.02-.58-.06.39 1.22 1.52 2.11 2.86 2.14C6.9 15.9 5.2 16.6 3.38 16.6c-.22 0-.44-.01-.65-.04 1.29.83 2.82 1.31 4.47 1.31 5.36 0 8.3-4.44 8.3-8.29v-.38c.57-.41 1.06-.92 1.45-1.51-.52.23-1.08.39-1.66.46.6-.36 1.06-.98 1.27-1.7z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
