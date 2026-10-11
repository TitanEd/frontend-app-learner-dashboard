import React from 'react';

import {
  DIRECT_PLUGIN,
  PLUGIN_OPERATIONS,
} from '@openedx/frontend-plugin-framework';

import CustomLayout from './src/CustomLayout';

const getPluginSlots = () => {
  return {
    // Replaces the stock learner dashboard routes (src/index.jsx) with the custom UI.
    app_layout_plugin_slot: {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Hide,
          widgetId: 'default_contents',
        },
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_app_layout',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: () => <CustomLayout />,
          },
        },
      ],
    },
  };
};

// Load environment variables from .env file
const config = {
  ...process.env,
  get pluginSlots() {
    return getPluginSlots();
  },
};

export default config;
