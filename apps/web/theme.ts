import { createTheme } from '@mantine/core';

export const theme = createTheme({
  fontFamily: 'D-DIN, Arial Narrow, Arial, sans-serif',
  fontFamilyMonospace: 'IBM Plex Mono, Consolas, monospace',
  primaryColor: 'dark',
  defaultRadius: 'md',
  colors: {
    dark: [
      '#f5f5f5',
      '#d9d9d9',
      '#bdbdbd',
      '#8c8c8c',
      '#3d3d3d',
      '#252525',
      '#1a1a1a',
      '#111111',
      '#0b0b0b',
      '#000000',
    ],
  },
  components: {
    Button: {
      defaultProps: { variant: 'outline', radius: 'xl', tt: 'uppercase', fw: 700 },
    },
    Card: {
      defaultProps: { bg: 'dark.8', withBorder: true, radius: 'md' },
    },
    Badge: {
      defaultProps: { variant: 'outline', color: 'gray' },
    },
    TextInput: {
      defaultProps: { radius: 'sm', size: 'md' },
    },
    NavLink: {
      defaultProps: { color: 'gray' },
    },
  },
});
