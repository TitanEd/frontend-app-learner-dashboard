import React from 'react';
import {
  DIRECT_PLUGIN,
  PLUGIN_OPERATIONS,
} from '@openedx/frontend-plugin-framework';

const getPluginSlots = () => {
  if (typeof window !== 'undefined' && localStorage.getItem('oldUI') === 'true') {
    return {};
  }

  return {
    header_footer_hide_plugin_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Hide,
          widget: {
            id: 'header_footer_hide_plugin_slot',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: {},
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
