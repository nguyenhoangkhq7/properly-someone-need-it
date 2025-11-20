// screens/SignUpScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "../config/color";
import { styles } from "../config/sharedStyles";
import api, { ApiClientError, ApiResponse } from "../api/axiosClient";
import { useAuth, AuthTokens } from "../context/AuthContext";

type Step = "profile" | "otp";

const RESEND_COUNTDOWN = 60;
const MAX_OTP_ATTEMPTS = 3;

export default function SignUpScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("profile");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_OTP_ATTEMPTS);

  useEffect(() => {
    if (!countdown) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const normalizePhone = (value: string) => value.replace(/\D/g, "");
  const isValidEmail = (value: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value.trim());

  const validateProfile = () => {
    if (!fullName.trim() || !city.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập họ tên và thành phố.");
      return false;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập email hợp lệ.");
      return false;
    }
    if (!normalizePhone(phone)) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập số điện thoại hợp lệ.");
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateProfile()) {
      return;
    }
    setSendingOtp(true);
    try {
      await api.post<ApiResponse<{ email: string }>>("/auth/send-otp", {
        email: email.trim(),
        purpose: "register",
      });
      setStep("otp");
      setCountdown(RESEND_COUNTDOWN);
      setAttemptsLeft(MAX_OTP_ATTEMPTS);
      Alert.alert("OTP đã gửi", "Kiểm tra email để nhận mã OTP và hoàn tất đăng ký");
    } catch (error) {
      const err = error as ApiClientError;
      Alert.alert("Không thể gửi OTP", err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleRegister = async () => {
    if (!otp.trim()) {
      Alert.alert("Thiếu OTP", "Vui lòng nhập mã OTP");
      return;
    }
    setVerifyingOtp(true);
    try {
      const { data } = await api.post<ApiResponse<AuthTokens>>("/auth/register", {
        email: email.trim(),
        phone: normalizePhone(phone),
        otp: otp.trim(),
        fullName: fullName.trim(),
        city: city.trim(),
        district: district.trim() || undefined,
      });
      await login(data.data);
    } catch (error) {
      const err = error as ApiClientError;
      if (err.errorCode === "OTP_INVALID") {
        setAttemptsLeft((prev) => Math.max(prev - 1, 0));
      }
      if (err.errorCode === "OTP_MAX_ATTEMPTS") {
        setStep("profile");
        setOtp("");
        setCountdown(0);
        setAttemptsLeft(0);
        Alert.alert("OTP không hợp lệ", "Bạn đã nhập sai quá 3 lần, vui lòng gửi lại OTP.");
      } else {
        Alert.alert("Đăng ký thất bại", err.message);
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  const canResend = countdown === 0 && step === "otp";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.keyboardAwareScroll}>
          <View style={styles.container}>
            <View style={styles.formContainer}>
              <Text style={styles.title}>Tạo Tài Khoản</Text>

              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                placeholderTextColor={colors.muted}
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                placeholderTextColor={colors.muted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Tỉnh/Thành phố"
                placeholderTextColor={colors.muted}
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={styles.input}
                placeholder="Quận/Huyện (tuỳ chọn)"
                placeholderTextColor={colors.muted}
                value={district}
                onChangeText={setDistrict}
              />

              <TouchableOpacity
                style={[styles.buttonPrimary, { marginTop: 16, opacity: sendingOtp ? 0.7 : 1 }]}
                onPress={handleSendOtp}
                disabled={sendingOtp}
              >
                <Text style={styles.buttonPrimaryText}>
                  {sendingOtp ? "Đang gửi OTP..." : "Gửi OTP"}
                </Text>
              </TouchableOpacity>

              {step === "otp" && (
                <View style={{ marginTop: 24 }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mã OTP"
                    placeholderTextColor={colors.muted}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
                    Còn {attemptsLeft} lần nhập OTP
                  </Text>

                  <TouchableOpacity
                    style={[styles.buttonPrimary, { opacity: verifyingOtp ? 0.7 : 1 }]}
                    onPress={handleRegister}
                    disabled={verifyingOtp || attemptsLeft === 0}
                  >
                    <Text style={styles.buttonPrimaryText}>
                      {verifyingOtp ? "Đang xác thực..." : "Hoàn tất đăng ký"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.linkContainer}
                    onPress={handleSendOtp}
                    disabled={!canResend || sendingOtp}
                  >
                    <Text
                      style={{
                        ...styles.linkText,
                        color: canResend ? colors.primary : colors.textSecondary,
                      }}
                    >
                      {canResend
                        ? "Gửi lại OTP"
                        : `Gửi lại OTP sau ${countdown}s`}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.linkContainer}
                onPress={() => navigation.goBack()}
              >
                <Text style={[styles.linkText, { color: colors.textSecondary, marginTop: 20 }]}>
                  Đã có tài khoản? <Text style={styles.linkText}>Đăng nhập</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}