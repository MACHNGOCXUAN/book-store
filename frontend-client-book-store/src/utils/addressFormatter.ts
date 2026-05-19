/**
 * Address formatting and parsing utilities
 * Format: "số đường, xã phường, quận huyện, tỉnh thành phố"
 * Example: "123 Nguyễn Trãi, Phường Phúc Xá, Quận Ba Đình, Thành phố Hà Nội"
 */

export interface AddressObject {
  street: string; // số đường (ví dụ: "123 Nguyễn Trãi")
  ward: string; // xã phường
  district: string; // quận huyện
  city: string; // tỉnh thành phố
}

/**
 * Format address object thành string
 * @param address Address object
 * @returns Formatted address string
 */
export const formatAddressToString = (address: AddressObject): string => {
  const parts = [address.street, address.ward, address.district, address.city];
  return parts.filter((part) => part && part.trim()).join(", ");
};

/**
 * Parse address string thành object
 * Format: "số đường, xã phường, quận huyện, tỉnh thành phố"
 * @param addressString Address string
 * @returns Address object
 */
export const parseAddressString = (addressString: string): AddressObject => {
  const parts = addressString.split(",").map((part) => part.trim());

  return {
    street: parts[0] || "",
    ward: parts[1] || "",
    district: parts[2] || "",
    city: parts[3] || "",
  };
};

/**
 * Validate address object
 * @param address Address object
 * @returns true if valid, false otherwise
 */
export const isValidAddress = (address: AddressObject): boolean => {
  return (
    !!address.street?.trim() &&
    !!address.ward?.trim() &&
    !!address.district?.trim() &&
    !!address.city?.trim()
  );
};
