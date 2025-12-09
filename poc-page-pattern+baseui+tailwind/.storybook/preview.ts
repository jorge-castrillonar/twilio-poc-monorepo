import type { Preview } from '@storybook/react';
import { withReduxProvider } from './decorators';
import '../src/styles/tailwind.css';

const preview: Preview = {
  decorators: [withReduxProvider],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#F4F4F6',
        },
        {
          name: 'white',
          value: '#FFFFFF',
        },
        {
          name: 'dark',
          value: '#121C2D',
        },
      ],
    },
  },
};

export default preview;
