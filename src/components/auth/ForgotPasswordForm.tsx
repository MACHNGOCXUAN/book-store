// src/components/auth/ForgotPasswordForm.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Form, Alert } from "antd"; // Chỉ giữ lại các import cần thiết
import { toast } from "react-toastify";
import { useAppDispatch } from "../../store/hooks";
import { useSelector } from "react-redux";
import {
  requestOtp,
  resetPasswordWithOtp,
} from "../../features/auth/authSlice";
import type { RootState } from "../../store";

// Import 2 component con
import RequestOtpForm from "./forgot/RequestOtpForm";
import ResetPasswordForm from "./forgot/ResetPasswordForm";

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

const RESEND_SECONDS = 60;

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitchToLogin,
}) => {
  const dispatch = useAppDispatch();
  // Lỗi từ Redux (ví dụ: email không tồn tại)
  const { loading, error: reduxError } = useSelector(
    (state: RootState) => state.auth
  );
  const [emailForm] = Form.useForm();
  const [otpForm] = Form.useForm();

  // ----- State được quản lý tại đây -----
  const [step, setStep] = useState<"email" | "otp">("email");
  const [resendLeft, setResendLeft] = useState(0);
  // Lỗi local (ví dụ: OTP sai, để phân biệt với lỗi của Redux)
  const [localError, setLocalError] = useState<string | null>(null);
  const [savedEmail, setSavedEmail] = useState<string>("");

  // ----- Logic được quản lý tại đây -----
  useEffect(() => {
    if (!resendLeft) return;
    const timer = setInterval(
      () => setResendLeft((s) => Math.max(0, s - 1)),
      1000
    );
    return () => clearInterval(timer);
  }, [resendLeft]);

  const maskedEmail = useMemo(() => {
    if (!savedEmail) return "";
    const [name, domain] = savedEmail.split("@");
    if (!domain) return savedEmail;
    const mask =
      name.length <= 2 ? name[0] + "*" : name[0] + "***" + name.slice(-1);
    return `${mask}@${domain}`;
  }, [savedEmail]);

  // Xóa lỗi mỗi khi đổi bước
  useEffect(() => {
    setLocalError(null);
  }, [step]);

  // ----- Handlers được quản lý tại đây -----
  const handleRequestOtp = async (values: any) => {
    setLocalError(null);
    try {
      const e = values.email.trim();
      setSavedEmail(e);
      await dispatch(requestOtp({ email: e })).unwrap();
      setStep("otp");
      setResendLeft(RESEND_SECONDS);
      otpForm.resetFields();
      toast.success("Mã OTP đã được gửi!");
    } catch (err: any) {
      // lỗi này thường là từ rejected thunk
      const msg = err || "Không thể gửi mã OTP. Thử lại sau.";
      // không set localError vì reduxError đã tự set
      toast.error(msg.toString());
    }
  };

  const handleReset = async (values: any) => {
    setLocalError(null);
    try {
      await dispatch(
        resetPasswordWithOtp({
          email: savedEmail,
          otp: values.otp,
          newPassword: values.password,
        })
      ).unwrap();
      // Thành công → quay lại đăng nhập
      toast.success("Đặt lại mật khẩu thành công!");
      emailForm.resetFields();
      otpForm.resetFields();
      setSavedEmail("");
      setStep("email");
      onSwitchToLogin();
    } catch (err: any) {
      // Lỗi này (ví dụ: OTP sai) nên được hiển thị
      const msg = err || "Đặt lại mật khẩu thất bại. Thử lại sau.";
      setLocalError(msg.toString());
      // không dùng toast.error(msg) vì đã hiển thị Alert
    }
  };

  const handleResendOtp = async () => {
    if (resendLeft > 0) return;
    setLocalError(null);
    try {
      await dispatch(requestOtp({ email: savedEmail })).unwrap();
      setResendLeft(RESEND_SECONDS);
      toast.success("Mã OTP đã được gửi lại!");
    } catch (err: any) {
      const msg = err || "Không thể gửi lại mã. Thử lại sau.";
      // không set localError vì reduxError đã tự set
      toast.error(msg.toString());
    }
  };

  // ----- Render -----
  return (
    <div style={{ padding: "16px 0" }}>
      {/* Cải thiện UI báo lỗi */}
      {localError && (
        <Alert
          message={localError}
          type="error"
          showIcon
          closable
          onClose={() => setLocalError(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      {reduxError && !localError && (
        <Alert
          message={reduxError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Render có điều kiện các component con */}
      {step === "email" ? (
        <RequestOtpForm
          form={emailForm}
          onFinish={handleRequestOtp}
          loading={loading}
          onSwitchToLogin={onSwitchToLogin}
        />
      ) : (
        <ResetPasswordForm
          form={otpForm}
          onFinish={handleReset}
          onResendOtp={handleResendOtp}
          loading={loading}
          resendLeft={resendLeft}
          maskedEmail={maskedEmail}
          onSwitchToLogin={onSwitchToLogin}
        />
      )}
    </div>
  );
};

export default ForgotPasswordForm;
