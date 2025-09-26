import axios from "axios"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Car, Edit, Trash2, Plus } from "lucide-react"

function VehiclesList({ id }) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditModalOpen(true);
  };
  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:3002/api/v1/insured/updatevic/${id}/${selectedVehicle._id}`, selectedVehicle, {
        headers: { Authorization: `islam__${token}` },
      });

      setIsEditModalOpen(false);
      fetchVehicles()
    } catch (error) {
      console.error("Error updating vehicle:", error);
      setError("حدث خطأ أثناء تعديل المركبة");
    }
  };


  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token")
      const { data } = await axios.get(`http://localhost:3002/api/v1/insured/allVec/${id}`, {
        headers: { Authorization: `islam__${token}` },
      })
      console.log("Vehicles data:", data)
      setVehicles(data.vehicles || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching vehicles:", error)
      setError("حدث خطأ أثناء جلب بيانات المركبات")
      setLoading(false)
    }
  }

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المركبة؟")) return

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`http://localhost:3002/api/v1/insured/del/${id}/${vehicleId}`, {
        headers: { Authorization: `islam__${token}` },
      })

      fetchVehicles()
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      setError("حدث خطأ أثناء حذف المركبة")
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border dark:border-borderNav-t-2 border dark:border-borderNav-b-2 border dark:border-borderNav-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border dark:border-borderNav border dark:border-borderNav-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">خطأ! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    )
  }

  return (
    <div className=" p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">المركبات</h2>
        <Link
          to={`/insured/${id}/add-vehicle`}
          className="bg-green-600 text-[rgb(255,255,255)] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          <span>بيانات المركبات</span>
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Car size={48} className="mx-auto mb-2 opacity-30" />
          <p>لا توجد مركبات مسجلة لهذا المؤمن</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[rgb(255,255,255)] border dark:border-borderNav border dark:border-borderNav-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border dark:border-borderNav-b text-right">رقم اللوحة</th>
                <th className="py-2 px-4 border dark:border-borderNav-b text-right">الموديل</th>
                <th className="py-2 px-4 border dark:border-borderNav-b text-right">النوع</th>
                <th className="py-2 px-4 border dark:border-borderNav-b text-right">الملكية</th>
                <th className="py-2 px-4 border dark:border-borderNav-b text-right">تاريخ انتهاء الرخصة</th>
                <th className="py-2 px-4 border dark:border-borderNav-b text-right">اللون</th>
                <th className="py-2 px-4 border dark:border-borderNav-b text-right">السعر</th>
                <th className="py-2 px-4 border dark:border-borderNav-b text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border dark:border-borderNav-b">{vehicle.plateNumber}</td>
                  <td className="py-2 px-4 border dark:border-borderNav-b">{vehicle.model}</td>
                  <td className="py-2 px-4 border dark:border-borderNav-b">{vehicle.type}</td>
                  <td className="py-2 px-4 border dark:border-borderNav-b">{vehicle.ownership}</td>
                  <td className="py-2 px-4 border dark:border-borderNav-b">{new Date(vehicle.licenseExpiry).toLocaleDateString("ar-EG")}</td>
                  <td className="py-2 px-4 border dark:border-borderNav-b">{vehicle.color}</td>
                  <td className="py-2 px-4 border dark:border-borderNav-b">{vehicle.price}</td>
                  <td className="py-2 px-4 border dark:border-borderNav-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditVehicle(vehicle)}
                        className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                        title="تعديل"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isEditModalOpen && selectedVehicle && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-[rgb(255,255,255)] p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">تعديل المركبة</h2>
                <form onSubmit={handleUpdateVehicle}>
                  <input
                    type="text"
                    value={selectedVehicle.plateNumber}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, plateNumber: e.target.value })}
                    className="w-full p-2 border dark:border-borderNav rounded mb-2"
                    placeholder="رقم اللوحة"
                  />
                  <input
                    type="text"
                    value={selectedVehicle.model}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, model: e.target.value })}
                    className="w-full p-2 border dark:border-borderNav rounded mb-2"
                    placeholder="الموديل"
                  />
                  <input
                    type="text"
                    value={selectedVehicle.ownership}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, ownership: e.target.value })}
                    className="w-full p-2 border dark:border-borderNav rounded mb-2"
                    placeholder="الملكية"
                  />
                  <input
                    type="text"
                    value={selectedVehicle.type}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, type: e.target.value })}
                    className="w-full p-2 border dark:border-borderNav rounded mb-2"
                    placeholder="النوع"
                  />
                  <input
                    type="text"
                    value={selectedVehicle.color}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, color: e.target.value })}
                    className="w-full p-2 border dark:border-borderNav rounded mb-2"
                    placeholder="اللون"
                  />
                  <input
                    type="number"
                    value={selectedVehicle.price}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, price: e.target.value })}
                    className="w-full p-2 border dark:border-borderNav rounded mb-2"
                    placeholder="السعر"
                  />
                  <input
                    type="date"
                    value={selectedVehicle.licenseExpiry?.split("T")[0]}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, licenseExpiry: e.target.value })}
                    className="w-full p-2 border dark:border-borderNav rounded mb-2"
                    placeholder="تاريخ انتهاء الرخصة"
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-400 text-[rgb(255,255,255)] px-4 py-2 rounded">إغلاق</button>
                    <button type="submit" className="bg-indigo-600  text-[rgb(255,255,255)] px-4 py-2 rounded">حفظ التغييرات</button>
                  </div>
                </form>

              </div>
            </div>
          )}

        </div>

      )}
    </div>
  )
}

export default VehiclesList

