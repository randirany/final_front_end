import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllAccidents, deleteAccident } from '../services/accidentApi';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  AlertTriangle,
  Plus,
  Eye,
  Trash2
} from 'lucide-react';
import { formatDateISO } from '../utils/dateFormatter';
import AddAccidentModal from './AddAccidentModal';
import DataTable from './shared/DataTable';

const AccidentList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    loadAccidents();
  }, []);

  const loadAccidents = async () => {
    setLoading(true);
    try {
      const response = await getAllAccidents({
        limit: 1000,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setAccidents(response.accidents || []);
    } catch (error) {
      console.error('Error loading accidents:', error);
      toast.error(t('accidents.loadError', 'Failed to load accidents'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, ticketNumber) => {
    const result = await Swal.fire({
      title: t('accidents.deleteTitle', 'Delete Accident Ticket?'),
      text: t('accidents.deleteText', `Are you sure you want to delete ticket ${ticketNumber}?`),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('common.delete', 'Delete'),
      cancelButtonText: t('common.cancel', 'Cancel')
    });

    if (result.isConfirmed) {
      try {
        await deleteAccident(id);
        toast.success(t('accidents.deleteSuccess', 'Accident ticket deleted successfully'));
        loadAccidents();
      } catch (error) {
        console.error('Error deleting accident:', error);
        toast.error(t('accidents.deleteError', 'Failed to delete accident ticket'));
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      pending_review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    };
    return colors[status] || colors.closed;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[priority] || colors.low;
  };

  // Filter accidents based on status and priority filters
  const filteredAccidents = useMemo(() => {
    let filtered = accidents;

    if (statusFilter) {
      filtered = filtered.filter(acc => acc.status === statusFilter);
    }

    if (priorityFilter) {
      filtered = filtered.filter(acc => acc.priority === priorityFilter);
    }

    return filtered;
  }, [accidents, statusFilter, priorityFilter]);

  // Define columns for DataTable
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
      header: t('accidents.title', 'Title'),
      accessor: 'title',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
            {value}
          </div>
          {row.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {row.description}
            </div>
          )}
        </div>
      )
    },
    {
      header: t('accidents.customer', 'Customer'),
      accessor: 'insured',
      render: (value) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.first_name} {value?.last_name}
        </div>
      )
    },
    {
      header: t('accidents.status', 'Status'),
      accessor: 'status',
      render: (value) => {
        const statusKey = value.charAt(0).toUpperCase() + value.slice(1).replace('_', '');
        return (
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(value)}`}>
            {t(`accidents.status${statusKey}`, value.replace('_', ' '))}
          </span>
        );
      }
    },
    {
      header: t('accidents.priority', 'Priority'),
      accessor: 'priority',
      render: (value) => {
        const priorityKey = value.charAt(0).toUpperCase() + value.slice(1);
        return (
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(value)}`}>
            {t(`accidents.priority${priorityKey}`, value)}
          </span>
        );
      }
    },
    {
      header: t('accidents.date', 'Date'),
      accessor: 'createdAt',
      render: (value) => formatDateISO(value)
    },
    {
      header: t('common.actions', 'Actions'),
      accessor: 'actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => navigate(`/accidents/${row.ticketNumber}`)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            title={t('common.view', 'View')}
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDelete(row._id, row.ticketNumber)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            title={t('common.delete', 'Delete')}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-dark2 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            {t('accidents.title', 'Accident Tickets')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('accidents.subtitle', 'Manage vehicle accident reports and tickets')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          {t('accidents.createNew', 'Create Ticket')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('accidents.status', 'Status')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">{t('accidents.allStatuses', 'All Statuses')}</option>
              <option value="open">{t('accidents.statusOpen', 'Open')}</option>
              <option value="in_progress">{t('accidents.statusInProgress', 'In Progress')}</option>
              <option value="pending_review">{t('accidents.statusPendingReview', 'Pending Review')}</option>
              <option value="resolved">{t('accidents.statusResolved', 'Resolved')}</option>
              <option value="closed">{t('accidents.statusClosed', 'Closed')}</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('accidents.priority', 'Priority')}
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">{t('accidents.allPriorities', 'All Priorities')}</option>
              <option value="low">{t('accidents.priorityLow', 'Low')}</option>
              <option value="medium">{t('accidents.priorityMedium', 'Medium')}</option>
              <option value="high">{t('accidents.priorityHigh', 'High')}</option>
              <option value="urgent">{t('accidents.priorityUrgent', 'Urgent')}</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(statusFilter || priorityFilter) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:underline"
            >
              {t('accidents.clearFilters', 'Clear Filters')}
            </button>
          </div>
        )}
      </div>

      {/* DataTable */}
      {!loading && filteredAccidents.length === 0 ? (
        <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {t('accidents.noAccidents', 'No Accident Tickets Found')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t('accidents.noAccidentsDesc', 'Create your first accident ticket to get started')}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('accidents.createFirst', 'Create First Ticket')}
          </button>
        </div>
      ) : (
        <DataTable
          data={filteredAccidents}
          columns={columns}
          title=""
          loading={loading}
          onRefresh={loadAccidents}
          enableSearch={true}
          enableExport={true}
          enableCSV={true}
        />
      )}

      {/* Add Accident Modal */}
      <AddAccidentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { setShowAddModal(false); loadAccidents(); }}
      />
    </div>
  );
};

export default AccidentList;
