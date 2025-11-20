import { useState } from 'react';
import { Filter, X } from 'lucide-react';

function MetricsFilter({ onFilterChange, defaultRange = 'currentYear', initialFilters = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState(() => {
    if (initialFilters) {
      // Determine dateRange from initial filter dates
      const now = new Date();
      const startDate = new Date(initialFilters.startDate);
      const currentYearStart = new Date(now.getFullYear(), 0, 1);
      
      let dateRange = defaultRange;
      if (startDate.getTime() === currentYearStart.getTime()) {
        dateRange = 'currentYear';
      } else if (startDate.getFullYear() === 1970) {
        dateRange = 'allTime';
      }
      
      return {
        dateRange,
        excludeAnomalies: initialFilters.excludeAnomalies ?? (defaultRange === 'currentYear'),
        maxResolutionDays: initialFilters.maxResolutionDays ?? 90,
      };
    }
    return {
      dateRange: defaultRange,
      excludeAnomalies: defaultRange === 'currentYear',
      maxResolutionDays: 90,
    };
  });
  const [tempMaxDays, setTempMaxDays] = useState(filters.maxResolutionDays.toString());

  const dateRangeOptions = [
    { value: 'currentYear', label: 'Current Year', getRange: () => ({
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
      endDate: new Date().toISOString()
    })},
    { value: 'last6Months', label: 'Last 6 Months', getRange: () => ({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(),
      endDate: new Date().toISOString()
    })},
    { value: 'last3Months', label: 'Last 3 Months', getRange: () => ({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
      endDate: new Date().toISOString()
    })},
    { value: 'lastMonth', label: 'Last Month', getRange: () => ({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      endDate: new Date().toISOString()
    })},
    { value: 'allTime', label: 'All Time', getRange: () => ({
      startDate: new Date('1970-01-01').toISOString(),
      endDate: new Date().toISOString()
    })},
  ];

  const handleFilterUpdate = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Get date range based on selection
    const selectedRange = dateRangeOptions.find(opt => opt.value === newFilters.dateRange);
    const dateRange = selectedRange ? selectedRange.getRange() : {};

    // Call parent callback with all filter values
    onFilterChange({
      ...dateRange,
      excludeAnomalies: newFilters.excludeAnomalies,
      maxResolutionDays: newFilters.maxResolutionDays,
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Filters
        {filters.excludeAnomalies && (
          <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            Active
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop - only close on click, not on child interactions */}
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsOpen(false);
              }
            }}
          ></div>

          {/* Filter Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
               onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Data Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterUpdate('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dateRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Focus metrics on recent activity
                </p>
              </div>

              {/* Exclude Anomalies */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.excludeAnomalies}
                    onChange={(e) => handleFilterUpdate('excludeAnomalies', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Exclude long-running tickets
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  Filter out tickets with extended resolution times (projects, on-hold, etc.)
                </p>
              </div>

              {/* Max Resolution Days */}
              {filters.excludeAnomalies && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Resolution Time (days)
                  </label>
                  <input
                    type="number"
                    value={tempMaxDays}
                    onChange={(e) => setTempMaxDays(e.target.value)}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || 90;
                      const clampedValue = Math.min(Math.max(value, 1), 365);
                      setTempMaxDays(clampedValue.toString());
                      handleFilterUpdate('maxResolutionDays', clampedValue);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Tickets resolved in more than {filters.maxResolutionDays} days will be excluded from averages
                  </p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>💡 Tip:</strong> These filters help focus on standard ticket operations by excluding long-term projects and tickets with external dependencies.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MetricsFilter;
