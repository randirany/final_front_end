import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { userApi } from '../services/userApi';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select as MUISelect,
  MenuItem,
  IconButton,
  Menu,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Users,
  User,
  Building2,
  UserPlus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Shield,
  X,
  TrendingUp,
  Key
} from 'lucide-react';
import DataTable from './shared/DataTable';

function DepartmentsNew() {
  const { t, i18n: { language } } = useTranslation();
  const isRTL = language === 'ar' || language === 'he';

  // State
  const [selectedTab, setSelectedTab] = useState(0);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allSystemEmployees, setAllSystemEmployees] = useState([]);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [selectedDepartmentIdForEmployees, setSelectedDepartmentIdForEmployees] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Modals
  const [showDepartmentDetails, setShowDepartmentDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [showAddHeadForm, setShowAddHeadForm] = useState(false);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Forms
  const [departmentFormData, setDepartmentFormData] = useState({ name: '', description: '', permissions: [] });
  const [employeeFormData, setEmployeeFormData] = useState({ name: '', email: '', password: '' });
  const [headFormData, setHeadFormData] = useState({ name: '', email: '', password: '' });
  const [resetPasswordFormData, setResetPasswordFormData] = useState({ newPassword: '' });

  // Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);

  // Permissions
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Fetch Data
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const res = await axios.get('http://localhost:3002/api/v1/department/all', {
        headers: { token }
      });
      const fetchedDepartments = res.data.departments || [];
      setAllDepartments(fetchedDepartments);

      // Collect all employees
      let allEmps = [];
      fetchedDepartments.forEach(dept => {
        if (dept.headOfEmployee) {
          allEmps.push({ ...dept.headOfEmployee, departmentName: dept.name, id: dept.headOfEmployee._id, departmentId: dept._id, isHead: true });
        }
        if (dept.employees && dept.employees.length) {
          dept.employees.forEach(emp => {
            allEmps.push({ ...emp, departmentName: dept.name, id: emp._id, departmentId: dept._id, isHead: false });
          });
        }
      });
      const uniqueEmployees = Array.from(new Set(allEmps.map(e => e.id))).map(id => allEmps.find(e => e.id === id));
      setAllSystemEmployees(uniqueEmployees);
      if (selectedDepartmentIdForEmployees === 'all') {
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

  const fetchPermissions = async () => {
    setLoadingPermissions(true);
    try {
      const res = await axios.get('http://localhost:3002/api/v1/user/permissions/all');
      const permissionsData = res.data.data.permissions || [];
      const groupedData = res.data.data.groupedPermissions || {};
      const categoriesData = res.data.data.categories || [];

      setAvailablePermissions(permissionsData);
      setGroupedPermissions(groupedData);
      setCategories(categoriesData);
    } catch (err) {
      toast.error(t('permissions.fetchError', 'Failed to fetch permissions.'));
      setAvailablePermissions([]);
      setGroupedPermissions({});
      setCategories([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const fetchEmployeesByDepartment = async (departmentId) => {
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
        departmentName: department?.name || t('common.notAvailable', 'N/A'),
        departmentId: departmentId,
        isHead: false
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
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (selectedTab === 1) {
      fetchEmployeesByDepartment(selectedDepartmentIdForEmployees);
    }
  }, [selectedDepartmentIdForEmployees, selectedTab, allSystemEmployees]);

  // Statistics
  const stats = {
    totalDepartments: allDepartments.length,
    totalEmployees: allSystemEmployees.length,
    averageEmployeesPerDept: allDepartments.length > 0
      ? Math.round(allSystemEmployees.length / allDepartments.length * 10) / 10
      : 0,
    departmentsWithHeads: allDepartments.filter(d => d.headOfEmployee).length
  };

  // Table Columns for Departments
  const departmentColumns = [
    {
      accessor: 'name',
      header: t('departments.table.name', 'Department Name'),
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
        </div>
      )
    },
    {
      accessor: 'description',
      header: t('departments.table.description', 'Description'),
      sortable: true,
      render: (value) => (
        <span className="text-gray-600 dark:text-gray-400 max-w-xs truncate block" title={value}>
          {value || '—'}
        </span>
      )
    },
    {
      accessor: 'headOfEmployee',
      header: t('departments.table.head', 'Head of Department'),
      sortable: true,
      render: (value) => value?.name ? (
        <div className="flex items-center gap-2">
          <div className="bg-green-100 dark:bg-green-900 p-1.5 rounded-full">
            <User className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-gray-700 dark:text-gray-300">{value.name}</span>
        </div>
      ) : (
        <span className="text-gray-400 italic">—</span>
      )
    },
    {
      accessor: 'employees',
      header: t('departments.table.employeeCount', 'Employees'),
      sortable: true,
      render: (value) => (
        <Chip
          label={value?.length || 0}
          size="small"
          sx={{
            background: 'linear-gradient(135deg, #6C5FFC 0%, #5a4fd8 100%)',
            color: 'white',
            fontWeight: 600
          }}
        />
      )
    },
    {
      accessor: 'actions',
      header: t('departments.table.actions', 'Actions'),
      align: isRTL ? 'left' : 'right',
      render: (value, row) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setMenuRow(row);
            setAnchorEl(e.currentTarget);
          }}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <MoreVertical className="w-4 h-4" />
        </IconButton>
      )
    }
  ];

  // Table Columns for Employees
  const employeeColumns = [
    {
      accessor: 'name',
      header: t('employees.table.name', 'Name'),
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className={`${row.isHead ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-blue-100 dark:bg-blue-900'} p-2 rounded-full`}>
            <User className={`w-4 h-4 ${row.isHead ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`} />
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">{value}</div>
            {row.isHead && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {t('employees.headOfDepartment', 'Head')}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      accessor: 'email',
      header: t('employees.table.email', 'Email'),
      sortable: true,
      render: (value) => (
        <span className="text-gray-600 dark:text-gray-400">{value}</span>
      )
    },
    {
      accessor: 'role',
      header: t('employees.table.role', 'Role'),
      sortable: true,
      render: (value) => (
        <Chip
          label={value || t('employees.roleEmployee', 'Employee')}
          size="small"
          color={value === 'HeadOfEmployee' ? 'warning' : 'default'}
        />
      )
    },
    {
      accessor: 'departmentName',
      header: t('employees.table.department', 'Department'),
      sortable: true,
      render: (value) => (
        <span className="text-gray-700 dark:text-gray-300">{value || '—'}</span>
      )
    },
    {
      accessor: 'actions',
      header: t('employees.table.actions', 'Actions'),
      align: isRTL ? 'left' : 'right',
      render: (value, row) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setMenuRow(row);
            setAnchorEl(e.currentTarget);
          }}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <MoreVertical className="w-4 h-4" />
        </IconButton>
      )
    }
  ];

  // Handlers
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  const handleViewDepartment = (department) => {
    setSelectedDepartment(department);
    setShowDepartmentDetails(true);
    handleMenuClose();
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setDepartmentFormData({
      name: department.name,
      description: department.description || '',
      permissions: department.permissions || []
    });
    setShowEditForm(true);
    handleMenuClose();
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
    handleMenuClose();
  };

  const handleAddEmployee = (department) => {
    setSelectedDepartment(department);
    setShowAddEmployeeForm(true);
    handleMenuClose();
  };

  const handleAddHead = (department) => {
    setSelectedDepartment(department);
    setShowAddHeadForm(true);
    handleMenuClose();
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
          fetchEmployeesByDepartment(selectedDepartmentIdForEmployees);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || t('departments.removeUserError', 'Error removing user.'));
      }
    }
    handleMenuClose();
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
      setShowEditForm(false);
      setDepartmentFormData({ name: '', description: '', permissions: [] });
    } catch (err) {
      toast.error(err.response?.data?.message || t('departments.addError', 'Error adding department.'));
    }
  };

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

  const handleResetPassword = (employee) => {
    setSelectedEmployee(employee);
    setShowResetPasswordForm(true);
    handleMenuClose();
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetPasswordFormData.newPassword || resetPasswordFormData.newPassword.length < 7) {
      toast.error(t('employees.validation.passwordMinLength', "Password must be at least 7 characters long."));
      return;
    }
    try {
      const result = await userApi.resetEmployeePassword(selectedEmployee.id, resetPasswordFormData.newPassword);
      toast.success(result.message || t('employees.resetPasswordSuccess', 'Password reset successfully.'));
      setShowResetPasswordForm(false);
      setSelectedEmployee(null);
      setResetPasswordFormData({ newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || t('employees.resetPasswordError', 'Error resetting password.'));
    }
  };

  return (
    <div className="py-6 px-4 dark:bg-dark2 min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <ToastContainer position="top-right" autoClose={3000} rtl={isRTL} theme="colored" />

      {/* Header */}
      <div className="bg-white dark:bg-navbarBack rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex gap-2 items-center text-sm mb-4">
          <NavLink to="/home" className="hover:underline text-[#6C5FFC] font-medium">
            {t('breadcrumbs.home', 'Home')}
          </NavLink>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            {t('breadcrumbs.departmentsAndUsers', 'Users & Departments')}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#6C5FFC] to-[#5a4fd8] p-3 rounded-xl">
                <Users className="w-7 h-7 text-white" />
              </div>
              {t('departments.pageTitle', 'Departments & Employees')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('departments.pageSubtitle', 'Manage your organization structure')}
            </p>
          </div>

          {selectedTab === 0 && (
            <Button
              variant="contained"
              startIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => {
                setSelectedDepartment(null);
                setDepartmentFormData({ name: '', description: '', permissions: [] });
                setShowEditForm(true);
              }}
              sx={{
                background: 'linear-gradient(135deg, #6C5FFC 0%, #5a4fd8 100%)',
                color: '#fff',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a4fd8 0%, #4a3fc8 100%)',
                }
              }}
            >
              {t('departments.addButton', 'Add Department')}
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="dark:bg-navbarBack shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mb-1">
                  {t('departments.stats.total', 'Total Departments')}
                </Typography>
                <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                  {stats.totalDepartments}
                </Typography>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-navbarBack shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mb-1">
                  {t('employees.stats.total', 'Total Employees')}
                </Typography>
                <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                  {stats.totalEmployees}
                </Typography>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-navbarBack shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mb-1">
                  {t('departments.stats.withHeads', 'With Heads')}
                </Typography>
                <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                  {stats.departmentsWithHeads}
                </Typography>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-navbarBack shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mb-1">
                  {t('departments.stats.average', 'Avg per Dept')}
                </Typography>
                <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                  {stats.averageEmployeesPerDept}
                </Typography>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Table */}
      <Card className="dark:bg-navbarBack shadow-xl border-0 rounded-2xl overflow-hidden">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            sx={{
              px: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64
              },
              '& .Mui-selected': {
                color: '#6C5FFC !important'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#6C5FFC',
                height: 3
              }
            }}
          >
            <Tab
              icon={<Building2 className="w-5 h-5" />}
              iconPosition="start"
              label={t('departments.tabDepartments', 'Departments')}
            />
            <Tab
              icon={<User className="w-5 h-5" />}
              iconPosition="start"
              label={t('departments.tabEmployees', 'Employees')}
            />
          </Tabs>
        </Box>

        <CardContent className="p-6">
          {selectedTab === 0 ? (
            <DataTable
              data={allDepartments}
              columns={departmentColumns}
              title={t('departments.tableTitle', 'Departments')}
              loading={loading}
              onRefresh={fetchDepartments}
              enableSearch={true}
              enableExport={true}
            />
          ) : (
            <>
              <FormControl sx={{ mb: 3, minWidth: 240 }} size="small">
                <InputLabel>{t('employees.filterByDepartment', 'Filter by Department')}</InputLabel>
                <MUISelect
                  value={selectedDepartmentIdForEmployees}
                  onChange={(e) => setSelectedDepartmentIdForEmployees(e.target.value)}
                  label={t('employees.filterByDepartment', 'Filter by Department')}
                >
                  <MenuItem value="all">{t('employees.allEmployees', 'All Employees')}</MenuItem>
                  {allDepartments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                  ))}
                </MUISelect>
              </FormControl>

              <DataTable
                data={departmentEmployees}
                columns={employeeColumns}
                title={t('employees.tableTitle', 'Employees')}
                loading={loadingEmployees}
                onRefresh={() => fetchEmployeesByDepartment(selectedDepartmentIdForEmployees)}
                enableSearch={true}
                enableExport={true}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: isRTL ? 'left' : 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: isRTL ? 'left' : 'right', vertical: 'bottom' }}
      >
        {selectedTab === 0 && menuRow ? (
          [
            <MenuItem key="view" onClick={() => handleViewDepartment(menuRow)}>
              <Eye className="w-4 h-4 mr-2" />
              {t('common.viewDetails', 'View Details')}
            </MenuItem>,
            <MenuItem key="edit" onClick={() => handleEditDepartment(menuRow)}>
              <Edit className="w-4 h-4 mr-2" />
              {t('common.edit', 'Edit')}
            </MenuItem>,
            <MenuItem key="addHead" onClick={() => handleAddHead(menuRow)}>
              <UserPlus className="w-4 h-4 mr-2" />
              {t('departments.menu.addHead', 'Add Head')}
            </MenuItem>,
            <MenuItem key="addEmployee" onClick={() => handleAddEmployee(menuRow)}>
              <UserPlus className="w-4 h-4 mr-2" />
              {t('departments.menu.addEmployee', 'Add Employee')}
            </MenuItem>,
            <MenuItem key="delete" onClick={() => handleDeleteDepartment(menuRow._id)} sx={{ color: 'error.main' }}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t('common.delete', 'Delete')}
            </MenuItem>
          ]
        ) : (
          menuRow && [
            <MenuItem key="resetPassword" onClick={() => handleResetPassword(menuRow)}>
              <Key className="w-4 h-4 mr-2" />
              {t('employees.menu.resetPassword', 'Reset Password')}
            </MenuItem>,
            <MenuItem key="remove" onClick={() => handleRemoveEmployee(menuRow.departmentId, menuRow.id, menuRow)} sx={{ color: 'error.main' }}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t('common.remove', 'Remove')}
            </MenuItem>
          ]
        )}
      </Menu>

      {/* Details Dialog */}
      {showDepartmentDetails && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDepartmentDetails(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('departments.detailsTitle', 'Department Details')}
              </h2>
              <button
                onClick={() => setShowDepartmentDetails(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {selectedDepartment && (
                <>
                  {/* Department Info */}
                  <div className="bg-white dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t('departments.table.name', 'Department Information')}
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          {t('departments.table.name', 'Name')}:
                        </span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {selectedDepartment.name}
                        </span>
                      </div>
                      {selectedDepartment.description && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            {t('departments.table.description', 'Description')}:
                          </span>
                          <p className="mt-1 text-gray-900 dark:text-white">
                            {selectedDepartment.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Head of Department */}
                  {selectedDepartment.headOfEmployee && (
                    <div className="bg-white dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {t('departments.table.head', 'Head of Department')}
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            {t('employees.table.name', 'Name')}:
                          </span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {selectedDepartment.headOfEmployee.name}
                          </span>
                        </div>
                        {selectedDepartment.headOfEmployee.email && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              {t('employees.table.email', 'Email')}:
                            </span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {selectedDepartment.headOfEmployee.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Employees */}
                  <div className="bg-white dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t('departments.details.employees', 'Employees')}
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                          ({selectedDepartment.employees?.length || 0})
                        </span>
                      </h3>
                    </div>
                    {selectedDepartment.employees && selectedDepartment.employees.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedDepartment.employees.map(emp => (
                          <span
                            key={emp._id}
                            className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-sm text-blue-700 dark:text-blue-300"
                          >
                            {emp.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {t('departments.details.noEmployees', 'No employees in this department')}
                      </p>
                    )}
                  </div>

                  {/* Permissions */}
                  {selectedDepartment.permissions && selectedDepartment.permissions.length > 0 && (
                    <div className="bg-white dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {t('departments.details.permissions', 'Permissions')}
                          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                            ({selectedDepartment.permissions.length})
                          </span>
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedDepartment.permissions.map(perm => (
                          <span
                            key={perm}
                            className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded text-xs text-purple-700 dark:text-purple-300 font-medium"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDepartmentDetails(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Department Modal */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" onClick={() => {
          setShowEditForm(false);
          setSelectedDepartment(null);
          setDepartmentFormData({ name: '', description: '', permissions: [] });
        }}>
          <div
            className="w-full max-w-2xl bg-white rounded-lg shadow-xl dark:bg-navbarBack max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedDepartment ? t('departments.editTitle', 'Edit Department') : t('departments.addTitle', 'Add New Department')}
              </h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedDepartment(null);
                  setDepartmentFormData({ name: '', description: '', permissions: [] });
                }}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <form onSubmit={selectedDepartment ? handleUpdateDepartmentSubmit : handleAddDepartmentSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Department Name */}
                <div>
                  <label htmlFor="dept_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('departments.form.name', 'Department Name')}
                  </label>
                  <input
                    type="text"
                    id="dept_name"
                    name="name"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={departmentFormData.name}
                    onChange={(e) => setDepartmentFormData({ ...departmentFormData, name: e.target.value })}
                    placeholder={t('departments.form.namePlaceholder', 'Enter department name')}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="dept_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('departments.form.description', 'Description')}
                  </label>
                  <textarea
                    id="dept_description"
                    name="description"
                    rows="3"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    value={departmentFormData.description}
                    onChange={(e) => setDepartmentFormData({ ...departmentFormData, description: e.target.value })}
                    placeholder={t('departments.form.descriptionPlaceholder', 'Enter department description')}
                  />
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('departments.form.permissions', 'Permissions')}
                  </label>
                  {loadingPermissions ? (
                    <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-center">
                      <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                        {t('permissions.loading', 'Loading permissions...')}
                      </Typography>
                    </div>
                  ) : availablePermissions.length === 0 ? (
                    <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-center">
                      <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                        {t('permissions.noPermissions', 'No permissions available')}
                      </Typography>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700">
                      <div className="p-4 space-y-4">
                        {categories.map(category => (
                          <div key={category} className="space-y-2">
                            {/* Category Header */}
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-1.5 rounded-lg">
                                <Shield className="w-3.5 h-3.5 text-white" />
                              </div>
                              <Typography variant="subtitle2" className="font-semibold text-gray-900 dark:text-white">
                                {t(`permissions.categories.${category}`, category)}
                              </Typography>
                              <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                                ({groupedPermissions[category]?.length || 0})
                              </Typography>
                            </div>

                            {/* Permissions Grid */}
                            <div className="grid grid-cols-2 gap-2 pl-2">
                              {groupedPermissions[category]?.map(permission => (
                                <div key={permission.key} className="flex items-start gap-2">
                                  <input
                                    type="checkbox"
                                    id={`perm-${permission.key}`}
                                    checked={departmentFormData.permissions?.includes(permission.key) || false}
                                    onChange={(e) => {
                                      const updatedPermissions = e.target.checked
                                        ? [...(departmentFormData.permissions || []), permission.key]
                                        : departmentFormData.permissions.filter(p => p !== permission.key);
                                      setDepartmentFormData({ ...departmentFormData, permissions: updatedPermissions });
                                    }}
                                    className="mt-0.5 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:border-gray-500 dark:bg-gray-600 cursor-pointer"
                                  />
                                  <label
                                    htmlFor={`perm-${permission.key}`}
                                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer leading-tight"
                                  >
                                    {t(`permissions.labels.${permission.key}`, permission.label)}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-2 border-t dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedDepartment(null);
                    setDepartmentFormData({ name: '', description: '', permissions: [] });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedDepartment ? t('common.saveChanges', 'Save Changes') : t('common.add', 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployeeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" onClick={() => setShowAddEmployeeForm(false)}>
          <div
            className="w-full max-w-lg bg-white rounded-lg shadow-xl dark:bg-navbarBack max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('departments.addEmployeeTo', 'Add Employee to')} {selectedDepartment?.name}
              </h2>
              <button
                onClick={() => setShowAddEmployeeForm(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="p-4 space-y-4">
              <div className="space-y-4">
                {/* Employee Name */}
                <div>
                  <label htmlFor="emp_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('employees.name', 'Employee Name')}
                  </label>
                  <input
                    type="text"
                    id="emp_name"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={employeeFormData.name}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, name: e.target.value })}
                    placeholder={t('employees.namePlaceholder', 'Enter employee name')}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="emp_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('employees.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    id="emp_email"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={employeeFormData.email}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                    placeholder={t('employees.emailPlaceholder', 'Enter email address')}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="emp_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('employees.password', 'Password')}
                  </label>
                  <input
                    type="password"
                    id="emp_password"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={employeeFormData.password}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, password: e.target.value })}
                    placeholder={t('employees.passwordPlaceholder', 'Enter password')}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-2 border-t dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {t('common.add', 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Head Modal */}
      {showAddHeadForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" onClick={() => setShowAddHeadForm(false)}>
          <div
            className="w-full max-w-lg bg-white rounded-lg shadow-xl dark:bg-navbarBack max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('departments.addHeadTo', 'Add Head to')} {selectedDepartment?.name}
              </h2>
              <button
                onClick={() => setShowAddHeadForm(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <form onSubmit={handleAddHeadSubmit} className="p-4 space-y-4">
              <div className="space-y-4">
                {/* Head Name */}
                <div>
                  <label htmlFor="head_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('employees.name', 'Head Name')}
                  </label>
                  <input
                    type="text"
                    id="head_name"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={headFormData.name}
                    onChange={(e) => setHeadFormData({ ...headFormData, name: e.target.value })}
                    placeholder={t('employees.namePlaceholder', 'Enter head name')}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="head_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('employees.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    id="head_email"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={headFormData.email}
                    onChange={(e) => setHeadFormData({ ...headFormData, email: e.target.value })}
                    placeholder={t('employees.emailPlaceholder', 'Enter email address')}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="head_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('employees.password', 'Password')}
                  </label>
                  <input
                    type="password"
                    id="head_password"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={headFormData.password}
                    onChange={(e) => setHeadFormData({ ...headFormData, password: e.target.value })}
                    placeholder={t('employees.passwordPlaceholder', 'Enter password')}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-2 border-t dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => setShowAddHeadForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {t('common.add', 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordForm && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" onClick={() => {
          setShowResetPasswordForm(false);
          setSelectedEmployee(null);
          setResetPasswordFormData({ newPassword: '' });
        }}>
          <div
            className="w-full max-w-lg bg-white rounded-lg shadow-xl dark:bg-navbarBack max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-600 bg-gradient-to-r from-purple-500 to-indigo-600">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {t('employees.resetPasswordTitle', 'Reset Password')}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowResetPasswordForm(false);
                  setSelectedEmployee(null);
                  setResetPasswordFormData({ newPassword: '' });
                }}
                className="p-2 rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              {/* Employee Info */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                  {t('employees.table.name', 'Employee')}
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`${selectedEmployee.isHead ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-blue-100 dark:bg-blue-900'} p-2 rounded-full`}>
                    <User className={`w-4 h-4 ${selectedEmployee.isHead ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`} />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-semibold">{selectedEmployee.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedEmployee.email}</p>
                  </div>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('employees.newPassword', 'New Password')}
                </label>
                <input
                  type="password"
                  id="new_password"
                  className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={resetPasswordFormData.newPassword}
                  onChange={(e) => setResetPasswordFormData({ newPassword: e.target.value })}
                  placeholder={t('employees.newPasswordPlaceholder', 'Enter new password (min 7 characters)')}
                  required
                  minLength={7}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('employees.passwordRequirement', 'Password must be at least 7 characters long')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-2 border-t dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPasswordForm(false);
                    setSelectedEmployee(null);
                    setResetPasswordFormData({ newPassword: '' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  {t('employees.resetPassword', 'Reset Password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentsNew;
