import { useMemo } from 'react';

import { useInitializeLearnerHome } from 'data/hooks';
import { useFilters } from 'data/context';
import { getVisibleList, getTransformedCourseDataList } from 'utils/dataTransformers';

/**
 * Filters are fetched from the filters context and used to generate a list of "visible" courses.
 * Other values returned are the current page number, the sorting method,
 * and whether or not to enable filters and pagination.
 * Used by the custom TELS dashboard components.
 *
 * @returns course list data
 */
export const useCourseListData = () => {
  const { data } = useInitializeLearnerHome();
  const {
    filters, sortBy, setSortBy, pageNumber, setPageNumber, removeFilter,
  } = useFilters();

  const { numPages, visibleList } = useMemo(() => getVisibleList(
    getTransformedCourseDataList(data?.courses || []),
    filters,
    sortBy,
    pageNumber,
  ), [data, filters, sortBy, pageNumber]);

  const handleRemoveFilter = (filter) => () => removeFilter(filter);

  return {
    pageNumber,
    numPages,
    setPageNumber,
    visibleList,
    filterOptions: {
      sortBy,
      setSortBy,
      filters,
      handleRemoveFilter,
    },
    showFilters: filters.length > 0,
  };
};

export default useCourseListData;
