import { useEffect, useMemo, useState, useCallback } from 'react';
import { IconButton, Menu, MenuItem, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { NavLink } from 'react-router-dom';
import Add_Agent from './Add_Agent';
import { toast } from 'react-toastify';

const ROWS_PER_PAGE = 10;

export default function Agents() {
    const { t, i18n: { language } } = useTranslation();
    const [allAgents, setAllAgents] = useState([]);
    const [displayCount, setDisplayCount] = useState(ROWS_PER_PAGE);
    const [anchorEls, setAnchorEls] = useState({});
    const [searchText, setSearchText] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [loadingAgents, setLoadingAgents] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [sortConfig, setSortConfig] = useState({
        key: 'name',
        direction: 'ascending'
    });

    const tableHeaders = useMemo(() => [
        { key: 'name', label: t('agents.table.name', 'Agents name') },
        { key: 'email', label: t('agents.table.email', 'Agents email') },
        { key: 'role', label: t('agents.table.role', 'Agents role') },
        { key: 'actions', label: t('agents.table.actions', 'Actions'), align: language === 'ar' ? 'left' : 'right' },
    ], [t, language]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key === columnKey) {
            return sortConfig.direction === 'ascending'
                ? <ArrowUpwardIcon fontSize="small" className="ml-1 rtl:mr-1 rtl:ml-0" />
                : <ArrowDownwardIcon fontSize="small" className="ml-1 rtl:mr-1 rtl:ml-0" />;
        }
        return null;
    };

    const sortedData = useMemo(() => {
        let sortableItems = [...allAgents];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                if (String(aVal).toLowerCase() < String(bVal).toLowerCase()) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (String(aVal).toLowerCase() > String(bVal).toLowerCase()) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [allAgents, sortConfig]);

    const filteredAgents = useMemo(() => {
        if (!searchText) return sortedData;
        const lowerSearch = searchText.toLowerCase();
        return sortedData.filter(agent =>
            Object.values(agent).some(val =>
                String(val).toLowerCase().includes(lowerSearch)
            )
        );
    }, [sortedData, searchText]);

    const visibleAgents = useMemo(() => {
        return filteredAgents.slice(0, displayCount);
    }, [filteredAgents, displayCount]);

    const handleExportExcel = () => {
        if (filteredAgents.length === 0) {
            toast.info(t('common.noDataToExport', 'No data to export.'));
            return;
        }
        const exportData = filteredAgents.map(agent => ({
            [t('agents.table.name')]: agent.name,
            [t('agents.table.email')]: agent.email,
            [t('agents.table.role')]: agent.role,
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t('agents.exportSheetagent', 'Agents'));
        XLSX.writeFile(workbook, t('agents.exportExcelFileagents', 'agents_report.xlsx'));
    };

    const handleExportCSV = () => {
        if (filteredAgents.length === 0) {
            toast.info(t('common.noDataToExport', 'No data to export.'));
            return;
        }
        const headers = tableHeaders.filter(h => h.key !== 'actions').map(h => h.label);
        const csvRows = [
            headers.join(','),
            ...filteredAgents.map(agent => {
                return [
                    `"${agent.name.replace(/"/g, '""')}"`,
                    `"${agent.email.replace(/"/g, '""')}"`,
                    `"${agent.role.replace(/"/g, '""')}"`
                ].join(',');
            })
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'agents_report.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        if (filteredAgents.length === 0) {
            toast.info(t('common.noDataToExport', 'No data to export.'));
            return;
        }
        const doc = new jsPDF();
        doc.text(t('agents.exportPdfTitle', 'Agents Report'), 14, 22);
        const exportColumns = tableHeaders
            .filter(col => col.key !== 'actions')
            .map(col => ({ header: col.label, dataKey: col.key }));

        doc.autoTable({
            columns: exportColumns,
            body: filteredAgents,
            startY: 30,
            styles: { fontSize: 8, font: "Arial" },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        });

        doc.save(t('agents.exportPdfFileName', 'agents_report.pdf'));
    };

    const handlePrint = () => {
        if (filteredAgents.length === 0) {
            toast.info(t('common.noDataToExport', 'No data to print.'));
            return;
        }
        const printWindow = window.open('', '_blank');
        const title = t('agents.printReportTitle', 'Agents Report');
        printWindow.document.write(`<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;direction:${language === 'ar' ? 'rtl' : 'ltr'};}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:${language === 'ar' ? 'right' : 'left'};}th{background-color:#f2f2f2;}</style></head><body><h1>${title}</h1><table><thead><tr>`);
        tableHeaders.filter(c => c.key !== 'actions').forEach(col => printWindow.document.write(`<th>${col.label}</th>`));
        printWindow.document.write('</tr></thead><tbody>');

        filteredAgents.forEach(agent => {
            printWindow.document.write('<tr>');
            printWindow.document.write(`<td>${agent.name || ''}</td>`);
            printWindow.document.write(`<td>${agent.email || ''}</td>`);
            printWindow.document.write(`<td>${agent.role || ''}</td>`);
            printWindow.document.write('</tr>');
        });

        printWindow.document.write('</tbody></table></body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handleMenuOpen = (event, rowId) => { setAnchorEls(prev => ({ ...prev, [rowId]: event.currentTarget })); };
    const handleMenuClose = (rowId) => { setAnchorEls(prev => { const newAnchors = { ...prev }; delete newAnchors[rowId]; return newAnchors; }); };

    const fetchAgents = async () => {
        setLoadingAgents(true);
        setDisplayCount(ROWS_PER_PAGE);
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get(`http://localhost:3002/api/v1/agents/all`, { headers: { token } });
            const agentsArray = res.data.getAll || [];
            const formatted = agentsArray.map(agent => ({ id: agent._id, name: agent.name, email: agent.email, role: agent.role, }));
            setAllAgents(formatted);
        } catch (err) {
            setAllAgents([]);
        } finally {
            setLoadingAgents(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('agents.deleteConfirm', 'Are you sure you want to delete this agent?'))) {
            const token = `islam__${localStorage.getItem("token")}`;
            try {
                await axios.delete(`http://localhost:3002/api/v1/agents/deleteAgents/${id}`, { headers: { token } });
                fetchAgents();
            } catch {
                // Handle error silently
            }
            handleMenuClose(id);
        }
    };

    const handleScroll = useCallback(() => {
        const nearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200;
        if (nearBottom && displayCount < filteredAgents.length && !isLoadingMore && !loadingAgents) {
            setIsLoadingMore(true);
            setTimeout(() => {
                setDisplayCount(prev => Math.min(prev + ROWS_PER_PAGE, filteredAgents.length));
                setIsLoadingMore(false);
            }, 300);
        }
    }, [displayCount, filteredAgents.length, isLoadingMore, loadingAgents]);

    useEffect(() => {
        fetchAgents();
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        setDisplayCount(ROWS_PER_PAGE);
    }, [searchText]);

    return (
        <div className="py-10 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={language === "ar" ? "rtl" : "ltr"}>
            <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-4 md:p-[22px] rounded-md justify-between items-center mb-4 flex-wrap shadow-sm">
                <div className="flex gap-2 md:gap-[14px] items-center text-sm md:text-base">
                    <NavLink to="/home" className="hover:underline text-blue-600 dark:text-blue-400">{t('breadcrumbs.home', 'Home')}</NavLink>
                    <span className="text-gray-400 dark:text-gray-500">/</span>
                    <span className="text-gray-700 dark:text-gray-300">{t('breadcrumbs.agents', 'Agents')}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {/* <Button variant="outlined" size="small" onClick={handleExportCSV} sx={{ background: '#6C5FFC', color: '#fff' }} disabled={filteredAgents.length === 0}> {t('common.exportCsv', 'CSV')} </Button>
                    <Button variant="outlined" size="small" onClick={handleExportExcel} sx={{ background: '#6C5FFC', color: '#fff' }} disabled={filteredAgents.length === 0}> {t('common.exportExcel', 'Excel')} </Button>
                    <Button variant="outlined" size="small" onClick={handleExportPDF} sx={{ background: '#6C5FFC', color: '#fff' }} disabled={filteredAgents.length === 0}> {t('common.exportPdf', 'PDF')} </Button>
                    <Button variant="outlined" size="small" onClick={handlePrint} sx={{ background: '#6C5FFC', color: '#fff' }} disabled={filteredAgents.length === 0}> {t('common.print', 'Print')} </Button> */}
                    <Button variant="contained" size="small" sx={{ background: '#6C5FFC', color: '#fff' }} onClick={() => setShowAddForm(true)}> {t('agents.addButton', 'Add Agents')} </Button>
                </div>
            </div>

            <div className='flex rounded-md justify-between items-start flex-wrap '>
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder={t('agents.searchPlaceholder', 'Search agents...')}
                        className="p-2 border dark:!border-none dark:bg-gray-700 dark:text-gray-200 rounded-md w-[350px] shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outlined" size="small" onClick={handleExportCSV} sx={{ background: '#6C5FFC', color: '#fff' }} disabled={filteredAgents.length === 0}> {t('buttons.exportCsv', 'CSV')} </Button>
                    <Button variant="outlined" size="small" onClick={handleExportExcel} sx={{ background: '#6C5FFC', color: '#fff' }} disabled={filteredAgents.length === 0}> {t('common.exportExcel', 'Excel')} </Button>
                    <Button variant="outlined" size="small" onClick={handleExportPDF} sx={{ background: '#6C5FFC', color: '#fff' }} disabled={filteredAgents.length === 0}> {t('common.exportPdf', 'PDF')} </Button>
                    <Button variant="outlined" size="small" onClick={handlePrint} sx={{ background: '#6C5FFC', color: '#fff' }} disabled={filteredAgents.length === 0}> {t('buttons.print', 'Print')} </Button>
                </div>
            </div>
            <div className="overflow-x-auto hide-scrollbar shadow-md rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-300">
                    <thead className="text-xs bg-gray-50 dark:bg-gray-700 dark:text-gray-300 uppercase">
                        <tr>
                            {tableHeaders.map(col => (
                                <th key={col.key} className={`px-6 py-3 ${col.align === 'right' ? 'text-right' : (language === 'ar' ? 'text-right' : 'text-left')} ${col.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}`} onClick={() => col.key !== 'actions' && requestSort(col.key)}>
                                    <div className="flex items-center">
                                        <span>{col.label}</span>
                                        {col.key !== 'actions' && getSortIcon(col.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-[rgb(255,255,255)] dark:bg-navbarBack">
                        {loadingAgents && visibleAgents.length === 0 ? (
                            <tr><td colSpan={tableHeaders.length} className="text-center py-10"><div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3 rtl:ml-3 rtl:mr-0"></div>{t('common.loading', 'Loading...')}</div></td></tr>
                        ) : visibleAgents.length > 0 ? (
                            visibleAgents.map(agent => (
                                <tr key={agent.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium ">{agent.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{agent.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{agent.role}</td>
                                    <td className={`px-6 py-4 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                                        <IconButton aria-label="actions" size="small" onClick={(event) => handleMenuOpen(event, agent.id)} className="dark:text-gray-400">
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                        <Menu anchorEl={anchorEls[agent.id]} open={Boolean(anchorEls[agent.id])} onClose={() => handleMenuClose(agent.id)} anchorOrigin={{ vertical: 'bottom', horizontal: language === 'ar' ? 'left' : 'right' }} transformOrigin={{ vertical: 'top', horizontal: language === 'ar' ? 'left' : 'right' }} MenuListProps={{ className: 'dark:bg-gray-800 dark:text-gray-200' }} >
                                            <MenuItem onClick={() => handleDelete(agent.id)} className="dark:hover:bg-gray-700 text-red-600 dark:text-red-400">
                                                <DeleteIcon fontSize="small" className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('common.delete', 'Delete')}
                                            </MenuItem>
                                        </Menu>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={tableHeaders.length} className="text-center py-10 text-gray-500 dark:text-gray-400">{searchText ? t('common.noSearchResults', 'No results found') : t('agents.noAgents', 'No agents found.')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isLoadingMore && (
                <div className="text-center py-8"><div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>{t('common.loadingMore', 'Loading more...')}</div></div>
            )}
            {!isLoadingMore && !loadingAgents && displayCount >= filteredAgents.length && filteredAgents.length > ROWS_PER_PAGE && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('common.endOfResults', "You've reached the end of the results")}</div>
            )}
            <Add_Agent isOpen={showAddForm} onClose={() => { setShowAddForm(false); fetchAgents(); }} />
        </div>
    );
}