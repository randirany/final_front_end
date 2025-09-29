import { useState } from "react";
import { X } from "lucide-react";

function CancelInsuranceModal({ isOpen, onClose, onConfirm }) {
  const [refundAmount, setRefundAmount] = useState(0);
  const [paidBy, setPaidBy] = useState("customer");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm({ refundAmount, paidBy, paymentMethod, description });
      // Reset form after success
      setRefundAmount(0);
      setPaidBy("customer");
      setPaymentMethod("cash");
      setDescription("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-navbarBack rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">Cancel Insurance</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Refund Amount</label>
            <input
              type="number"
              min="0"
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Paid By</label>
            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white">
              <option value="customer">Customer</option>
              <option value="company">Company</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white">
              <option value="cash">Cash</option>
              <option value="visa">Visa</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Optional description"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Cancel"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CancelInsuranceModal;
