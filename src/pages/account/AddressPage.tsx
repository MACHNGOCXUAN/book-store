import { Button, Form, Input, Select, Spin, message } from "antd";
import type { FormInstance } from "antd";
import { useState, useEffect } from "react";
import { fetchProvincesV1, transformV1Data } from "../../services/provincesApi";
import {
  formatAddressToString,
  type AddressObject,
} from "../../utils/addressFormatter";

const { Option } = Select;

// State cho API v1 (Trước sáp nhập)
type AddressDataV1 = Record<string, Record<string, string[]>>;

// (v2 removed)

// Hook để fetch dữ liệu API v1 (depth=3: tỉnh + quận/huyện + xã/phường)
const useProvincesV1 = () => {
  const [data, setData] = useState<AddressDataV1>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const provinces = await fetchProvincesV1(3); // depth=3: tỉnh + quận/huyện + xã/phường
        const transformed = transformV1Data(provinces);
        setData(transformed);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        setData({});
        message.error("Lỗi khi tải dữ liệu địa chỉ v1");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

// Note: v2 (merged) API removed — only v1 (legacy) is used below.

type AddressFormData = {
  country: string;
  city: string;
  district?: string;
  ward: string;
  street: string;
  postalCode?: string;
};

/**
 * Component chứa các trường địa chỉ chi tiết (TRƯỚC sáp nhập)
 */
const LegacyAddressFields = ({
  form,
  addressData,
  loading,
}: {
  form: FormInstance;
  addressData: AddressDataV1;
  loading: boolean;
}) => {
  const [selectedCity, setSelectedCity] = useState<string | undefined>();
  const [selectedDistrict, setSelectedDistrict] = useState<
    string | undefined
  >();

  const cities = Object.keys(addressData);
  const districts = selectedCity ? Object.keys(addressData[selectedCity]) : [];
  const wards =
    selectedCity && selectedDistrict
      ? addressData[selectedCity][selectedDistrict]
      : [];

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedDistrict(undefined);
    form.setFieldsValue({ district: undefined, ward: undefined });
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    form.setFieldsValue({ ward: undefined });
  };

  return (
    <Spin spinning={loading}>
      <Form.Item
        label="Quốc gia"
        name="country"
        initialValue="Việt Nam"
        rules={[{ required: true, message: "Vui lòng chọn quốc gia!" }]}
      >
        <Select size="large" disabled>
          <Option value="Việt Nam">Việt Nam</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Tỉnh/Thành phố"
        name="city"
        rules={[{ required: true, message: "Vui lòng chọn Tỉnh/Thành phố!" }]}
      >
        <Select
          size="large"
          placeholder="Vui lòng chọn"
          onChange={handleCityChange}
          showSearch={false}
          disabled={loading}
        >
          {cities.map((city) => (
            <Option key={city} value={city}>
              {city}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Quận/Huyện"
        name="district"
        rules={[{ required: true, message: "Vui lòng chọn Quận/Huyện!" }]}
      >
        <Select
          size="large"
          placeholder="Vui lòng chọn"
          onChange={handleDistrictChange}
          disabled={!selectedCity || loading}
          showSearch
        >
          {districts.map((district) => (
            <Option key={district} value={district}>
              {district}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Xã/Phường"
        name="ward"
        rules={[{ required: true, message: "Vui lòng chọn Xã/Phường!" }]}
      >
        <Select
          size="large"
          placeholder="Vui lòng chọn"
          disabled={!selectedDistrict || loading}
          showSearch
        >
          {wards.map((ward) => (
            <Option key={ward} value={ward}>
              {ward}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Địa chỉ"
        name="street"
        rules={[
          {
            required: true,
            message: "Vui lòng nhập địa chỉ (số nhà, tên đường)!",
          },
        ]}
      >
        <Input placeholder="Số nhà, tên đường" size="large" />
      </Form.Item>
    </Spin>
  );
};

/**
 * Component chứa các trường địa chỉ rút gọn (SAU sáp nhập)
 * CẬP NHẬT: Thêm trường 'street' và 'postalCode' theo hình ảnh mới
 */
// Merged address UI removed.

/**
 * Trang chính để thêm địa chỉ mới
 * CẬP NHẬT: Áp dụng style (border, background, shadow) và
 * loại bỏ các trường/text không có trong hình ảnh mới.
 */
const AddressPage = () => {
  const [form] = Form.useForm<AddressFormData>();
  const [loading, setLoading] = useState(false);

  // Fetch dữ liệu từ API
  const v1Data = useProvincesV1();

  // Fetch current customer address on mount
  useEffect(() => {
    const loadCustomerAddress = async () => {
      try {
        // TODO: Replace with actual API call to get customer address
        // const response = await fetch("/api/customer/address");
        // const data = await response.json();
        // if (data.address) {
        //   const parsed = /* parseAddressString(data.address) */ null;
        //   if (parsed) {
        //     form.setFieldsValue({
        //       country: "Việt Nam",
        //       city: parsed.city,
        //       district: parsed.district,
        //       ward: parsed.ward,
        //       street: parsed.street,
        //     });
        //   }
        // }
      } catch (error) {
        console.error("Error loading customer address:", error);
      }
    };

    loadCustomerAddress();
  }, [form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Format address as string
      const address: AddressObject = {
        street: values.street,
        ward: values.ward,
        district: values.district || "",
        city: values.city,
      };
      const formattedAddress = formatAddressToString(address);

      const dataToSave = {
        ...values,
        address: formattedAddress,
        addressType: "before",
      };

      console.log("Saving Address:", dataToSave);

      // TODO: Replace with actual API call
      setTimeout(() => {
        setLoading(false);
        console.log("Address saved:", dataToSave);
        message.success("Đã lưu địa chỉ thành công!");
      }, 1000);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    // CẬP NHẬT: Thêm style cho container chính
    <div
      style={{
        maxWidth: 700,
        padding: 24,
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* Only legacy address form (Trước sáp nhập) is shown */}
      <Form form={form} layout="vertical" style={{ paddingTop: 16 }}>
        <LegacyAddressFields
          form={form}
          addressData={v1Data.data}
          loading={v1Data.loading}
        />
      </Form>
      <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
        <Button
          type="primary"
          size="large"
          onClick={handleSave}
          loading={loading}
          style={{
            background: "#C92127",
            borderColor: "#C92127",
            borderRadius: 8,
            fontWeight: 600,
            height: 48,
            width: "100%",
            maxWidth: 200,
          }}
        >
          Lưu địa chỉ
        </Button>
      </Form.Item>
    </div>
  );
};

export default AddressPage;
