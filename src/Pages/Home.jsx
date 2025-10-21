import { useEffect, useState, useRef } from "react";
import ChartDashboard from './../components/ChartDashboard';
import ChartCustromerDashboard from "../components/ChartCustromerDashboard";
import UpcomingChequesTable from '../components/UpcomingChequesTable';
import ReturnedChequesTable from '../components/ReturnedChequesTable';
import ViewChequeModal from '../components/ViewChequeModal';
import { useTranslation } from 'react-i18next';

// Custom hook for animated counter
const useAnimatedCounter = (end, duration = 2000, isVisible = true) => {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  const animationFrame = useRef(null);

  useEffect(() => {
    if (!isVisible || end === null || end === undefined) {
      setCount(0);
      return;
    }

    const targetValue = typeof end === 'string' ? parseFloat(end.replace(/[^\d.-]/g, '')) || 0 : end;

    if (targetValue === 0) {
      setCount(0);
      return;
    }

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;

      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setCount(Math.floor(targetValue * easeOutQuart));

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      startTime.current = null;
    };
  }, [end, duration, isVisible]);

  return count;
};

// Component for animated stat value
const AnimatedStatValue = ({ value, originalValue }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  const animatedCount = useAnimatedCounter(value, 2000, isVisible);

  // Check if the original value contains currency symbol or other formatting
  const formatValue = (count) => {
    if (originalValue === "—") return "—";

    if (originalValue.includes('₪')) {
      return `${count.toLocaleString()} ₪`;
    }

    return count.toLocaleString();
  };

  return (
    <span ref={elementRef}>
      {isVisible ? formatValue(animatedCount) : "—"}
    </span>
  );
};

function Home() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  // Cheque modal state
  const [viewChequeModalOpen, setViewChequeModalOpen] = useState(false);
  const [selectedChequeId, setSelectedChequeId] = useState(null);

  useEffect(() => {
    const fetchDashboardStatistics = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3002/api/v1/insured/dashboard-statistics");

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const response = await res.json();
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        setError(err.message);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStatistics();
  }, []);

  // Handler for viewing cheque details
  const handleViewCheque = (chequeId) => {
    setSelectedChequeId(chequeId);
    setViewChequeModalOpen(true);
  };

  const stats = [
    {
      name: t("home.totalCu"),
      value: dashboardData?.summary?.totalCustomers ?? null,
      displayValue: dashboardData?.summary?.totalCustomers?.toString() ?? "—",
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="29" cy="29" r="29" fill="#3F94D9" />
          <ellipse cx="25.7511" cy="22.5" rx="4.33333" ry="4.33333" fill="white" />
          <ellipse cx="25.7511" cy="34.4177" rx="7.58333" ry="4.33333" fill="white" />
          <path d="M38.7496 34.4172C38.7496 36.2121 36.5444 37.6671 33.852 37.6671C34.6453 36.8001 35.1907 35.7118 35.1907 34.4187C35.1907 33.124 34.644 32.0347 33.8493 31.1672C36.5417 31.1672 38.7496 32.6222 38.7496 34.4172Z" fill="white" />
          <path d="M35.4996 22.5008C35.4996 24.2957 34.0445 25.7508 32.2496 25.7508C31.8582 25.7508 31.483 25.6816 31.1355 25.5548C31.648 24.6534 31.9407 23.6107 31.9407 22.4996C31.9407 21.3893 31.6484 20.3473 31.1366 19.4464C31.4838 19.3198 31.8586 19.2508 32.2496 19.2508C34.0445 19.2508 35.4996 20.7059 35.4996 22.5008Z" fill="white" />
        </svg>
      ),
    },
    {
      name: t("home.TotalIncome"),
      value: dashboardData?.summary?.totalIncome ?? null,
      displayValue: dashboardData?.summary?.totalIncome ? `${dashboardData.summary.totalIncome} ₪` : "—",
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#3F94D9"></circle>
          <path fillRule="evenodd" clipRule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833zm.812-17.333a.812.812 0 10-1.625 0v.343c-1.766.316-3.25 1.643-3.25 3.448 0 2.077 1.964 3.521 4.063 3.521 1.491 0 2.437.982 2.437 1.896 0 .915-.946 1.896-2.437 1.896-1.491 0-2.438-.981-2.438-1.896a.812.812 0 10-1.625 0c0 1.805 1.484 3.132 3.25 3.449v.343a.812.812 0 101.625 0v-.343c1.767-.317 3.25-1.644 3.25-3.449 0-2.077-1.963-3.52-4.062-3.52-1.491 0-2.438-.982-2.438-1.896 0-.915.947-1.896 2.438-1.896s2.437.98 2.437 1.895a.813.813 0 001.625 0c0-1.805-1.483-3.132-3.25-3.448V22.5z" fill="#fff"></path>
        </svg>
      )
    },
    {
      name: t("home.TotalExpenses"),
      value: dashboardData?.summary?.totalExpenses ?? null,
      displayValue: dashboardData?.summary?.totalExpenses ? `${dashboardData.summary.totalExpenses} ₪` : "—",
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#E53E3E"></circle>
          <path d="M20 25h18c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H20c-1.1 0-2-.9-2-2V27c0-1.1.9-2 2-2z" fill="white"/>
          <path d="M22 23v-2c0-2.2 1.8-4 4-4h6c2.2 0 4 1.8 4 4v2" stroke="white" strokeWidth="2" fill="none"/>
          <circle cx="29" cy="31" r="1.5" fill="#E53E3E"/>
        </svg>
      )
    },
   
    {
      name: t("home.TotalVisa"),
      value: dashboardData?.summary?.visaIncome ?? 0,
      displayValue: `${dashboardData?.summary?.visaIncome ?? 0} ₪`,
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#1565C0"></circle>
          <rect x="18" y="23" width="22" height="14" rx="2" fill="white"/>
          <rect x="18" y="25" width="22" height="3" fill="#1565C0"/>
          <rect x="20" y="30" width="6" height="1.5" rx="0.75" fill="#1565C0"/>
          <rect x="20" y="32.5" width="4" height="1.5" rx="0.75" fill="#1565C0"/>
          <circle cx="35" cy="32" r="2" fill="#1565C0"/>
        </svg>
      )
    },
    {
      name: t("home.TotalCash"),
      value: dashboardData?.summary?.cashIncome ?? 0,
      displayValue: `${dashboardData?.summary?.cashIncome ?? 0} ₪`,
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#4CAF50"></circle>
          <rect x="19" y="24" width="20" height="12" rx="2" fill="white"/>
          <circle cx="29" cy="30" r="3" fill="#4CAF50"/>
          <text x="29" y="32" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">$</text>
          <rect x="21" y="26" width="3" height="1" fill="#4CAF50"/>
          <rect x="34" y="26" width="3" height="1" fill="#4CAF50"/>
        </svg>
      )
    },
    {
      name: t("home.TotalBank"),
      value: dashboardData?.summary?.bankTransferIncome ?? 0,
      displayValue: `${dashboardData?.summary?.bankTransferIncome ?? 0} ₪`,
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#FF9800"></circle>
          <polygon points="29,19 20,26 38,26" fill="white"/>
          <rect x="22" y="26" width="3" height="10" fill="white"/>
          <rect x="27.5" y="26" width="3" height="10" fill="white"/>
          <rect x="33" y="26" width="3" height="10" fill="white"/>
          <rect x="19" y="36" width="20" height="2" fill="white"/>
        </svg>
      )
    },
    {
      name: t("home.checkPayments"),
      value: dashboardData?.summary?.totalChequeIncome ?? 0,
      displayValue: `${dashboardData?.summary?.totalChequeIncome ?? 0} ₪`,
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#9C27B0"></circle>
          <rect x="18" y="23" width="22" height="14" rx="2" fill="white"/>
          <rect x="20" y="27" width="8" height="1" fill="#9C27B0"/>
          <rect x="20" y="29" width="6" height="1" fill="#9C27B0"/>
          <rect x="20" y="31" width="10" height="1" fill="#9C27B0"/>
          <rect x="20" y="33" width="7" height="1" fill="#9C27B0"/>
          <rect x="32" y="27" width="6" height="8" rx="1" fill="#9C27B0"/>
        </svg>
      )
    },
    {
      name: t("home.TotalProfit"),
      value: dashboardData?.summary?.totalProfit ?? null,
      displayValue: dashboardData?.summary?.totalProfit ? `${dashboardData.summary.totalProfit} ₪` : "—",
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#4CAF50"></circle>
          <polyline points="19,35 24,30 29,32 34,25 39,27" stroke="white" strokeWidth="2" fill="none"/>
          <polygon points="34,19 39,19 39,24" fill="white"/>
          <polyline points="34,25 39,19" stroke="white" strokeWidth="2"/>
          <rect x="21" y="36" width="2" height="4" fill="white"/>
          <rect x="25" y="34" width="2" height="6" fill="white"/>
          <rect x="29" y="32" width="2" height="8" fill="white"/>
          <rect x="33" y="30" width="2" height="10" fill="white"/>
        </svg>
      )
    },
    {
      name: t("home.totalCar"),
      value: dashboardData?.summary?.totalVehicles ?? null,
      displayValue: dashboardData?.summary?.totalVehicles?.toString() ?? "—",
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#2196F3"></circle>
          <path d="M19 32h20c1 0 2-.5 2-1v-4c0-1-.5-2-1.5-2.5L37 21c-.5-.5-1-1-2-1H23c-1 0-1.5.5-2 1l-2.5 3.5c-1 .5-1.5 1.5-1.5 2.5v4c0 .5 1 1 2 1z" fill="white"/>
          <circle cx="24" cy="35" r="2.5" fill="white"/>
          <circle cx="34" cy="35" r="2.5" fill="white"/>
          <rect x="25" y="24" width="8" height="4" rx="1" fill="#2196F3"/>
          <rect x="19" y="32" width="20" height="1" fill="#2196F3"/>
        </svg>
      )
    },
    {
      name: t("home.ActiveInsurancesCount"),
      value: dashboardData?.summary?.activeInsurances ?? null,
      displayValue: dashboardData?.summary?.activeInsurances?.toString() ?? "—",
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#4CAF50"></circle>
          <path d="M29 19l-8 4v8c0 5 3.5 9.5 8 10.5 4.5-1 8-5.5 8-10.5v-8l-8-4z" fill="white"/>
          <path d="M25 29l3 3 6-6" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      name: t("home.ExpiredInsurancesCount"),
      value: dashboardData?.summary?.expiredInsurances ?? null,
      displayValue: dashboardData?.summary?.expiredInsurances?.toString() ?? "—",
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#FF5722"></circle>
          <path d="M29 19l-8 4v8c0 5 3.5 9.5 8 10.5 4.5-1 8-5.5 8-10.5v-8l-8-4z" fill="white"/>
          <path d="M29 25v6" stroke="#FF5722" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="29" cy="33" r="1" fill="#FF5722"/>
        </svg>
      )
    },
    {
      name: t("home.accident"),
      value: dashboardData?.summary?.totalAccidents ?? null,
      displayValue: dashboardData?.summary?.totalAccidents?.toString() ?? "—",
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#F44336"></circle>
          <polygon points="29,19 39,37 19,37" fill="white"/>
          <path d="M29 25v8" stroke="#F44336" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="29" cy="35" r="1" fill="#F44336"/>
        </svg>
      )
    },
    {
      name: t("home.Agents"),
      value: dashboardData?.summary?.totalAgents ?? null,
      displayValue: dashboardData?.summary?.totalAgents?.toString() ?? "—",
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#795548"></circle>
          <circle cx="29" cy="25" r="4" fill="white"/>
          <path d="M20 38c0-5 4-9 9-9s9 4 9 9" fill="white"/>
          <rect x="26" y="20" width="6" height="3" rx="1" fill="#795548"/>
          <circle cx="25" cy="23" r="1" fill="white"/>
          <circle cx="33" cy="23" r="1" fill="white"/>
        </svg>
      )
    },
    {
      name: t("home.returnedChecksTotal"),
      value: dashboardData?.summary?.returnedChequesAmount ?? null,
      displayValue: dashboardData?.summary?.returnedChequesAmount ? `${dashboardData.summary.returnedChequesAmount} ₪` : "—",
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#E91E63"></circle>
          <rect x="18" y="23" width="22" height="14" rx="2" fill="white"/>
          <path d="M25 27l-2 2 2 2m4-4l2 2-2 2" stroke="#E91E63" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <rect x="32" y="27" width="6" height="8" rx="1" fill="#E91E63"/>
          <path d="M35 19l-3 3 3 3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },



    

  ]

return (
    <div className='py-6 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen'>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {stats.map((item, index) => (
              <div key={`${item.name}-${index}`} className="rounded-lg bg-white dark:bg-navbarBack p-4 lg:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <div className="text-center">
                  <dl>
                    <dt className="text-lg lg:text-xl xl:text-2xl font-bold dark:text-white text-gray-900 mb-2">
                      <AnimatedStatValue value={item.value} originalValue={item.displayValue} />
                    </dt>
                    <dd className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300 leading-tight" style={{minHeight: '1rem', color: 'inherit'}}>
                      {item.name}
                    </dd>
                  </dl>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <ChartDashboard />
            <ChartCustromerDashboard />
          </div>

          {/* Cheque Tables Section - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <UpcomingChequesTable onViewCheque={handleViewCheque} />
            <ReturnedChequesTable onViewCheque={handleViewCheque} />
          </div>

          {/* View Cheque Modal */}
          <ViewChequeModal
            open={viewChequeModalOpen}
            onClose={() => setViewChequeModalOpen(false)}
            chequeId={selectedChequeId}
          />
    </div>
  );
}

export default Home