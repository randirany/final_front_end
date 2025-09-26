import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { useTranslation } from 'react-i18next';

function AddInsuranceCompany({ onClose, isOpen, onCompanyAdded }) {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [insuranceTypes, setInsuranceTypes] = useState([
    { type: "compulsory", price: "" },
  ]);
  const [roadServices, setRoadServices] = useState([]);
  const [apiMessage, setApiMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "" });
      setInsuranceTypes([{ type: "compulsory", price: "" }]);
      setRoadServices([]);
      setApiMessage({ text: "", type: "" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInsuranceChange = (index, field, value) => {
    const updated = [...insuranceTypes];
    updated[index][field] = value;
    setInsuranceTypes(updated);
  };

  const handleRoadServiceChange = (index, field, value) => {
    const updated = [...roadServices];
    updated[index][field] = value;
    setRoadServices(updated);
  };

  const addInsuranceType = () => {
    setInsuranceTypes([...insuranceTypes, { type: "compulsory", price: "" }]);
  };

  const removeInsuranceType = (index) => {
    setInsuranceTypes(insuranceTypes.filter((_, i) => i !== index));
  };

  const addRoadService = () => {
    setRoadServices([...roadServices, { name: "", price: "" }]);
  };

  const removeRoadService = (index) => {
    setRoadServices(roadServices.filter((_, i) => i !== index));
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setApiMessage({ text: t("insuranceCompany.errors.nameRequired"), type: "error" });
      return;
    }

    if (insuranceTypes.length === 0) {
      setApiMessage({ text: t("insuranceCompany.errors.atLeastOneType"), type: "error" });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        insuranceTypes: insuranceTypes.map((it) => ({
          type: it.type,
          price: Number(it.price),
        })),
        roadServices: roadServices.map((rs) => ({
          name: rs.name,
          price: Number(rs.price),
        })),
      };

      await axios.post(
        "http://localhost:3002/api/v1/company/addInsuranceCompany",
        payload,
        { headers: { token: `islam__${token}` } }
      );

      setApiMessage({ text: t("insuranceCompany.success.added"), type: "success" });
      setTimeout(() => {
        if (onCompanyAdded) onCompanyAdded();
        onClose(true);
      }, 1500);
    } catch (error) {
      setApiMessage({ text: t("insuranceCompany.errors.addFailed"), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
      onClick={() => !loading && onClose(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-navbarBack rounded-lg shadow-xl p-6 h-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("insuranceCompany.addTitle")}
          </h2>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4 overflow-y-auto" onSubmit={handleSubmit}>
          {/* Company Name */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-200">
              {t("insuranceCompany.fields.name")} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Insurance Types */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {t("insuranceCompany.fields.insuranceTypes")}
              </h3>
              <button
                type="button"
                onClick={addInsuranceType}
                className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400"
              >
                <Plus size={16} /> {t("common.add")}
              </button>
            </div>
            {insuranceTypes.map((ins, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select
                  value={ins.type}
                  onChange={(e) => handleInsuranceChange(i, "type", e.target.value)}
                  className="p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="compulsory">{t("insuranceCompany.type.compulsory")}</option>
                  <option value="comprehensive">{t("insuranceCompany.type.comprehensive")}</option>
                </select>
                <input
                  type="number"
                  placeholder={t("insuranceCompany.fields.price")}
                  value={ins.price}
                  onChange={(e) => handleInsuranceChange(i, "price", e.target.value)}
                  className="p-2 border rounded-md flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => removeInsuranceType(i)}
                  className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Road Services */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {t("insuranceCompany.fields.roadServices")}
              </h3>
              <button
                type="button"
                onClick={addRoadService}
                className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400"
              >
                <Plus size={16} /> {t("common.add")}
              </button>
            </div>
            {roadServices.map((rs, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder={t("insuranceCompany.fields.serviceName")}
                  value={rs.name}
                  onChange={(e) => handleRoadServiceChange(i, "name", e.target.value)}
                  className="p-2 border rounded-md flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <input
                  type="number"
                  placeholder={t("insuranceCompany.fields.price")}
                  value={rs.price}
                  onChange={(e) => handleRoadServiceChange(i, "price", e.target.value)}
                  className="p-2 border rounded-md w-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => removeRoadService(i)}
                  className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* API message */}
          {apiMessage.text && (
            <div
              className={`p-2 text-sm rounded ${
                apiMessage.type === "success"
                  ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                  : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
              }`}
            >
              {apiMessage.text}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onClose(false)}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-900 rounded-md dark:bg-gray-700 dark:text-gray-100"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500"
            >
              {loading ? t("common.saving") : t("common.add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddInsuranceCompany;

