import { useState, useMemo, useEffect,  useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toLocaleDateStringEN } from '../../utils/dateFormatter';

const DataTable = ({
  data = [],
  columns = [],
  title = "",
  loading = false,
  onRefresh,
  enableSearch = true,
  enableExport = true,
  enableCSV = false,
  infiniteScroll = null,
  className = ""
}) => {
  const { t, i18n: { language } } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const tableContainerRef = useRef(null);

  const isRTL = language === 'ar' || language === 'he';

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(item =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data (skip pagination if infinite scroll is enabled)
  const paginatedData = useMemo(() => {
    if (infiniteScroll) {
      return sortedData; // Show all data for infinite scroll
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage, infiniteScroll]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Infinite scroll handler
  useEffect(() => {
    if (!infiniteScroll) return;

    const handleScroll = () => {
      if (infiniteScroll.loadingMore || !infiniteScroll.hasMore) return;

      const threshold = 200;
      const nearBottom = window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - threshold;

      if (nearBottom && infiniteScroll.onLoadMore) {
        infiniteScroll.onLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [infiniteScroll]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportToCSV = () => {
    const exportColumns = columns.filter(col => col.accessor !== 'actions');
    const headers = exportColumns.map(col => col.header);

    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        exportColumns.map(col => {
          const cell = row[col.accessor] || '';
          return `"${cell.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const exportColumns = columns.filter(col => col.accessor !== 'actions');
    const exportData = data.map(row => {
      const newRow = {};
      exportColumns.forEach(col => {
        newRow[col.header] = row[col.accessor] || '';
      });
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${title}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();

    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 20, 20);

    // Prepare table data (exclude actions column)
    const exportColumns = columns.filter(col => col.accessor !== 'actions');
    const headers = exportColumns.map(col => col.header);
    const rows = data.map(item =>
      exportColumns.map(col => item[col.accessor] || '')
    );

    pdf.autoTable({
      head: [headers],
      body: rows,
      startY: 30,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },
    });

    pdf.save(`${title}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const exportColumns = columns.filter(col => col.accessor !== 'actions');

    const printContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2980b9; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: ${isRTL ? 'right' : 'left'}; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            @media print {
              button { display: none; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body dir="${isRTL ? 'rtl' : 'ltr'}">
          <h1>${title}</h1>
          <p>Generated on: ${toLocaleDateStringEN(new Date())}</p>
          <table>
            <thead>
              <tr>
                ${exportColumns.map(col => `<th>${col.header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${exportColumns.map(col => `<td>${row[col.accessor] || ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-transparent rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-transparent rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('common.showing')} {sortedData.length} {t('common.results')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-navbarBack shadow-sm hover:shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4v6h6m16 10v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 4a9 9 0 00-9 9 9 9 0 01-9-9m18 10a9 9 0 01-9-9 9 9 0 00-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('common.refresh')}
            </button>
          )}

          {enableExport && (
            <div className="flex gap-2">
              {enableCSV && (
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  CSV
                </button>
              )}
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Excel
              </button>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                PDF
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="6 9 6 2 18 2 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('common.print')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {enableSearch && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200 ${
                isRTL ? 'text-right pl-10 pr-4' : 'text-left'
              }`}
            />
            <div className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.accessor)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable !== false && (
                      <div className="flex flex-col">
                        <svg
                          className={`w-3 h-3 ${sortConfig.key === column.accessor && sortConfig.direction === 'asc' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M10 3l7 7-1.414 1.414L10 5.828 4.414 11.414 3 10l7-7z" clipRule="evenodd" />
                        </svg>
                        <svg
                          className={`w-3 h-3 ${sortConfig.key === column.accessor && sortConfig.direction === 'desc' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M10 17l-7-7 1.414-1.414L10 14.172l5.586-5.586L17 10l-7 7z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {column.render ? column.render(row[column.accessor], row) : row[column.accessor] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {t('common.noDataFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!infiniteScroll && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.itemsPerPage')}:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-transparent text-gray-700 dark:text-gray-200 transition-colors duration-200"
            >
              {isRTL ? '→' : '←'}
            </button>

            <span className="px-4 py-1 text-sm text-gray-600 dark:text-gray-300">
              {currentPage} {t('common.of')} {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-transparent text-gray-700 dark:text-gray-200 transition-colors duration-200"
            >
              {isRTL ? '←' : '→'}
            </button>
          </div>
        </div>
      )}

      {/* Infinite Scroll Loading Indicator */}
      {infiniteScroll && infiniteScroll.loadingMore && (
        <div className="mt-6 text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('common.loadingMore', 'Loading more...')}
          </p>
        </div>
      )}

      {/* End of List Indicator */}
      {infiniteScroll && !infiniteScroll.hasMore && data.length > 0 && (
        <div className="mt-6 text-center py-4 text-sm text-gray-500 dark:text-gray-400">
          {t('common.endOfList', 'You have reached the end of the list')}
        </div>
      )}
    </div>
  );
};

export default DataTable;