import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAccidentStats } from '../services/accidentApi';
import { toast } from 'react-hot-toast';
import {
  AlertTriangle,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';

const AccidentStats = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    total: 0,
    byStatus: [],
    byPriority: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await getAccidentStats();
      setStats(response);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error(t('accidents.statsLoadError', 'Failed to load statistics'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status) => {
    const item = stats.byStatus.find(s => s._id === status);
    return item ? item.count : 0;
  };

  const getPriorityCount = (priority) => {
    const item = stats.byPriority.find(p => p._id === priority);
    return item ? item.count : 0;
  };

  const getPercentage = (count, total) => {
    if (total === 0) return 0;
    return ((count / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          {t('accidents.statistics', 'Accident Statistics')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('accidents.statsSubtitle', 'Overview of accident tickets')}
        </p>
      </div>

      {/* Total Tickets Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white col-span-1 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                {t('accidents.totalTickets', 'Total Tickets')}
              </p>
              <h2 className="text-5xl font-bold mt-2">{stats.total}</h2>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-full">
              <AlertTriangle className="w-12 h-12" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm text-blue-100">
              {t('accidents.allTime', 'All time')}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                {t('accidents.statusOpen', 'Open')}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {getStatusCount('open')}
              </p>
            </div>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${getPercentage(getStatusCount('open'), stats.total)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                {t('accidents.statusInProgress', 'In Progress')}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {getStatusCount('in_progress')}
              </p>
            </div>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full"
              style={{ width: `${getPercentage(getStatusCount('in_progress'), stats.total)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            {t('accidents.byStatus', 'Tickets by Status')}
          </h3>
          <div className="space-y-4">
            {[
              { status: 'open', color: 'blue', icon: AlertCircle },
              { status: 'in_progress', color: 'orange', icon: Clock },
              { status: 'pending_review', color: 'purple', icon: AlertCircle },
              { status: 'resolved', color: 'green', icon: CheckCircle },
              { status: 'closed', color: 'gray', icon: XCircle }
            ].map(({ status, color, icon: Icon }) => {
              const count = getStatusCount(status);
              const percentage = getPercentage(count, stats.total);
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                      <span className="text-gray-700 capitalize">
                        {t(`accidents.status${status.charAt(0).toUpperCase() + status.slice(1)}`, status.replace('_', ' '))}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 text-sm">{percentage}%</span>
                      <span className="font-semibold text-gray-800 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className={`bg-${color}-500 h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            {t('accidents.byPriority', 'Tickets by Priority')}
          </h3>
          <div className="space-y-4">
            {[
              { priority: 'low', color: 'green', level: 1 },
              { priority: 'medium', color: 'orange', level: 2 },
              { priority: 'high', color: 'red', level: 3 },
              { priority: 'urgent', color: 'red', level: 4 }
            ].map(({ priority, color, level }) => {
              const count = getPriorityCount(priority);
              const percentage = getPercentage(count, stats.total);
              return (
                <div key={priority}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {Array.from({ length: level }).map((_, i) => (
                          <AlertTriangle
                            key={i}
                            className={`w-4 h-4 text-${color}-600 fill-current`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-700 capitalize">
                        {t(`accidents.priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`, priority)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 text-sm">{percentage}%</span>
                      <span className="font-semibold text-gray-800 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className={`bg-${color}-500 h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { status: 'open', label: t('accidents.statusOpen', 'Open'), color: 'blue', icon: AlertCircle },
          { status: 'in_progress', label: t('accidents.statusInProgress', 'In Progress'), color: 'orange', icon: Clock },
          { status: 'pending_review', label: t('accidents.statusPendingReview', 'Pending Review'), color: 'purple', icon: AlertCircle },
          { status: 'resolved', label: t('accidents.statusResolved', 'Resolved'), color: 'green', icon: CheckCircle },
          { status: 'closed', label: t('accidents.statusClosed', 'Closed'), color: 'gray', icon: XCircle }
        ].map(({ status, label, color, icon: Icon }) => (
          <div key={status} className={`bg-${color}-50 rounded-lg shadow-md p-4 text-center border-t-4 border-${color}-500`}>
            <Icon className={`w-8 h-8 text-${color}-600 mx-auto mb-2`} />
            <p className="text-gray-600 text-sm mb-1">{label}</p>
            <p className={`text-3xl font-bold text-${color}-600`}>
              {getStatusCount(status)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccidentStats;
