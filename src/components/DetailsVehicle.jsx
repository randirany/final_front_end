import { useRef, useState } from "react"
import car from "../assets/car.png"
import carLisence from "../assets/car_lisence.png"
import { NavLink } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules"
import logo from "../assets/logoo.png"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/scrollbar"
import ReportAccident from './ReportAccident';

function DetailsVehicle() {
    const [attachmentFiles, setAttachmentFiles] = useState([

    ])
    const [isReportOpen, setIsReportOpen] = useState(false);

    const [slug, setSlug] = useState('')
    const customerData = {
        name: "Islam Tuhasi",
        mobile: "0566008007",
        identity: "4026596017",
        age: "28",
        joinDate: "01/01/2023",
        customerSource: "Dealer - Amro",
        notes: "No Notes For this user",
    }
    const prevRef = useRef(null)
    const nextRef = useRef(null)


    return (
        <div className="navblayout py-1">
            <div className="bg-[rgb(255,255,255)] flex p-[22px] rounded-md justify-between items-center dark:bg-navbarBack mt-4 dark:text-dark3">
                <div className="flex gap-[14px]">
                    <NavLink to="/home" className="hover:text-[#5750F1]">Home</NavLink>
                    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11.9392 4.55806C12.1833 4.31398 12.579 4.31398 12.8231 4.55806L17.8231 9.55806C18.0672 9.80214 18.0672 10.1979 17.8231 10.4419L12.8231 15.4419C12.579 15.686 12.1833 15.686 11.9392 15.4419C11.6952 15.1979 11.6952 14.8021 11.9392 14.5581L15.8723 10.625H4.04785C3.70267 10.625 3.42285 10.3452 3.42285 10C3.42285 9.65482 3.70267 9.375 4.04785 9.375H15.8723L11.9392 5.44194C11.6952 5.19786 11.6952 4.80214 11.9392 4.55806Z"
                            fill="#6B7280"
                        />
                    </svg>
                    <NavLink to="/user" className="text-[#6B7280] hover:text-[#5750F1]">Customers</NavLink>
                    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11.9392 4.55806C12.1833 4.31398 12.579 4.31398 12.8231 4.55806L17.8231 9.55806C18.0672 9.80214 18.0672 10.1979 17.8231 10.4419L12.8231 15.4419C12.579 15.686 12.1833 15.686 11.9392 15.4419C11.6952 15.1979 11.6952 14.8021 11.9392 14.5581L15.8723 10.625H4.04785C3.70267 10.625 3.42285 10.3452 3.42285 10C3.42285 9.65482 3.70267 9.375 4.04785 9.375H15.8723L11.9392 5.44194C11.6952 5.19786 11.6952 4.80214 11.9392 4.55806Z"
                            fill="#6B7280"
                        />
                    </svg>
                    <NavLink to="/" className="text-[#6B7280] hover:text-[#5750F1]">1</NavLink>
                    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11.9392 4.55806C12.1833 4.31398 12.579 4.31398 12.8231 4.55806L17.8231 9.55806C18.0672 9.80214 18.0672 10.1979 17.8231 10.4419L12.8231 15.4419C12.579 15.686 12.1833 15.686 11.9392 15.4419C11.6952 15.1979 11.6952 14.8021 11.9392 14.5581L15.8723 10.625H4.04785C3.70267 10.625 3.42285 10.3452 3.42285 10C3.42285 9.65482 3.70267 9.375 4.04785 9.375H15.8723L11.9392 5.44194C11.6952 5.19786 11.6952 4.80214 11.9392 4.55806Z"
                            fill="#6B7280"
                        />
                    </svg>
                    <NavLink to="/" className="text-[#6B7280] hover:text-[#5750F1]">Vehicles</NavLink>
                    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11.9392 4.55806C12.1833 4.31398 12.579 4.31398 12.8231 4.55806L17.8231 9.55806C18.0672 9.80214 18.0672 10.1979 17.8231 10.4419L12.8231 15.4419C12.579 15.686 12.1833 15.686 11.9392 15.4419C11.6952 15.1979 11.6952 14.8021 11.9392 14.5581L15.8723 10.625H4.04785C3.70267 10.625 3.42285 10.3452 3.42285 10C3.42285 9.65482 3.70267 9.375 4.04785 9.375H15.8723L11.9392 5.44194C11.6952 5.19786 11.6952 4.80214 11.9392 4.55806Z"
                            fill="#6B7280"
                        />
                    </svg>
                    <NavLink to="/" className="text-[#6B7280] hover:text-[#5750F1]">123</NavLink>

                </div>


            </div>

            <div className="flex gap-3 py-4">
                <div className="w-64 rounded-lg bg-[rgb(255,255,255)]  dark:bg-navbarBack  p-6 shadow-sm">
                    <div className="">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 text-[30px]  dark:text-[rgb(255,255,255)]">Customer Info</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500">Name</label>
                                <p className="text-gray-900 dark:text-[rgb(255,255,255)]">{customerData.name}</p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500">Mobile</label>
                                <p className="text-gray-900 dark:text-[rgb(255,255,255)]">{customerData.mobile}</p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500">Identity</label>
                                <p className="text-gray-900 dark:text-[rgb(255,255,255)]">{customerData.identity}</p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500">Age</label>
                                <p className="text-gray-900 dark:text-[rgb(255,255,255)]">{customerData.age}</p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500">Join Date</label>
                                <p className="text-gray-900 dark:text-[rgb(255,255,255)]">{customerData.joinDate}</p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500">Customer Source</label>
                                <p className="text-gray-900 dark:text-[rgb(255,255,255)]">{customerData.customerSource}</p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500">Notes</label>
                                <p className="text-gray-500">{customerData.notes}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[calc(100%-17rem)]">
                    {/* Attachments Section */}
                    <div className="mb-6 rounded-lg bg-[rgb(255,255,255)]  dark:bg-navbarBack  p-3 shadow-sm">
                        <div>

                        </div>
                        <div className="mb-4 flex items-center gap-2 justify-end">
                            {/* <h2 className="text-lg font-semibold text-gray-900">Attachments</h2> */}

                            <button
                                className="rounded-lg bg-[#5750F1] px-4 py-2 text-sm font-medium text-[rgb(255,255,255)] hover:bg-[#5750F1]/90"
                            >
                                Update Vehicle Details
                            </button>
                            <button
                                className="rounded-lg bg-[#5750F1] px-4 py-2 text-sm font-medium text-[rgb(255,255,255)] hover:bg-[#5750F1]/90"
                            >
                                Delete Vehicle Details
                            </button>  </div>

                        <div className="relative  flex gap-2">


                            <div className="max-w-[230px] ">
                                <div className=" p-2 border-2  dark:border-borderNav-[#C3CEF6] rounded-[8px] h-[100%]">
                                    {/* <img src={`${vehicle}`} /> */}
                                    <img src={`${car}`} alt="" />
                                    <div className="relative w-[146px] ">
                                        <img src={`${carLisence}`} />
                                        <p className="absolute top-[-5px] left-5 text-[29px]">123456</p>
                                    </div>
                                </div>

                            </div>

                            <div className="flex flex-wrap gap-3     dark:border-borderNav-[#C3CEF6] justify-center px-[3px] py-[10px]  rounded-[8px] " >
                                <div className="w-[85px] h-[95px]   dark:border-borderNav-[#C3CEF6] rounded-[8px]">
                                    <p className="bg-[#C3CEF6] rounded-b-[8px] text-[12px] py-[15px] px-[4px]">
                                        Vehicle Name
                                    </p>
                                    <p className="text-[#808080] text-[12px] rounded-b-[8px] py-[10px] px-[3px] text-center">Work Vehicle</p>
                                </div>
                                <div className="w-[85px] h-[95px]  dark:border-borderNav-2  dark:border-borderNav-[#C3CEF6] rounded-[8px]  text-center">
                                    <p className="bg-[#C3CEF6] rounded-b-[8px] text-[12px] py-[8px]">
                                        License End Date
                                    </p>
                                    <p className="text-[#808080] text-[12px] rounded-b-[8px] py-[10px] px-[3px] text-center">Work Vehicle</p>
                                </div>

                                <div className="w-[85px] h-[95px]  dark:border-borderNav-2  dark:border-borderNav-[#C3CEF6] rounded-[8px]  text-center">
                                    <p className="bg-[#C3CEF6] rounded-b-[8px] text-[12px] py-[15px] ">
                                        Vehicle Number
                                    </p>
                                    <p className="text-[#808080] text-[12px] rounded-b-[8px] py-[10px] px-[3px] text-center">Work Vehicle</p>
                                </div>

                                <div className="w-[85px] h-[95px]  dark:border-borderNav-2  dark:border-borderNav-[#C3CEF6] rounded-[8px] text-center">
                                    <p className="bg-[#C3CEF6] rounded-b-[8px] text-[12px] py-[15px] px-[4px]">
                                        Vehicle Name
                                    </p>
                                    <p className="text-[#808080] text-[12px] rounded-b-[8px] py-[10px] px-[3px] text-center">Work Vehicle</p>
                                </div>
                                <div className="w-[85px] h-[95px]     rounded-[8px] text-center">
                                    <p className="bg-[#C3CEF6] rounded-b-[8px] text-[12px] py-[15px] ">
                                        Vehicle Model                                    </p>
                                    <p className="text-[#808080] text-[12px] rounded-b-[8px] py-[10px] px-[3px] text-center">Work Vehicle</p>
                                </div>
                                <div className="w-[85px] h-[95px]    rounded-[8px] text-center">
                                    <p className="bg-[#C3CEF6] rounded-b-[8px] text-[12px] py-[15px] ">
                                        Vehicle Name
                                    </p>
                                    <p className="text-[#808080] text-[12px] rounded-b-[8px] py-[5px] px-[3px] text-center">Work Vehicle</p>
                                </div>
                                <div className="w-[85px] h-[95px]   rounded-[8px] text-center">
                                    <p className="bg-[#C3CEF6] rounded-b-[8px] text-[12px] py-[15px] ">
                                        Vehicle Name
                                    </p>
                                    <p className="text-[#808080] text-[12px] rounded-b-[8px] py-[10px] px-[3px] text-center">Work Vehicle</p>
                                </div>
                                <div className="w-[85px] h-[95px]  rounded-[8px]">
                                    <p className="bg-[#C3CEF6] rounded-b-[8px] text-[12px] py-[15px] px-[4px]">
                                        Vehicle Name
                                    </p>
                                    <p className="text-[#808080] text-[12px] rounded-b-[8px] py-[10px] px-[3px] text-center">Work Vehicle</p>
                                </div>
                                <div className="w-[85px] h-[95px]   rounded-[8px]">
                                    <p className="bg-[#C3CEF6] rounded-b-[8px] text-[12px] py-[15px] px-[4px]">
                                        Vehicle Name
                                    </p>
                                    <p className="text-[#808080] text-[12px] rounded-b-[8px] py-[10px] px-[3px] text-center">Work Vehicle</p>
                                </div>
                                <div className="w-[85px] h-[95px]  rounded-[8px]">
                                    <p className="bg-[#C3CEF6] rounded-b-[8px] text-[12px] py-[15px] px-[4px]">
                                        Vehicle Name
                                    </p>
                                    <p className="text-[#808080] text-[12px] rounded-b-[8px] py-[10px] px-[3px] text-center">Work Vehicle</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="rounded-lg bg-[rgb(255,255,255)] p-6 shadow-sm mb-6  dark:bg-navbarBack ">
                        <div className="mb-4 flex items-center justify-center">
                            <h2 className="text-[24px] font-semibold text-gray-900 dark:text-[rgb(255,255,255)]">Payments Summary</h2>
                            {/* <button className="rounded-lg bg-[#5750F1] px-4 py-2 text-sm font-medium text-[rgb(255,255,255)] hover:bg-[#5750F1]/90" onClick={() => { setAddCustomerOpen(true); console.log('open') }}>
                                Add New Vehicle
                            </button> */}
                        </div>

                        <div className="relative ">

                            <div className=" grid grid-cols-3 gap-4 justify-between">
                                <div className="bg-secnodColor rounded-[8px] text-center py-[10px]">
                                    <p>Total Received Payments </p>
                                </div>
                                <div className="bg-secnodColor rounded-[8px] text-center py-[10px]">
                                    <p>1500 / 3200   </p>
                                </div>
                                <div className="bg-secnodColor rounded-[8px] text-center py-[10px]">
                                    <p>46 %    </p>
                                </div>
                            </div>


                        </div>
                    </div>

                    <div className="rounded-lg bg-[rgb(255,255,255)] p-6 shadow-sm  dark:bg-navbarBack ">
                        <div className="mb-4 flex items-center justify-center">
                            <h2 className="text-[24px] font-semibold text-gray-900 dark:text-[rgb(255,255,255)]">Actions </h2>
                        </div>

                        <div className="relative ">

                            <div className=" grid grid-cols-4 gap-4 justify-between">
                                <a className="bg-secnodColor rounded-[8px] text-center py-[10px] cursor-pointer">
                                    <p>New Insurance</p>
                                </a>
                                <a className={` rounded-[8px] text-center py-[10px] cursor-pointer ${slug == 'All_insurances' ? "bg-[#5750F1] text-[rgb(255,255,255)]" : "bg-secnodColor"}`} onClick={() => { setSlug('All_insurances') }}>
                                    <p>All Insurances </p>
                                </a>
                                <a className="bg-secnodColor rounded-[8px] text-center py-[10px] cursor-pointer" onClick={() => {
                                    setIsReportOpen(true);
                                    console.log(isReportOpen)
                                    setSlug('')
                                }}>
                                    <p>Accident Report </p>
                                </a>
                                <a className={` rounded-[8px] text-center py-[10px] cursor-pointer ${slug == 'Payments_receipts' ? "bg-[#5750F1] text-[rgb(255,255,255)]" : "bg-secnodColor"}`} onClick={() => { setSlug('Payments_receipts'); console.log(slug) }}>
                                    <p>Payments Receipts </p>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="mb-6 rounded-lg bg-[rgb(255,255,255)] p-3 shadow-sm">
                <div className="mb-4 flex items-center gap-2 justify-center">
                    <h2 className="text-[24px] font-semibold text-gray-900 dark:text-[rgb(255,255,255)] ">Payments Reciepts </h2>
                </div>


                <div className="relative swiper-container">
                    <button
                        ref={prevRef}
                        className="custom-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-[rgb(255,255,255)] p-2 shadow-md"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>

                    <div className="px-8 py-4">
                        <Swiper
                            modules={[Navigation, Pagination, Scrollbar, A11y]}
                            spaceBetween={10}
                            slidesPerView={3}
                            onInit={(swiper) => {

                                swiper.params.navigation.prevEl = prevRef.current
                                swiper.params.navigation.nextEl = nextRef.current
                                swiper.navigation.init()
                                swiper.navigation.update()
                            }}
                            navigation={{
                                prevEl: prevRef.current,
                                nextEl: nextRef.current,
                            }}
                            className="attachments-swiper"
                        >
                            {[...Array(7)].map((_, index) => (
                                <SwiperSlide key={index}>
                                    <div className=" rounded-lg border dark:border-borderNav border dark:border-borderNav-gray-200 p-4 w-[270px]">
                                        <div className="h-[80px] w-[80px] overflow-hidden mb-[22px]">
                                            <img
                                                src={logo}
                                                alt={`Vehicle `}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <h3 className="text-[18px]">1500 NIS</h3>
                                        <p className="text-[#6B7280] text-[14px] mb-[12px]">15 - 03 - 2025</p>
                                        <p className="text-[#6B7280] text-[14px]">Toyota 2015 - 225</p>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    <button
                        ref={nextRef}
                        className="custom-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-[rgb(255,255,255)] p-2 shadow-md"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

            </div> */}
            {
                slug == 'All_insurances' && <>
                    <div className="mb-6 rounded-lg bg-[rgb(255,255,255)] p-3 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 justify-center">
                            <h2 className="text-[24px] font-semibold text-gray-900 dark:text-[rgb(255,255,255)] ">All Insurance </h2>
                        </div>


                        <div className="relative swiper-container">
                            <button
                                ref={prevRef}
                                className="custom-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-[rgb(255,255,255)] p-2 shadow-md"
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                            </button>

                            <div className="px-8 py-4">
                                <Swiper
                                    modules={[Navigation, Pagination, Scrollbar, A11y]}
                                    spaceBetween={10}
                                    slidesPerView={3}
                                    onInit={(swiper) => {

                                        swiper.params.navigation.prevEl = prevRef.current
                                        swiper.params.navigation.nextEl = nextRef.current
                                        swiper.navigation.init()
                                        swiper.navigation.update()
                                    }}
                                    navigation={{
                                        prevEl: prevRef.current,
                                        nextEl: nextRef.current,
                                    }}
                                    className="attachments-swiper"
                                >
                                    <SwiperSlide >
                                        <div className=" rounded-lg border dark:border-borderNav border dark:border-borderNav-gray-200 p-4 w-[270px]">
                                            <div className="h-[80px] w-[80px] overflow-hidden mb-[22px]">
                                                <img
                                                    src={logo}
                                                    alt={`Vehicle `}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <h3 className="text-[18px]">Full Insurance </h3>
                                            <p className="text-[#6B7280] text-[14px] mb-[12px]">Test Company</p>
                                            <p className="text-[#6B7280] text-[14px]">Toyota 2015 - 225 </p>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide >
                                        <div className=" rounded-lg border dark:border-borderNav border dark:border-borderNav-gray-200 p-4 w-[270px]">
                                            <div className="h-[80px] w-[80px] overflow-hidden mb-[22px]">
                                                <img
                                                    src={logo}
                                                    alt={`Vehicle `}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <h3 className="text-[18px]">Third Party Insurance  </h3>
                                            <p className="text-[#6B7280] text-[14px] mb-[12px]">Test Company</p>
                                            <p className="text-[#6B7280] text-[14px]">Toyota 2015 - 225 </p>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide >
                                        <div className=" rounded-lg border dark:border-borderNav border dark:border-borderNav-gray-200 p-4 w-[270px]">
                                            <div className="h-[80px] w-[80px] overflow-hidden mb-[22px]">
                                                <img
                                                    src={logo}
                                                    alt={`Vehicle `}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <h3 className="text-[18px]">Road Service Insurance   </h3>
                                            <p className="text-[#6B7280] text-[14px] mb-[12px]">Test Company</p>
                                            <p className="text-[#6B7280] text-[14px]">Toyota 2015 - 225 </p>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide >
                                        <div className=" rounded-lg border dark:border-borderNav border dark:border-borderNav-gray-200 p-4 w-[270px]">
                                            <div className="h-[80px] w-[80px] overflow-hidden mb-[22px]">
                                                <img
                                                    src={logo}
                                                    alt={`Vehicle `}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <h3 className="text-[18px]">Road Service Insurance   </h3>
                                            <p className="text-[#6B7280] text-[14px] mb-[12px]">Test Company</p>
                                            <p className="text-[#6B7280] text-[14px]">Toyota 2015 - 225 </p>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide >
                                        <div className=" rounded-lg border dark:border-borderNav border dark:border-borderNav-gray-200 p-4 w-[270px]">
                                            <div className="h-[80px] w-[80px] overflow-hidden mb-[22px]">
                                                <img
                                                    src={logo}
                                                    alt={`Vehicle `}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <h3 className="text-[18px]">Road Service Insurance   </h3>
                                            <p className="text-[#6B7280] text-[14px] mb-[12px]">Test Company</p>
                                            <p className="text-[#6B7280] text-[14px]">Toyota 2015 - 225 </p>
                                        </div>
                                    </SwiperSlide>
                                </Swiper>
                            </div>

                            <button
                                ref={nextRef}
                                className="custom-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-[rgb(255,255,255)] p-2 shadow-md"
                            >
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                            </button>

                        </div>

                    </div>
                </>
            }
            {
                slug == 'Payments_receipts' && <>
                    <div className="mb-6 rounded-lg bg-[rgb(255,255,255)] p-3 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 justify-center">
                            <h2 className="text-[24px] font-semibold text-gray-900 dark:text-[rgb(255,255,255)] ">Payments Reciepts </h2>
                        </div>


                        <div className="relative swiper-container">
                            <button
                                ref={prevRef}
                                className="custom-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-[rgb(255,255,255)] p-2 shadow-md"
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                            </button>

                            <div className="px-8 py-4">
                                <Swiper
                                    modules={[Navigation, Pagination, Scrollbar, A11y]}
                                    spaceBetween={10}
                                    slidesPerView={3}
                                    onInit={(swiper) => {

                                        swiper.params.navigation.prevEl = prevRef.current
                                        swiper.params.navigation.nextEl = nextRef.current
                                        swiper.navigation.init()
                                        swiper.navigation.update()
                                    }}
                                    navigation={{
                                        prevEl: prevRef.current,
                                        nextEl: nextRef.current,
                                    }}
                                    className="attachments-swiper"
                                >
                                    {[...Array(7)].map((_, index) => (
                                        <SwiperSlide key={index}>
                                            <div className=" rounded-lg border dark:border-borderNav border dark:border-borderNav-gray-200 p-4 w-[270px]">
                                                <div className="h-[80px] w-[80px] overflow-hidden mb-[22px]">
                                                    <img
                                                        src={logo}
                                                        alt={`Vehicle `}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <h3 className="text-[18px]">1500 NIS</h3>
                                                <p className="text-[#6B7280] text-[14px] mb-[12px]">15 - 03 - 2025</p>
                                                <p className="text-[#6B7280] text-[14px]">Toyota 2015 - 225</p>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>

                            <button
                                ref={nextRef}
                                className="custom-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-[rgb(255,255,255)] p-2 shadow-md"
                            >
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                    </div>
                </>
            }
            <ReportAccident isOpen={isReportOpen} onClose={setIsReportOpen} />
        </div>
    )
}

export default DetailsVehicle