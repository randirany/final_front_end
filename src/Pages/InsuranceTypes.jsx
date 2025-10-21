import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Edit, Delete, MoreVert, ArrowUpward, ArrowDownward, Add } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import Swal from 'sweetalert2';
import { insuranceTypeApi } from '../services/insuranceTypeApi';
import AddInsuranceTypeModal from '../components/AddInsuranceTypeModal';
import EditInsuranceTypeModal from '../components/EditInsuranceTypeModal';

const ROWS_PER_PAGE = 10;

const InsuranceTypes = () => {
  const { t, i18n: { language } } = useTranslation();
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE);
  const [anchorEls, setAnchorEls] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState(null);

  // Fetch insurance types from API
  useEffect(() => {
    fetchInsuranceTypes();
  }, []);

  const fetchInsuranceTypes = async () => {
    try {
      setLoading(true);
      const response = await insuranceTypeApi.getAll();
      setInsuranceTypes(response.insuranceTypes || response.data || []);
    } catch (error) {
      console.error('Error fetching insurance types:', error);
      Swal.fire({
        title: t('insuranceType.error', 'Error'),
        text: t('insuranceType.messages.fetchError', 'Failed to fetch insurance types'),
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
    let sortableItems = [...insuranceTypes];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [insuranceTypes, sortConfig]);

  const filteredInsuranceTypes = useMemo(() => {
    if (!searchText) return sortedData;
    const lowerSearch = searchText.toLowerCase();
    return sortedData.filter((type) =>
      Object.values(type).some((val) =>
        String(val).toLowerCase().includes(lowerSearch)
      )
    );
  }, [searchText, sortedData]);

  const visibleRows = useMemo(() => {
    return filteredInsuranceTypes.slice(0, displayCount);
  }, [filteredInsuranceTypes, displayCount]);

  const handleScroll = useCallback(() => {
    const threshold = 200;
    const nearBottom = window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - threshold;

    if (nearBottom && displayCount < filteredInsuranceTypes.length && !loading) {
      setTimeout(() => {
        setDisplayCount(prevCount => Math.min(prevCount + ROWS_PER_PAGE, filteredInsuranceTypes.length));
      }, 300);
    }
  }, [displayCount, filteredInsuranceTypes.length, loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setDisplayCount(ROWS_PER_PAGE);
  }, [searchText]);

  const handleEdit = (insuranceType) => {
    setSelectedInsuranceType(insuranceType);
    setIsEditModalOpen(true);
    handleMenuClose(insuranceType._id);
  };

  const handleDelete = async (insuranceTypeId, insuranceTypeName) => {
    handleMenuClose(insuranceTypeId);
    Swal.fire({
      title: t('insuranceType.deleteConfirm', 'Delete Insurance Type?'),
      text: t('insuranceType.deleteConfirmText', `Are you sure you want to delete "${insuranceTypeName}"? This action cannot be undone.`),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('insuranceType.yesDelete', 'Yes, delete it'),
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
          await insuranceTypeApi.delete(insuranceTypeId);
          setInsuranceTypes(insuranceTypes.filter(t => t._id !== insuranceTypeId));
          Swal.fire({
            title: t('insuranceType.deleteSuccess', 'Deleted!'),
            text: t('insuranceType.deleteSuccessText', 'Insurance type has been deleted.'),
            icon: "success",
            customClass: {
              popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
              title: 'dark:text-white'
            }
          });
        } catch (error) {
          Swal.fire({
            title: t('insuranceType.error', 'Error'),
            text: error.response?.data?.message || t('insuranceType.messages.deleteError', 'Failed to delete insurance type'),
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
    { key: 'name', label: t('insuranceType.columns.name', 'Name') },
    { key: 'actions', label: t('insuranceType.columns.actions', 'Actions'), align: (language === 'ar' || language === 'he') ? 'left' : 'right' },
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
          <span className="text-gray-500 dark:text-gray-400">{t('insuranceType.title', 'Insurance Types')}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => setIsAddModalOpen(true)}
            sx={{ background: '#6C5FFC', color: '#fff', '&:hover': { background: '#5a4fd8' } }}>
            {t('insuranceType.addButton', 'Add Insurance Type')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className='flex rounded-md justify-between items-start flex-wrap mb-4'>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={t('insuranceType.searchPlaceholder', 'Search insurance types...')}
            className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg w-full sm:w-[300px] shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {t('insuranceType.showingResults', `Showing ${visibleRows.length} of ${filteredInsuranceTypes.length} results`)}
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
              visibleRows.map((insuranceType) => (
                <tr key={insuranceType._id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[rgb(255,255,255)]">
                    {insuranceType.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <IconButton
                      aria-label="Actions"
                      size="small"
                      onClick={(event) => handleMenuOpen(event, insuranceType._id)}>
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEls[insuranceType._id]}
                      open={Boolean(anchorEls[insuranceType._id])}
                      onClose={() => handleMenuClose(insuranceType._id)}>
                      <MenuItem onClick={() => handleEdit(insuranceType)}>
                        <Edit size={16} className="mr-2" /> {t('common.edit', 'Edit')}
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleDelete(insuranceType._id, insuranceType.name)}
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
                  {t('insuranceType.noResults', 'No insurance types found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddInsuranceTypeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onInsuranceTypeAdded={fetchInsuranceTypes}
      />
      <EditInsuranceTypeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInsuranceType(null);
        }}
        onInsuranceTypeUpdated={fetchInsuranceTypes}
        insuranceType={selectedInsuranceType}
      />
    </div>
  );
};

export default InsuranceTypes;
