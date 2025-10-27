import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PropTypes from 'prop-types';

export const UserContext = createContext()
const UserContextProvider = ({ children }) => {

    const [isLogin, setLogin] = useState(false);
    const [UserData, setUserData] = useState({});
    const [user, setuser] = useState({});
    const [insureds, setInsureds] = useState({})
    const [userCount, setUserCount] = useState(0)
    const [insuranceCount, setInsuranceCount] = useState(0)
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token && token.split('.').length === 3) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000; // تحويل الوقت إلى ثوانٍ
                if (decoded.exp < currentTime) {
                    logout();
                    toast.warning("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا.");
                } else {
                    setLogin(true);
                    setUserData(decoded);
                    // getUser();
                    // getInsurance();
                }
            } catch (error) {
                // If token is invalid, clear it and logout
                console.error("Invalid token:", error);
                logout();
            }
        }
    }, []);

    // Fixed logout function that doesn't rely on a parameter
    const logout = () => {
        localStorage.removeItem('token');
        setLogin(false);
        // Instead of using navigate directly, we can use window.location
        window.location.href = '/login';
    };

    useEffect(() => {
        let token = localStorage.getItem('token');
        if (token) {
            // getUser()
        }
    }, [userCount]);
    
    // const getUser = async () => {
    //     if (localStorage.getItem('token')) {
    //         try {
    //             let token = localStorage.getItem('token');

    //             const { data } = await axios.get(
    //                 `http://localhost:3002/api/v1/admin/alluser`,
    //                 {
    //                     headers: {
    //                         Authorization: `islam__${token}`
    //                     }
    //                 }
    //             );
    //             setuser(data.find)

    //         } catch (error) {
    //         }
    //     }
    // }

    // const deleteUser = async (id) => {
    //     if (localStorage.getItem('token')) {
    //         try {
    //             let token = localStorage.getItem('token');

    //             const { data } = await axios.delete(
    //                 `http://localhost:3002/api/v1/admin/delete/${id}`,
    //                 {
    //                     headers: {
    //                         Authorization: `islam__${token}`
    //                     }
    //                 }
    //             );
    //             setUserCount((prev) => prev - 1)

    //         } catch (error) {
    //         }
    //     }
    // }

    // const getInsurance = async () => {
    //     try {
    //         const token = localStorage.getItem("token")

    //         const response = await axios.get("http://localhost:3002/api/v1/insured/all", {
    //             headers: {
    //                 Authorization: `islam__${token}`,
    //             },
    //         })
    //         setInsureds(response.data.find || []);
    //     } catch (error) {
    //         toast.error("فشل في تحميل بيانات المؤمنين")
    //     }
    // }
    
    const deleteInsurance = async (id) => {
        if (localStorage.getItem('token')) {
            try {
                let token = localStorage.getItem('token');

                await axios.delete(
                    `http://localhost:3002/api/v1/insured/delete/${id}`,
                    {
                        headers: {
                            Authorization: `islam__${token}`
                        }
                    }
                );
                setInsuranceCount((prev) => prev - 1)
            } catch {
            // Handle error silently
        }
        }
    }
    
    // useEffect(() => {
    //     if (token) {
    //         getInsurance()
    //     }
    // }, [insuranceCount])

    return <UserContext.Provider value={{ isLogin, deleteInsurance, insureds, setLogin, logout, user, UserData, setUserData }}>{children} </UserContext.Provider>;
}

UserContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default UserContextProvider;