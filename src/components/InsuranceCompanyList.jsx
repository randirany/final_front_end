
import axios from "axios"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next';

function InsuranceCompanyList() {
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [companyToDelete, setCompanyToDelete] = useState(null)
    const token = localStorage.getItem('token')
    const { t, i18n: { language } } = useTranslation()

    useEffect(() => {
        fetchCompanies()
    }, [])

    const fetchCompanies = async () => {
        try {
            setLoading(true)
            const response = await axios.get("http://localhost:3002/api/v1/company/all", {
                headers: { Authorization: `islam__${token}` }
            })

            console.log('result', response.data)

            setCompanies(response.data)
        } catch (error) {
            console.error("Error fetching companies:", error)
            alert(error instanceof Error ? error.message : "فشل في جلب شركات التأمين")
        } finally {
            setLoading(false)
        }
    }

    const confirmDelete = (company) => {
        setCompanyToDelete(company)
        setShowDeleteModal(true)
    }

    const handleDeleteCompany = async () => {
        if (!companyToDelete) return

        try {
            setDeleteLoading(true)
            const response = await axios.delete(`https://backendinsurance.onrender.com/api/v1/company/delete/${companyToDelete._id}`, {
                headers: { Authorization: `islam__${token}` }

            })
            console.log('hhhh')

            console.log(response.data)

            setCompanies(companies.filter((company) => company._id !== companyToDelete._id))
            fetchCompanies()
        } catch (error) {
            console.error("Error deleting company:", error)
            alert(error instanceof Error ? error.message : "فشل في حذف شركة التأمين")
        } finally {
            setDeleteLoading(false)
            setShowDeleteModal(false)
            setCompanyToDelete(null)
        }
    }

    const filteredCompanies = companies.filter(
        (company) => company.name.includes(searchTerm) || company.insuranceType.includes(searchTerm),
    )

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-12 w-full bg-gray-200 animate-pulse rounded"></div>
                <div className="h-96 w-full bg-gray-200 animate-pulse rounded"></div>
            </div>
        )
    }

    return (
        <div className="bg-[rgb(255,255,255)] rounded-lg shadow-md">
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-80">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute right-3 top-2.5 h-4 w-4 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="بحث عن شركة تأمين..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 text-right w-full border dark:border-borderNav  dark:border-borderNav-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            dir="rtl"
                        />
                        <Link to='/add_Company'
                            className="bg-indigo-600  hover:bg-blue-700 text-[rgb(255,255,255)] px-4 py-2 rounded-md w-full md:w-auto disabled:opacity-50"
                        >اضافة شركة تامين                </Link>
                    </div>
                </div>

                {filteredCompanies.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">لا توجد شركات تأمين مطابقة للبحث</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        الاسم
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        نوع التأمين
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        معلومات الاتصال
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        العنوان
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[rgb(255,255,255)] divide-y divide-gray-200">
                                {filteredCompanies.map((company) => (
                                    <tr key={company._id}>
                                        <td className="px-6 py-4 [rgb(255,255,255)]space-nowrap text-right font-medium">{company.name}</td>
                                        <td className="px-6 py-4 [rgb(255,255,255)]space-nowrap text-right">{company.insuranceType}</td>
                                        <td className="px-6 py-4 [rgb(255,255,255)]space-nowrap text-right">{company.contact || "غير متوفر"}</td>
                                        <td className="px-6 py-4 [rgb(255,255,255)]space-nowrap text-right">{company.address || "غير متوفر"}</td>
                                        <td className="px-6 py-4 [rgb(255,255,255)]space-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/EditInsurance_company/${company._id}`} state={{ company }}>                                                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm flex items-center">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 ml-2"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                    تعديل
                                                </button>
                                                </Link>
                                                <button
                                                    onClick={() => confirmDelete(company)}
                                                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm flex items-center"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 ml-2"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
                                                    حذف
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for Delete Confirmation */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[rgb(255,255,255)] rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium mb-2 text-right">هل أنت متأكد من حذف هذه الشركة؟</h3>
                        <p className="text-gray-500 mb-4 text-right">
                            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف شركة التأمين نهائياً من قاعدة البيانات.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleDeleteCompany}
                                disabled={deleteLoading}
                                className="bg-red-600 hover:bg-red-700 text-[rgb(255,255,255)] px-4 py-2 rounded-md"
                            >
                                {deleteLoading ? "جاري الحذف..." : "نعم، حذف الشركة"}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}



export default InsuranceCompanyList;