import { useState, useEffect, useRef } from "react";
import { X, FileText, Trash2 } from "lucide-react";
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

// --- Alert Message Component ---
const AlertMessage = ({ message, type }) => {
    if (!message) return null;
    const baseClasses = 'p-4 mb-4 text-sm rounded-lg text-center';
    const typeClasses = {
        success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    };
    return (
        <div className={`${baseClasses} ${typeClasses[type] || typeClasses.error}`} role="alert">
            <span className="font-medium">{message}</span>
        </div>
    );
};

// --- File Preview Component ---
const FilePreview = ({ file, onRemove }) => {
    const isImage = file.type.startsWith('image/');
    return (
        <div className="relative group w-full h-24 border dark:border-gray-600 rounded-md flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700/50">
            {isImage ? (
                <img src={URL.createObjectURL(file)} alt={file.name} className="max-w-full max-h-full object-contain rounded" />
            ) : (
                <FileText className="w-10 h-10 text-gray-500" />
            )}
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md">
                <p className="text-white text-xs break-all">{file.name}</p>
            </div>
            <button
                type="button"
                onClick={onRemove}
                title="Remove file"
                className="absolute -top-2 -right-2 z-10 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none transition-transform transform group-hover:scale-100 scale-0"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );
};

// --- Main Component ---
function AddInsuranceMandatory({ onClose, isOpen, vehicleId, insuredId, onInsuranceAdded }) {
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState([]);
    const [company, setCompany] = useState([]);
    const [apiMessage, setApiMessage] = useState({ text: '', type: '' });

    const initialFormState = {
        insuranceType: "",
        insuranceCompany: "",
        agent: "",
        paymentMethod: "",
        paidAmount: "",
        isUnder24: "false",
        priceisOnTheCustomer: ""
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- Fetch Agents ---
    const fetchAgents = async () => {
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get("http://localhost:3002/api/v1/agents/all", { headers: { token } });
            setAgents(res.data.getAll || []);
        } catch {}
    };

    // --- Fetch Companies ---
    const fetchCompany = async () => {
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.get("http://localhost:3002/api/v1/company/all", { headers: { token } });
            setCompany(res.data || []);
        } catch {}
    };

    // --- Reset Form when Modal Opens ---
    useEffect(() => {
        if (isOpen) {
            fetchAgents();
            fetchCompany();
            setFormData(initialFormState);
            setFiles([]);
            setApiMessage({ text: '', type: '' });
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [isOpen]);

    // --- Handle Input Change ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- Handle File Change ---
    const handleFileChange = (selectedFiles) => {
        if (selectedFiles && selectedFiles.length > 0) {
            setFiles(prev => [...prev, ...Array.from(selectedFiles)]);
        }
    };

    const handleRemoveFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFileChange(e.dataTransfer.files); };
    const handleBrowseClick = () => fileInputRef.current?.click();

    // --- Handle Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ text: '', type: '' });

        // --- Validation ---
        if (!formData.insuranceType) return setApiMessage({ text: "Insurance Type required", type: "error" });
        if (!formData.insuranceCompany) return setApiMessage({ text: "Insurance Company required", type: "error" });
     
        if (!formData.paymentMethod) return setApiMessage({ text: "Payment Method required", type: "error" });
        if (!formData.priceisOnTheCustomer) return setApiMessage({ text: "Price on customer required", type: "error" });
        if (!formData.paidAmount) return setApiMessage({ text: "Paid Amount required", type: "error" });
       // if (!insuredId || !vehicleId) return setApiMessage({ text: "Missing insured or vehicle ID", type: "error" });

        setLoading(true);
        try {
            const formDataToSubmit = new FormData();
            Object.entries({
                ...formData,
                isUnder24: formData.isUnder24 === 'true'
            }).forEach(([key, val]) => formDataToSubmit.append(key, val));

            files.forEach(file => formDataToSubmit.append('insuranceFiles', file));

            const token = `islam__${localStorage.getItem("token")}`;
            const res = await axios.post(
                `http://localhost:3002/api/v1/insured/addInsurance/${insuredId}/${vehicleId}`,
                formDataToSubmit,
                { headers: { token, 'Content-Type': 'multipart/form-data' } }
            );

            setApiMessage({ text: res.data.message || "Insurance added successfully", type: "success" });
            setTimeout(() => { if (onInsuranceAdded) onInsuranceAdded(); onClose(); }, 1500);

        } catch (error) {
            let msg = "Failed to add insurance";
            if (error.response) msg = error.response.data.message || msg;
            setApiMessage({ text: msg, type: "error" });
        } finally { setLoading(false); }
    };

    if (!isOpen) return null;

    const paymentMethodOptions = [
        { value: "cash", label: "Cash" },
        { value: "card", label: "Card" },
        { value: "check", label: "Check" },
        { value: "bank_transfer", label: "Bank Transfer" },
    ];

    const insuranceTypeOptions = [
        { value: "compulsory", label: "Compulsory" },
        { value: "comprehensive", label: "Comprehensive" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => { if (!loading) onClose(); }}>
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 dark:bg-navbarBack h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-3 border-b dark:border-gray-700 mb-4 sticky top-0 bg-white dark:bg-navbarBack z-10 px-0 pt-0">
                    <h2 className="text-xl font-semibold dark:text-white">Add New Insurance</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" disabled={loading}><X className="w-5 h-5" /></button>
                </div>

                <div className="overflow-y-auto hide-scrollbar flex-grow">
                    <form onSubmit={handleSubmit} className="space-y-4 pr-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Insurance Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Insurance Type <span className="text-red-500">*</span></label>
                                <select name="insuranceType" value={formData.insuranceType} onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white">
                                    <option value="">Choose Type</option>
                                    {insuranceTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>

                            {/* Insurance Company */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Insurance Company <span className="text-red-500">*</span></label>
                                <select name="insuranceCompany" value={formData.insuranceCompany} onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white">
                                    <option value="">Choose Company</option>
                                    {company.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Agent */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agent </label>
                                <select name="agent" value={formData.agent} onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white">
                                    <option value="">Choose Agent</option>
                                    {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                                </select>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method <span className="text-red-500">*</span></label>
                                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white">
                                    <option value="">Choose Payment Method</option>
                                    {paymentMethodOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>

                            {/* Price On Customer */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price on Customer <span className="text-red-500">*</span></label>
                                <input type="number" name="priceisOnTheCustomer" value={formData.priceisOnTheCustomer} onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white" step="any" />
                            </div>

                            {/* Paid Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paid Amount <span className="text-red-500">*</span></label>
                                <input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white" step="any" />
                            </div>

                            {/* Is Under 24 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Driver Under 24?</label>
                                <select name="isUnder24" value={formData.isUnder24} onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-md dark:bg-gray-700 dark:text-white">
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className='mt-4'>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attachments (Optional)</label>
                            {files.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                                    {files.map((file, index) => (
                                        <FilePreview key={index} file={file} onRemove={() => handleRemoveFile(index)} />
                                    ))}
                                </div>
                            )}
                            <div onClick={handleBrowseClick} className={`relative flex cursor-pointer flex-col items-center justify-center h-40 border-2 border-dashed rounded-md transition-colors ${isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "border-gray-300 hover:border-gray-400 dark:border-gray-600"}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                <div className="flex flex-col items-center justify-center space-y-2 text-center p-4">
                                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline" onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}>Click to upload</span> or drag and drop</p>
                                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFileChange(e.target.files)} accept=".pdf,.png,.jpg,.jpeg" />
                                </div>
                            </div>
                        </div>

                        {/* API Message */}
                        <div className="pt-2"><AlertMessage message={apiMessage.text} type={apiMessage.type} /></div>

                        {/* Submit */}
                        <div className="pt-3 flex justify-end">
                            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
                                {loading ? "Saving..." : "Add Insurance"}
                            </button>
                        </div>
                    </form>
                </div>

                <ToastContainer />
            </div>
        </div>
    );
}

export default AddInsuranceMandatory;
