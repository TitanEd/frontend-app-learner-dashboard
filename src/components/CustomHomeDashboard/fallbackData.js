// Frontend fallback for the custom home dashboard: when the TitanEd dashboard
// APIs (/titaned/api/v1/lms-dashboard/*) return nothing, use the existing mock
// data from db.json (the same data the tels/sumac.1 dashboard used locally).
import mockData from '../../../db.json';

const hasItems = (list) => Array.isArray(list) && list.length > 0;

export const getFallbackMetrics = () => mockData.dashboard?.metrics || [];

export const getFallbackWidgets = () => mockData.widgets || [];

export const getFallbackAISuggestions = () => mockData.dashboard?.titanAISuggestions || [];

export const getFallbackTodoList = () => mockData.dashboard?.todoList || [];

export const withFallback = (list, fallback) => (hasItems(list) ? list : fallback());
