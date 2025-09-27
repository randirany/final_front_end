import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import axios from 'axios';
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

function InsuranceAhliaRep({ onClose, isOpen, onReportAdded }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { vehicleId } = useParams();
    const { t, i18n: { language } } = useTranslation();

    const memoizedInitialFormData = useMemo(() => ({
        reportNumber: '', accidentDate: '', accidentTime: '', policeNumber: '', agentNumber: '',
        policyInfo: { policyNumber: '', type: '', durationFrom: '', durationTo: '' },
        insuredPerson: { name: '' },
        driverInfo: { name: '', idNumber: '', age: '', licenseNumber: '', licenseType: '', licenseIssueDate: '', matchesVehicle: false },
        vehicleInfo: { usage: '', manufactureYear: '', vehicleType: '', registrationNumber: '', registrationType: '', lastTestDate: '', licenseExpiry: '' },
        accidentDetails: { location: '', time: '', weather: '', purposeOfUse: '', accidentType: '', sketch: '', driverStatement: '', signature: '' },
        thirdPartyVehicles: [], thirdPartyInjuries: [], thirdPartyPassengers: [], externalWitnesses: [],
        declaration: { driverSignature: '', declarationDate: '', officerSignature: '', officerDate: '' }
    }), []);

    const [formData, setFormData] = useState(() => JSON.parse(JSON.stringify(memoizedInitialFormData)));

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && !isSubmitting) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose, isOpen, isSubmitting]);

    useEffect(() => {
        if (isOpen) {
            setFormData(JSON.parse(JSON.stringify(memoizedInitialFormData)));
            setCurrentStep(1);

        }
    }, [isOpen, memoizedInitialFormData, vehicleId]);
    if (!isOpen) return null;

    const handleChange = (e, section, subField, arrayName, index, itemField) => {
        const { name, value, type, checked } = e.target;
        const valToSet = type === 'checkbox' ? checked : value;
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            if (arrayName && typeof index === 'number' && itemField) {
                if (!newState[arrayName]) newState[arrayName] = [];
                while (index >= newState[arrayName].length) newState[arrayName].push({});
                newState[arrayName][index][itemField] = valToSet;
            } else if (section && subField) {
                if (!newState[section]) newState[section] = {};
                newState[section][subField] = valToSet;
            } else if (section) {
                if (!newState[section]) newState[section] = {};
                newState[section][name] = valToSet;
            } else {
                newState[name] = valToSet;
            }
            return newState;
        });
    };

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 6));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const method = 'POST';
        let endpointPath = '';

        if (!vehicleId) {
            alert(t('vehicleIdParamRequiredError'));
            setIsSubmitting(false);
            return;
        }
        endpointPath = `add/${vehicleId}`;

        const dataToSend = JSON.parse(JSON.stringify(formData));
        const toNumberOrUndefined = (val) => { const num = Number(val); return isNaN(num) || val === '' || val === null || val === undefined ? undefined : num; };
        const toBoolean = (val) => typeof val === 'string' ? (val.toLowerCase() === 'true') : Boolean(val);
        const formatDateForBackend = (dateStr) => (!dateStr || dateStr.trim() === '') ? undefined : (new Date(dateStr).toISOString());

        dataToSend.accidentDate = formatDateForBackend(dataToSend.accidentDate);
        if (dataToSend.policyInfo) {
            dataToSend.policyInfo.durationFrom = formatDateForBackend(dataToSend.policyInfo.durationFrom);
            dataToSend.policyInfo.durationTo = formatDateForBackend(dataToSend.policyInfo.durationTo);
        }
        if (dataToSend.driverInfo) {
            dataToSend.driverInfo.age = toNumberOrUndefined(dataToSend.driverInfo.age);
            dataToSend.driverInfo.licenseIssueDate = formatDateForBackend(dataToSend.driverInfo.licenseIssueDate);
            dataToSend.driverInfo.matchesVehicle = toBoolean(dataToSend.driverInfo.matchesVehicle);
        }
        if (dataToSend.vehicleInfo) {
            dataToSend.vehicleInfo.lastTestDate = formatDateForBackend(dataToSend.vehicleInfo.lastTestDate);
            dataToSend.vehicleInfo.licenseExpiry = formatDateForBackend(dataToSend.vehicleInfo.licenseExpiry);
            dataToSend.vehicleInfo.manufactureYear = toNumberOrUndefined(dataToSend.vehicleInfo.manufactureYear);
        }
        if (dataToSend.declaration) {
            dataToSend.declaration.declarationDate = formatDateForBackend(dataToSend.declaration.declarationDate);
            dataToSend.declaration.officerDate = formatDateForBackend(dataToSend.declaration.officerDate);
        }
        dataToSend.thirdPartyVehicles = (Array.isArray(dataToSend.thirdPartyVehicles) ? dataToSend.thirdPartyVehicles : []).map(v => ({ ...v, }));
        dataToSend.thirdPartyInjuries = (Array.isArray(dataToSend.thirdPartyInjuries) ? dataToSend.thirdPartyInjuries : []).map(i => ({ ...i, age: toNumberOrUndefined(i.age), }));
        dataToSend.thirdPartyPassengers = Array.isArray(dataToSend.thirdPartyPassengers) ? dataToSend.thirdPartyPassengers : [];
        dataToSend.externalWitnesses = Array.isArray(dataToSend.externalWitnesses) ? dataToSend.externalWitnesses : [];

        const url = `http://localhost:3002/api/v1/AhliaAccidentReport/${endpointPath}`;
        try {
            const token = `islam__${localStorage.getItem("token")}`;

            const response = await axios({
                method: method, url: url, data: dataToSend,
                headers: { 'Content-Type': 'application/json', token }
            });

            alert(t('formSubmissionSuccess') + (response.data.message ? `\n${response.data.message}` : ''));

            if (onReportAdded) {
                onReportAdded();
            } else {
                onClose();
            }

        } catch (error) {
            alert(t('formSubmissionError') + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const addArrayItem = (arrayName, item) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            if (!newState[arrayName]) newState[arrayName] = [];
            newState[arrayName].push(item);
            return newState;
        });
    };
    const removeArrayItem = (arrayName, index) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            if (newState[arrayName] && newState[arrayName][index] !== undefined) {
                newState[arrayName].splice(index, 1);
            }
            return newState;
        });
    };

    const getStepTitle = () => { switch (currentStep) { case 1: return t('reportInfoTitle'); case 2: return t('policyInfoTitle'); case 3: return t('driverInfoTitle'); case 4: return t('vehicleInfoTitle'); case 5: return t('accidentDetailsTitle'); case 6: return t('declarationTitle'); default: return ''; } };
    const renderStepIndicator = () => (<div className="px-4 py-3 mb-4"> <div className="flex justify-between items-center"> {[1, 2, 3, 4, 5, 6].map((step) => (<div key={step} className="flex flex-col items-center text-center flex-1 px-1"> <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium ${currentStep >= step ? 'bg-indigo-600 text-[rgb(255,255,255)]' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{step}</div> <span className="text-[10px] leading-tight mt-1 text-gray-600 dark:text-gray-400"> {step === 1 && t('step1Indicator')} {step === 2 && t('step2Indicator')} {step === 3 && t('step3Indicator')} {step === 4 && t('step4Indicator')} {step === 5 && t('step5Indicator')} {step === 6 && t('step6Indicator')} </span> </div>))} </div> </div>);
    const renderCommonInput = (labelKey, nameAttribute, value, type = "text", required = false, section = null, subField = null, options = null, arrayName = null, index = null, itemFieldForHandleChange = null) => { const inputId = `${section || ''}_${subField || ''}_${arrayName || ''}_${index === null ? '' : index}_${itemFieldForHandleChange || nameAttribute || labelKey}`.replace(/\W/g, '_'); const actualItemField = itemFieldForHandleChange || nameAttribute; return (<div> <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t(labelKey)} {required && <span className="text-red-500">*</span>}</label> {type === "select" ? (<select id={inputId} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, subField, arrayName, index, actualItemField)} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required={required}> {(options || []).map(opt => <option key={opt.value} value={opt.value}>{t(opt.label)}</option>)} </select>) : type === "textarea" ? (<textarea id={inputId} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, subField, arrayName, index, actualItemField)} rows="3" className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required={required}></textarea>) : (<input id={inputId} type={type} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, subField, arrayName, index, actualItemField)} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required={required} />)} </div>); };
    const renderCheckbox = (labelKey, nameAttribute, checked, section, subField, arrayName = null, index = null, itemFieldForHandleChange = null) => { const inputId = `${section || ''}_${subField || ''}_${arrayName || ''}_${index === null ? '' : index}_${itemFieldForHandleChange || nameAttribute || labelKey}`.replace(/\W/g, '_'); const actualItemField = itemFieldForHandleChange || nameAttribute; return (<div className="flex items-center col-span-1 md:col-span-2 mt-2"> <input type="checkbox" id={inputId} name={nameAttribute} checked={Boolean(checked)} onChange={(e) => handleChange(e, section, subField, arrayName, index, actualItemField)} className="h-4 w-4 text-indigo-600 border-gray-300 dark:!border-nonerounded focus:ring-indigo-500" /> <label htmlFor={inputId} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">{t(labelKey)}</label> </div>); };
    const renderReportInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {renderCommonInput("reportNumberLabel", "reportNumber", formData.reportNumber, "text", false, null, null, null, null, "reportNumber")} {renderCommonInput("accidentDateLabel", "accidentDate", formData.accidentDate, "date", true, null, null, null, null, "accidentDate")} {renderCommonInput("accidentTimeLabel", "accidentTime", formData.accidentTime, "time", true, null, null, null, null, "accidentTime")} {renderCommonInput("policeNumberLabel", "policeNumber", formData.policeNumber, "text", false, null, null, null, null, "policeNumber")} {renderCommonInput("agentNumberLabel", "agentNumber", formData.agentNumber, "text", false, null, null, null, null, "agentNumber")} </div>);
    const renderPolicyInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {renderCommonInput("policyNumberLabel", "policyNumber", formData.policyInfo.policyNumber, "text", false, "policyInfo", "policyNumber")} {renderCommonInput("policyTypeLabel", "type", formData.policyInfo.type, "select", false, "policyInfo", "type", [{ value: "", label: "policyTypeOptionDefault" }, { value: "COM", label: "policyTypeOptionCOM" }, { value: "TPL", label: "policyTypeOptionTPL" }, { value: "A.C.T", label: "policyTypeOptionA.C.T" },])} {renderCommonInput("policyDurationFromLabel", "durationFrom", formData.policyInfo.durationFrom, "date", false, "policyInfo", "durationFrom")} {renderCommonInput("policyDurationToLabel", "durationTo", formData.policyInfo.durationTo, "date", false, "policyInfo", "durationTo")} {renderCommonInput("insuredPersonNameLabel", "name", formData.insuredPerson.name, "text", false, "insuredPerson", "name")} </div>);
    const renderDriverInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {renderCommonInput("driverNameLabel", "name", formData.driverInfo.name, "text", false, "driverInfo", "name")} {renderCommonInput("idNumberLabel", "idNumber", formData.driverInfo.idNumber, "text", false, "driverInfo", "idNumber")} {renderCommonInput("ageLabel", "age", formData.driverInfo.age, "number", false, "driverInfo", "age")} {renderCommonInput("licenseNumberLabel", "licenseNumber", formData.driverInfo.licenseNumber, "text", false, "driverInfo", "licenseNumber")} {renderCommonInput("licenseTypeLabel", "licenseType", formData.driverInfo.licenseType, "text", false, "driverInfo", "licenseType")} {renderCommonInput("licenseIssueDateLabel", "licenseIssueDate", formData.driverInfo.licenseIssueDate, "date", false, "driverInfo", "licenseIssueDate")} {renderCheckbox("licenseMatchesVehicleLabel", "matchesVehicle", formData.driverInfo.matchesVehicle, "driverInfo", "matchesVehicle")} </div>);
    const renderVehicleInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {renderCommonInput("vehicleUsageLabel", "usage", formData.vehicleInfo.usage, "text", false, "vehicleInfo", "usage")} {renderCommonInput("manufactureYearLabel", "manufactureYear", formData.vehicleInfo.manufactureYear, "text", false, "vehicleInfo", "manufactureYear")} {renderCommonInput("vehicleTypeLabel", "vehicleType", formData.vehicleInfo.vehicleType, "text", false, "vehicleInfo", "vehicleType")} {/* لا نعرض حقل رقم التسجيل للإدخال في وضع الإضافة */} {renderCommonInput("registrationTypeLabel", "registrationType", formData.vehicleInfo.registrationType, "text", false, "vehicleInfo", "registrationType")} {renderCommonInput("lastTestDateLabel", "lastTestDate", formData.vehicleInfo.lastTestDate, "date", false, "vehicleInfo", "lastTestDate")} {renderCommonInput("licenseExpiryLabel", "licenseExpiry", formData.vehicleInfo.licenseExpiry, "date", false, "vehicleInfo", "licenseExpiry")} </div>);
    const renderAccidentDetails = () => (<div className="space-y-6"> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {renderCommonInput("accidentLocationLabel", "location", formData.accidentDetails.location, "text", false, "accidentDetails", "location")} {renderCommonInput("accidentDetailsTimeLabel", "time", formData.accidentDetails.time, "time", false, "accidentDetails", "time")} {renderCommonInput("weatherConditionLabel", "weather", formData.accidentDetails.weather, "text", false, "accidentDetails", "weather")} {renderCommonInput("purposeOfUseLabel", "purposeOfUse", formData.accidentDetails.purposeOfUse, "text", false, "accidentDetails", "purposeOfUse")} {renderCommonInput("accidentTypeLabel", "accidentType", formData.accidentDetails.accidentType, "select", false, "accidentDetails", "accidentType", [{ value: "", label: "accidentTypeOptionDefault" }, { value: "جسدي", label: "accidentTypeOptionBody" }, { value: "مادي", label: "accidentTypeOptionMaterial" }, { value: "جسدي + مادي", label: "accidentTypeOptionBodyMaterial" },])} {renderCommonInput("accidentsketchLabel", "sketch", formData.accidentDetails.sketch, "text", false, "accidentDetails", "sketch")} </div> <div className="col-span-1 md:col-span-2"> {renderCommonInput("driverStatementLabel", "driverStatement", formData.accidentDetails.driverStatement, "textarea", false, "accidentDetails", "driverStatement")} </div> <div> <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">{t('thirdPartyDamagedVehiclesTitle')}</h3> {(formData.thirdPartyVehicles || []).map((vehicle, index) => (<div key={`tpv-${index}`} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-3 border dark:border-gray-600 space-y-2"> <div className="flex justify-between items-center"> <span className="text-sm text-gray-700 dark:text-gray-300">{t('thirdPartyVehicleItem', { index: index + 1, id: vehicle.vehicleNumber || t('newLabel') })}</span> <button type="button" onClick={() => removeArrayItem('thirdPartyVehicles', index)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div> <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"> {renderCommonInput("tpv_vehicleNumberLabel", "vehicleNumber", vehicle.vehicleNumber, "text", false, null, null, null, "thirdPartyVehicles", index, "vehicleNumber")} {renderCommonInput("tpv_typeLabel", "type", vehicle.type, "text", false, null, null, null, "thirdPartyVehicles", index, "type")} {renderCommonInput("tpv_modelLabel", "model", vehicle.model, "text", false, null, null, null, "thirdPartyVehicles", index, "model")} {renderCommonInput("tpv_colorLabel", "color", vehicle.color, "text", false, null, null, null, "thirdPartyVehicles", index, "color")} {renderCommonInput("tpv_ownerNameLabel", "ownerName", vehicle.ownerName, "text", false, null, null, null, "thirdPartyVehicles", index, "ownerName")} {renderCommonInput("tpv_ownerAddressLabel", "ownerAddress", vehicle.ownerAddress, "text", false, null, null, null, "thirdPartyVehicles", index, "ownerAddress")} {renderCommonInput("tpv_ownerPhoneLabel", "ownerPhone", vehicle.ownerPhone, "tel", false, null, null, null, "thirdPartyVehicles", index, "ownerPhone")} {renderCommonInput("tpv_driverNameLabel", "driverName", vehicle.driverName, "text", false, null, null, null, "thirdPartyVehicles", index, "driverName")} {renderCommonInput("tpv_driverAddressLabel", "driverAddress", vehicle.driverAddress, "text", false, null, null, null, "thirdPartyVehicles", index, "driverAddress")} {renderCommonInput("tpv_driverPhoneLabel", "driverPhone", vehicle.driverPhone, "tel", false, null, null, null, "thirdPartyVehicles", index, "driverPhone")} {renderCommonInput("tpv_insuranceCompanyLabel", "insuranceCompany", vehicle.insuranceCompany, "text", false, null, null, null, "thirdPartyVehicles", index, "insuranceCompany")} {renderCommonInput("tpv_insurancePolicyNumberLabel", "insurancePolicyNumber", vehicle.insurancePolicyNumber, "text", false, null, null, null, "thirdPartyVehicles", index, "insurancePolicyNumber")} </div> {renderCommonInput("tpv_damageDetailsLabel", "damageDetails", vehicle.damageDetails, "textarea", false, null, null, null, "thirdPartyVehicles", index, "damageDetails")} </div>))} <button type="button" onClick={() => addArrayItem('thirdPartyVehicles', { vehicleNumber: '', type: '', model: '', color: '', ownerName: '', ownerAddress: '', ownerPhone: '', driverName: '', driverAddress: '', driverPhone: '', insuranceCompany: '', insurancePolicyNumber: '', damageDetails: '' })} className="mt-2 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t('addDamagedVehicleButton')} </button> </div> <div> <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">{t('thirdPartyInjuriesTitle')}</h3> {(formData.thirdPartyInjuries || []).map((injury, index) => (<div key={`tpi-${index}`} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-3 border dark:border-gray-600 space-y-2"> <div className="flex justify-between items-center"> <span className="text-sm text-gray-700 dark:text-gray-300">{t('thirdPartyInjuryItem', { index: index + 1, name: injury.name || t('newLabel') })}</span> <button type="button" onClick={() => removeArrayItem('thirdPartyInjuries', index)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div> <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"> {renderCommonInput("tpi_nameLabel", "name", injury.name, "text", false, null, null, null, "thirdPartyInjuries", index, "name")} {renderCommonInput("tpi_ageLabel", "age", injury.age, "number", false, null, null, null, "thirdPartyInjuries", index, "age")} {renderCommonInput("tpi_addressLabel", "address", injury.address, "text", false, null, null, null, "thirdPartyInjuries", index, "address")} {renderCommonInput("tpi_professionLabel", "profession", injury.profession, "text", false, null, null, null, "thirdPartyInjuries", index, "profession")} </div> {renderCommonInput("tpi_injuryTypeLabel", "injuryType", injury.injuryType, "textarea", false, null, null, null, "thirdPartyInjuries", index, "injuryType")} </div>))} <button type="button" onClick={() => addArrayItem('thirdPartyInjuries', { name: '', age: '', address: '', profession: '', injuryType: '' })} className="mt-2 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t('addInjuryButton')} </button> </div> </div>);
    const renderDeclaration = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {renderCommonInput("declarationDriverSignatureLabel", "driverSignature", formData.declaration.driverSignature, "text", false, "declaration", "driverSignature")} {renderCommonInput("declarationDateLabel", "declarationDate", formData.declaration.declarationDate, "date", false, "declaration", "declarationDate")} {renderCommonInput("declarationOfficerSignatureLabel", "officerSignature", formData.declaration.officerSignature, "text", false, "declaration", "officerSignature")} {renderCommonInput("declarationOfficerDateLabel", "officerDate", formData.declaration.officerDate, "date", false, "declaration", "officerDate")} </div>);

    const modalTitleText = t('modalTitle'); 
    const submitButtonText = t('submitButton'); 

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm overflow-y-auto hide-scrollbar"
            onClick={() => { if (!isSubmitting) onClose(); }}
        >
            <div
                className="w-full max-w-5xl bg-[rgb(255,255,255)] rounded-lg shadow-xl flex flex-col dark:bg-navbarBack max-h-[95vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 sticky top-0 bg-[rgb(255,255,255)] dark:bg-navbarBack z-10">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-[rgb(255,255,255)]">{modalTitleText}</h2>
                    <button onClick={() => { if (!isSubmitting) onClose() }} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400" disabled={isSubmitting}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {renderStepIndicator()}
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto hide-scrollbar">
                    <div className="px-6 pb-2">
                        <div className="flex items-center justify-between pb-2 border-b dark:border-gray-600 mb-4">
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{getStepTitle()}</p>
                        </div>
                        <div className="space-y-4">
                            {currentStep === 1 && renderReportInfo()}
                            {currentStep === 2 && renderPolicyInfo()}
                            {currentStep === 3 && renderDriverInfo()}
                            {currentStep === 4 && renderVehicleInfo()}
                            {currentStep === 5 && renderAccidentDetails()}
                            {currentStep === 6 && renderDeclaration()}
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-between items-center border-t dark:border-gray-700 sticky bottom-0 bg-[rgb(255,255,255)] dark:bg-navbarBack z-10">
                        <button
                            type="button"
                            onClick={handleBack}
                            className={`px-4 py-2 text-sm rounded-md shadow-sm ${currentStep === 1 || isSubmitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-600 dark:text-gray-500' : 'text-gray-700 bg-[rgb(255,255,255)] border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600'}`}
                            disabled={currentStep === 1 || isSubmitting}
                        > {t('backButton')} </button>
                        {currentStep < 6 && (
                            <button
                                type="button"
                                onClick={handleNext}
                                className={`px-4 py-2 text-sm text-[rgb(255,255,255)] bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                            > {t('nextButton')} </button>
                        )}
                        {currentStep === 6 && (
                            <button
                                type="submit"
                                className={`px-6 py-2 text-sm text-[rgb(255,255,255)] bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                            > {isSubmitting ? t('submitting') : submitButtonText} </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InsuranceAhliaRep;