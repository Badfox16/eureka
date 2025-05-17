import React from 'react';
import { View, ViewProps } from 'react-native';

type StackProps = ViewProps & {
  gap?: string | number;
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  p?: string | number;
  pt?: string | number;
  pb?: string | number;
  px?: string | number;
  py?: string | number;
  my?: string | number;
  mt?: string | number;
  mb?: string | number;
};

// Função para converter valores de espaçamento
const getSpaceValue = (value: string | number | undefined): number | undefined => {
  if (value === undefined) return undefined;
  
  // Se for um número, retorna diretamente
  if (typeof value === 'number') return value;
  
  // Se for uma string que começa com $, converte para valor numérico (ex: $4 => 16)
  if (value.startsWith('$')) {
    const num = parseInt(value.substring(1), 10);
    return isNaN(num) ? undefined : num * 4;
  }
  
  return undefined;
};

export const XStack = React.forwardRef<React.ElementRef<typeof View>, StackProps>(
  ({ style, gap, alignItems, justifyContent, p, pt, pb, px, py, my, mt, mb, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={[
          { 
            flexDirection: 'row',
            gap: getSpaceValue(gap),
            alignItems,
            justifyContent,
            padding: getSpaceValue(p),
            paddingTop: getSpaceValue(pt),
            paddingBottom: getSpaceValue(pb), 
            paddingHorizontal: getSpaceValue(px),
            paddingVertical: getSpaceValue(py),
            marginVertical: getSpaceValue(my),
            marginTop: getSpaceValue(mt),
            marginBottom: getSpaceValue(mb)
          },
          style
        ]}
        {...props}
      />
    );
  }
);

export const YStack = React.forwardRef<React.ElementRef<typeof View>, StackProps>(
  ({ style, gap, alignItems, justifyContent, p, pt, pb, px, py, my, mt, mb, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={[
          { 
            flexDirection: 'column',
            gap: getSpaceValue(gap),
            alignItems,
            justifyContent,
            padding: getSpaceValue(p),
            paddingTop: getSpaceValue(pt),
            paddingBottom: getSpaceValue(pb),
            paddingHorizontal: getSpaceValue(px),
            paddingVertical: getSpaceValue(py),
            marginVertical: getSpaceValue(my),
            marginTop: getSpaceValue(mt),
            marginBottom: getSpaceValue(mb)
          },
          style
        ]}
        {...props}
      />
    );
  }
);

XStack.displayName = 'XStack';
YStack.displayName = 'YStack';