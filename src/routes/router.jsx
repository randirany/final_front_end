import { createBrowserRouter } from "react-router-dom";
import Root, { AuthLayout } from "../../Root";
import Login from "../Pages/Login";
import SendCode from "../Pages/SendCode";
import Changepassword from "../Pages/Changepassword";
import Home from "../Pages/Home";
import ProtectedRouter from './../components/ProtectedRouter';
import Customers from "../components/Customers";
import CustomerInfo from "../components/CustomerInfo.jsx";
import DetailsVehicle from "../components/DetailsVehicle.jsx";
import CustomerMessage from "../components/CustomerMessage.jsx";
import Inbox from "../components/Inbox.jsx";
import SendMessage from "../components/SendMessage.jsx";
import AddVehicleWrapper from "../components/AddVehicleWrapper.jsx";
import Departments from "../components/Departments.jsx";
import AhlieReport from "../components/AhlieReport.jsx";
import MashreqRep from "../components/MashreqRep.jsx";
import TakafulRep from "../components/TakafulRep.jsx";
import PalestineRep from "../components/PalestineRep.jsx";
import TrustRep from "../components/TrustRep.jsx";
import HolyLandRep from "../components/HolyLandRep.jsx";
import AddInsuranceCompany from "../components/AddInsuranceCompany.jsx";
import InsuranceList from "../components/InsuranceList.jsx";
import CheckDetails from "../components/checkDetails.jsx";
import InsuranceCompany from "../components/InsuranceCompany.jsx";
import Profile from "../Pages/Profile.jsx";
import SettingsPage from "../Pages/SettingsPage.jsx";
import Agents from "../components/Agents.jsx";
import AuditLog from '../components/AuditLog.jsx'
import AllInsured from "../components/AllInsured.jsx";
import SmsSend from "../components/SmsSend.jsx";
import OnlinePayment from "../components/OnlinePayment.jsx";
import EmailManagement from "../components/EmailManagement.jsx";
import NotificationsPage from "../Pages/NotificationsPage.jsx";
import Cheques from "../Pages/Cheques.jsx";
import AddCheque from "../Pages/AddCheque.jsx";
import ViewCheque from "../Pages/ViewCheque.jsx";
import EditCheque from "../Pages/EditCheque.jsx";
import DocumentSettings from "../Pages/DocumentSettings.jsx";
import AddDocumentSettings from "../Pages/AddDocumentSettings.jsx";
import ViewDocumentSettings from "../Pages/ViewDocumentSettings.jsx";
import EditDocumentSettings from "../Pages/EditDocumentSettings.jsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {

                path: '/',
                element:
                    <ProtectedRouter><Home /></ProtectedRouter>,
            }, {

                path: '/home',
                element:
                    <ProtectedRouter><Home /></ProtectedRouter>,
            },
            {
                path: '/add_vehicle/:id',
                element: (
                    <ProtectedRouter>
                        <AddVehicleWrapper />
                    </ProtectedRouter>
                )
            }, {
                path: '/customers',
                element: <ProtectedRouter> <Customers /></ProtectedRouter>
            }, {
                path: '/sms',
                element: <ProtectedRouter> <SmsSend /></ProtectedRouter>
            }, {
                path: '/payment',
                element: <ProtectedRouter> <OnlinePayment /></ProtectedRouter>
            }, {
                path: '/emails',
                element: <ProtectedRouter> <EmailManagement /></ProtectedRouter>
            }, {
                path: '/notifications',
                element: <ProtectedRouter> <NotificationsPage /></ProtectedRouter>
            }, {
                path: '/cheques',
                element: <ProtectedRouter> <Cheques /></ProtectedRouter>
            }, {
                path: '/cheques/add',
                element: <ProtectedRouter> <AddCheque /></ProtectedRouter>
            }, {
                path: '/cheques/view/:id',
                element: <ProtectedRouter> <ViewCheque /></ProtectedRouter>
            }, {
                path: '/cheques/edit/:id',
                element: <ProtectedRouter> <EditCheque /></ProtectedRouter>
            }, {
                path: '/document-settings',
                element: <ProtectedRouter> <DocumentSettings /></ProtectedRouter>
            }, {
                path: '/document-settings/add',
                element: <ProtectedRouter> <AddDocumentSettings /></ProtectedRouter>
            }, {
                path: '/document-settings/view/:id',
                element: <ProtectedRouter> <ViewDocumentSettings /></ProtectedRouter>
            }, {
                path: '/document-settings/edit/:id',
                element: <ProtectedRouter> <EditDocumentSettings /></ProtectedRouter>
            }, {
                path: '/profile/:insuredId',
                element: <ProtectedRouter> <CustomerInfo /></ProtectedRouter>
            }, {
                path: '/DetailsVehicle',
                element: <ProtectedRouter> <DetailsVehicle /></ProtectedRouter>
            }, {
                path: '/message',
                element: <ProtectedRouter> <CustomerMessage /></ProtectedRouter>
            }, {
                path: '/inbox',
                element: <ProtectedRouter> <Inbox /></ProtectedRouter>
            }, {
                path: '/sendMessage',
                element: <ProtectedRouter> <SendMessage /></ProtectedRouter>
            }, {
                path: '/departments',
                element: <ProtectedRouter> <Departments />   </ProtectedRouter>
            }, {
                path: '/AhlieReport/:vehicleId',
                element: <ProtectedRouter><AhlieReport /></ProtectedRouter>
            }, {
                path: '/MashreqReport/:vehicleId',
                element: <ProtectedRouter><MashreqRep /></ProtectedRouter>
            }, {
                path: '/TakafulRep/:vehicleId',
                element: <ProtectedRouter><TakafulRep /></ProtectedRouter>
            }, {
                path: '/PalestineRep/:vehicleId',
                element: <ProtectedRouter><PalestineRep /></ProtectedRouter>
            }, {
                path: '/TrustRep/:vehicleId',
                element: <ProtectedRouter><TrustRep /></ProtectedRouter>
            }, {
                path: '/HolyLand/:vehicleId',
                element: <ProtectedRouter><HolyLandRep /></ProtectedRouter>
            }, {
                path: '/insured/:insuredId/:vehicleId',
                element: <InsuranceList />
            }, {
                path: '/check/:insuredId/:vehicleId/:insuranceId',
                element: <CheckDetails />
            }, {
                path: '/Company',
                element: <AddInsuranceCompany />
            }, {
                path: '/profile',
                element: <Profile />
            },
            {
                path: '/profile/:id',
                element: <Profile />
            },
            {
                path: '/settings',
                element: <SettingsPage />
            }, {
                path: '/InsuranceCompany',
                element: <InsuranceCompany />
            }, {
                path: '/Agents',
                element: <Agents />
            }, {
                path: '/auditlog',
                element: <AuditLog />
            }, {
                path: '/allInsurance',
                element: <AllInsured />
            }
        ],

    }, {
        path: '/',
        element: <AuthLayout />,
        children: [
            {
                path: '/',
                element: <Login />
            }, {
                path: '/login',
                element: <Login />
            },
            {
                path: '/code',
                element: <SendCode />
            }, {
                path: '/changepassword',
                element: <Changepassword />
            }
        ]
    }

])
export default router;
