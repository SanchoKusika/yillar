import { useState, forwardRef } from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
} from "react-native";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";

type TextInputProps = Omit<RNTextInputProps, "style">;

export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput(props, ref) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <RNTextInput
      ref={ref}
      {...props}
      placeholderTextColor={colors.cream3}
      style={[
        styles.input,
        {
          backgroundColor: colors.ink2,
          color: colors.cream,
          borderColor: focused ? colors.gold : colors.ink3,
        },
      ]}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 0,
    fontFamily: fonts.body,
    fontSize: 15,
    includeFontPadding: false,
  },
});
