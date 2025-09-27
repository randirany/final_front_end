import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Add, Search, Edit, Delete, Visibility, MoreVert, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

const ROWS_PER_PAGE = 10;

const Cheques = () => {
  const { t, i18n: { language } } = useTranslation();
  const navigate = useNavigate();
  const [cheques, setCheques] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE);
  const [anchorEls, setAnchorEls] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Sample data for demonstration
  useEffect(() => {
    const sampleCheques = [
      {
        id: 1,
        chequeNumber: 'CHK001',
        customerName: 'أحمد محمد',
        cheque_date: '2024-01-15',
        status: 'Pending'
      },
      {
        id: 2,
        chequeNumber: 'CHK002',
        customerName: 'سارة أحمد',
        cheque_date: '2024-01-20',
        status: 'Cleared'
      },
      {
        id: 3,
        chequeNumber: 'CHK003',
        customerName: 'محمد حسن',
        cheque_date: '2024-01-25',
        status: 'Pending'
      }
    ];
    setCheques(sampleCheques);
  }, []);

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
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
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
      Object.values(cheque).some((val) =>
        String(val).toLowerCase().includes(lowerSearch)
      )
    );
  }, [searchText, sortedData]);

  const visibleRows = useMemo(() => {
    return filteredCheques.slice(0, displayCount);
  }, [filteredCheques, displayCount]);

  const handleScroll = useCallback(() => {
    const threshold = 200;
    const nearBottom = window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - threshold;

    if (nearBottom && displayCount < filteredCheques.length && !loading) {
      setTimeout(() => {
        setDisplayCount(prevCount => Math.min(prevCount + ROWS_PER_PAGE, filteredCheques.length));
      }, 300);
    }
  }, [displayCount, filteredCheques.length, loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setDisplayCount(ROWS_PER_PAGE);
  }, [searchText]);

  const handleEdit = (cheque) => {
    navigate(`/cheques/edit/${cheque.id}`);
    handleMenuClose(cheque.id);
  };

  const handleView = (cheque) => {
    navigate(`/cheques/view/${cheque.id}`);
    handleMenuClose(cheque.id);
  };

  const handleDelete = (chequeId, chequeNumber) => {
    handleMenuClose(chequeId);
    Swal.fire({
      title: t('cheques.delete_confirm', `هل أنت متأكد من حذف الشيك رقم ${chequeNumber}؟`),
      text: t('cheques.delete_confirm_text', "لا يمكن التراجع عن هذا الإجراء!"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('cheques.yes_delete'),
      cancelButtonText: t('common.cancel', 'إلغاء'),
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Delete logic here
        setCheques(cheques.filter(c => c.id !== chequeId));
        Swal.fire({
          title: t('cheques.successDelete'),
          icon: "success"
        });
      }
    });
  };

  const handleExportExcel = () => {
    const exportData = filteredCheques.map(c => ({
      [t('cheques.chequeNumber')]: c.chequeNumber,
      [t('cheques.customer')]: c.customerName,
      [t('cheques.cheque_date')]: c.cheque_date,
      [t('cheques.status')]: c.status,
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

    const rows = filteredCheques.map(cheque => {
      let row = {};
      exportColumns.forEach(col => {
        row[col.dataKey] = cheque[col.dataKey] || '-';
      });
      return row;
    });

    autoTable(doc, {
      startY: 30,
      columns: exportColumns,
      body: rows,
      styles: { fontSize: 8, font: "Arial" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
    doc.save(t('cheques.exportPdfFileName', "cheques_report.pdf"));
  };

  const handleExportCSV = () => {
    const exportData = filteredCheques.map(c => ({
      [t('cheques.chequeNumber')]: c.chequeNumber,
      [t('cheques.customer')]: c.customerName,
      [t('cheques.cheque_date')]: c.cheque_date,
      [t('cheques.status')]: c.status,
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
      th { background-color: #f2f2f2; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      @media print {
        body { font-family: ${language === 'ar' ? 'Cairo, sans-serif' : 'Arial, sans-serif'}; }
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
      tableColumns.forEach(col => {
        if (col.key !== 'actions') {
          printWindow.document.write('<td>' + (cheque[col.key] || '-') + '</td>');
        }
      });
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
    { key: 'cheque_date', label: t('cheques.cheque_date', 'Cheque Date') },
    { key: 'status', label: t('cheques.status', 'Status') },
    { key: 'actions', label: t('cheques.actions', 'Actions'), align: language === 'ar' ? 'left' : 'right' },
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
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Cleared': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Bounced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || statusClasses['Pending']}`}>
        {t(`cheques.status.${status.toLowerCase()}`)}
      </span>
    );
  };

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
        <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${language === "ar" ? "text-right" : "text-left"}`}>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">{t('cheques.firstTitle', 'Dashboard')}</NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">{t('cheques.secondeTitle', 'Cheques')}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="contained" size="small" onClick={() => navigate('/cheques/add')} sx={{ background: '#6C5FFC', color: '#fff' }}>
            {t('cheques.add_button', 'Add Cheque')}
          </Button>
        </div>
      </div>

      <div className='flex rounded-md justify-between items-start flex-wrap mb-4'>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={t('cheques.search_placeholder', 'Search by cheque number, customer...')}
            className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg w-full sm:w-[300px] shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:mt-0">
          <Button variant="outlined" size="small" onClick={handleExportCSV} disabled={filteredCheques.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportCsv', 'CSV')}</Button>
          <Button variant="outlined" size="small" onClick={handleExportExcel} disabled={filteredCheques.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportExcel', 'Excel')}</Button>
          <Button variant="outlined" size="small" onClick={handleExportPDF} disabled={filteredCheques.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportPdf', 'PDF')}</Button>
          <Button variant="outlined" size="small" onClick={handlePrint} disabled={filteredCheques.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.print', 'Print')}</Button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {t('cheques.showing_results', 'Showing {{count}} of {{total}} cheques', { count: visibleRows.length, total: filteredCheques.length })}
      </div>

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
            {loading && visibleRows.length === 0 ? (
              <tr><td colSpan={tableColumns.length} className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div></td></tr>
            ) : visibleRows.length > 0 ? (
              visibleRows.map((cheque) => (
                <tr key={cheque.id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[rgb(255,255,255)]">{cheque.chequeNumber}</td>
                  <td className="px-6 py-4">{cheque.customerName}</td>
                  <td className="px-6 py-4">{new Date(cheque.cheque_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{getStatusBadge(cheque.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <IconButton aria-label="Actions" size="small" onClick={(event) => handleMenuOpen(event, cheque.id)}><MoreVert /></IconButton>
                    <Menu anchorEl={anchorEls[cheque.id]} open={Boolean(anchorEls[cheque.id])} onClose={() => handleMenuClose(cheque.id)}>
                      <MenuItem onClick={() => handleView(cheque)}><Visibility size={16} className="mr-2" /> {t('common.view')}</MenuItem>
                      <MenuItem onClick={() => handleEdit(cheque)}><Edit size={16} className="mr-2" /> {t('common.edit')}</MenuItem>
                      <MenuItem onClick={() => handleDelete(cheque.id, cheque.chequeNumber)} className="text-red-600 dark:text-red-400"><Delete size={16} className="mr-2" /> {t('common.delete')}</MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={tableColumns.length} className="text-center py-10 text-gray-500">{t('cheques.no_results')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cheques;