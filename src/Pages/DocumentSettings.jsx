import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Add, Search, Edit, Delete, Visibility, MoreVert, ArrowUpward, ArrowDownward, CheckCircle } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import axios from 'axios';

const ROWS_PER_PAGE = 10;

const DocumentSettings = () => {
  const { t, i18n: { language } } = useTranslation();
  const navigate = useNavigate();

  const [documentSettings, setDocumentSettings] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE);
  const [anchorEls, setAnchorEls] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [activeSettings, setActiveSettings] = useState(null);

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
    let sortableItems = [...documentSettings];
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
  }, [documentSettings, sortConfig]);

  const filteredSettings = useMemo(() => {
    if (!searchText) return sortedData;
    const lowerSearch = searchText.toLowerCase();
    return sortedData.filter((setting) =>
      Object.values(setting).some((val) =>
        String(val).toLowerCase().includes(lowerSearch)
      )
    );
  }, [searchText, sortedData]);

  const visibleRows = useMemo(() => {
    return filteredSettings.slice(0, displayCount);
  }, [filteredSettings, displayCount]);

  const handleScroll = useCallback(() => {
    const threshold = 200;
    const nearBottom = window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - threshold;

    if (nearBottom && displayCount < filteredSettings.length && !loading) {
      setTimeout(() => {
        setDisplayCount(prevCount => Math.min(prevCount + ROWS_PER_PAGE, filteredSettings.length));
      }, 300);
    }
  }, [displayCount, filteredSettings.length, loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setDisplayCount(ROWS_PER_PAGE);
  }, [searchText]);

  useEffect(() => {
    fetchDocumentSettings();
    fetchActiveSettings();
  }, []);

  const fetchDocumentSettings = async () => {
    setLoading(true);
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.get('http://localhost:3002/api/v1/documentSettings/', {
        headers: { token }
      });
      setDocumentSettings(response.data.documentSettings || []);
    } catch (error) {
      console.error('Error fetching document settings:', error);
      // Fallback sample data for development
      const sampleData = [
        {
          _id: '1',
          companyName: 'شركة التأمين الفلسطينية',
          headerText: 'تقرير الشركة الرسمي',
          headerBgColor: '#2563eb',
          headerTextColor: '#ffffff',
          headerFontSize: 24,
          footerText: 'جميع الحقوق محفوظة © 2024',
          footerBgColor: '#374151',
          footerTextColor: '#ffffff',
          footerFontSize: 12,
          marginTop: 20,
          marginBottom: 20,
          marginLeft: 15,
          marginRight: 15,
          logoUrl: '/assets/logo.png',
          isActive: true,
          createdBy: 'Admin',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        },
        {
          _id: '2',
          companyName: 'شركة التأمين العربي',
          headerText: 'تقرير الأعمال الشهري',
          headerBgColor: '#059669',
          headerTextColor: '#ffffff',
          headerFontSize: 22,
          footerText: 'شركة التأمين العربي - فلسطين',
          footerBgColor: '#1f2937',
          footerTextColor: '#ffffff',
          footerFontSize: 10,
          marginTop: 25,
          marginBottom: 25,
          marginLeft: 20,
          marginRight: 20,
          logoUrl: '/assets/logo2.png',
          isActive: false,
          createdBy: 'Manager',
          createdAt: '2024-01-05T09:00:00Z',
          updatedAt: '2024-01-05T09:00:00Z'
        }
      ];
      setDocumentSettings(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSettings = async () => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.get('http://localhost:3002/api/v1/documentSettings/active', {
        headers: { token }
      });
      setActiveSettings(response.data.documentSettings);
    } catch (error) {
      console.error('Error fetching active settings:', error);
    }
  };

  const handleEdit = (setting) => {
    navigate(`/document-settings/edit/${setting._id}`);
    handleMenuClose(setting._id);
  };

  const handleView = (setting) => {
    navigate(`/document-settings/view/${setting._id}`);
    handleMenuClose(setting._id);
  };

  const handleActivate = async (settingId, settingName) => {
    handleMenuClose(settingId);
    Swal.fire({
      title: t('documentSettings.activate_confirm', `هل تريد تفعيل إعدادات ${settingName}؟`),
      text: t('documentSettings.activate_confirm_text', "سيتم إلغاء تفعيل الإعدادات الحالية"),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('documentSettings.yes_activate'),
      cancelButtonText: t('common.cancel', 'إلغاء'),
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
          const token = `islam__${localStorage.getItem("token")}`;
          await axios.patch(`http://localhost:3002/api/v1/documentSettings/activate/${settingId}`, {}, {
            headers: { token }
          });
          Swal.fire({
            title: t('documentSettings.activateSuccess'),
            icon: "success"
          });
          fetchDocumentSettings();
          fetchActiveSettings();
        } catch (error) {
          Swal.fire({
            title: t('documentSettings.error'),
            text: error.response?.data?.message || t('documentSettings.activateError'),
            icon: 'error'
          });
        }
      }
    });
  };

  const handleDelete = (settingId, settingName, isActive) => {
    if (isActive) {
      Swal.fire({
        title: t('documentSettings.error'),
        text: t('documentSettings.cannotDeleteActive'),
        icon: 'error'
      });
      return;
    }

    handleMenuClose(settingId);
    Swal.fire({
      title: t('documentSettings.delete_confirm', `هل أنت متأكد من حذف إعدادات ${settingName}؟`),
      text: t('documentSettings.delete_confirm_text', "لا يمكن التراجع عن هذا الإجراء!"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: t('documentSettings.yes_delete'),
      cancelButtonText: t('common.cancel', 'إلغاء'),
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
          const token = `islam__${localStorage.getItem("token")}`;
          await axios.delete(`http://localhost:3002/api/v1/documentSettings/delete/${settingId}`, {
            headers: { token }
          });
          Swal.fire({
            title: t('documentSettings.successDelete'),
            icon: "success"
          });
          fetchDocumentSettings();
        } catch (error) {
          Swal.fire({
            title: t('documentSettings.error'),
            text: error.response?.data?.message || t('documentSettings.deleteError'),
            icon: 'error'
          });
        }
      }
    });
  };

  const handleExportExcel = () => {
    const exportData = filteredSettings.map(s => ({
      [t('documentSettings.companyName')]: s.companyName,
      [t('documentSettings.headerText')]: s.headerText,
      [t('documentSettings.footerText')]: s.footerText,
      [t('documentSettings.isActive')]: s.isActive ? t('common.yes') : t('common.no'),
      [t('documentSettings.createdBy')]: s.createdBy,
      [t('documentSettings.createdAt')]: new Date(s.createdAt).toLocaleDateString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('documentSettings.exportSheetName', "Document Settings"));
    XLSX.writeFile(workbook, t('documentSettings.exportExcelFileName', "document_settings_report.xlsx"));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const exportColumns = tableColumns
      .filter(col => col.key !== 'actions')
      .map(col => ({ header: col.label, dataKey: col.key }));

    doc.setFontSize(18);
    doc.text(t('documentSettings.report_title', 'Document Settings Report'), 14, 22);

    const rows = filteredSettings.map(setting => {
      let row = {};
      exportColumns.forEach(col => {
        if (col.dataKey === 'isActive') {
          row[col.dataKey] = setting[col.dataKey] ? t('common.yes') : t('common.no');
        } else if (col.dataKey === 'createdAt') {
          row[col.dataKey] = new Date(setting[col.dataKey]).toLocaleDateString();
        } else {
          row[col.dataKey] = setting[col.dataKey] || '-';
        }
      });
      return row;
    });

    autoTable(doc, {
      startY: 30,
      columns: exportColumns,
      body: rows,
      styles: { fontSize: 8, font: (language === 'ar' || language === 'he') ? 'Cairo, sans-serif' : 'Arial, sans-serif' },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
    doc.save(t('documentSettings.exportPdfFileName', "document_settings_report.pdf"));
  };

  const handleExportCSV = () => {
    const exportData = filteredSettings.map(s => ({
      [t('documentSettings.companyName')]: s.companyName,
      [t('documentSettings.headerText')]: s.headerText,
      [t('documentSettings.footerText')]: s.footerText,
      [t('documentSettings.isActive')]: s.isActive ? t('common.yes') : t('common.no'),
      [t('documentSettings.createdBy')]: s.createdBy,
      [t('documentSettings.createdAt')]: new Date(s.createdAt).toLocaleDateString(),
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
    link.setAttribute('download', t('documentSettings.exportCsvFileName', "document_settings_report.csv"));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('document-settings-table');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print_' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'height=600,width=800');

    printWindow.document.write('<html><head><title>Document Settings List</title>');
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
    printWindow.document.write('<h1>' + t('documentSettings.report_title', 'Document Settings Report') + '</h1>');

    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr>');
    tableColumns.forEach(col => {
      if (col.key !== 'actions') {
        printWindow.document.write('<th>' + col.label + '</th>');
      }
    });
    printWindow.document.write('</tr></thead>');

    printWindow.document.write('<tbody>');
    filteredSettings.forEach(setting => {
      printWindow.document.write('<tr>');
      tableColumns.forEach(col => {
        if (col.key !== 'actions') {
          let cellValue = setting[col.key] || '-';
          if (col.key === 'isActive') {
            cellValue = setting[col.key] ? t('common.yes') : t('common.no');
          } else if (col.key === 'createdAt') {
            cellValue = new Date(setting[col.key]).toLocaleDateString();
          }
          printWindow.document.write('<td>' + cellValue + '</td>');
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
    { key: 'companyName', label: t('documentSettings.companyName', 'Company Name') },
    { key: 'headerText', label: t('documentSettings.headerText', 'Header Text') },
    { key: 'footerText', label: t('documentSettings.footerText', 'Footer Text') },
    { key: 'isActive', label: t('documentSettings.isActive', 'Active') },
    { key: 'createdBy', label: t('documentSettings.createdBy', 'Created By') },
    { key: 'createdAt', label: t('documentSettings.createdAt', 'Created At') },
    { key: 'actions', label: t('documentSettings.actions', 'Actions'), align: (language === 'ar' || language === 'he') ? 'left' : 'right' },
  ];

  const getSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'ascending'
        ? <ArrowUpward fontSize="small" className="ml-1" />
        : <ArrowDownward fontSize="small" className="ml-1" />;
    }
    return null;
  };

  const getActiveIcon = (isActive) => {
    return isActive ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <div className="h-5 w-5"></div>
    );
  };

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
        <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${(language === "ar" || language === "he") ? "text-right" : "text-left"}`}>
          <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">{t('documentSettings.firstTitle', 'Dashboard')}</NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">{t('documentSettings.secondeTitle', 'Document Settings')}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="contained" size="small" onClick={() => navigate('/document-settings/add')} sx={{ background: '#6C5FFC', color: '#fff' }}>
            {t('documentSettings.add_button', 'Add Settings')}
          </Button>
        </div>
      </div>

      <div className='flex rounded-md justify-between items-start flex-wrap mb-4'>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={t('documentSettings.search_placeholder', 'Search by company name, header, footer...')}
            className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg w-full sm:w-[300px] shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:mt-0">
          <Button variant="outlined" size="small" onClick={handleExportCSV} disabled={filteredSettings.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportCsv', 'CSV')}</Button>
          <Button variant="outlined" size="small" onClick={handleExportExcel} disabled={filteredSettings.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportExcel', 'Excel')}</Button>
          <Button variant="outlined" size="small" onClick={handleExportPDF} disabled={filteredSettings.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportPdf', 'PDF')}</Button>
          <Button variant="outlined" size="small" onClick={handlePrint} disabled={filteredSettings.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.print', 'Print')}</Button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {t('documentSettings.showing_results', 'Showing {{count}} of {{total}} settings', { count: visibleRows.length, total: filteredSettings.length })}
      </div>

      <div className="overflow-x-auto hide-scrollbar bg-[rgb(255,255,255)] dark:bg-navbarBack shadow-md rounded-lg">
        <table id="document-settings-table" className="w-full text-sm text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-400">
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
              visibleRows.map((setting) => (
                <tr key={setting._id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[rgb(255,255,255)]">{setting.companyName}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{setting.headerText}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{setting.footerText}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getActiveIcon(setting.isActive)}
                      <span className={`ml-2 ${setting.isActive ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                        {setting.isActive ? t('common.yes') : t('common.no')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{setting.createdBy}</td>
                  <td className="px-6 py-4">{new Date(setting.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <IconButton aria-label="Actions" size="small" onClick={(event) => handleMenuOpen(event, setting._id)}><MoreVert /></IconButton>
                    <Menu anchorEl={anchorEls[setting._id]} open={Boolean(anchorEls[setting._id])} onClose={() => handleMenuClose(setting._id)}>
                      <MenuItem onClick={() => handleView(setting)}><Visibility size={16} className="mr-2" /> {t('common.view')}</MenuItem>
                      <MenuItem onClick={() => handleEdit(setting)}><Edit size={16} className="mr-2" /> {t('common.edit')}</MenuItem>
                      {!setting.isActive && (
                        <MenuItem onClick={() => handleActivate(setting._id, setting.companyName)}><CheckCircle size={16} className="mr-2" /> {t('documentSettings.activate')}</MenuItem>
                      )}
                      <MenuItem onClick={() => handleDelete(setting._id, setting.companyName, setting.isActive)} className="text-red-600 dark:text-red-400" disabled={setting.isActive}><Delete size={16} className="mr-2" /> {t('common.delete')}</MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={tableColumns.length} className="text-center py-10 text-gray-500">{t('documentSettings.no_results')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentSettings;