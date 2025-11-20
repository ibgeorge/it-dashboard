import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, User, AlertCircle, FolderKanban, Settings, X } from 'lucide-react';
import { metricsService } from '../services/dataService';

export default function ActiveTickets() {
  const [showSettings, setShowSettings] = useState(false);
  const [activityHours, setActivityHours] = useState(72);
  const [projectDays, setProjectDays] = useState(40);
  const [tempActivityHours, setTempActivityHours] = useState('72');
  const [tempProjectDays, setTempProjectDays] = useState('40');

  const { data, isLoading, error } = useQuery({
    queryKey: ['active-tickets', activityHours, projectDays],
    queryFn: () => metricsService.getActiveTickets(activityHours, projectDays),
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  const applySettings = () => {
    const newActivityHours = Math.max(1, parseInt(tempActivityHours) || 72);
    const newProjectDays = Math.max(1, parseInt(tempProjectDays) || 40);
    setActivityHours(newActivityHours);
    setProjectDays(newProjectDays);
    setTempActivityHours(newActivityHours.toString());
    setTempProjectDays(newProjectDays.toString());
    setShowSettings(false);
  };

  const formatTimeSince = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)} minutes ago`;
    if (hours < 24) return `${Math.round(hours)} hours ago`;
    return `${Math.round(hours / 24)} days ago`;
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-amber-600 bg-amber-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading active tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load active tickets. Please try again.</p>
        </div>
      </div>
    );
  }

  const { activeTickets = [], projectTickets = [], summary = {} } = data?.data || {};

  return (
    <div className="space-y-6">
      {/* Active Work Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Active Work</h2>
              <p className="text-sm text-gray-600">
                Tickets updated in the last {activityHours} hours
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {summary.totalActive || 0} Active
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Threshold Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Window (hours)
                </label>
                <input
                  type="number"
                  value={tempActivityHours}
                  onChange={(e) => setTempActivityHours(e.target.value)}
                  min="1"
                  max="168"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Show tickets updated within this many hours
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Threshold (days)
                </label>
                <input
                  type="number"
                  value={tempProjectDays}
                  onChange={(e) => setTempProjectDays(e.target.value)}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Tickets older than this are shown as projects
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={applySettings} className="btn btn-primary">
                Apply Changes
              </button>
            </div>
          </div>
        )}

        {/* Active Tickets List */}
        {activeTickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No active tickets found in the last {activityHours} hours.</p>
            <p className="text-sm mt-1">Encourage agents to update their tickets regularly!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTickets.map((ticket) => (
              <div
                key={ticket.ticketid}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-500">
                        #{ticket.ticketid}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority || 'N/A'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {ticket.status}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {ticket.subject}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{ticket.agent_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeSince(ticket.hours_since_update)}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Age: {ticket.ticket_age_days} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Tickets Section */}
      {projectTickets.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FolderKanban className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Long-Running Projects</h2>
                <p className="text-sm text-gray-600">
                  Tickets older than {projectDays} days
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
              {summary.totalProjects || 0} Projects
            </span>
          </div>

          <div className="space-y-3">
            {projectTickets.map((ticket) => (
              <div
                key={ticket.ticketid}
                className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-500">
                        #{ticket.ticketid}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority || 'N/A'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                        {ticket.status}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {ticket.subject}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{ticket.agent_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeSince(ticket.hours_since_update)}</span>
                      </div>
                      <span className="text-xs font-semibold text-purple-600">
                        Age: {ticket.ticket_age_days} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
