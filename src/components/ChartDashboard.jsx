
import { useState, useEffect } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTranslation } from 'react-i18next';

const ChartDashboard = () => {
  const { t, i18n: { language } } = useTranslation()

  const [timeframe, setTimeframe] = useState("monthly")
  const [financialData, setFinancialData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const fetchFinancialOverview = async () => {
      setLoading(true)
      try {
        let url = `http://localhost:3002/api/v1/insured/financial-overview?period=${timeframe}`

        // Add year parameter for monthly and quarterly views
        if (timeframe === 'monthly' || timeframe === 'quarterly') {
          url += `&year=${selectedYear}`
        }

        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const response = await res.json()
        setFinancialData(response)
      } catch (err) {
        console.error('Error fetching financial overview:', err)
        setFinancialData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchFinancialOverview()
  }, [timeframe, selectedYear])

  // Helper function to convert period display
  const convertPeriodDisplay = (period, timeframe) => {
    if (timeframe === 'monthly') {
     const monthMap = {
              'Jan': '1', 'Feb': '2', 'Mar': '3', 'Apr': '4',
              'May': '5', 'Jun': '6', 'Jul': '7', 'Aug': '8',
              'Sep': '9', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            };
      return monthMap[period] || period;
    } else if (timeframe === 'quarterly') {
      // Keep quarter format as Q1, Q2, Q3, Q4
      return period;
    }
    return period; // For yearly, keep as is
  };

  // Transform data for the chart
  const chartData = financialData?.data?.map(item => ({
    period: convertPeriodDisplay(item.period, timeframe),
    income: item.income || 0,
    expenses: item.expenses || 0,
    profit: item.profit || 0
  })) || []

  // Generate year options (current year and 4 years back)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe)
    // Reset to current year when changing timeframe
    if (newTimeframe !== 'yearly') {
      setSelectedYear(currentYear)
    }
  }

  return (
    <div className="w-full rounded-xl bg-white dark:bg-navbarBack p-6 shadow-sm my-4">
      <div className="h-[300px] w-full">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("home.chart.title")} </h2>
          <div className="flex gap-2">
            {/* Year selector - only show for monthly and quarterly */}
            {(timeframe === 'monthly' || timeframe === 'quarterly') && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            )}

            {/* Period selector */}
            <select
              value={timeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 pr-8 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="monthly">{t("home.chart.monthly")}</option>
              <option value="quarterly">{t("home.chart.quarterly")}</option>
              <option value="yearly">{t("home.chart.yearly")}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">{t("home.chart.loading")}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" className="mb-9">
            <AreaChart width={730} height={250} data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E53E3E" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#E53E3E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3F94D9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3F94D9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="period"
                stroke="currentColor"
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                stroke="currentColor"
                className="text-gray-600 dark:text-gray-400"
              />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700"
              />
              <Tooltip
                formatter={(value) => `${value.toLocaleString()} ₪`}
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, rgba(255, 255, 255, 0.95))',
                  borderRadius: '8px',
                  border: '1px solid var(--tooltip-border, #e5e7eb)'
                }}
                labelStyle={{ color: 'var(--tooltip-text, #1f2937)' }}
                itemStyle={{ color: 'var(--tooltip-text, #1f2937)' }}
              />
              <Area type="monotone" dataKey="income" stroke="#4CAF50" fillOpacity={1} fill="url(#colorIncome)" name={t("home.chart.income")} />
              <Area type="monotone" dataKey="expenses" stroke="#E53E3E" fillOpacity={1} fill="url(#colorExpenses)" name={t("home.chart.expenses")} />
              <Area type="monotone" dataKey="profit" stroke="#3F94D9" fillOpacity={1} fill="url(#colorProfit)" name={t("home.chart.profit")} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-[5rem] grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
        <div className="px-4 text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("home.chart.totalIncome")}</p>
          <p className="mt-2 text-2xl font-semibold text-green-600 dark:text-green-400">
            {financialData?.summary?.totalIncome ? `${financialData.summary.totalIncome.toLocaleString()} ₪` : "—"}
          </p>
        </div>
        <div className="px-4 text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("home.chart.totalExpenses")}</p>
          <p className="mt-2 text-2xl font-semibold text-red-600 dark:text-red-400">
            {financialData?.summary?.totalExpenses ? `${financialData.summary.totalExpenses.toLocaleString()} ₪` : "—"}
          </p>
        </div>
        <div className="px-4 text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("home.chart.totalProfit")}</p>
          <p className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">
            {financialData?.summary?.totalProfit ? `${financialData.summary.totalProfit.toLocaleString()} ₪` : "—"}
          </p>
        </div>
      </div>
    </div>
  )

}

export default ChartDashboard