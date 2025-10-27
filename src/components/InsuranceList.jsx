import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, NavLink, useNavigate, useParams, useLocation } from "react-router-dom";
import { IconButton, Menu, MenuItem } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCardIcon from '@mui/icons-material/AddCard';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {  Car, Calendar, DollarSign, FileText, AlertTriangle, Plus } from 'lucide-react';
import axios from 'axios';
import AddInsuranceWithPayments from "./AddInsuranceWithPayments";
import AddCheckModal from "./AddCheckModal";
import AddAccidentModal from "./AddAccidentModal";
import DataTable from "./shared/DataTable";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from "lucide-react";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
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
    const [isAddAccidentModalOpen, setIsAddAccidentModalOpen] = useState(false);

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
                startDate: insurance.insuranceStartDate,
                endDate: insurance.insuranceEndDate,
                insuranceAmount: insurance.insuranceAmount,
                paidAmount: insurance.paidAmount,
                remainingDebt: insurance.remainingDebt,
                paymentMethod: insurance.paymentMethod || t('common.notAvailable', 'N/A'),
            }));
            setAllVehicleInsurances(formattedInsurances);
        } catch (error) {
            setAllVehicleInsurances([]);
        } finally {
            setLoadingInsurances(false);
        }
    }, [t]);

    useEffect(() => {
        if (insuredId && vehicleId) {
            fetchCustomer();
            fetchVehicleDetails(insuredId, vehicleId);
            fetchVehicleInsurances(insuredId, vehicleId);
        }
    }, [insuredId, vehicleId, fetchCustomer, fetchVehicleDetails, fetchVehicleInsurances]);

    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return t('common.notAvailable', 'N/A');
        return toLocaleDateStringEN(dateStr);
    };

    const filteredVehicleInsurances = useMemo(() => {
        return allVehicleInsurances.filter(insurance =>
            Object.values(insurance).some(value =>
                value?.toString().toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [allVehicleInsurances, searchText]);

    const sortedVehicleInsurances = useMemo(() => {
        let sortableItems = [...filteredVehicleInsurances];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue == null || bValue == null) return 0;
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredVehicleInsurances, sortConfig]);

    const visibleInsurances = useMemo(() => sortedVehicleInsurances.slice(0, displayCount), [sortedVehicleInsurances, displayCount]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
    };

    const tableColumns = useMemo(() => [
        {
            header: t('insuranceList.table.startDate', 'Start Date'),
            accessor: 'startDate',
            render: (value, row) => <span className="font-medium text-gray-900 dark:text-gray-200">{formatDateForDisplay(row.startDate)}</span>
        },
        {
            header: t('insuranceList.table.endDate', 'End Date'),
            accessor: 'endDate',
            render: (value, row) => <span className="text-gray-700 dark:text-gray-300">{formatDateForDisplay(row.endDate)}</span>
        },
        {
            header: t('insuranceList.table.insuranceAmount', 'Total Amount'),
            accessor: 'insuranceAmount',
            render: (value, row) => <span className="font-semibold text-gray-900 dark:text-white">{row.insuranceAmount?.toLocaleString()}</span>
        },
        {
            header: t('insuranceList.table.paidAmount', 'Paid Amount'),
            accessor: 'paidAmount',
            render: (value, row) => <span className="font-semibold text-green-600 dark:text-green-400">{row.paidAmount?.toLocaleString()}</span>
        },
        {
            header: t('insuranceList.table.remainingDebt', 'Remaining'),
            accessor: 'remainingDebt',
            render: (value, row) => <span className="font-semibold text-orange-600 dark:text-orange-400">{row.remainingDebt?.toLocaleString()}</span>
        },
        {
            header: t('insuranceList.table.insuranceType', 'Type'),
            accessor: 'insuranceType',
            render: (value, row) => <span className="text-gray-700 dark:text-gray-300">{row.insuranceType}</span>
        },
        {
            header: t('insuranceList.table.paymentMethod', 'Payment Method'),
            accessor: 'paymentMethod',
            render: (value, row) => (
                <span className="px-2 py-1 text-xs rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                    {row.paymentMethod}
                </span>
            )
        },
        {
            header: t('insuranceList.table.insuranceCompany', 'Company'),
            accessor: 'insuranceCompany',
            render: (value, row) => <span className="text-gray-700 dark:text-gray-300">{row.insuranceCompany}</span>
        },
        {
            header: t('common.actions', 'Actions'),
            accessor: 'actions',
            render: (value, row) => (
                <div className={`flex items-center ${(language === 'ar' || language === 'he') ? 'justify-start' : 'justify-end'}`}>
                    <IconButton
                        aria-label={t('common.actions', "Actions")}
                        size="small"
                        onClick={(event) => handleMenuOpen(event, row.id)}
                        className="dark:text-gray-400"
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEls[row.id]}
                        open={Boolean(anchorEls[row.id])}
                        onClose={() => handleMenuClose(row.id)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: (language === 'ar' || language === 'he') ? 'left' : 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: (language === 'ar' || language === 'he') ? 'left' : 'right' }}
                        MenuListProps={{ className: 'dark:bg-gray-800 dark:text-gray-200' }}
                    >
                        <MenuItem onClick={() => handleDeleteInsurance(row.id)} className="dark:hover:bg-gray-700 text-red-600 dark:text-red-400">
                            <DeleteIcon fontSize="small" sx={{ mr: (language === 'ar' || language === 'he') ? 0 : 1, ml: (language === 'ar' || language === 'he') ? 1 : 0 }} />
                            {t('common.delete', 'Delete')}
                        </MenuItem>
                        {row.paymentMethod === 'check' && (
                            <>
                                <MenuItem onClick={() => navigate(`/check/${insuredId}/${vehicleId}/${row.id}`)} className="dark:hover:bg-gray-700">
                                    <ReceiptLongIcon fontSize="small" sx={{ mr: (language === 'ar' || language === 'he') ? 0 : 1, ml: (language === 'ar' || language === 'he') ? 1 : 0 }} />
                                    {t('insuranceList.menuActions.viewCheckDetails', 'Check Details')}
                                </MenuItem>
                                <MenuItem onClick={() => handleOpenAddCheckModal(row.id)} className="dark:hover:bg-gray-700">
                                    <AddCardIcon fontSize="small" sx={{ mr: (language === 'ar' || language === 'he') ? 0 : 1, ml: (language === 'ar' || language === 'he') ? 1 : 0 }} />
                                    {t('insuranceList.menuActions.addCheck', 'Add Check')}
                                </MenuItem>
                            </>
                        )}
                    </Menu>
                </div>
            )
        }
    ], [t, language, anchorEls, insuredId, vehicleId, navigate]);

    const handleDeleteInsurance = async (insuranceId) => {
        const result = await Swal.fire({
            title: t('insuranceList.deleteConfirmation.title', 'Are you sure?'),
            text: t('insuranceList.deleteConfirmation.text', 'This insurance record will be permanently deleted.'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('common.delete', 'Delete'),
            cancelButtonText: t('common.cancel', 'Cancel')
        });
        if (!result.isConfirmed) return;
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            await axios.delete(`http://localhost:3002/api/v1/insured/cancel/${insuredId}/${vehicleId}/${insuranceId}`, {
                headers: { token }
            });
            await fetchVehicleInsurances(insuredId, vehicleId);
            Swal.fire(t('insuranceList.deleteSuccess.title', 'Deleted!'), t('insuranceList.deleteSuccess.text', 'Insurance record has been deleted.'), 'success');
        } catch (error) {
            Swal.fire(t('common.error', 'Error'), t('insuranceList.deleteError', 'Could not delete insurance record.'), 'error');
        }
    };

    const handleExportCSV = () => {
        const headers = tableColumns.filter(col => col.key !== 'actions').map(col => col.label);
        const rows = filteredVehicleInsurances.map(ins => [
            formatDateForDisplay(ins.startDate),
            formatDateForDisplay(ins.endDate),
            ins.insuranceAmount,
            ins.paidAmount,
            ins.remainingDebt,
            ins.insuranceType,
            ins.paymentMethod,
            ins.insuranceCompany
        ]);
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `vehicle_insurances_${plateNumber}.csv`;
        link.click();
    };

    const exportExcel = () => {
        const dataForExport = filteredVehicleInsurances.map(ins => ({
            [t('insuranceList.table.startDate')]: formatDateForDisplay(ins.startDate),
            [t('insuranceList.table.endDate')]: formatDateForDisplay(ins.endDate),
            [t('insuranceList.table.insuranceAmount')]: ins.insuranceAmount,
            [t('insuranceList.table.paidAmount')]: ins.paidAmount,
            [t('insuranceList.table.remainingDebt')]: ins.remainingDebt,
            [t('insuranceList.table.insuranceType')]: ins.insuranceType,
            [t('insuranceList.table.paymentMethod')]: ins.paymentMethod,
            [t('insuranceList.table.insuranceCompany')]: ins.insuranceCompany
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Insurances');
        XLSX.writeFile(workbook, `vehicle_insurances_${plateNumber}.xlsx`);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text(t('insuranceList.title', 'Vehicle Insurances'), 14, 15);
        autoTable(doc, {
            startY: 20,
            head: [tableColumns.filter(col => col.key !== 'actions').map(col => col.label)],
            body: filteredVehicleInsurances.map(ins => [
                formatDateForDisplay(ins.startDate),
                formatDateForDisplay(ins.endDate),
                ins.insuranceAmount,
                ins.paidAmount,
                ins.remainingDebt,
                ins.insuranceType,
                ins.paymentMethod,
                ins.insuranceCompany
            ])
        });
        doc.save(`vehicle_insurances_${plateNumber}.pdf`);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleMenuOpen = (event, id) => setAnchorEls(prev => ({ ...prev, [id]: event.currentTarget }));
    const handleMenuClose = (id) => setAnchorEls(prev => ({ ...prev, [id]: null }));
    const handleOpenAddCheckModal = (insuranceId) => {
        setSelectedInsuranceIdForCheck(insuranceId);
        setIsAddCheckModalOpen(true);
        setAnchorEls({});
    };
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
        <div className="min-h-screen bg-gray-50 dark:bg-dark2 py-6 px-4 sm:px-6 lg:px-8" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
            {/* Breadcrumb */}
            <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-4 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <NavLink to="/home" className="hover:underline text-blue-600 dark:text-blue-400 font-medium">{t('breadcrumbs.home', 'Home')}</NavLink>
                        <ChevronRight size={16} className="text-gray-400 rtl:rotate-180" />
                        <NavLink to={`/profile/${insuredId}`} className="hover:underline text-blue-600 dark:text-blue-400 font-medium">{t('breadcrumbs.customerInfo', 'Customer Info')}</NavLink>
                        <ChevronRight size={16} className="text-gray-400 rtl:rotate-180" />
                        <span className="text-gray-600 dark:text-gray-300">{t('breadcrumbs.insuranceList', 'Vehicle Profile')}</span>
                    </div>
                    <button
                        id="report-links-button"
                        aria-controls={openReportMenu ? "report-links-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={openReportMenu ? 'true' : undefined}
                        onClick={handleReportMenuOpen}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-sm text-sm"
                    >
                        {t('insuranceList.buttons.viewReports', 'View Reports')}
                    </button>
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Customer Info Sidebar */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-6 sticky top-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                {customerData.first_name?.charAt(0)}{customerData.last_name?.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {customerData.first_name} {customerData.last_name}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('customerInfo.title', 'Customer')}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { icon: '📱', labelKey: 'customerInfo.mobile', value: customerData.phone_number },
                                { icon: '🆔', labelKey: 'customerInfo.identity', value: customerData.id_Number },
                                { icon: '🎂', labelKey: 'customerInfo.birthDate', value: customerData.birth_date ? toLocaleDateStringEN(customerData.birth_date) : null },
                                { icon: '📅', labelKey: 'customerInfo.joinDate', value: customerData.joining_date ? toLocaleDateStringEN(customerData.joining_date) : null },
                                { icon: '🏙️', labelKey: 'customerInfo.city', value: customerData.city },
                            ].map(item => (
                                <div key={item.labelKey} className="flex items-start gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t(item.labelKey)}</label>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">{item.value || t('common.notAvailable', "N/A")}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-9 space-y-6">
                    {/* Vehicle Details Card */}
                    {selectedVehicleDetails && (
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg p-6 border border-blue-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                                        <Car className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {selectedVehicleDetails.model || t('common.notAvailable', 'N/A')}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            {t('insuranceList.vehicleDetails.plateNumber', 'Plate')}: <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedVehicleDetails.plateNumber}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAddAccidentModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors shadow-sm"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    {t('vehicleProfile.addAccident', 'Add Accident')}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[
                                    { icon: '🚗', label: 'insuranceList.vehicleDetails.type', value: selectedVehicleDetails.type },
                                    { icon: '🔢', label: 'insuranceList.vehicleDetails.modelYear', value: selectedVehicleDetails.modelNumber },
                                    { icon: '👤', label: 'insuranceList.vehicleDetails.ownership', value: selectedVehicleDetails.ownership },
                                    { icon: '🎨', label: 'insuranceList.vehicleDetails.color', value: selectedVehicleDetails.color },
                                    { icon: '💰', label: 'insuranceList.vehicleDetails.price', value: selectedVehicleDetails.price ? `₪${selectedVehicleDetails.price.toLocaleString()}` : null },
                                    { icon: '📅', label: 'insuranceList.vehicleDetails.licenseExpiry', value: selectedVehicleDetails.licenseExpiry ? toLocaleDateStringEN(selectedVehicleDetails.licenseExpiry) : null },
                                    { icon: '🔧', label: 'insuranceList.vehicleDetails.lastTest', value: selectedVehicleDetails.lastTest ? toLocaleDateStringEN(selectedVehicleDetails.lastTest) : null },
                                ].map(item => (
                                    <div key={item.label} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">{item.icon}</span>
                                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{t(item.label)}</label>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.value || t('common.notAvailable', 'N/A')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Insurance List */}
                    <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                {t('insuranceList.title', 'Vehicle Insurances')}
                            </h2>
                            <button
                                onClick={() => setIsOpenMandatory(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                {t('insuranceList.buttons.addInsurance', 'Add Insurance')}
                            </button>
                        </div>

                        <DataTable
                            data={allVehicleInsurances}
                            columns={tableColumns}
                            loading={loadingInsurances}
                            enableSearch={true}
                            enableExport={true}
                            enableCSV={true}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddInsuranceWithPayments isOpen={isOpenMandatory} onClose={() => setIsOpenMandatory(false)} insuredId={insuredId} vehicleId={vehicleId} onInsuranceAdded={refreshInsuranceData} />
            {selectedInsuranceIdForCheck && (<AddCheckModal isOpen={isAddCheckModalOpen} onClose={handleCloseAddCheckModal} insuredId={insuredId} vehicleId={vehicleId} insuranceId={selectedInsuranceIdForCheck} onCheckAdded={refreshInsuranceData} />)}
            <AddAccidentModal
                isOpen={isAddAccidentModalOpen}
                onClose={() => setIsAddAccidentModalOpen(false)}
                onSuccess={() => {
                    setIsAddAccidentModalOpen(false);
                    toast.success(t('accidents.addSuccess', 'Accident added successfully'));
                }}
                preSelectedInsuredId={insuredId}
                preSelectedVehicleId={vehicleId}
            />
        </div>
    );
}

export default InsuranceList;
