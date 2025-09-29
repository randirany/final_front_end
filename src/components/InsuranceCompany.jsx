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

    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    const fetchCompanies = useCallback(async () => {
        setLoadingCompanies(true);
        setDisplayCount(ROWS_PER_PAGE_COMPANY);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get(`http://localhost:3002/api/v1/company/all`, { headers: { token } });

            
            const formattedData = res.data.map(item => ({
                id: item._id,
                name: item.name,
               insuranceTypes: item.insuranceTypes?.map(it => `${it.type} (₪${it.price})`).join(', ') || '-',
roadServices: item.roadServices?.map(rs => `${rs.name} (₪${rs.price})`).join(', ') || '-'
            }));

            setAllCompanies(formattedData);
        } catch (err) {
            setAllCompanies([]);
            toast.error(t('insuranceCompany.fetchError', 'Failed to fetch companies.'));
        } finally {
            setLoadingCompanies(false);
        }
    }, [t]);

    useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

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
                    Swal.fire({ title: t('customers.successDlete'), icon: "success" });
                    fetchCompanies();
                } catch (err) {
                    const errorMessage = err.response?.data?.message || t('insuranceCompany.deleteError', 'Error deleting company.');
                    toast.error(errorMessage);
                }
            }
        });
    };

    const tableHeaders = useMemo(() => [
        { key: 'name', label: t('insuranceCompany.table.name', 'Company Name') },
        { key: 'insuranceTypes', label: t('insuranceCompany.table.insuranceTypes', 'Insurance Types') },
        { key: 'roadServices', label: t('insuranceCompany.table.roadServices', 'Road Services') },
        { key: 'actions', label: t('insuranceCompany.table.actions', 'Actions'), align: (language === 'ar' || language === 'he') ? 'left' : 'right' },
    ], [t, language]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        let sortableItems = [...allCompanies];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = String(a[sortConfig.key] || '').toLowerCase();
                const bValue = String(b[sortConfig.key] || '').toLowerCase();
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [allCompanies, sortConfig]);

    const filteredCompanies = useMemo(() => {
        if (!searchText) return sortedData;
        const lowerSearch = searchText.toLowerCase();
        return sortedData.filter(company => Object.values(company).some(val => String(val).toLowerCase().includes(lowerSearch)));
    }, [sortedData, searchText]);

    const visibleCompanies = useMemo(() => filteredCompanies.slice(0, displayCount), [filteredCompanies, displayCount]);

    const getSortIcon = (columnKey) => {
        if (sortConfig.key === columnKey) {
            return sortConfig.direction === 'ascending' ? <ArrowUpwardIcon fontSize="small" className="ml-1" /> : <ArrowDownwardIcon fontSize="small" className="ml-1" />;
        }
        return null;
    };


    const handleMenuOpen = (event, rowId) => setAnchorEls(prev => ({ ...prev, [rowId]: event.currentTarget }));
    const handleMenuClose = (rowId) => setAnchorEls(prev => ({ ...prev, [rowId]: undefined }));
    const handleEdit = (company) => { setSelectedCompanyData(company); setShowEditForm(true); handleMenuClose(company.id); };

    // Infinite scroll
    const handleScroll = useCallback(() => {
        const nearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200;
        if (nearBottom && displayCount < filteredCompanies.length && !isLoadingMore && !loadingCompanies) {
            setIsLoadingMore(true);
            setTimeout(() => { setDisplayCount(prev => Math.min(prev + ROWS_PER_PAGE_COMPANY, filteredCompanies.length)); setIsLoadingMore(false); }, 300);
        }
    }, [displayCount, filteredCompanies.length, isLoadingMore, loadingCompanies]);

    useEffect(() => { window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, [handleScroll]);
    useEffect(() => { setDisplayCount(ROWS_PER_PAGE_COMPANY); }, [searchText]);

    return (
        <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
            {/* Header + Breadcrumb + Add Button */}
            {/* Search + Export Buttons */}
            <div className="overflow-x-auto shadow-md rounded-lg">
                <div className="flex justify-between items-center mb-4">
  <h1 className="text-xl font-semibold dark:text-white">{t('insuranceCompany.title', 'Insurance Companies')}</h1>
  <Button 
    variant="contained" 
    color="primary" 
    onClick={() => setShowAddForm(true)}
  >
    {t('insuranceCompany.addCompany', 'Add Company')}
  </Button>
</div>
                <table className="w-full text-sm text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                            {tableHeaders.map(col => (
                                <th key={col.key} scope="col"
                                    className={`px-6 py-3 ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}`}
                                    onClick={() => col.key !== 'actions' && requestSort(col.key)}
                                >
                                    <div className="flex items-center">
                                        <span>{col.label}</span>
                                        {col.key !== 'actions' && getSortIcon(col.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleCompanies.length > 0 ? visibleCompanies.map(company => (
                            <tr key={company.id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{company.name}</td>
                                <td className="px-6 py-4">{company.insuranceTypes}</td>
                                <td className="px-6 py-4">{company.roadServices}</td>
                                <td className={`px-6 py-4 ${(language === 'ar' || language === 'he') ? 'text-left' : 'text-right'}`}>
                                    <IconButton onClick={(e) => handleMenuOpen(e, company.id)}>
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                    <Menu anchorEl={anchorEls[company.id]} open={Boolean(anchorEls[company.id])} onClose={() => handleMenuClose(company.id)}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: (language === 'ar' || language === 'he') ? 'left' : 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: (language === 'ar' || language === 'he') ? 'left' : 'right' }}
                                    >
                                        <MenuItem onClick={() => handleEdit(company)}> <EditIcon /> {t('common.edit', 'Edit')} </MenuItem>
                                        <MenuItem onClick={() => handleDelete(company.id)} className="text-red-600 dark:text-red-400"> <DeleteIcon /> {t('common.delete', 'Delete')} </MenuItem>
                                    </Menu>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={tableHeaders.length} className="text-center py-10">{searchText ? t('common.noSearchResults', 'No results found.') : t('insuranceCompany.noCompanies', 'No insurance companies found.')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showEditForm && selectedCompanyData && (
                <EditInsuranceCompany isOpen={showEditForm} onClose={() => { setShowEditForm(false); setSelectedCompanyData(null); }} companyData={selectedCompanyData} onEditSuccess={() => { setShowEditForm(false); setSelectedCompanyData(null); fetchCompanies(); }} />
            )}
            <AddInsuranceCompany isOpen={showAddForm} onClose={() => { setShowAddForm(false); fetchCompanies(); }} />
        </div>
    );
}

export default InsuranceCompany;
