from tutor import hooks
from tutormfe.hooks import PLUGIN_SLOTS


hooks.Filters.ENV_PATCHES.add_item(
     (
         "mfe-env-config-runtime-definitions-learner-dashboard",
         """
        // This file contains configuration for plugins and environment variables.
const { React } = await import('react');
const { PLUGIN_OPERATIONS, DIRECT_PLUGIN } = await import('@openedx/frontend-plugin-framework');

{% raw %}

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
config.pluginSlots = getPluginSlots();

{% endraw %}
"""
     ))

