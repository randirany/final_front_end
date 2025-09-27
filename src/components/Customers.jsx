import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
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

const ROWS_PER_PAGE = 10;

export default function Customers() {
    const { t, i18n: { language } } = useTranslation();
    let navigate = useNavigate();

    // حالة لتحديد وضع العرض (جدول أو بطاقات)
    const [viewMode, setViewMode] = useState('table');

    // باقي الحالات كما هي
    const [allCustomers, setAllCustomers] = useState([]);
    const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE);
    const [anchorEls, setAnchorEls] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [showaddVehicle, setshowaddVehicle] = useState(false);
    const [selectedInsuredId, setSelectedInsuredId] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
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

    const sortedData = useMemo(() => {
        let sortableItems = [...allCustomers];
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
    }, [allCustomers, sortConfig]);

    const filteredCustomers = useMemo(() => {
        if (!searchText) return sortedData;
        const lowerSearch = searchText.toLowerCase();
        return sortedData.filter((customer) =>
            Object.values(customer).some((val) =>
                String(val).toLowerCase().includes(lowerSearch)
            )
        );
    }, [searchText, sortedData]);

    const visibleRows = useMemo(() => {

        return filteredCustomers.slice(0, displayCount);
    }, [filteredCustomers, displayCount]);

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
            body { font-family: Arial, sans-serif; }
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

    const fetchCustomers = async () => {
        setLoading(true);
        setDisplayCount(ROWS_PER_PAGE);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get(`http://localhost:3002/api/v1/insured/allInsured`, {
                headers: { token }
            });
            const formattedData = res.data.insuredList.map(item => ({
                id: item._id,
                first_name: item.first_name,
                last_name: item.last_name,
                id_Number: item.id_Number,
                phone_number: item.phone_number,
                joining_date: item.joining_date ? item.joining_date.slice(0, 10) : '',
                notes: item.notes,
                city: item.city,
                birth_date: item.birth_date ? item.birth_date.slice(0, 10) : '',
                name: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
                Mobile: item.phone_number,
                address: item.city,
                Identity: item.id_Number,
                email: item.email,
                agent: item.agentsName,
                image: item.image
            }));
            setAllCustomers(formattedData);
        } catch (err) {
            setAllCustomers([]);
        } finally {
            setLoading(false);
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
                    // toast.success(t('customers.messages.deleteSuccess', 'تم حذف العميل بنجاح!'));
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

    useEffect(() => { fetchCustomers(); }, []);

    const handleScroll = useCallback(() => {
        const threshold = 200;
        const nearBottom = window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - threshold;

        if (nearBottom && displayCount < filteredCustomers.length && !loading) {
            setTimeout(() => {
                setDisplayCount(prevCount => Math.min(prevCount + ROWS_PER_PAGE, filteredCustomers.length));
            }, 300);
        }
    }, [displayCount, filteredCustomers.length, loading]);

    useEffect(() => { window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, [handleScroll]);
    useEffect(() => { setDisplayCount(ROWS_PER_PAGE); }, [searchText]);

    const tableColumns = [
        { key: 'name', label: t('customers.table.name', 'Name') },
        { key: 'Mobile', label: t('customers.table.mobile', 'Mobile') },
        { key: 'Identity', label: t('customers.table.id', 'Identity') },
        { key: 'email', label: t('customers.table.email', 'Email') },
        { key: 'address', label: t('customers.table.address', 'Address') },
        { key: 'agent', label: t('customers.table.agent', 'Agent') },
        { key: 'actions', label: t('customers.table.actions', 'Actions'), align: language === 'ar' ? 'left' : 'right' },
    ];

    const getSortIcon = (columnKey) => {
        if (sortConfig.key === columnKey) {
            return sortConfig.direction === 'ascending'
                ? <ArrowUpwardIcon fontSize="small" className="ml-1" />
                : <ArrowDownwardIcon fontSize="small" className="ml-1" />;
        }
        return null;
    };

    return (
        <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={language === "ar" ? "rtl" : "ltr"}>
            <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
                <div className={`flex gap-2 md:gap-[14px] items-center mb-2 md:mb-0 text-sm md:text-base ${language === "ar" ? "text-right" : "text-left"}`}>
                    <NavLink className="hover:underline text-blue-600 dark:text-blue-400" to="/home">{t('customers.firstTitle', 'Dashboard')}</NavLink>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-500 dark:text-gray-400">{t('customers.secondeTitle', 'Customers')}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="contained" size="small" onClick={() => setShowAddForm(true)} sx={{ background: '#6C5FFC', color: '#fff' }}>
                        {t('customers.add_button', 'Add Customer')}
                    </Button>
                </div>
            </div>

            <div className='flex rounded-md justify-between items-start flex-wrap mb-4'>
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        placeholder={t('customers.search_placeholder', 'Search by name, mobile, ID...')}
                        className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-lg w-full sm:w-[300px] shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <div className="hidden sm:flex items-center bg-[rgb(255,255,255)]  dark:bg-gray-700 rounded-lg p-1">
                        <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-gray-3 dark:bg-indigo-600 text-indigo-600 dark:text-[rgb(255,255,255)] shadow' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-[rgb(255,255,255)]'}`} title={t('common.tableView', 'Table View')}><List size={20} /></button>
                        <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'card' ? 'bg-gray-3 dark:bg-indigo-600 text-indigo-600 dark:text-[rgb(255,255,255)] shadow' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-[rgb(255,255,255)]'}`} title={t('common.cardView', 'Card View')}><LayoutGrid size={20} /></button>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap  sm:mt-0">
                    <Button variant="outlined" size="small" onClick={handleExportCSV} disabled={filteredCustomers.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportCsv', 'CSV')}</Button>
                    <Button variant="outlined" size="small" onClick={handleExportExcel} disabled={filteredCustomers.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportExcel', 'Excel')}</Button>
                    <Button variant="outlined" size="small" onClick={handleExportPDF} disabled={filteredCustomers.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.exportPdf', 'PDF')}</Button>
                    <Button variant="outlined" size="small" onClick={handlePrint} disabled={filteredCustomers.length === 0} sx={{ background: '#6C5FFC', color: '#fff' }}>{t('common.print', 'Print')}</Button>
                </div>
            </div>

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {t('customers.showing_results', 'Showing {{count}} of {{total}} customers', { count: visibleRows.length, total: filteredCustomers.length })}
            </div>

            {viewMode === 'table' ? (
                <div className="overflow-x-auto hide-scrollbar bg-[rgb(255,255,255)] dark:bg-navbarBack shadow-md rounded-lg">
                    <table id="customers-table" className="w-full text-sm text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-400">
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
                                visibleRows.map((customer) => (
                                    <tr key={customer.id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[rgb(255,255,255)]">{customer.name}</td>
                                        <td className="px-6 py-4">{customer.Mobile}</td>
                                        <td className="px-6 py-4">{customer.Identity}</td>
                                        <td className="px-6 py-4">{customer.email}</td>
                                        <td className="px-6 py-4">{customer.address}</td>
                                        <td className="px-6 py-4">{customer.agent}</td>
                                        <td className="px-6 py-4 text-right">
                                            <IconButton aria-label="Actions" size="small" onClick={(event) => handleMenuOpen(event, customer.id)}><MoreVertIcon /></IconButton>
                                            <Menu anchorEl={anchorEls[customer.id]} open={Boolean(anchorEls[customer.id])} onClose={() => handleMenuClose(customer.id)}>
                                                <MenuItem onClick={() => handleEdit(customer)}><Edit size={16} className="mr-2" /> {t('common.edit')}</MenuItem>
                                                <MenuItem onClick={() => handleAddVehicleClick(customer.id)}><Car size={16} className="mr-2" />{t('customers.add_vehicle')}</MenuItem>
                                                <MenuItem onClick={() => navigate(`/profile/${customer.id}`)}><User size={16} className="mr-2" />{t('customers.profile')}</MenuItem>
                                                <MenuItem onClick={() => handleDelete(customer.id,customer.name)} className="text-red-600 dark:text-red-400"><Trash2 size={16} className="mr-2" /> {t('common.delete')}</MenuItem>
                                            </Menu>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={tableColumns.length} className="text-center py-10 text-gray-500">{t('customers.no_results')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
                </div>
            )}

            {showAddForm && <AddCustomer isOpen={showAddForm} onClose={() => setShowAddForm(false)} onAddSuccess={() => { setShowAddForm(false); fetchCustomers(); }} />}
            {showaddVehicle && <Add_vehicle isOpen={showaddVehicle} onClose={() => setshowaddVehicle(false)} insuredId={selectedInsuredId} />}
            {showEditForm && selectedCustomerData && <EditCustomer isOpen={showEditForm} onClose={() => setShowEditForm(false)} customerData={selectedCustomerData} onEditSuccess={() => { setShowEditForm(false); fetchCustomers(); }} />}
        </div>
    );
}