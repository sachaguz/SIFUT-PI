// paleta cancha - el acento solo va en botones/estados activos
export const colors = {
  primary: '#1E5B3A',
  primaryDark: '#0E3322',
  primaryLight: '#DCEBDE',
  secondary: '#28456B',
  accent: '#D3EF4E',
  accentText: '#16321F',
  background: '#F7F4EC',
  surface: '#FFFFFF',
  border: '#E3DFD1',
  text: '#152018',
  textMuted: '#6E7A70',
  placeholder: '#9CA79D',
  success: '#2F9E52',
  successLight: '#E1F1E3',
  warning: '#C4801F',
  warningLight: '#FBEBD3',
  danger: '#B3412C',
  dangerLight: '#F6E1DC',
  disabled: '#D8D3C4',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
};

// Bebas solo para numeros grandes, el resto siempre Manrope
export const fonts = {
  display: 'BebasNeue_400Regular',
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
};

export const typography = {
  title: { fontFamily: fonts.extraBold, fontSize: 22, color: colors.text, letterSpacing: -0.2 },
  subtitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  caption: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  // para marcador, precio, puntos
  display: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.primary,
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
  displaySmall: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.primary,
    letterSpacing: 0.3,
    fontVariant: ['tabular-nums'],
  },
};
