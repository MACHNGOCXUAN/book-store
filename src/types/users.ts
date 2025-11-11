export type UserDataType = {
  userId: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: boolean;
  department?: string;
  shift?: string;
  fullName?: string;
  address?: string;
  dateOfBirth?: string;
  loyaltyPoints?: string;
  password?: string;
  gender?: string;
  registrationDate?: string;
  addresses?: AddressType[];
}


export type AddressType = {
  id: number;
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  specifics: string;
  main: number;
}