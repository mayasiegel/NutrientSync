import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#4A90E2',
  secondary: '#50C878',
  background: '#F5F5F5',
  text: '#333333',
  error: '#FF6B6B',
  success: '#4CAF50',
  warning: '#FFA726',
  info: '#29B6F6',
  glaucous: '#6082B6',
  whiteSmoke: '#F5F5F5',
  gray: '#808080',
  lightGray: '#D3D3D3',
  darkGray: '#A9A9A9',
  black: '#000000',
  white: '#FFFFFF',
};

const SIZES = {
  // Font sizes
  xxsmall: 8,
  xsmall: 10,
  small: 12,
  medium: 14,
  large: 16,
  xlarge: 18,
  xxlarge: 24,
  
  // Spacing
  padding: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  margin: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  
  // Border radius
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
  },

  // Screen dimensions
  width,
  height,
};

const FONTS = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700',
  },
};

const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
};

const LAYOUT = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
};

const mixins = {
  boxShadow: SHADOWS.small,
  roundedCorners: {
    borderRadius: 8,
  },
  card: {
    backgroundColor: COLORS.whiteSmoke,
    borderRadius: 8,
    padding: SIZES.padding.medium,
    ...SHADOWS.small,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SIZES.padding.medium,
    ...SHADOWS.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.whiteSmoke,
    fontSize: SIZES.medium,
    ...FONTS.medium,
  },
};

const theme = {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  LAYOUT,
  mixins,
};

export default theme;
