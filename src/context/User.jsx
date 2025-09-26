import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

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
        if (token) {
            const decoded = jwtDecode(token);
            console.log('uswrDate',decoded)
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
            console.log('change count', userCount);
            // getUser()
        }
    }, [userCount]);
    
    // const getUser = async () => {
    //     if (localStorage.getItem('token')) {
    //         try {
    //             let token = localStorage.getItem('token');
    //             console.log("Token from LocalStorage:", token);

    //             const { data } = await axios.get(
    //                 `http://localhost:3002/api/v1/admin/alluser`,
    //                 {
    //                     headers: {
    //                         Authorization: `islam__${token}`
    //                     }
    //                 }
    //             );
    //             setuser(data.find)
    //             console.log('userCount', userCount)
    //             console.log('Response:', data);

    //         } catch (error) {
    //             console.error('Error:', error);
    //         }
    //     }
    // }

    // const deleteUser = async (id) => {
    //     if (localStorage.getItem('token')) {
    //         try {
    //             let token = localStorage.getItem('token');
    //             console.log("Token from LocalStorage:", token);

    //             const { data } = await axios.delete(
    //                 `http://localhost:3002/api/v1/admin/delete/${id}`,
    //                 {
    //                     headers: {
    //                         Authorization: `islam__${token}`
    //                     }
    //                 }
    //             );
    //             setUserCount((prev) => prev - 1)
    //             console.log('userCount', userCount)
    //             console.log('Response:', data);

    //         } catch (error) {
    //             console.error('Error:', error);
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
    //         console.log(response.data.find)
    //         setInsureds(response.data.find || []);
    //     } catch (error) {
    //         console.error("Error fetching insureds:", error)
    //         toast.error("فشل في تحميل بيانات المؤمنين")
    //     }
    // }
    
    const deleteInsurance = async (id) => {
        if (localStorage.getItem('token')) {
            try {
                console.log('hii delete insure')
                let token = localStorage.getItem('token');
                console.log("Token from LocalStorage:", token);

                const { data } = await axios.delete(
                    `http://localhost:3002/api/v1/insured/delete/${id}`,
                    {
                        headers: {
                            Authorization: `islam__${token}`
                        }
                    }
                );
                setInsuranceCount((prev) => prev - 1)
                console.log('userCount', insuranceCount)
                console.log('Response:', data);
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }
    
    // useEffect(() => {
    //     if (token) {
    //         console.log(insureds)
    //         getInsurance()
    //     }
    // }, [insuranceCount])

    return <UserContext.Provider value={{ isLogin, deleteInsurance, insureds, setLogin, logout, user, UserData, setUserData }}>{children} </UserContext.Provider>;
}

export default UserContextProvider;