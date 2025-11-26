/**
 * Centralized validation utility for admin form inputs
 * Contains regex patterns and validation rules used across the admin application
 */

// ============ REGEX PATTERNS ============

/** Email validation - standard email format */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Phone number validation - Vietnamese phone format (10-11 digits starting with 0) */
export const PHONE_REGEX = /^0[0-9]{9}$/;

/** Password validation - min 8 chars, at least 1 uppercase, 1 lowercase, 1 number */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/** URL validation - basic URL format */
export const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/** Title/Name validation - allows letters, numbers, spaces, common punctuation */
export const TITLE_REGEX = /^[a-zA-Z0-9\s\-.,&'()]{1,200}$/;

/** Author/Publisher validation - Vietnamese and English characters */
export const AUTHOR_REGEX = /^[\p{L}\s\-'.]{2,100}$/u;

/** Description validation - allows most characters */
export const DESCRIPTION_REGEX = /^[\p{L}0-9\s\-.,;:!?()'"&]{5,1000}$/u;

/** Discount code validation - alphanumeric, uppercase, 3-20 chars */
export const DISCOUNT_CODE_REGEX = /^[A-Z0-9]{3,20}$/;

/** Category name validation */
export const CATEGORY_NAME_REGEX = /^[\p{L}0-9\s\-&(){}.]{1,100}$/u;

// ============ VALIDATION RULES ============

/** Title validation rule */
export const titleValidationRules = [
    { required: true, message: "Vui lòng nhập tiêu đề!" },
    { min: 1, message: "Tiêu đề phải có ít nhất 1 ký tự!" },
    { max: 200, message: "Tiêu đề không được vượt quá 200 ký tự!" },
    { pattern: TITLE_REGEX, message: "Tiêu đề chứa ký tự không hợp lệ!" },
];

/** Author/Publisher name validation */
export const authorValidationRules = [
    { required: true, message: "Vui lòng nhập tên tác giả!" },
    { min: 2, message: "Tên tác giả phải có ít nhất 2 ký tự!" },
    { max: 100, message: "Tên tác giả không được vượt quá 100 ký tự!" },
];

/** Publisher validation */
export const publisherValidationRules = [
    { min: 2, message: "Tên nhà xuất bản phải có ít nhất 2 ký tự!" },
    { max: 100, message: "Tên nhà xuất bản không được vượt quá 100 ký tự!" },
];

/** Publish date validation */
export const publishDateValidationRules = [
    { required: false, message: "Vui lòng nhập năm xuất bản!" },
    { type: "number" as const, message: "Năm phải là số!" },
];

/** Price validation */
export const priceValidationRules = [
    { required: true, message: "Vui lòng nhập giá!" },
    { type: "number" as const, message: "Giá phải là số!" },
    ({ getFieldValue }: { getFieldValue: (field: string) => any }) => ({
        validator(_: unknown, value: number) {
            if (!value || value >= 0) {
                return Promise.resolve();
            }
            return Promise.reject(new Error("Giá phải lớn hơn hoặc bằng 0!"));
        },
    }),
];

/** Import price validation */
export const importPriceValidationRules = [
    { required: true, message: "Vui lòng nhập giá nhập!" },
    { type: "number" as const, message: "Giá phải là số!" },
    ({ getFieldValue }: { getFieldValue: (field: string) => any }) => ({
        validator(_: unknown, value: number) {
            if (!value || value >= 0) {
                return Promise.resolve();
            }
            return Promise.reject(new Error("Giá phải lớn hơn hoặc bằng 0!"));
        },
    }),
];

/** Stock validation */
export const stockValidationRules = [
    { required: true, message: "Vui lòng nhập số lượng tồn kho!" },
    { type: "number" as const, message: "Số lượng phải là số!" },
    ({ getFieldValue }: { getFieldValue: (field: string) => any }) => ({
        validator(_: unknown, value: number) {
            if (!value || value >= 0) {
                return Promise.resolve();
            }
            return Promise.reject(new Error("Số lượng phải lớn hơn hoặc bằng 0!"));
        },
    }),
];

/** Category selection validation */
export const categoryValidationRules = [
    { required: true, message: "Vui lòng chọn loại sách!" },
];

/** Description validation */
export const descriptionValidationRules = [
    { min: 5, message: "Mô tả phải có ít nhất 5 ký tự!" },
    { max: 1000, message: "Mô tả không được vượt quá 1000 ký tự!" },
];

/** Banner title validation */
export const bannerTitleValidationRules = [
    { required: true, message: "Vui lòng nhập tiêu đề!" },
    { min: 1, message: "Tiêu đề phải có ít nhất 1 ký tự!" },
    { max: 200, message: "Tiêu đề không được vượt quá 200 ký tự!" },
];

/** Banner URL validation */
export const bannerUrlValidationRules = [
    { type: "url" as const, message: "Vui lòng nhập URL hợp lệ!" },
];

/** Discount code validation */
export const discountCodeValidationRules = [
    { required: true, message: "Vui lòng nhập mã giảm giá!" },
    { min: 3, message: "Mã phải có ít nhất 3 ký tự!" },
    { max: 20, message: "Mã không được vượt quá 20 ký tự!" },
    { pattern: DISCOUNT_CODE_REGEX, message: "Mã phải là chữ hoa và số!" },
];

/** Discount percent validation */
export const discountPercentValidationRules = [
    { required: true, message: "Vui lòng nhập giá trị giảm!" },
    { type: "number" as const, message: "Giá trị phải là số!" },
    ({ getFieldValue }: { getFieldValue: (field: string) => any }) => ({
        validator(_: unknown, value: number) {
            if (!value || (value > 0 && value <= 100)) {
                return Promise.resolve();
            }
            return Promise.reject(new Error("Giá trị giảm phải từ 1 đến 100%!"));
        },
    }),
];

/** Discount quantity validation */
export const discountQuantityValidationRules = [
    { required: true, message: "Vui lòng nhập số lượng!" },
    { type: "number" as const, message: "Số lượng phải là số!" },
    ({ getFieldValue }: { getFieldValue: (field: string) => any }) => ({
        validator(_: unknown, value: number) {
            if (!value || value > 0) {
                return Promise.resolve();
            }
            return Promise.reject(new Error("Số lượng phải lớn hơn 0!"));
        },
    }),
];

/** Min price validation */
export const minPriceValidationRules = [
    { required: true, message: "Vui lòng nhập giá tối thiểu!" },
    { type: "number" as const, message: "Giá phải là số!" },
    ({ getFieldValue }: { getFieldValue: (field: string) => any }) => ({
        validator(_: unknown, value: number) {
            if (!value || value >= 0) {
                return Promise.resolve();
            }
            return Promise.reject(new Error("Giá tối thiểu phải >= 0!"));
        },
    }),
];

/** Discount name validation */
export const discountNameValidationRules = [
    { required: true, message: "Vui lòng nhập tên mã!" },
    { min: 1, message: "Tên phải có ít nhất 1 ký tự!" },
    { max: 100, message: "Tên không được vượt quá 100 ký tự!" },
];

/** Category name validation */
export const categoryNameValidationRules = [
    { required: true, message: "Vui lòng nhập tên danh mục!" },
    { min: 1, message: "Tên danh mục phải có ít nhất 1 ký tự!" },
    { max: 100, message: "Tên danh mục không được vượt quá 100 ký tự!" },
];

// ============ AUTH VALIDATION RULES ============

/** Login username (email or phone) validation */
export const loginUsernameValidationRules = [
    { required: true, message: "Vui lòng nhập số điện thoại hoặc email!" },
    ({ getFieldValue }: { getFieldValue: (field: string) => any }) => ({
        validator(_: unknown, value: string) {
            if (!value) {
                return Promise.resolve();
            }
            // Check if it's a valid email or phone
            const isEmail = EMAIL_REGEX.test(value);
            const isPhone = PHONE_REGEX.test(value);
            if (isEmail || isPhone) {
                return Promise.resolve();
            }
            return Promise.reject(new Error("Vui lòng nhập email hoặc số điện thoại hợp lệ!"));
        },
    }),
];

/** Login password validation */
export const loginPasswordValidationRules = [
    { required: true, message: "Vui lòng nhập mật khẩu!" },
];

/** Email validation for register/forgot password */
export const emailValidationRules = [
    { required: true, message: "Vui lòng nhập email!" },
    { type: "email" as const, message: "Email không đúng định dạng!" },
];

/** Phone validation for register */
export const phoneValidationRules = [
    { required: true, message: "Vui lòng nhập số điện thoại!" },
    { pattern: PHONE_REGEX, message: "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0!" },
];

/** Password validation rule - with strict requirements */
export const passwordValidationRules = [
    { required: true, message: "Vui lòng nhập mật khẩu!" },
    { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
    { pattern: PASSWORD_REGEX, message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số!" },
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
];// ============ HELPER FUNCTIONS ============

/** Validate if value is valid price */
export const isValidPrice = (price: number): boolean => {
    return typeof price === "number" && price >= 0;
};

/** Validate if value is valid stock */
export const isValidStock = (stock: number): boolean => {
    return typeof stock === "number" && stock >= 0;
};

/** Validate if value is valid discount percent */
export const isValidDiscountPercent = (percent: number): boolean => {
    return typeof percent === "number" && percent > 0 && percent <= 100;
};

/** Validate if value is valid URL */
export const isValidUrl = (url: string): boolean => {
    return URL_REGEX.test(url);
};

/** Format currency display */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
};

/** Normalize input */
export const normalizeInput = (value: string): string => {
    return value ? value.trim().replace(/\s+/g, " ") : "";
};

/** Sanitize input for XSS */
export const sanitizeInput = (value: string): string => {
    return value ? value.replace(/[<>\"']/g, "") : "";
};
