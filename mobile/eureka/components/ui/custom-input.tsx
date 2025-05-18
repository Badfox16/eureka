import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '~/lib/theme/useTheme';

type CustomInputProps = TextInputProps & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const CustomInput = React.forwardRef<TextInput, CustomInputProps>(
  ({ style, leftIcon, rightIcon, ...props }, ref) => {
    const { colors } = useTheme();
    
    return (
      <View style={{ position: 'relative' }}>
        {leftIcon}
        <TextInput
          ref={ref}
          style={[
            {
              padding: 12,
              paddingLeft: leftIcon ? 40 : 12,
              paddingRight: rightIcon ? 40 : 12,
              borderRadius: 12,
              backgroundColor: colors.input,
              color: colors.text.primary,
            },
            style
          ]}
          placeholderTextColor={colors.text.muted}
          {...props}
        />
        {rightIcon}
      </View>
    );
  }
);

CustomInput.displayName = 'CustomInput';