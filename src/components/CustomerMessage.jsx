import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next';

const CustomerMessage = () => {
        const { t, i18n: { language } } = useTranslation();
    
    return (
        <div className="py-4 px-4 dark:bg-dark2 dark:text-dark3 min-h-screen" dir={(language === "ar" || language === "he") ? "rtl" : "ltr"}>
            <div className="bg-[rgb(255,255,255)] flex p-[20px] rounded-md justify-between items-center mt-2 dark:bg-navbarBack">
                <div className="flex gap-[14px]">
                    <NavLink to="/home">Home</NavLink>
                    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11.9392 4.55806C12.1833 4.31398 12.579 4.31398 12.8231 4.55806L17.8231 9.55806C18.0672 9.80214 18.0672 10.1979 17.8231 10.4419L12.8231 15.4419C12.579 15.686 12.1833 15.686 11.9392 15.4419C11.6952 15.1979 11.6952 14.8021 11.9392 14.5581L15.8723 10.625H4.04785C3.70267 10.625 3.42285 10.3452 3.42285 10C3.42285 9.65482 3.70267 9.375 4.04785 9.375H15.8723L11.9392 5.44194C11.6952 5.19786 11.6952 4.80214 11.9392 4.55806Z"
                            fill="#6B7280"
                        />
                    </svg>
                    <NavLink to="/message">Customers Messages</NavLink>
                </div>
            </div>
            <div className='flex py-4 h-[100vh] '>
                <div className='w-80 rounded-l-lg bg-[rgb(255,255,255)] p-3 shadow-sm   overflow-y-auto hide-scrollbar   dark:bg-navbarBack'>
                    <div className='border-b-[1.5px]'>
                        <div className='flex justify-between items-center'>
                            <div className='max-w-[240px] flex gap-2'>
                                <div>
                                    <img src="https://html.bdevs.net/manez.prev/assets/images/avatar/avatar1.png" className='rounded-full max-w-[55px]' alt="" />
                                </div>
                                <div>
                                    <h5>David Peters</h5>
                                    <span className='text-[#A9ABB6] text-xs'>Senior Developer</span>
                                </div>
                            </div>
                            <div className="dropdown">
                                <a className="dropdown-toggle bg-[#EAEAEA] rounded-full w-[30px] h-[30px] p-1 text-[#878a99]" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="fa-solid fa-gear "></i>                                </a>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="#">Action</a></li>
                                    <li><a className="dropdown-item" href="#">Another action</a></li>
                                    <li><a className="dropdown-item" href="#">Something else here</a></li>
                                </ul>

                            </div>
                        </div>
                        <form className="sticky top-0 z-10 bg-[rgb(255,255,255)] dark:bg-gray-dark  my-3">
                            <div className="relative">
                                <input
                                    className="w-full max-w-xs dark:bg-dark4 rounded-[7px] bg-[#F3F4F6]  dark:border-navbarBack py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border focus:ring-1 focus:ring-blue-500 dark:border dark:border-borderNav-dark-3 dark:bg-dark-2 dark:text-[rgb(255,255,255)] dark:focus:border dark:border-primary"
                                    placeholder={('Search...')} 
                                    type="text"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                    </svg>
                                </span>
                            </div>
                        </form>
                    </div>
                    <div>
                        <div className='person mt-[20px]'>
                            <div className='flex justify-between items-center '>
                                <div className='max-w-[240px] flex gap-2'>
                                    <div>
                                        <img src="https://html.bdevs.net/manez.prev/assets/images/avatar/avatar2.png" className='rounded-full max-w-[55px]' alt="" />
                                    </div>
                                    <div>
                                        <h5>Lisa Roy </h5>
                                        <span className='text-[#A9ABB6] text-xs inline-block h-[14px] overflow-hidden '> Hi, are you Available Tomorrow?</span>
                                    </div>
                                </div>
                                <div className="time flex flex-col items-end gap-1">
                                    <span className='text-xs text-[#A9ABB6]'>10:35AM</span>
                                    <span className='w-[15px] h-[15px] rounded-full bg-[#6C5FFC] flex justify-center items-center text-[rgb(255,255,255)] text-xs'>1</span>
                                </div>
                            </div>
                        </div>
                        <div className='person mt-[20px]'>
                            <div className='flex justify-between items-center '>
                                <div className='max-w-[240px] flex gap-2'>
                                    <div>
                                        <img src="https://html.bdevs.net/manez.prev/assets/images/avatar/avatar3.png" className='rounded-full max-w-[55px]' alt="" />
                                    </div>
                                    <div>
                                        <h5>Lisa Roy </h5>
                                        <span className='text-[#A9ABB6] text-xs inline-block h-[14px] overflow-hidden '> Hi, are you Available Tomorrow?</span>
                                    </div>
                                </div>
                                <div className="time flex flex-col items-end gap-1">
                                    <span className='text-xs text-[#A9ABB6]'>10:35AM</span>
                                    <span className='w-[15px] h-[15px] rounded-full bg-[#6C5FFC] flex justify-center items-center text-[rgb(255,255,255)] text-xs'>1</span>
                                </div>
                            </div>
                        </div>
                        <div className='person mt-[20px]'>
                            <div className='flex justify-between items-center '>
                                <div className='max-w-[240px] flex gap-2'>
                                    <div>
                                        <img src="https://html.bdevs.net/manez.prev/assets/images/avatar/avatar4.png" className='rounded-full max-w-[55px]' alt="" />
                                    </div>
                                    <div>
                                        <h5>Lisa Roy </h5>
                                        <span className='text-[#A9ABB6] text-xs inline-block h-[14px] overflow-hidden '> Hi, are you Available Tomorrow?</span>
                                    </div>
                                </div>
                                <div className="time flex flex-col items-end gap-1">
                                    <span className='text-xs text-[#A9ABB6]'>10:35AM</span>
                                    <span className='w-[15px] h-[15px] rounded-full bg-[#6C5FFC] flex justify-center items-center text-[rgb(255,255,255)] text-xs'>1</span>
                                </div>
                            </div>
                        </div>
                        <div className='person mt-[20px]'>
                            <div className='flex justify-between items-center '>
                                <div className='max-w-[240px] flex gap-2'>
                                    <div>
                                        <img src="https://html.bdevs.net/manez.prev/assets/images/avatar/avatar2.png" className='rounded-full max-w-[55px]' alt="" />
                                    </div>
                                    <div>
                                        <h5>Lisa Roy </h5>
                                        <span className='text-[#A9ABB6] text-xs inline-block h-[14px] overflow-hidden '> Hi, are you Available Tomorrow?</span>
                                    </div>
                                </div>
                                <div className="time flex flex-col items-end gap-1">
                                    <span className='text-xs text-[#A9ABB6]'>10:35AM</span>
                                    <span className='w-[15px] h-[15px] rounded-full bg-[#6C5FFC] flex justify-center items-center text-[rgb(255,255,255)] text-xs'>1</span>
                                </div>
                            </div>
                        </div>
                        <div className='person mt-[20px]'>
                            <div className='flex justify-between items-center '>
                                <div className='max-w-[240px] flex gap-2'>
                                    <div>
                                        <img src="https://html.bdevs.net/manez.prev/assets/images/avatar/avatar5.png" className='rounded-full max-w-[55px]' alt="" />
                                    </div>
                                    <div>
                                        <h5>Lisa Roy </h5>
                                        <span className='text-[#A9ABB6] text-xs inline-block h-[14px] overflow-hidden '> Hi, are you Available Tomorrow?</span>
                                    </div>
                                </div>
                                <div className="time flex flex-col items-end gap-1">
                                    <span className='text-xs text-[#A9ABB6]'>10:35AM</span>
                                    <span className='w-[15px] h-[15px] rounded-full bg-[#6C5FFC] flex justify-center items-center text-[rgb(255,255,255)] text-xs'>1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='max-w-[calc(100%-20rem)] flex-1 rounded-r-lg bg-[rgb(255,255,255)]  shadow-sm    overflow-y-auto hide-scrollbar dark:bg-navbarBack'>
                    <div className='border-b-[1.5px] py-2 sticky top-0 right-0 z-9 bg-[rgb(255,255,255)] w-100  dark:bg-navbarBack'>
                        <div className="">
                            <div className="flex justify-between items-center">
                                <div className='max-w-[240px] flex gap-2 items-center'>
                                    <div>
                                        <img src="https://html.bdevs.net/manez.prev/assets/images/avatar/avatar8.png" className='rounded-full max-w-[55px]' alt="" />
                                    </div>
                                    <div>
                                        <h5>Dianne Jhonson      </h5>
                                    </div>
                                </div>
                                <div className="call">
                                    <a href="">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                        </svg>
                                    </a>

                                </div>
                            </div>

                        </div>
                    </div>
                    <div className='chat min-h-[630px]'>
                        <div dir="ltr">
                            <div className='message max-w-[360px] my-3'>
                                <div className='flex  gap-2 items-end'>
                                    <div className='max-w-6'>
                                        <img src="https://html.bdevs.net/manez.prev/assets/images/avatar/avatar9.png" className='w-full rounded-full' alt="" />
                                    </div>
                                    <div className='message-body bg-[#F3F4F6] p-1 rounded-lg'>
                                        <p>Hi David, have you got the project
                                            report pdf?
                                            asd dfghjk
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div dir="rtl">
                            <div className='message max-w-[360px] my-3 '>
                                <div className='flex  gap-2 items-end '>
                                    <div className='max-w-6'>
                                        <img src="https://html.bdevs.net/manez.prev/assets/images/avatar/avatar10.png" className='w-full rounded-full' alt="" />
                                    </div>
                                    <div className='message-body bg-[#6C5FFC] text-[rgb(255,255,255)] p-1 rounded-lg'>
                                        <p>NO. I did not get it
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div dir="ltr">
                            <div className='message max-w-[360px] my-3'>
                                <div className='flex  gap-2 items-end'>
                                    <div className='max-w-6'>
                                        <img src="https://html.bdevs.net/manez.prev/assets/images/avatar/avatar9.png" className='w-full rounded-full' alt="" />
                                    </div>
                                    <div className='message-body bg-[#F3F4F6] p-1 rounded-lg'>
                                        <p>Ok, I will just sent it here. Plz be
                                            sure to fill the details by today
                                            end of the day.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className=' dark:border-t-[1.5px] py-2 sticky bottom-0 z-50 bg-[rgb(255,255,255)] w-full dark:bg-dark4'>
                        <div className="flex items-center gap-2 px-4">
                            <button className="text-gray-500 hover:text-blue-500">
                                <svg width="14" height="23" viewBox="0 0 14 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.7 9.46533C0.885652 9.46533 1.0637 9.53678 1.19497 9.66395C1.32625 9.79112 1.4 9.96361 1.4 10.1435V11.4997C1.4 12.9385 1.99 14.3184 3.0402 15.3358C4.09041 16.3531 5.51479 16.9247 7 16.9247C8.48521 16.9247 9.90959 16.3531 10.9598 15.3358C12.01 14.3184 12.6 12.9385 12.6 11.4997V10.1435C12.6 9.96361 12.6737 9.79112 12.805 9.66395C12.9363 9.53678 13.1143 9.46533 13.3 9.46533C13.4857 9.46533 13.6637 9.53678 13.795 9.66395C13.9263 9.79112 14 9.96361 14 10.1435V11.4997C14 13.1808 13.3555 14.802 12.1914 16.0488C11.0273 17.2955 9.42664 18.0789 7.7 18.2471V20.9935H11.9C12.0857 20.9935 12.2637 21.0649 12.395 21.1921C12.5263 21.3192 12.6 21.4917 12.6 21.6716C12.6 21.8514 12.5263 22.0239 12.395 22.1511C12.2637 22.2783 12.0857 22.3497 11.9 22.3497H2.1C1.91435 22.3497 1.7363 22.2783 1.60503 22.1511C1.47375 22.0239 1.4 21.8514 1.4 21.6716C1.4 21.4917 1.47375 21.3192 1.60503 21.1921C1.7363 21.0649 1.91435 20.9935 2.1 20.9935H6.3V18.2471C4.57336 18.0789 2.97273 17.2955 1.80863 16.0488C0.644538 14.802 -2.18003e-05 13.1808 5.53009e-10 11.4997V10.1435C5.53009e-10 9.96361 0.0737499 9.79112 0.205025 9.66395C0.336301 9.53678 0.514348 9.46533 0.7 9.46533Z" fill="#9D9D9D"></path>
                                    <path d="M9.7998 11.4999C9.7998 12.2193 9.5048 12.9092 8.9797 13.4179C8.4546 13.9266 7.74241 14.2124 6.9998 14.2124C6.2572 14.2124 5.54501 13.9266 5.01991 13.4179C4.4948 12.9092 4.1998 12.2193 4.1998 11.4999V4.71865C4.1998 3.99925 4.4948 3.30932 5.01991 2.80063C5.54501 2.29193 6.2572 2.00615 6.9998 2.00615C7.74241 2.00615 8.4546 2.29193 8.9797 2.80063C9.5048 3.30932 9.7998 3.99925 9.7998 4.71865V11.4999ZM6.9998 0.649902C5.8859 0.649902 4.81761 1.07857 4.02996 1.84161C3.2423 2.60465 2.7998 3.63955 2.7998 4.71865V11.4999C2.7998 12.579 3.2423 13.6139 4.02996 14.3769C4.81761 15.14 5.8859 15.5687 6.9998 15.5687C8.11371 15.5687 9.182 15.14 9.96965 14.3769C10.7573 13.6139 11.1998 12.579 11.1998 11.4999V4.71865C11.1998 3.63955 10.7573 2.60465 9.96965 1.84161C9.182 1.07857 8.11371 0.649902 6.9998 0.649902V0.649902Z" fill="#9D9D9D"></path>
                                </svg>
                            </button>
                            <input
                                type="text"
                                placeholder="Write Something..."
                                className="flex-1 border-none outline-none bg-transparent text-sm placeholder-gray-400"
                            />

                            {/* أيقونات */}
                            <div className="flex items-center gap-2 text-gray-500">
                                {/* مرفق */}
                                <button>
                                    <svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.4415 7.02667L12.064 5.63239L5.1765 12.6093C4.90524 12.8842 4.69009 13.2105 4.54332 13.5697C4.39655 13.9289 4.32104 14.3138 4.3211 14.7025C4.32117 15.0913 4.3968 15.4762 4.54369 15.8353C4.69057 16.1944 4.90583 16.5207 5.17717 16.7955C5.44852 17.0704 5.77063 17.2883 6.12513 17.4371C6.47962 17.5858 6.85955 17.6623 7.24323 17.6622C7.62691 17.6621 8.00681 17.5855 8.36126 17.4367C8.71571 17.2879 9.03775 17.0698 9.30901 16.7948L17.574 8.42232C18.4872 7.49694 19.0001 6.24194 19 4.9334C18.9999 3.62485 18.4867 2.36995 17.5733 1.44476C16.66 0.519566 15.4213 -0.00012891 14.1298 2.39851e-08C12.8383 0.000128958 11.5997 0.520071 10.6865 1.44544L2.00892 10.236L1.98992 10.2539C-0.663305 12.942 -0.663305 17.2981 1.98992 19.9849C4.64314 22.6717 8.94258 22.6717 11.5958 19.9849L11.6134 19.9657L11.6148 19.967L17.5387 13.9664L16.1612 12.5721L10.2373 18.5714L10.2197 18.5893C9.31055 19.5085 8.07861 20.0248 6.79421 20.0248C5.50981 20.0248 4.27788 19.5085 3.36878 18.5893C2.91815 18.1317 2.5611 17.5885 2.31809 16.9909C2.07509 16.3932 1.95091 15.7528 1.95267 15.1064C1.95444 14.4601 2.08211 13.8204 2.32838 13.2241C2.57465 12.6278 2.93466 12.0867 3.38778 11.6316L3.38642 11.6303L12.0654 2.83972C13.204 1.6847 15.0579 1.6847 16.1979 2.83972C17.3379 3.99474 17.3365 5.87165 16.1979 7.02529L7.93286 15.3978C7.74789 15.5702 7.50435 15.6635 7.25309 15.6583C7.00183 15.653 6.76229 15.5496 6.58449 15.3696C6.4067 15.1897 6.30441 14.9471 6.29898 14.6925C6.29355 14.438 6.3854 14.1911 6.55536 14.0035L13.4429 7.02529L13.4415 7.02667Z" fill="#B4B4B4"></path>
                                    </svg>
                                </button>

                                {/* كاميرا */}
                                {/* <button>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M9 17l-6-6m6 6l6-6" />
                                    </svg>
                                </button> */}

                                {/* إيموجي */}
                                {/* <button>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9.172 9.172a4 4 0 015.656 0M12 2a10 10 0 100 20 10 10 0 000-20z" />
                                    </svg>
                                </button> */}
                            </div>

                            {/* زر الإرسال */}
                            <button className="bg-[#6C5FFC] hover:bg-indigo-600  text-[rgb(255,255,255)] rounded-full p-2">
                                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.3798 10.7124L3.26922 12.0636C3.17597 12.0791 3.08847 12.119 3.01551 12.1791C2.94254 12.2392 2.88669 12.3174 2.85357 12.4059L0.0570815 19.8972C-0.209969 20.5862 0.510421 21.243 1.17158 20.9114L20.5543 11.2216C20.6882 11.1545 20.8009 11.0514 20.8796 10.9239C20.9583 10.7965 21 10.6496 21 10.4998C21 10.3499 20.9583 10.2031 20.8796 10.0756C20.8009 9.94808 20.6882 9.84501 20.5543 9.77787L1.17158 0.0881315C0.510421 -0.242396 -0.209969 0.414353 0.0570815 1.10232L2.85465 8.59357C2.88777 8.6821 2.94362 8.76035 3.01658 8.82045C3.08955 8.88055 3.17705 8.92038 3.2703 8.93594L11.3809 10.2871C11.4315 10.2952 11.4775 10.321 11.5108 10.36C11.544 10.399 11.5623 10.4485 11.5623 10.4998C11.5623 10.551 11.544 10.6005 11.5108 10.6395C11.4775 10.6785 11.4315 10.7043 11.3809 10.7124H11.3798Z" fill="[rgb(255,255,255)]"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default CustomerMessage