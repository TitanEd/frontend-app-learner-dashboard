import {
  DIRECT_PLUGIN,
  PLUGIN_OPERATIONS,
} from '@openedx/frontend-plugin-framework';
import { Settings } from '@openedx/paragon/icons';
import { Dropdown } from '@openedx/paragon';
import CustomMyCourseWidget from './src/widgets/CustomMyCourseWidget/CustomMyCourseWidget';
import CustomDashboardLayoutWidget from './src/widgets/CustomDashboardLayoutWidget/CustomDashboardLayoutWidget';
import CustomCourseFilterControls from './src/widgets/CustomCourseFilterControls/CustomCourseFilterControls';
import CustomCourseListWidget from './src/widgets/CustomCourseListWidget';
import CustomMasqueradeBar from './src/containers/MasqueradeBar/CustomMasqueradeBar';
import CustomNoCoursesView from './src/containers/CoursesPanel/NoCoursesView/CustomNoCoursesView';

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
    masquerade_bar_plugin_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'masquerade_bar_plugin_slot',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: (props) => <CustomMasqueradeBar {...props} />,
          },
        },
      ],
    },

    custom_no_courses_view_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_no_courses_view_slot',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: (props) => <CustomNoCoursesView {...props} />,
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
