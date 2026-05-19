/**
 * Province/District/Ward Types
 * Địa phương - Quận huyện - Phường xã
 */

export interface ProvinceV1 {
  code: string | number;
  name: string;
  division_type?: string;
  codename?: string;
  phone_code?: number;
  districts?: DistrictV1[];
}

export interface DistrictV1 {
  code: string | number;
  name: string;
  division_type?: string;
  codename?: string;
  province_code?: string | number;
  wards?: WardV1[];
}

export interface WardV1 {
  code: string | number;
  name: string;
  division_type?: string;
  codename?: string;
  district_code?: string | number;
}

/** Transformed structure for easier use */
export type ProvinceData = Record<string, Record<string, string[]>>;
