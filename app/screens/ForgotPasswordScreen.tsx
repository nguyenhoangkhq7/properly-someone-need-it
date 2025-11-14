// screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import  colors  from '../config/color'; // <-- ĐÃ CẬP NHẬT ĐƯỜNG DẪN
import { styles } from '../config/sharedStyles'; // <-- ĐÃ CẬP NHẬT ĐƯỜNG DẪN

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email của bạn.');
      return;
    }
    console.log('Reset Password for:', email);
    Alert.alert(
      'Kiểm tra Email',
      'Nếu email tồn tại, một link khôi phục mật khẩu đã được gửi.'
    );
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
              <Text style={styles.title}>Quên Mật Khẩu</Text>
              <Text style={styles.subtitle}>
                Nhập email, chúng tôi sẽ gửi link khôi phục.
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity style={styles.buttonPrimary} onPress={handleResetPassword}>
                <Text style={styles.buttonPrimaryText}>Gửi Link Khôi Phục</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.linkContainer}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.linkText}>Quay lại Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}