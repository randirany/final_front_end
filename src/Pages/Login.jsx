import  { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {  useFormik } from 'formik'
import axios from 'axios'
import { UserContext } from '../context/User'
import { jwtDecode } from "jwt-decode";

function Login() {
    const { setUserData, setLogin } = useContext(UserContext);
    const navigate = useNavigate()
    const RegisterUser = async () => {
        try {
            console.log(formik.values)
            const { data } = await axios.post(`http://localhost:3002/api/v1/user/signin`, formik.values)
            console.log(data)
            localStorage.setItem('token', data.token)
            const decoded = jwtDecode(data.token);
            setUserData(decoded)
            setLogin(true);
            navigate('/home')

        } catch (error) {
            console.log('error', error)
        }
    }

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        }, onSubmit: RegisterUser
    })



    return (
        <div className="login  bg-[url('https://basheer-ab.com/wp-content/themes/ab_theme/CRM/assets/img/bg/37.png')] py-3  h-screen">
            <div className="wrapper border dark:border-borderNav-[1.5px] border dark:border-borderNav-solid rounded-md p-4 bg-[rgb(255,255,255)] ">
                <div className='w-16 m-auto py-3'>
                    <img src="https://basheer-ab.com/wp-content/themes/ab_theme/CRM/assets/img/crm/logo_black.png" alt="" className='w-full' />

                </div>
                <h1 className='text-lg font-semibold leading-6 text-center mb-3'> تسجيل الدخول

                    <br />  <span className='text-xs text-gray-500 font-light '>باستخدام اسم المستخدم </span>
                </h1>
                <form action="" onSubmit={formik.handleSubmit}>

                    <div className='text-right mb-4'>
                        <label htmlFor="email" className="form-label text-xs">  اسم المستخدم  :  </label>
                        <input type="email" className="form-control" id="email" placeholder=""
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.email} />
                    </div>

                    <div className='text-right className-3'>
                        <label htmlFor="password" className="form-label text-xs">  كلمة المرور  :  </label>
                        <input type="password" className="form-control"
                            onBlur={formik.handleBlur}

                            onChange={formik.handleChange}
                            value={formik.values.password}
                            id="password" placeholder="" />
                    </div>
                    <div className='flex justify-between mb-5'>
                        <div >
                            <input type="checkbox" name="" id="" />
                            <label htmlFor="" className='mr-2  text-xs  font-light '>  تذكرني  </label>
                        </div>
                        <Link to="/code" className=' text-xs text-gray-500 font-light underline underline-offset-3'>    نسيت كلمة المرور ؟  </Link>
                    </div>
                    <div className='text-center'>
                        <input type="submit" value="تسجيل الدخول" className='bg-blue-500 text-[13px] text-[rgb(255,255,255)]  w-full py-2 px-4  rounded-md my-2 ' />
                    </div>

                </form>
            </div>

        </div>
    )
}

export default Login