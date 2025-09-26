import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVertical, Edit, Trash2, Car, User } from 'lucide-react'; 

const CustomerCard = ({ customer, onEdit, onDelete, onAddVehicle, onProfileView }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action) => {
        if (action) {
            action(customer);
        }
        handleMenuClose();
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return names[0].substring(0, 2).toUpperCase();
    }

    return (
        <div className="relative bg-[rgb(255,255,255)] dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-[1.03] duration-300 ease-in-out">
            <div className="absolute top-3 right-3 z-10">
                <IconButton
                    size="small"
                    onClick={handleMenuClick}
                    className="text-gray-500 dark:text-gray-400 bg-[rgb(255,255,255)]/50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <MoreVertical size={20} />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => handleAction(onEdit)}><Edit size={16} className="mr-2" /> تعديل</MenuItem>
                    <MenuItem onClick={() => handleAction(onAddVehicle)}><Car size={16} className="mr-2" /> إضافة مركبة</MenuItem>
                    <MenuItem onClick={() => handleAction(onProfileView)}><User size={16} className="mr-2" /> الملف الشخصي</MenuItem>
                    <MenuItem onClick={() => handleAction(onDelete)} className="text-red-600 dark:text-red-400"><Trash2 size={16} className="mr-2" /> حذف</MenuItem>
                </Menu>
            </div>

            <div className="h-24 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900/50 dark:via-purple-900/50 dark:to-pink-900/50"></div>

            <div className="flex justify-center -mt-14">
                <div className="relative w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                   
                   {customer.image ? <>
                                       <img src={`${customer.image}`} alt="" className='object-cover rounded-full' />
</>:<>
                    <span className="text-3xl font-bold text-gray-600 dark:text-gray-400">{getInitials(customer.name)}</span>
                   </>} {/* <span className="text-3xl font-bold text-gray-600 dark:text-gray-400">{getInitials(customer.name)}</span> */}
                    {/* <img src={`${customer.image}`} alt="" className='object-cover rounded-full' /> */}
                    {/* شارة التحقق */}
                    <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-0.5 border-2 border-white dark:border-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[rgb(255,255,255)]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* معلومات العميل */}
            <div className="text-center px-6 py-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{customer.name || 'No Name'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{customer.email || 'No Email'}</p>
            </div>

            {/* الإحصائيات */}
            <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-around text-center">
                    <div className="flex-1">
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{customer.Mobile || '-'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">رقم الجوال</p>
                    </div>
                    <div className="border-l border-gray-200 dark:border-gray-700 mx-2"></div>
                    <div className="flex-1">
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{customer.Identity || '-'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">رقم الهوية</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerCard;