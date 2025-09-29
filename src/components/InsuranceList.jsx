import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, NavLink, useNavigate, useParams, useLocation } from "react-router-dom";
import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCardIcon from '@mui/icons-material/AddCard';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';
import AddInsuranceMandatory from "./AddInsuranceMandatory";
import AddCheckModal from "./AddCheckModal";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from "lucide-react";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2'; // <-- 1. تم استيراد SweetAlert2
import { toLocaleDateStringEN } from '../utils/dateFormatter';

const ROWS_PER_PAGE_INSURANCE = 10;

function InsuranceList() {
    const { t, i18n: { language } } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const plateNumber = location.state?.plateNumber;
    const { insuredId, vehicleId } = useParams();
    const [customerData, setCustomerData] = useState({});
    const [allVehicleInsurances, setAllVehicleInsurances] = useState([]);
    const [selectedVehicleDetails, setSelectedVehicleDetails] = useState(null);
    const [anchorEls, setAnchorEls] = useState({});
    const [isAddCheckModalOpen, setIsAddCheckModalOpen] = useState(false);
    const [selectedInsuranceIdForCheck, setSelectedInsuranceIdForCheck] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [isOpenMandatory, setIsOpenMandatory] = useState(false);

    const [loadingCustomer, setLoadingCustomer] = useState(true);
    const [loadingVehicleDetails, setLoadingVehicleDetails] = useState(true);
    const [loadingInsurances, setLoadingInsurances] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE_INSURANCE);
    const [reportMenuAnchorEl, setReportMenuAnchorEl] = useState(null);
    const openReportMenu = Boolean(reportMenuAnchorEl);

    const [sortConfig, setSortConfig] = useState({
        key: 'startDate',
        direction: 'descending'
    });

    const fetchCustomer = useCallback(async () => {
        setLoadingCustomer(true);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const response = await axios.get(`http://localhost:3002/api/v1/insured/findInsured/${insuredId}`, {
                headers: { token }
            });
            setCustomerData(response.data.insured || {});
        } catch (error) {
            setCustomerData({});
        } finally {
            setLoadingCustomer(false);
        }
    }, [insuredId]);

    const fetchVehicleDetails = useCallback(async (currentInsuredId, currentVehicleId) => {
        setLoadingVehicleDetails(true);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const response = await axios.get(`http://localhost:3002/api/v1/insured/findInsured/${currentInsuredId}`, {
                headers: { token }
            });
            if (response.data.insured && response.data.insured.vehicles) {
                const currentVehicle = response.data.insured.vehicles.find(v => v._id === currentVehicleId);
                setSelectedVehicleDetails(currentVehicle || null);
            } else {
                setSelectedVehicleDetails(null);
            }
        } catch (error) {
            setSelectedVehicleDetails(null);
        } finally {
            setLoadingVehicleDetails(false);
        }
    }, []);

    const fetchVehicleInsurances = useCallback(async (currentInsuredId, currentVehicleId) => {
        setLoadingInsurances(true);
        setDisplayCount(ROWS_PER_PAGE_INSURANCE);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const response = await axios.get(`http://localhost:3002/api/v1/insured/get/${currentInsuredId}/${currentVehicleId}`, {
                headers: { token }
            });
            const data = response.data.insurances || [];
            const formattedInsurances = data.map((insurance) => ({
                id: insurance._id,
                insuranceType: insurance.insuranceType,
                insuranceCompany: insurance.insuranceCompany,
                startDate: new Date(insurance.insuranceStartDate),
                endDate: new Date(insurance.insuranceEndDate),
                insuranceAmount: insurance.insuranceAmount,
                paidAmount: insurance.paidAmount,
                remainingDebt: insurance.remainingDebt !== undefined ? insurance.remainingDebt : (insurance.insuranceAmount - (insurance.paidAmount || 0)),
                paymentMethod: insurance.paymentMethod
            }));
            setAllVehicleInsurances(formattedInsurances);
        } catch (error) {
            setAllVehicleInsurances([]);
        } finally {
            setLoadingInsurances(false);
        }
    }, []);

    const formatDateForDisplay = (date) => {
        if (!date) return t('common.notAvailable', "N/A");
        return toLocaleDateStringEN(date);
    };

    useEffect(() => {
        fetchCustomer();
        if (vehicleId) {
            fetchVehicleDetails(insuredId, vehicleId);
            fetchVehicleInsurances(insuredId, vehicleId);
        } else {
            setLoadingVehicleDetails(false);
            setLoadingInsurances(false);
            setSelectedVehicleDetails(null);
            setAllVehicleInsurances([]);
        }
    }, [insuredId, vehicleId, fetchCustomer, fetchVehicleDetails, fetchVehicleInsurances]);

    // --- 2. تم تحديث دالة الحذف لاستخدام SweetAlert2 ---
    const handleDeleteInsurance = (insuranceId) => {
        handleMenuClose(insuranceId); // Close menu first

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
                    await axios.delete(`http://localhost:3002/api/v1/insured/removeInsuranceFromVehicle/${insuredId}/${vehicleId}/${insuranceId}`, {
                        headers: { token }
                    });

                    Swal.fire({
                        title: t('customers.successDlete'),
                        icon: "success"
                    });

                    refreshInsuranceData();
                } catch (error) {
                    toast.error(t('insuranceList.alerts.deleteError', 'Error deleting insurance record.'));
                }
            }
        });
    };

    // Unchanged functions (tableColumns, requestSort, sortedData, etc.)
    // ... all other functions remain the same ...
    const tableColumns = useMemo(() => [
        { key: 'startDate', label: t('insuranceList.table.startDate', 'Start Date'), type: 'date' },
        { key: 'endDate', label: t('insuranceList.table.endDate', 'End Date'), type: 'date' },
        { key: 'insuranceAmount', label: t('insuranceList.table.insuranceAmount', 'Insurance Amount'), type: 'number' },
        { key: 'paidAmount', label: t('insuranceList.table.paidAmount', 'Paid Amount'), type: 'number' },
        { key: 'remainingDebt', label: t('insuranceList.table.remainingDebt', 'Remaining Debt'), type: 'number' },
        { key: 'insuranceType', label: t('insuranceList.table.insuranceType', 'Insurance Type') },
        { key: 'paymentMethod', label: t('insuranceList.table.paymentMethod', 'Payment Method') },
        { key: 'insuranceCompany', label: t('insuranceList.table.insuranceCompany', 'Insurance Company') },
        { key: 'actions', label: t('insuranceList.table.actions', 'Actions'), align: (language === 'ar' || language === 'he') ? 'left' : 'right' },
    ], [t, language]);
    const requestSort = (key) => { let direction = 'ascending'; if (sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; } setSortConfig({ key, direction }); };
    const sortedData = useMemo(() => { let sortableItems = [...allVehicleInsurances]; if (sortConfig.key !== null) { sortableItems.sort((a, b) => { if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return 1; if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return -1; let aValue = a[sortConfig.key]; let bValue = b[sortConfig.key]; const column = tableColumns.find(col => col.key === sortConfig.key); if (column?.type === 'number' || column?.type === 'date') { if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1; if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1; } else { aValue = String(aValue).toLowerCase(); bValue = String(bValue).toLowerCase(); if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1; if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1; } return 0; }); } return sortableItems; }, [allVehicleInsurances, sortConfig, tableColumns]);
    const filteredVehicleInsurances = useMemo(() => { if (!searchText) return sortedData; const lowerSearch = searchText.toLowerCase(); return sortedData.filter((insurance) => Object.values(insurance).some((val) => { if (val instanceof Date) { return formatDateForDisplay(val).toLowerCase().includes(lowerSearch); } return String(val).toLowerCase().includes(lowerSearch) })); }, [sortedData, searchText, language]);
    const visibleInsurances = useMemo(() => { return filteredVehicleInsurances.slice(0, displayCount); }, [filteredVehicleInsurances, displayCount]);
    const getSortIcon = (columnKey) => { if (sortConfig.key === columnKey) { return sortConfig.direction === 'ascending' ? <ArrowUpwardIcon fontSize="small" className="ml-1" /> : <ArrowDownwardIcon fontSize="small" className="ml-1" />; } return null; };
    const exportExcel = () => { const exportData = filteredVehicleInsurances.map(ins => ({ [t('insuranceList.table.startDate', 'Start Date')]: formatDateForDisplay(ins.startDate), [t('insuranceList.table.endDate', 'End Date')]: formatDateForDisplay(ins.endDate), [t('insuranceList.table.insuranceAmount', 'Insurance Amount')]: ins.insuranceAmount, [t('insuranceList.table.paidAmount', 'Paid Amount')]: ins.paidAmount, [t('insuranceList.table.remainingDebt', 'Remaining Debt')]: ins.remainingDebt, [t('insuranceList.table.insuranceType', 'Insurance Type')]: ins.insuranceType, [t('insuranceList.table.paymentMethod', 'Payment Method')]: ins.paymentMethod, [t('insuranceList.table.insuranceCompany', 'Insurance Company')]: ins.insuranceCompany, })); const ws = XLSX.utils.json_to_sheet(exportData); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, t('insuranceList.exportSheetName', 'VehicleInsurances')); XLSX.writeFile(wb, t('insuranceList.exportExcelFileName', 'vehicle_insurances.xlsx')); };
    const handleExportCSV = () => { const exportData = filteredVehicleInsurances.map(ins => ({ [t('insuranceList.table.startDate', 'Start Date')]: formatDateForDisplay(ins.startDate), [t('insuranceList.table.endDate', 'End Date')]: formatDateForDisplay(ins.endDate), [t('insuranceList.table.insuranceAmount', 'Insurance Amount')]: ins.insuranceAmount, [t('insuranceList.table.paidAmount', 'Paid Amount')]: ins.paidAmount, [t('insuranceList.table.remainingDebt', 'Remaining Debt')]: ins.remainingDebt, [t('insuranceList.table.insuranceType', 'Insurance Type')]: ins.insuranceType, [t('insuranceList.table.paymentMethod', 'Payment Method')]: ins.paymentMethod, [t('insuranceList.table.insuranceCompany', 'Insurance Company')]: ins.insuranceCompany, })); if (exportData.length === 0) return; const headers = Object.keys(exportData[0]); const csvRows = [headers.join(','), ...exportData.map(row => headers.map(header => { const cell = row[header] === null || row[header] === undefined ? '' : row[header]; return `"${String(cell).replace(/"/g, '""')}"`; }).join(','))]; const csvContent = csvRows.join('\n'); const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.setAttribute('href', url); link.setAttribute('download', t('insuranceList.exportCsvFileName', "vehicle_insurances.csv")); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    const handleExportPDF = () => { const doc = new jsPDF(); const exportColumns = tableColumns.filter(col => col.key !== 'actions').map(col => ({ header: col.label, dataKey: col.key })); doc.setFontSize(18); doc.text(t('insuranceList.pdfReportTitle', 'Vehicle Insurances Report'), 14, 22); const body = filteredVehicleInsurances.map(insurance => { let row = {}; exportColumns.forEach(col => { const val = insurance[col.dataKey]; row[col.dataKey] = val instanceof Date ? formatDateForDisplay(val) : (val || '-'); }); return row; }); autoTable(doc, { startY: 30, columns: exportColumns, body: body, styles: { fontSize: 8, font: "Arial" }, headStyles: { fillColor: [41, 128, 185], textColor: 255 }, }); doc.save(t('insuranceList.exportPdfFileName', "vehicle_insurances.pdf")); };
    const handlePrint = () => { const printWindow = window.open('', '_blank', 'height=600,width=800'); printWindow.document.write('<html><head><title>Vehicle Insurances Report</title>'); printWindow.document.write('<style>'); printWindow.document.write(` body { font-family: ${(language === 'ar' || language === 'he') ? 'Cairo, sans-serif' : 'Arial, sans-serif'}; direction: ${(language === 'ar' || language === 'he') ? 'rtl' : 'ltr'}; } table { border-collapse: collapse; width: 100%; margin-top: 20px; } th, td { border: 1px solid #ddd; padding: 8px; text-align: ${(language === 'ar' || language === 'he') ? 'right' : 'left'}; } th { background-color: #f2f2f2; } tr:nth-child(even) { background-color: #f9f9f9; } h1 { text-align: center; } @media print { .no-print { display: none; } } `); printWindow.document.write('</style></head><body>'); printWindow.document.write(`<h1>${t('insuranceList.printReportTitle', 'Vehicle Insurances Report')}</h1>`); printWindow.document.write('<table><thead><tr>'); tableColumns.forEach(col => { if (col.key !== 'actions') { printWindow.document.write(`<th>${col.label}</th>`); } }); printWindow.document.write('</tr></thead><tbody>'); filteredVehicleInsurances.forEach(insurance => { printWindow.document.write('<tr>'); tableColumns.forEach(col => { if (col.key !== 'actions') { const valueRaw = insurance[col.key]; const value = valueRaw instanceof Date ? formatDateForDisplay(valueRaw) : (valueRaw !== null && valueRaw !== undefined ? valueRaw : '-'); printWindow.document.write(`<td>${value}</td>`); } }); printWindow.document.write('</tr>'); }); printWindow.document.write('</tbody></table></body></html>'); printWindow.document.close(); printWindow.onload = function () { printWindow.focus(); printWindow.print(); printWindow.close(); }; };
    const handleMenuOpen = (event, rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: event.currentTarget }));
    const handleMenuClose = (rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: undefined }));
    const handleOpenAddCheckModal = (insuranceId) => { setSelectedInsuranceIdForCheck(insuranceId); setIsAddCheckModalOpen(true); handleMenuClose(insuranceId); };
    const handleCloseAddCheckModal = () => { setIsAddCheckModalOpen(false); setSelectedInsuranceIdForCheck(null); };
    const refreshInsuranceData = useCallback(() => { if (insuredId && vehicleId) { fetchVehicleInsurances(insuredId, vehicleId); } }, [insuredId, vehicleId, fetchVehicleInsurances]);
    const handleReportMenuOpen = (event) => setReportMenuAnchorEl(event.currentTarget);
    const handleReportMenuClose = () => setReportMenuAnchorEl(null);
    const handleScroll = useCallback(() => { const nearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200; if (nearBottom && displayCount < filteredVehicleInsurances.length && !isLoadingMore && !loadingInsurances) { setIsLoadingMore(true); setTimeout(() => { setDisplayCount(prevCount => Math.min(prevCount + ROWS_PER_PAGE_INSURANCE, filteredVehicleInsurances.length)); setIsLoadingMore(false); }, 300); } }, [displayCount, filteredVehicleInsurances.length, isLoadingMore, loadingInsurances]);
    useEffect(() => { window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, [handleScroll]);
    useEffect(() => { setDisplayCount(ROWS_PER_PAGE_INSURANCE); }, [searchText]);

    if (loadingCustomer || (vehicleId && (loadingVehicleDetails || loadingInsurances))) {
        return (<div className='flex justify-center h-[100vh] items-center dark:text-dark4 dark:bg-dark2'> <div className="sk-fading-circle "> <div className="sk-circle1 sk-circle"></div> <div className="sk-circle2 sk-circle"></div> <div className="sk-circle3 sk-circle"></div> <div className="sk-circle4 sk-circle"></div> <div className="sk-circle5 sk-circle"></div> <div className="sk-circle6 sk-circle"></div> <div className="sk-circle7 sk-circle"></div> <div className="sk-circle8 sk-circle"></div> <div className="sk-circle9 sk-circle"></div> <div className="sk-circle10 sk-circle"></div> <div className="sk-circle11 sk-circle"></div> <div className="sk-circle12 sk-circle"></div> </div> </div>);
    }

    return (
        <div className="navblayout py-1 dark:text-dark3" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
            {/* The rest of the JSX remains exactly the same... */}
            <div className="bg-[rgb(255,255,255)] flex p-[22px] rounded-md justify-between items-center dark:bg-navbarBack mt-[40px]">
                <div className="flex items-center gap-2 text-sm md:text-base">
                    <NavLink to="/home" className="hover:underline text-blue-600 dark:text-blue-400">{t('breadcrumbs.home', 'Home')}</NavLink>
                    <ChevronRight size={16} className="text-gray-500 dark:text-gray-400 rtl:rotate-180" />
                    <NavLink to={`/profile/${insuredId}`} className="hover:underline text-blue-600 dark:text-blue-400">{t('breadcrumbs.customerInfo', 'Customer Info')}</NavLink>
                    <ChevronRight size={16} className="text-gray-500 dark:text-gray-400 rtl:rotate-180" />
                    <span className="text-gray-500 dark:text-gray-400">{t('breadcrumbs.insuranceList', 'Insurance List')}</span>
                </div>
                <div>
                    <Button id="report-links-button" aria-controls={openReportMenu ? "report-links-menu" : undefined} aria-haspopup="true" aria-expanded={openReportMenu ? 'true' : undefined} onClick={handleReportMenuOpen} variant="outlined" size="small" sx={{ background: '#6C5FFC', color: '#fff' }}> {t('insuranceList.buttons.viewReports', 'View Reports')} </Button>
                    <Menu id="report-links-menu" anchorEl={reportMenuAnchorEl} open={openReportMenu} onClose={handleReportMenuClose} MenuListProps={{ 'aria-labelledby': 'report-links-button', className: 'dark:bg-gray-800 dark:text-gray-200' }} >
                        <MenuItem component={Link} to={`/AhlieReport/${plateNumber}`} onClick={handleReportMenuClose} className="dark:hover:bg-gray-700"> {t("sideBar.mainMenu.categore.report.categore.insuranceAhliaRep")} </MenuItem>
                        <MenuItem component={Link} to={`/MashreqReport/${plateNumber}`} onClick={handleReportMenuClose} className="dark:hover:bg-gray-700"> {t("sideBar.mainMenu.categore.report.categore.AlMashreqRep")} </MenuItem>
                        <MenuItem component={Link} to={`/TakafulRep/${plateNumber}`} onClick={handleReportMenuClose} className="dark:hover:bg-gray-700"> {t("sideBar.mainMenu.categore.report.categore.TakafulRep")} </MenuItem>
                        <MenuItem component={Link} to={`/PalestineRep/${plateNumber}`} onClick={handleReportMenuClose} className="dark:hover:bg-gray-700"> {t("sideBar.mainMenu.categore.report.categore.PalestineRep")} </MenuItem>
                        <MenuItem component={Link} to={`/TrustRep/${plateNumber}`} onClick={handleReportMenuClose} className="dark:hover:bg-gray-700"> {t("sideBar.mainMenu.categore.report.categore.TrustReport")} </MenuItem>
                        <MenuItem component={Link} to={`/HolyLand/${plateNumber}`} onClick={handleReportMenuClose} className="dark:hover:bg-gray-700"> {t("sideBar.mainMenu.categore.report.categore.HoliReport")} </MenuItem>
                    </Menu>
                </div>
            </div>

            <div className="block gap-3 py-4 md:flex">
                <div className="w-full md:w-72 xl:w-80 rounded-lg bg-[rgb(255,255,255)] dark:bg-navbarBack shadow-sm  md:mb-0">
                    <div className="p-6">
                        <h2 className="mb-4 text-xl md:text-2xl font-semibold text-gray-900 dark:text-dark3">{t('customerInfo.title', 'Customer Info')}</h2>
                        <div className="space-y-3">
                            {[{ labelKey: 'customerInfo.firstName', value: customerData.first_name, defaultLabel: "First Name" }, { labelKey: 'customerInfo.lastName', value: customerData.last_name, defaultLabel: "Last Name" }, { labelKey: 'customerInfo.mobile', value: customerData.phone_number, defaultLabel: "Mobile" }, { labelKey: 'customerInfo.identity', value: customerData.id_Number, defaultLabel: "Identity" }, { labelKey: 'customerInfo.birthDate', value: customerData.birth_date ? toLocaleDateStringEN(customerData.birth_date) : null, defaultLabel: "Birth Date" }, { labelKey: 'customerInfo.joinDate', value: customerData.joining_date ? toLocaleDateStringEN(customerData.joining_date) : null, defaultLabel: "Join Date" }, { labelKey: 'customerInfo.city', value: customerData.city, defaultLabel: "City" }, { labelKey: 'customerInfo.notes', value: customerData.notes, defaultLabel: "Notes" },].map(item => (<div key={item.labelKey}> <label className="text-xs text-gray-500 dark:text-gray-400">{t(item.labelKey, item.defaultLabel)}</label> <p className="text-sm text-gray-900 dark:text-[rgb(255,255,255)] break-words">{item.value || t('common.notAvailable', "N/A")}</p> </div>))}
                        </div>
                    </div>
                </div>

                <div className="md:max-w-[calc(100%-19rem)] xl:max-w-[calc(100%-21rem)] w-full">
                    {loadingVehicleDetails && vehicleId ? (
                        <div className="rounded-lg dark:bg-navbarBack bg-[rgb(255,255,255)] p-6 shadow-sm mb-4 flex justify-center items-center h-48">
                            <div className="sk-fading-circle"> <div className="sk-circle1 sk-circle"></div> <div className="sk-circle2 sk-circle"></div> <div className="sk-circle3 sk-circle"></div> <div className="sk-circle4 sk-circle"></div> <div className="sk-circle5 sk-circle"></div> <div className="sk-circle6 sk-circle"></div> <div className="sk-circle7 sk-circle"></div> <div className="sk-circle8 sk-circle"></div> <div className="sk-circle9 sk-circle"></div> <div className="sk-circle10 sk-circle"></div> <div className="sk-circle11 sk-circle"></div> <div className="sk-circle12 sk-circle"></div> </div>
                        </div>
                    ) : selectedVehicleDetails ? (
                        <div className="rounded-lg dark:bg-navbarBack bg-[rgb(255,255,255)] p-6 shadow-sm mb-4">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 dark:text-dark3">
                                {t('insuranceList.vehicleDetails.title', 'Vehicle Details')} ({selectedVehicleDetails.plateNumber || t('common.notAvailable', "N/A")})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {[{ labelKey: 'insuranceList.vehicleDetails.model', value: selectedVehicleDetails.model, defaultLabel: "Model" }, { labelKey: 'insuranceList.vehicleDetails.type', value: selectedVehicleDetails.type, defaultLabel: "Type" }, { labelKey: 'insuranceList.vehicleDetails.plateNumber', value: selectedVehicleDetails.plateNumber, defaultLabel: "Plate Number" }, { labelKey: 'insuranceList.vehicleDetails.modelYear', value: selectedVehicleDetails.modelNumber, defaultLabel: "Model/Chassis No." }, { labelKey: 'insuranceList.vehicleDetails.ownership', value: selectedVehicleDetails.ownership, defaultLabel: "Ownership" }, { labelKey: 'insuranceList.vehicleDetails.color', value: selectedVehicleDetails.color, defaultLabel: "Color" }, { labelKey: 'insuranceList.vehicleDetails.price', value: selectedVehicleDetails.price ? `₪${selectedVehicleDetails.price}` : null, defaultLabel: "Price" }, { labelKey: 'insuranceList.vehicleDetails.licenseExpiry', value: selectedVehicleDetails.licenseExpiry ? toLocaleDateStringEN(selectedVehicleDetails.licenseExpiry) : null, defaultLabel: "License Expiry" }, { labelKey: 'insuranceList.vehicleDetails.lastTest', value: selectedVehicleDetails.lastTest ? toLocaleDateStringEN(selectedVehicleDetails.lastTest) : null, defaultLabel: "Last Test Date" },].map(item => (<div key={item.labelKey}> <label className="text-xs text-gray-500 dark:text-gray-400">{t(item.labelKey, item.defaultLabel)}</label> <p className="text-sm font-medium text-gray-900 dark:text-[rgb(255,255,255)]">{item.value || t('common.notAvailable', "N/A")}</p> </div>))}
                            </div>
                        </div>
                    ) : vehicleId ? (
                        <div className="rounded-lg dark:bg-navbarBack bg-[rgb(255,255,255)] p-6 shadow-sm mb-4">
                            <p className="text-center text-gray-500 dark:text-gray-400">{t('insuranceList.vehicleDetails.notFound', 'Vehicle details not found.')}</p>
                        </div>
                    ) : null}

                    <div className="rounded-lg bg-[rgb(255,255,255)] p-6 shadow-sm dark:bg-navbarBack ">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-dark3">
                                {t('insuranceList.title', 'Vehicle Insurances')}
                            </h2>
                            <div className="flex gap-2 flex-wrap">
                                <Button variant="outlined" size="small" onClick={handleExportCSV} disabled={filteredVehicleInsurances.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}> {t('common.exportCsv', 'CSV')} </Button>
                                <Button variant="outlined" size="small" onClick={exportExcel} disabled={filteredVehicleInsurances.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}> {t('common.exportExcel', 'Excel')} </Button>
                                <Button variant="outlined" size="small" onClick={handleExportPDF} disabled={filteredVehicleInsurances.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}> {t('common.exportPdf', 'PDF')} </Button>
                                <Button variant="outlined" size="small" onClick={handlePrint} disabled={filteredVehicleInsurances.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}> {t('common.print', 'Print')} </Button>
                                <Button variant="contained" size="small" onClick={() => setIsOpenMandatory(true)} sx={{ background: '#6C5FFC', color: '#fff' }}> {t('insuranceList.buttons.addInsurance', 'Add Insurance')} </Button>
                            </div>
                        </div>
                        <input type="text" placeholder={t('insuranceList.placeholders.search', 'Search in insurances...')} className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-md w-full mb-4 shadow-sm focus:ring-2 focus:ring-blue-500" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                        <div className="overflow-x-auto hide-scrollbar ">
                            <table className="w-full text-sm text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                                    <tr>
                                        {tableColumns.map(col => (
                                            <th key={col.key} scope="col" className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : (col.align === 'left' ? 'text-left' : ((language === 'ar' || language === 'he') ? 'text-right' : 'text-left'))} ${col.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}`} onClick={() => col.key !== 'actions' && requestSort(col.key)}>
                                                <div className="flex items-center">
                                                    <span>{col.label}</span>
                                                    {col.key !== 'actions' && getSortIcon(col.key)}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingInsurances && visibleInsurances.length === 0 ? (
                                        <tr>
                                            <td colSpan={tableColumns.length} className="text-center py-10">
                                                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                                    {t('common.loading', 'Loading...')}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : visibleInsurances.length > 0 ? (
                                        visibleInsurances.map((insurance) => (
                                            <tr key={insurance.id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150">
                                                <td className="px-4 py-3 whitespace-nowrap">{formatDateForDisplay(insurance.startDate)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{formatDateForDisplay(insurance.endDate)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{insurance.insuranceAmount}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{insurance.paidAmount}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{insurance.remainingDebt}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{insurance.insuranceType}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{insurance.paymentMethod}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{insurance.insuranceCompany}</td>
                                                <td className={`px-4 py-3 ${(language === 'ar' || language === 'he') ? 'text-left' : 'text-right'}`}>
                                                    <IconButton aria-label={t('common.actions', "Actions")} size="small" onClick={(event) => handleMenuOpen(event, insurance.id)} className="dark:text-gray-400">
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                    <Menu
                                                        anchorEl={anchorEls[insurance.id]}
                                                        open={Boolean(anchorEls[insurance.id])}
                                                        onClose={() => handleMenuClose(insurance.id)}
                                                        anchorOrigin={{ vertical: 'bottom', horizontal: (language === 'ar' || language === 'he') ? 'left' : 'right' }}
                                                        transformOrigin={{ vertical: 'top', horizontal: (language === 'ar' || language === 'he') ? 'left' : 'right' }}
                                                        MenuListProps={{ className: 'dark:bg-gray-800 dark:text-gray-200' }}
                                                    >
                                                        <MenuItem onClick={() => handleDeleteInsurance(insurance.id)} className="dark:hover:bg-gray-700 text-red-600 dark:text-red-400">
                                                            <DeleteIcon fontSize="small" sx={{ mr: (language === 'ar' || language === 'he') ? 0 : 1, ml: (language === 'ar' || language === 'he') ? 1 : 0 }} />
                                                            {t('common.delete', 'Delete')}
                                                        </MenuItem>
                                                        {insurance.paymentMethod === 'check' && (
                                                            <>
                                                                <MenuItem onClick={() => navigate(`/check/${insuredId}/${vehicleId}/${insurance.id}`)} className="dark:hover:bg-gray-700">
                                                                    <ReceiptLongIcon fontSize="small" sx={{ mr: (language === 'ar' || language === 'he') ? 0 : 1, ml: (language === 'ar' || language === 'he') ? 1 : 0 }} />
                                                                    {t('insuranceList.menuActions.viewCheckDetails', 'Check Details')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleOpenAddCheckModal(insurance.id)} className="dark:hover:bg-gray-700">
                                                                    <AddCardIcon fontSize="small" sx={{ mr: (language === 'ar' || language === 'he') ? 0 : 1, ml: (language === 'ar' || language === 'he') ? 1 : 0 }} />
                                                                    {t('insuranceList.menuActions.addCheck', 'Add Check')}
                                                                </MenuItem>
                                                            </>
                                                        )}
                                                    </Menu>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={tableColumns.length} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                                {searchText ? t('common.noSearchResults', 'No results found for your search.') : t('insuranceList.table.noInsurancesFound', 'No insurance records found for this vehicle.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {isLoadingMore && (<div className="text-center py-6"> <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"> <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div> {t('common.loadingMore', 'Loading more...')} </div> </div>)}
                        {!isLoadingMore && !loadingInsurances && displayCount >= filteredVehicleInsurances.length && filteredVehicleInsurances.length > 0 && (<div className="text-center py-6 text-gray-500 dark:text-gray-400"> {t('common.endOfResults', "You've reached the end of the results")} </div>)}
                    </div>
                </div>
            </div>

            <AddInsuranceMandatory isOpen={isOpenMandatory} onClose={() => setIsOpenMandatory(false)} insuredId={insuredId} vehicleId={vehicleId} onInsuranceAdded={refreshInsuranceData} />
            {selectedInsuranceIdForCheck && (<AddCheckModal isOpen={isAddCheckModalOpen} onClose={handleCloseAddCheckModal} insuredId={insuredId} vehicleId={vehicleId} insuranceId={selectedInsuranceIdForCheck} onCheckAdded={refreshInsuranceData} />)}
        </div>
    );
}

export default InsuranceList;