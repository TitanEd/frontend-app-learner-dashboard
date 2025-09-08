import React from 'react';
import {
  DIRECT_PLUGIN,
  PLUGIN_OPERATIONS,
} from '@openedx/frontend-plugin-framework';

const config = {
  ...process.env,
  pluginSlots: {
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
  },
};

export default config;
