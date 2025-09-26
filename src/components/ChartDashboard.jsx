
import { useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTranslation } from 'react-i18next';

const data = [
  { "month": "Jan", "received": 0, "due": 15 },
  { "month": "Feb", "received": 20, "due": 9 },
  { "month": "Mar", "received": 35, "due": 17 },
  { "month": "Apr", "received": 45, "due": 32 },
  { "month": "May", "received": 35, "due": 25 },
  { "month": "Jun", "received": 55, "due": 68 },
  { "month": "Jul", "received": 65, "due": 75 },
  { "month": "Aug", "received": 50, "due": 65 },
  { "month": "Sep", "received": 60, "due": 80 },
  { "month": "Oct", "received": 75, "due": 85 },
  { "month": "Nov", "received": 65, "due": 75 },
  { "month": "Dec", "received": 70, "due": 65 },
]

const ChartDashboard = () => {
  const { t, i18n: { language } } = useTranslation()

  const [timeframe, setTimeframe] = useState("Monthly")

  return (
    <div className="w-full rounded-xl bg-[rgb(255,255,255)] p-6 shadow-sm my-4 dark:bg-navbarBack dark:text-navbarBack">
      <div className="h-[300px] w-full">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-[rgb(255,255,255)]">{t("home.chart.title")} </h2>
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="dark:bg-navbarBack rounded-lg border dark:border-borderNav border dark:border-borderNav-gray-200 bg-[rgb(255,255,255)] px-4 py-2 pr-8 text-sm focus:border dark:border-borderNav-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option >Monthly</option>
              <option>Yearly</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%" className="mb-9">

          <AreaChart width={730} height={250} data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area type="monotone" dataKey="received" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
            <Area type="monotone" dataKey="due" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-[5rem] grid grid-cols-2 divide-x divide-gray-200">
        <div className="px-4 text-center">
          <p className="text-sm font-medium text-gray-500">{t("home.chart.ReceivedAmount")}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-[rgb(255,255,255)]">$580.00</p>
        </div>
        <div className="px-4 text-center">
          <p className="text-sm font-medium text-gray-500">{t("home.chart.DueAmount")}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-[rgb(255,255,255)]">$628.00</p>
        </div>
      </div>
    </div>
  )

}

export default ChartDashboard