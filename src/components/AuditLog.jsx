import { useEffect, useMemo, useState, useCallback } from 'react';
import { IconButton, Menu, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import { X, User, GitCommit, Database, Calendar, Code } from 'lucide-react';

const ROWS_PER_PAGE = 10;

export default function AuditLogs() {
  const { t, i18n: { language } } = useTranslation();
  const [allLogs, setAllLogs] = useState([]);
  const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE);
  const [anchorEls, setAnchorEls] = useState({});
  const [searchText, setSearchText] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'createdAtDate', direction: 'descending' });

  const tableHeaders = useMemo(() => [
    { key: 'userName', label: t('audit.table.userName', 'User Name') },
    { key: 'action', label: t('audit.table.action', 'Action') },
    { key: 'entity', label: t('audit.table.entity', 'Entity') },
    { key: 'createdAt', label: t('audit.table.date', 'Date'), type: 'date' },
    { key: 'actions', label: t('audit.table.actions', 'Actions'), align: (language === 'ar' || language === 'he') ? 'left' : 'right' },
  ], [t, language]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    setDisplayCount(ROWS_PER_PAGE);
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const res = await axios.get(`http://localhost:3002/api/v1/AuditLog/all`, { headers: { token } });
      const logsArray = res.data.logs || [];
      const formatted = logsArray.map((log) => ({
        id: log._id,
        userName: log.userName,
        action: log.action,
        entity: log.entity,
        createdAt: new Date(log.createdAt).toLocaleString((language === 'ar' || language === 'he') ? 'ar-EG' : 'en-US'),
        createdAtDate: new Date(log.createdAt), // For sorting
        fullLog: log,
      }));
      setAllLogs(formatted);
    } catch (err) {
      setAllLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const requestSort = (key) => {
    let sortKey = key;
    if (key === 'createdAt') sortKey = 'createdAtDate'; // Use the date object for sorting

    let direction = 'ascending';
    if (sortConfig.key === sortKey && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: sortKey, direction });
  };

  const getSortIcon = (columnKey) => {
    const sortKey = columnKey === 'createdAt' ? 'createdAtDate' : columnKey;
    if (sortConfig.key === sortKey) {
      return sortConfig.direction === 'ascending'
        ? <ArrowUpwardIcon fontSize="small" className="ml-1 rtl:mr-1 rtl:ml-0" />
        : <ArrowDownwardIcon fontSize="small" className="ml-1 rtl:mr-1 rtl:ml-0" />;
    }
    return null;
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...allLogs];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (aVal instanceof Date && bVal instanceof Date) {
          if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
        } else {
          if (String(aVal).toLowerCase() < String(bVal).toLowerCase()) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (String(aVal).toLowerCase() > String(bVal).toLowerCase()) return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [allLogs, sortConfig]);

  const filteredLogs = useMemo(() => {
    if (!searchText) return sortedData;
    const lowerSearch = searchText.toLowerCase();
    return sortedData.filter((log) =>
      Object.values(log).some((val) => val && typeof val !== 'object' && String(val).toLowerCase().includes(lowerSearch))
    );
  }, [sortedData, searchText]);

  const visibleLogs = useMemo(() => filteredLogs.slice(0, displayCount), [filteredLogs, displayCount]);

  const handleMenuOpen = (event, rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: event.currentTarget }));
  const handleMenuClose = (rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: undefined }));
  const openDetailDialog = (log) => { setSelectedLog(log); setDetailDialogOpen(true); };
  const closeDetailDialog = () => { setSelectedLog(null); setDetailDialogOpen(false); };

  const handleExportExcel = () => {
    if (filteredLogs.length === 0) { toast.info(t('common.noDataToExport', 'No data to export.')); return; }
    const exportData = filteredLogs.map((log) => ({
      [t('audit.table.userName')]: log.userName,
      [t('audit.table.action')]: log.action,
      [t('audit.table.entity')]: log.entity,
      [t('audit.table.date')]: log.createdAt,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('audit.exportSheet', 'Audit Logs'));
    XLSX.writeFile(workbook, t('audit.exportExcelFile', 'audit_logs.xlsx'));
  };

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) { toast.info(t('common.noDataToExport', 'No data to export.')); return; }
    const headers = tableHeaders.filter(h => h.key !== 'actions').map(h => h.label);
    const csvRows = [
      headers.join(','),
      ...filteredLogs.map(log =>
        [
          `"${(log.userName || '').toString().replace(/"/g, '""')}"`,
          `"${(log.action || '').toString().replace(/"/g, '""')}"`,
          `"${(log.entity || '').toString().replace(/"/g, '""')}"`,
          `"${(log.createdAt || '').toString().replace(/"/g, '""')}"`
        ].join(',')
      )
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'audit_logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (filteredLogs.length === 0) { toast.info(t('common.noDataToExport', 'No data to export.')); return; }
    const doc = new jsPDF();
    doc.text(t('audit.exportPdfTitle', 'Audit Logs Report'), 14, 22);
    const exportColumns = tableHeaders.filter((h) => h.key !== 'actions').map((h) => ({ header: h.label, dataKey: h.key }));
    doc.autoTable({
      columns: exportColumns,
      body: filteredLogs,
      startY: 30,
      styles: { fontSize: 8, font: 'Arial' },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
    doc.save(t('audit.exportPdfFileName', 'audit_logs.pdf'));
  };

  const handlePrint = () => {
    if (filteredLogs.length === 0) { toast.info(t('common.noDataToExport', 'No data to print.')); return; }
    const printWindow = window.open('', '_blank');
    const title = t('audit.printReportTitle', 'Audit Logs Report');
    printWindow.document.write(`<html><head><title>${title}</title><style>body{font-family:${(language === 'ar' || language === 'he') ? 'Cairo, sans-serif' : 'Arial, sans-serif'};direction:${(language === 'ar' || language === 'he') ? 'rtl' : 'ltr'};}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:${(language === 'ar' || language === 'he') ? 'right' : 'left'};}th{background-color:#f2f2f2;}</style></head><body><h1>${title}</h1><table><thead><tr>`);
    tableHeaders.filter(c => c.key !== 'actions').forEach(col => printWindow.document.write(`<th>${col.label}</th>`));
    printWindow.document.write('</tr></thead><tbody>');
    filteredLogs.forEach(log => {
      printWindow.document.write('<tr>');
      printWindow.document.write(`<td>${log.userName || ''}</td>`);
      printWindow.document.write(`<td>${log.action || ''}</td>`);
      printWindow.document.write(`<td>${log.entity || ''}</td>`);
      printWindow.document.write(`<td>${log.createdAt || ''}</td>`);
      printWindow.document.write('</tr>');
    });
    printWindow.document.write('</tbody></table></body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleScroll = useCallback(() => {
    const nearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200;
    if (nearBottom && displayCount < filteredLogs.length && !isLoadingMore && !loadingLogs) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setDisplayCount((prev) => Math.min(prev + ROWS_PER_PAGE, filteredLogs.length));
        setIsLoadingMore(false);
      }, 300);
    }
  }, [displayCount, filteredLogs.length, isLoadingMore, loadingLogs]);

  useEffect(() => { fetchLogs(); }, []);
  useEffect(() => { window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, [handleScroll]);
  useEffect(() => { setDisplayCount(ROWS_PER_PAGE); }, [searchText]);

  return (
    <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === 'ar' || language === 'he') ? 'rtl' : 'ltr'}>
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
        <div className="flex gap-2 md:gap-[14px] items-center text-sm md:text-base">
          <NavLink to="/home" className="hover:underline text-blue-600 dark:text-blue-400">{t('breadcrumbs.auditLogs', 'Audit Logs')}</NavLink>

        </div>
      </div>
      <div className='flex rounded-md justify-between items-start flex-wrap '>
        <div className="">
          <input type="text" placeholder={t('audit.searchPlaceholder', 'Search logs...')} className="p-2 border dark:!border-none dark:bg-gray-700  dark:text-gray-200 rounded-md w-[300px] mb-6 shadow-sm focus:ring-2 focus:ring-blue-500" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outlined" size="small" onClick={handleExportCSV} sx={{ background: '#6C5FFC', color: '#fff' }} disabled={filteredLogs.length === 0}> {t('common.exportCsv', 'CSV')} </Button>
          <Button variant="outlined" size="small" onClick={handleExportExcel} sx={{ background: '#6C5FFC', color: '#fff' }} disabled={filteredLogs.length === 0}> {t('common.exportExcel', 'Excel')} </Button>
          <Button variant="outlined" size="small" onClick={handleExportPDF} sx={{ background: '#6C5FFC', color: '#fff' }} disabled={filteredLogs.length === 0}> {t('common.exportPdf', 'PDF')} </Button>
          <Button variant="outlined" size="small" onClick={handlePrint} sx={{ background: '#6C5FFC', color: '#fff' }} disabled={filteredLogs.length === 0}> {t('common.print', 'Print')} </Button>
        </div>
      </div>

      <div className="overflow-x-auto hide-scrollbar shadow-md rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-300">
          <thead className="text-xs bg-gray-50 dark:bg-gray-700 dark:text-gray-300 uppercase">
            <tr>
              {tableHeaders.map((col) => (
                <th key={col.key} className={`px-6 py-3 ${col.align === 'right' ? 'text-right' : ((language === 'ar' || language === 'he') ? 'text-right' : 'text-left')} ${col.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}`} onClick={() => col.key !== 'actions' && requestSort(col.key)}>
                  <div className="flex items-center">
                    <span>{col.label}</span>
                    {col.key !== 'actions' && getSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[rgb(255,255,255)] dark:bg-navbarBack">
            {loadingLogs && visibleLogs.length === 0 ? (
              <tr><td colSpan={tableHeaders.length} className="text-center py-10"><div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3 rtl:ml-3 rtl:mr-0"></div>{t('common.loading', 'Loading...')}</div></td></tr>
            ) : visibleLogs.length > 0 ? (
              visibleLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{log.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.entity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.createdAt}</td>
                  <td className={`px-6 py-4 ${(language === 'ar' || language === 'he') ? 'text-left' : 'text-right'}`}>
                    <IconButton aria-label="actions" size="small" onClick={(event) => handleMenuOpen(event, log.id)} className="dark:text-gray-400">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu anchorEl={anchorEls[log.id]} open={Boolean(anchorEls[log.id])} onClose={() => handleMenuClose(log.id)} anchorOrigin={{ vertical: 'bottom', horizontal: (language === 'ar' || language === 'he') ? 'left' : 'right' }} transformOrigin={{ vertical: 'top', horizontal: (language === 'ar' || language === 'he') ? 'left' : 'right' }} MenuListProps={{ className: 'dark:bg-gray-800 dark:text-gray-200' }}>
                      <MenuItem onClick={() => { openDetailDialog(log); handleMenuClose(log.id); }} className="dark:hover:bg-gray-700">
                        {t('common.details', 'Details')}
                      </MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={tableHeaders.length} className="text-center py-10 text-gray-500 dark:text-gray-400">{searchText ? t('common.noSearchResults', 'No results found') : t('common.noData', 'No audit logs found.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isLoadingMore && <div className="text-center py-8 w-full max-w-5xl bg-[rgb(255,255,255)] rounded-lg shadow-xl flex flex-col dark:bg-navbarBack max-h-[95vh]
">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>{t('common.loadingMore', 'Loading more...')}</div></div>}
      {!isLoadingMore && !loadingLogs && displayCount >= filteredLogs.length && filteredLogs.length > ROWS_PER_PAGE && <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('common.endOfResults', "You've reached the end of the results")}</div>}
      {detailDialogOpen && (
        <div
          className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300"
          onClick={closeDetailDialog}>
          <div
            className="bg-[rgb(255,255,255)] dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300"
            onClick={e => e.stopPropagation()}
            dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
            <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t('audit.detailsTitle', 'Audit Log Details')}
              </h2>
              <button
                type="button"
                onClick={closeDetailDialog}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto hide-scrollbar">
              {selectedLog ? (
                <>
                  {/* Main Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    {/* User Name */}
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <User size={16} /> {t('audit.table.userName')}
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-800 dark:text-gray-200">{selectedLog.userName}</p>
                    </div>
                    {/* Action */}
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <GitCommit size={16} /> {t('audit.table.action')}
                      </p>
                      <p className="mt-1 text-base text-gray-700 dark:text-gray-300">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedLog.action === 'CREATE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          selectedLog.action === 'UPDATE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            selectedLog.action === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                          {selectedLog.action}
                        </span>
                      </p>
                    </div>
                    {/* Entity */}
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <Database size={16} /> {t('audit.table.entity')}
                      </p>
                      <p className="mt-1 text-base text-gray-700 dark:text-gray-300">{selectedLog.entity}</p>
                    </div>
                    {/* Date */}
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <Calendar size={16} /> {t('audit.table.date')}
                      </p>
                      <p className="mt-1 text-base text-gray-700 dark:text-gray-300">{new Date(selectedLog.createdAt).toLocaleString(language)}</p>
                    </div>
                  </div>

                  {/* Extra Data Section */}
                  {selectedLog.fullLog && (
                    <div>
                      <h4 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        <Code size={18} /> {t('audit.details.extraData', 'Changes Data')}
                      </h4>
                      <pre className="bg-gray-100 dark:bg-gray-900 dark:bg-black/50 text-gray-200 p-4 rounded-lg font-mono text-xs overflow-auto max-h-60">
                        <code>
                          {JSON.stringify(selectedLog.fullLog.changes, null, 2)}
                        </code>
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                    {t('common.loading', 'Loading...')}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end items-center p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={closeDetailDialog}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-[rgb(255,255,255)] border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:!border-none dark:hover:bg-gray-600"
              >
                {t("common.cancel", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}