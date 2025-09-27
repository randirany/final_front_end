import router from './routes/router.jsx'
import 'sweetalert2/dist/sweetalert2.min.css';
import './App.css'
import { RouterProvider } from 'react-router-dom'
import UserContextProvider from './context/User.jsx'
import './i18n.js'
import { ThemeProvider } from './context/ThemeProvider.jsx'

function App() {


  return (
    <>
      <ThemeProvider>
        <UserContextProvider>
          <RouterProvider router={router} />
        </UserContextProvider>
      </ThemeProvider>


    </>
  )
}

export default App
