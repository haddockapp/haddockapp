import type { Preview } from "@storybook/react";
import "../src/index.css";
import { withRouter } from "storybook-addon-react-router-v6";
import { initialize, mswDecorator } from 'msw-storybook-addon';

// Initialize MSW
initialize();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [withRouter, mswDecorator],
};

export default preview;
