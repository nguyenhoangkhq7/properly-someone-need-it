// screens/LoginScreen.tsx
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
import { StackNavigationProp } from "@react-navigation/stack";
import colors from "../config/color";
import { styles } from "../config/sharedStyles";
import api, { ApiClientError, ApiResponse } from "../api/axiosClient";
import { useAuth, AuthTokens } from "../context/AuthContext";

type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, "Login">;

type Step = "email" | "otp";

const MAX_OTP_ATTEMPTS = 3;
const RESEND_COUNTDOWN = 60;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("email");
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

  const isValidEmail = (value: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value.trim());

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập email hợp lệ.");
      return;
    }
    setSendingOtp(true);
    try {
      await api.post<ApiResponse<{ email: string }>>("/auth/send-otp", {
        email: trimmedEmail,
        purpose: "login",
      });
      setStep("otp");
      setCountdown(RESEND_COUNTDOWN);
      setAttemptsLeft(MAX_OTP_ATTEMPTS);
      Alert.alert("OTP đã gửi", "Kiểm tra email để nhận mã OTP");
    } catch (error) {
      const err = error as ApiClientError;
      Alert.alert("Không thể gửi OTP", err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail) || !otp.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập email hợp lệ và OTP.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const { data } = await api.post<ApiResponse<AuthTokens>>("/auth/login", {
        email: trimmedEmail,
        otp: otp.trim(),
      });
      await login(data.data);
    } catch (error) {
      const err = error as ApiClientError;
      if (err.errorCode === "OTP_INVALID") {
        setAttemptsLeft((prev) => Math.max(prev - 1, 0));
      }
      if (err.errorCode === "OTP_MAX_ATTEMPTS") {
        setStep("email");
        setOtp("");
        setCountdown(0);
        setAttemptsLeft(0);
        Alert.alert("OTP không hợp lệ", "Bạn đã nhập sai quá 3 lần, vui lòng gửi lại OTP.");
      } else {
        Alert.alert("Đăng nhập thất bại", err.message);
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
              <Text style={styles.title}>Đăng Nhập</Text>

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
                    onPress={handleLogin}
                    disabled={verifyingOtp || attemptsLeft === 0}
                  >
                    <Text style={styles.buttonPrimaryText}>
                      {verifyingOtp ? "Đang xác thực..." : "Xác nhận"}
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
                onPress={() => navigation.navigate("SignUp")}
              >
                <Text style={[styles.linkText, { color: colors.textSecondary, marginTop: 20 }]}>
                  Chưa có tài khoản? <Text style={styles.linkText}>Đăng ký ngay</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}