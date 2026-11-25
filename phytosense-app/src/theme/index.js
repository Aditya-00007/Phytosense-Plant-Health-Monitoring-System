import { Platform } from 'react-native';

export const colors = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryMid: '#4CAF50',
  primaryLight: '#E8F5E9',
  accent: '#F59E0B',
  bg: '#F1F8E9',
  surfaceTint: '#F8FAF8',
  card: '#FFFFFF',
  text: '#16231C',
  muted: '#5F6F65',
  border: '#DCE7DF',
  danger: '#D64545',
  warn: '#E8A317',
  ok: '#2E9E5B',
  infoBg: '#E8F4FD',
  infoBorder: '#2196F3',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 18, pill: 25 };
export const layout = { maxWidth: 960 };

export const shadows = {
  card: Platform.select({
    web: { boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  }),
  button: Platform.select({
    web: { boxShadow: '0 4px 12px rgba(76, 175, 80, 0.28)' },
    default: {
      shadowColor: '#2E7D32',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
  }),
};
