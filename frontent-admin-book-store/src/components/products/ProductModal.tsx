import React from "react";
import { Modal, Row, Col, Button, Image, Tag, Divider } from "antd";
import { 
  BookOutlined, 
  UserOutlined, 
  HomeOutlined, 
  CalendarOutlined,
  BarcodeOutlined,
  FileTextOutlined,
  GlobalOutlined,
  DollarOutlined,
  InboxOutlined,
  EditOutlined,
  CloseOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

// Types
interface ProductDataType {
  bookId?: string;
  title?: string;
  author?: string;
  publisher?: string;
  publishDate?: string;
  isbn?: string;
  pages?: number;
  language?: string;
  price?: number;
  stock?: number;
  coverImage?: string;
  description?: string;
}

interface ProductViewModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  product: ProductDataType | null;
}

const ProductViewModal = ({
  isModalOpen,
  setIsModalOpen,
  product,
}: ProductViewModalProps) => {
  const router = useRouter();
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleEdit = () => {
    if (product?.bookId) {
      router.push(`/products/edit/${product?.bookId}`);
    }
  };

  const InfoItem = ({ 
    icon, 
    label, 
    value,
    highlight = false 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    value: React.ReactNode;
    highlight?: boolean;
  }) => (
    <div className={`group relative ${highlight ? 'bg-gradient-to-r from-blue-50 to-transparent' : 'bg-white'} rounded-xl p-4! transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-blue-200`}>
      <div className="flex items-start gap-4">
        <div className={`${highlight ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gray-100 group-hover:bg-blue-50'} w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0`}>
          <div className={`${highlight ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'} text-lg transition-colors`}>
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5!">
            {label}
          </div>
          <div className="text-gray-900 font-medium text-base leading-snug">
            {value || <span className="text-gray-400 italic">Chưa có thông tin</span>}
          </div>
        </div>
      </div>
    </div>
  );

  const getStockStatus = (stock?: number) => {
    if (!stock || stock === 0) return { color: 'red', text: 'Hết hàng', icon: <ExclamationCircleOutlined /> };
    if (stock < 10) return { color: 'orange', text: 'Sắp hết', icon: <ExclamationCircleOutlined /> };
    return { color: 'green', text: 'Còn hàng', icon: <CheckCircleOutlined /> };
  };

  const stockStatus = getStockStatus(product?.stock);

  return (
    <Modal
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={1000}
      destroyOnHidden
      closeIcon={
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <CloseOutlined className="text-gray-600" />
        </div>
      }
      styles={{
        body: { padding: 0 },
        header: { display: 'none' }
      }}
      className="premium-product-modal"
    >
      <style>{`
        .premium-product-modal .ant-modal-content {
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
      
      {product ? (
        <div className="relative">
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-8! py-6! relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}></div>
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <BookOutlined className="text-white text-2xl" />
                </div>
                <div>
                  <div className="text-white text-xs font-medium opacity-90 uppercase tracking-wider mb-1">
                    Chi tiết sản phẩm
                  </div>
                  <h2 className="text-white text-2xl font-bold leading-tight">
                    Thông tin sách
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag 
                  icon={stockStatus.icon} 
                  color={stockStatus.color}
                  className="px-4! py-1! text-sm font-medium"
                >
                  {stockStatus.text}
                </Tag>
              </div>
            </div>
          </div>

          <div className="px-8! py-8! bg-gray-50">
            <Row gutter={[32, 32]}>
              <Col xs={24} md={10}>
                <div className="sticky top-8">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    {product.coverImage ? (
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl z-10 flex items-end justify-center pb-4!">
                          <EyeOutlined className="text-white text-2xl" />
                        </div>
                        <Image
                          src={product.coverImage}
                          alt={product.title}
                          style={{ 
                            width: "100%",
                            height: 400,
                            objectFit: "cover",
                            borderRadius: 12
                          }}
                          preview={{
                            mask: (
                              <div className="flex items-center gap-2">
                                <EyeOutlined /> Xem ảnh lớn
                              </div>
                            )
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl" style={{ height: 400 }}>
                        <div className="text-center">
                          <BookOutlined className="text-gray-300 text-7xl mb-3" />
                          <p className="text-gray-400 text-sm">Chưa có ảnh bìa</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Card giá và tồn kho */}
                  <div className="grid grid-cols-2 gap-4 mt-6!">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5! text-white shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12! -mt-12!"></div>
                      <div className="relative z-10">
                        <DollarOutlined className="text-2xl mb-2! opacity-80" />
                        <div className="text-xs font-medium opacity-90 uppercase tracking-wide mb-1">Giá bán</div>
                        <div className="text-2xl font-bold">
                          {product.price?.toLocaleString()}₫
                        </div>
                      </div>
                    </div>
                    
                    <div className={`bg-gradient-to-br ${
                      stockStatus.color === 'green' ? 'from-blue-500 to-blue-600' : 
                      stockStatus.color === 'orange' ? 'from-orange-500 to-orange-600' : 
                      'from-red-500 to-red-600'
                    } rounded-2xl p-5! text-white shadow-lg relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12! -mt-12!"></div>
                      <div className="relative z-10">
                        <InboxOutlined className="text-2xl mb-2 opacity-80" />
                        <div className="text-xs font-medium opacity-90 uppercase tracking-wide mb-1">Tồn kho</div>
                        <div className="text-2xl font-bold">
                          {product.stock || 0} cuốn
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={14}>
                <div className="space-y-4!">
                  <div className="bg-white rounded-2xl p-6! shadow-md border-l-4 border-blue-500">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2!">
                      Tên sách
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                      {product.title || "Chưa có tên sách"}
                    </h1>
                  </div>

                  {/* Thông tin cơ bản */}
                  <div className="grid grid-cols-1 gap-4">
                    <InfoItem 
                      icon={<UserOutlined />} 
                      label="Tác giả" 
                      value={product.author}
                      highlight={true}
                    />

                    <InfoItem 
                      icon={<HomeOutlined />} 
                      label="Nhà xuất bản" 
                      value={product.publisher}
                    />
                  </div>

                  {/* Grid 2 cột cho thông tin phụ */}
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem 
                      icon={<CalendarOutlined />} 
                      label="Năm xuất bản" 
                      value={product.publishDate}
                    />

                    <InfoItem 
                      icon={<FileTextOutlined />} 
                      label="Số trang" 
                      value={product.pages ? `${product.pages} trang` : undefined}
                    />

                    <InfoItem 
                      icon={<BarcodeOutlined />} 
                      label="Mã ISBN" 
                      value={product.isbn}
                    />

                    <InfoItem 
                      icon={<GlobalOutlined />} 
                      label="Ngôn ngữ" 
                      value={product.language}
                    />
                  </div>

                  {product.description && (
                    <div className="bg-white rounded-2xl p-6! shadow-md">
                      <div className="flex items-center gap-2 mb-4!">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                          Mô tả sản phẩm
                        </h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </div>

          <div className="bg-white px-8! py-5! border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mã sản phẩm: <span className="font-mono font-semibold text-gray-700">{product.bookId || 'N/A'}</span>
            </div>
            <div className="flex gap-3">
              <Button 
                icon={<CloseOutlined />} 
                onClick={handleCancel}
                size="large"
                className="px-6! h-11! rounded-xl hover:bg-gray-50"
              >
                Đóng
              </Button>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={handleEdit}
                size="large"
                className="px-6! h-11! rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
                }}
              >
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20! px-8!">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6!">
            <BookOutlined className="text-gray-300 text-5xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Không có dữ liệu
          </h3>
          <p className="text-gray-500">
            Không tìm thấy thông tin sản phẩm để hiển thị
          </p>
        </div>
      )}
    </Modal>
  );
};

export default ProductViewModal;