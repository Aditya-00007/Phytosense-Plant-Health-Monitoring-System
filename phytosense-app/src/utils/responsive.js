import { useWindowDimensions } from 'react-native';

// Breakpoints: phone < 768 <= tablet < 1100 <= desktop/web
export function useResponsive() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1100;
  const columns = isDesktop ? 3 : isTablet ? 2 : 1;
  return { width, isTablet, isDesktop, columns };
}
