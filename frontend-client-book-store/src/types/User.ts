export interface User {
  userId: string;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: "male" | "female";
  birthday?: string;
}
