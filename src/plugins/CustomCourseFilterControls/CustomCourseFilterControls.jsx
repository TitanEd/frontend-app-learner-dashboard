/* eslint-disable linebreak-style */
/* eslint-disable react/prop-types */
import { Dropdown } from '@openedx/paragon';
import React from 'react';
import { useIntl } from 'react-intl';
import FilterForm from '../../containers/CourseFilterControls/components/FilterForm';
import SortForm from '../../containers/CourseFilterControls/components/SortForm';
import { useFilters } from '../../data/context';
import messages from '../../containers/CourseFilterControls/messages';
import MasqueradeBar from '../../containers/MasqueradeBar';
import './CustomCourseFilterControls.scss';

const CustomCourseFilterControls = ({
  hasCourses, filters, sortBy, setSortBy,
}) => {
  const { formatMessage } = useIntl();

  const { addFilter, removeFilter } = useFilters();

  const filterControls = {
    handleFilterChange: ({ target: { checked, value } }) => {
      const update = checked ? addFilter : removeFilter;
      update(value);
    },
  };
  const sortControls = {
    handleSortChange: ({ target: { value } }) => {
      setSortBy(value);
    },
  };
  return (
    <div
      id="course-filter-controls"
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
      }}
    >
      {/* Masquerade Bar */}
      <MasqueradeBar />
      {/* Course Status and Sort Row */}
      <div className="filter-buttons-row">
        {/* Course Status Dropdown */}
        <Dropdown style={{ display: 'inline-block' }}>
          <Dropdown.Toggle
            id="dropdown-course-status"
            variant="outline-primary"
            disabled={!hasCourses}
            size="sm"
          >
            {formatMessage(messages.courseStatus) || 'Course Status'}
          </Dropdown.Toggle>

          {/* IMPORTANT: stopPropagation prevents dropdown from auto-closing when interacting with the form */}
          <Dropdown.Menu
            style={{
              minWidth: '320px',
              padding: '10px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <FilterForm
              {...{
                filters,
                handleFilterChange: filterControls.handleFilterChange,
              }}
            />
          </Dropdown.Menu>
        </Dropdown>

        {/* Sort Dropdown */}
        <Dropdown style={{ display: 'inline-block' }}>
          <Dropdown.Toggle
            id="dropdown-sort"
            variant="outline-primary"
            disabled={!hasCourses}
            size="sm"
          >
            {formatMessage(messages.sort) || 'Sort'}
          </Dropdown.Toggle>

          <Dropdown.Menu
            style={{
              minWidth: '260px',
              padding: '10px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SortForm
              {...{
                sortBy,
                handleSortChange: sortControls.handleSortChange,
              }}
            />
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default CustomCourseFilterControls;
