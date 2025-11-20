import apiClient from './api';

export const metricsService = {
  /**
   * Get summary metrics (total, open, closed tickets, avg resolution time)
   * @param {string} startDate - ISO date string
   * @param {string} endDate - ISO date string
   * @param {boolean} excludeAnomalies - Whether to exclude long-running tickets
   * @param {number} maxResolutionDays - Max days for resolution to be included in average
   * @returns {Promise<Object>}
   */
  async getSummary(startDate, endDate, excludeAnomalies = true, maxResolutionDays = 90) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    params.excludeAnomalies = excludeAnomalies ? 'true' : 'false';
    params.maxResolutionDays = maxResolutionDays;
    
    return apiClient.get('/metrics/summary', { params });
  },

  /**
   * Get resolution time metrics
   * @returns {Promise<Object>}
   */
  async getResolutionTimes() {
    return apiClient.get('/metrics/resolution-times');
  },

  /**
   * Get SLA compliance metrics
   * @returns {Promise<Object>}
   */
  async getSLACompliance() {
    return apiClient.get('/metrics/sla-compliance');
  },

  /**
   * Get ticket counts by status
   * @returns {Promise<Object>}
   */
  async getTicketsByStatus() {
    return apiClient.get('/metrics/tickets-by-status');
  },

  /**
   * Get ticket counts by priority
   * @returns {Promise<Object>}
   */
  async getTicketsByPriority() {
    return apiClient.get('/metrics/tickets-by-priority');
  },

  /**
   * Get agent performance metrics
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>}
   */
  async getAgentPerformance(filters = {}) {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.excludeAnomalies !== undefined) params.excludeAnomalies = filters.excludeAnomalies ? 'true' : 'false';
    if (filters.maxResolutionDays) params.maxResolutionDays = filters.maxResolutionDays;
    return apiClient.get('/metrics/agent-performance', { params });
  },

  /**
   * Get ticket trends over time
   * @param {number} days - Number of days to fetch (default 30)
   * @returns {Promise<Object>}
   */
  async getTicketTrends(days = 30) {
    return apiClient.get('/metrics/ticket-trends', { params: { days } });
  },

  /**
   * Get ticket counts by category/type
   * @returns {Promise<Object>}
   */
  async getTicketsByCategory() {
    return apiClient.get('/metrics/tickets-by-category');
  },

  /**
   * Get team performance metrics
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>}
   */
  async getTeamMetrics(filters = {}) {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.excludeAnomalies !== undefined) params.excludeAnomalies = filters.excludeAnomalies ? 'true' : 'false';
    if (filters.maxResolutionDays) params.maxResolutionDays = filters.maxResolutionDays;
    return apiClient.get('/metrics/team-metrics', { params });
  },

  /**
   * Get active tickets (recently updated)
   * @param {number} activityHours - Hours since last update (default 72)
   * @param {number} projectDaysThreshold - Days to categorize as project (default 40)
   * @returns {Promise<Object>}
   */
  async getActiveTickets(activityHours = 72, projectDaysThreshold = 40) {
    return apiClient.get('/metrics/active-tickets', { 
      params: { activityHours, projectDaysThreshold } 
    });
  }
};

export const ticketsService = {
  /**
   * Get all tickets with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>}
   */
  async getTickets(filters = {}) {
    return apiClient.get('/tickets', { params: filters });
  }
};

export const agentsService = {
  /**
   * Get agent performance data
   * @returns {Promise<Object>}
   */
  async getAgents() {
    return apiClient.get('/agents');
  }
};

export const teamsService = {
  /**
   * Get team metrics
   * @returns {Promise<Object>}
   */
  async getTeams() {
    return apiClient.get('/teams');
  }
};
