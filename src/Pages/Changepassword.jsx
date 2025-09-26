import { useFormik } from 'formik';
import React, { useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/User';
import axios from 'axios';

function Changepassword() {
    const location = useLocation();

    const navigate = useNavigate()
    const ChangePasswordUser = async () => {
        try {
            console.log(formik.values)
            const { data } = await axios.patch(`http://localhost:3002/api/v1/admin/forgetpassword`, formik.values)
            console.log(data);
            navigate('/home')

        } catch (error) {
            console.log('error', error);
        }
    }

    const formik = useFormik({
        initialValues: {
            email: location.state?.email || '',
            code: '',
            newPassword: ''
        }, onSubmit: ChangePasswordUser
    })
    return (
        <div className="login  bg-[url('https://basheer-ab.com/wp-content/themes/ab_theme/CRM/assets/img/bg/37.png')] py-3  h-screen ">
            <div className="wrapper border dark:border-borderNav-[1.5px] border dark:border-borderNav-solid rounded-md p-4 bg-[rgb(255,255,255)] ">
                <div className='w-16 m-auto py-3'>
                    <img src="https://basheer-ab.com/wp-content/themes/ab_theme/CRM/assets/img/crm/logo_black.png" alt="" className='w-full' />
                </div>
                <h1 className='text-lg font-semibold leading-6 text-center mb-4'> إعادة تعيين كلمة المرور
                </h1>
                <form action="GET" onSubmit={formik.handleSubmit}>

                    <div className='text-right mb-4'>
                        <label for="code" className="form-label text-xs">  رمز اعادة التعيين :  </label>
                        <input type="text" className="form-control" id="code" placeholder=""
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.code} />
                    </div>

                    <div className='text-right mb-4'>
                        <label for="newPassword" className="form-label text-xs"> كلمة المرور الجديدة :  </label>
                        <input type="password" className="form-control" id="newPassword" placeholder="" onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.newPassword} />
                    </div>

                    <div className='flex justify-between mb-4'>
                        {/* <div >
                        <input type="checkbox" name="" id="" />
                        <label htmlFor="" className='mr-2  text-sm'>  تذكرني  </label>
                    </div> */}
                        <Link to="/login" className=' text-xs text-gray-500 font-light  underline underline-offset-2 '>      تسجل الدخول </Link>
                    </div>
                    <div className='text-center mb-3'>
                        <input type="submit" value="   اعادة تعيين " className='bg-blue-500 text-[13px] text-[rgb(255,255,255)]  w-full py-2 px-4  rounded-md my-2 ' />
                    </div>

                </form>
            </div>

        </div>
    )
}

export default Changepassword