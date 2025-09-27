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
import InsuranceMashreqRep from './insuranceMashreqRep';
import { Link } from 'react-router-dom';
import { useTranslation as useReactI18nextTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const ROWS_PER_PAGE = 10;

function MashreqRep() {
    const { t, i18n: { language } } = useReactI18nextTranslation();
    const [allMashreqReports, setAllMashreqReports] = useState([]);
    const [anchorEls, setAnchorEls] = useState({});
    const [showAddReportForm, setShowAddReportForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [sortConfig, setSortConfig] = useState({ key: 'accidentDateObj', direction: 'descending' });

    const tableHeaders = useMemo(() => [
        { key: 'reportIdentifier', label: t('mashreq.table.reportIdentifier', 'Report/Policy No.') },
        { key: 'accidentDate', label: t('mashreq.table.accidentDate', 'Accident Date'), type: 'date' },
        { key: 'accidentLocation', label: t('mashreq.table.location', 'Location') },
        { key: 'insuredName', label: t('mashreq.table.insuredName', 'Insured Name') },
        { key: 'driverName', label: t('mashreq.table.driverName', 'Driver Name') },
        { key: 'vehicleRegNo', label: t('mashreq.table.vehicleRegNo', 'Vehicle Reg. No.') },
        { key: 'branchOffice', label: t('mashreq.table.branchOffice', 'Branch Office') },
        { key: 'actions', label: t('mashreq.table.actions', 'Actions'), align: language === 'ar' ? 'left' : 'right' },
    ], [t, language]);

    const requestSort = (key) => {
        let sortKey = key;
        if (key === 'accidentDate') sortKey = 'accidentDateObj'; // Sort by date object

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

    const fetchMashreqReports = async () => {
        setLoading(true);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get(`http://localhost:3002/api/v1/Al_MashreqAccidentReport/all`, { headers: { token } });
            const reportsArray = res.data.findAll || res.data.reports || (Array.isArray(res.data) ? res.data : null);
            if (!Array.isArray(reportsArray)) {
                setAllMashreqReports([]);
                return;
            }
            const formattedData = reportsArray.map(report => ({
                id: report._id,
                reportIdentifier: report.insurancePolicy?.number || report._id.slice(-6) || 'N/A',
                accidentDate: report.accident?.date ? new Date(report.accident.date).toLocaleDateString(language) : 'N/A',
                accidentDateObj: report.accident?.date ? new Date(report.accident.date) : null, // for sorting
                accidentLocation: report.accident?.accidentLocation || 'N/A',
                insuredName: report.insuredPerson?.name || (report.insuredId?.first_name ? `${report.insuredId.first_name} ${report.insuredId.last_name}` : 'N/A'),
                driverName: report.driver?.name || 'N/A',
                vehicleRegNo: report.vehicle?.registrationNumber || 'N/A',
                branchOffice: report.branchOffice || 'N/A',
                fullReportData: report
            }));
            setAllMashreqReports(formattedData);
        } catch (err) {
            setAllMashreqReports([]);
        } finally {
            setLoading(false);
        }
    };

    const sortedData = useMemo(() => {
        let sortableItems = [...allMashreqReports];
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
    }, [allMashreqReports, sortConfig]);

    const filteredMashreqReports = useMemo(() => {
        if (!searchText) return sortedData;
        const lowerSearch = searchText.toLowerCase();
        return sortedData.filter((report) =>
            Object.entries(report).some(([key, val]) =>
                key !== 'fullReportData' && key !== 'accidentDateObj' && String(val).toLowerCase().includes(lowerSearch)
            )
        );
    }, [sortedData, searchText]);

    const visibleReports = useMemo(() => filteredMashreqReports.slice(0, displayCount), [filteredMashreqReports, displayCount]);

    const exportToExcel = () => {
        if (filteredMashreqReports.length === 0) { toast.info(t('common.noDataToExport')); return; }
        const exportData = filteredMashreqReports.map(row => ({
            [t('mashreq.table.reportIdentifier')]: row.reportIdentifier,
            [t('mashreq.table.accidentDate')]: row.accidentDate,
            [t('mashreq.table.location')]: row.accidentLocation,
            [t('mashreq.table.insuredName')]: row.insuredName,
            [t('mashreq.table.driverName')]: row.driverName,
            [t('mashreq.table.vehicleRegNo')]: row.vehicleRegNo,
            [t('mashreq.table.branchOffice')]: row.branchOffice,
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t('mashreq.exportSheetName', 'Mashreq Reports'));
        XLSX.writeFile(workbook, t('mashreq.exportExcelFileName', 'MashreqReports.xlsx'));
    };

    const exportToCSV = () => {
        if (filteredMashreqReports.length === 0) { toast.info(t('common.noDataToExport')); return; }
        const headers = tableHeaders.filter(h => h.key !== 'actions').map(h => h.label);
        const csvRows = [
            headers.join(','),
            ...filteredMashreqReports.map(row =>
                [
                    `"${(row.reportIdentifier || '').toString().replace(/"/g, '""')}"`,
                    `"${(row.accidentDate || '').toString().replace(/"/g, '""')}"`,
                    `"${(row.accidentLocation || '').toString().replace(/"/g, '""')}"`,
                    `"${(row.insuredName || '').toString().replace(/"/g, '""')}"`,
                    `"${(row.driverName || '').toString().replace(/"/g, '""')}"`,
                    `"${(row.vehicleRegNo || '').toString().replace(/"/g, '""')}"`,
                    `"${(row.branchOffice || '').toString().replace(/"/g, '""')}"`
                ].join(',')
            )
        ];
        const csvContent = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'mashreq_reports.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        if (filteredMashreqReports.length === 0) { toast.info(t('common.noDataToExport')); return; }
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(t('mashreq.exportPdfTitle', 'Al-Mashreq Accident Reports'), 14, 15);
        const exportColumns = tableHeaders.filter(h => h.key !== 'actions').map(h => ({ header: h.label, dataKey: h.key }));
        doc.autoTable({
            columns: exportColumns,
            body: filteredMashreqReports,
            startY: 22, styles: { fontSize: 8, font: "Arial" },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        });
        doc.save(t('mashreq.exportPdfFileName', 'MashreqReports.pdf'));
    };

    const handlePrint = () => {
        if (filteredMashreqReports.length === 0) { toast.info(t('common.noDataToExport')); return; }
        const printWindow = window.open('', '_blank');
        const title = t('mashreq.printReportTitle', 'Al-Mashreq Accident Reports');
        printWindow.document.write(`<html><head><title>${title}</title><style>body{font-family:${language === 'ar' ? 'Cairo, sans-serif' : 'Arial, sans-serif'};direction:${language === 'ar' ? 'rtl' : 'ltr'};}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:${language === 'ar' ? 'right' : 'left'};}th{background-color:#f2f2f2;}</style></head><body><h1>${title}</h1><table><thead><tr>`);
        tableHeaders.filter(c => c.key !== 'actions').forEach(col => printWindow.document.write(`<th>${col.label}</th>`));
        printWindow.document.write('</tr></thead><tbody>');
        filteredMashreqReports.forEach(report => {
            printWindow.document.write(`<tr>
                <td>${report.reportIdentifier || ''}</td>
                <td>${report.accidentDate || ''}</td>
                <td>${report.accidentLocation || ''}</td>
                <td>${report.insuredName || ''}</td>
                <td>${report.driverName || ''}</td>
                <td>${report.vehicleRegNo || ''}</td>
                <td>${report.branchOffice || ''}</td>
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
        if (!window.confirm(t("mashreq.confirmDelete", "Are you sure you want to delete this report?"))) return;
        const token = `islam__${localStorage.getItem("token")}`;
        try {
            await axios.delete(`http://localhost:3002/api/v1/Al_MashreqAccidentReport/delete/${id}`, { headers: { token } });
            fetchMashreqReports();
        } catch (err) {
            alert(t("mashreq.deleteError", "Failed to delete report."));
        }
        handleMenuClose(id);
    };

    const handleAddReportSuccess = () => { setShowAddReportForm(false); fetchMashreqReports(); };

    useEffect(() => { fetchMashreqReports(); }, [language]);

    const handleScroll = useCallback(() => {
        const nearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200;
        if (nearBottom && displayCount < filteredMashreqReports.length && !isLoadingMore && !loading) {
            setIsLoadingMore(true);
            setTimeout(() => {
                setDisplayCount(prevCount => Math.min(prevCount + ROWS_PER_PAGE, filteredMashreqReports.length));
                setIsLoadingMore(false);
            }, 300);
        }
    }, [displayCount, filteredMashreqReports.length, isLoadingMore, loading]);

    useEffect(() => { window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, [handleScroll]);
    useEffect(() => { setDisplayCount(ROWS_PER_PAGE); }, [searchText]);

    return (
        <div className="px-4 py-5 dark:bg-dark2 dark:text-dark3 min-h-screen">
            <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-[22px] rounded-md justify-between items-center mb-3" dir={language === "ar" ? "rtl" : "ltr"}>
                <div className="flex gap-[14px] items-center text-gray-700 dark:text-gray-300">
                    <Link className='hover:underline text-blue-600 dark:text-blue-400' to="/home">{t('navigation.home', 'Home')}</Link>
                    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="text-gray-500 dark:text-gray-400">{t('navigation.mashreqReport', 'Al Mashreq Accident Report')}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => setShowAddReportForm(true)} variant="contained" sx={{ background: '#6C5FFC', color: '#fff' }} startIcon={<AddIcon />} size="small">{t('buttons.addReport', 'Add Report')}</Button>
                </div>
            </div>
            <div className='flex rounded-md justify-between items-start flex-wrap my-2'>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={exportToCSV} variant="outlined" sx={{ background: '#6C5FFC', color: '#fff' }} size="small" disabled={filteredMashreqReports.length === 0}>{t('buttons.exportCsv', 'CSV')}</Button>
                    <Button onClick={exportToExcel} variant="outlined" sx={{ background: '#6C5FFC', color: '#fff' }} size="small" disabled={filteredMashreqReports.length === 0}>{t('buttons.exportExcel', 'Excel')}</Button>
                    <Button onClick={exportToPDF} variant="outlined" sx={{ background: '#6C5FFC', color: '#fff' }} size="small" disabled={filteredMashreqReports.length === 0}>{t('buttons.exportPdf', 'PDF')}</Button>
                    <Button onClick={handlePrint} variant="outlined" sx={{ background: '#6C5FFC', color: '#fff' }} size="small" disabled={filteredMashreqReports.length === 0}>{t('buttons.print', 'Print')}</Button>
                </div><div className="">
                    <input type="text" placeholder={t('common.searchPlaceholder', "Search in Report ...")} className={`p-2 border rounded-md w-[300px] mb-4 dark:bg-gray-700 dark:text-[rgb(255,255,255)] dark:!border-none ${language === 'ar' ? 'text-right' : 'text-left'}`} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                </div>

            </div>
            <div className={`mb-4 text-sm text-gray-600 dark:text-gray-400 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('mashreq.showing_results', 'Showing {{count}} of {{total}} reports', { count: visibleReports.length, total: filteredMashreqReports.length })}
            </div>
            <div className={`overflow-x-auto bg-[rgb(255,255,255)] dark:bg-navbarBack shadow-md rounded-lg`} dir={language === "ar" ? "rtl" : "ltr"}>
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                            {tableHeaders.map(col => (
                                <th key={col.key} scope="col" className={`px-6 py-3 ${col.align === 'right' ? 'text-right' : (col.align === 'left' ? 'text-left' : (language === 'ar' ? 'text-right' : 'text-left'))} ${col.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}`} onClick={() => col.key !== 'actions' && requestSort(col.key)}>
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
                            <tr><td colSpan={tableHeaders.length} className="text-center py-16"><div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>{t('common.loading', 'Loading...')}</div></td></tr>
                        ) : visibleReports.length > 0 ? (
                            visibleReports.map((report) => (
                                <tr key={report.id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[rgb(255,255,255)]">{report.reportIdentifier}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{report.accidentDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{report.accidentLocation}</td>
                                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{report.insuredName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{report.driverName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{report.vehicleRegNo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{report.branchOffice}</td>
                                    <td className={`px-6 py-4 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                                        <IconButton aria-label={t('common.actions')} size="small" onClick={(event) => handleMenuOpen(event, report.id)} className="dark:text-gray-400"><MoreVertIcon fontSize="small" /></IconButton>
                                        <Menu anchorEl={anchorEls[report.id]} open={Boolean(anchorEls[report.id])} onClose={() => handleMenuClose(report.id)} anchorOrigin={{ vertical: 'bottom', horizontal: language === 'ar' ? 'left' : 'right' }} transformOrigin={{ vertical: 'top', horizontal: language === 'ar' ? 'left' : 'right' }} MenuListProps={{ className: 'dark:bg-gray-800 dark:text-gray-200' }}>
                                            <MenuItem onClick={() => handleDelete(report.id)} className="dark:hover:bg-gray-700 text-red-600 dark:text-red-400"><DeleteIcon fontSize="small" className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`} />{t("buttons.delete", "Delete")}</MenuItem>
                                        </Menu>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={tableHeaders.length} className="text-center py-16 text-gray-500 dark:text-gray-400">{searchText ? t('common.noSearchResults') : t('mashreq.noReportsFound')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isLoadingMore && <div className="text-center py-8"><div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>{t('common.loadingMore', 'Loading more...')}</div></div>}
            {!isLoadingMore && !loading && displayCount >= filteredMashreqReports.length && filteredMashreqReports.length > ROWS_PER_PAGE && <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('common.endOfResults')}</div>}

            {showAddReportForm && <InsuranceMashreqRep isOpen={showAddReportForm} onClose={() => setShowAddReportForm(false)} onReportAdded={handleAddReportSuccess} />}
        </div>
    );
}

export default MashreqRep;