/**
 * Centralized validation utility for form inputs
 * Contains regex patterns and validation rules used across the application
 */

// ============ REGEX PATTERNS ============

/** Email validation - standard email format */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Phone number validation - Vietnamese phone format (10-11 digits starting with 0) */
export const PHONE_REGEX = /^0[0-9]{9}$/;

/** Name validation - allows Vietnamese characters, spaces, hyphens, and dots */
export const NAME_REGEX = /^[\p{L}\s\-'.]{2,100}$/u;

/** Full name validation - at least 2 words */
export const FULL_NAME_REGEX = /^[\p{L}\s\-'.]{2,100}$/u;

/** Address validation - allows numbers, Vietnamese characters, spaces, commas, hyphens */
export const ADDRESS_REGEX = /^[\p{L}0-9\s\-,./]{5,200}$/u;

/** Password validation - min 8 chars, at least 1 uppercase, 1 lowercase, 1 number */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/** OTP validation - 6 digits */
export const OTP_REGEX = /^\d{6}$/;

/** Discount/Voucher code validation - alphanumeric, uppercase, 3-20 chars */
export const VOUCHER_CODE_REGEX = /^[A-Z0-9]{3,20}$/;

/** Product SKU validation - alphanumeric with hyphens */
export const SKU_REGEX = /^[A-Z0-9-]{3,50}$/;

// ============ VALIDATION RULES ============

/** Email validation rule for Ant Form */
export const emailValidationRules = [
    { required: true, message: "Vui lòng nhập email!" },
    {
        pattern: EMAIL_REGEX,
        message: "Email không đúng định dạng!"
    },
];

/** Alternative: Use Ant Design's built-in type validator */
export const emailValidationRulesBuiltIn = [
    { required: true, message: "Vui lòng nhập email!" },
    { type: "email" as const, message: "Email không đúng định dạng!" },
];

/** Full name validation rule - for checkout, account forms */
export const fullNameValidationRules = [
    { required: true, message: "Vui lòng nhập họ và tên!" },
    {
        pattern: FULL_NAME_REGEX,
        message: "Họ và tên phải từ 2-100 ký tự, bao gồm chữ cái, khoảng trắng, gạch ngang hoặc dấu chấm!"
    },
];

/** Phone number validation rule */
export const phoneValidationRules = [
    { required: true, message: "Vui lòng nhập số điện thoại!" },
    {
        pattern: PHONE_REGEX,
        message: "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0!"
    },
];

/** Receiver name validation rule */
export const receiverNameValidationRules = [
    { required: true, message: "Vui lòng nhập tên người nhận!" },
    {
        pattern: FULL_NAME_REGEX,
        message: "Tên người nhận phải từ 2-100 ký tự!"
    },
];

/** Receiver phone validation rule */
export const receiverPhoneValidationRules = [
    { required: true, message: "Vui lòng nhập số điện thoại người nhận!" },
    {
        pattern: PHONE_REGEX,
        message: "Số điện thoại phải gồm 10-11 chữ số, bắt đầu bằng 0!"
    },
];

/** Address detail validation rule */
export const addressDetailValidationRules = [
    { required: true, message: "Vui lòng nhập địa chỉ chi tiết!" },
    {
        pattern: ADDRESS_REGEX,
        message: "Địa chỉ phải từ 5-200 ký tự!"
    },
];

/** Province/City selection validation rule */
export const provinceValidationRules = [
    { required: true, message: "Vui lòng chọn Tỉnh/Thành phố!" },
];

/** District selection validation rule */
export const districtValidationRules = [
    { required: true, message: "Vui lòng chọn Quận/Huyện!" },
];

/** Ward selection validation rule */
export const wardValidationRules = [
    { required: true, message: "Vui lòng chọn Phường/Xã!" },
];

/** Password validation rule - with strict requirements */
export const passwordValidationRules = [
    { required: true, message: "Vui lòng nhập mật khẩu!" },
    {
        min: 8,
        message: "Mật khẩu phải có ít nhất 8 ký tự!"
    },
    {
        pattern: PASSWORD_REGEX,
        message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số!"
    },
];

/** Confirm password validation rule */
export const confirmPasswordValidationRules = [
    { required: true, message: "Vui lòng xác nhận mật khẩu!" },
    ({ getFieldValue }: { getFieldValue: (field: string) => string }) => ({
        validator(_: unknown, value: string) {
            if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
        },
    }),
];

/** OTP validation rule */
export const otpValidationRules = [
    { required: true, message: "Vui lòng nhập mã OTP!" },
    {
        pattern: OTP_REGEX,
        message: "Mã OTP phải gồm 6 chữ số!"
    },
];

/** Voucher/Discount code validation rule */
export const voucherCodeValidationRules = [
    { required: true, message: "Vui lòng nhập mã voucher!" },
    {
        pattern: VOUCHER_CODE_REGEX,
        message: "Mã voucher phải từ 3-20 ký tự, chỉ chứa chữ cái hoa và số!"
    },
];

// ============ VALIDATION FUNCTIONS ============

/** Validate email string */
export const isValidEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email.trim());
};

/** Validate phone number string */
export const isValidPhone = (phone: string): boolean => {
    return PHONE_REGEX.test(phone.trim());
};

/** Validate full name string */
export const isValidFullName = (name: string): boolean => {
    return FULL_NAME_REGEX.test(name.trim());
};

/** Validate address string */
export const isValidAddress = (address: string): boolean => {
    return ADDRESS_REGEX.test(address.trim());
};

/** Validate password strength */
export const isValidPassword = (password: string): boolean => {
    return PASSWORD_REGEX.test(password);
};

/** Validate OTP */
export const isValidOTP = (otp: string): boolean => {
    return OTP_REGEX.test(otp.trim());
};

/** Validate voucher code */
export const isValidVoucherCode = (code: string): boolean => {
    return VOUCHER_CODE_REGEX.test(code.trim());
};

/** Get password strength level (0-4) */
export const getPasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    return Math.min(strength, 4);
};

/** Get password strength text */
export const getPasswordStrengthText = (password: string): string => {
    const strength = getPasswordStrength(password);
    const texts = ["Yếu", "Trung bình", "Khá", "Mạnh"];
    return texts[strength] || "Yếu";
};

/** Trim and normalize input */
export const normalizeInput = (value: string): string => {
    return value.trim().replace(/\s+/g, " ");
};

/** Sanitize input to prevent XSS */
export const sanitizeInput = (value: string): string => {
    return value
        .trim()
        .replace(/[<>']/g, "")
        .substring(0, 255);
};
