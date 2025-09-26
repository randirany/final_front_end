import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/User';
import { useFormik } from 'formik';
import axios from 'axios';

function SendCode() {
    const navigate = useNavigate()
    const SendCodeUser = async () => {
        try {
            console.log(formik.values)
            const { data } = await axios.patch(`http://localhost:3002/api/v1/admin/sendcode`, formik.values)
            console.log(data);
            navigate('/changepassword', { state: { email: formik.values.email } })

        } catch (error) {
            console.log('error', error);
        }
    }

    const formik = useFormik({
        initialValues: {
            email: '',
        }, onSubmit: SendCodeUser
    })

    return (
        <div className="login  bg-[url('https://basheer-ab.com/wp-content/themes/ab_theme/CRM/assets/img/bg/37.png')] py-3 h-screen">
            <div className="wrapper border dark:border-borderNav-[1.5px] border dark:border-borderNav-solid rounded-md p-4 bg-[rgb(255,255,255)] ">
                <div className='w-16 m-auto py-3'>
                    <img src="https://basheer-ab.com/wp-content/themes/ab_theme/CRM/assets/img/crm/logo_black.png" alt="" className='w-full' />

                </div>
                <h1 className='text-lg font-semibold leading-6 text-center mb-4'> إعادة تعيين كلمة المرور

                    <br />
                    <span className='text-xs text-gray-500 font-light '>سوف تتلقى رسالة بريد إلكتروني تحتوي على رمز إعادة تعيين كلمة المرور الخاصة بك</span>  </h1>
                <form action="GET" onSubmit={formik.handleSubmit}>

                    <div className='text-right mb-4'>
                        <label for="email" className="form-label text-xs">  اسم المستخدم او البريد الالكتروني :  </label>
                        <input type="email" className="form-control" id="email" placeholder=""
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.email}
                        />
                    </div>


                    <div className='flex justify-between mb-4'>
                        {/* <div >
                            <input type="checkbox" name="" id="" />
                            <label htmlFor="" className='mr-2  text-sm'>  تذكرني  </label>
                        </div> */}
                        <Link to="/login" className=' text-xs underline underline-offset-2  font-light  text-gray-500 '>      تسجل الدخول </Link>
                    </div>
                    <div className='text-center mb-3'>
                        <input type="submit" value="   اعادة تعيين " className='bg-blue-500 text-[13px] text-[rgb(255,255,255)]  w-full py-2 px-4  rounded-md my-2 ' />
                    </div>

                </form>
            </div>

        </div>
    )
}

export default SendCode