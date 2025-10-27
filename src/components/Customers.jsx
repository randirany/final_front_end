import { IconButton, Menu, MenuItem, Button, Select, FormControl, InputLabel } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import AddCustomer from './AddCustomer';
import Add_vehicle from './Add_vehicle';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import EditCustomer from './EditCustomer';
import { NavLink, useNavigate } from 'react-router-dom';
import { Car, Edit, LayoutGrid, List, Trash2, User } from 'lucide-react';
import CustomerCard from './CustomerCard';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { formatDateISO } from '../utils/dateFormatter';
import Pagination from './shared/Pagination';
import DataTable from './shared/DataTable';

const ROWS_PER_PAGE = 20;

export default function Customers() {
    const { t, i18n: { language } } = useTranslation();
    let navigate = useNavigate();

    // حالة لتحديد وضع العرض (جدول أو بطاقات)
    const [viewMode, setViewMode] = useState('table');

    // باقي الحالات كما هي
    const [allCustomers, setAllCustomers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [anchorEls, setAnchorEls] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [showaddVehicle, setshowaddVehicle] = useState(false);
    const [selectedInsuredId, setSelectedInsuredId] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedCustomerData, setSelectedCustomerData] = useState(null);

    const handleMenuOpen = (event, rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: event.currentTarget }));
    const handleMenuClose = (rowId) => setAnchorEls((prev) => ({ ...prev, [rowId]: undefined }));

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Client-side search filtering (for current page only)
    const filteredCustomers = useMemo(() => {
        if (!searchText) return allCustomers;
        const lowerSearch = searchText.toLowerCase();
        return allCustomers.filter((customer) =>
            Object.values(customer).some((val) =>
                String(val).toLowerCase().includes(lowerSearch)
            )
        );
    }, [searchText, allCustomers]);

    const visibleRows = filteredCustomers;

    const handleExportExcel = () => {
        const exportData = filteredCustomers.map(c => ({
            [t('customers.table.name', 'Name')]: c.name,
            [t('customers.table.mobile', 'Mobile')]: c.Mobile,
            [t('customers.table.address', 'Address')]: c.address,
            [t('customers.table.id', 'Identity')]: c.Identity,
            [t('customers.table.email', 'Email')]: c.email,
            [t('customers.table.agent', 'Agent')]: c.agent,
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t('customers.exportSheetName', "Customers"));
        XLSX.writeFile(workbook, t('customers.exportExcelFileName', "customers_report.xlsx"));
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const exportColumns = tableColumns
            .filter(col => col.key !== 'actions')
            .map(col => ({ header: col.label, dataKey: col.key }));

        doc.setFontSize(18);
        doc.text(t('customers.report_title', 'Customers Report'), 14, 22);

        const rows = filteredCustomers.map(customer => {
            let row = {};
            exportColumns.forEach(col => {
                row[col.dataKey] = customer[col.dataKey] || '-';
            });
            return row;
        });

        autoTable(doc, {
            startY: 30,
            columns: exportColumns,
            body: rows,
            styles: { fontSize: 8, font: "Arial" },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            didDrawPage: function (data) {
            }
        });
        doc.save(t('customers.exportPdfFileName', "customers_report.pdf"));
    };

    const handlePrint = () => {
        const printContent = document.getElementById('customers-table');
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print_' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'height=600,width=800');

        printWindow.document.write('<html><head><title>Customer List</title>');
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
        printWindow.document.write('<h1>' + t('customers.report_title', 'Customers Report') + '</h1>');

        printWindow.document.write('<table>');
        printWindow.document.write('<thead><tr>');
        tableColumns.forEach(col => {
            if (col.key !== 'actions') {
                printWindow.document.write('<th>' + col.label + '</th>');
            }
        });
        printWindow.document.write('</tr></thead>');

        printWindow.document.write('<tbody>');
        filteredCustomers.forEach(customer => {
            printWindow.document.write('<tr>');
            tableColumns.forEach(col => {
                if (col.key !== 'actions') {
                    printWindow.document.write('<td>' + (customer[col.key] || '-') + '</td>');
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

    const handleExportCSV = () => {
        const exportData = filteredCustomers.map(c => ({
            [t('customers.table.name', 'Name')]: c.name,
            [t('customers.table.mobile', 'Mobile')]: c.Mobile,
            [t('customers.table.address', 'Address')]: c.address,
            [t('customers.table.id', 'Identity')]: c.Identity,
            [t('customers.table.email', 'Email')]: c.email,
            [t('customers.table.agent', 'Agent')]: c.agent,
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
        link.setAttribute('download', t('customers.exportCsvFileName', "customers_report.csv"));
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fetchCustomers = async (page = 1, append = false) => {
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get(`http://localhost:3002/api/v1/insured/allInsured`, {
                headers: { token },
                params: {
                    page: page,
                    limit: ROWS_PER_PAGE,
                    sortBy: '-createdAt'
                }
            });

            // Handle new paginated response structure
            const customersData = res.data.data || res.data.insuredList || [];
            const formattedData = customersData.map(item => ({
                id: item._id,
                first_name: item.first_name,
                last_name: item.last_name,
                id_Number: item.id_Number,
                phone_number: item.phone_number,
                joining_date: item.joining_date ? formatDateISO(item.joining_date) : '',
                notes: item.notes,
                city: item.city,
                birth_date: item.birth_date ? formatDateISO(item.birth_date) : '',
                name: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
                Mobile: item.phone_number,
                address: item.city,
                Identity: item.id_Number,
                email: item.email,
                agent: item.agentsName,
                image: item.image
            }));

            // Append or replace data based on scroll behavior
            if (append) {
                setAllCustomers(prev => [...prev, ...formattedData]);
            } else {
                setAllCustomers(formattedData);
            }

            // Set pagination metadata and check if there's more data
            if (res.data.pagination) {
                setPagination(res.data.pagination);
                setHasMore(res.data.pagination.hasNextPage);
            } else {
                // Fallback: if no pagination, assume no more data if we got less than requested
                setHasMore(formattedData.length === ROWS_PER_PAGE);
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
            if (!append) {
                setAllCustomers([]);
            }
            setPagination(null);
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleEdit = (customer) => {
        setSelectedCustomerData(customer);
        setShowEditForm(true);
        handleMenuClose(customer.id);
    };

    const handleDelete = (customerId, customerName) => {
         handleMenuClose(customerId); // نغلق القائمة أولاً
        Swal.fire({
            title: t('customers.delete_confirm', `هل أنت متأكد من حذف ${customerName}؟`),
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
                const token = `islam__${localStorage.getItem("token")}`;
                try {
                    await axios.delete(`http://localhost:3002/api/v1/insured/deleteInsured/${customerId}`, { headers: { token } });
                    
    Swal.fire({
      title: t('customers.successDlete'),
      icon: "success"
    });
  
                    fetchCustomers(); 
                } catch (err) {
                    toast.error(err.response?.data?.message || t('customers.delete_error', 'فشل حذف العميل.'));
                }
            }
        });
    };

    const handleAddVehicleClick = (id) => {
        setSelectedInsuredId(id);
        setshowaddVehicle(true);
        handleMenuClose(id);
    };

    const handleProfileView = (customer) => {
        navigate(`/profile/${customer.id}`);
    };

    useEffect(() => {
        fetchCustomers(1, false);
    }, []);

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (loadingMore || !hasMore) return;

        const threshold = 200;
        const nearBottom = window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - threshold;

        if (nearBottom) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchCustomers(nextPage, true);
        }
    }, [loadingMore, hasMore, currentPage]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Reset when search changes
    useEffect(() => {
        if (searchText) {
            // Client-side search only, no need to refetch
        }
    }, [searchText]);

    const tableColumns = [
        { key: 'name', label: t('customers.table.name', 'Name') },
        { key: 'Mobile', label: t('customers.table.mobile', 'Mobile') },
        { key: 'Identity', label: t('customers.table.id', 'Identity') },
        { key: 'email', label: t('customers.table.email', 'Email') },
        { key: 'address', label: t('customers.table.address', 'Address') },
        { key: 'agent', label: t('customers.table.agent', 'Agent') },
    ];

    return (
        <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
            <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
                <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${(language === "ar" || language === "he") ? "text-right" : "text-left"}`}>
                    <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">{t('customers.firstTitle', 'Dashboard')}</NavLink>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-500 dark:text-gray-400">{t('customers.secondeTitle', 'Customers')}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-navbarBack shadow-sm hover:shadow-md"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {t('customers.add_button', 'Add Customer')}
                    </button>
                </div>
            </div>

            <div className='flex rounded-md justify-between items-start flex-wrap mb-4'>
                <div className="flex items-center gap-4">
                    {viewMode === 'card' && (
                        <input
                            type="text"
                            placeholder={t('customers.search_placeholder', 'Search by name, mobile, ID...')}
                            className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg w-full sm:w-[300px] shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    )}
                    <div className="hidden sm:flex items-center bg-[rgb(255,255,255)]  dark:bg-gray-700 rounded-lg p-1">
                        <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-gray-3 dark:bg-indigo-600 text-indigo-600 dark:text-[rgb(255,255,255)] shadow' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-[rgb(255,255,255)]'}`} title={t('common.tableView', 'Table View')}><List size={20} /></button>
                        <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'card' ? 'bg-gray-3 dark:bg-indigo-600 text-indigo-600 dark:text-[rgb(255,255,255)] shadow' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-[rgb(255,255,255)]'}`} title={t('common.cardView', 'Card View')}><LayoutGrid size={20} /></button>
                    </div>
                </div>
                {viewMode === 'card' && (
                    <div className="flex gap-2 flex-wrap sm:mt-0">
                        <button
                            onClick={handleExportCSV}
                            disabled={filteredCustomers.length === 0}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-dark2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            CSV
                        </button>
                        <button
                            onClick={handleExportExcel}
                            disabled={filteredCustomers.length === 0}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-dark2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('common.exportExcel', 'Excel')}
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={filteredCustomers.length === 0}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-dark2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('common.exportPdf', 'PDF')}
                        </button>
                        <button
                            onClick={handlePrint}
                            disabled={filteredCustomers.length === 0}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('common.print', 'Print')}
                        </button>
                    </div>
                )}
            </div>

            {viewMode === 'card' && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {pagination ? (
                        t('customers.showing_results', 'Showing {{count}} of {{total}} customers', {
                            count: allCustomers.length,
                            total: pagination.total
                        })
                    ) : (
                        t('customers.showing_results', 'Showing {{count}} customers', {
                            count: allCustomers.length
                        })
                    )}
                    {loadingMore && <span className="ml-2">{t('common.loadingMore', 'Loading more...')}</span>}
                </div>
            )}

            {viewMode === 'table' ? (
                <DataTable
                    data={allCustomers}
                    columns={[
                        {
                            accessor: 'name',
                            header: t('customers.table.name', 'Name'),
                            sortable: true
                        },
                        {
                            accessor: 'Mobile',
                            header: t('customers.table.mobile', 'Mobile'),
                            sortable: true
                        },
                        {
                            accessor: 'Identity',
                            header: t('customers.table.id', 'Identity'),
                            sortable: true
                        },
                        {
                            accessor: 'email',
                            header: t('customers.table.email', 'Email'),
                            sortable: true
                        },
                        {
                            accessor: 'address',
                            header: t('customers.table.address', 'Address'),
                            sortable: true
                        },
                        {
                            accessor: 'agent',
                            header: t('customers.table.agent', 'Agent'),
                            sortable: true
                        },
                        {
                            accessor: 'actions',
                            header: t('customers.table.actions', 'Actions'),
                            sortable: false,
                            render: (value, customer) => (
                                <div className="text-right">
                                    <IconButton
                                        aria-label="Actions"
                                        size="small"
                                        onClick={(event) => handleMenuOpen(event, customer.id)}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEls[customer.id]}
                                        open={Boolean(anchorEls[customer.id])}
                                        onClose={() => handleMenuClose(customer.id)}
                                    >
                                        <MenuItem onClick={() => handleEdit(customer)}>
                                            <Edit size={16} className="mr-2" /> {t('common.edit')}
                                        </MenuItem>
                                        <MenuItem onClick={() => handleAddVehicleClick(customer.id)}>
                                            <Car size={16} className="mr-2" />{t('customers.add_vehicle')}
                                        </MenuItem>
                                        <MenuItem onClick={() => navigate(`/profile/${customer.id}`)}>
                                            <User size={16} className="mr-2" />{t('customers.profile')}
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => handleDelete(customer.id, customer.name)}
                                            className="text-red-600 dark:text-red-400"
                                        >
                                            <Trash2 size={16} className="mr-2" /> {t('common.delete')}
                                        </MenuItem>
                                    </Menu>
                                </div>
                            )
                        }
                    ]}
                    title={t('customers.secondeTitle', 'Customers')}
                    loading={loading && allCustomers.length === 0}
                    onRefresh={() => {
                        setCurrentPage(1);
                        setAllCustomers([]);
                        setHasMore(true);
                        fetchCustomers(1, false);
                    }}
                    enableSearch={true}
                    enableExport={true}
                    enableCSV={true}
                    infiniteScroll={{
                        hasMore: hasMore,
                        loadingMore: loadingMore,
                        onLoadMore: () => {
                            if (!loadingMore && hasMore) {
                                const nextPage = currentPage + 1;
                                setCurrentPage(nextPage);
                                fetchCustomers(nextPage, true);
                            }
                        }
                    }}
                />
            ) : (
                <div>
                    {loading && visibleRows.length === 0 ? (
                        <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div></div>
                    ) : visibleRows.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {visibleRows.map((customer) => (
                                <CustomerCard
                                    key={customer.id}
                                    customer={customer}
                                    onEdit={handleEdit}
                                    onDelete={() =>handleDelete(customer.id,customer.name)}
                                    onAddVehicle={() => handleAddVehicleClick(customer.id)}
                                    onProfileView={handleProfileView}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">{t('customers.no_results')}</div>
                    )}

                    {/* Loading more indicator at bottom for card view */}
                    {loadingMore && (
                        <div className="mt-4 text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('common.loadingMore', 'Loading more...')}</p>
                        </div>
                    )}

                    {/* End of list indicator for card view */}
                    {!hasMore && allCustomers.length > 0 && !loading && (
                        <div className="mt-4 text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                            {t('common.endOfList', 'You have reached the end of the list')}
                        </div>
                    )}
                </div>
            )}

            {showAddForm && <AddCustomer isOpen={showAddForm} onClose={() => setShowAddForm(false)} onAddSuccess={() => { setShowAddForm(false); setCurrentPage(1); setAllCustomers([]); fetchCustomers(1, false); }} />}
            {showaddVehicle && <Add_vehicle isOpen={showaddVehicle} onClose={() => setshowaddVehicle(false)} insuredId={selectedInsuredId} />}
            {showEditForm && selectedCustomerData && <EditCustomer isOpen={showEditForm} onClose={() => setShowEditForm(false)} customerData={selectedCustomerData} onEditSuccess={() => { setShowEditForm(false); fetchCustomers(); }} />}
        </div>
    );
}