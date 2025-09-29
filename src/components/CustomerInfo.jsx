/*import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import CancelInsuranceModal from './CancelInsuranceModal';
import ConfirmModal from './ConfirmModal'; 
import carLogo from '../assets/carr.jpg';
import carLisence from "../assets/car_lisence.png";
import FileUploadModal from "./FileUploadModel";
import Add_vehicle from "./Add_vehicle";
import AddInsuranceMandatory from "./AddInsuranceMandatory";
import { toLocaleDateStringEN } from '../utils/dateFormatter';

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

const ROWS_PER_PAGE_ALL_INSURED = 10;

function CustomerInfo() {
  const { t, i18n: { language } } = useTranslation();
  const { insuredId } = useParams();
  const navigate = useNavigate();

  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [vehicles, setVehicles] = useState([]);
  const [customerData, setCustomerData] = useState({});
  const [customerInsurances, setCustomerInsurances] = useState([]);
  const [loadingInsurances, setLoadingInsurances] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddVehicleOpen, setAddVehicleOpen] = useState(false);
  const [isOpenMandatory, setIsOpenMandatory] = useState(false);
  const [vehicleId, setVehicleId] = useState(null);
 const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  // Delete modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.get(`http://localhost:3002/api/v1/insured/allVec/${insuredId}`, { headers: { token } });
      setVehicles(response.data.vehicles);
    } catch (error) {
      toast.error(t('vehicles.messages.fetchError', 'Failed to fetch vehicles.'));
    }
  }, [insuredId, t]);

  const fetchInsurances = useCallback(async () => {
    setLoadingInsurances(true);
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.get(`http://localhost:3002/api/v1/insured/getAllInsurances/${insuredId}`, { headers: { token } });
      setCustomerInsurances(response.data.insurances);
    } catch (error) {
      toast.error(t('customerInfo.insurances.fetchError', 'Failed to fetch insurances.'));
    } finally {
      setLoadingInsurances(false);
    }
  }, [insuredId, t]);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = `islam__${localStorage.getItem("token")}`;
        const response = await axios.get(`http://localhost:3002/api/v1/insured/findInsured/${insuredId}`, { headers: { token } });
        setCustomerData(response.data.insured);
      } catch {
        // Handle silently
      }
    };
    fetchVehicles();
    fetchCustomer();
    fetchInsurances();
  }, [insuredId, fetchVehicles, fetchInsurances]);

  const openDeleteModal = (vehicle) => {
    setItemToDelete(vehicle);
    setIsConfirmOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return; 
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const token = `islam__${localStorage.getItem("token")}`;
    try {
      await axios.delete(`http://localhost:3002/api/v1/insured/deleteCar/${insuredId}/${itemToDelete._id}`, { headers: { token } });
      toast.success(t("vehicles.messages.deleteSuccess", "تم حذف المركبة بنجاح!"));
      setVehicles(prev => prev.filter(v => v._id !== itemToDelete._id));
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("vehicles.messages.deleteError", "فشل حذف المركبة.");
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }

    try {
      const res = await axios.post(`http://localhost:3002/api/v1/insured/customers/${insuredId}/upload`, formData);
      toast.success(t("customerInfo.attachments.uploadSuccess", "تم رفع الملفات بنجاح!"));
      setCustomerData(prev => ({ ...prev, attachments: res.data.attachments }));
    } catch (error) {
      toast.error(t("customerInfo.attachments.uploadError", "فشل رفع الملفات."));
    }
  };

    const handleConfirmCancel = async ({ refundAmount, paidBy, paymentMethod, description }) => {
if (!selectedInsurance || !itemToDelete || !insuredId) {
  toast.error("Please select a vehicle and insurance first.");
  return;
}
  try {
    const body = { refundAmount, paidBy, paymentMethod, description };

    // استدعاء صحيح للـ API
    const res = await axios.patch(
      `http://localhost:3002/api/v1/expense/cancelInsurance/${insuredId}/${itemToDelete._id}/${selectedInsurance._id}`,
      body
    );

    console.log(res);

    toast.success("Insurance cancelled successfully");

    setCustomerInsurances(prev =>
      prev.map(ins =>
        ins._id === selectedInsurance._id
          ? { ...ins, insuranceStatus: 'cancelled', refundAmount: res.data.insurance.refundAmount }
          : ins
      )
    );
  } catch (error) {
    console.error(error);
    toast.error("Failed to cancel insurance.");
  } finally {
    setCancelModalOpen(false);
    setSelectedInsurance(null);
  }
};

  return (
    <div className="navblayout py-1 dark:text-dark3" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
     
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-[22px] rounded-md justify-between items-center mt-[40px]" dir={language === "en" ? "ltr" : "rtl"}>
        <div className="flex gap-[14px] items-center text-sm md:text-base">
          <NavLink to="/home" className="hover:underline text-blue-600 dark:text-blue-400">{t('breadcrumbs.home')}</NavLink>
          <ChevronRight size={16} className="text-gray-500 dark:text-gray-400 rtl:rotate-180" />
          <NavLink to="/customers" className="hover:underline text-blue-600 dark:text-blue-400">{t('breadcrumbs.customers')}</NavLink>
          <ChevronRight size={16} className="text-gray-500 dark:text-gray-400 rtl:rotate-180" />
          <span className="text-gray-500 dark:text-gray-400">{t('breadcrumbs.customerInfo')}</span>
        </div>
      </div>

      <div className="block gap-3 py-4 md:flex dark:text-dark3">
       
        <div className="w-full md:w-72 xl:w-80 rounded-lg bg-[rgb(255,255,255)] dark:bg-navbarBack shadow-sm mb-3 md:mb-0">
          <div className="p-6">
            <h2 className="mb-4 text-xl md:text-2xl font-semibold text-gray-900 dark:text-dark3">{t('customerInfo.title')}</h2>
            <div className="space-y-3">
              {[
                { labelKey: 'customerInfo.firstName', value: customerData.first_name },
                { labelKey: 'customerInfo.lastName', value: customerData.last_name },
                { labelKey: 'customerInfo.mobile', value: customerData.phone_number },
                { labelKey: 'customerInfo.identity', value: customerData.id_Number },
                { labelKey: 'customerInfo.birthDate', value: customerData.birth_date ? toLocaleDateStringEN(customerData.birth_date) : null },
                { labelKey: 'customerInfo.joinDate', value: customerData.joining_date ? toLocaleDateStringEN(customerData.joining_date) : null },
                { labelKey: 'customerInfo.city', value: customerData.city },
                { labelKey: 'customerInfo.notes', value: customerData.notes },
              ].map(item => (
                <div key={item.labelKey}>
                  <label className="text-xs text-gray-500 dark:text-gray-400">{t(item.labelKey)}</label>
                  <p className="text-sm text-gray-900 dark:text-[rgb(255,255,255)] break-words">{item.value || t('common.notAvailable')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

       
        <div className="md:max-w-[calc(100%-19rem)] xl:max-w-[calc(100%-21rem)] w-full">
         
          <div className="mb-3 rounded-lg bg-[rgb(255,255,255)] dark:bg-navbarBack p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-dark3">{t('customerInfo.attachments.title')}</h2>
              <label htmlFor="file-upload" style={{ background: '#6C5FFC', color: '#fff' }} className="rounded-md px-3 py-1.5 text-xs md:text-sm cursor-pointer">{t('customerInfo.attachments.upload')}</label>
              <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>

            {customerData.attachments && customerData.attachments.length > 0 ? (
              <Swiper
                modules={[Navigation, A11y]}
                spaceBetween={16}
                slidesPerView={3}
                navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                onInit={(swiper) => { swiper.params.navigation.prevEl = prevRef.current; swiper.params.navigation.nextEl = nextRef.current; swiper.navigation.init(); swiper.navigation.update(); }}
                breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
              >
                {customerData.attachments.map(file => (
                  <SwiperSlide key={file._id}>
                    <div className="p-3 border dark:border-gray-700 rounded-md text-center h-32 flex flex-col justify-center">
                      <img src="https://img.icons8.com/color/48/000000/file.png" alt="File" className="w-12 h-12 mx-auto mb-2" />
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline text-sm md:text-base break-words">{file.fileName}</a>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : <p className="text-gray-500 dark:text-gray-400">{t('customerInfo.attachments.none')}</p>}
          </div>

         
          <div className="mb-3 rounded-lg bg-[rgb(255,255,255)] p-6 shadow-sm dark:bg-navbarBack">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-dark3">{t('customerInfo.vehicles.title')}</h2>
              <button onClick={() => setAddVehicleOpen(true)} style={{ background: '#6C5FFC', color: '#fff' }} className="rounded-md px-3 py-1.5 text-xs md:text-sm">{t('customerInfo.vehicles.add')}</button>
            </div>

            {vehicles.length > 0 ? (
              <Swiper modules={[Navigation, Pagination, A11y]} spaceBetween={10} slidesPerView={1} navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }} pagination={{ clickable: true, el: '.swiper-pagination-custom' }} onInit={(swiper) => { swiper.params.navigation.prevEl = prevRef.current; swiper.params.navigation.nextEl = nextRef.current; swiper.navigation.init(); swiper.navigation.update(); }} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } }} className="attachments-swiper pb-8">
                {vehicles.map(vehicle => (
                  <SwiperSlide key={vehicle._id}>
                    <div className="max-w-full text-center p-3 border dark:border-gray-700 rounded-lg h-full flex flex-col justify-between group relative">
                      <button onClick={() => openDeleteModal(vehicle)} className="absolute top-2 right-2 z-10 p-1.5 bg-red-100/80 dark:bg-red-900/80 text-red-600 dark:text-red-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-200 dark:hover:bg-red-800" title={t('common.delete')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div>
                        <img src={vehicle.image || carLogo} alt={`${t('customerInfo.vehicles.vehicleAlt')} ${vehicle.plateNumber}`} className="w-full h-32 object-cover rounded-md mb-2 cursor-pointer" onClick={() => navigate(`/insured/${insuredId}/${vehicle._id}`, { state: { plateNumber: vehicle.plateNumber } })} />
                        <div className="relative w-full h-10 mb-2">
                          <img src={carLisence} alt={t('customerInfo.vehicles.licenseAlt')} className="w-full h-full object-contain" />
                          <p className="absolute inset-0 flex items-center justify-center text-sm md:text-base font-medium text-black">{vehicle.plateNumber}</p>
                        </div>
                      </div>
                      <button className="w-full mt-auto rounded-md border border-gray-300 dark:!border-none px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setIsOpenMandatory(true); setVehicleId(vehicle._id); }}>
                        {t('customerInfo.vehicles.addInsurance')}
                      </button>
                    </div>
                  </SwiperSlide>
                ))}
                <div className="swiper-pagination-custom text-center pt-4"></div>
              </Swiper>
            ) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('customerInfo.vehicles.none')}</p>}
          </div>

        
          <div className="mb-3 rounded-lg bg-[rgb(255,255,255)] dark:bg-navbarBack p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-dark3">{t('customerInfo.insurances.title', 'Insurances')}</h2>
            </div>
            {loadingInsurances ? (
              <p className="text-center text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
            ) : customerInsurances.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">{t('customerInfo.insurances.none', 'No insurances found')}</p>
            ) : (
            <table className="w-full text-xs text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-400">
  <thead className="uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
    <tr>
      <th className="px-2 py-1">{t('customerInfo.insurances.category', 'Category')}</th>
      <th className="px-2 py-1">{t('customerInfo.insurances.type', 'Type')}</th>
      <th className="px-2 py-1">{t('customerInfo.insurances.company', 'Company')}</th>
      <th className="px-2 py-1">{t('customerInfo.insurances.agent', 'Agent')}</th>
      <th className="px-2 py-1">{t('customerInfo.insurances.paymentMethod', 'Payment')}</th>
      <th className="px-2 py-1">{t('customerInfo.insurances.status', 'Status')}</th>
      <th className="px-2 py-1">{t('customerInfo.insurances.startDate', 'Start Date')}</th>
      <th className="px-2 py-1">{t('customerInfo.insurances.endDate', 'End Date')}</th>
      <th className="px-2 py-1">{t('customerInfo.insurances.paidAmount', 'Paid Amount')}</th>
      <th className="px-2 py-1">{t('customerInfo.insurances.remainingDebt', 'Remaining')}</th>
    </tr>
  </thead>
  <tbody>
    {customerInsurances.map(ins => (
      <tr key={ins._id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150 text-xs">
        <td className="px-2 py-1">{ins.insuranceCategory || '-'}</td>
        <td className="px-2 py-1">{ins.insuranceType || '-'}</td>
        <td className="px-2 py-1">{ins.insuranceCompany || '-'}</td>
        <td className="px-2 py-1">{ins.agent || '-'}</td>
        <td className="px-2 py-1">{ins.paymentMethod || '-'}</td>
        <td className="px-2 py-1">{ins.insuranceStatus || '-'}</td>
        <td className="px-2 py-1">{ins.insuranceStartDate ? toLocaleDateStringEN(ins.insuranceStartDate) : '-'}</td>
        <td className="px-2 py-1">{ins.insuranceEndDate ? toLocaleDateStringEN(ins.insuranceEndDate) : '-'}</td>
        <td className="px-2 py-1">{ins.paidAmount ?? '-'}</td>
        <td className="px-2 py-1">{ins.remainingDebt ?? 0}</td>
           <td className="px-2 py-1">
                      {ins.insuranceStatus !== "cancelled" && (
                        <button onClick={() => { setSelectedInsurance(ins); setCancelModalOpen(true); }} className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Cancel</button>
                      )}
                    </td>
      </tr>
    ))}
  </tbody>
</table>
            )}
          </div>
        </div>
      </div>

    
      {isConfirmOpen && <ConfirmModal isOpen={isConfirmOpen} onClose={closeDeleteModal} onConfirm={handleConfirmDelete} loading={isDeleting} />}
      {isUploadModalOpen && <FileUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />}
            {isCancelModalOpen && <CancelInsuranceModal isOpen={isCancelModalOpen} onClose={() => setCancelModalOpen(false)} onConfirm={handleConfirmCancel} />}
      {isAddVehicleOpen && <Add_vehicle isOpen={isAddVehicleOpen} onClose={() => setAddVehicleOpen(false)} />}
      {isOpenMandatory && <AddInsuranceMandatory isOpen={isOpenMandatory} onClose={() => setIsOpenMandatory(false)} vehicleId={vehicleId} insuredId={insuredId} />}
    </div>
  );
}

export default CustomerInfo;*/

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronRight, Trash2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import CancelInsuranceModal from './CancelInsuranceModal';
import ConfirmModal from './ConfirmModal'; 
import carLogo from '../assets/car.png';
import carLisence from "../assets/car_lisence.png";
import FileUploadModal from "./FileUploadModel";
import TransferInsuranceModal from './TransferInsuranceModal';
import Add_vehicle from "./Add_vehicle";
import AddInsuranceMandatory from "./AddInsuranceMandatory";
import { toLocaleDateStringEN } from '../utils/dateFormatter';
import { MoreVertical } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

function CustomerInfo() {
  const { t, i18n: { language } } = useTranslation();
  const { insuredId } = useParams();
  const navigate = useNavigate();

  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [vehicles, setVehicles] = useState([]);
  const [customerData, setCustomerData] = useState({});
  const [loadingInsurances, setLoadingInsurances] = useState(true);
  const [openActionMenu, setOpenActionMenu] = useState(null); 

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddVehicleOpen, setAddVehicleOpen] = useState(false);
  const [isOpenMandatory, setIsOpenMandatory] = useState(false);
  const [vehicleId, setVehicleId] = useState(null);
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.get(`http://localhost:3002/api/v1/insured/allVec/${insuredId}`, { headers: { token } });
      setVehicles(response.data.vehicles);
    } catch (error) {
      toast.error(t('vehicles.messages.fetchError', 'Failed to fetch vehicles.'));
    }
  }, [insuredId, t]);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = `islam__${localStorage.getItem("token")}`;
        const response = await axios.get(`http://localhost:3002/api/v1/insured/findInsured/${insuredId}`, { headers: { token } });
        setCustomerData(response.data.insured);
        setVehicles(response.data.insured.vehicles || []);
      } catch {
        // Handle silently
      } finally {
        setLoadingInsurances(false);
      }
    };
    fetchCustomer();
    fetchVehicles();
  }, [insuredId, fetchVehicles]);

  const openDeleteModal = (vehicle) => {
    setItemToDelete(vehicle);
    setIsConfirmOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return; 
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const token = `islam__${localStorage.getItem("token")}`;
    try {
      await axios.delete(`http://localhost:3002/api/v1/insured/deleteCar/${insuredId}/${itemToDelete._id}`, { headers: { token } });
      toast.success(t("vehicles.messages.deleteSuccess", "تم حذف المركبة بنجاح!"));
      setVehicles(prev => prev.filter(v => v._id !== itemToDelete._id));
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("vehicles.messages.deleteError", "فشل حذف المركبة.");
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let file of files) formData.append("files", file);

    try {
      const res = await axios.post(`http://localhost:3002/api/v1/insured/customers/${insuredId}/upload`, formData);
      toast.success(t("customerInfo.attachments.uploadSuccess", "تم رفع الملفات بنجاح!"));
      setCustomerData(prev => ({ ...prev, attachments: res.data.attachments }));
    } catch (error) {
      toast.error(t("customerInfo.attachments.uploadError", "فشل رفع الملفات."));
    }
  };

  const handleConfirmCancel = async ({ refundAmount, paidBy, paymentMethod, description }) => {
    if (!selectedInsurance || !itemToDelete || !insuredId) {
      toast.error("Please select a vehicle and insurance first.");
      return;
    }
    try {
      const body = { refundAmount, paidBy, paymentMethod, description };
      const res = await axios.patch(
        `http://localhost:3002/api/v1/expense/cancelInsurance/${insuredId}/${itemToDelete._id}/${selectedInsurance._id}`,
        body
      );

      toast.success("Insurance cancelled successfully");

      setVehicles(prev =>
        prev.map(v => v._id === itemToDelete._id
          ? { ...v, insurance: v.insurance.map(ins => ins._id === selectedInsurance._id ? { ...ins, insuranceStatus: 'cancelled', refundAmount: res.data.insurance.refundAmount } : ins) }
          : v
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel insurance.");
    } finally {
      setCancelModalOpen(false);
      setSelectedInsurance(null);
    }
  };

  return (
    <div className="navblayout py-1 dark:text-dark3" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
   
      <div className="bg-[rgb(255,255,255)] dark:bg-navbarBack flex p-[22px] rounded-md justify-between items-center mt-[40px]" dir={language === "en" ? "ltr" : "rtl"}>
        <div className="flex gap-[14px] items-center text-sm md:text-base">
          <NavLink to="/home" className="hover:underline text-blue-600 dark:text-blue-400">{t('breadcrumbs.home')}</NavLink>
          <ChevronRight size={16} className="text-gray-500 dark:text-gray-400 rtl:rotate-180" />
          <NavLink to="/customers" className="hover:underline text-blue-600 dark:text-blue-400">{t('breadcrumbs.customers')}</NavLink>
          <ChevronRight size={16} className="text-gray-500 dark:text-gray-400 rtl:rotate-180" />
          <span className="text-gray-500 dark:text-gray-400">{t('breadcrumbs.customerInfo')}</span>
        </div>
      </div>

    
      <div className="block gap-3 py-4 md:flex dark:text-dark3">
   
        <div className="w-full md:w-72 xl:w-80 rounded-lg bg-[rgb(255,255,255)] dark:bg-navbarBack shadow-sm mb-3 md:mb-0">
          <div className="p-6">
            <h2 className="mb-4 text-xl md:text-2xl font-semibold text-gray-900 dark:text-dark3">{t('customerInfo.title')}</h2>
            <div className="space-y-3">
              {[
                { labelKey: 'customerInfo.firstName', value: customerData.first_name },
                { labelKey: 'customerInfo.lastName', value: customerData.last_name },
                { labelKey: 'customerInfo.mobile', value: customerData.phone_number },
                { labelKey: 'customerInfo.identity', value: customerData.id_Number },
                { labelKey: 'customerInfo.birthDate', value: customerData.birth_date ? toLocaleDateStringEN(customerData.birth_date) : null },
                { labelKey: 'customerInfo.joinDate', value: customerData.joining_date ? toLocaleDateStringEN(customerData.joining_date) : null },
                { labelKey: 'customerInfo.city', value: customerData.city },
                { labelKey: 'customerInfo.notes', value: customerData.notes },
              ].map(item => (
                <div key={item.labelKey}>
                  <label className="text-xs text-gray-500 dark:text-gray-400">{t(item.labelKey)}</label>
                  <p className="text-sm text-gray-900 dark:text-[rgb(255,255,255)] break-words">{item.value || t('common.notAvailable')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

     
        <div className="md:max-w-[calc(100%-19rem)] xl:max-w-[calc(100%-21rem)] w-full">
      
          <div className="mb-3 rounded-lg bg-[rgb(255,255,255)] dark:bg-navbarBack p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-dark3">{t('customerInfo.attachments.title')}</h2>
              <label htmlFor="file-upload" style={{ background: '#6C5FFC', color: '#fff' }} className="rounded-md px-3 py-1.5 text-xs md:text-sm cursor-pointer">{t('customerInfo.attachments.upload')}</label>
              <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>

            {customerData.attachments && customerData.attachments.length > 0 ? (
              <Swiper
                modules={[Navigation, A11y]}
                spaceBetween={16}
                slidesPerView={3}
                navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                onInit={(swiper) => { swiper.params.navigation.prevEl = prevRef.current; swiper.params.navigation.nextEl = nextRef.current; swiper.navigation.init(); swiper.navigation.update(); }}
                breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
              >
                {customerData.attachments.map(file => (
                  <SwiperSlide key={file._id}>
                    <div className="p-3 border dark:border-gray-700 rounded-md text-center h-32 flex flex-col justify-center">
                      <img src="https://img.icons8.com/color/48/000000/file.png" alt="File" className="w-12 h-12 mx-auto mb-2" />
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline text-sm md:text-base break-words">{file.fileName}</a>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : <p className="text-gray-500 dark:text-gray-400">{t('customerInfo.attachments.none')}</p>}
          </div>

        
          <div className="mb-3 rounded-lg bg-[rgb(255,255,255)] p-6 shadow-sm dark:bg-navbarBack">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-dark3">{t('customerInfo.vehicles.title')}</h2>
              <button onClick={() => setAddVehicleOpen(true)} style={{ background: '#6C5FFC', color: '#fff' }} className="rounded-md px-3 py-1.5 text-xs md:text-sm">{t('customerInfo.vehicles.add')}</button>
            </div>

            {vehicles.length > 0 ? (
              <Swiper modules={[Navigation, A11y]} spaceBetween={10} slidesPerView={1} navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }} onInit={(swiper) => { swiper.params.navigation.prevEl = prevRef.current; swiper.params.navigation.nextEl = nextRef.current; swiper.navigation.init(); swiper.navigation.update(); }} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } }} className="attachments-swiper pb-8">
                {vehicles.map(vehicle => (
                  <SwiperSlide key={vehicle._id}>
                    <div className="max-w-full text-center p-3 border dark:border-gray-700 rounded-lg h-full flex flex-col justify-between group relative">
                      <button onClick={() => openDeleteModal(vehicle)} className="absolute top-2 right-2 z-10 p-1.5 bg-red-100/80 dark:bg-red-900/80 text-red-600 dark:text-red-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-200 dark:hover:bg-red-800" title={t('common.delete')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div>
                        <img src={vehicle.image || carLogo} alt={`${t('customerInfo.vehicles.vehicleAlt')} ${vehicle.plateNumber}`} className="w-full h-32 object-cover rounded-md mb-2 cursor-pointer" onClick={() => navigate(`/insured/${insuredId}/${vehicle._id}`, { state: { plateNumber: vehicle.plateNumber } })} />
                        <div className="relative w-full h-10 mb-2">
                          <img src={carLisence} alt={t('customerInfo.vehicles.licenseAlt')} className="w-full h-full object-contain" />
                          <p className="absolute inset-0 flex items-center justify-center text-sm md:text-base font-medium text-black">{vehicle.plateNumber}</p>
                        </div>
                      </div>
                      <button className="w-full mt-auto rounded-md border border-gray-300 dark:!border-none px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setIsOpenMandatory(true); setVehicleId(vehicle._id); }}>
                        {t('customerInfo.vehicles.addInsurance')}
                      </button>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('customerInfo.vehicles.none')}</p>}
          </div>

          
          <div className="mb-3 rounded-lg bg-[rgb(255,255,255)] dark:bg-navbarBack p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-dark3">{t('customerInfo.insurances.title', 'Insurances')}</h2>
            </div>
            {loadingInsurances ? (
              <p className="text-center text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
            ) : vehicles.reduce((acc, v) => acc.concat(v.insurance || []), []).length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">{t('customerInfo.insurances.none', 'No insurances found')}</p>
            ) : (
              <table className="w-full text-xs text-left rtl:text-right dark:bg-navbarBack text-gray-500 dark:text-gray-400">
                <thead className="uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-2 py-1">{t('customerInfo.insurances.plate', 'Plate')}</th>
                
                    <th className="px-2 py-1">{t('customerInfo.insurances.type', 'Type')}</th>
                    <th className="px-2 py-1">{t('customerInfo.insurances.company', 'Company')}</th>
                    <th className="px-2 py-1">{t('customerInfo.insurances.agent', 'Agent')}</th>
                    <th className="px-2 py-1">{t('customerInfo.insurances.paymentMethod', 'Payment')}</th>
                    <th className="px-2 py-1">{t('customerInfo.insurances.status', 'Status')}</th>
                    <th className="px-2 py-1">{t('customerInfo.insurances.startDate', 'Start Date')}</th>
                    <th className="px-2 py-1">{t('customerInfo.insurances.endDate', 'End Date')}</th>
                    <th className="px-2 py-1">{t('customerInfo.insurances.paidAmount', 'Paid Amount')}</th>
                    <th className="px-2 py-1">{t('customerInfo.insurances.remainingDebt', 'Remaining')}</th>
                    <th className="px-2 py-1">{t('common.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(vehicle =>
                    (vehicle.insurance || []).map(ins => (
                      <tr key={ins._id} className="bg-[rgb(255,255,255)] dark:bg-navbarBack border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150 text-xs">
                        <td className="px-2 py-1">{vehicle.plateNumber}</td>
                    
                        <td className="px-2 py-1">{ins.insuranceType || '-'}</td>
                        <td className="px-2 py-1">{ins.insuranceCompany || '-'}</td>
                        <td className="px-2 py-1">{ins.agent || '-'}</td>
                        <td className="px-2 py-1">{ins.paymentMethod || '-'}</td>
                        <td className="px-2 py-1">{ins.insuranceStatus || '-'}</td>
                        <td className="px-2 py-1">{ins.insuranceStartDate ? toLocaleDateStringEN(ins.insuranceStartDate) : '-'}</td>
                        <td className="px-2 py-1">{ins.insuranceEndDate ? toLocaleDateStringEN(ins.insuranceEndDate) : '-'}</td>
                        <td className="px-2 py-1">{ins.paidAmount ?? '-'}</td>
                        <td className="px-2 py-1">{ins.remainingDebt ?? 0}</td>
           <td className="px-2 py-1 relative">
            {ins.insuranceStatus !== 'cancelled' && (
              <div className="relative inline-block">
                <button
                  onClick={() => setOpenActionMenu(openActionMenu === ins._id ? null : ins._id)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <MoreVertical size={16} />
                </button>

                {openActionMenu === ins._id && (
                  <div className="absolute right-0 mt-1 w-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                    <button
                      onClick={() => {
                        setSelectedInsurance(ins);
                        setItemToDelete(vehicle);
                        setCancelModalOpen(true);
                        setOpenActionMenu(null);
                      }}
                      className="w-full text-left px-3 py-1 text-xs hover:bg-red-100 dark:hover:bg-red-700 text-red-600 dark:text-red-300"
                    >
                      Cancel
                    </button>
       <button
  onClick={() => {
    setSelectedInsurance(ins);
    setItemToDelete(vehicle); // fromVehicle
    setTransferModalOpen(true);
    setOpenActionMenu(null);
  }}
  className="w-full text-left px-3 py-1 text-xs hover:bg-blue-100 dark:hover:bg-blue-700 text-blue-600 dark:text-blue-300"
>
  Transfer
</button>
                  </div>
                )}
              </div>
            )}
          </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

  
      {isAddVehicleOpen && <Add_vehicle isOpen={isAddVehicleOpen} close={() => setAddVehicleOpen(false)} insuredId={insuredId} fetchVehicles={fetchVehicles} />}
    {isOpenMandatory && <AddInsuranceMandatory 
    isOpen={isOpenMandatory} 
    onClose={() => setIsOpenMandatory(false)} 
    vehicleId={vehicleId} 
    insuredId={insuredId}   // ✅ أضف هذا
    onInsuranceAdded={fetchVehicles} 
/>}
      {isCancelModalOpen && selectedInsurance && <CancelInsuranceModal isOpen={isCancelModalOpen} close={() => setCancelModalOpen(false)} onConfirm={handleConfirmCancel} insurance={selectedInsurance} />}
      {isConfirmOpen && <ConfirmModal isOpen={isConfirmOpen} close={closeDeleteModal} onConfirm={handleConfirmDelete} loading={isDeleting} />}
      {isTransferModalOpen && selectedInsurance && itemToDelete && (
  <TransferInsuranceModal
    isOpen={isTransferModalOpen}
    close={() => setTransferModalOpen(false)}
    insurance={selectedInsurance}
    fromVehicle={itemToDelete}
    insuredId={insuredId}
    vehicles={vehicles}
    fetchVehicles={fetchVehicles}
  />
)}

    </div>
  );
}

export default CustomerInfo;


