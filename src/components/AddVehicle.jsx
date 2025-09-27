import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import { useFormik } from "formik"
import { useState } from "react"

import { Bounce, toast, ToastContainer } from "react-toastify"
function AddVehicle() {
    const { id } = useParams() 
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const navigate = useNavigate()

    
    const formik = useFormik({
        initialValues: {
            plateNumber: "",
            model: "",
            type: "",
            ownership: "",
            modelNumber: "",
            color: "",
            price: "",
            image: null,
        },
        onSubmit: async (values) => {
            try {
                setLoading(true)

                const formData = new FormData()
                formData.append("plateNumber", String(values.plateNumber))
                formData.append("model", String(values.model))
                formData.append("type", String(values.type))
                formData.append("ownership", String(values.ownership))
                formData.append("modelNumber", String(values.modelNumber))
                formData.append("licenseExpiry", String(values.licenseExpiry))
                formData.append("lastTest", String(values.lastTest))
                formData.append("color", String(values.color))
                formData.append("price", String(values.price))

                if (values.image) {
                    formData.append("image", values.image)
                }

                for (const pair of formData.entries()) {
                }

                const token = localStorage.getItem("token")

                const vehicleData = {
                    plateNumber: values.plateNumber,
                    model: values.model,
                    type: values.type,
                    ownership: values.ownership,
                    modelNumber: values.modelNumber,
                    licenseExpiry: values.licenseExpiry,
                    lastTest: values.lastTest,
                    color: values.color,
                    price: values.price,
                }


                const response = await axios({
                    method: "post",
                    url: `https://backendinsurance.onrender.com/api/v1/insured/addCar/${id}`,
                    data: vehicleData,
                    headers: {
                        Authorization: `islam__${token}`,
                        "Content-Type": "application/json",
                    },
                })

                toast.success("تمت إضافة المركبة بنجاح", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                })

                setTimeout(() => {
               //     navigate(`/Insurances`)
                                navigate(`/profile/${insuredId}`, { state: { insuredId} });

                }, 2000)
            } catch (error) {

                if (error.response?.data?.message?.errors) {
                    const errorMessages = Object.values(error.response.data.message.errors)
                        .map((err) => err.message)
                        .join(", ")
                    toast.error(`خطأ في التحقق: ${errorMessages}`)
                } else {
                    toast.error(error.response?.data?.message || "حدث خطأ في الخادم")
                }
            } finally {
                setLoading(false)
            }
        },
    })

    const handleImageChange = (event) => {
        const file = event.currentTarget.files[0]
        if (file) {
            formik.setFieldValue("image", file)

            const reader = new FileReader()
            reader.onload = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="container p-4">
            <div className="bg-[rgb(255,255,255)] rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-center">إضافة مركبة جديدة</h2>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* رقم اللوحة */}
                        <div>
                            <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 dark:text-[rgb(255,255,255)]mb-1">
                                رقم اللوحة
                            </label>
                            <input
                                type="number"
                                id="plateNumber"
                                name="plateNumber"
                                className={`w-full p-1 border dark:border-borderNav rounded-md ${formik.touched.plateNumber && formik.errors.plateNumber ? "border dark:border-borderNav-red-500" : "border dark:border-borderNav-gray-300"
                                    }`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.plateNumber}
                            />
                            {formik.touched.plateNumber && formik.errors.plateNumber && (
                                <p className="mt-1 text-sm text-red-500">{formik.errors.plateNumber}</p>
                            )}
                        </div>

                        {/* الموديل */}
                        <div>
                            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-[rgb(255,255,255)]mb-1">
                                الموديل
                            </label>
                            <input
                                type="text"
                                id="model"
                                name="model"
                                className={`w-full p-1 border dark:border-borderNav rounded-md ${formik.touched.model && formik.errors.model ? "border dark:border-borderNav-red-500" : "border dark:border-borderNav-gray-300"
                                    }`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.model}
                            />
                            {formik.touched.model && formik.errors.model && (
                                <p className="mt-1 text-sm text-red-500">{formik.errors.model}</p>
                            )}
                        </div>

                        {/* النوع */}
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-[rgb(255,255,255)]mb-1">
                                النوع
                            </label>
                            <input
                                type="text"
                                id="type"
                                name="type"
                                className={`w-full p-1 border dark:border-borderNav rounded-md ${formik.touched.type && formik.errors.type ? "border dark:border-borderNav-red-500" : "border dark:border-borderNav-gray-300"
                                    }`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.type}
                            />
                            {formik.touched.type && formik.errors.type && (
                                <p className="mt-1 text-sm text-red-500">{formik.errors.type}</p>
                            )}
                        </div>

                        {/* الملكية */}
                        <div>
                            <label htmlFor="ownership" className="block text-sm font-medium text-gray-700 dark:text-[rgb(255,255,255)]mb-1">
                                الملكية
                            </label>
                            <input
                                type="text"
                                id="ownership"
                                name="ownership"
                                className={`w-full p-1 border dark:border-borderNav rounded-md ${formik.touched.ownership && formik.errors.ownership ? "border dark:border-borderNav-red-500" : "border dark:border-borderNav-gray-300"
                                    }`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.ownership}
                            />
                            {formik.touched.ownership && formik.errors.ownership && (
                                <p className="mt-1 text-sm text-red-500">{formik.errors.ownership}</p>
                            )}
                        </div>

                        {/* رقم الموديل */}
                        <div>
                            <label htmlFor="modelNumber" className="block text-sm font-medium text-gray-700 dark:text-[rgb(255,255,255)]mb-1">
                                رقم الموديل
                            </label>
                            <input
                                type="text"
                                id="modelNumber"
                                name="modelNumber"
                                className={`w-full p-1 border dark:border-borderNav rounded-md ${formik.touched.modelNumber && formik.errors.modelNumber ? "border dark:border-borderNav-red-500" : "border dark:border-borderNav-gray-300"
                                    }`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.modelNumber}
                            />
                            {formik.touched.modelNumber && formik.errors.modelNumber && (
                                <p className="mt-1 text-sm text-red-500">{formik.errors.modelNumber}</p>
                            )}
                        </div>

                        {/* تاريخ انتهاء الرخصة */}
                        <div>
                            <label htmlFor="licenseExpiry" className="block text-sm font-medium text-gray-700 dark:text-[rgb(255,255,255)]mb-1">
                                تاريخ انتهاء الرخصة
                            </label>
                            <input
                                type="date"
                                id="licenseExpiry"
                                name="licenseExpiry"
                                className={`w-full p-1 border dark:border-borderNav rounded-md ${formik.touched.licenseExpiry && formik.errors.licenseExpiry ? "border dark:border-borderNav-red-500" : "border dark:border-borderNav-gray-300"
                                    }`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.licenseExpiry}
                            />
                            {formik.touched.licenseExpiry && formik.errors.licenseExpiry && (
                                <p className="mt-1 text-sm text-red-500">{formik.errors.licenseExpiry}</p>
                            )}
                        </div>

                        {/* تاريخ آخر فحص */}
                        <div>
                            <label htmlFor="lastTest" className="block text-sm font-medium text-gray-700 dark:text-[rgb(255,255,255)]mb-1">
                                تاريخ آخر فحص
                            </label>
                            <input
                                type="date"
                                id="lastTest"
                                name="lastTest"
                                className={`w-full p-1 border dark:border-borderNav rounded-md ${formik.touched.lastTest && formik.errors.lastTest ? "border dark:border-borderNav-red-500" : "border dark:border-borderNav-gray-300"
                                    }`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.lastTest}
                            />
                            {formik.touched.lastTest && formik.errors.lastTest && (
                                <p className="mt-1 text-sm text-red-500">{formik.errors.lastTest}</p>
                            )}
                        </div>

                        {/* اللون */}
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-[rgb(255,255,255)]mb-1">
                                اللون
                            </label>
                            <input
                                type="text"
                                id="color"
                                name="color"
                                className={`w-full p-1 border dark:border-borderNav rounded-md ${formik.touched.color && formik.errors.color ? "border dark:border-borderNav-red-500" : "border dark:border-borderNav-gray-300"
                                    }`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.color}
                            />
                            {formik.touched.color && formik.errors.color && (
                                <p className="mt-1 text-sm text-red-500">{formik.errors.color}</p>
                            )}
                        </div>

                        {/* السعر */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-[rgb(255,255,255)]mb-1">
                                السعر
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                className={`w-full p-1 border dark:border-borderNav rounded-md ${formik.touched.price && formik.errors.price ? "border dark:border-borderNav-red-500" : "border dark:border-borderNav-gray-300"
                                    }`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.price}
                            />
                            {formik.touched.price && formik.errors.price && (
                                <p className="mt-1 text-sm text-red-500">{formik.errors.price}</p>
                            )}
                        </div>

                        {/* صورة المركبة */}
                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-[rgb(255,255,255)]mb-1">
                                صورة المركبة
                            </label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                className="w-full p-1 border dark:border-borderNav border dark:border-borderNav-gray-300 rounded-md"
                                onChange={handleImageChange}
                            />
                            {imagePreview && (
                                <div className="mt-2">
                                    <img
                                        src={imagePreview || "/placeholder.svg"}
                                        alt="معاينة"
                                        className="h-32 w-auto object-cover rounded-md"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* أزرار التحكم */}
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => navigate(`/insured/${id}`)}
                            className="px-6 py-2 bg-gray-500 text-[rgb(255,255,255)] rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600  text-[rgb(255,255,255)] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? "جاري الإضافة..." : "إضافة المركبة"}
                        </button>
                    </div>
                </form>
                <ToastContainer
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={true}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    transition={Bounce}
                />
            </div>
        </div>
    )
}
export default AddVehicle