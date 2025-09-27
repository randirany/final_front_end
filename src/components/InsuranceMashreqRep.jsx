import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

function InsuranceMashreqRep({ onClose, isOpen, onReportAdded }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { vehicleId } = useParams();
    const { t, i18n: { language } } = useTranslation();

    const memoizedInitialFormData = useMemo(() => ({
        branchOffice: '',
        insurancePolicy: { type: '', number: '', duration: '', from: '', to: '' },
        insuredPerson: { name: '', personalNumber: '', fullAddress: '', phone: '' },
        vehicle: { registrationNumber: '', usage: '', type: '', makeYear: '', color: '' },
        driver: { name: '', job: '', fullAddress: '', phone: '', licenseNumber: '', licenseType: '', licenseIssueDate: '', licenseExpiryDate: '', age: '', idNumber: '' },
        accident: { date: '', time: '', weatherCondition: '', roadCondition: '', accidentLocation: '', accidentType: '', damageToVehicle: '', vehicleSpeed: '', timeOfAccident: '', passengersCount: 0, vehicleUsedPermission: false, accidentNotifierName: '', accidentNotifierPhone: '' },
        otherVehicles: [],
        vehicleDamages: '',
        personalInjuries: [],
        thirdPartyInjuredNames: [],
        vehiclePassengers: [],
        externalWitnesses: [],
        driverSignature: { name: '', date: '' },
        claimant: { name: '', signature: '' },
        receiver: { name: '', notes: '' },
        generalNotes: ''
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

    const handleChange = (e, section, subField, arrayName, index, itemFieldGiven) => {
        const { name, value, type, checked } = e.target;
        const valToSet = type === 'checkbox' ? checked : value;
        const fieldToUpdate = itemFieldGiven || name;
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            if (arrayName && typeof index === 'number' && fieldToUpdate) {
                if (!newState[arrayName]) newState[arrayName] = [];
                while (index >= newState[arrayName].length) newState[arrayName].push({});
                newState[arrayName][index][fieldToUpdate] = valToSet;
            } else if (section && subField) {
                if (!newState[section]) newState[section] = {};
                newState[section][subField] = valToSet;
            } else if (section) {
                if (!newState[section]) newState[section] = {};
                newState[section][name] = valToSet;
            }
            else {
                newState[name] = valToSet;
            }
            return newState;
        });
    };

    const handleStringArrayChange = (arrayName, index, newValue) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            if (!newState[arrayName]) newState[arrayName] = [];
            newState[arrayName][index] = newValue;
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
        const toNumberOrNull = (val) => (val === '' || val === null || val === undefined) ? null : (isNaN(Number(val)) ? null : Number(val));
        const formatDateForBackend = (dateStr) => (!dateStr || dateStr.trim() === '') ? null : (new Date(dateStr).toISOString());

        if (dataToSend.insurancePolicy) {
            dataToSend.insurancePolicy.from = formatDateForBackend(dataToSend.insurancePolicy.from);
            dataToSend.insurancePolicy.to = formatDateForBackend(dataToSend.insurancePolicy.to);
        }
        if (dataToSend.driver) {
            dataToSend.driver.age = toNumberOrNull(dataToSend.driver.age);
            dataToSend.driver.licenseIssueDate = formatDateForBackend(dataToSend.driver.licenseIssueDate);
            dataToSend.driver.licenseExpiryDate = formatDateForBackend(dataToSend.driver.licenseExpiryDate);
        }
        if (dataToSend.accident) {
            dataToSend.accident.date = formatDateForBackend(dataToSend.accident.date);
            dataToSend.accident.passengersCount = toNumberOrNull(dataToSend.accident.passengersCount);
        }
        if (dataToSend.driverSignature) {
            dataToSend.driverSignature.date = formatDateForBackend(dataToSend.driverSignature.date);
        }
        dataToSend.personalInjuries = (dataToSend.personalInjuries || []).map(injury => ({
            ...injury,
            age: toNumberOrNull(injury.age)
        }));

        const url = `http://localhost:3002/api/v1/Al_MashreqAccidentReport/${endpointPath}`;
        try {
            const token = `islam__${localStorage.getItem("token")}`;

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', token },
                body: JSON.stringify(dataToSend)
            });
            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.message || `HTTP error! status: ${response.status}`);

            alert(t('mashreq.formSubmissionSuccess') + (responseData.message ? `\n${responseData.message}` : ''));

            if (onReportAdded) {
                onReportAdded();
            } else {
                onClose();
            }

        } catch (error) {
            alert(t('mashreq.formSubmissionError') + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addArrayItem = (arrayName, itemStructure) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            if (!newState[arrayName]) newState[arrayName] = [];
            newState[arrayName].push(JSON.parse(JSON.stringify(itemStructure)));
            return newState;
        });
    };
    const removeArrayItem = (arrayName, index) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            if (newState[arrayName] && newState[arrayName].length > index) {
                newState[arrayName].splice(index, 1);
            }
            return newState;
        });
    };
    const addStringToArray = (arrayName) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            if (!newState[arrayName]) newState[arrayName] = [];
            newState[arrayName].push("");
            return newState;
        });
    };

    const getStepTitle = () => { switch (currentStep) { case 1: return t('mashreq.officePolicyTitle'); case 2: return t('mashreq.insuredVehicleTitle'); case 3: return t('mashreq.driverInfoTitle'); case 4: return t('mashreq.accidentDetailsTitle'); case 5: return t('mashreq.otherPartiesDamagesTitle'); case 6: return t('mashreq.signaturesNotesTitle'); default: return ''; } };
    const renderStepIndicator = () => (<div className="px-4 py-3 mb-4"> <div className="flex justify-between items-center"> {[1, 2, 3, 4, 5, 6].map((step) => (<div key={step} className="flex flex-col items-center text-center flex-1 px-1"> <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium ${currentStep >= step ? 'bg-indigo-600 text-[rgb(255,255,255)]' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{step}</div> <span className="text-[10px] leading-tight mt-1 text-gray-600 dark:text-gray-400"> {step === 1 && t('mashreq.step1Indicator')} {step === 2 && t('mashreq.step2Indicator')} {step === 3 && t('mashreq.step3Indicator')} {step === 4 && t('mashreq.step4Indicator')} {step === 5 && t('mashreq.step5Indicator')} {step === 6 && t('mashreq.step6Indicator')} </span> </div>))} </div> </div>);
    const renderCommonInput = (labelKey, nameAttribute, value, type = "text", required = false, section = null, subField = null, options = null, arrayName = null, index = null, itemFieldForHandleChange = null) => { const inputId = `${section || ''}_${subField || ''}_${arrayName || ''}_${index === null ? '' : index}_${itemFieldForHandleChange || nameAttribute || labelKey}`.replace(/\W/g, '_'); const actualItemField = itemFieldForHandleChange || nameAttribute; if (type === "checkbox") { /* ... */ } return (<div> <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t(labelKey)} {required && <span className="text-red-500">*</span>}</label> {type === "select" ? (<select id={inputId} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, subField || nameAttribute, arrayName, index, actualItemField)} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required={required}> {(options || []).map(opt => <option key={opt.value} value={opt.value}>{t(opt.label)}</option>)} </select>) : type === "textarea" ? (<textarea id={inputId} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, subField || nameAttribute, arrayName, index, actualItemField)} rows="3" className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required={required}></textarea>) : (<input id={inputId} type={type} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, subField || nameAttribute, arrayName, index, actualItemField)} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required={required} />)} </div>); };
    const renderCheckbox = (labelKey, nameAttribute, checked, section, subField, arrayName = null, index = null, itemFieldForHandleChange = null) => { const inputId = `${section || ''}_${subField || ''}_${arrayName || ''}_${index === null ? '' : index}_${itemFieldForHandleChange || nameAttribute || labelKey}`.replace(/\W/g, '_'); const actualItemField = itemFieldForHandleChange || nameAttribute; return (<div className="flex items-center col-span-1 md:col-span-2 mt-2"> <input type="checkbox" id={inputId} name={nameAttribute} checked={Boolean(checked)} onChange={(e) => handleChange(e, section, subField || nameAttribute, arrayName, index, actualItemField)} className="h-4 w-4 text-indigo-600 border-gray-300 dark:!border-nonerounded focus:ring-indigo-500" /> <label htmlFor={inputId} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">{t(labelKey)}</label> </div>); };
    const renderOfficePolicyInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {renderCommonInput("mashreq.branchOfficeLabel", "branchOffice", formData.branchOffice, "text", true)} {renderCommonInput("mashreq.policyTypeLabel", "type", formData.insurancePolicy.type, "text", false, "insurancePolicy", "type")} {renderCommonInput("mashreq.policyNumberLabel", "number", formData.insurancePolicy.number, "text", false, "insurancePolicy", "number")} {renderCommonInput("mashreq.policyDurationLabel", "duration", formData.insurancePolicy.duration, "text", false, "insurancePolicy", "duration")} {renderCommonInput("mashreq.policyFromLabel", "from", formData.insurancePolicy.from, "date", false, "insurancePolicy", "from")} {renderCommonInput("mashreq.policyToLabel", "to", formData.insurancePolicy.to, "date", false, "insurancePolicy", "to")} </div>);
    const renderInsuredVehicleInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {renderCommonInput("insuredPersonNameLabel", "name", formData.insuredPerson.name, "text", false, "insuredPerson", "name")} {renderCommonInput("mashreq.insuredPersonalNumberLabel", "personalNumber", formData.insuredPerson.personalNumber, "text", false, "insuredPerson", "personalNumber")} {renderCommonInput("mashreq.insuredFullAddressLabel", "fullAddress", formData.insuredPerson.fullAddress, "text", false, "insuredPerson", "fullAddress")} {renderCommonInput("mashreq.insuredPhoneLabel", "phone", formData.insuredPerson.phone, "tel", false, "insuredPerson", "phone")} <div className="md:col-span-2 my-2 border-t dark:border-gray-600"></div> {/* بما أن التعديل غير مفعل، لا نعرض حقل رقم التسجيل لإدخاله */} {/* renderCommonInput("mashreq.vehicleRegNoLabel", "registrationNumber", formData.vehicle.registrationNumber, "text", true, "vehicle", "registrationNumber") */} {renderCommonInput("mashreq.vehicleUsageLabel", "usage", formData.vehicle.usage, "text", false, "vehicle", "usage")} {renderCommonInput("vehicleTypeLabel", "type", formData.vehicle.type, "text", false, "vehicle", "type")} {renderCommonInput("mashreq.vehicleMakeYearLabel", "makeYear", formData.vehicle.makeYear, "number", false, "vehicle", "makeYear")} {renderCommonInput("tpv_colorLabel", "color", formData.vehicle.color, "text", false, "vehicle", "color")} </div>);
    const renderDriverInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {renderCommonInput("mashreq.driverNameLabel", "name", formData.driver.name, "text", true, "driver", "name")} {renderCommonInput("mashreq.driverJobLabel", "job", formData.driver.job, "text", false, "driver", "job")} {renderCommonInput("mashreq.driverAddressLabel", "fullAddress", formData.driver.fullAddress, "text", false, "driver", "fullAddress")} {renderCommonInput("mashreq.driverPhoneLabel", "phone", formData.driver.phone, "tel", false, "driver", "phone")} {renderCommonInput("mashreq.driverLicenseNoLabel", "licenseNumber", formData.driver.licenseNumber, "text", true, "driver", "licenseNumber")} {renderCommonInput("mashreq.driverLicenseTypeLabel", "licenseType", formData.driver.licenseType, "text", false, "driver", "licenseType")} {renderCommonInput("mashreq.driverLicenseIssueDateLabel", "licenseIssueDate", formData.driver.licenseIssueDate, "date", false, "driver", "licenseIssueDate")} {renderCommonInput("mashreq.driverLicenseExpiryDateLabel", "licenseExpiryDate", formData.driver.licenseExpiryDate, "date", false, "driver", "licenseExpiryDate")} {renderCommonInput("mashreq.driverAgeLabel", "age", formData.driver.age, "number", false, "driver", "age")} {renderCommonInput("mashreq.driverIdNumberLabel", "idNumber", formData.driver.idNumber, "text", false, "driver", "idNumber")} </div>);
    const renderAccidentDetails = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {renderCommonInput("mashreq.accidentDateLabel", "date", formData.accident.date, "date", true, "accident", "date")} {renderCommonInput("mashreq.accidentTimeLabel", "time", formData.accident.time, "time", true, "accident", "time")} {renderCommonInput("mashreq.weatherConditionLabel", "weatherCondition", formData.accident.weatherCondition, "text", false, "accident", "weatherCondition")} {renderCommonInput("mashreq.roadConditionLabel", "roadCondition", formData.accident.roadCondition, "text", false, "accident", "roadCondition")} {renderCommonInput("mashreq.accidentLocationLabel", "accidentLocation", formData.accident.accidentLocation, "text", true, "accident", "accidentLocation")} {renderCommonInput("mashreq.accidentTypeLabel", "accidentType", formData.accident.accidentType, "text", false, "accident", "accidentType")} {renderCommonInput("mashreq.damageToVehicleLabel", "damageToVehicle", formData.accident.damageToVehicle, "textarea", false, "accident", "damageToVehicle")} {renderCommonInput("mashreq.vehicleSpeedLabel", "vehicleSpeed", formData.accident.vehicleSpeed, "text", false, "accident", "vehicleSpeed")} {renderCommonInput("mashreq.timeOfAccidentLabel", "timeOfAccident", formData.accident.timeOfAccident, "text", false, "accident", "timeOfAccident")} {renderCommonInput("mashreq.passengersCountLabel", "passengersCount", formData.accident.passengersCount, "number", false, "accident", "passengersCount")} {renderCheckbox("mashreq.vehicleUsedPermissionLabel", "vehicleUsedPermission", formData.accident.vehicleUsedPermission, "accident", "vehicleUsedPermission")} {renderCommonInput("mashreq.accidentNotifierNameLabel", "accidentNotifierName", formData.accident.accidentNotifierName, "text", false, "accident", "accidentNotifierName")} {renderCommonInput("mashreq.accidentNotifierPhoneLabel", "accidentNotifierPhone", formData.accident.accidentNotifierPhone, "tel", false, "accident", "accidentNotifierPhone")} </div>);
    const renderOtherPartiesDamages = () => (<div className="space-y-6"> <div> <h3 className="text-md font-medium text-gray-700 mb-2 dark:text-gray-300">{t('mashreq.otherVehiclesTitle')}</h3> {(formData.otherVehicles || []).map((vehicle, index) => (<div key={`ov-${index}`} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-3 border dark:border-gray-600 space-y-2"> <div className="flex justify-between items-center"> <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('mashreq.otherVehicleItem', { index: index + 1 })}</span> <button type="button" onClick={() => removeArrayItem('otherVehicles', index)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div> <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"> {renderCommonInput("mashreq.otherVehicleNumberLabel", "vehicleNumber", vehicle.vehicleNumber, "text", false, "otherVehicles", null, null, "otherVehicles", index, "vehicleNumber")} {renderCommonInput("mashreq.otherVehicleTypeLabel", "type", vehicle.type, "text", false, "otherVehicles", null, null, "otherVehicles", index, "type")} {renderCommonInput("mashreq.otherVehicleMakeYearLabel", "makeYear", vehicle.makeYear, "text", false, "otherVehicles", null, null, "otherVehicles", index, "makeYear")} {renderCommonInput("mashreq.otherVehicleColorLabel", "color", vehicle.color, "text", false, "otherVehicles", null, null, "otherVehicles", index, "color")} {renderCommonInput("mashreq.otherVehicleOwnerNameLabel", "ownerName", vehicle.ownerName, "text", false, "otherVehicles", null, null, "otherVehicles", index, "ownerName")} {renderCommonInput("mashreq.otherVehicleOwnerAddressLabel", "ownerAddress", vehicle.ownerAddress, "text", false, "otherVehicles", null, null, "otherVehicles", index, "ownerAddress")} {renderCommonInput("mashreq.otherVehicleDriverNameLabel", "driverName", vehicle.driverName, "text", false, "otherVehicles", null, null, "otherVehicles", index, "driverName")} {renderCommonInput("mashreq.otherVehicleDriverAddressLabel", "driverAddress", vehicle.driverAddress, "text", false, "otherVehicles", null, null, "otherVehicles", index, "driverAddress")} {renderCommonInput("mashreq.otherVehicleInsuranceCoLabel", "insuranceCompany", vehicle.insuranceCompany, "text", false, "otherVehicles", null, null, "otherVehicles", index, "insuranceCompany")} {renderCommonInput("mashreq.otherVehiclePolicyNoLabel", "insurancePolicyNumber", vehicle.insurancePolicyNumber, "text", false, "otherVehicles", null, null, "otherVehicles", index, "insurancePolicyNumber")} </div> {renderCheckbox("mashreq.otherVehicleWasParkedLabel", "wasParked", vehicle.wasParked, "otherVehicles", "wasParked", "otherVehicles", index, "wasParked")} {renderCommonInput("mashreq.otherVehicleDamageDescLabel", "damageDescription", vehicle.damageDescription, "textarea", false, "otherVehicles", null, null, "otherVehicles", index, "damageDescription")} </div>))} <button type="button" onClick={() => addArrayItem('otherVehicles', { vehicleNumber: '', type: '', makeYear: '', color: '', ownerName: '', ownerAddress: '', driverName: '', driverAddress: '', insuranceCompany: '', insurancePolicyNumber: '', wasParked: false, damageDescription: '' })} className="mt-2 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t('mashreq.addOtherVehicleButton')} </button> </div> {renderCommonInput("mashreq.vehicleDamagesOverallLabel", "vehicleDamages", formData.vehicleDamages, "textarea")} <div> <h3 className="text-md font-medium text-gray-700 mb-2 dark:text-gray-300">{t('mashreq.personalInjuriesTitle')}</h3> {(formData.personalInjuries || []).map((injury, index) => (<div key={`pi-${index}`} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-3 border dark:border-gray-600 space-y-2"> <div className="flex justify-between items-center"> <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('mashreq.personalInjuryItem', { index: index + 1, name: injury.name || t('newLabel') })}</span> <button type="button" onClick={() => removeArrayItem('personalInjuries', index)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div> <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"> {renderCommonInput("mashreq.injuryNameLabel", "name", injury.name, "text", false, "personalInjuries", null, null, "personalInjuries", index, "name")} {renderCommonInput("mashreq.injuryAgeLabel", "age", injury.age, "number", false, "personalInjuries", null, null, "personalInjuries", index, "age")} {renderCommonInput("mashreq.injuryJobLabel", "job", injury.job, "text", false, "personalInjuries", null, null, "personalInjuries", index, "job")} {renderCommonInput("mashreq.injuryAddressLabel", "address", injury.address, "text", false, "personalInjuries", null, null, "personalInjuries", index, "address")} </div> {renderCommonInput("mashreq.injuryTypeLabel", "injuryType", injury.injuryType, "textarea", false, "personalInjuries", null, null, "personalInjuries", index, "injuryType")} </div>))} <button type="button" onClick={() => addArrayItem('personalInjuries', { name: '', age: '', job: '', address: '', injuryType: '' })} className="mt-2 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t('mashreq.addPersonalInjuryButton')} </button> </div> {[{ title: "mashreq.thirdPartyInjuredNamesTitle", arrayName: "thirdPartyInjuredNames", buttonLabel: "mashreq.addThirdPartyInjuredNameButton", placeholder: "mashreq.thirdPartyInjuredNamePlaceholder" }, { title: "mashreq.vehiclePassengersTitle", arrayName: "vehiclePassengers", buttonLabel: "mashreq.addVehiclePassengerButton", placeholder: "mashreq.passengerNamePlaceholder" }, { title: "mashreq.externalWitnessesTitle", arrayName: "externalWitnesses", buttonLabel: "mashreq.addExternalWitnessButton", placeholder: "mashreq.witnessNamePlaceholder" }].map(section => (<div key={section.arrayName}> <h3 className="text-md font-medium text-gray-700 mb-2 dark:text-gray-300">{t(section.title)}</h3> {(formData[section.arrayName] || []).map((name, index) => (<div key={`${section.arrayName}-${index}`} className="flex items-center bg-gray-50 dark:bg-gray-700/30 p-2 rounded-md mb-2 border dark:border-gray-600"> <input type="text" placeholder={t(section.placeholder)} value={name} onChange={e => handleStringArrayChange(section.arrayName, index, e.target.value)} className="flex-grow p-2 border text-sm border-gray-300 dark:border-gray-500 dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md mr-2 rtl:ml-2 rtl:mr-0" /> <button type="button" onClick={() => removeArrayItem(section.arrayName, index)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div>))} <button type="button" onClick={() => addStringToArray(section.arrayName)} className="mt-1 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t(section.buttonLabel)} </button> </div>))} </div>);
    const renderSignaturesNotes = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {renderCommonInput("mashreq.driverSignatureNameLabel", "name", formData.driverSignature.name, "text", false, "driverSignature", "name")} {renderCommonInput("mashreq.driverSignatureDateLabel", "date", formData.driverSignature.date, "date", false, "driverSignature", "date")} {renderCommonInput("mashreq.claimantNameLabel", "name", formData.claimant.name, "text", false, "claimant", "name")} {renderCommonInput("mashreq.claimantSignatureLabel", "signature", formData.claimant.signature, "text", false, "claimant", "signature")} {renderCommonInput("mashreq.receiverNameLabel", "name", formData.receiver.name, "text", false, "receiver", "name")} {renderCommonInput("mashreq.receiverNotesLabel", "notes", formData.receiver.notes, "textarea", false, "receiver", "notes")} <div className="md:col-span-2"> {renderCommonInput("mashreq.generalNotesLabel", "generalNotes", formData.generalNotes, "textarea")} </div> </div>);

    const modalTitleText = t('mashreq.modalTitle');
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
                            {currentStep === 1 && renderOfficePolicyInfo()}
                            {currentStep === 2 && renderInsuredVehicleInfo()}
                            {currentStep === 3 && renderDriverInfo()}
                            {currentStep === 4 && renderAccidentDetails()}
                            {currentStep === 5 && renderOtherPartiesDamages()}
                            {currentStep === 6 && renderSignaturesNotes()}
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

export default InsuranceMashreqRep;