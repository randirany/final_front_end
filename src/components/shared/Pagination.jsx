import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

const Pagination = ({ pagination, onPageChange, loading = false }) => {
  const { t, i18n: { language } } = useTranslation();

  if (!pagination) return null;

  const {
    page,
    totalPages,
    total,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage
  } = pagination;

  const isRTL = language === 'ar' || language === 'he';

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !loading) {
      onPageChange(newPage);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      // Adjust range if near start or end
      if (page <= 3) {
        end = maxVisible - 1;
      } else if (page >= totalPages - 2) {
        start = totalPages - (maxVisible - 2);
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      {/* Info Text */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {t('pagination.showing', {
          from: (page - 1) * 10 + 1,
          to: Math.min(page * 10, total),
          total: total,
          defaultValue: `Showing ${(page - 1) * 10 + 1} to ${Math.min(page * 10, total)} of ${total} results`
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* First Page Button */}
        <Button
          variant="outlined"
          size="small"
          onClick={() => handlePageChange(1)}
          disabled={!hasPrevPage || loading}
          className="min-w-[40px] h-10 p-0"
          sx={{
            borderColor: '#6e7881',
            color: '#6e7881',
            minWidth: '40px',
            '&:hover': {
              borderColor: '#5a6169',
              backgroundColor: 'rgba(110, 120, 129, 0.04)'
            },
            '&.Mui-disabled': {
              borderColor: '#e0e0e0',
              color: '#9e9e9e'
            }
          }}
        >
          {isRTL ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </Button>

        {/* Previous Page Button */}
        <Button
          variant="outlined"
          size="small"
          onClick={() => handlePageChange(prevPage)}
          disabled={!hasPrevPage || loading}
          className="min-w-[40px] h-10 p-0"
          sx={{
            borderColor: '#6e7881',
            color: '#6e7881',
            minWidth: '40px',
            '&:hover': {
              borderColor: '#5a6169',
              backgroundColor: 'rgba(110, 120, 129, 0.04)'
            },
            '&.Mui-disabled': {
              borderColor: '#e0e0e0',
              color: '#9e9e9e'
            }
          }}
        >
          {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>

        {/* Page Number Buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              );
            }

            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
                className="min-w-[40px] h-10 p-0"
                sx={{
                  minWidth: '40px',
                  ...(pageNum === page
                    ? {
                        background: '#6C5FFC',
                        color: '#fff',
                        '&:hover': {
                          background: '#5a4fd8'
                        }
                      }
                    : {
                        borderColor: '#6e7881',
                        color: '#6e7881',
                        '&:hover': {
                          borderColor: '#5a6169',
                          backgroundColor: 'rgba(110, 120, 129, 0.04)'
                        }
                      }),
                  '&.Mui-disabled': {
                    borderColor: '#e0e0e0',
                    color: '#9e9e9e'
                  }
                }}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Mobile: Current Page Indicator */}
        <div className="sm:hidden px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-medium dark:text-white">
          {page} / {totalPages}
        </div>

        {/* Next Page Button */}
        <Button
          variant="outlined"
          size="small"
          onClick={() => handlePageChange(nextPage)}
          disabled={!hasNextPage || loading}
          className="min-w-[40px] h-10 p-0"
          sx={{
            borderColor: '#6e7881',
            color: '#6e7881',
            minWidth: '40px',
            '&:hover': {
              borderColor: '#5a6169',
              backgroundColor: 'rgba(110, 120, 129, 0.04)'
            },
            '&.Mui-disabled': {
              borderColor: '#e0e0e0',
              color: '#9e9e9e'
            }
          }}
        >
          {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>

        {/* Last Page Button */}
        <Button
          variant="outlined"
          size="small"
          onClick={() => handlePageChange(totalPages)}
          disabled={!hasNextPage || loading}
          className="min-w-[40px] h-10 p-0"
          sx={{
            borderColor: '#6e7881',
            color: '#6e7881',
            minWidth: '40px',
            '&:hover': {
              borderColor: '#5a6169',
              backgroundColor: 'rgba(110, 120, 129, 0.04)'
            },
            '&.Mui-disabled': {
              borderColor: '#e0e0e0',
              color: '#9e9e9e'
            }
          }}
        >
          {isRTL ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
