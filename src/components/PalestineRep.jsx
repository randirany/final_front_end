import { useEffect, useState, useMemo, useCallback } from 'react';
import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import InsurancePalestineRep from './InsurancePalestinelRep';
import { Link } from 'react-router-dom';
import { useTranslation as useReactI18nextTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { toLocaleDateStringEN } from '../utils/dateFormatter';

const ROWS_PER_PAGE = 10;

function PalestineRep() {
    const { t, i18n: { language } } = useReactI18nextTranslation();
    const [allPalestineReports, setAllPalestineReports] = useState([]);
    const [anchorEls, setAnchorEls] = useState({});
    const [showAddReportForm, setShowAddReportForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [sortConfig, setSortConfig] = useState({ key: 'accidentDateObj', direction: 'descending' });

    const tableHeaders = useMemo(() => [
        { key: 'time', label: t('palestine.table.reportNumber', "Accident time") },
        { key: 'accidentDate', label: t('palestine.table.accidentDate', "Accident Date"), type: 'date' },
        { key: 'accidentLocation', label: t('palestine.table.location', "Location") },
        { key: 'documentNumber', label: t('palestine.table.documentNumber', "Doc. Number") },
        { key: 'ownerName', label: t('palestine.table.ownerName', "Owner Name") },
        { key: 'driverName', label: t('palestine.table.driverName', "Driver Name") },
        { key: 'vehicleNumber', label: t('palestine.table.vehicleNumber', "Vehicle Number") },
        { key: 'actions', label: t('palestine.table.actions', 'Actions'), align: (language === 'ar' || language === 'he') ? 'left' : 'right' },
    ], [t, language]);

    const requestSort = (key) => {
        let sortKey = key;
        if (key === 'accidentDate') sortKey = 'accidentDateObj';
        let direction = 'ascending';
        if (sortConfig.key === sortKey && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key: sortKey, direction });
    };

    const getSortIcon = (columnKey) => {
        const sortKey = columnKey === 'accidentDate' ? 'accidentDateObj' : columnKey;
        if (sortConfig.key === sortKey) {
            return sortConfig.direction === 'ascending'
                ? <ArrowUpwardIcon fontSize="small" className="ml-1 rtl:mr-1 rtl:ml-0" />
                : <ArrowDownwardIcon fontSize="small" className="ml-1 rtl:mr-1 rtl:ml-0" />;
        }
        return null;
    };

    const fetchPalestineReports = async () => {
        setLoading(true);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get(`http://localhost:3002/api/v1/PlestineAccidentReport/all`, { headers: { token } });
            const reports = res.data.findAll || res.data.data || (Array.isArray(res.data) ? res.data : null);
            if (!Array.isArray(reports)) {
                setAllPalestineReports([]);
                return;
            }
            const formattedData = reports.map(report => ({
                id: report._id,
                time: report.accidentDetails?.time || 'N/A',
                accidentDate: report.accidentDetails?.accidentDate ? toLocaleDateStringEN(report.accidentDetails.accidentDate) : 'N/A',
                accidentDateObj: report.accidentDetails?.accidentDate ? new Date(report.accidentDetails.accidentDate) : null,
                accidentLocation: report.accidentDetails?.location || 'N/A',
                documentNumber: report.agentInfo?.documentNumber || 'N/A',
                ownerName: report.vehicleInfo?.ownerName || 'N/A',
                driverName: report.driverInfo?.name || 'N/A',
                vehicleNumber: report.vehicleInfo?.vehicleNumber || 'N/A',
            }));
            setAllPalestineReports(formattedData);
        } catch (err) {
            setAllPalestineReports([]);
        } finally {
            setLoading(false);
        }
    };

    const sortedData = useMemo(() => {
        let sortableItems = [...allPalestineReports];
        if (sortConfig.key) {
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
    }, [allPalestineReports, sortConfig]);

    const filteredPalestineReports = useMemo(() => {
        if (!searchText) return sortedData;
        const lowerSearch = searchText.toLowerCase();
        return sortedData.filter((report) =>
            Object.entries(report).some(([key, val]) =>
                key !== 'fullReportData' && key !== 'accidentDateObj' && String(val).toLowerCase().includes(lowerSearch)
            )
        );
    }, [sortedData, searchText]);

    const visibleReports = useMemo(() => filteredPalestineReports.slice(0, displayCount), [filteredPalestineReports, displayCount]);

    const handleExportExcel = () => {
        if (filteredPalestineReports.length === 0) { toast.info(t('common.noDataToExport')); return; }
        const exportData = filteredPalestineReports.map(row => ({
            [t('palestine.table.reportNumber')]: row.time,
            [t('palestine.table.accidentDate')]: row.accidentDate,
            [t('palestine.table.location')]: row.accidentLocation,
            [t('palestine.table.documentNumber')]: row.documentNumber,
            [t('palestine.table.ownerName')]: row.ownerName,
            [t('palestine.table.driverName')]: row.driverName,
            [t('palestine.table.vehicleNumber')]: row.vehicleNumber,
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t('palestine.exportSheetName', "Palestine Reports"));
        XLSX.writeFile(workbook, t('palestine.exportExcelFileName', "Palestine_Reports.xlsx"));
    };

    const handleExportCSV = () => {
        if (filteredPalestineReports.length === 0) { toast.info(t('common.noDataToExport')); return; }
        const headers = tableHeaders.filter(h => h.key !== 'actions').map(h => h.label);
        const csvRows = [
            headers.join(','),
            ...filteredPalestineReports.map(row =>
                [
                    `"${(row.time || '').toString().replace(/"/g, '""')}"`,
                    `"${(row.accidentDate || '').toString().replace(/"/g, '""')}"`,
                    `"${(row.accidentLocation || '').toString().replace(/"/g, '""')}"`,
                    `"${(row.documentNumber || '').toString().replace(/"/g, '""')}"`,
                    `"${(row.ownerName || '').toString().replace(/"/g, '""')}"`,
                    `"${(row.driverName || '').toString().replace(/"/g, '""')}"`,
                    `"${(row.vehicleNumber || '').toString().replace(/"/g, '""')}"`
                ].join(',')
            )
        ];
        const csvContent = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'palestine_reports.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        if (filteredPalestineReports.length === 0) { toast.info(t('common.noDataToExport')); return; }
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(t('palestine.exportPdfTitle', "Palestine Insurance Accident Reports"), 14, 15);
        const exportColumns = tableHeaders.filter(h => h.key !== 'actions').map(h => ({ header: h.label, dataKey: h.key }));
        doc.autoTable({
            columns: exportColumns,
            body: filteredPalestineReports,
            startY: 22,
            styles: { fontSize: 8, font: "Arial" },
            headStyles: { fillColor: [34, 139, 34], textColor: 255 },
        });
        doc.save(t('palestine.exportPdfFileName', "Palestine_Reports.pdf"));
    };

    const handlePrint = () => {
        if (filteredPalestineReports.length === 0) { toast.info(t('common.noDataToExport')); return; }
        const printWindow = window.open('', '_blank');
        const title = t('palestine.printReportTitle', 'Palestine Insurance Accident Reports');
        printWindow.document.write(`<html><head><title>${title}</title><style>body{font-family:${(language === 'ar' || language === 'he') ? 'Cairo, sans-serif' : 'Arial, sans-serif'};direction:${(language === 'ar' || language === 'he') ? 'rtl' : 'ltr'};}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:${(language === 'ar' || language === 'he') ? 'right' : 'left'};}th{background-color:#f2f2f2;}</style></head><body><h1>${title}</h1><table><thead><tr>`);
        tableHeaders.filter(c => c.key !== 'actions').forEach(col => printWindow.document.write(`<th>${col.label}</th>`));
        printWindow.document.write('</tr></thead><tbody>');
        filteredPalestineReports.forEach(report => {
            printWindow.document.write(`<tr>
                <td>${report.time || ''}</td>
                <td>${report.accidentDate || ''}</td>
                <td>${report.accidentLocation || ''}</td>
                <td>${report.documentNumber || ''}</td>
                <td>${report.ownerName || ''}</td>
                <td>${report.driverName || ''}</td>
                <td>${report.vehicleNumber || ''}</td>
            </tr>`);
        });
        printWindow.document.write('</tbody></table></body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handleMenuOpen = (event, rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: event.currentTarget }));
    const handleMenuClose = (rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: undefined }));

    const handleDelete = async (id) => {
        if (!window.confirm(t('palestine.deleteConfirm'))) return;
        const token = `islam__${localStorage.getItem("token")}`;
        try {
            await axios.delete(`http://localhost:3002/api/v1/PlestineAccidentReport/delete/${id}`, { headers: { token } });
            fetchPalestineReports();
        } catch (err) {
            alert(t('palestine.deleteFailed'));
        }
        handleMenuClose(id);
    };

    const handleAddReportSuccess = () => { setShowAddReportForm(false); fetchPalestineReports(); };
    useEffect(() => { fetchPalestineReports(); }, [language]);

    const handleScroll = useCallback(() => {
        const nearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200;
        if (nearBottom && displayCount < filteredPalestineReports.length && !isLoadingMore && !loading) {
            setIsLoadingMore(true);
            setTimeout(() => {
                setDisplayCount(prevCount => Math.min(prevCount + ROWS_PER_PAGE, filteredPalestineReports.length));
                setIsLoadingMore(false);
            }, 300);
        }
    }, [displayCount, filteredPalestineReports.length, isLoadingMore, loading]);

    useEffect(() => { window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, [handleScroll]);
    useEffect(() => { setDisplayCount(ROWS_PER_PAGE); }, [searchText]);

    return (
        <div className="px-4 py-5 dark:bg-dark2 dark:text-dark3 min-h-screen">
            <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-[22px] rounded-md justify-between items-center mb-3" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
                <div className="flex gap-[14px] items-center text-gray-700 dark:text-gray-300">
                    <Link className='hover:underline text-blue-600 dark:text-blue-400' to="/home">{t('navigation.home')}</Link>
                    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="text-gray-500 dark:text-gray-400">{t('navigation.palestineReport')}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => setShowAddReportForm(true)} variant="contained" sx={{ background: '#6C5FFC', color: '#fff' }} startIcon={<AddIcon />} size="small">{t('buttons.addReport')}</Button>
                </div>
            </div>
            <div className='flex rounded-md justify-between items-start flex-wrap my-2'>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={handleExportCSV} variant="outlined" sx={{ background: '#6C5FFC', color: '#fff' }} size="small" disabled={filteredPalestineReports.length === 0}>{t('buttons.exportCsv')}</Button>
                    <Button onClick={handleExportExcel} variant="outlined" sx={{ background: '#6C5FFC', color: '#fff' }}  size="small" disabled={filteredPalestineReports.length === 0}>{t('buttons.exportExcel')}</Button>
                    <Button onClick={handleExportPDF} variant="outlined" sx={{ background: '#6C5FFC', color: '#fff' }} size="small" disabled={filteredPalestineReports.length === 0}>{t('buttons.exportPdf')}</Button>
                    <Button onClick={handlePrint} variant="outlined" sx={{ background: '#6C5FFC', color: '#fff' }} size="small" disabled={filteredPalestineReports.length === 0}>{t('buttons.print')}</Button>
                </div><div className="">
                    <input type="text" placeholder={t('common.searchPlaceholder', "Search in Report ...")} className={`p-2 border rounded-md w-[300px] mb-4 dark:bg-gray-700 dark:text-[rgb(255,255,255)] dark:!border-none ${(language === 'ar' || language === 'he') ? 'text-right' : 'text-left'}`} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                </div>

            </div>
            <div className={`mb-4 text-sm text-gray-600 dark:text-gray-400 ${(language === 'ar' || language === 'he') ? 'text-right' : 'text-left'}`}>
                {t('palestine.showing_results', { count: visibleReports.length, total: filteredPalestineReports.length })}
            </div>
            <div className="overflow-x-auto hide-scrollbar bg-[rgb(255,255,255)] dark:bg-navbarBack shadow-md rounded-lg" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                            {tableHeaders.map(col => (
                                <th key={col.key} scope="col" className={`px-6 py-3 ${col.align === 'right' ? 'text-right' : (col.align === 'left' ? 'text-left' : ((language === 'ar' || language === 'he') ? 'text-right' : 'text-left'))} ${col.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}`} onClick={() => col.key !== 'actions' && requestSort(col.key)}>
                                    <div className="flex items-center">
                                        <span>{col.label}</span>
                                        {col.key !== 'actions' && getSortIcon(col.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && visibleReports.length === 0 ? (
                            <tr><td colSpan={tableHeaders.length} className="text-center py-16"><div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>{t('common.loading')}</div></td></tr>
                        ) : visibleReports.length > 0 ? (
                            visibleReports.map((report) => (
                                <tr key={report.id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[rgb(255,255,255)]">{report.time}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{report.accidentDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{report.accidentLocation}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{report.documentNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{report.ownerName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{report.driverName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{report.vehicleNumber}</td>
                                    <td className={`px-6 py-4 ${(language === 'ar' || language === 'he') ? 'text-left' : 'text-right'}`}>
                                        <IconButton aria-label={t('common.actions')} size="small" onClick={(event) => handleMenuOpen(event, report.id)} className="dark:text-gray-400"><MoreVertIcon fontSize="small" /></IconButton>
                                        <Menu anchorEl={anchorEls[report.id]} open={Boolean(anchorEls[report.id])} onClose={() => handleMenuClose(report.id)} anchorOrigin={{ vertical: 'bottom', horizontal: (language === 'ar' || language === 'he') ? 'left' : 'right' }} transformOrigin={{ vertical: 'top', horizontal: (language === 'ar' || language === 'he') ? 'left' : 'right' }} MenuListProps={{ className: 'dark:bg-gray-800 dark:text-gray-200' }}>
                                            <MenuItem onClick={() => handleDelete(report.id)} className="dark:hover:bg-gray-700 text-red-600 dark:text-red-400"><DeleteIcon fontSize="small" className={`${(language === 'ar' || language === 'he') ? 'ml-2' : 'mr-2'}`} />{t("buttons.delete")}</MenuItem>
                                        </Menu>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={tableHeaders.length} className="text-center py-16 text-gray-500 dark:text-gray-400">{searchText ? t('common.noSearchResults') : t('palestine.noReportsFound')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isLoadingMore && <div className="text-center py-8"><div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>{t('common.loadingMore')}</div></div>}
            {!isLoadingMore && !loading && displayCount >= filteredPalestineReports.length && filteredPalestineReports.length > ROWS_PER_PAGE && <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('common.endOfResults')}</div>}
            {showAddReportForm && <InsurancePalestineRep isOpen={showAddReportForm} onClose={() => setShowAddReportForm(false)} onReportAdded={handleAddReportSuccess} />}
        </div>
    );
}

export default PalestineRep;