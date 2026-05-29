import { createTheme } from '@mantine/core';

export const theme = createTheme({
  fontFamily: 'DM Sans, sans-serif',
  fontFamilyMonospace: 'IBM Plex Mono, monospace',
  primaryColor: 'gray',
  defaultRadius: 'sm',
  colors: {
    dark: [
      '#e8e8e8',
      '#aaaaaa',
      '#888888',
      '#444444',
      '#1f1f1f',
      '#1a1a1a',
      '#161616',
      '#111111',
      '#0d0d0d',
      '#0a0a0a',
    ],
  },
  components: {
    Button: {
      defaultProps: { variant: 'default' },
    },
    Card: {
      defaultProps: { bg: 'dark.7', withBorder: true },
    },
    Badge: {
      defaultProps: { variant: 'outline', color: 'gray' },
    },
  },
});
