from tutor import hooks
from tutormfe.hooks import PLUGIN_SLOTS

hooks.Filters.ENV_PATCHES.add_item(
    (
        "mfe-env-config-runtime-definitions-learner-dashboard",
        """
// Runtime plugin configuration injected by Tutor
const { PLUGIN_OPERATIONS, DIRECT_PLUGIN } = await import('@openedx/frontend-plugin-framework');

const { default: CustomLayout } = await import('./src/CustomLayout');

{% raw %}

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

config.pluginSlots = getPluginSlots();

{% endraw %}
""",
    )
)
