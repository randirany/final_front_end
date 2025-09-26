import React, { useEffect, useState } from "react";
import ChartDashboard from './../components/ChartDashboard';
import ChartCustromerDashboard from "../components/ChartCustromerDashboard";
import { useTranslation } from 'react-i18next';

function Home() {
  const [totalInsured, setTotalInsured] = useState(null);
  const [totalIncome, setTotalIncome] = useState(null);
  const [financialData, setFinancialData] = useState(null);
    const [totalCar, settotalCar] = useState(null);
    const[getActiveInsurancesCount, setActiveInsurancesCount]=useState(null);
     const[getExpiredInsurancesCount, setExpiredInsurancesCount]=useState(null);
      const[getAccident, setAccident]=useState(null);
           const[getAgents, setAgents]=useState(null);
             const[getReturnedChecksAmount, setReturnedChecksAmount]=useState(null);
    const [paymentMethods, setPaymentMethods] = useState({
    visaPayments: 0,
    cashPayments: 0,
    checkPayments: 0,
    bankPayments: 0
  }); 
  const { t } = useTranslation();

  useEffect(() => {
    const fetchTotalInsured = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/v1/insured/get_count");
        const data = await res.json();
        setTotalInsured(data.total);
      } catch (error) {
        console.error("Failed to fetch total insured count:", error);
      }
    };

    const fetchTotalIncome = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/v1/revenue/getCustomerPaymentsReport");
        const data = await res.json();
        setTotalIncome(data.totalPayments);
      } catch (error) {
        console.error("Failed to fetch total income:", error);
      }
    };

    const fetchFinancialData = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/v1/expense/getNetProfit");
        const data = await res.json();
        setFinancialData(data); 
      } catch (error) {
        console.error("Failed to fetch financial data:", error);
      }
    };

        const fetchPaymentMethods = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/v1/insured/getPaymentsByMethod");
        const data = await res.json();
        setPaymentMethods(data); 
      } catch (error) {
        console.error("Failed to fetch payments by method:", error);
      }
    };

        const fetchTotalCar = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/v1/insured/getTotalCar");
        const data = await res.json();
        settotalCar(data); 
      } catch (error) {
        console.error("Failed to fetch fetch Total Car:", error);
      }
    };
        const ActiveInsurancesCount = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/v1/insured/getActiveInsurancesCount");
        const data = await res.json();
        setActiveInsurancesCount(data); 
      } catch (error) {
        console.error("Failed to fetch Active Insurances Count:", error);
      }
    };


           const ExpiredInsurancesCount = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/v1/insured/getExpiredInsurancesCount");
        const data = await res.json();
        setExpiredInsurancesCount(data); 
      } catch (error) {
        console.error("Failed to fetch Expired Insurances Count:", error);
      }
    };
             const TotalAccident = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/v1/accident/totalAccidents");
        const data = await res.json();
        setAccident(data); 
      } catch (error) {
        console.error("Failed to fetch accident:", error);
      }
    };

                 const Agents = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/v1/agents/totalAgents");
        const data = await res.json();
        setAgents(data); 
      } catch (error) {
        console.error("Failed to fetch Agents:", error);
      }
    };

    const ReturnedChecksAmount=async()=>{
     try {
        const res = await fetch("http://localhost:3002/api/v1/insured/getReturnedChecksAmount");
        const data = await res.json();
        setReturnedChecksAmount(data); 
      } catch (error) {
        console.error("Failed to fetch sReturned Checks Amount:", error);
      }

    }
    Agents();
 TotalAccident();
ExpiredInsurancesCount();
ActiveInsurancesCount();
     fetchTotalCar();
    fetchTotalInsured();
    fetchTotalIncome();
    fetchFinancialData();
    fetchPaymentMethods();
    ReturnedChecksAmount()
  }, []);

  const stats = [
    {
      name: t("home.totalCu"),
      value: totalInsured !== null ? totalInsured.toString() : "—",
    
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
      value: totalIncome !== null ? totalIncome.toString() : "—",
     
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#3F94D9"></circle>
          <path fillRule="evenodd" clipRule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833zm.812-17.333a.812.812 0 10-1.625 0v.343c-1.766.316-3.25 1.643-3.25 3.448 0 2.077 1.964 3.521 4.063 3.521 1.491 0 2.437.982 2.437 1.896 0 .915-.946 1.896-2.437 1.896-1.491 0-2.438-.981-2.438-1.896a.812.812 0 10-1.625 0c0 1.805 1.484 3.132 3.25 3.449v.343a.812.812 0 101.625 0v-.343c1.767-.317 3.25-1.644 3.25-3.449 0-2.077-1.963-3.52-4.062-3.52-1.491 0-2.438-.982-2.438-1.896 0-.915.947-1.896 2.438-1.896s2.437.98 2.437 1.895a.813.813 0 001.625 0c0-1.805-1.483-3.132-3.25-3.448V22.5z" fill="#fff"></path>
        </svg>
      )
    },
      { 
      name: t("home.TotalExpenses"), 
      value: financialData ? financialData.totalExpenses.toString() : "—",

      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#FF9C55"></circle>
          <path fillRule="evenodd" clipRule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833z" fill="#fff"></path>
        </svg>
      )
    },
   
    { name: t("home.TotalVisa"), value: `${paymentMethods.visaPayments} K`, icon: <svg width="58" height="58" viewBox="0 0 58 58" fill="none"><circle cx="29" cy="29" r="29" fill="#3F94D9"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833zm.812-17.333a.812.812 0 10-1.625 0v.343c-1.766.316-3.25 1.643-3.25 3.448 0 2.077 1.964 3.521 4.063 3.521 1.491 0 2.437.982 2.437 1.896 0 .915-.946 1.896-2.437 1.896-1.491 0-2.438-.981-2.438-1.896a.812.812 0 10-1.625 0c0 1.805 1.484 3.132 3.25 3.449v.343a.812.812 0 101.625 0v-.343c1.767-.317 3.25-1.644 3.25-3.449 0-2.077-1.963-3.52-4.062-3.52-1.491 0-2.438-.982-2.438-1.896 0-.915.947-1.896 2.438-1.896s2.437.98 2.437 1.895a.813.813 0 001.625 0c0-1.805-1.483-3.132-3.25-3.448V22.5z" fill="#fff"></path></svg> },
    { name: t("home.TotalCash"), value: `${paymentMethods.cashPayments} K`,  icon: <svg width="58" height="58" viewBox="0 0 58 58" fill="none"><circle cx="29" cy="29" r="29" fill="#3F94D9"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833zm.812-17.333a.812.812 0 10-1.625 0v.343c-1.766.316-3.25 1.643-3.25 3.448 0 2.077 1.964 3.521 4.063 3.521 1.491 0 2.437.982 2.437 1.896 0 .915-.946 1.896-2.437 1.896-1.491 0-2.438-.981-2.438-1.896a.812.812 0 10-1.625 0c0 1.805 1.484 3.132 3.25 3.449v.343a.812.812 0 101.625 0v-.343c1.767-.317 3.25-1.644 3.25-3.449 0-2.077-1.963-3.52-4.062-3.52-1.491 0-2.438-.982-2.438-1.896 0-.915.947-1.896 2.438-1.896s2.437.98 2.437 1.895a.813.813 0 001.625 0c0-1.805-1.483-3.132-3.25-3.448V22.5z" fill="#fff"></path></svg> },
    { name: t("home.TotalBank"), value: `${paymentMethods.bankPayments} K`,  icon: <svg width="58" height="58" viewBox="0 0 58 58" fill="none"><circle cx="29" cy="29" r="29" fill="#3F94D9"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833zm.812-17.333a.812.812 0 10-1.625 0v.343c-1.766.316-3.25 1.643-3.25 3.448 0 2.077 1.964 3.521 4.063 3.521 1.491 0 2.437.982 2.437 1.896 0 .915-.946 1.896-2.437 1.896-1.491 0-2.438-.981-2.438-1.896a.812.812 0 10-1.625 0c0 1.805 1.484 3.132 3.25 3.449v.343a.812.812 0 101.625 0v-.343c1.767-.317 3.25-1.644 3.25-3.449 0-2.077-1.963-3.52-4.062-3.52-1.491 0-2.438-.982-2.438-1.896 0-.915.947-1.896 2.438-1.896s2.437.98 2.437 1.895a.813.813 0 001.625 0c0-1.805-1.483-3.132-3.25-3.448V22.5z" fill="#fff"></path></svg> },
    { name: t("home.checkPayments"), value: `${paymentMethods.checkPayments} K`,  icon: <svg width="58" height="58" viewBox="0 0 58 58" fill="none"><circle cx="29" cy="29" r="29" fill="#3F94D9"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833zm.812-17.333a.812.812 0 10-1.625 0v.343c-1.766.316-3.25 1.643-3.25 3.448 0 2.077 1.964 3.521 4.063 3.521 1.491 0 2.437.982 2.437 1.896 0 .915-.946 1.896-2.437 1.896-1.491 0-2.438-.981-2.438-1.896a.812.812 0 10-1.625 0c0 1.805 1.484 3.132 3.25 3.449v.343a.812.812 0 101.625 0v-.343c1.767-.317 3.25-1.644 3.25-3.449 0-2.077-1.963-3.52-4.062-3.52-1.491 0-2.438-.982-2.438-1.896 0-.915.947-1.896 2.438-1.896s2.437.98 2.437 1.895a.813.813 0 001.625 0c0-1.805-1.483-3.132-3.25-3.448V22.5z" fill="#fff"></path></svg> },
    { 
      name: t("home.TotalProfit"), 
      value: financialData ? financialData.netProfit.toString() : "—",
   
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#3F94D9"></circle>
          <path fillRule="evenodd" clipRule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833z" fill="#fff"></path>
        </svg>
      )
    }, 

        { 
      name: t("home.totalCar"), 
      value: totalCar ? totalCar.totalVehicles.toString() : "—",
   
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#FF9C55"></circle>
          <path fillRule="evenodd" clipRule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833z" fill="#fff"></path>
        </svg>
      )
    },

            { 
      name: t("home.ActiveInsurancesCount"), 
      value: getActiveInsurancesCount ? getActiveInsurancesCount.activeInsurances.toString() : "—",
     
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#FF9C55"></circle>
          <path fillRule="evenodd" clipRule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833z" fill="#fff"></path>
        </svg>
      )
    },
          { 
      name: t("home.ExpiredInsurancesCount"), 
      value: getExpiredInsurancesCount ? getExpiredInsurancesCount.expiredInsurances.toString() : "—",
    
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#FF9C55"></circle>
          <path fillRule="evenodd" clipRule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833z" fill="#fff"></path>
        </svg>
      )
    },

          { 
      name: t("home.accident"), 
      value: getAccident ? getAccident.total.toString() : "—",
    
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#FF9C55"></circle>
          <path fillRule="evenodd" clipRule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833z" fill="#fff"></path>
        </svg>
      )
    },

            { 
      name: t("home.Agents"), 
      value: getAgents ? getAgents.total.toString() : "—",
  
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#FF9C55"></circle>
          <path fillRule="evenodd" clipRule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833z" fill="#fff"></path>
        </svg>
      )
    },
        { 
      name: t("home.returnedChecksTotal"), 
      value: getReturnedChecksAmount ? getReturnedChecksAmount.returnedChecksTotal.toString() : "—",
     
      icon: (
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <circle cx="29" cy="29" r="29" fill="#FF9C55"></circle>
          <path fillRule="evenodd" clipRule="evenodd" d="M29 39.833c5.983 0 10.833-4.85 10.833-10.833 0-5.983-4.85-10.834-10.833-10.834-5.983 0-10.834 4.85-10.834 10.834 0 5.983 4.85 10.833 10.834 10.833z" fill="#fff"></path>
        </svg>
      )
    },



    

  ]

return (
    <div className='py-2 dark:bg-dark2 dark:border-borderNav-b-gray-200 min-h-screen'>
      <main className="flex-1 pb-10">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mt-8 grid grid-cols-1 gap-[30px] sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3">
            {stats.map((item) => (
              <div key={item.name} className="rounded-[10px] bg-white dark:bg-navbarBack p-6 shadow-1">
                {item.icon}
                <div className="mt-6 flex items-end justify-between">
                  <dl>
                    <dt className="mb-1.5 text-[24px] font-bold dark:text-white">{item.value}</dt>
                    <dd className="text-sm font-medium text-[#8D8D8D]">{item.name}</dd>
                  </dl>
                  <dl className="text-sm font-medium text-[#22AD5C]">
                    <dt className="flex items-center gap-1.5">{item.change}
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                        <path d="M4.357 2.393L.91 5.745 0 4.861 5 0l5 4.861-.909.884-3.448-3.353V10H4.357V2.393z"></path>
                      </svg>
                    </dt>
                  </dl>
                </div>
              </div>
            ))}
          </div>
          <ChartDashboard />
          <ChartCustromerDashboard />
        </div>
      </main>
    </div>
  );
}

export default Home