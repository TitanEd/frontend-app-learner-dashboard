from tutor import hooks
from tutormfe.hooks import PLUGIN_SLOTS


hooks.Filters.ENV_PATCHES.add_item(
     (
         "mfe-env-config-runtime-definitions-learner-dashboard",
         """
        // This file contains configuration for plugins and environment variables.
const { React } = await import('react');
const { PLUGIN_OPERATIONS, DIRECT_PLUGIN } = await import('@openedx/frontend-plugin-framework');
const { Settings } = await import('@openedx/paragon/icons');
const { Dropdown } = await import('@openedx/paragon');
const {default: CustomMyCourseWidget} = await import('./src/widgets/CustomMyCourseWidget/CustomMyCourseWidget');
const {default: CustomDashboardLayoutWidget} = await import('./src/widgets/CustomDashboardLayoutWidget/CustomDashboardLayoutWidget');
const {default: CustomCourseFilterControls} = await import('./src/widgets/CustomCourseFilterControls/CustomCourseFilterControls');
const {default: CustomCourseListWidget} = await import('./src/widgets/CustomCourseListWidget');

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
    custom_my_course_plugin_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_my_course_plugin_slot',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: (props) => <CustomMyCourseWidget {...props} />,
          },
        },
      ],
    },
    custom_dashboard_layout_plugin_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_dashboard_layout_plugin_slot',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: (props) => <CustomDashboardLayoutWidget {...props} />,
          },
        },
      ],
    },

    custom_course_list_plugin_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_course_list_plugin_slot',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: (props) => <CustomCourseListWidget {...props} />,
          },
        },
      ],
    },
    custom_unenroll_icon_plugin_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_unenroll_icon_plugin_slot',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: ({
              cardId, IconButton, Icon, altValue,
            }) => (
              <Dropdown.Toggle
                id={`course-actions-dropdown-${cardId}`}
                as={IconButton}
                src={Settings} // make sure MoreVert is imported
                iconAs={Icon}
                variant="primary"
                alt={altValue}
              />
            ),
          },
        },
      ],
    },

    custom_course_filter_controls_plugin_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_course_filter_controls_plugin_slot',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: (props) => <CustomCourseFilterControls {...props} />,
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

