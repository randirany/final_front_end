import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { NavLink, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const ROWS_PER_PAGE = 15;

function AllInsurances() {
    const { t, i18n: { language } } = useTranslation();
    let navigate = useNavigate();

    const [allInsurances, setAllInsurances] = useState([]);
    const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE);
    const [anchorEls, setAnchorEls] = useState({});
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

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
        let sortableItems = [...allInsurances];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
                }
                if (sortConfig.key.toLowerCase().includes('date')) {
                    const dateA = new Date(aValue);
                    const dateB = new Date(bValue);
                    return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
                }
                const strA = String(aValue || '').toLowerCase();
                const strB = String(bValue || '').toLowerCase();
                if (strA < strB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (strA > strB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [allInsurances, sortConfig]);

    const filteredInsurances = useMemo(() => {
        if (!searchText) return sortedData;
        const lowerSearch = searchText.toLowerCase();
        return sortedData.filter((insurance) =>
            Object.values(insurance).some((val) =>
                String(val).toLowerCase().includes(lowerSearch)
            )
        );
    }, [searchText, sortedData]);

    const visibleRows = useMemo(() => {
        return filteredInsurances.slice(0, displayCount);
    }, [filteredInsurances, displayCount]);

    const tableColumns = [
        { key: 'insuredName', label: t('customers.table.name', 'Insured Name') },
        { key: 'plateNumber', label: t('insuranceList.vehicleDetails.modelYear', 'Plate Number') },
        { key: 'insuranceCompany', label: t('addInsuranceThird.labels.insuranceCompany', 'Company') },
        { key: 'insuranceType', label: t('insuranceCompany.table.insuranceType', 'Type') },
        { key: 'insuranceStartDate', label: t('insuranceList.table.startDate', 'Start Date') },
        { key: 'insuranceEndDate', label: t('insuranceList.table.endDate', 'End Date') },
        { key: 'remainingDebt', label: t('insuranceList.table.remainingDebt', 'Remaining Debt') },
        { key: 'agent', label: t('customers.table.agent', 'Agent') },
        { key: 'actions', label: t('insuranceList.table.actions', 'Actions'), align: language === 'ar' ? 'left' : 'right' },
    ];

    const fetchInsurances = async () => {
        setLoading(true);
        setDisplayCount(ROWS_PER_PAGE);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get(`http://localhost:3002/api/v1/insured/insurances/all`, {
                headers: { token }
            });
            const apiData = res.data.insurances || [];
            const formattedData = apiData.map(item => ({
                id: item._id,
                insuredId: item.insuredId,
                insuredName: item.insuredName,
                plateNumber: item.plateNumber,
                vehicleModel: item.vehicleModel,
                insuranceCompany: item.insuranceCompany,
                insuranceType: item.insuranceType,
                insuranceStartDate: item.insuranceStartDate ? item.insuranceStartDate.slice(0, 10) : '-',
                insuranceEndDate: item.insuranceEndDate ? item.insuranceEndDate.slice(0, 10) : '-',
                insuranceAmount: item.insuranceAmount,
                paidAmount: item.paidAmount,
                remainingDebt: item.remainingDebt,
                agent: item.agent,
            }));
            setAllInsurances(formattedData);
        } catch (err) {
            setAllInsurances([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInsurances(); }, []);

    const handleScroll = useCallback(() => {
        const threshold = 300;
        const nearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - threshold;
        if (nearBottom && displayCount < filteredInsurances.length && !loading) {
            setDisplayCount(prevCount => Math.min(prevCount + ROWS_PER_PAGE, filteredInsurances.length));
        }
    }, [displayCount, filteredInsurances.length, loading]);

    useEffect(() => { window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, [handleScroll]);
    useEffect(() => { setDisplayCount(ROWS_PER_PAGE); }, [searchText]);

    const getExportData = () => filteredInsurances.map(ins => ({
        [t('insurances.table.insuredName', 'Insured Name')]: ins.insuredName,
        [t('insurances.table.plateNumber', 'Plate Number')]: ins.plateNumber,
        [t('insurances.table.insuranceCompany', 'Company')]: ins.insuranceCompany,
        [t('insurances.table.insuranceType', 'Type')]: ins.insuranceType,
        [t('insurances.table.insuranceEndDate', 'End Date')]: ins.insuranceEndDate,
        [t('insurances.table.remainingDebt', 'Remaining Debt')]: ins.remainingDebt,
        [t('insurances.table.agent', 'Agent')]: ins.agent,
    }));

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t('insurances.exportSheetName', "Insurances"));
        XLSX.writeFile(workbook, t('insurances.exportExcelFileName', "insurances_report.xlsx"));
    };

    const handleExportCSV = () => {
        const data = getExportData();
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(','))
        ];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', t('insurances.exportCsvFileName', "insurances_report.csv"));
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const exportColumns = tableColumns
            .filter(col => col.key !== 'actions')
            .map(col => ({ header: col.label, dataKey: col.key }));

        doc.setFontSize(18);
        doc.text(t('insurances.report_title', 'Insurances Report'), 14, 22);

        autoTable(doc, {
            startY: 30,
            head: [exportColumns.map(c => c.header)],
            body: filteredInsurances.map(ins => exportColumns.map(col => ins[col.dataKey] || '-')),
            styles: { font: "Arial" },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        });

        doc.save(t('insurances.exportPdfFileName', "insurances_report.pdf"));
    };

    const handlePrint = () => {
        const printContent = document.getElementById('insurances-table').outerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print Report</title>');
        printWindow.document.write(`
            <style>
                body { font-family: ${language === 'ar' ? 'Cairo, sans-serif' : 'Arial, sans-serif'}; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .no-print { display: none; }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<h1>${t('insurances.report_title', 'Insurances Report')}</h1>`);
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key === columnKey) {
            return sortConfig.direction === 'ascending' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
        }
        return null;
    };
    return (
        <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={language === "ar" ? "rtl" : "ltr"}>
            <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 rounded-md justify-between items-center mb-4 shadow-sm">
                <div className={`flex gap-2 items-center text-sm md:text-base`}>
                    <NavLink className="hover:underline text-blue-600" to="/home">{t('breadcrumbs.home', 'Dashboard')}</NavLink>
                    <span>/</span>
                    <span className="text-gray-500 dark:text-gray-400">{t('breadcrumbs.allInsurances', 'All Insurances')}</span>
                </div>
            </div>

            <div className='flex justify-between items-center flex-wrap gap-4 mb-4'>
                <input
                    type="text"
                    placeholder={t('common.searchPlaceholder', 'Search by name, plate, company...')}
                    className="p-2 border dark:!border-none dark:bg-gray-700 rounded-lg w-full sm:w-[350px] shadow-sm"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outlined" size="small" onClick={handleExportCSV} disabled={filteredInsurances.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportCsv', 'CSV')}</Button>
                    <Button variant="outlined" size="small" onClick={handleExportExcel} disabled={filteredInsurances.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportExcel', 'Excel')}</Button>
                    <Button variant="outlined" size="small" onClick={handleExportPDF} disabled={filteredInsurances.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportPdf', 'PDF')}</Button>
                    <Button variant="outlined" size="small" onClick={handlePrint} disabled={filteredInsurances.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.print', 'Print')}</Button>
                </div>
            </div>

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {t('ahliaReport.show', 'Showing {{count}} of {{total}} results', { count: visibleRows.length, total: filteredInsurances.length })}
            </div>

            <div className="overflow-x-auto bg-[rgb(255,255,255)] dark:bg-navbarBack shadow-md rounded-lg">
                <table id="insurances-table" className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                            {tableColumns.map(col => (
                                <th key={col.key} scope="col" className="px-6 py-3 cursor-pointer" onClick={() => col.key !== 'actions' && requestSort(col.key)}>
                                    <div className="flex items-center gap-1">
                                        {col.label}
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
                            visibleRows.map((insurance) => (
                                <tr key={insurance.id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-[rgb(255,255,255)]">{insurance.insuredName}</td>
                                    <td className="px-6 py-4">{insurance.plateNumber}</td>
                                    <td className="px-6 py-4">{insurance.insuranceCompany}</td>
                                    <td className="px-6 py-4">{insurance.insuranceType}</td>
                                    <td className="px-6 py-4">{insurance.insuranceStartDate}</td>

                                    <td className="px-6 py-4">{insurance.insuranceEndDate}</td>
                                    <td className={`px-6 py-4 font-semibold ${insurance.remainingDebt > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {insurance.remainingDebt}
                                    </td>
                                    <td className="px-6 py-4">{insurance.agent}</td>
                                    <td className="px-6 py-4 text-right">
                                        <IconButton className="no-print" aria-label="Actions" size="small" onClick={(event) => handleMenuOpen(event, insurance.id)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                        <Menu
                                            anchorEl={anchorEls[insurance.id]}
                                            open={Boolean(anchorEls[insurance.id])}
                                            onClose={() => handleMenuClose(insurance.id)}
                                            PaperProps={{
                                                sx: {
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',

                                                },
                                            }}
                                        >
                                            <MenuItem onClick={() => navigate(`/profile/${insurance.insuredId}`)}>
                                                <User size={16} className="mr-2" /> {t('insuranceList.viewProfile', 'View Insured Profile')}
                                            </MenuItem>
                                        </Menu>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={tableColumns.length} className="text-center py-10 text-gray-500">{t('common.no_results')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AllInsurances;