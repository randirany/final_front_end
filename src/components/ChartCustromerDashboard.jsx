import React from 'react'
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from 'react-i18next';
import axios from "axios";
function ChartCustromerDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState("Monthly");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3002/api/v1/insured/getInsuredByMonth");
       
        const formatted = response.data.data.map((item) => ({
          month: item.month,
          customers: item.count
        }));
        setData(formatted);
      } catch {
            // Handle error silently
        }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full rounded-xl bg-[rgb(255,255,255)] p-6 shadow-sm my-4 dark:bg-navbarBack dark:text-navbarBack">
      <div className="h-[300px] w-full">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-[rgb(255,255,255)]">
            {t("home.chart.customersGrowth")}
          </h2>
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="dark:bg-navbarBack rounded-lg border dark:border-borderNav border dark:border-borderNav-gray-200 bg-[rgb(255,255,255)] px-4 py-2 pr-8 text-sm focus:border dark:border-borderNav-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option>Monthly</option>
            
            </select>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%" className="mb-9">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3F94D9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3F94D9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area type="monotone" dataKey="customers" stroke="#3F94D9" fillOpacity={1} fill="url(#colorCustomers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-[5rem] text-center">
     
      
      </div>
    </div>
  );
};
export default ChartCustromerDashboard