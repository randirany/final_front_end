/*import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTranslation} from 'react-i18next';
import CancelInsuranceModal from './CancelInsuranceModal';
import ConfirmModal from './ConfirmModal'; 
import carLogo from '../assets/carr.jpg';
import carLisence from "../assets/car_lisence.png";
import FileUploadModal from "./FileUploadModel";
import Add_vehicle from "./Add_vehicle";
import AddInsuranceWithPayments from "./AddInsuranceWithPayments";
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
  toast.error(t('customerInfo.errors.selectRequired'));
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

    toast.success(t('customerInfo.insurance.cancelSuccess'));

    setCustomerInsurances(prev =>
      prev.map(ins =>
        ins._id === selectedInsurance._id
          ? { ...ins, insuranceStatus: 'cancelled', refundAmount: res.data.insurance.refundAmount }
          : ins
      )
    );
  } catch (error) {
    console.error(error);
    toast.error(t('customerInfo.insurance.cancelError'));
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
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center h-36 flex flex-col justify-center hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all bg-white dark:bg-gray-800/50">
                      <img src="https://img.icons8.com/color/48/000000/file.png" alt="File" className="w-12 h-12 mx-auto mb-3" />
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-words font-medium">{file.fileName}</a>
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
      {isOpenMandatory && <AddInsuranceWithPayments isOpen={isOpenMandatory} onClose={() => setIsOpenMandatory(false)} vehicleId={vehicleId} insuredId={insuredId} />}
    </div>
  );
}

export default CustomerInfo;*/

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChevronRight, Trash2, CreditCard, Receipt, Plus, AlertTriangle } from "lucide-react";
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
import AddInsuranceWithPayments from "./AddInsuranceWithPayments";
import AddPaymentModal from "./AddPaymentModal";
import AddPaymentToInsurance from "./AddPaymentToInsurance";
import AddChequeModal from "./AddChequeModal";
import EditChequeModal from "./EditChequeModal";
import AddAccidentModal from "./AddAccidentModal";
import ViewInsuranceModal from "./ViewInsuranceModal";
import ViewPaymentModal from "./ViewPaymentModal";
import DataTable from "./shared/DataTable";
import { toLocaleDateStringEN } from '../utils/dateFormatter';
import { MoreVertical, Eye, DollarSign } from "lucide-react";
import { getCustomerCheques, updateChequeStatus, deleteCheque } from '../services/chequeApi';
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
  const [isAddAccidentModalOpen, setAddAccidentModalOpen] = useState(false);
  const [isViewInsuranceModalOpen, setViewInsuranceModalOpen] = useState(false);
  const [selectedInsuranceToView, setSelectedInsuranceToView] = useState(null);

  // Cheques and Payments state
  const [cheques, setCheques] = useState([]);
  const [loadingCheques, setLoadingCheques] = useState(true);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [isAddPaymentModalOpen, setAddPaymentModalOpen] = useState(false);
  const [isAddPaymentToInsuranceModalOpen, setAddPaymentToInsuranceModalOpen] = useState(false);
  const [selectedInsuranceForPayment, setSelectedInsuranceForPayment] = useState(null);
  const [isAddChequeModalOpen, setAddChequeModalOpen] = useState(false);
  const [selectedCheque, setSelectedCheque] = useState(null);
  const [isViewChequeModalOpen, setViewChequeModalOpen] = useState(false);
  const [isEditChequeModalOpen, setEditChequeModalOpen] = useState(false);
  const [openChequeActionMenu, setOpenChequeActionMenu] = useState(null);
  const [isViewPaymentModalOpen, setViewPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openPaymentActionMenu, setOpenPaymentActionMenu] = useState(null);

  const fetchVehicles = useCallback(async () => {
    try {
      const token = `islam__${localStorage.getItem("token")}`;
      const response = await axios.get(`http://localhost:3002/api/v1/insured/allVec/${insuredId}`, { headers: { token } });
      setVehicles(response.data.vehicles);
    } catch (error) {
      toast.error(t('vehicles.messages.fetchError', 'Failed to fetch vehicles.'));
    }
  }, [insuredId, t]);

  const fetchCheques = useCallback(async () => {
    setLoadingCheques(true);
    try {
      const response = await getCustomerCheques(insuredId);
      setCheques(response.cheques || []);
    } catch (error) {
      console.error('Error fetching cheques:', error);
      toast.error(t('customerInfo.cheques.fetchError', 'Failed to fetch cheques.'));
    } finally {
      setLoadingCheques(false);
    }
  }, [insuredId, t]);

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      // Extract all payments from all insurances across all vehicles
      const allPayments = [];
      vehicles.forEach(vehicle => {
        if (vehicle.insurance && Array.isArray(vehicle.insurance)) {
          vehicle.insurance.forEach(ins => {
            if (ins.payments && Array.isArray(ins.payments)) {
              ins.payments.forEach(payment => {
                allPayments.push({
                  ...payment,
                  plateNumber: vehicle.plateNumber,
                  insuranceCompany: ins.insuranceCompany,
                  insuranceType: ins.insuranceType
                });
              });
            }
          });
        }
      });
      setPayments(allPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error(t('customerInfo.payments.fetchError', 'Failed to fetch payments.'));
    } finally {
      setLoadingPayments(false);
    }
  }, [vehicles, t]);

  // Cheque action handlers
  const handleChequeStatusUpdate = async (chequeId, newStatus) => {
    try {
      await updateChequeStatus(chequeId, { status: newStatus });
      toast.success(t('customerInfo.cheques.statusUpdated', 'Cheque status updated successfully'));
      fetchCheques(); // Refresh cheques list
    } catch (error) {
      console.error('Error updating cheque status:', error);
      toast.error(t('customerInfo.cheques.statusUpdateError', 'Failed to update cheque status'));
    }
  };

  const handleViewCheque = (cheque) => {
    setSelectedCheque(cheque);
    setViewChequeModalOpen(true);
  };

  const handleEditCheque = (cheque) => {
    setSelectedCheque(cheque);
    setEditChequeModalOpen(true);
  };

  const handleDeleteCheque = async (chequeId) => {
    if (!window.confirm(t('customerInfo.cheques.confirmDelete', 'Are you sure you want to delete this cheque?'))) {
      return;
    }

    try {
      await deleteCheque(chequeId);
      toast.success(t('customerInfo.cheques.deleteSuccess', 'Cheque deleted successfully'));
      fetchCheques(); // Refresh cheques list
    } catch (error) {
      console.error('Error deleting cheque:', error);
      toast.error(t('customerInfo.cheques.deleteError', 'Failed to delete cheque'));
    }
  };

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
    fetchCheques();
  }, [insuredId, fetchVehicles, fetchCheques]);

  // Fetch payments whenever vehicles data changes
  useEffect(() => {
    if (vehicles.length > 0) {
      fetchPayments();
    }
  }, [vehicles, fetchPayments]);

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
      toast.error(t('customerInfo.errors.selectRequired'));
      return;
    }
    try {
      const body = { refundAmount, paidBy, paymentMethod, description };
      const res = await axios.patch(
        `http://localhost:3002/api/v1/expense/cancelInsurance/${insuredId}/${itemToDelete._id}/${selectedInsurance._id}`,
        body
      );

      toast.success(t('customerInfo.insurance.cancelSuccess'));

      setVehicles(prev =>
        prev.map(v => v._id === itemToDelete._id
          ? { ...v, insurance: v.insurance.map(ins => ins._id === selectedInsurance._id ? { ...ins, insuranceStatus: 'cancelled', refundAmount: res.data.insurance.refundAmount } : ins) }
          : v
        )
      );
    } catch (error) {
      console.error(error);
      toast.error(t('customerInfo.insurance.cancelError'));
    } finally {
      setCancelModalOpen(false);
      setSelectedInsurance(null);
    }
  };

  const handleAddInsuranceToVehicle = (selectedVehicleId) => {
    setVehicleId(selectedVehicleId);
    setIsOpenMandatory(true);
  };

  const handleAddAccidentToVehicle = (selectedVehicleId) => {
    setVehicleId(selectedVehicleId);
    setAddAccidentModalOpen(true);
  };

  // Prepare insurances data for DataTable
  const insurancesData = useMemo(() => {
    const allInsurances = [];
    vehicles.forEach(vehicle => {
      if (vehicle.insurance && Array.isArray(vehicle.insurance)) {
        vehicle.insurance.forEach(ins => {
          allInsurances.push({
            ...ins,
            plateNumber: vehicle.plateNumber,
            vehicleId: vehicle._id,
            vehicle: vehicle
          });
        });
      }
    });
    return allInsurances;
  }, [vehicles]);

  // Insurances Table Columns
  const insurancesColumns = useMemo(() => [
    {
      header: t('customerInfo.insurances.plate', 'Plate'),
      accessor: 'plateNumber',
      render: (value, row) => <span className="font-medium text-gray-900 dark:text-gray-100">{row.plateNumber || '-'}</span>
    },
    {
      header: t('customerInfo.insurances.type', 'Type'),
      accessor: 'insuranceType',
      render: (value, row) => <span className="text-gray-700 dark:text-gray-300">{row.insuranceType || '-'}</span>
    },
    {
      header: t('customerInfo.insurances.company', 'Company'),
      accessor: 'insuranceCompany',
      render: (value, row) => <span className="text-gray-700 dark:text-gray-300">{row.insuranceCompany || '-'}</span>
    },
    {
      header: t('customerInfo.insurances.amount', 'Total Amount'),
      accessor: 'insuranceAmount',
      render: (value, row) => (
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {row.insuranceAmount ? row.insuranceAmount.toLocaleString() : '-'}
        </span>
      )
    },
    {
      header: t('customerInfo.insurances.payments', 'Payments'),
      accessor: 'payments',
      render: (value, row) => {
        const paymentsCount = row.payments?.length || 0;
        const paymentMethods = row.payments?.map(p => p.paymentMethod).filter(Boolean) || [];
        const uniqueMethods = [...new Set(paymentMethods)];

        return (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {paymentsCount} {paymentsCount === 1 ? t('customerInfo.insurances.payment') : t('customerInfo.insurances.paymentsCount')}
            </span>
            {uniqueMethods.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {uniqueMethods.map((method, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {method}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: t('customerInfo.insurances.paidAmount', 'Paid'),
      accessor: 'paidAmount',
      render: (value, row) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {row.paidAmount ? row.paidAmount.toLocaleString() : '0'}
        </span>
      )
    },
    {
      header: t('customerInfo.insurances.remainingDebt', 'Remaining'),
      accessor: 'remainingDebt',
      render: (value, row) => {
        const remaining = row.remainingDebt ?? 0;
        return (
          <span className={`font-semibold ${
            remaining > 0
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {remaining.toLocaleString()}
          </span>
        );
      }
    },
    {
      header: t('customerInfo.insurances.status', 'Status'),
      accessor: 'insuranceStatus',
      render: (value, row) => (
        <span className={`px-2 py-1 text-xs rounded-md font-medium whitespace-nowrap ${
          row.insuranceStatus === 'active'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : row.insuranceStatus === 'cancelled'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}>
          {row.insuranceStatus || '-'}
        </span>
      )
    },
    {
      header: t('customerInfo.insurances.dates', 'Period'),
      accessor: 'insuranceStartDate',
      render: (value, row) => (
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="text-gray-600 dark:text-gray-400">
            {row.insuranceStartDate ? toLocaleDateStringEN(row.insuranceStartDate) : '-'}
          </span>
          <span className="text-gray-400 dark:text-gray-500">{t('common.to')}</span>
          <span className="text-gray-600 dark:text-gray-400">
            {row.insuranceEndDate ? toLocaleDateStringEN(row.insuranceEndDate) : '-'}
          </span>
        </div>
      )
    },
    {
      header: t('common.actions', 'Actions'),
      accessor: 'actions',
      render: (value, row) => (
        <div className="relative inline-block">
          <button
            onClick={() => setOpenActionMenu(openActionMenu === row._id ? null : row._id)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVertical size={16} className="text-gray-600 dark:text-gray-400" />
          </button>

          {openActionMenu === row._id && (
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setSelectedInsuranceToView(row);
                  setViewInsuranceModalOpen(true);
                  setOpenActionMenu(null);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-t-lg transition-colors flex items-center gap-2"
              >
                <Eye size={14} />
                {t('common.view', 'View')}
              </button>
              {row.insuranceStatus !== 'cancelled' && (
                <>
                  <button
                    onClick={() => {
                      setSelectedInsuranceForPayment(row);
                      setAddPaymentToInsuranceModalOpen(true);
                      setOpenActionMenu(null);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors flex items-center gap-2"
                  >
                    <DollarSign size={14} />
                    {t('common.addPayment', 'Add Payment')}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedInsurance(row);
                      setItemToDelete(row.vehicle);
                      setCancelModalOpen(true);
                      setOpenActionMenu(null);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedInsurance(row);
                      setItemToDelete(row.vehicle);
                      setTransferModalOpen(true);
                      setOpenActionMenu(null);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-b-lg transition-colors"
                  >
                    {t('common.transfer', 'Transfer')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )
    }
  ], [t, openActionMenu]);

  // Payments Table Columns
  const paymentsColumns = useMemo(() => [
    {
      header: t('customerInfo.payments.plate', 'Plate'),
      accessor: 'plateNumber',
      render: (value, row) => <span className="font-medium">{row.plateNumber || '-'}</span>
    },
    {
      header: t('customerInfo.payments.company', 'Company'),
      accessor: 'insuranceCompany',
      render: (value, row) => <span>{row.insuranceCompany || '-'}</span>
    },
    {
      header: t('customerInfo.payments.type', 'Type'),
      accessor: 'insuranceType',
      render: (value, row) => <span>{row.insuranceType || '-'}</span>
    },
    {
      header: t('customerInfo.payments.amount', 'Amount'),
      accessor: 'amount',
      render: (value, row) => <span className="font-semibold text-green-600 dark:text-green-400">{row.amount ? row.amount.toLocaleString() : '-'}</span>
    },
    {
      header: t('customerInfo.payments.method', 'Method'),
      accessor: 'paymentMethod',
      render: (value, row) => (
        <span className="px-2 py-1 text-xs rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
          {row.paymentMethod || '-'}
        </span>
      )
    },
    {
      header: t('customerInfo.payments.paidBy', 'Paid By'),
      accessor: 'recordedBy',
      render: (value, row) => <span>{row.recordedBy || '-'}</span>
    },
    {
      header: t('customerInfo.payments.date', 'Date'),
      accessor: 'paymentDate',
      render: (value, row) => <span>{row.paymentDate ? toLocaleDateStringEN(row.paymentDate) : '-'}</span>
    },
    {
      header: t('common.actions', 'Actions'),
      accessor: 'actions',
      render: (value, row) => (
        <div className="relative inline-block">
          <button
            onClick={() => setOpenPaymentActionMenu(openPaymentActionMenu === row._id ? null : row._id)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVertical size={16} className="text-gray-600 dark:text-gray-400" />
          </button>

          {openPaymentActionMenu === row._id && (
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setSelectedPayment(row);
                  setViewPaymentModalOpen(true);
                  setOpenPaymentActionMenu(null);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
              >
                <Eye size={14} />
                {t('common.view', 'View')}
              </button>
            </div>
          )}
        </div>
      )
    }
  ], [t, openPaymentActionMenu]);

  // Cheques Table Columns
  const chequesColumns = useMemo(() => [
    {
      header: t('customerInfo.cheques.number', 'Cheque #'),
      accessor: 'chequeNumber',
      render: (value, row) => <span className="font-medium">{row.chequeNumber || '-'}</span>
    },
    {
      header: t('customerInfo.cheques.amount', 'Amount'),
      accessor: 'amount',
      render: (value, row) => <span className="font-semibold text-green-600 dark:text-green-400">{row.amount ? row.amount.toLocaleString() : '-'}</span>
    },
    {
      header: t('customerInfo.cheques.date', 'Date'),
      accessor: 'chequeDate',
      render: (value, row) => <span>{row.chequeDate ? toLocaleDateStringEN(row.chequeDate) : '-'}</span>
    },
    {
      header: t('customerInfo.cheques.status', 'Status'),
      accessor: 'status',
      render: (value, row) => (
        <span className={`px-2 py-1 text-xs rounded-md font-medium ${
          row.status === 'cashed'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : row.status === 'pending'
            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
            : row.status === 'bounced'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}>
          {row.status || '-'}
        </span>
      )
    },
    {
      header: t('customerInfo.cheques.notes', 'Notes'),
      accessor: 'notes',
      render: (value, row) => <span className="text-sm text-gray-600 dark:text-gray-400">{row.notes || '-'}</span>
    },
    {
      header: t('common.actions', 'Actions'),
      accessor: 'actions',
      render: (value, row) => (
        <div className="relative inline-block">
          <button
            onClick={() => setOpenChequeActionMenu(openChequeActionMenu === row._id ? null : row._id)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVertical size={16} className="text-gray-600 dark:text-gray-400" />
          </button>

          {openChequeActionMenu === row._id && (
            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  handleViewCheque(row);
                  setOpenChequeActionMenu(null);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-t-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('common.view', 'View')}
              </button>

              <button
                onClick={() => {
                  handleEditCheque(row);
                  setOpenChequeActionMenu(null);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('common.edit', 'Edit Status')}
              </button>

              <button
                onClick={() => {
                  handleDeleteCheque(row._id);
                  setOpenChequeActionMenu(null);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-b-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('common.delete', 'Delete')}
              </button>
            </div>
          )}
        </div>
      )
    }
  ], [t, openChequeActionMenu]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark2 p-6" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-2 items-center text-sm">
          <NavLink to="/home" className="hover:underline text-blue-600 dark:text-blue-400 transition-colors">{t('breadcrumbs.home')}</NavLink>
          <ChevronRight size={14} className="text-gray-400 rtl:rotate-180" />
          <NavLink to="/customers" className="hover:underline text-blue-600 dark:text-blue-400 transition-colors">{t('breadcrumbs.customers')}</NavLink>
          <ChevronRight size={14} className="text-gray-400 rtl:rotate-180" />
          <span className="text-gray-600 dark:text-gray-300">{customerData.first_name} {customerData.last_name}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Customer Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('customerInfo.title')}</h2>
            <div className="space-y-4">
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
                <div key={item.labelKey} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t(item.labelKey)}</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{item.value || t('common.notAvailable')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Attachments Section */}
          <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('customerInfo.attachments.title')}</h2>
              <label htmlFor="file-upload" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm rounded-lg cursor-pointer transition-colors inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {t('customerInfo.attachments.upload')}
              </label>
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
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center h-36 flex flex-col justify-center hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all bg-white dark:bg-gray-800/50">
                      <img src="https://img.icons8.com/color/48/000000/file.png" alt="File" className="w-12 h-12 mx-auto mb-3" />
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-words font-medium">{file.fileName}</a>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('customerInfo.attachments.none')}</p>}
          </div>

          {/* Vehicles Section */}
          <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('customerInfo.vehicles.title')}</h2>
              <button onClick={() => setAddVehicleOpen(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm rounded-lg transition-colors inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('customerInfo.vehicles.add')}
              </button>
            </div>

            {vehicles.length > 0 ? (
              <Swiper modules={[Navigation, A11y]} spaceBetween={10} slidesPerView={1} navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }} onInit={(swiper) => { swiper.params.navigation.prevEl = prevRef.current; swiper.params.navigation.nextEl = nextRef.current; swiper.navigation.init(); swiper.navigation.update(); }} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } }} className="attachments-swiper pb-8">
                {vehicles.map(vehicle => {
                  // Check if vehicle has expired insurance
                  const hasExpiredInsurance = vehicle.insurance?.some(ins => {
                    if (!ins.insuranceEndDate || ins.insuranceStatus === 'cancelled') return false;
                    const endDate = new Date(ins.insuranceEndDate);
                    const today = new Date();
                    return endDate < today;
                  });

                  return (
                  <SwiperSlide key={vehicle._id}>
                    <div className={`max-w-full text-center p-3 border rounded-lg h-full flex flex-col justify-between group relative transition-all duration-300 ${
                      hasExpiredInsurance
                        ? 'border-red-400 dark:border-red-600 bg-red-50/50 dark:bg-red-900/20 opacity-75 hover:opacity-100'
                        : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                    }`}>
                      {/* Expired Badge */}
                      {hasExpiredInsurance && (
                        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-md shadow-md">
                          {t('customerInfo.vehicles.expired', 'Expired')}
                        </div>
                      )}

                      <button onClick={() => openDeleteModal(vehicle)} className="absolute top-2 right-2 z-10 p-1.5 bg-red-100/80 dark:bg-red-900/80 text-red-600 dark:text-red-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-200 dark:hover:bg-red-800" title={t('common.delete')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div>
                        <img
                          src={vehicle.image || carLogo}
                          alt={`${t('customerInfo.vehicles.vehicleAlt')} ${vehicle.plateNumber}`}
                          className={`w-full h-32 object-cover rounded-md mb-2 cursor-pointer transition-all ${
                            hasExpiredInsurance ? 'filter grayscale-50 brightness-95' : ''
                          }`}
                          onClick={() => navigate(`/insured/${insuredId}/${vehicle._id}`, { state: { plateNumber: vehicle.plateNumber } })}
                        />
                        <div className="relative w-full h-10 mb-2">
                          <img src={carLisence} alt={t('customerInfo.vehicles.licenseAlt')} className="w-full h-full object-contain" />
                          <p className={`absolute inset-0 flex items-center justify-center text-sm md:text-base font-medium ${
                            hasExpiredInsurance ? 'text-red-700 dark:text-red-400' : 'text-black dark:text-gray-800'
                          }`}>{vehicle.plateNumber}</p>
                        </div>
                      </div>
                      <div className="w-full mt-auto space-y-2">
                        <button
                          className={`w-full rounded-md border px-3 py-1.5 text-xs transition-all ${
                            hasExpiredInsurance
                              ? 'border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40'
                              : 'border-gray-300 dark:!border-none text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => handleAddInsuranceToVehicle(vehicle._id)}
                        >
                          {hasExpiredInsurance ? t('customerInfo.vehicles.renewInsurance', 'Renew Insurance') : t('customerInfo.vehicles.addInsurance')}
                        </button>
                        <button
                          className="w-full rounded-md border border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-800/40 px-3 py-1.5 text-xs transition-all flex items-center justify-center gap-1"
                          onClick={() => handleAddAccidentToVehicle(vehicle._id)}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {t('customerInfo.vehicles.addAccident', 'Add Accident')}
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>
                  );
                })}
              </Swiper>
            ) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('customerInfo.vehicles.none')}</p>}
          </div>

          {/* Insurances Section */}
          <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-6">
            <DataTable
              data={insurancesData}
              columns={insurancesColumns}
              title={t('customerInfo.insurances.title', 'Insurances')}
              loading={loadingInsurances}
              enableSearch={true}
              enableExport={true}
              enableCSV={true}
            />
          </div>

          {/* Customer Payments Section */}
          <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('customerInfo.payments.title', 'Payments')}</h2>
              </div>
              <button
                onClick={() => setAddPaymentModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('customerInfo.payments.addPayment', 'Add Payment')}
              </button>
            </div>
            <DataTable
              data={payments}
              columns={paymentsColumns}
              title=""
              loading={loadingPayments}
              enableSearch={true}
              enableExport={true}
              enableCSV={true}
            />
          </div>

          {/* Customer Cheques Section */}
          <div className="bg-white dark:bg-navbarBack rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('customerInfo.cheques.title', 'Cheques')}</h2>
              </div>
              <button
                onClick={() => setAddChequeModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('customerInfo.cheques.addCheque', 'Add Cheque')}
              </button>
            </div>
            <DataTable
              data={cheques}
              columns={chequesColumns}
              title=""
              loading={loadingCheques}
              enableSearch={true}
              enableExport={true}
              enableCSV={true}
            />
          </div>
        </div>
      </div>


      {isAddVehicleOpen && <Add_vehicle isOpen={isAddVehicleOpen} onClose={() => setAddVehicleOpen(false)} insuredId={insuredId} onVehicleAdded={fetchVehicles} />}
      {isOpenMandatory && vehicleId && (
        <AddInsuranceWithPayments
          isOpen={isOpenMandatory}
          onClose={() => {
            setIsOpenMandatory(false);
            setVehicleId(null);
          }}
          vehicleId={vehicleId}
          insuredId={insuredId}
          onInsuranceAdded={fetchVehicles}
        />
      )}
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

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setAddPaymentModalOpen(false)}
        onPaymentAdded={() => {
          fetchVehicles();
          fetchPayments();
          fetchInsurances();
          setAddPaymentModalOpen(false);
        }}
        insuredId={insuredId}
        vehicles={vehicles}
      />

      {/* Add Payment To Insurance Modal */}
      {selectedInsuranceForPayment && (
        <AddPaymentToInsurance
          isOpen={isAddPaymentToInsuranceModalOpen}
          onClose={() => {
            setAddPaymentToInsuranceModalOpen(false);
            setSelectedInsuranceForPayment(null);
          }}
          insuredId={insuredId}
          vehicleId={selectedInsuranceForPayment.vehicle}
          insuranceId={selectedInsuranceForPayment._id}
          onPaymentAdded={(response) => {
            fetchVehicles();
            fetchPayments();
            setAddPaymentToInsuranceModalOpen(false);
            setSelectedInsuranceForPayment(null);
          }}
        />
      )}

      {/* Add Cheque Modal */}
      <AddChequeModal
        open={isAddChequeModalOpen}
        onClose={() => setAddChequeModalOpen(false)}
        onSuccess={() => {
          fetchCheques();
          setAddChequeModalOpen(false);
        }}
        selectedCustomerId={insuredId}
      />

      {/* Edit Cheque Modal */}
      <EditChequeModal
        open={isEditChequeModalOpen}
        onClose={() => {
          setEditChequeModalOpen(false);
          setSelectedCheque(null);
        }}
        onSuccess={() => {
          fetchCheques();
          setEditChequeModalOpen(false);
          setSelectedCheque(null);
        }}
        selectedChequeId={selectedCheque?._id}
      />

      {/* Add Accident Modal */}
      {isAddAccidentModalOpen && vehicleId && (
        <AddAccidentModal
          isOpen={isAddAccidentModalOpen}
          onClose={() => {
            setAddAccidentModalOpen(false);
            setVehicleId(null);
          }}
          onSuccess={() => {
            setAddAccidentModalOpen(false);
            setVehicleId(null);
            toast.success(t('customerInfo.accidents.addSuccess', 'Accident ticket created successfully'));
          }}
          preSelectedInsuredId={insuredId}
          preSelectedVehicleId={vehicleId}
        />
      )}

      {/* View Insurance Modal */}
      <ViewInsuranceModal
        isOpen={isViewInsuranceModalOpen}
        onClose={() => {
          setViewInsuranceModalOpen(false);
          setSelectedInsuranceToView(null);
        }}
        insurance={selectedInsuranceToView}
      />

      {/* View Payment Modal */}
      <ViewPaymentModal
        isOpen={isViewPaymentModalOpen}
        onClose={() => {
          setViewPaymentModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
      />

      {/* View Cheque Modal */}
      {isViewChequeModalOpen && selectedCheque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewChequeModalOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('customerInfo.cheques.viewDetails', 'Cheque Details')}</h2>
              <button
                onClick={() => setViewChequeModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('customerInfo.cheques.number', 'Cheque Number')}</label>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedCheque.chequeNumber || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('customerInfo.cheques.amount', 'Amount')}</label>
                  <p className="text-base font-semibold text-green-600 dark:text-green-400">{selectedCheque.amount ? selectedCheque.amount.toLocaleString() : '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('customerInfo.cheques.date', 'Cheque Date')}</label>
                  <p className="text-base text-gray-900 dark:text-white">{selectedCheque.chequeDate ? toLocaleDateStringEN(selectedCheque.chequeDate) : '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('customerInfo.cheques.status', 'Status')}</label>
                  <p>
                    <span className={`inline-block px-3 py-1 text-sm rounded-md font-medium ${
                      selectedCheque.status === 'cashed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : selectedCheque.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : selectedCheque.status === 'bounced'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {selectedCheque.status || '-'}
                    </span>
                  </p>
                </div>
              </div>

              {selectedCheque.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('customerInfo.cheques.notes', 'Notes')}</label>
                  <p className="text-base text-gray-900 dark:text-white mt-1">{selectedCheque.notes}</p>
                </div>
              )}

              {selectedCheque.chequeImage && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('customerInfo.cheques.image', 'Cheque Image')}</label>
                  <img
                    src={selectedCheque.chequeImage}
                    alt="Cheque"
                    className="mt-2 max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewChequeModalOpen(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CustomerInfo;


