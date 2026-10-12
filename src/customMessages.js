import { defineMessages } from '@edx/frontend-platform/i18n';

// Messages of the custom UI (sidebar, course cards). Kept apart from the
// stock src/messages.js.
const messages = defineMessages({
  sidebarDashboardTitle: {
    id: 'sidebar.dashboard.title',
    defaultMessage: 'Dashboard',
    description: 'Title of the dashboard sidebar item',
  },
  sidebarCreateNewCourseTitle: {
    id: 'sidebar.create-new-course.title',
    defaultMessage: 'Create New Course',
    description: 'Title of the create new course sidebar item',
  },
  sidebarMyCoursesTitle: {
    id: 'sidebar.my-courses.title',
    defaultMessage: 'My Courses',
    description: 'Title of the my courses sidebar item',
  },
  sidebarContentLibrariesTitle: {
    id: 'sidebar.content-libraries.title',
    defaultMessage: 'Content Libraries',
    description: 'Title of the content libraries sidebar item',
  },
  sidebarCalendarTitle: {
    id: 'sidebar.calendar.title',
    defaultMessage: 'Calendar',
    description: 'Title of the calendar sidebar item',
  },
  sidebarClassPlannerTitle: {
    id: 'sidebar.class-planner.title',
    defaultMessage: 'Class Planner',
    description: 'Title of the class planner sidebar item',
  },
  sidebarInsightsReportsTitle: {
    id: 'sidebar.insights-reports.title',
    defaultMessage: 'Insights & Reports',
    description: 'Title of the insights & reports sidebar item',
  },
  sidebarTitanAITitle: {
    id: 'sidebar.titan-ai.title',
    defaultMessage: 'TitanAI Assistant',
    description: 'Title of the titan ai assistant sidebar item',
  },
  sidebarSharedResourcesTitle: {
    id: 'sidebar.shared-resources.title',
    defaultMessage: 'Shared Resources',
    description: 'Title of the shared resources sidebar item',
  },
  sidebarTaxonomiesTitle: {
    id: 'sidebar.taxonomies.title',
    defaultMessage: 'Taxonomies',
    description: 'Title of the taxonomies sidebar item',
  },
  sidebarAssignmentsTitle: {
    id: 'sidebar.Assignments.title',
    defaultMessage: 'Assignments',
    description: 'Title of the Assignments sidebar item',
  },
  viewCertificate: {
    id: 'learner-dashboard.view-certificate',
    defaultMessage: 'View Certificate',
    description: 'View certificate button text',
  },
  resumeCourse: {
    id: 'learner-dashboard.custom.resume-course',
    defaultMessage: 'Resume Course',
    description: 'Button that resumes a course in the continue learning card',
  },
  loadingRecommendedCourses: {
    id: 'learner-dashboard.custom.loading-recommended-courses',
    defaultMessage: 'Loading recommended courses...',
    description: 'Screen reader text while recommended courses load',
  },
  loadingCourses: {
    id: 'learner-dashboard.custom.loading-courses',
    defaultMessage: 'Loading courses...',
    description: 'Screen reader text while the course list loads',
  },
  aiSuggestionIconAlt: {
    id: 'learner-dashboard.custom.ai-suggestion-icon-alt',
    defaultMessage: 'AI suggestion',
    description: 'Alt text of the stars icon next to AI suggestions',
  },
  lessonsCount: {
    id: 'learner-dashboard.custom.lessons-count',
    defaultMessage: '{count, plural, one {# Lesson} other {# Lessons}}',
    description: 'Number of lessons of a recommended course',
  },
  studentsCount: {
    id: 'learner-dashboard.custom.students-count',
    defaultMessage: '{count, plural, one {# Student} other {# Students}}',
    description: 'Number of students of a recommended course',
  },
  courseListLabel: {
    id: 'learner-dashboard.custom.course-list.pagination-label',
    defaultMessage: 'Course List',
    description: 'Accessible label of the My Courses pagination',
  },
  courseCoverAlt: {
    id: 'learner-dashboard.custom.course-cover-alt',
    defaultMessage: 'Course cover',
    description: 'Alt text of a course card image',
  },
  courseCardStarts: {
    id: 'learner-dashboard.custom.course-card.starts',
    defaultMessage: 'Starts {date}',
    description: 'Start date of a course run that has not started yet, on a course card',
  },
  courseCardStarted: {
    id: 'learner-dashboard.custom.course-card.started',
    defaultMessage: 'Started {date}',
    description: 'Start date of a course run that has already started, on a course card',
  },
  courseCardEnds: {
    id: 'learner-dashboard.custom.course-card.ends',
    defaultMessage: 'Ends {date}',
    description: 'End date of a course run that has not ended yet, on a course card',
  },
  courseCardEnded: {
    id: 'learner-dashboard.custom.course-card.ended',
    defaultMessage: 'Ended {date}',
    description: 'End date of a course run that has ended, on a course card',
  },
  untitledCourse: {
    id: 'learner-dashboard.custom.untitled-course',
    defaultMessage: 'Untitled Course',
    description: 'Shown when a course has no name',
  },
  loadingEmptyDashboard: {
    id: 'learner-dashboard.custom.loading-empty-dashboard',
    defaultMessage: 'Loading empty dashboard content...',
    description: 'Screen reader text while the no-courses content loads',
  },
  sidebarLoading: {
    id: 'learner-dashboard.custom.layout.sidebar.loading',
    defaultMessage: 'Loading navigation',
    description: 'Screen reader text while the custom learner-dashboard sidebar is loading',
  },
});

export default messages;
