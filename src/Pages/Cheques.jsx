import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Add, Edit, Delete, Visibility, MoreVert, ArrowUpward, ArrowDownward, FilterList } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { toLocaleDateStringEN } from '../utils/dateFormatter';
import { getAllCheques, deleteCheque } from '../services/chequeApi';
import AddChequeModal from '../components/AddChequeModal';
import EditChequeModal from '../components/EditChequeModal';
import ViewChequeModal from '../components/ViewChequeModal';

const ROWS_PER_PAGE = 20;

const Cheques = () => {
  const { t, i18n: { language } } = useTranslation();
  const [cheques, setCheques] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCheques, setTotalCheques] = useState(0);
  const [summary, setSummary] = useState(null);
  const [anchorEls, setAnchorEls] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedChequeId, setSelectedChequeId] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch cheques on mount and when filters change
  useEffect(() => {
    fetchCheques(1, false);
  }, [statusFilter, startDate, endDate]);

  const fetchCheques = async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const filters = {
        page,
        limit: ROWS_PER_PAGE,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      };

      const response = await getAllCheques(filters);

      if (append) {
        setCheques(prev => [...prev, ...response.data]);
      } else {
        setCheques(response.data);
      }

      setCurrentPage(page);
      setHasMore(response.pagination?.hasNextPage || false);
      setTotalCheques(response.pagination?.totalItems || 0);
      setSummary(response.summary);
    } catch (error) {
      console.error('Error fetching cheques:', error);
      Swal.fire({
        title: t('cheques.error', 'Error'),
        text: t('cheques.errorFetchingCheques', 'Error fetching cheques'),
        icon: 'error'
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore) return;

    const threshold = 200;
    const nearBottom = window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - threshold;

    if (nearBottom) {
      fetchCheques(currentPage + 1, true);
    }
  }, [loadingMore, hasMore, currentPage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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
    let sortableItems = [...cheques];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'customerName') {
          aValue = a.customer?.name || '';
          bValue = b.customer?.name || '';
        } else if (sortConfig.key === 'amount') {
          aValue = a.amount || 0;
          bValue = b.amount || 0;
        } else {
          aValue = a[sortConfig.key] || '';
          bValue = b[sortConfig.key] || '';
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [cheques, sortConfig]);

  const filteredCheques = useMemo(() => {
    if (!searchText) return sortedData;
    const lowerSearch = searchText.toLowerCase();
    return sortedData.filter((cheque) =>
      cheque.chequeNumber?.toLowerCase().includes(lowerSearch) ||
      cheque.customer?.name?.toLowerCase().includes(lowerSearch) ||
      cheque.status?.toLowerCase().includes(lowerSearch)
    );
  }, [searchText, sortedData]);

  const handleView = (cheque) => {
    setSelectedChequeId(cheque._id);
    setViewModalOpen(true);
    handleMenuClose(cheque._id);
  };

  const handleEdit = (cheque) => {
    setSelectedChequeId(cheque._id);
    setEditModalOpen(true);
    handleMenuClose(cheque._id);
  };

  const handleDelete = async (chequeId, chequeNumber) => {
    handleMenuClose(chequeId);

    const result = await Swal.fire({
      title: t('cheques.delete_confirm', `Are you sure you want to delete cheque ${chequeNumber}?`),
      text: t('cheques.delete_confirm_text', "This action cannot be undone!"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('cheques.yes_delete', 'Yes, delete it!'),
      cancelButtonText: t('common.cancel', 'Cancel'),
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300'
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteCheque(chequeId);
        Swal.fire({
          title: t('cheques.successDelete', 'Deleted!'),
          text: t('cheques.chequeDeleted', 'Cheque has been deleted'),
          icon: 'success',
          timer: 2000
        });
        fetchCheques(1, false);
      } catch (error) {
        console.error('Error deleting cheque:', error);
        Swal.fire({
          title: t('cheques.error', 'Error'),
          text: error.message || t('cheques.errorDeletingCheque', 'Error deleting cheque'),
          icon: 'error'
        });
      }
    }
  };

  const handleModalSuccess = () => {
    fetchCheques(1, false);
  };

  const handleExportExcel = () => {
    const exportData = filteredCheques.map(c => ({
      [t('cheques.chequeNumber')]: c.chequeNumber,
      [t('cheques.customer')]: c.customer?.name || 'N/A',
      [t('cheques.amount')]: c.amount,
      [t('cheques.cheque_date')]: toLocaleDateStringEN(c.chequeDate),
      [t('cheques.statusHeader')]: c.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('cheques.exportSheetName', "Cheques"));
    XLSX.writeFile(workbook, t('cheques.exportExcelFileName', "cheques_report.xlsx"));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const exportColumns = tableColumns
      .filter(col => col.key !== 'actions')
      .map(col => ({ header: col.label, dataKey: col.key }));

    doc.setFontSize(18);
    doc.text(t('cheques.report_title', 'Cheques Report'), 14, 22);

    const rows = filteredCheques.map(cheque => ({
      chequeNumber: cheque.chequeNumber,
      customerName: cheque.customer?.name || 'N/A',
      amount: cheque.amount?.toLocaleString(),
      chequeDate: toLocaleDateStringEN(cheque.chequeDate),
      status: cheque.status
    }));

    autoTable(doc, {
      startY: 30,
      columns: exportColumns,
      body: rows,
      styles: { fontSize: 8, font: "Arial" },
      headStyles: { fillColor: [108, 95, 252], textColor: 255 },
    });
    doc.save(t('cheques.exportPdfFileName', "cheques_report.pdf"));
  };

  const handleExportCSV = () => {
    const exportData = filteredCheques.map(c => ({
      [t('cheques.chequeNumber')]: c.chequeNumber,
      [t('cheques.customer')]: c.customer?.name || 'N/A',
      [t('cheques.amount')]: c.amount,
      [t('cheques.cheque_date')]: toLocaleDateStringEN(c.chequeDate),
      [t('cheques.statusHeader')]: c.status,
    }));

    const headers = Object.keys(exportData[0]);
    const csvRows = [
      headers.join(','),
      ...exportData.map(row =>
        headers.map(header => {
          const cell = row[header] || '';
          return `"${cell.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', t('cheques.exportCsvFileName', "cheques_report.csv"));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('cheques-table');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print_' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'height=600,width=800');

    printWindow.document.write('<html><head><title>Cheques List</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #6C5FFC; color: white; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      @media print {
        body { font-family: ${(language === 'ar' || language === 'he') ? 'Cairo, sans-serif' : 'Arial, sans-serif'}; }
        .no-print { display: none; }
      }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>' + t('cheques.report_title', 'Cheques Report') + '</h1>');

    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr>');
    tableColumns.forEach(col => {
      if (col.key !== 'actions') {
        printWindow.document.write('<th>' + col.label + '</th>');
      }
    });
    printWindow.document.write('</tr></thead>');

    printWindow.document.write('<tbody>');
    filteredCheques.forEach(cheque => {
      printWindow.document.write('<tr>');
      printWindow.document.write('<td>' + cheque.chequeNumber + '</td>');
      printWindow.document.write('<td>' + (cheque.customer?.name || 'N/A') + '</td>');
      printWindow.document.write('<td>' + (cheque.amount?.toLocaleString() || '-') + '</td>');
      printWindow.document.write('<td>' + toLocaleDateStringEN(cheque.chequeDate) + '</td>');
      printWindow.document.write('<td>' + cheque.status + '</td>');
      printWindow.document.write('</tr>');
    });
    printWindow.document.write('</tbody>');
    printWindow.document.write('</table>');

    printWindow.document.write('</body></html>');
    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const tableColumns = [
    { key: 'chequeNumber', label: t('cheques.chequeNumber', 'Cheque Number') },
    { key: 'customerName', label: t('cheques.customer', 'Customer') },
    { key: 'amount', label: t('cheques.amount', 'Amount') },
    { key: 'chequeDate', label: t('cheques.cheque_date', 'Cheque Date') },
    { key: 'status', label: t('cheques.statusHeader', 'Status') },
    { key: 'actions', label: t('cheques.actions', 'Actions'), align: (language === 'ar' || language === 'he') ? 'left' : 'right' },
  ];

  const getSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'ascending'
        ? <ArrowUpward fontSize="small" className="ml-1" />
        : <ArrowDownward fontSize="small" className="ml-1" />;
    }
    return null;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'cleared': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'returned': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || statusClasses['pending']}`}>
        {t(`cheques.status.${status?.toLowerCase()}`, status)}
      </span>
    );
  };

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
        <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${(language === "ar" || language === "he") ? "text-right" : "text-left"}`}>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">{t('cheques.firstTitle', 'Dashboard')}</NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">{t('cheques.secondeTitle', 'Cheques')}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => setAddModalOpen(true)}
            sx={{ background: '#6C5FFC', color: '#fff', '&:hover': { background: '#5a4dd4' } }}
          >
            {t('cheques.add_button', 'Add Cheque')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white dark:bg-navbarBack rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.totalCheques', 'Total Cheques')}</p>
            <p className="text-2xl font-bold dark:text-white">{summary.totalCheques}</p>
          </div>
          <div className="bg-white dark:bg-navbarBack rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.totalAmount', 'Total Amount')}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.totalAmount?.toLocaleString()} ₪</p>
          </div>
          <div className="bg-white dark:bg-navbarBack rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.pendingCount', 'Pending')}</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.pendingCount}</p>
          </div>
          <div className="bg-white dark:bg-navbarBack rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('cheques.returnedCount', 'Returned')}</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.returnedCount}</p>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className='flex rounded-md justify-between items-start flex-wrap mb-4 gap-4'>
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="text"
            placeholder={t('cheques.search_placeholder', 'Search by cheque number, customer...')}
            className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg w-full sm:w-[300px] shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg shadow-sm"
          >
            <option value="all">{t('cheques.allStatus', 'All Status')}</option>
            <option value="pending">{t('cheques.status.pending', 'Pending')}</option>
            <option value="cleared">{t('cheques.status.cleared', 'Cleared')}</option>
            <option value="returned">{t('cheques.status.returned', 'Returned')}</option>
            <option value="cancelled">{t('cheques.status.cancelled', 'Cancelled')}</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg shadow-sm"
            placeholder={t('cheques.startDate', 'Start Date')}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg shadow-sm"
            placeholder={t('cheques.endDate', 'End Date')}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outlined" size="small" onClick={handleExportCSV} disabled={filteredCheques.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportCsv', 'CSV')}</Button>
          <Button variant="outlined" size="small" onClick={handleExportExcel} disabled={filteredCheques.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportExcel', 'Excel')}</Button>
          <Button variant="outlined" size="small" onClick={handleExportPDF} disabled={filteredCheques.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportPdf', 'PDF')}</Button>
          <Button variant="outlined" size="small" onClick={handlePrint} disabled={filteredCheques.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.print', 'Print')}</Button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {t('cheques.showing_results', 'Showing {{count}} of {{total}} cheques', { count: filteredCheques.length, total: totalCheques })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto hide-scrollbar bg-[rgb(255,255,255)] dark:bg-navbarBack shadow-md rounded-lg">
        <table id="cheques-table" className="w-full text-sm text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              {tableColumns.map(col => (
                <th key={col.key} scope="col" className={`px-6 py-3 ${col.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}`} onClick={() => col.key !== 'actions' && requestSort(col.key)}>
                  <div className="flex items-center">
                    <span>{col.label}</span>
                    {col.key !== 'actions' && getSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && filteredCheques.length === 0 ? (
              <tr><td colSpan={tableColumns.length} className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div></td></tr>
            ) : filteredCheques.length > 0 ? (
              filteredCheques.map((cheque) => (
                <tr key={cheque._id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[rgb(255,255,255)]">{cheque.chequeNumber}</td>
                  <td className="px-6 py-4">{cheque.customer?.name || 'N/A'}</td>
                  <td className="px-6 py-4 font-semibold">{cheque.amount?.toLocaleString()} ₪</td>
                  <td className="px-6 py-4">{toLocaleDateStringEN(cheque.chequeDate)}</td>
                  <td className="px-6 py-4">{getStatusBadge(cheque.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <IconButton aria-label="Actions" size="small" onClick={(event) => handleMenuOpen(event, cheque._id)}><MoreVert /></IconButton>
                    <Menu anchorEl={anchorEls[cheque._id]} open={Boolean(anchorEls[cheque._id])} onClose={() => handleMenuClose(cheque._id)}>
                      <MenuItem onClick={() => handleView(cheque)}><Visibility fontSize="small" className="mr-2" /> {t('common.view', 'View')}</MenuItem>
                      <MenuItem onClick={() => handleEdit(cheque)}><Edit fontSize="small" className="mr-2" /> {t('common.edit', 'Edit Status')}</MenuItem>
                      <MenuItem onClick={() => handleDelete(cheque._id, cheque.chequeNumber)} className="text-red-600 dark:text-red-400"><Delete fontSize="small" className="mr-2" /> {t('common.delete', 'Delete')}</MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={tableColumns.length} className="text-center py-10 text-gray-500">{t('cheques.no_results', 'No cheques found')}</td></tr>
            )}
          </tbody>
        </table>

        {loadingMore && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">{t('common.loadingMore', 'Loading more...')}</p>
          </div>
        )}

        {!hasMore && filteredCheques.length > 0 && (
          <div className="text-center py-4 text-sm text-gray-500">
            {t('common.endOfList', 'End of list')}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddChequeModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <EditChequeModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleModalSuccess}
        chequeId={selectedChequeId}
      />

      <ViewChequeModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        onEdit={(id) => {
          setSelectedChequeId(id);
          setEditModalOpen(true);
        }}
        onSuccess={handleModalSuccess}
        chequeId={selectedChequeId}
      />
    </div>
  );
};

export default Cheques;
