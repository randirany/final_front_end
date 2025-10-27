import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
    getPaymentsAndDebtsByAgent
} from '../services/insuranceApi';
import {
    Download,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt
} from 'lucide-react';
import DataTable from '../components/shared/DataTable';

const AgentStatement = () => {
    const { agentName } = useParams();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [statement, setStatement] = useState(null);
    const [insuranceList, setInsuranceList] = useState([]);

    // Fetch agent statement
    const fetchStatement = async () => {
        setLoading(true);
        try {
            const response = await getPaymentsAndDebtsByAgent(agentName);

            setStatement(response);
            // Add id field for DataTable compatibility
            const insurancesWithId = (response.insuranceList || []).map((insurance, index) => ({
                ...insurance,
                id: insurance._id || `insurance-${index}`
            }));
            setInsuranceList(insurancesWithId);
        } catch (error) {
            console.error('Error fetching agent statement:', error);
            toast.error(t('agent.messages.fetchError', 'Failed to load agent statement'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (agentName) {
            fetchStatement();
        }
    }, [agentName]);

    const exportToPDF = () => {
        // Implement PDF export functionality
        toast.info(t('common.comingSoon', 'Export to PDF coming soon'));
    };

    if (loading && !statement) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        {t('common.loading', 'Loading...')}
                    </p>
                </div>
            </div>
        );
    }

    if (!statement) {
        return (
            <div className="p-6">
                <p className="text-red-500">{t('agent.notFound', 'Agent statement not found')}</p>
            </div>
        );
    }

    const { agent, totalPaid, totalDebts } = statement;

    // Define table columns for insurance list
    const insuranceColumns = [
        {
            accessor: 'customer',
            header: t('common.customer', 'Customer'),
            sortable: true,
            render: (value) => (
                <span className="font-medium text-gray-900 dark:text-gray-300">{value}</span>
            )
        },
        {
            accessor: 'insuranceCompany',
            header: t('insurance.company', 'Insurance Company'),
            sortable: true,
            render: (value) => (
                <span className="text-gray-900 dark:text-gray-300">{value}</span>
            )
        },
        {
            accessor: 'insuranceType',
            header: t('insurance.type', 'Insurance Type'),
            sortable: true,
            render: (value) => (
                <span className="text-gray-900 dark:text-gray-300">{value}</span>
            )
        },
        {
            accessor: 'insuranceAmount',
            header: t('insurance.totalAmount', 'Total Amount'),
            sortable: true,
            align: 'right',
            render: (value) => (
                <span className="font-medium text-gray-900 dark:text-gray-300">
                    ₪{value?.toLocaleString() || '0'}
                </span>
            )
        },
        {
            accessor: 'paidAmount',
            header: t('insurance.paidAmount', 'Paid'),
            sortable: true,
            align: 'right',
            render: (value) => (
                <span className="font-medium text-green-600 dark:text-green-400">
                    ₪{value?.toLocaleString() || '0'}
                </span>
            )
        },
        {
            accessor: 'remainingDebt',
            header: t('insurance.remainingDebt', 'Remaining'),
            sortable: true,
            align: 'right',
            render: (value) => (
                <span className={`font-medium ${value > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    ₪{value?.toLocaleString() || '0'}
                </span>
            )
        },
        {
            accessor: 'paymentMethod',
            header: t('payment.method', 'Payment Method'),
            sortable: true,
            render: (value) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {value || t('common.notAssigned', 'N/A')}
                </span>
            )
        },
        {
            accessor: 'insuranceStartDate',
            header: t('insurance.startDate', 'Start Date'),
            sortable: true,
            render: (value) => value ? new Date(value).toLocaleDateString() : t('common.notAssigned', 'N/A')
        },
        {
            accessor: 'insuranceEndDate',
            header: t('insurance.endDate', 'End Date'),
            sortable: true,
            render: (value) => value ? new Date(value).toLocaleDateString() : t('common.notAssigned', 'N/A')
        }
    ];

    return (
        <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen">
            {/* Header */}
            <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">
                            {t('agent.statement.title', 'Agent Statement')} - {agent}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {t('agent.statement.subtitle', 'Insurance payments and debts overview')}
                        </p>
                    </div>
                    <button
                        onClick={exportToPDF}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-dark2 shadow-sm hover:shadow-md"
                    >
                        <Download className="w-4 h-4" />
                        {t('common.export', 'Export PDF')}
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {/* Total Paid */}
                    <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    {t('agent.summary.totalPaid', 'Total Paid')}
                                </p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                                    ₪{totalPaid?.toLocaleString() || '0'}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                                    {t('agent.summary.totalPaidHint', 'Total collected payments')}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    {/* Total Debts */}
                    <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                    {t('agent.summary.totalDebts', 'Total Debts')}
                                </p>
                                <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
                                    ₪{totalDebts?.toLocaleString() || '0'}
                                </p>
                                <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                                    {t('agent.summary.totalDebtsHint', 'Outstanding debts')}
                                </p>
                            </div>
                            <TrendingDown className="w-8 h-8 text-red-500" />
                        </div>
                    </div>

                    {/* Total Insurances */}
                    <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                    {t('agent.summary.totalInsurances', 'Total Insurances')}
                                </p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                                    {insuranceList.length}
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                                    {t('agent.summary.insurancesHint', 'Insurances sold')}
                                </p>
                            </div>
                            <Receipt className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Insurances Table */}
            <DataTable
                data={insuranceList}
                columns={insuranceColumns}
                title={t('agent.insurances.title', 'Insurances')}
                loading={loading}
                onRefresh={fetchStatement}
                enableSearch={true}
                enableExport={true}
            />
        </div>
    );
};

export default AgentStatement;
