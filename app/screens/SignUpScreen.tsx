// screens/SignUpScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import  colors  from '../config/color'; // <-- ĐÃ CẬP NHẬT ĐƯỜNG DẪN
import { styles } from '../config/sharedStyles'; // <-- ĐÃ CẬP NHẬT ĐƯỜNG DẪN

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }
    console.log('Sign Up:', { email, password });
    Alert.alert('Thành công', 'Tài khoản đã được tạo. Vui lòng đăng nhập.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.keyboardAwareScroll}>
          <View style={styles.container}>
            <View style={styles.formContainer}>
              <Text style={styles.title}>Tạo Tài Khoản</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor={colors.muted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <TouchableOpacity style={styles.buttonPrimary} onPress={handleSignUp}>
                <Text style={styles.buttonPrimaryText}>Đăng Ký</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.linkContainer}
                onPress={() => navigation.goBack()}
              >
                <Text style={[styles.linkText, { color: colors.textSecondary, marginTop: 20 }]}>
                  Đã có tài khoản?{' '}
                  <Text style={styles.linkText}>Đăng nhập</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}