import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../shared/DataTable';
import FormInput from '../shared/FormInput';
import StatCard from '../shared/StatCard';
import { toLocaleDateStringEN } from '../../utils/dateFormatter';
import { getAllAccidents, getAccidentStats } from '../../services/accidentApi';
import { toast } from 'react-hot-toast';

const AccidentsReport = () => {
  const { t, i18n: { language } } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAccidents: 0,
    openAccidents: 0,
    closedAccidents: 0,
    inProgressAccidents: 0
  });
  const [filters, setFilters] = useState({
    periodFrom: '',
    periodTo: '',
    priority: '',
    status: ''
  });

  const columns = [
    {
      header: t('accidents.ticketNumber', 'Ticket #'),
      accessor: 'ticketNumber',
      render: (value) => (
        <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
          {value}
        </span>
      )
    },
    {
      header: t('accidents.customer', 'Customer'),
      accessor: 'insured',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.insured?.first_name} {row.insured?.last_name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.insured?.id_Number}
          </div>
        </div>
      )
    },
    {
      header: t('accidents.vehicle', 'Vehicle'),
      accessor: 'vehicle',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.vehicle?.model || '-'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.vehicle?.plateNumber || '-'}
          </div>
        </div>
      )
    },
    {
      header: t('accidents.priority', 'Priority'),
      accessor: 'priority',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'urgent'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            : value === 'high'
            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
            : value === 'medium'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: t('accidents.status', 'Status'),
      accessor: 'status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'closed'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : value === 'in_progress'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            : value === 'open'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: t('accidents.description', 'Description'),
      accessor: 'description',
      render: (value, row) => (
        <div className="max-w-xs truncate text-gray-700 dark:text-gray-300">
          {row.title || row.description || '-'}
        </div>
      )
    },
    {
      header: t('accidents.createdAt', 'Created'),
      accessor: 'createdAt',
      render: (value) => toLocaleDateStringEN(value)
    }
  ];

  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchStats = async () => {
    try {
      const response = await getAccidentStats();
      setStats(response.stats || {
        totalAccidents: 0,
        openAccidents: 0,
        closedAccidents: 0,
        inProgressAccidents: 0
      });
    } catch (error) {
      console.error('Error fetching accident stats:', error);
      toast.error(t('accidents.statsLoadError', 'Failed to load statistics'));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiFilters = {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      // Add filters if they exist
      if (filters.status) {
        apiFilters.status = filters.status;
      }
      if (filters.priority) {
        apiFilters.priority = filters.priority;
      }

      // Get all accidents with filters
      const response = await getAllAccidents(apiFilters);
      let accidents = response.accidents || [];

      // Apply date range filters on the client side
      if (filters.periodFrom) {
        accidents = accidents.filter(item =>
          new Date(item.createdAt) >= new Date(filters.periodFrom)
        );
      }
      if (filters.periodTo) {
        accidents = accidents.filter(item =>
          new Date(item.createdAt) <= new Date(filters.periodTo)
        );
      }

      setData(accidents);
    } catch (error) {
      console.error('Error fetching accidents data:', error);
      toast.error(t('accidents.loadError', 'Failed to load accidents'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      periodFrom: '',
      periodTo: '',
      priority: '',
      status: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('reports.accidents.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('reports.accidents.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title={t('accidents.totalAccidents', 'Total Accidents')}
            value={stats.totalAccidents || data.length}
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <StatCard
            title={t('accidents.openAccidents', 'Open')}
            value={stats.openAccidents || data.filter(a => a.status === 'open').length}
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title={t('accidents.inProgressAccidents', 'In Progress')}
            value={stats.inProgressAccidents || data.filter(a => a.status === 'in_progress').length}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
          <StatCard
            title={t('accidents.closedAccidents', 'Closed')}
            value={stats.closedAccidents || data.filter(a => a.status === 'closed').length}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('common.filters')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput
              type="date"
              label={t('reports.accidents.periodFrom')}
              value={filters.periodFrom}
              onChange={(e) => handleFilterChange('periodFrom', e.target.value)}
            />

            <FormInput
              type="date"
              label={t('reports.accidents.periodTo')}
              value={filters.periodTo}
              onChange={(e) => handleFilterChange('periodTo', e.target.value)}
            />

            <FormInput
              type="select"
              label={t('accidents.priority', 'Priority')}
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: 'low', label: t('accidents.priorityLow', 'Low') },
                { value: 'medium', label: t('accidents.priorityMedium', 'Medium') },
                { value: 'high', label: t('accidents.priorityHigh', 'High') },
                { value: 'urgent', label: t('accidents.priorityUrgent', 'Urgent') }
              ]}
            />

            <FormInput
              type="select"
              label={t('accidents.status', 'Status')}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: 'open', label: t('accidents.statusOpen', 'Open') },
                { value: 'in_progress', label: t('accidents.statusInProgress', 'In Progress') },
                { value: 'closed', label: t('accidents.statusClosed', 'Closed') }
              ]}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('common.search')}
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('common.clear')}
            </button>
          </div>
        </div>

        <DataTable
          data={data}
          columns={columns}
          title={t('reports.accidents.title')}
          loading={loading}
          onRefresh={fetchData}
          enableSearch={true}
          enableExport={true}
        />
      </div>
    </div>
  );
};

export default AccidentsReport;