// config/sharedStyles.ts
import { StyleSheet } from "react-native";
import  colors  from "./color";
export const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAwareScroll: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },

  // Text
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 30,
  },

  // Input
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    marginBottom: 15,
  },
  
  // Buttons
  buttonPrimary: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonPrimaryText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonSocial: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  buttonSocialText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },

  // Links & Dividers
  linkContainer: {
    marginTop: 15,
  },
  linkText: {
    color: colors.neonSoft,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    marginHorizontal: 10,
  },
});