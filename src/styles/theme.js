import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const COLORS = {
  // Primary colors from the palette
  blackOlive: '#34403A',
  emerald: '#0CCE6B',
  whiteSmoke: '#F2F4F3',
  glaucous: '#507DBC',
  satinGold: '#C8963E',

  // Additional semantic colors
  primary: '#0CCE6B', // Using emerald as primary
  secondary: '#507DBC', // Using glaucous as secondary
  background: '#F2F4F3', // Using white smoke as background
  text: '#34403A', // Using black olive as main text color
  accent: '#C8963E', // Using satin gold as accent
  error: '#FF3B30', // Error color
};

const SIZES = {
  // Font sizes
  xsmall: 10,
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
  xxlarge: 32,

  // Spacing
  padding: {
    small: 8,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
  margin: {
    small: 8,
    medium: 16,
    large: 20,
    xlarge: 24,
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

export {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  LAYOUT,
  mixins,
};

export default {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  LAYOUT,
  mixins,
};
