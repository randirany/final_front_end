import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { Eye, Trash2, Edit } from 'lucide-react';
import Add_Agent from './Add_Agent';
import Edit_Agent from './Edit_Agent';
import { toast } from 'react-toastify';
import DataTable from './shared/DataTable';

export default function Agents() {
    const { t, i18n: { language } } = useTranslation();
    const navigate = useNavigate();
    const [allAgents, setAllAgents] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [loadingAgents, setLoadingAgents] = useState(true);

    const fetchAgents = async () => {
        setLoadingAgents(true);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get(`http://localhost:3002/api/v1/agents/all`, { headers: { token } });
            const agentsArray = res.data.getAll || [];
            const formatted = agentsArray.map(agent => ({
                id: agent._id,
                name: agent.name,
                email: agent.email,
                role: agent.role
            }));
            setAllAgents(formatted);
        } catch {
            setAllAgents([]);
            toast.error(t('agents.fetchError', 'Failed to fetch agents'));
        } finally {
            setLoadingAgents(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('agents.deleteConfirm', 'Are you sure you want to delete this agent?'))) {
            const token = `islam__${localStorage.getItem("token")}`;
            try {
                await axios.delete(`http://localhost:3002/api/v1/agents/deleteAgents/${id}`, { headers: { token } });
                toast.success(t('agents.deleteSuccess', 'Agent deleted successfully'));
                fetchAgents();
            } catch {
                toast.error(t('agents.deleteError', 'Failed to delete agent'));
            }
        }
    };

    const handleViewStatement = (agentName) => {
        navigate(`/agent-statement/${encodeURIComponent(agentName)}`);
    };

    const handleEdit = (agent) => {
        setSelectedAgent(agent);
        setShowEditForm(true);
    };

    // Define table columns for DataTable
    const agentColumns = [
        {
            accessor: 'name',
            header: t('agents.table.name', 'Agent Name'),
            sortable: true,
            render: (value) => (
                <span className="font-medium text-gray-900 dark:text-white">{value}</span>
            )
        },
        {
            accessor: 'email',
            header: t('agents.table.email', 'Email'),
            sortable: true,
            render: (value) => (
                <span className="text-gray-600 dark:text-gray-400">{value}</span>
            )
        },
        {
            accessor: 'role',
            header: t('agents.table.role', 'Role'),
            sortable: true,
            render: (value) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {value}
                </span>
            )
        },
        {
            accessor: 'actions',
            header: t('agents.table.actions', 'Actions'),
            align: 'center',
            render: (value, row) => (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => handleViewStatement(row.name)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                        title={t('agents.viewStatement', 'View Statement')}
                    >
                        <Eye className="w-4 h-4" />
                        {t('agents.viewStatement', 'Statement')}
                    </button>
                    <button
                        onClick={() => handleEdit(row)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title={t('common.edit', 'Edit')}
                    >
                        <Edit className="w-4 h-4" />
                        {t('common.edit', 'Edit')}
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title={t('common.delete', 'Delete')}
                    >
                        <Trash2 className="w-4 h-4" />
                        {t('common.delete', 'Delete')}
                    </button>
                </div>
            )
        }
    ];

    useEffect(() => {
        fetchAgents();
    }, []);

    return (
        <div className="py-6 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
            {/* Header */}
            <div className="bg-white dark:bg-navbarBack rounded-2xl shadow-sm p-4 mb-6">
                <div className="flex gap-2 items-center text-sm mb-4">
                    <NavLink to="/home" className="hover:underline text-[#6C5FFC] font-medium">
                        {t('breadcrumbs.home', 'Home')}
                    </NavLink>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {t('breadcrumbs.agents', 'Agents')}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {t('agents.pageTitle', 'Agents')}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {t('agents.pageSubtitle', 'Manage your agents')}
                        </p>
                    </div>

                    <Button
                        variant="contained"
                        onClick={() => setShowAddForm(true)}
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
                        {t('agents.addButton', 'Add Agent')}
                    </Button>
                </div>
            </div>

            {/* Agents Table */}
            <DataTable
                data={allAgents}
                columns={agentColumns}
                title={t('agents.tableTitle', 'Agents List')}
                loading={loadingAgents}
                onRefresh={fetchAgents}
                enableSearch={true}
                enableExport={true}
            />

            <Add_Agent isOpen={showAddForm} onClose={() => { setShowAddForm(false); fetchAgents(); }} />
            <Edit_Agent
                isOpen={showEditForm}
                onClose={() => {
                    setShowEditForm(false);
                    setSelectedAgent(null);
                }}
                onAgentUpdated={fetchAgents}
                agent={selectedAgent}
            />
        </div>
    );
}