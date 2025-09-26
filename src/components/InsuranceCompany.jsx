import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import EditInsuranceCompany from './EditInsuranceCompany';
import AddInsuranceCompany from './AddInsuranceCompany';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import { toast } from 'react-toastify'; 

const ROWS_PER_PAGE_COMPANY = 10;

function InsuranceCompany() {
    const { t, i18n: { language } } = useTranslation();
    const [allCompanies, setAllCompanies] = useState([]);
    const [anchorEls, setAnchorEls] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedCompanyData, setSelectedCompanyData] = useState(null);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE_COMPANY);

    const [sortConfig, setSortConfig] = useState({
        key: 'name',
        direction: 'ascending'
    });

    const fetchCompanies = useCallback(async () => {
        setLoadingCompanies(true);
        setDisplayCount(ROWS_PER_PAGE_COMPANY);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get(`http://localhost:3002/api/v1/company/all`, {
                headers: { token }
            });
            const formattedData = res.data.map(item => ({ id: item._id, name: item.name, contact: item.contact, address: item.address, insuranceType: item.insuranceType, rates: item.rates, }));
            setAllCompanies(formattedData);
        } catch (err) {
            console.error('Error fetching insurance companies:', err);
            setAllCompanies([]);
            toast.error(t('insuranceCompany.fetchError', 'Failed to fetch companies.'));
        } finally {
            setLoadingCompanies(false);
        }
    }, [t]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleDelete = (companyId) => {
        const companyToDelete = allCompanies.find(c => c.id === companyId);
        if (!companyToDelete) return;

        handleMenuClose(companyId);

        Swal.fire({
            title: t('customers.delete_confirm', `هل أنت متأكد من حذف `),
            text: t('customers.delete_confirm_text', "لا يمكن التراجع عن هذا الإجراء!"),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6e7881',
            confirmButtonText: t('customers.yes_delete'),
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
                    await axios.delete(`http://localhost:3002/api/v1/company/delete/${companyId}`, { headers: { token } });

                    Swal.fire({
                        title: t('customers.successDlete'),
                        icon: "success"
                    });

                    fetchCompanies();

                } catch (err) {
                    console.error("Error deleting insurance company:", err);
                    const errorMessage = err.response?.data?.message || t('insuranceCompany.deleteError', 'Error deleting company.');
                    toast.error(errorMessage);
                }
            }
        });
    };

    const tableHeaders = useMemo(() => [{ key: 'name', label: t('insuranceCompany.table.name', 'Company Name') }, { key: 'contact', label: t('insuranceCompany.table.contact', 'Contact Info') }, { key: 'address', label: t('insuranceCompany.table.address', 'Address') }, { key: 'insuranceType', label: t('insuranceCompany.table.insuranceType', 'Insurance Type') }, { key: 'actions', label: t('insuranceCompany.table.actions', 'Actions'), align: language === 'ar' ? 'left' : 'right' },], [t, language]);
    const requestSort = (key) => { let direction = 'ascending'; if (sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; } setSortConfig({ key, direction }); };
    const sortedData = useMemo(() => { let sortableItems = [...allCompanies]; if (sortConfig.key !== null) { sortableItems.sort((a, b) => { if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return 1; if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return -1; let aValue = String(a[sortConfig.key]).toLowerCase(); let bValue = String(b[sortConfig.key]).toLowerCase(); if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1; if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1; return 0; }); } return sortableItems; }, [allCompanies, sortConfig]);
    const filteredCompanies = useMemo(() => { if (!searchText) return sortedData; const lowerSearch = searchText.toLowerCase(); return sortedData.filter((company) => Object.values(company).some((val) => String(val).toLowerCase().includes(lowerSearch))); }, [sortedData, searchText]);
    const visibleCompanies = useMemo(() => { return filteredCompanies.slice(0, displayCount); }, [filteredCompanies, displayCount]);
    const getSortIcon = (columnKey) => { if (sortConfig.key === columnKey) { return sortConfig.direction === 'ascending' ? <ArrowUpwardIcon fontSize="small" className="ml-1" /> : <ArrowDownwardIcon fontSize="small" className="ml-1" />; } return null; };
    const handleExportExcel = () => { const exportData = filteredCompanies.map(c => ({ [t('insuranceCompany.table.name', 'Company Name')]: c.name, [t('insuranceCompany.table.contact', 'Contact Info')]: c.contact, [t('insuranceCompany.table.address', 'Address')]: c.address, [t('insuranceCompany.table.insuranceType', 'Insurance Type')]: c.insuranceType, })); const worksheet = XLSX.utils.json_to_sheet(exportData); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, t('insuranceCompany.exportSheetName', "Insurance Companies")); XLSX.writeFile(workbook, t('insuranceCompany.exportExcelFileName', "insurance_companies.xlsx")); };
    const handleExportCSV = () => { const exportData = filteredCompanies.map(c => ({ [t('insuranceCompany.table.name', 'Company Name')]: c.name, [t('insuranceCompany.table.contact', 'Contact Info')]: c.contact, [t('insuranceCompany.table.address', 'Address')]: c.address, [t('insuranceCompany.table.insuranceType', 'Insurance Type')]: c.insuranceType, })); if (exportData.length === 0) return; const headers = Object.keys(exportData[0]); const csvRows = [headers.join(','), ...exportData.map(row => headers.map(header => { const cell = row[header] === null || row[header] === undefined ? '' : row[header]; return `"${String(cell).replace(/"/g, '""')}"`; }).join(','))]; const csvContent = csvRows.join('\n'); const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.setAttribute('href', url); link.setAttribute('download', t('insuranceCompany.exportCsvFileName', "insurance_companies.csv")); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    const handleExportPDF = () => { const doc = new jsPDF(); const exportColumns = tableHeaders.filter(col => col.key !== 'actions').map(col => ({ header: col.label, dataKey: col.key })); doc.setFontSize(18); doc.text(t('insuranceCompany.exportPdfTitle', "Insurance Companies Report"), 14, 22); const body = filteredCompanies.map(company => { let row = {}; exportColumns.forEach(col => { row[col.dataKey] = company[col.dataKey] || '-'; }); return row; }); doc.autoTable({ startY: 30, columns: exportColumns, body: body, styles: { fontSize: 8, font: "Arial" }, headStyles: { fillColor: [41, 128, 185], textColor: 255 }, }); doc.save(t('insuranceCompany.exportPdfFileName', "insurance_companies.pdf")); };
    const handlePrint = () => { const printWindow = window.open('', '_blank', 'height=600,width=800'); printWindow.document.write('<html><head><title>Insurance Companies Report</title>'); printWindow.document.write('<style>'); printWindow.document.write(` body { font-family: Arial, sans-serif; direction: ${language === 'ar' ? 'rtl' : 'ltr'}; } table { border-collapse: collapse; width: 100%; margin-top: 20px; } th, td { border: 1px solid #ddd; padding: 8px; text-align: ${language === 'ar' ? 'right' : 'left'}; } th { background-color: #f2f2f2; } h1 { text-align: center; } @media print { .no-print { display: none; } } `); printWindow.document.write('</style></head><body>'); printWindow.document.write(`<h1>${t('insuranceCompany.printReportTitle', 'Insurance Companies Report')}</h1>`); printWindow.document.write('<table><thead><tr>'); tableHeaders.forEach(col => { if (col.key !== 'actions') { printWindow.document.write(`<th>${col.label}</th>`); } }); printWindow.document.write('</tr></thead><tbody>'); filteredCompanies.forEach(company => { printWindow.document.write('<tr>'); tableHeaders.forEach(col => { if (col.key !== 'actions') { const value = company[col.key] !== null && company[col.key] !== undefined ? company[col.key] : '-'; printWindow.document.write(`<td>${value}</td>`); } }); printWindow.document.write('</tr>'); }); printWindow.document.write('</tbody></table></body></html>'); printWindow.document.close(); printWindow.onload = function () { printWindow.focus(); printWindow.print(); printWindow.close(); }; };
    const handleMenuOpen = (event, rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: event.currentTarget }));
    const handleMenuClose = (rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: undefined }));
    const handleEdit = (company) => { setSelectedCompanyData(company); setShowEditForm(true); handleMenuClose(company.id); };
    const handleScroll = useCallback(() => { const nearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200; if (nearBottom && displayCount < filteredCompanies.length && !isLoadingMore && !loadingCompanies) { setIsLoadingMore(true); setTimeout(() => { setDisplayCount(prevCount => Math.min(prevCount + ROWS_PER_PAGE_COMPANY, filteredCompanies.length)); setIsLoadingMore(false); }, 300); } }, [displayCount, filteredCompanies.length, isLoadingMore, loadingCompanies]);
    useEffect(() => { window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, [handleScroll]);
    useEffect(() => { setDisplayCount(ROWS_PER_PAGE_COMPANY); }, [searchText]);

    return (
        <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={language === "ar" ? "rtl" : "ltr"}>
            <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
                <div className="flex gap-2 md:gap-[14px] items-center text-sm md:text-base">
                    <NavLink to="/home" className="hover:underline text-blue-600 dark:text-blue-400">{t('breadcrumbs.home', 'Home')}</NavLink>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-500 dark:text-gray-400">{t('breadcrumbs.insuranceCompanies', 'Insurance Companies')}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="contained" size="small" onClick={() => setShowAddForm(true)} sx={{ background: '#6C5FFC', color: '#fff' }}> {t('insuranceCompany.addButton', 'Add Company')} </Button>
                </div>
            </div>

            <div className='flex rounded-md justify-between items-start flex-wrap mb-4'>
                <div className="mb-4 md:mb-0">
                    <input type="text" placeholder={t('insuranceCompany.searchPlaceholder', 'Search companies...')} className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-md w-full md:w-[300px] shadow-sm focus:ring-2 focus:ring-blue-500" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outlined" size="small" onClick={handleExportCSV} disabled={filteredCompanies.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}> {t('common.exportCsv', 'CSV')} </Button>
                    <Button variant="outlined" size="small" onClick={handleExportExcel} disabled={filteredCompanies.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}> {t('common.exportExcel', 'Excel')} </Button>
                    <Button variant="outlined" size="small" onClick={handleExportPDF} disabled={filteredCompanies.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}> {t('common.exportPdf', 'PDF')} </Button>
                    <Button variant="outlined" size="small" onClick={handlePrint} disabled={filteredCompanies.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}> {t('common.print', 'Print')} </Button>
                </div>
            </div>

            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-400">
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
                        {loadingCompanies && visibleCompanies.length === 0 ? (
                            <tr><td colSpan={tableHeaders.length} className="text-center py-10"><div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>{t('common.loading', 'Loading...')}</div></td></tr>
                        ) : visibleCompanies.length > 0 ? (
                            visibleCompanies.map((company) => (
                                <tr key={company.id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{company.name}</td>
                                    <td className="px-6 py-4">{company.contact}</td>
                                    <td className="px-6 py-4">{company.address}</td>
                                    <td className="px-6 py-4">{company.insuranceType}</td>
                                    <td className={`px-6 py-4 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                                        <IconButton aria-label="actions" size="small" onClick={(event) => handleMenuOpen(event, company.id)} className="dark:text-gray-400">
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                        <Menu anchorEl={anchorEls[company.id]} open={Boolean(anchorEls[company.id])} onClose={() => handleMenuClose(company.id)} anchorOrigin={{ vertical: 'bottom', horizontal: language === 'ar' ? 'left' : 'right' }} transformOrigin={{ vertical: 'top', horizontal: language === 'ar' ? 'left' : 'right' }} MenuListProps={{ className: 'dark:bg-gray-800 dark:text-gray-200' }} >
                                            <MenuItem onClick={() => handleEdit(company)} className="dark:hover:bg-gray-700"> <EditIcon fontSize="small" className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('common.edit', 'Edit')} </MenuItem>
                                            <MenuItem onClick={() => handleDelete(company.id)} className="dark:hover:bg-gray-700 text-red-600 dark:text-red-400"> <DeleteIcon fontSize="small" className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('common.delete', 'Delete')} </MenuItem>
                                        </Menu>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={tableHeaders.length} className="text-center py-10 text-gray-500 dark:text-gray-400">{searchText ? t('common.noSearchResults', 'No results found for your search.') : t('insuranceCompany.noCompanies', 'No insurance companies found.')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isLoadingMore && (
                <div className="text-center py-8"><div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>{t('common.loadingMore', 'Loading more...')}</div></div>
            )}
            {!isLoadingMore && !loadingCompanies && displayCount >= filteredCompanies.length && filteredCompanies.length > ROWS_PER_PAGE_COMPANY && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('common.endOfResults', "You've reached the end of the results")}</div>
            )}

            {showEditForm && selectedCompanyData && (
                <EditInsuranceCompany isOpen={showEditForm} onClose={() => { setShowEditForm(false); setSelectedCompanyData(null); }} companyData={selectedCompanyData} onEditSuccess={() => { setShowEditForm(false); setSelectedCompanyData(null); fetchCompanies(); }} />
            )}

            <AddInsuranceCompany isOpen={showAddForm} onClose={() => { setShowAddForm(false); fetchCompanies(); }} />
        </div>
    );
}

export default InsuranceCompany;