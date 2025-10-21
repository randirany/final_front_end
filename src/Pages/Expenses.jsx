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
import { toLocaleDateStringEN } from '../utils/dateFormatter';
import { expensesApi } from '../services/expensesApi';
import AddExpenseModal from '../components/AddExpenseModal';
import EditExpenseModal from '../components/EditExpenseModal';

const ROWS_PER_PAGE = 10;

const Expenses = () => {
  const { t, i18n: { language } } = useTranslation();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE);
  const [anchorEls, setAnchorEls] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Fetch expenses from API
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expensesApi.getAll();
      setExpenses(response.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      Swal.fire({
        title: t('expenses.error'),
        text: t('expenses.errorFetchingDetails'),
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
    let sortableItems = [...expenses];
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
  }, [expenses, sortConfig]);

  const filteredExpenses = useMemo(() => {
    if (!searchText) return sortedData;
    const lowerSearch = searchText.toLowerCase();
    return sortedData.filter((expense) =>
      Object.values(expense).some((val) =>
        String(val).toLowerCase().includes(lowerSearch)
      )
    );
  }, [searchText, sortedData]);

  const visibleRows = useMemo(() => {
    return filteredExpenses.slice(0, displayCount);
  }, [filteredExpenses, displayCount]);

  const handleScroll = useCallback(() => {
    const threshold = 200;
    const nearBottom = window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - threshold;

    if (nearBottom && displayCount < filteredExpenses.length && !loading) {
      setTimeout(() => {
        setDisplayCount(prevCount => Math.min(prevCount + ROWS_PER_PAGE, filteredExpenses.length));
      }, 300);
    }
  }, [displayCount, filteredExpenses.length, loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setDisplayCount(ROWS_PER_PAGE);
  }, [searchText]);

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
    handleMenuClose(expense._id);
  };

  const handleView = (expense) => {
    navigate(`/expenses/view/${expense._id}`);
    handleMenuClose(expense._id);
  };

  const handleDelete = async (expenseId, expenseTitle) => {
    handleMenuClose(expenseId);
    Swal.fire({
      title: t('expenses.delete_confirm', { title: expenseTitle }),
      text: t('expenses.delete_confirm_text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('expenses.yes_delete'),
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
          await expensesApi.delete(expenseId);
          setExpenses(expenses.filter(e => e._id !== expenseId));
          Swal.fire({
            title: t('expenses.successDelete'),
            icon: "success",
            customClass: {
              popup: 'dark:bg-navbarBack dark:text-white rounded-lg',
              title: 'dark:text-white'
            }
          });
        } catch (error) {
          Swal.fire({
            title: t('expenses.error'),
            text: error.response?.data?.message || t('expenses.saveError'),
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

  const handleExportExcel = () => {
    const exportData = filteredExpenses.map(e => ({
      [t('expenses.receiptNumber')]: e.receiptNumber,
      [t('expenses.title_label')]: e.title,
      [t('expenses.amount')]: e.amount,
      [t('expenses.paidBy')]: e.paidBy,
      [t('expenses.paymentMethod')]: t(`expenses.paymentMethods.${e.paymentMethod}`),
      [t('expenses.date')]: toLocaleDateStringEN(e.date),
      [t('expenses.description')]: e.description || '-',
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('expenses.exportSheetName'));
    XLSX.writeFile(workbook, t('expenses.exportExcelFileName'));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const exportColumns = tableColumns
      .filter(col => col.key !== 'actions')
      .map(col => ({ header: col.label, dataKey: col.key }));

    doc.setFontSize(18);
    doc.text(t('expenses.report_title'), 14, 22);

    const rows = filteredExpenses.map(expense => {
      let row = {};
      exportColumns.forEach(col => {
        if (col.dataKey === 'paymentMethod') {
          row[col.dataKey] = t(`expenses.paymentMethods.${expense[col.dataKey]}`);
        } else if (col.dataKey === 'date') {
          row[col.dataKey] = toLocaleDateStringEN(expense[col.dataKey]);
        } else {
          row[col.dataKey] = expense[col.dataKey] || '-';
        }
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
    doc.save(t('expenses.exportPdfFileName'));
  };

  const handleExportCSV = () => {
    const exportData = filteredExpenses.map(e => ({
      [t('expenses.receiptNumber')]: e.receiptNumber,
      [t('expenses.title_label')]: e.title,
      [t('expenses.amount')]: e.amount,
      [t('expenses.paidBy')]: e.paidBy,
      [t('expenses.paymentMethod')]: t(`expenses.paymentMethods.${e.paymentMethod}`),
      [t('expenses.date')]: toLocaleDateStringEN(e.date),
      [t('expenses.description')]: e.description || '-',
    }));

    const headers = Object.keys(exportData[0] || {});
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
    link.setAttribute('download', t('expenses.exportCsvFileName'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('expenses-table');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print_' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'height=600,width=800');

    printWindow.document.write('<html><head><title>Expenses List</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      @media print {
        body { font-family: ${(language === 'ar' || language === 'he') ? 'Cairo, sans-serif' : 'Arial, sans-serif'}; }
        .no-print { display: none; }
      }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>' + t('expenses.report_title') + '</h1>');

    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr>');
    tableColumns.forEach(col => {
      if (col.key !== 'actions') {
        printWindow.document.write('<th>' + col.label + '</th>');
      }
    });
    printWindow.document.write('</tr></thead>');

    printWindow.document.write('<tbody>');
    filteredExpenses.forEach(expense => {
      printWindow.document.write('<tr>');
      tableColumns.forEach(col => {
        if (col.key !== 'actions') {
          let value = expense[col.key] || '-';
          if (col.key === 'paymentMethod') {
            value = t(`expenses.paymentMethods.${expense[col.key]}`);
          } else if (col.key === 'date') {
            value = toLocaleDateStringEN(expense[col.key]);
          }
          printWindow.document.write('<td>' + value + '</td>');
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
    { key: 'receiptNumber', label: t('expenses.receiptNumber') },
    { key: 'title', label: t('expenses.title_label') },
    { key: 'amount', label: t('expenses.amount') },
    { key: 'paidBy', label: t('expenses.paidBy') },
    { key: 'paymentMethod', label: t('expenses.paymentMethod') },
    { key: 'date', label: t('expenses.date') },
    { key: 'actions', label: t('expenses.actions'), align: (language === 'ar' || language === 'he') ? 'left' : 'right' },
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
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
        <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${(language === "ar" || language === "he") ? "text-right" : "text-left"}`}>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">{t('expenses.firstTitle')}</NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">{t('expenses.secondeTitle')}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="contained" size="small" onClick={() => setIsAddModalOpen(true)} sx={{ background: '#6C5FFC', color: '#fff' }}>
            {t('expenses.add_button')}
          </Button>
        </div>
      </div>

      <div className='flex rounded-md justify-between items-start flex-wrap mb-4'>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={t('expenses.search_placeholder')}
            className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg w-full sm:w-[300px] shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:mt-0">
          <Button variant="outlined" size="small" onClick={handleExportCSV} disabled={filteredExpenses.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportCsv', 'CSV')}</Button>
          <Button variant="outlined" size="small" onClick={handleExportExcel} disabled={filteredExpenses.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportExcel', 'Excel')}</Button>
          <Button variant="outlined" size="small" onClick={handleExportPDF} disabled={filteredExpenses.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportPdf', 'PDF')}</Button>
          <Button variant="outlined" size="small" onClick={handlePrint} disabled={filteredExpenses.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.print', 'Print')}</Button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {t('expenses.showing_results', { count: visibleRows.length, total: filteredExpenses.length })}
      </div>

      <div className="overflow-x-auto hide-scrollbar bg-[rgb(255,255,255)] dark:bg-navbarBack shadow-md rounded-lg">
        <table id="expenses-table" className="w-full text-sm text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-400">
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
              visibleRows.map((expense) => (
                <tr key={expense._id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[rgb(255,255,255)]">{expense.receiptNumber}</td>
                  <td className="px-6 py-4">{expense.title}</td>
                  <td className="px-6 py-4">{expense.amount}</td>
                  <td className="px-6 py-4">{expense.paidBy}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {t(`expenses.paymentMethods.${expense.paymentMethod}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{toLocaleDateStringEN(expense.date)}</td>
                  <td className="px-6 py-4 text-right">
                    <IconButton aria-label="Actions" size="small" onClick={(event) => handleMenuOpen(event, expense._id)}><MoreVert /></IconButton>
                    <Menu anchorEl={anchorEls[expense._id]} open={Boolean(anchorEls[expense._id])} onClose={() => handleMenuClose(expense._id)}>
                      <MenuItem onClick={() => handleView(expense)}><Visibility size={16} className="mr-2" /> {t('common.view')}</MenuItem>
                      <MenuItem onClick={() => handleEdit(expense)}><Edit size={16} className="mr-2" /> {t('common.edit')}</MenuItem>
                      <MenuItem onClick={() => handleDelete(expense._id, expense.title)} className="text-red-600 dark:text-red-400"><Delete size={16} className="mr-2" /> {t('common.delete')}</MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={tableColumns.length} className="text-center py-10 text-gray-500">{t('expenses.no_results')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onExpenseAdded={fetchExpenses}
      />
      <EditExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedExpense(null);
        }}
        onExpenseUpdated={fetchExpenses}
        expense={selectedExpense}
      />
    </div>
  );
};

export default Expenses;
