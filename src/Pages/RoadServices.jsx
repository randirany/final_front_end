import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Edit, Delete, MoreVert, ArrowUpward, ArrowDownward, Add, Business } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import Swal from 'sweetalert2';
import { getAllRoadServices, deleteRoadService } from '../services/roadServiceApi';
import { getAllCompanies } from '../services/insuranceCompanyApi';
import AddRoadServiceModal from '../components/AddRoadServiceModal';
import EditRoadServiceModal from '../components/EditRoadServiceModal';

const ROWS_PER_PAGE = 10;

const RoadServices = () => {
  const { t, i18n: { language } } = useTranslation();
  const [roadServices, setRoadServices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE);
  const [anchorEls, setAnchorEls] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoadService, setSelectedRoadService] = useState(null);

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Fetch road services when filters change
  useEffect(() => {
    fetchRoadServices();
  }, [selectedCompany, statusFilter]);

  const fetchCompanies = async () => {
    try {
      const response = await getAllCompanies({ page: 1, limit: 1000 });
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchRoadServices = async () => {
    try {
      setLoading(true);
      const filters = {
        page: 1,
        limit: 1000
      };

      if (selectedCompany) {
        filters.company_id = selectedCompany;
      }

      if (statusFilter !== 'all') {
        filters.is_active = statusFilter === 'active';
      }

      const response = await getAllRoadServices(filters);
      setRoadServices(response.data || []);
    } catch (error) {
      console.error('Error fetching road services:', error);
      Swal.fire({
        title: t('roadService.error', 'Error'),
        text: t('roadService.messages.fetchError', 'Failed to fetch road services'),
        icon: 'error',
        customClass: {
          popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: event.currentTarget }));
  const handleMenuClose = (rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: undefined }));

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...roadServices];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested company name
        if (sortConfig.key === 'company_name') {
          aValue = a.company_id?.name || '';
          bValue = b.company_id?.name || '';
        }

        aValue = aValue || '';
        bValue = bValue || '';

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [roadServices, sortConfig]);

  const filteredRoadServices = useMemo(() => {
    if (!searchText) return sortedData;
    const lowerSearch = searchText.toLowerCase();
    return sortedData.filter((service) => {
      const serviceName = service.service_name?.toLowerCase() || '';
      const companyName = service.company_id?.name?.toLowerCase() || '';
      const description = service.description?.toLowerCase() || '';

      return serviceName.includes(lowerSearch) ||
             companyName.includes(lowerSearch) ||
             description.includes(lowerSearch);
    });
  }, [searchText, sortedData]);

  const visibleRows = useMemo(() => {
    return filteredRoadServices.slice(0, displayCount);
  }, [filteredRoadServices, displayCount]);

  const handleScroll = useCallback(() => {
    const threshold = 200;
    const nearBottom = window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - threshold;

    if (nearBottom && displayCount < filteredRoadServices.length && !loading) {
      setTimeout(() => {
        setDisplayCount(prevCount => Math.min(prevCount + ROWS_PER_PAGE, filteredRoadServices.length));
      }, 300);
    }
  }, [displayCount, filteredRoadServices.length, loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setDisplayCount(ROWS_PER_PAGE);
  }, [searchText, selectedCompany, statusFilter]);

  const handleEdit = (roadService) => {
    setSelectedRoadService(roadService);
    setIsEditModalOpen(true);
    handleMenuClose(roadService._id);
  };

  const handleDelete = async (roadServiceId, roadServiceName) => {
    handleMenuClose(roadServiceId);
    Swal.fire({
      title: t('roadService.deleteConfirm', 'Delete Road Service?'),
      text: t('roadService.deleteConfirmText', `Are you sure you want to delete "${roadServiceName}"? This action cannot be undone.`),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('roadService.yesDelete', 'Yes, delete it'),
      cancelButtonText: t('common.cancel', 'Cancel'),
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteRoadService(roadServiceId);
          await fetchRoadServices();
          Swal.fire({
            title: t('roadService.deleteSuccess', 'Deleted!'),
            text: t('roadService.deleteSuccessText', 'Road service has been deleted.'),
            icon: "success",
            timer: 2000,
            customClass: {
              popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
              title: 'dark:text-white'
            }
          });
        } catch (error) {
          Swal.fire({
            title: t('roadService.error', 'Error'),
            text: error.response?.data?.message || t('roadService.messages.deleteError', 'Failed to delete road service'),
            icon: 'error',
            customClass: {
              popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
              title: 'dark:text-white',
              htmlContainer: 'dark:text-gray-300'
            }
          });
        }
      }
    });
  };

  const tableColumns = [
    { key: 'service_name', label: t('roadService.columns.serviceName', 'Service Name') },
    { key: 'company_name', label: t('roadService.columns.company', 'Company') },
    { key: 'normal_price', label: t('roadService.columns.normalPrice', 'Normal Price') },
    { key: 'old_car_price', label: t('roadService.columns.oldCarPrice', 'Old Car Price') },
    { key: 'cutoff_year', label: t('roadService.columns.cutoffYear', 'Cutoff Year') },
    { key: 'is_active', label: t('roadService.columns.status', 'Status') },
    { key: 'actions', label: t('roadService.columns.actions', 'Actions'), align: (language === 'ar' || language === 'he') ? 'left' : 'right' },
  ];

  const getSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'ascending'
        ? <ArrowUpward fontSize="small" className="ml-1" />
        : <ArrowDownward fontSize="small" className="ml-1" />;
    }
    return null;
  };

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
        <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${(language === "ar" || language === "he") ? "text-right" : "text-left"}`}>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">{t('breadcrumbs.home', 'Home')}</NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">{t('roadService.title', 'Road Services')}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => setIsAddModalOpen(true)}
            sx={{ background: '#6C5FFC', color: '#fff', '&:hover': { background: '#5a4fd8' } }}>
            {t('roadService.addButton', 'Add Road Service')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white dark:bg-navbarBack rounded-md p-4 mb-4 shadow-sm'>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Company Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('roadService.filterByCompany', 'Filter by Company')}
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t('roadService.allCompanies', 'All Companies')}</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('roadService.filterByStatus', 'Filter by Status')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">{t('roadService.allStatuses', 'All Statuses')}</option>
              <option value="active">{t('roadService.active', 'Active')}</option>
              <option value="inactive">{t('roadService.inactive', 'Inactive')}</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('roadService.search', 'Search')}
            </label>
            <input
              type="text"
              placeholder={t('roadService.searchPlaceholder', 'Search road services...')}
              className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {t('roadService.showingResults', `Showing ${visibleRows.length} of ${filteredRoadServices.length} results`)}
      </div>

      {/* Table */}
      <div className="overflow-x-auto hide-scrollbar bg-[rgb(255,255,255)] dark:bg-navbarBack shadow-md rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              {tableColumns.map(col => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-6 py-3 ${col.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}`}
                  onClick={() => col.key !== 'actions' && requestSort(col.key)}>
                  <div className="flex items-center">
                    <span>{col.label}</span>
                    {col.key !== 'actions' && getSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && visibleRows.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length} className="text-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                </td>
              </tr>
            ) : visibleRows.length > 0 ? (
              visibleRows.map((roadService) => (
                <tr key={roadService._id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[rgb(255,255,255)]">
                    {roadService.service_name}
                    {roadService.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {roadService.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Business fontSize="small" className="text-blue-600 dark:text-blue-400" />
                      <span>{roadService.company_id?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {roadService.normal_price ? `${roadService.normal_price.toLocaleString()} ₪` : '-'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-orange-600 dark:text-orange-400">
                    {roadService.old_car_price ? `${roadService.old_car_price.toLocaleString()} ₪` : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded">
                      {roadService.cutoff_year || 2007}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      roadService.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {roadService.is_active ? t('roadService.active', 'Active') : t('roadService.inactive', 'Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <IconButton
                      aria-label="Actions"
                      size="small"
                      onClick={(event) => handleMenuOpen(event, roadService._id)}>
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEls[roadService._id]}
                      open={Boolean(anchorEls[roadService._id])}
                      onClose={() => handleMenuClose(roadService._id)}>
                      <MenuItem onClick={() => handleEdit(roadService)}>
                        <Edit size={16} className="mr-2" /> {t('common.edit', 'Edit')}
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleDelete(roadService._id, roadService.service_name)}
                        className="text-red-600 dark:text-red-400">
                        <Delete size={16} className="mr-2" /> {t('common.delete', 'Delete')}
                      </MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableColumns.length} className="text-center py-10 text-gray-500">
                  {t('roadService.noResults', 'No road services found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddRoadServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRoadServiceAdded={fetchRoadServices}
        companies={companies}
      />
      <EditRoadServiceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRoadService(null);
        }}
        onRoadServiceUpdated={fetchRoadServices}
        roadService={selectedRoadService}
        companies={companies}
      />
    </div>
  );
};

export default RoadServices;
