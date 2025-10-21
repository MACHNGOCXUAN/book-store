@echo off
REM Script test API đăng nhập
REM Yêu cầu: curl phải được cài đặt (có sẵn trong Windows 10+)

setlocal enabledelayedexpansion
set API_URL=http://localhost:8080/api

echo ===== TEST DANG NHAP =====
echo.

REM Test 1: Đăng ký user mới
echo [Test 1] Dang ky user moi...
curl -X POST %API_URL%/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\":\"Test User\",\"email\":\"test001@example.com\",\"phone\":\"0987654321\",\"password\":\"Test@123\"}"
echo.
echo.

REM Test 2: Đăng nhập bằng phone
echo [Test 2] Dang nhap bang so dien thoai...
curl -X POST %API_URL%/auth/admin/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"0987654321\",\"password\":\"Test@123\"}"
echo.
echo.

REM Test 3: Đăng nhập bằng email
echo [Test 3] Dang nhap bang email...
curl -X POST %API_URL%/auth/admin/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test001@example.com\",\"password\":\"Test@123\"}"
echo.
echo.

echo ===== XONG =====
pause
