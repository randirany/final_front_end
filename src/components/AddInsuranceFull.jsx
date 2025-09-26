import { useState, useRef } from "react"
import { X } from "lucide-react";
import { useTranslation } from 'react-i18next';
function AddInsuranceFull({ onClose, isOpen }) {
    if (!isOpen) return null;
    const [files, setFiles] = useState([])
    const fileInputRef = useRef(null)
    const dropAreaRef = useRef(null)
    const { t, i18n: { language } } = useTranslation()

    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }
    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files)
            setFiles(newFiles)
        }
    }

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setFiles(newFiles)
        }
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-[800px] bg-[rgb(255,255,255)] rounded-lg shadow-lg p-6  ">
                <div className="flex items-center justify-between pb-1   px-4 py-1 rounded-md">
                    <h2 className="text-2xl font-semibold  rounded-md ">
                        Add New Insurance
                    </h2>
                    <button onClick={() => onClose(false)} className="p-1 rounded-full hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form className="mt-2 space-y-4 rounded-md border dark:border-borderNav border dark:border-borderNav-gray-300 dark:border dark:border-borderNav-dark3 ">
                    <div className="flex items-center justify-between pb-2 border dark:border-borderNav-b border dark:border-borderNav-gray-300   ">
                        <p className="text-[16px] font-semibold  px-4 py-2 rounded-md">
                            New Insurance  Form
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 px-4">
                        <div>
                            <label className="block text-sm font-medium ">Start Date   </label>
                            <input type="date" className="w-full p-2 border dark:border-borderNav rounded-md text-[#9CA3AF]" placeholder="Enter Vehicle Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">End Date </label>
                            <input type="date" className="w-full p-2 border dark:border-borderNav rounded-md text-[#9CA3AF]" placeholder="Enter Vehicle Number" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Insurance Type </label>
                            <select className="w-full p-2 border dark:border-borderNav rounded-md text-[#9CA3AF]">
                                <option disabled selected >Choose Type </option>
                                <option>Car</option>
                                <option>Truck</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Is Customer Under 24 ? </label>
                            <select className="w-full p-2 border dark:border-borderNav rounded-md text-[#9CA3AF]">
                                <option>Yes</option>
                                <option>No</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Insurance Company </label>
                            <select className="w-full p-2 border dark:border-borderNav rounded-md text-[#9CA3AF]">
                                <option>Choose Insurance typw </option>
                                <option>Car</option>
                                <option>Truck</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Payment Method </label>
                            <select className="w-full p-2 border dark:border-borderNav rounded-md text-[#9CA3AF]">
                                <option>Choose city </option>
                                <option>Car</option>
                                <option>Truck</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Dealer </label>
                            <select className="w-full p-2 border dark:border-borderNav rounded-md text-[#9CA3AF]">
                                <option>Choose city </option>
                                <option>Car</option>
                                <option>Truck</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Insurance Amount </label>
                            <input type="text" className="w-full p-2 border dark:border-borderNav rounded-md" placeholder="Enter Insurance Amount" />
                        </div>

                    </div>

                    {/* رفع صورة المركبة */}
                    <div className='px-4'>
                        <label className="block text-sm font-medium">Attachments</label>

                        <div
                            onClick={handleBrowseClick}
                            ref={dropAreaRef}
                            className={`w-full max-w-[974px] relative flex cursor-pointer h-[80px] flex-col items-center justify-center h-64 border dark:border-borderNav-1 rounded-md bg-[#DEE4EE] ${isDragging ? "border dark:border-borderNav-[#5750F1] bg-[#5750F1]/5" : "border dark:border-borderNav-gray-300"
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col items-center justify-center  text-center py-1">
                                <svg width="30" height="30" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g filter="url(#filter0_d_77_976)">
                                        <rect x="2.62695" y="1.06055" width="60" height="60" rx="30" fill="[rgb(255,255,255)]" shapeRendering="crispEdges" />
                                        <g clipPath="url(#clip0_77_976)">
                                            <path d="M41.377 34.8105C41.002 34.8105 40.6582 35.123 40.6582 35.5293V38.3105C40.6582 38.5918 40.4395 38.8105 40.1582 38.8105H25.0957C24.8145 38.8105 24.5957 38.5918 24.5957 38.3105V35.5293C24.5957 35.123 24.252 34.8105 23.877 34.8105C23.502 34.8105 23.1582 35.123 23.1582 35.5293V38.3105C23.1582 39.373 24.002 40.2168 25.0645 40.2168H40.1582C41.2207 40.2168 42.0645 39.373 42.0645 38.3105V35.5293C42.0957 35.123 41.752 34.8105 41.377 34.8105Z" fill="#111928" />
                                            <path d="M28.5957 27.5293L31.9395 24.2793V35.0918C31.9395 35.4668 32.252 35.8105 32.6582 35.8105C33.0332 35.8105 33.377 35.498 33.377 35.0918V24.2793L36.7207 27.5293C36.8457 27.6543 37.0332 27.7168 37.2207 27.7168C37.4082 27.7168 37.5957 27.6543 37.7207 27.498C38.002 27.2168 37.9707 26.7793 37.7207 26.498L33.127 22.123C32.8457 21.873 32.4082 21.873 32.1582 22.123L27.5957 26.5293C27.3145 26.8105 27.3145 27.248 27.5957 27.5293C27.877 27.7793 28.3145 27.8105 28.5957 27.5293Z" fill="#111928" />
                                        </g>
                                    </g>
                                    <defs>
                                        <filter id="filter0_d_77_976" x="0.626953" y="0.0605469" width="64" height="64" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                            <feOffset dy="1" />
                                            <feGaussianBlur stdDeviation="1" />
                                            <feComposite in2="hardAlpha" operator="out" />
                                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_77_976" />
                                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_77_976" result="shape" />
                                        </filter>
                                        <clipPath id="clip0_77_976">
                                            <rect width="20" height="20" fill="[rgb(255,255,255)]" transform="translate(22.627 21.0605)" />
                                        </clipPath>
                                    </defs>
                                </svg>

                                <div>
                                    <p className="text-md text-gray-600">Drop Files here to upload</p>
                                    {/* <p className="mt-2 text-xs text-gray-500">or</p> */}
                                    {/* <button onClick={handleBrowseClick} className="mt-2 text-sm font-medium text-[#5750F1] hover:underline">
                  Browse files
                </button> */}
                                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInputChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* زر الإرسال */}
                    <div className="flex justify-end px-4">
                        <input type="submit" className="px-4 py-1 w-full text-[rgb(255,255,255)] bg-indigo-600 rounded-md hover:bg-indigo-500" />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddInsuranceFull