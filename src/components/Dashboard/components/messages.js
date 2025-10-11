import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  dashboardPageTitle: {
    id: 'dashboard.page.title',
    defaultMessage: 'Dashboard',
    description: 'Title of the dashboard page',
  },
  loading: {
    id: 'dashboard.loading',
    defaultMessage: 'Loading...',
    description: 'Generic loading text shown while dashboard content loads',
  },
  errorLoadingData: {
    id: 'dashboard.error.loading',
    defaultMessage: 'Error loading dashboard data',
    description: 'Error message when dashboard data fails to load',
  },
  continueLearningTitle: {
    id: 'dashboard.continueLearning.title',
    defaultMessage: 'Continue Learning',
    description: 'Section title for continue learning',
  },
  viewAll: {
    id: 'dashboard.viewAll',
    defaultMessage: 'View All',
    description: 'Link to view all items',
  },
  loadingWidgetsSr: {
    id: 'dashboard.widgets.loading.sr',
    defaultMessage: 'Loading widgets...',
    description: 'Screen-reader text for widget loading state',
  },
  warningLabel: {
    id: 'dashboard.warning',
    defaultMessage: 'Warning:',
    description: 'Warning label for alerts',
  },
  noWidgetsAvailable: {
    id: 'dashboard.widgets.none',
    defaultMessage: 'No widgets available at the moment.',
    description: 'Shown when there are no widgets to display',
  },
  loadWidgets: {
    id: 'dashboard.loadWidgets',
    defaultMessage: 'Load Widgets',
    description: 'Button label to load widgets',
  },
  titanAiSuggestion: {
    id: 'dashboard.titanAiSuggestion',
    defaultMessage: 'Titan AI suggestion',
    description: 'Header for titan ai suggestion card',
  },
  noSuggestionsYet: {
    id: 'dashboard.noSuggestionsYet',
    defaultMessage: 'No suggestions yet.',
    description: 'Shown when there are no AI suggestions',
  },
  todoList: {
    id: 'dashboard.todoList',
    defaultMessage: 'Todo List',
    description: 'Header for todo list card',
  },
  noTasksAdded: {
    id: 'dashboard.noTasksAdded',
    defaultMessage: 'No tasks added.',
    description: 'Shown when there are no todo tasks',
  },
  noCoursesInProgress: {
    id: 'dashboard.noCoursesInProgress',
    defaultMessage: 'No courses in progress to resume.',
    description: 'Shown when there are no in-progress courses to resume in continue learning',
  },
  noCourseInProgress: {
    id: 'dashboard.noCourseInProgress',
    defaultMessage: 'No course in progress to resume.',
    description: 'Alternate singular copy for continue learning component',
  },
  youtubeDefaultTitle: {
    id: 'dashboard.youtube.defaultTitle',
    defaultMessage: 'YouTube video',
    description: 'Default title for embedded youtube videos in widgets',
  },
  loadingSmall: {
    id: 'dashboard.loading.small',
    defaultMessage: 'Loading...',
    description: 'Small loading text used in progress components',
  },
  completedSuffix: {
    id: 'dashboard.completed',
    defaultMessage: 'Completed',
    description: 'Suffix label for completed percentage',
  },
  leaderboardTitle: {
    id: 'dashboard.leaderboard.title',
    defaultMessage: 'Leaderboard',
    description: 'Leaderboard card header',
  },
  noLeaderboardData: {
    id: 'dashboard.leaderboard.none',
    defaultMessage: 'No leaderboard data available.',
    description: 'Shown when leaderboard is empty',
  },
  streakDays: {
    id: 'dashboard.streak.days',
    defaultMessage: '{days} Days',
    description: 'Streak days label',
  },
});

export default messages;
