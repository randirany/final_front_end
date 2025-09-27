import { IconButton, Menu, MenuItem, Tabs, Tab, Box, FormControl, InputLabel, Select as MUISelect, Button as MUIButton, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Added for sort icon
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; // Added for sort icon

import { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { X, User, Users, Info, ShieldCheck } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ROWS_PER_PAGE = 10;

function Departments() {
    const { t, i18n: { language } } = useTranslation();
    const [allDepartments, setAllDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState(0);
    const [anchorEls, setAnchorEls] = useState({});
    const [showDepartmentDetails, setShowDepartmentDetails] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [departmentFormData, setDepartmentFormData] = useState({ name: '', description: '', permissions: [] });
    const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
    const [showAddHeadForm, setShowAddHeadForm] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [headFormData, setHeadFormData] = useState({ name: '', email: '', password: '' });
    const [employeeFormData, setEmployeeFormData] = useState({ name: '', email: '', password: '' });

    const [selectedDepartmentIdForEmployees, setSelectedDepartmentIdForEmployees] = useState('all');
    const [departmentEmployees, setDepartmentEmployees] = useState([]);
    const [allSystemEmployees, setAllSystemEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    const [displayCountDepartments, setDisplayCountDepartments] = useState(ROWS_PER_PAGE);
    const [isLoadingMoreDepartments, setIsLoadingMoreDepartments] = useState(false);

    const [displayCountEmployees, setDisplayCountEmployees] = useState(ROWS_PER_PAGE);
    const [isLoadingMoreEmployees, setIsLoadingMoreEmployees] = useState(false);

    // Sort state for departments table
    const [departmentSortConfig, setDepartmentSortConfig] = useState({ key: null, direction: 'ascending' });
    // Sort state for employees table
    const [employeeSortConfig, setEmployeeSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (showDepartmentDetails) {
                    setShowDepartmentDetails(false);
                    setSelectedDepartment(null);
                } else if (showEditForm) {
                    setShowEditForm(false);
                    setDepartmentFormData({ name: '', description: '', permissions: [] });
                    setSelectedDepartment(null);
                } else if (showAddEmployeeForm) {
                    setShowAddEmployeeForm(false);
                    setEmployeeFormData({ name: '', email: '', password: '' });
                } else if (showAddHeadForm) {
                    setShowAddHeadForm(false);
                    setHeadFormData({ name: '', email: '', password: '' });
                }
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [showDepartmentDetails, showEditForm, showAddEmployeeForm, showAddHeadForm]);

    const fetchDepartments = async () => {
        setLoading(true);
        setDisplayCountDepartments(ROWS_PER_PAGE);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get('http://localhost:3002/api/v1/department/all', {
                headers: { token }
            });
            const fetchedDepartments = res.data.departments || [];
            setAllDepartments(fetchedDepartments);
            let allEmps = [];
            fetchedDepartments.forEach(dept => {
                if (dept.headOfEmployee) {
                    allEmps.push({ ...dept.headOfEmployee, departmentName: dept.name, id: dept.headOfEmployee._id, departmentId: dept._id });
                }
                if (dept.employees && dept.employees.length) {
                    dept.employees.forEach(emp => {
                        allEmps.push({ ...emp, departmentName: dept.name, id: emp._id, departmentId: dept._id });
                    });
                }
            });
            const uniqueEmployees = Array.from(new Set(allEmps.map(e => e.id))).map(id => allEmps.find(e => e.id === id));
            setAllSystemEmployees(uniqueEmployees);
            if (selectedTab === 1 && selectedDepartmentIdForEmployees === 'all') {
                setDepartmentEmployees(uniqueEmployees);
            }

        } catch (err) {
            toast.error(t('departments.fetchError', 'Failed to fetch departments.'));
            setAllDepartments([]);
            setAllSystemEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeesByDepartment = async (departmentId) => {
        setDisplayCountEmployees(ROWS_PER_PAGE);
        if (departmentId === 'all') {
            setDepartmentEmployees(allSystemEmployees);
            setLoadingEmployees(false);
            return;
        }

        setLoadingEmployees(true);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get(`http://localhost:3002/api/v1/user/allEmployee/${departmentId}`, {
                headers: { token }
            });
            const department = allDepartments.find(d => d._id === departmentId);
            const formattedEmployees = (res.data.employees || []).map(emp => ({
                ...emp,
                id: emp._id,
                departmentName: department?.name || 'N/A',
                departmentId: departmentId
            }));
            setDepartmentEmployees(formattedEmployees);
        } catch (err) {
            toast.error(t('employees.fetchErrorSpecific', 'Failed to fetch employees for this department.'));
            setDepartmentEmployees([]);
        } finally {
            setLoadingEmployees(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (selectedTab === 1) {
            fetchEmployeesByDepartment(selectedDepartmentIdForEmployees);
        }
    }, [selectedDepartmentIdForEmployees, selectedTab, allSystemEmployees]);

    const handleDepartmentSelectChange = (event) => {
        setSelectedDepartmentIdForEmployees(event.target.value);
    };

    const handleMenuOpen = (event, rowId) => { setAnchorEls((prev) => ({ ...prev, [rowId]: event.currentTarget })); };
    const handleMenuClose = (rowId) => {
        setAnchorEls((prev) => {
            const newAnchors = { ...prev };
            if (rowId) delete newAnchors[rowId];
            else return {};
            return newAnchors;
        });
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
        setSearchText("");
        if (newValue === 0) {
            setDisplayCountDepartments(ROWS_PER_PAGE);
            setDepartmentSortConfig({ key: null, direction: 'ascending' }); // Reset sort for departments
        } else if (newValue === 1) {
            setSelectedDepartmentIdForEmployees('all');
            setDisplayCountEmployees(ROWS_PER_PAGE);
            setEmployeeSortConfig({ key: null, direction: 'ascending' }); // Reset sort for employees
        }
    };

    const handleViewDepartment = (department) => { setSelectedDepartment(department); setShowDepartmentDetails(true); handleMenuClose(department._id); };

    const handleEditDepartment = (department) => {
        setSelectedDepartment(department);
        setDepartmentFormData({
            name: department.name,
            description: department.description || '',
            permissions: department.permissions || []
        });
        setShowEditForm(true);
        handleMenuClose(department._id);
    };

    const handleDeleteDepartment = async (id) => {
        if (window.confirm(t('departments.deleteConfirm', 'Are you sure you want to delete this department?'))) {
            try {
                const token = `islam__${localStorage.getItem("token")}`;
                await axios.delete(`http://localhost:3002/api/v1/department/delete/${id}`, {
                    headers: { token }
                });
                toast.success(t('departments.deleteSuccess', 'Department deleted successfully.'));
                fetchDepartments();
            } catch (err) {
                toast.error(err.response?.data?.message || t('departments.deleteError', 'Error deleting department.'));
            }
        }
        handleMenuClose(id);
    };

    const handleAddEmployee = (department) => { setSelectedDepartment(department); setShowAddEmployeeForm(true); handleMenuClose(department._id); };
    const handleAddHead = (department) => { setSelectedDepartment(department); setShowAddHeadForm(true); handleMenuClose(department._id); };
    const handleEmployeeFormChange = (e) => setEmployeeFormData({ ...employeeFormData, [e.target.name]: e.target.value });
    const handleHeadFormChange = (e) => setHeadFormData({ ...headFormData, [e.target.name]: e.target.value });

    const handleAddEmployeeSubmit = async (e) => {
        e.preventDefault();
        if (!employeeFormData.name || !employeeFormData.email || !employeeFormData.password) {
            toast.error(t('validation.allFieldsRequired', "All fields are required."));
            return;
        }
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            await axios.post(`http://localhost:3002/api/v1/user/addEmployee/${selectedDepartment._id}`, employeeFormData, { headers: { token } });
            toast.success(t('departments.addEmployeeSuccess', 'Employee added successfully.'));
            fetchDepartments();
            if (selectedTab === 1) fetchEmployeesByDepartment(selectedDepartmentIdForEmployees);
            setShowAddEmployeeForm(false);
            setEmployeeFormData({ name: '', email: '', password: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || t('departments.addEmployeeError', 'Error adding employee.'));
        }
    };
    const handleAddHeadSubmit = async (e) => {
        e.preventDefault();
        if (!headFormData.name || !headFormData.email || !headFormData.password) {
            toast.error(t('validation.allFieldsRequired', "All fields are required."));
            return;
        }
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            await axios.post(`http://localhost:3002/api/v1/user/addHeadOfEmployeeToDepartment/${selectedDepartment._id}`, headFormData, { headers: { token } });
            toast.success(t('departments.addHeadSuccess', 'Department head added successfully.'));
            fetchDepartments();
            if (selectedTab === 1) fetchEmployeesByDepartment(selectedDepartmentIdForEmployees);
            setShowAddHeadForm(false);
            setHeadFormData({ name: '', email: '', password: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || t('departments.addHeadError', 'Error adding department head.'));
        }
    };

    const handleRemoveEmployee = async (departmentId, employeeId, empData) => {
        const confirmMessage = empData.role === 'HeadOfEmployee'
            ? t('departments.removeHeadConfirm', 'Are you sure you want to remove this head of department?')
            : t('departments.removeEmployeeConfirm', 'Are you sure you want to remove this employee from the department?');

        if (window.confirm(confirmMessage)) {
            const endpoint = empData.role === 'HeadOfEmployee'
                ? `http://localhost:3002/api/v1/user/deleteHeadOfEmployeeFromDepartment/${departmentId}/${employeeId}`
                : `http://localhost:3002/api/v1/user/deleteEmployee/${departmentId}/${employeeId}`;
            try {
                const token = `islam__${localStorage.getItem("token")}`;
                await axios.delete(endpoint, { headers: { token } });
                toast.success(t('departments.removeUserSuccess', 'User removed successfully.'));
                fetchDepartments();
                if (selectedTab === 1) {
                    if (selectedDepartmentIdForEmployees === 'all') {
                        // Re-filter allSystemEmployees or refetch if necessary
                        const updatedAllSystemEmployees = allSystemEmployees.filter(emp => emp.id !== employeeId);
                        setAllSystemEmployees(updatedAllSystemEmployees);
                        setDepartmentEmployees(updatedAllSystemEmployees);
                    } else {
                        fetchEmployeesByDepartment(selectedDepartmentIdForEmployees);
                    }
                }
            } catch (err) {
                toast.error(err.response?.data?.message || t('departments.removeUserError', 'Error removing user.'));
            }
        }
    };

    const handleDepartmentFormChange = (e) => {
        const { name, value, checked, type } = e.target;
        if (name === 'permissions') {
            const updatedPermissions = departmentFormData.permissions ? [...departmentFormData.permissions] : [];
            if (checked) {
                updatedPermissions.push(value);
            } else {
                const index = updatedPermissions.indexOf(value);
                if (index > -1) updatedPermissions.splice(index, 1);
            }
            setDepartmentFormData({ ...departmentFormData, permissions: updatedPermissions });
        } else {
            setDepartmentFormData({ ...departmentFormData, [name]: value });
        }
    };

    const handleUpdateDepartmentSubmit = async (e) => {
        e.preventDefault();
        if (!departmentFormData.name) {
            toast.error(t('departments.validation.nameRequired', "Department name is required."));
            return;
        }
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            await axios.patch(`http://localhost:3002/api/v1/department/update/${selectedDepartment._id}`, departmentFormData, { headers: { token } });
            toast.success(t('departments.updateSuccess', 'Department updated successfully.'));
            fetchDepartments();
            setShowEditForm(false);
            setSelectedDepartment(null);
            setDepartmentFormData({ name: '', description: '', permissions: [] });
        } catch (err) {
            toast.error(err.response?.data?.message || t('departments.updateError', 'Error updating department.'));
        }
    };

    const handleAddDepartmentSubmit = async (e) => {
        e.preventDefault();
        if (!departmentFormData.name) {
            toast.error(t('departments.validation.nameRequired', "Department name is required."));
            return;
        }
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            await axios.post(`http://localhost:3002/api/v1/department/add`, departmentFormData, { headers: { token } });
            toast.success(t('departments.addSuccess', 'Department added successfully.'));
            fetchDepartments();
            setShowEditForm(false); // Assuming this form is reused for add and edit
            setDepartmentFormData({ name: '', description: '', permissions: [] });
        } catch (err) {
            toast.error(err.response?.data?.message || t('departments.addError', 'Error adding department.'));
        }
    };

    // Generic sort function
    const getSortedData = (items, config) => {
        if (!config || !config.key) return items;
        const sortedItems = [...items];
        sortedItems.sort((a, b) => {
            let aValue = a[config.key];
            let bValue = b[config.key];

            // Handle nested properties like headOfEmployee.name
            if (config.key.includes('.')) {
                aValue = config.key.split('.').reduce((obj, key) => obj && obj[key], a);
                bValue = config.key.split('.').reduce((obj, key) => obj && obj[key], b);
            }

            // Handle employeeCount for departments
            if (config.key === 'employeeCount' && items === allDepartments) {
                aValue = a.employees?.length || 0;
                bValue = b.employees?.length || 0;
            }

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();

            if (aValue < bValue) return config.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return config.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortedItems;
    };

    const requestSort = (key, tableType) => {
        const currentConfig = tableType === 'departments' ? departmentSortConfig : employeeSortConfig;
        const setConfig = tableType === 'departments' ? setDepartmentSortConfig : setEmployeeSortConfig;
        let direction = 'ascending';
        if (currentConfig.key === key && currentConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setConfig({ key, direction });
    };

    const getSortIcon = (columnKey, tableType) => {
        const currentConfig = tableType === 'departments' ? departmentSortConfig : employeeSortConfig;
        if (currentConfig.key === columnKey) {
            return currentConfig.direction === 'ascending'
                ? <ArrowUpwardIcon fontSize="small" className="ml-1" />
                : <ArrowDownwardIcon fontSize="small" className="ml-1" />;
        }
        return <ArrowUpwardIcon fontSize="small" className="ml-1 text-transparent group-hover:text-gray-400" />; // Show a transparent icon that appears on hover
    };

    const sortedDepartments = useMemo(() => getSortedData(allDepartments, departmentSortConfig), [allDepartments, departmentSortConfig]);
    const sortedEmployees = useMemo(() => {
        const source = selectedDepartmentIdForEmployees === 'all' ? allSystemEmployees : departmentEmployees;
        return getSortedData(source, employeeSortConfig);
    }, [allSystemEmployees, departmentEmployees, selectedDepartmentIdForEmployees, employeeSortConfig]);


    const filteredDepartmentsForDisplay = useMemo(() => {
        if (!searchText && selectedTab === 0) return sortedDepartments;
        if (selectedTab !== 0) return [];
        const lowerSearch = searchText.toLowerCase();
        return sortedDepartments.filter(department =>
            department.name?.toLowerCase().includes(lowerSearch) ||
            department.description?.toLowerCase().includes(lowerSearch) ||
            department.headOfEmployee?.name?.toLowerCase().includes(lowerSearch)
        );
    }, [sortedDepartments, searchText, selectedTab]);

    const visibleDepartments = useMemo(() => { return filteredDepartmentsForDisplay.slice(0, displayCountDepartments); }, [filteredDepartmentsForDisplay, displayCountDepartments]);

    const filteredEmployeesForDisplay = useMemo(() => {
        if (!searchText) return sortedEmployees;
        const lowerSearch = searchText.toLowerCase();
        return sortedEmployees.filter(emp =>
            emp.name?.toLowerCase().includes(lowerSearch) ||
            emp.email?.toLowerCase().includes(lowerSearch) ||
            emp.role?.toLowerCase().includes(lowerSearch) ||
            emp.departmentName?.toLowerCase().includes(lowerSearch)
        );
    }, [sortedEmployees, searchText]);

    const visibleEmployees = useMemo(() => {
        return filteredEmployeesForDisplay.slice(0, displayCountEmployees);
    }, [filteredEmployeesForDisplay, displayCountEmployees]);

    const handleDepartmentsScroll = useCallback(() => {
        const nearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200;
        if (nearBottom && displayCountDepartments < filteredDepartmentsForDisplay.length && !isLoadingMoreDepartments && !loading) {
            setIsLoadingMoreDepartments(true);
            setTimeout(() => {
                setDisplayCountDepartments(prev => Math.min(prev + ROWS_PER_PAGE, filteredDepartmentsForDisplay.length));
                setIsLoadingMoreDepartments(false);
            }, 300);
        }
    }, [displayCountDepartments, filteredDepartmentsForDisplay.length, isLoadingMoreDepartments, loading]);

    const handleEmployeesScroll = useCallback(() => {
        const nearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200;
        if (nearBottom && displayCountEmployees < filteredEmployeesForDisplay.length && !isLoadingMoreEmployees && !loadingEmployees) {
            setIsLoadingMoreEmployees(true);
            setTimeout(() => {
                setDisplayCountEmployees(prev => Math.min(prev + ROWS_PER_PAGE, filteredEmployeesForDisplay.length));
                setIsLoadingMoreEmployees(false);
            }, 300);
        }
    }, [displayCountEmployees, filteredEmployeesForDisplay.length, isLoadingMoreEmployees, loadingEmployees]);

    useEffect(() => {
        const currentScrollHandler = selectedTab === 0 ? handleDepartmentsScroll : handleEmployeesScroll;
        window.addEventListener('scroll', currentScrollHandler);
        return () => window.removeEventListener('scroll', currentScrollHandler);
    }, [selectedTab, handleDepartmentsScroll, handleEmployeesScroll]);

    useEffect(() => {
        if (selectedTab === 0) setDisplayCountDepartments(ROWS_PER_PAGE);
        else if (selectedTab === 1) setDisplayCountEmployees(ROWS_PER_PAGE);
    }, [searchText, selectedTab]);

    const departmentTableColumns = [
        { key: 'name', label: t('departments.table.name', 'Department Name'), sortable: true },
        { key: 'description', label: t('departments.table.description', 'Description'), sortable: true },
        { key: 'headOfEmployee.name', label: t('departments.table.head', 'Head Of Department'), sortable: true }, // Updated key for sorting
        { key: 'employeeCount', label: t('departments.table.employeeCount', 'Employee Count'), sortable: true }, // Added sortable flag
        { key: 'actions', label: t('departments.table.actions', 'Actions'), align: language === 'ar' ? 'left' : 'right', sortable: false },];

    const employeeTableColumns = [
        { key: 'name', label: t('employees.table.name', 'Name'), sortable: true },
        { key: 'email', label: t('employees.table.email', 'Email'), sortable: true },
        { key: 'role', label: t('employees.table.role', 'Role'), sortable: true },
        { key: 'status', label: t('employees.table.status', 'Status'), sortable: true }, // Assuming status is sortable
        { key: 'departmentName', label: t('employees.table.department', 'Department'), sortable: true },
        { key: 'actions', label: t('employees.table.actions', 'Actions'), align: language === 'ar' ? 'left' : 'right', sortable: false },];

    const availablePermissions = [
        "addAccedent", "showAccedent", "deleteAccedent",
        "createNotification", "getNotifications", "markAsRead", "Deletenotification",
        "addInsured", "deleteInsured", "allInsured", "findbyidInsured",
        "addcar", "removeCar", "showVehicles",
        "addRoad", "deleteRoad", "updateRoad", "allRoad",
        "addAgents", "deleteAgents", "updateAgents", "allAgents",
        "addCompany", "deleteCompany", "upateCompany", "allCompany"];

    // Generic Export to Excel function
    const handleExportExcel = () => {
        const dataToExport = selectedTab === 0 ? filteredDepartmentsForDisplay : filteredEmployeesForDisplay;
        const columns = selectedTab === 0 ? departmentTableColumns : employeeTableColumns;
        const sheetName = selectedTab === 0 ? t('departments.exportSheetName', "Departments") : t('employees.exportSheetName', "Employees");
        const fileName = selectedTab === 0 ? t('departments.exportExcelFileName', "Departments_Report.xlsx") : t('employees.exportExcelFileName', "Employees_Report.xlsx");

        if (dataToExport.length === 0) {
            toast.info(t('common.noDataToExport', 'No data available to export.'));
            return;
        }

        const mappedData = dataToExport.map(item => {
            const row = {};
            columns.forEach(col => {
                if (col.key !== 'actions') {
                    let value = item[col.key];
                    if (col.key.includes('.')) { // Handle nested keys like 'headOfEmployee.name'
                        value = col.key.split('.').reduce((obj, key) => obj && obj[key], item);
                    }
                    if (col.key === 'employeeCount' && selectedTab === 0) {
                        value = item.employees?.length || 0;
                    }
                    if (col.key === 'departmentName' && selectedTab === 1) {
                        const dept = allDepartments.find(d => d._id === item.departmentId || d.employees?.some(e => e._id === item.id) || d.headOfEmployee?._id === item.id);
                        value = item.departmentName || dept?.name || t('employees.notAssigned', 'N/A');
                    }
                    row[col.label] = value !== undefined && value !== null ? value : '—';
                }
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, fileName);
    };

    // Generic Export to PDF function
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const dataToExport = selectedTab === 0 ? filteredDepartmentsForDisplay : filteredEmployeesForDisplay;
        const columns = selectedTab === 0 ? departmentTableColumns : employeeTableColumns;
        const title = selectedTab === 0 ? t('departments.exportPdfTitle', "Departments Report") : t('employees.exportPdfTitle', "Employees Report");
        const fileName = selectedTab === 0 ? t('departments.exportPdfFileName', "Departments_report.pdf") : t('employees.exportPdfFileName', "Employees_report.pdf");

        if (dataToExport.length === 0) {
            toast.info(t('common.noDataToExport', 'No data available to export.'));
            return;
        }

        doc.setFontSize(18);
        if (language === 'ar') {
            // For Arabic, set font that supports Arabic characters
            // doc.setFont('Amiri-Regular'); // Example, ensure Amiri-Regular.ttf is loaded or use a default like 'Arial'
            const textWidth = doc.getTextWidth(title);
            doc.text(title, doc.internal.pageSize.getWidth() - 14 - textWidth, 22);
        } else {
            doc.text(title, 14, 22);
        }

        const head = [columns.filter(col => col.key !== 'actions').map(col => col.label)];
        const body = dataToExport.map(item =>
            columns.filter(col => col.key !== 'actions').map(col => {
                let value = item[col.key];
                if (col.key.includes('.')) { // Handle nested keys
                    value = col.key.split('.').reduce((obj, key) => obj && obj[key], item);
                }
                if (col.key === 'employeeCount' && selectedTab === 0) {
                    value = item.employees?.length || 0;
                }
                if (col.key === 'departmentName' && selectedTab === 1) {
                    const dept = allDepartments.find(d => d._id === item.departmentId || d.employees?.some(e => e._id === item.id) || d.headOfEmployee?._id === item.id);
                    value = item.departmentName || dept?.name || t('employees.notAssigned', 'N/A');
                }
                return value !== undefined && value !== null ? String(value) : '—';
            })
        );

        autoTable(doc, {
            startY: 30,
            head: head,
            body: body,
            styles: { fontSize: 8, font: language === 'ar' ? 'Arial' : "Arial" }, // Specify font for Arabic if needed
            headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: language === 'ar' ? 'right' : 'left' },
            bodyStyles: { halign: language === 'ar' ? 'right' : 'left' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            didDrawPage: function (data) {
                if (language === 'ar') {
                    // Ensure text is drawn right-to-left if needed for page numbers etc.
                }
            }
        });
        doc.save(fileName);
    };

    // Export to CSV function
    const handleExportCSV = () => {
        const dataToExport = selectedTab === 0 ? filteredDepartmentsForDisplay : filteredEmployeesForDisplay;
        const columns = selectedTab === 0 ? departmentTableColumns : employeeTableColumns;
        const fileName = selectedTab === 0 ? t('departments.exportCsvFileName', "Departments_Report.csv") : t('employees.exportCsvFileName', "Employees_Report.csv");

        if (dataToExport.length === 0) {
            toast.info(t('common.noDataToExport', 'No data available to export.'));
            return;
        }

        const csvHeader = columns.filter(col => col.key !== 'actions').map(col => col.label).join(',');
        const csvRows = dataToExport.map(item => {
            return columns.filter(col => col.key !== 'actions').map(col => {
                let value = item[col.key];
                if (col.key.includes('.')) {
                    value = col.key.split('.').reduce((obj, key) => obj && obj[key], item);
                }
                if (col.key === 'employeeCount' && selectedTab === 0) {
                    value = item.employees?.length || 0;
                }
                if (col.key === 'departmentName' && selectedTab === 1) {
                    const dept = allDepartments.find(d => d._id === item.departmentId || d.employees?.some(e => e._id === item.id) || d.headOfEmployee?._id === item.id);
                    value = item.departmentName || dept?.name || t('employees.notAssigned', 'N/A');
                }
                const stringValue = value !== undefined && value !== null ? String(value) : '—';
                return `"${stringValue.replace(/"/g, '""')}"`; // Escape double quotes
            }).join(',');
        });

        const csvContent = [csvHeader, ...csvRows].join('\n');
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Print function
    const handlePrint = () => {
        const dataToExport = selectedTab === 0 ? visibleDepartments : visibleEmployees; // Use visible data for print
        const columns = selectedTab === 0 ? departmentTableColumns : employeeTableColumns;
        const tableTitle = selectedTab === 0 ? t('departments.printTitle', "Departments List") : t('employees.printTitle', "Employees List");

        if (dataToExport.length === 0) {
            toast.info(t('common.noDataToPrint', 'No data available to print.'));
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>' + tableTitle + '</title>');
        printWindow.document.write('<style>body{font-family: ' + (language === 'ar' ? 'Cairo, sans-serif' : 'Arial, sans-serif') + '; margin: 20px;} table{width: 100%; border-collapse: collapse;} th,td{border: 1px solid #ddd; padding: 8px; text-align: left;} th{background-color: #f2f2f2;} h1{text-align: center;} @media print{.no-print{display:none;}}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>' + tableTitle + '</h1>');
        printWindow.document.write('<table><thead><tr>');
        columns.filter(col => col.key !== 'actions').forEach(col => {
            printWindow.document.write('<th>' + col.label + '</th>');
        });
        printWindow.document.write('</tr></thead><tbody>');
        dataToExport.forEach(item => {
            printWindow.document.write('<tr>');
            columns.filter(col => col.key !== 'actions').forEach(col => {
                let value = item[col.key];
                if (col.key.includes('.')) {
                    value = col.key.split('.').reduce((obj, key) => obj && obj[key], item);
                }
                if (col.key === 'employeeCount' && selectedTab === 0) {
                    value = item.employees?.length || 0;
                }
                if (col.key === 'departmentName' && selectedTab === 1) {
                    const dept = allDepartments.find(d => d._id === item.departmentId || d.employees?.some(e => e._id === item.id) || d.headOfEmployee?._id === item.id);
                    value = item.departmentName || dept?.name || t('employees.notAssigned', 'N/A');
                }
                printWindow.document.write('<td>' + (value !== undefined && value !== null ? value : '—') + '</td>');
            });
            printWindow.document.write('</tr>');
        });
        printWindow.document.write('</tbody></table>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        // printWindow.close(); // Closing automatically might be too fast for some browsers
    };

    return (
        <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={language === "ar" ? "rtl" : "ltr"}>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={language === "ar"} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
            <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
                <div className="flex gap-2 md:gap-[14px] items-center text-sm md:text-base">
                    <NavLink to="/home" className="hover:underline text-blue-600 dark:text-blue-400">{t('breadcrumbs.home', 'Home')}</NavLink>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-500 dark:text-gray-400">{t('breadcrumbs.departmentsAndUsers', 'Users & Departments')}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {selectedTab === 0 && (
                        <MUIButton
                            variant="contained"
                            size="small"
                            color="primary"
                            sx={{ background: '#6C5FFC', color: '#fff' }}
                            onClick={() => {
                                setSelectedDepartment(null);
                                setDepartmentFormData({ name: '', description: '', permissions: [] });
                                setShowEditForm(true);
                            }}
                        >
                            {t('departments.addButton', 'Add Department')}
                        </MUIButton>
                    )}
                </div>
            </div>

            <div className='bg-[rgb(255,255,255)] dark:bg-navbarBack mt-3 rounded-md shadow-sm'>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, px: 2, pt: 1 }}>
                    <Tabs value={selectedTab} onChange={handleTabChange} aria-label={t('departments.tabsAriaLabel', "Department and Employee Tabs")}
                        sx={{
                            '& .MuiTab-root': { color: language === 'ar' ? 'text.secondary' : 'text.secondary', '&.Mui-selected': { color: 'primary.main' } },
                            '& .MuiTabs-indicator': { backgroundColor: 'primary.main' }
                        }}
                    >
                        <Tab icon={<Users className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />} iconPosition="start" label={t('departments.tabDepartments', "Departments")} />
                        <Tab icon={<User className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />} iconPosition="start" label={t('departments.tabEmployees', "Employees")} />
                    </Tabs>
                </Box>
                <div>
                    <div className='flex rounded-md justify-between items-start flex-wrap px-2'>
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder={selectedTab === 0 ? t('departments.searchPlaceholder', "Search departments...") : t('employees.searchPlaceholder', "Search employees...")}
                                className="p-2 w-[300px] rounded-md shadow-sm 
                                        border border-gray-300 
                                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                        dark:!border-transparent dark:!focus:border-transparent 
                                      dark:bg-gray-700 dark:text-gray-200"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />

                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleExportCSV}
                                className="mr-2"
                                sx={{ background: '#6C5FFC', color: '#fff' }}

                            >
                                {t('common.exportCsv', 'CSV')}
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleExportExcel}
                                className="mr-2"
                                sx={{ background: '#6C5FFC', color: '#fff' }}

                            >
                                {t('common.exportExcel', 'Excel')}
                            </Button>
                            <Button
                                variant="outlined"
                                sx={{ background: '#6C5FFC', color: '#fff' }}

                                size="small"
                                onClick={handleExportPDF}
                                className="mr-2"
                            >
                                {t('common.exportPdf', 'PDF')}
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ background: '#6C5FFC', color: '#fff' }}

                                onClick={handlePrint}
                                className="mr-2"
                            >
                                {t('common.print', 'Print')}
                            </Button>

                        </div>
                    </div>
                    {selectedTab === 0 && (
                        <>
                            <div className="overflow-x-auto hide-scrollbar">
                                <table id="departments-table" className="w-full text-sm text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                                        <tr>
                                            {departmentTableColumns.map(col => (
                                                <th key={col.key} scope="col"
                                                    className={`group px-6 py-3 ${col.align === 'right' ? 'text-right' : (language === 'ar' ? 'text-right' : 'text-left')} ${col.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}`}
                                                    onClick={() => col.sortable && requestSort(col.key, 'departments')}
                                                >
                                                    <div className="flex items-center">
                                                        <span>{col.label}</span>
                                                        {col.sortable && getSortIcon(col.key, 'departments')}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading && visibleDepartments.length === 0 ? (
                                            <tr><td colSpan={departmentTableColumns.length} className="text-center py-16">
                                                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3 rtl:ml-3 rtl:mr-0"></div>{t('common.loading', 'Loading...')}
                                                </div>
                                            </td></tr>
                                        ) : visibleDepartments.length > 0 ? (
                                            visibleDepartments.map((dept) => (
                                                <tr key={dept._id || dept.id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[rgb(255,255,255)]">{dept.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap max-w-sm truncate" title={dept.description}>{dept.description || '—'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{dept.headOfEmployee?.name || '—'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{dept.employees?.length || 0}</td>
                                                    <td className={`px-6 py-4 ${departmentTableColumns.find(c => c.key === 'actions')?.align === 'right' ? 'text-right' : (language === 'ar' ? 'text-left' : 'text-right')}`}>
                                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, dept._id)} className="dark:text-black hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1">
                                                            <MoreVertIcon fontSize="small" />
                                                        </IconButton>
                                                        <Menu anchorEl={anchorEls[dept._id]} open={Boolean(anchorEls[dept._id])} onClose={() => handleMenuClose(dept._id)} anchorOrigin={{ vertical: 'bottom', horizontal: language === 'ar' ? 'left' : 'right' }} transformOrigin={{ vertical: 'top', horizontal: language === 'ar' ? 'left' : 'right' }} MenuListProps={{ className: 'dark:bg-gray-800 dark:text-gray-200 shadow-lg rounded-md' }}>
                                                            <MenuItem onClick={() => handleViewDepartment(dept)} className="dark:hover:bg-gray-700 text-sm px-4 py-2"><Info className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />{t('common.viewDetails', 'View Details')}</MenuItem>
                                                            <MenuItem onClick={() => handleEditDepartment(dept)} className="dark:hover:bg-gray-700 text-sm px-4 py-2"><EditIcon fontSize="small" className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`} />{t('common.edit', 'Edit')}</MenuItem>
                                                            <MenuItem onClick={() => handleAddHead(dept)} className="dark:hover:bg-gray-700 text-sm px-4 py-2"><PersonAddIcon fontSize="small" className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`} />{t('departments.menu.addHead', 'Add Head')}</MenuItem>
                                                            <MenuItem onClick={() => handleAddEmployee(dept)} className="dark:hover:bg-gray-700 text-sm px-4 py-2"><PersonAddIcon fontSize="small" className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`} />{t('departments.menu.addEmployee', 'Add Employee')}</MenuItem>
                                                            <MenuItem onClick={() => handleDeleteDepartment(dept._id)} className="dark:hover:bg-gray-700 text-red-500 dark:text-red-400 text-sm px-4 py-2"><Users className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />{t('common.delete', 'Delete')}</MenuItem>
                                                        </Menu>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={departmentTableColumns.length} className="text-center py-16 text-gray-500 dark:text-gray-400">{searchText ? t('common.noSearchResults', "No results found.") : t('departments.noDepartments', "No departments available.")}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {isLoadingMoreDepartments && <div className="text-center py-8"><div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3 rtl:ml-3 rtl:mr-0"></div>{t('common.loadingMore', 'Loading more...')}</div></div>}
                            {!isLoadingMoreDepartments && !loading && displayCountDepartments >= filteredDepartmentsForDisplay.length && filteredDepartmentsForDisplay.length > ROWS_PER_PAGE && <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('common.endOfResults', "You've reached the end.")}</div>}
                        </>
                    )}

                    {selectedTab === 1 && (
                        <>
                            <div className="mb-4">
                                <FormControl sx={{ m: 1, minWidth: 240, width: { xs: '100%', sm: 300 } }} size="small"
                                    className="dark:[&_.MuiOutlinedInput-root]:hover:border-gray-500 dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-indigo-500 dark:[&_.MuiOutlinedInput-notchedOutline]:border-gray-600 dark:[&_.MuiInputLabel-root]:text-gray-400 dark:[&_.MuiSelect-icon]:text-gray-400 dark:[&_.MuiSelect-select]:text-gray-200 dark:[&_.MuiInputLabel-root.Mui-focused]:text-indigo-400"
                                >
                                    <InputLabel id="department-filter-label">{t('employees.filterByDepartment', 'Filter by Department')}</InputLabel>
                                    <MUISelect
                                        labelId="department-filter-label"
                                        value={selectedDepartmentIdForEmployees}
                                        onChange={handleDepartmentSelectChange}
                                        label={t('employees.filterByDepartment', 'Filter by Department')}
                                    >
                                        <MenuItem value="all" className="dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">{t('employees.allEmployees', 'All Employees')}</MenuItem>
                                        {allDepartments.map((dept) => (
                                            <MenuItem key={dept._id} value={dept._id} className="dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">{dept.name}</MenuItem>
                                        ))}
                                    </MUISelect>
                                </FormControl>
                            </div>
                            <div className="overflow-x-auto hide-scrollbar">
                                <table id="employees-table" className="w-full text-sm text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                                        <tr>
                                            {employeeTableColumns.map(col => (
                                                <th key={col.key} scope="col"
                                                    className={`group px-6 py-3 ${col.align === 'right' ? 'text-right' : (language === 'ar' ? 'text-right' : 'text-left')} ${col.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}`}
                                                    onClick={() => col.sortable && requestSort(col.key, 'employees')}
                                                >
                                                    <div className="flex items-center">
                                                        <span>{col.label}</span>
                                                        {col.sortable && getSortIcon(col.key, 'employees')}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingEmployees && visibleEmployees.length === 0 ? (
                                            <tr><td colSpan={employeeTableColumns.length} className="text-center py-16">
                                                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3 rtl:ml-3 rtl:mr-0"></div>{t('common.loading', 'Loading...')}
                                                </div>
                                            </td></tr>
                                        ) : visibleEmployees.length > 0 ? (
                                            visibleEmployees.map((emp) => {
                                                const departmentOfEmployee = allDepartments.find(d => d.employees?.some(e => e._id === emp.id) || d.headOfEmployee?._id === emp.id);
                                                return (
                                                    <tr key={emp.id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-[rgb(255,255,255)]">{emp.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{emp.email}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{emp.role || '—'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{emp.status || '—'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{emp.departmentName || departmentOfEmployee?.name || t('employees.notAssigned', 'N/A')}</td>
                                                        <td className={`px-6 py-4 ${employeeTableColumns.find(c => c.key === 'actions')?.align === 'right' ? 'text-right' : (language === 'ar' ? 'text-left' : 'text-right')}`}>
                                                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, emp.id)} className="dark:text-black hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1">
                                                                <MoreVertIcon fontSize="small" />
                                                            </IconButton>
                                                            <Menu anchorEl={anchorEls[emp.id]} open={Boolean(anchorEls[emp.id])} onClose={() => handleMenuClose(emp.id)} anchorOrigin={{ vertical: 'bottom', horizontal: language === 'ar' ? 'left' : 'right' }} transformOrigin={{ vertical: 'top', horizontal: language === 'ar' ? 'left' : 'right' }} MenuListProps={{ className: 'dark:bg-gray-800 dark:text-gray-200 shadow-lg rounded-md' }}>
                                                                {/* Add Edit/Delete for employee if needed */}
                                                                <MenuItem onClick={() => handleRemoveEmployee(departmentOfEmployee?._id, emp.id, emp)} className="dark:hover:bg-gray-700 text-red-500 dark:text-red-400 text-sm px-4 py-2"><Users className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />{t('common.remove', 'Remove')}</MenuItem>
                                                            </Menu>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr><td colSpan={employeeTableColumns.length} className="text-center py-16 text-gray-500 dark:text-gray-400">{searchText ? t('common.noSearchResults', "No results found.") : t('employees.noEmployees', "No employees available.")}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {isLoadingMoreEmployees && <div className="text-center py-8"><div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3 rtl:ml-3 rtl:mr-0"></div>{t('common.loadingMore', 'Loading more...')}</div></div>}
                            {!isLoadingMoreEmployees && !loadingEmployees && displayCountEmployees >= filteredEmployeesForDisplay.length && filteredEmployeesForDisplay.length > ROWS_PER_PAGE && <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('common.endOfResults', "You've reached the end.")}</div>}
                        </>
                    )}
                </div>

            </div>



            {showDepartmentDetails && selectedDepartment && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300"
                    onClick={() => setShowDepartmentDetails(false)}
                >
                    <div
                        className="bg-[rgb(255,255,255)] dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300"
                        onClick={e => e.stopPropagation()}
                        dir={language === "ar" ? "rtl" : "ltr"}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {t('departments.detailsTitle', 'Department Details')}
                            </h2>
                            <button
                                onClick={() => setShowDepartmentDetails(false)}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 space-y-6 overflow-y-auto hide-scrollbar">
                            {/* Main Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                {/* Name */}
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('departments.table.name', 'Name')}</p>
                                    <p className="mt-1 text-base font-semibold text-gray-800 dark:text-gray-200">{selectedDepartment.name}</p>
                                </div>
                                {/* Head of Department */}
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('departments.table.head', 'Head')}</p>
                                    <p className="mt-1 text-base text-gray-700 dark:text-gray-300">{selectedDepartment.headOfEmployee?.name || '—'}</p>
                                </div>
                                {/* Description */}
                                <div className="sm:col-span-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('departments.table.description', 'Description')}</p>
                                    <p className="mt-1 text-base text-gray-700 dark:text-gray-300">{selectedDepartment.description || '—'}</p>
                                </div>
                            </div>

                            {/* Employees Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="text-gray-500 dark:text-gray-400" size={20} />
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('departments.details.employees', 'Employees')}
                                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">({selectedDepartment.employees?.length || 0})</span>
                                    </h4>
                                </div>
                                {selectedDepartment.employees && selectedDepartment.employees.length > 0 ? (
                                    <div className="border rounded-md border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {selectedDepartment.employees.map(emp => (
                                                <li key={emp._id} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                    {emp.name} <span className="text-gray-500">({emp.email})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="px-4 py-3 text-sm text-center text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-md">{t('departments.details.noEmployees', 'No employees in this department.')}</p>
                                )}
                            </div>

                            {/* Permissions Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck className="text-gray-500 dark:text-gray-400" size={20} />
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('departments.details.permissions', 'Permissions')}</h4>
                                </div>
                                {selectedDepartment.permissions && selectedDepartment.permissions.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDepartment.permissions.map(perm => (
                                            <span key={perm} className="px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                                {perm}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="px-4 py-3 text-sm text-center text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-md">{t('departments.details.noPermissions', 'No specific permissions assigned.')}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setShowDepartmentDetails(false)}
                                className="px-5 py-2 text-sm font-medium text-gray-700 bg-[rgb(255,255,255)] border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:!border-none dark:hover:bg-gray-600"
                            >
                                {t('common.cancel', 'Close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {(showEditForm || (selectedTab === 0 && departmentFormData.name)) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => { setShowEditForm(false); setSelectedDepartment(null); setDepartmentFormData({ name: '', description: '', permissions: [] }); }}>
                    <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar" onClick={e => e.stopPropagation()} dir={language === "ar" ? "rtl" : "ltr"}>
                        <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark3">
                                {selectedDepartment ? t('departments.editTitle', 'Edit Department') : t('departments.addTitle', 'Add New Department')}
                            </h3>
                            <IconButton onClick={() => { setShowEditForm(false); setSelectedDepartment(null); setDepartmentFormData({ name: '', description: '', permissions: [] }); }} size="small" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-dark3">
                                <X size={20} />
                            </IconButton>
                        </div>
                        <form onSubmit={selectedDepartment ? handleUpdateDepartmentSubmit : handleAddDepartmentSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('departments.form.name', 'Department Name')}</label>
                                <input type="text" name="name" id="departmentName" value={departmentFormData.name} onChange={handleDepartmentFormChange} required
                                    className="p-3 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-md w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label htmlFor="departmentDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('departments.form.description', 'Description')}</label>
                                <textarea name="description" id="departmentDescription" value={departmentFormData.description} onChange={handleDepartmentFormChange} rows="3"
                                    className="p-3 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-md w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('departments.form.permissions', 'Permissions')}</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2  max-h-60 overflow-y-auto hide-scrollbar p-2 border dark:border-gray-700 rounded-md">
                                    {availablePermissions.map(permission => (
                                        <div key={permission} className="flex items-center">
                                            <input type="checkbox" id={`perm-${permission}`} name="permissions" value={permission}
                                                checked={departmentFormData.permissions?.includes(permission) || false}
                                                onChange={handleDepartmentFormChange}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:!border-none" />
                                            <label htmlFor={`perm-${permission}`} className="ml-2 rtl:mr-2 text-sm text-gray-700 dark:text-gray-300">{t(`permissions.${permission}`, permission)}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end px-4 gap-2 pt-4 border-t dark:border-gray-700">
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-[rgb(255,255,255)] bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {selectedDepartment ? t('common.saveChanges', 'Save Changes') : t('common.add', 'Add')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowEditForm(false); setSelectedDepartment(null); setDepartmentFormData({ name: '', description: '', permissions: [] }); }} className="px-6 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                                >
                                    {t("common.cancel", "Cancel")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAddEmployeeForm && selectedDepartment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowAddEmployeeForm(false)}>
                    <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()} dir={language === "ar" ? "rtl" : "ltr"}>
                        <div className="flex items-center justify-between pb-3 border-b dark:border-gray-700 mb-4 sticky top-0 bg-[rgb(255,255,255)] dark:bg-navbarBack z-10 px-0 pt-0">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark3">{t('departments.addEmployeeTo', 'Add Employee to {{departmentName}}', { departmentName: selectedDepartment.name })}</h3>
                            <IconButton onClick={() => setShowAddEmployeeForm(false)} size="small" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-dark3">
                                <X size={20} />
                            </IconButton>
                        </div>
                        <form onSubmit={handleAddEmployeeSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.name', 'Employee Name')}</label>
                                <input type="text" name="name" id="employeeName" value={employeeFormData.name} onChange={handleEmployeeFormChange} required
                                    className="p-3 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-md w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label htmlFor="employeeEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.email', 'Email')}</label>
                                <input type="email" name="email" id="employeeEmail" value={employeeFormData.email} onChange={handleEmployeeFormChange} required
                                    className="p-3 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-md w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label htmlFor="employeePassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.password', 'Password')}</label>
                                <input type="password" name="password" id="employeePassword" value={employeeFormData.password} onChange={handleEmployeeFormChange} required
                                    className="p-3 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-md w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            {/* <div className="flex justify-end gap-3 pt-4">
                                <MUIButton type="submit" variant="contained" color="primary" size="small" style={{ background: '#6C5FFC', color: '#fff' }}>{t('common.add', 'Add Employee')}</MUIButton>
                            </div> */}
                            <div className="flex justify-end px-4 gap-2 pt-4 border-t dark:border-gray-700">
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-[rgb(255,255,255)] bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {t('common.add', 'Add')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddEmployeeForm(false)}
                                    className="px-6 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                                >
                                    {t("common.cancel", "Cancel")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAddHeadForm && selectedDepartment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowAddHeadForm(false)}>
                    <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()} dir={language === "ar" ? "rtl" : "ltr"}>
                        <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark3">{t('departments.addHeadTo', 'Add Head to {{departmentName}}', { departmentName: selectedDepartment.name })}</h3>
                            <IconButton onClick={() => setShowAddHeadForm(false)} size="small" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-dark3">
                                <X size={20} />
                            </IconButton>
                        </div>
                        <form onSubmit={handleAddHeadSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="headName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.name', 'Head Name')}</label>
                                <input type="text" name="name" id="headName" value={headFormData.name} onChange={handleHeadFormChange} required
                                    className="p-3 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-md w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label htmlFor="headEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.email', 'Email')}</label>
                                <input type="email" name="email" id="headEmail" value={headFormData.email} onChange={handleHeadFormChange} required
                                    className="p-3 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-md w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label htmlFor="headPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.password', 'Password')}</label>
                                <input type="password" name="password" id="headPassword" value={headFormData.password} onChange={handleHeadFormChange} required
                                    className="p-3 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-md w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            {/* <div className="flex justify-end gap-3 pt-4">
                                <MUIButton type="submit" variant="contained" color="primary" size="small" style={{ background: '#6C5FFC', color: '#fff' }}>{t('common.add', 'Add Head')}</MUIButton>
                            </div> */}

                            <div className="flex justify-end px-4 gap-2 pt-4 border-t dark:border-gray-700">
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-[rgb(255,255,255)] bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {t('common.add', 'Add')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddHeadForm(false)}
                                    className="px-6 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                                >
                                    {t("common.cancel", "Cancel")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Departments;


