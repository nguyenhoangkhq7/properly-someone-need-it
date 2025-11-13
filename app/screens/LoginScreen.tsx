// screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import  colors  from '../config/color'; // <-- ĐÃ CẬP NHẬT ĐƯỜNG DẪN
import { styles } from '../config/sharedStyles'; // <-- ĐÃ CẬP NHẬT ĐƯỜNG DẪN
import { useAuth } from '../context/AuthContext';

type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};
type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    const fakeToken = 'day-la-mot-token-gia';
    login(fakeToken);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
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
              <Text style={styles.title}>Đăng Nhập</Text>
              
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

              <TouchableOpacity 
                style={styles.linkContainer}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={[styles.linkText, { textAlign: 'right', marginBottom: 15 }]}>
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin}>
                <Text style={styles.buttonPrimaryText}>Đăng Nhập</Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Hoặc đăng nhập với</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.buttonSocial}
                onPress={() => handleSocialLogin("Google")}
              >
                <Icon name="google" size={20} color={colors.text} />
                <Text style={styles.buttonSocialText}>Đăng nhập với Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonSocial}
                onPress={() => handleSocialLogin("Facebook")}
              >
                <Icon name="facebook" size={20} color={colors.text} />
                <Text style={styles.buttonSocialText}>Đăng nhập với Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.linkContainer}
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={[styles.linkText, { color: colors.textSecondary, marginTop: 20 }]}>
                  Chưa có tài khoản?{' '}
                  <Text style={styles.linkText}>Đăng ký ngay</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}