import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

function TransferInsuranceModal({ isOpen, close, insurance, fromVehicle, insuredId, vehicles, fetchVehicles }) {
  const [targetVehicleId, setTargetVehicleId] = useState("");
  const [customerFee, setCustomerFee] = useState(0);
  const [companyFee, setCompanyFee] = useState(0);
  const [customerPaymentMethod, setCustomerPaymentMethod] = useState("");
  const [companyPaidBy, setCompanyPaidBy] = useState("");
  const [companyPaymentMethod, setCompanyPaymentMethod] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !insurance || !fromVehicle) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetVehicleId) {
      toast.error("Please select a target vehicle.");
      return;
    }

    try {
      setLoading(true);
      const token = `islam__${localStorage.getItem("token")}`;

      const body = { customerFee, companyFee, customerPaymentMethod, companyPaidBy, companyPaymentMethod, description };

  await axios.post(
  `http://localhost:3002/api/v1/revenue/transferInsurance/${insuredId}/${fromVehicle._id}/${targetVehicleId}/${insurance._id}`,
  body
);

      toast.success("Insurance transferred successfully!");
      fetchVehicles(); // refresh
      close();
    } catch (error) {
      console.error(error);
      toast.error("Failed to transfer insurance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-300"
          onClick={close}
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Transfer Insurance
        </h2>

 <form onSubmit={handleSubmit} className="space-y-4">
  {/* Target Vehicle */}
  <div>
    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
      Select Target Vehicle
    </label>
    <select
      value={targetVehicleId}
      onChange={(e) => setTargetVehicleId(e.target.value)}
      className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
    >
      <option value="">-- Choose Vehicle --</option>
      {vehicles
        .filter((v) => v._id !== fromVehicle._id)
        .map((v) => (
          <option key={v._id} value={v._id}>
            {v.plateNumber} ({v.model || "Unknown"})
          </option>
        ))}
    </select>
  </div>

  {/* Fees and Payment */}
  <div className="grid grid-cols-1 gap-4">
    {/* Customer Fee */}
    <div>
      <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
        Customer Fee
      </label>
      <input
        type="number"
        placeholder="Enter customer fee (e.g., 50)"
        value={customerFee}
        onChange={(e) => setCustomerFee(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
      />
    </div>

    {/* Company Fee */}
    <div>
      <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
        Company Fee
      </label>
      <input
        type="number"
        placeholder="Enter company fee (e.g., 30)"
        value={companyFee}
        onChange={(e) => setCompanyFee(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
      />
    </div>

    {/* Customer Payment Method */}
    <div>
      <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
        Customer Payment Method
      </label>
      <input
        type="text"
        placeholder="Cash, Credit Card, etc."
        value={customerPaymentMethod}
        onChange={(e) => setCustomerPaymentMethod(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
      />
    </div>

    {/* Company Paid By */}
    <div>
      <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
        Company Paid By
      </label>
      <input
        type="text"
        placeholder="Company, Insurance, etc."
        value={companyPaidBy}
        onChange={(e) => setCompanyPaidBy(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
      />
    </div>

    {/* Company Payment Method */}
    <div>
      <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
        Company Payment Method
      </label>
      <input
        type="text"
        placeholder="Bank Transfer, Cash, etc."
        value={companyPaymentMethod}
        onChange={(e) => setCompanyPaymentMethod(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
      />
    </div>
  </div>

  {/* Description */}
  <div>
    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
      Description (optional)
    </label>
    <textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      rows={3}
      className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
    />
  </div>

  {/* Buttons */}
  <div className="flex justify-end gap-2">
    <button
      type="button"
      onClick={close}
      className="px-4 py-2 text-sm rounded bg-gray-200 dark:bg-gray-600 dark:text-white"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={loading}
      className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      {loading ? "Transferring..." : "Confirm Transfer"}
    </button>
  </div>
</form>
      </div>
    </div>
  );
}

export default TransferInsuranceModal;
