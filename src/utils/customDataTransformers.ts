import { FilterKeys, SortKeys } from 'data/constants/app';
import StrictDict from './StrictDict';

export const CustomListPageSize = 10;

const getCustomVisibleList = (courses: any[], filters: string[], sortBy: string, pageNumber: number) => {
  const courseFilters = StrictDict({
    [FilterKeys.notEnrolled]: (course) => !course.enrollment.isEnrolled,
    [FilterKeys.done]: (course) => course.courseRun !== null && course.courseRun.isArchived,
    [FilterKeys.upgraded]: (course) => course.enrollment.isVerified,
    [FilterKeys.inProgress]: (course) => course.enrollment.hasStarted,
    [FilterKeys.notStarted]: (course) => !course.enrollment.hasStarted,
  });

  const transforms = StrictDict({
    [SortKeys.enrolled]: ({ enrollment }) => new Date(enrollment?.lastEnrolled),
    [SortKeys.title]: ({ course }) => course.courseName.toLowerCase(),
  });

  const courseFilterFn = filtersList => (filtersList.length
    ? course => filtersList.reduce((match, filter) => match && courseFilters[filter](course), true)
    : () => true);

  const sortFn = (transform, { reverse }) => (v1, v2) => {
    const [a, b] = [v1, v2].map(transform);
    if (a === b) { return 0; }
    return (((a as any) > (b as any)) ? 1 : -1) * (reverse ? -1 : 1);
  };

  const list = courses
    .filter(courseFilterFn(filters))
    .sort(sortFn(transforms[sortBy], { reverse: sortBy === SortKeys.enrolled }));

  const querySearch = new URLSearchParams(window.location.search);
  const disablePagination = querySearch.get('disable_pagination');
  const pageSize = Number(disablePagination) === 1 ? 0 : CustomListPageSize;

  if (pageSize === 0) {
    return {
      visibleList: list,
      numPages: 1,
    };
  }
  return {
    visibleList: list.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
    numPages: Math.ceil(list.length / pageSize),
  };
};

export { getCustomVisibleList };
