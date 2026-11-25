import React from 'react';
import { View } from 'react-native';
import { useResponsive } from '../utils/responsive';
import { spacing } from '../theme';

// 1 column on phones, 2 on tablets, 3 on desktop/web.
export default function ResponsiveGrid({ children, gap = spacing.md }) {
  const { columns } = useResponsive();
  const items = React.Children.toArray(children);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -gap / 2 }}>
      {items.map((child, i) => (
        <View key={i} style={{ width: `${100 / columns}%`, padding: gap / 2 }}>
          {child}
        </View>
      ))}
    </View>
  );
}
