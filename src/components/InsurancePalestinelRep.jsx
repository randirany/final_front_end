import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

function InsurancePalestineRep({ onClose, isOpen, onReportAdded }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { vehicleId } = useParams();
    const { t, i18n: { language } } = useTranslation();

    const memoizedInitialFormData = useMemo(() => ({
        agentInfo: { agentName: '', documentNumber: '', documentType: '', insurancePeriod: { from: '', to: '' } },
        vehicleInfo: { documentDate: '', vehicleNumber: '', vehicleType: '', make: '', modelYear: '', usage: '', color: '', ownerName: '', ownerID: '', registrationExpiry: '' },
        driverInfo: { name: '', idNumber: '', age: '', occupation: '', address: '', license: { number: '', type: '', issueDate: '', expiryDate: '' } },
        accidentDetails: { accidentDate: '', time: '', location: '', numberOfPassengers: '', vehicleSpeed: '', vehiclePurposeAtTime: '', accidentDescription: '', responsibleParty: '', policeInformed: false, policeStation: '' },
        thirdParty: { vehicleNumber: '', vehicleType: '', make: '', model: '', color: '', ownerName: '', ownerPhone: '', ownerAddress: '', driverName: '', driverPhone: '', driverAddress: '', insuranceCompany: '', insurancePolicyNumber: '', vehicleDamages: '' },
        injuries: [],
        witnesses: [],
        passengers: [],
        additionalDetails: { notes: '', signature: '', date: '', agentRemarks: '' }
    }), []);

    const [formData, setFormData] = useState(() => JSON.parse(JSON.stringify(memoizedInitialFormData)));

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                if (!isSubmitting) onClose();
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

    const handleChange = (e, section, subFieldOrItemFieldInArray, arrayName, indexInArray, itemFieldInArrayElement, subSubField) => {
        const { name: eventTargetName, value, type, checked } = e.target;
        const valToSet = type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value);
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            if (typeof arrayName === 'string' && typeof indexInArray === 'number' && typeof itemFieldInArrayElement === 'string') {
                let targetArray;
                if (section && subFieldOrItemFieldInArray && newState[section] && Array.isArray(newState[section][subFieldOrItemFieldInArray])) {
                    targetArray = newState[section][subFieldOrItemFieldInArray];
                } else if (newState[arrayName] && Array.isArray(newState[arrayName])) {
                    targetArray = newState[arrayName];
                } else { return prev; }
                while (indexInArray >= targetArray.length) targetArray.push({});
                if (typeof targetArray[indexInArray] !== 'object' || targetArray[indexInArray] === null) targetArray[indexInArray] = {};
                targetArray[indexInArray][itemFieldInArrayElement] = valToSet;
            } else if (section && subFieldOrItemFieldInArray && subSubField) {
                if (!newState[section]) newState[section] = {};
                if (!newState[section][subFieldOrItemFieldInArray] || typeof newState[section][subFieldOrItemFieldInArray] !== 'object') newState[section][subFieldOrItemFieldInArray] = {};
                newState[section][subFieldOrItemFieldInArray][subSubField] = valToSet;
            } else if (section && subFieldOrItemFieldInArray) {
                if (!newState[section]) newState[section] = {};
                newState[section][subFieldOrItemFieldInArray] = valToSet;
            } else if (subFieldOrItemFieldInArray) {
                if (section) {
                     if (!newState[section]) newState[section] = {};
                     newState[section][subFieldOrItemFieldInArray] = valToSet;
                } else { newState[subFieldOrItemFieldInArray] = valToSet; }
            } else {
                 if (eventTargetName && prev.hasOwnProperty(eventTargetName)) { newState[eventTargetName] = valToSet; }
            }
            return newState;
        });
    };

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 7));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        let endpointPath = '';
        const method ='POST';
       
            if (!vehicleId) {
                alert(t('vehicleIdParamRequiredError')); setIsSubmitting(false); return;
            }
            endpointPath = `add/${vehicleId}`;
        

        const dataToSend = JSON.parse(JSON.stringify(formData));
        const toNumberOrNull = (val) => { const num = Number(val); return isNaN(num) || val === '' || val === null || val === undefined ? null : num; };
        const toBoolean = (val) => typeof val === 'string' ? (val.toLowerCase() === 'true') : Boolean(val);
        const formatDateForBackend = (dateStr) => { if (!dateStr || dateStr.trim() === '') return null; try { return new Date(dateStr).toISOString(); } catch (e) { return null; } };

        if (dataToSend.agentInfo?.insurancePeriod) {
            dataToSend.agentInfo.insurancePeriod.from = formatDateForBackend(dataToSend.agentInfo.insurancePeriod.from);
            dataToSend.agentInfo.insurancePeriod.to = formatDateForBackend(dataToSend.agentInfo.insurancePeriod.to);
        }
        if (dataToSend.vehicleInfo) {
            dataToSend.vehicleInfo.documentDate = formatDateForBackend(dataToSend.vehicleInfo.documentDate);
            dataToSend.vehicleInfo.registrationExpiry = formatDateForBackend(dataToSend.vehicleInfo.registrationExpiry);
            dataToSend.vehicleInfo.modelYear = String(dataToSend.vehicleInfo.modelYear);
        }
        if (dataToSend.driverInfo) {
            dataToSend.driverInfo.age = toNumberOrNull(dataToSend.driverInfo.age);
            if (dataToSend.driverInfo.license) {
                dataToSend.driverInfo.license.issueDate = formatDateForBackend(dataToSend.driverInfo.license.issueDate);
                dataToSend.driverInfo.license.expiryDate = formatDateForBackend(dataToSend.driverInfo.license.expiryDate);
            }
        }
        if (dataToSend.accidentDetails) {
            dataToSend.accidentDetails.accidentDate = formatDateForBackend(dataToSend.accidentDetails.accidentDate);
            dataToSend.accidentDetails.numberOfPassengers = toNumberOrNull(dataToSend.accidentDetails.numberOfPassengers);
            dataToSend.accidentDetails.vehicleSpeed = toNumberOrNull(dataToSend.accidentDetails.vehicleSpeed);
            dataToSend.accidentDetails.policeInformed = toBoolean(dataToSend.accidentDetails.policeInformed);
        }
        dataToSend.injuries = (dataToSend.injuries || []).map(injury => ({ ...injury, age: toNumberOrNull(injury.age) }));
        dataToSend.witnesses = (dataToSend.witnesses || []).map(witness => ({ ...witness, statementGiven: toBoolean(witness.statementGiven) }));
        dataToSend.passengers = (dataToSend.passengers || []).map(p => (typeof p === 'string' ? { name: p } : { name: p.name }));
        if (dataToSend.additionalDetails) {
            dataToSend.additionalDetails.date = formatDateForBackend(dataToSend.additionalDetails.date);
        }

        const url = `http://localhost:3002/api/v1/PlestineAccidentReport/${endpointPath}`;
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', token },
                body: JSON.stringify(dataToSend)
            });
            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.message || `HTTP error! status: ${response.status}`);

            alert(t('palestine.report.palestine.formSubmissionSuccess') + (responseData.message ? `\n${responseData.message}` : ''));

            if (onReportAdded) {
                onReportAdded(); 
            } else {
                onClose(); 
            }

        } catch (error) {
            console.error('Submission error (Palestine):', error);
            alert(t('palestine.report.palestine.formSubmissionError') + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addArrayItem = (arrayName, itemStructure = {}) => {
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

    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return t('palestine.report.palestine.agentPolicyTitle');
            case 2: return t('palestine.report.palestine.vehicleInfoTitle');
            case 3: return t('palestine.report.palestine.driverInfoTitle');
            case 4: return t('palestine.report.palestine.accidentDetailsTitle');
            case 5: return t('palestine.report.palestine.thirdPartyTitle');
            case 6: return t('palestine.report.palestine.injuriesWitnessesTitle');
            case 7: return t('palestine.report.palestine.passengersAdditionalTitle');
            default: return '';
        }
    };
    const renderStepIndicator = () => (
        <div className="px-4 py-3 mb-4">
            <div className="flex justify-between items-center">
                {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                    <div key={step} className="flex flex-col items-center text-center flex-1 px-1">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium ${currentStep >= step ? 'bg-indigo-600 text-[rgb(255,255,255)]' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{step}</div>
                        <span className="text-[10px] leading-tight mt-1 text-gray-600 dark:text-gray-400">
                            {step === 1 && t('palestine.report.palestine.step1Indicator')}
                            {step === 2 && t('palestine.report.palestine.step2Indicator')}
                            {step === 3 && t('palestine.report.palestine.step3Indicator')}
                            {step === 4 && t('palestine.report.palestine.step4Indicator')}
                            {step === 5 && t('palestine.report.palestine.step5Indicator')}
                            {step === 6 && t('palestine.report.palestine.step6Indicator')}
                            {step === 7 && t('palestine.report.palestine.step7Indicator')}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCommonInput = (labelKey, nameAttribute, value, type = "text", required = false, section = null, subField = null, arrayName = null, index = null, itemFieldForHandleChange = null, subSubField = null, options = null) => {
        const inputId = `${section || ''}_${subField || ''}_${subSubField || ''}_${arrayName || ''}_${index === null ? '' : index}_${itemFieldForHandleChange || nameAttribute || labelKey}`.replace(/\W/g, '_');
        const actualSubFieldOrItemField = subField || itemFieldForHandleChange;
        const actualItemFieldInArrayElement = itemFieldForHandleChange;
        if (type === "checkbox") {
            return (
                <div className="flex items-center mb-2 col-span-1 md:col-span-2">
                    <input type="checkbox" id={inputId} name={nameAttribute} checked={Boolean(value)} onChange={(e) => handleChange(e, section, actualSubFieldOrItemField, arrayName, index, actualItemFieldInArrayElement, subSubField)} className="h-4 w-4 text-indigo-600 border-gray-300 dark:!border-nonerounded focus:ring-indigo-500"/>
                    <label htmlFor={inputId} className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t(labelKey)} {required && <span className="text-red-500">*</span>}</label>
                </div> );
        }
        return (
            <div className="mb-2">
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t(labelKey)} {required && <span className="text-red-500">*</span>}</label>
                {type === "select" ? (
                    <select id={inputId} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, actualSubFieldOrItemField, arrayName, index, actualItemFieldInArrayElement, subSubField)} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" required={required} >
                        <option value="">{options && options.find(o=>o.value==='') ? t(options.find(o=>o.value==='').label) : t("select", "-- Select --")}</option>
                        {options && options.filter(o=>o.value !== '').map(opt => <option key={opt.value} value={opt.value}>{t(opt.label)}</option>)}
                    </select>
                ) : type === "textarea" ? (
                    <textarea id={inputId} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, actualSubFieldOrItemField, arrayName, index, actualItemFieldInArrayElement, subSubField)} rows="2" className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" required={required} ></textarea>
                ) : (
                    <input id={inputId} type={type} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, actualSubFieldOrItemField, arrayName, index, actualItemFieldInArrayElement, subSubField)} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" required={required} step={type === "number" ? "any" : undefined} min={type === "number" ? 0 : undefined} />
                )}
            </div>);
    };

    const renderAgentPolicyInfo = () => ( <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("palestine.report.palestine.agentNameLabel", "agentName", formData.agentInfo.agentName, "text", true, "agentInfo", "agentName")} {renderCommonInput("palestine.report.palestine.docNumberLabel", "documentNumber", formData.agentInfo.documentNumber, "text", true, "agentInfo", "documentNumber")} {renderCommonInput("palestine.report.palestine.docTypeLabel", "documentType", formData.agentInfo.documentType, "select", true, "agentInfo", "documentType", null, null, null, null, [ { value: "", label: "select"}, { value: "شامل", label: "palestine.report.palestine.docTypeOptionComprehensive" }, { value: "طرف ثالث", label: "palestine.report.palestine.docTypeOptionThirdParty" }, ])} {renderCommonInput("palestine.report.palestine.insurancePeriodFromLabel", "from", formData.agentInfo.insurancePeriod.from, "date", true, "agentInfo", "insurancePeriod", null, null, null, "from")} {renderCommonInput("palestine.report.palestine.insurancePeriodToLabel", "to", formData.agentInfo.insurancePeriod.to, "date", true, "agentInfo", "insurancePeriod", null, null, null, "to")} </div>);
    const renderVehicleInfo = () => ( <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> 
    {renderCommonInput("palestine.report.palestine.docDateLabel", "documentDate", formData.vehicleInfo.documentDate, "date", false, "vehicleInfo", "documentDate")} {renderCommonInput("palestine.report.palestine.vehicleMakeLabel", "make", formData.vehicleInfo.make, "text", false, "vehicleInfo", "make")} {renderCommonInput("manufactureYearLabel", "modelYear", formData.vehicleInfo.modelYear, "number", false, "vehicleInfo", "modelYear")} {renderCommonInput("palestine.report.palestine.vehicleUsageLabel", "usage", formData.vehicleInfo.usage, "text", false, "vehicleInfo", "usage")} {renderCommonInput("tpv_colorLabel", "color", formData.vehicleInfo.color, "text", false, "vehicleInfo", "color")} {renderCommonInput("palestine.report.palestine.ownerNameLabel", "ownerName", formData.vehicleInfo.ownerName, "text", false, "vehicleInfo", "ownerName")} {renderCommonInput("idNumberLabel", "ownerID", formData.vehicleInfo.ownerID, "text", false, "vehicleInfo", "ownerID")} {renderCommonInput("licenseExpiryLabel", "registrationExpiry", formData.vehicleInfo.registrationExpiry, "date", false, "vehicleInfo", "registrationExpiry")} </div> );
    const renderDriverInfo = () => ( <div className="space-y-4"> <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("palestine.report.palestine.driverNameLabel", "name", formData.driverInfo.name, "text", false, "driverInfo", "name")} {renderCommonInput("palestine.report.palestine.driverIdNumberLabel", "idNumber", formData.driverInfo.idNumber, "text", false, "driverInfo", "idNumber")} {renderCommonInput("palestine.report.palestine.driverAgeLabel", "age", formData.driverInfo.age, "number", false, "driverInfo", "age")} {renderCommonInput("palestine.report.palestine.driverOccupationLabel", "occupation", formData.driverInfo.occupation, "text", false, "driverInfo", "occupation")} {renderCommonInput("palestine.report.palestine.driverAddressLabel", "address", formData.driverInfo.address, "text", false, "driverInfo", "address")} </div> <div> <h4 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-1">{t("palestine.report.palestine.licenseInfoTitle")}</h4> <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/30"> {renderCommonInput("palestine.report.palestine.licenseNumberLabel", "number", formData.driverInfo.license.number, "text", false, "driverInfo", "license", null, null, null, "number")} {renderCommonInput("palestine.report.palestine.licenseTypeLabel", "type", formData.driverInfo.license.type, "text", false, "driverInfo", "license", null, null, null, "type")} {renderCommonInput("palestine.report.palestine.licenseIssueDateLabel", "issueDate", formData.driverInfo.license.issueDate, "date", false, "driverInfo", "license", null, null, null, "issueDate")} {renderCommonInput("palestine.report.palestine.licenseExpiryDateLabel", "expiryDate", formData.driverInfo.license.expiryDate, "date", false, "driverInfo", "license", null, null, null, "expiryDate")} </div> </div> </div>);
    const renderAccidentDetailsInfo = () => ( <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("palestine.report.palestine.accidentDateLabel", "accidentDate", formData.accidentDetails.accidentDate, "date", false, "accidentDetails", "accidentDate")} {renderCommonInput("palestine.report.palestine.accidentTimeLabel", "time", formData.accidentDetails.time, "time", false, "accidentDetails", "time")} {renderCommonInput("palestine.report.palestine.accidentLocationLabel", "location", formData.accidentDetails.location, "text", false, "accidentDetails", "location")} {renderCommonInput("palestine.report.palestine.numPassengersLabel", "numberOfPassengers", formData.accidentDetails.numberOfPassengers, "number", false, "accidentDetails", "numberOfPassengers")} {renderCommonInput("palestine.report.palestine.vehicleSpeedLabel", "vehicleSpeed", formData.accidentDetails.vehicleSpeed, "number", false, "accidentDetails", "vehicleSpeed")} {renderCommonInput("palestine.report.palestine.vehiclePurposeLabel", "vehiclePurposeAtTime", formData.accidentDetails.vehiclePurposeAtTime, "text", false, "accidentDetails", "vehiclePurposeAtTime")} <div className="md:col-span-2"> {renderCommonInput("palestine.report.palestine.accidentDescLabel", "accidentDescription", formData.accidentDetails.accidentDescription, "textarea", false, "accidentDetails", "accidentDescription")} </div> {renderCommonInput("palestine.report.palestine.responsiblePartyLabel", "responsibleParty", formData.accidentDetails.responsibleParty, "text", false, "accidentDetails", "responsibleParty")} {renderCommonInput("palestine.report.palestine.policeInformedLabel", "policeInformed", formData.accidentDetails.policeInformed, "checkbox", false, "accidentDetails", "policeInformed")} {formData.accidentDetails.policeInformed && renderCommonInput("palestine.report.palestine.policeStationLabel", "policeStation", formData.accidentDetails.policeStation, "text", false, "accidentDetails", "policeStation")} </div>);
    const renderThirdPartyInfo = () => ( <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"> {renderCommonInput("palestine.report.palestine.tpVehicleNumberLabel", "vehicleNumber", formData.thirdParty.vehicleNumber, "text", false, "thirdParty", "vehicleNumber")} {renderCommonInput("palestine.report.palestine.tpVehicleTypeLabel", "vehicleType", formData.thirdParty.vehicleType, "text", false, "thirdParty", "vehicleType")} {renderCommonInput("palestine.report.palestine.tpMakeLabel", "make", formData.thirdParty.make, "text", false, "thirdParty", "make")} {renderCommonInput("palestine.report.palestine.tpModelLabel", "model", formData.thirdParty.model, "text", false, "thirdParty", "model")} {renderCommonInput("palestine.report.palestine.tpColorLabel", "color", formData.thirdParty.color, "text", false, "thirdParty", "color")} {renderCommonInput("palestine.report.palestine.tpOwnerNameLabel", "ownerName", formData.thirdParty.ownerName, "text", false, "thirdParty", "ownerName")} {renderCommonInput("palestine.report.palestine.tpOwnerPhoneLabel", "ownerPhone", formData.thirdParty.ownerPhone, "tel", false, "thirdParty", "ownerPhone")} {renderCommonInput("palestine.report.palestine.tpOwnerAddressLabel", "ownerAddress", formData.thirdParty.ownerAddress, "text", false, "thirdParty", "ownerAddress")} {renderCommonInput("palestine.report.palestine.tpDriverNameLabel", "driverName", formData.thirdParty.driverName, "text", false, "thirdParty", "driverName")} {renderCommonInput("palestine.report.palestine.tpDriverPhoneLabel", "driverPhone", formData.thirdParty.driverPhone, "tel", false, "thirdParty", "driverPhone")} {renderCommonInput("palestine.report.palestine.tpDriverAddressLabel", "driverAddress", formData.thirdParty.driverAddress, "text", false, "thirdParty", "driverAddress")} {renderCommonInput("palestine.report.palestine.tpInsuranceCoLabel", "insuranceCompany", formData.thirdParty.insuranceCompany, "text", false, "thirdParty", "insuranceCompany")} {renderCommonInput("palestine.report.palestine.tpPolicyNoLabel", "insurancePolicyNumber", formData.thirdParty.insurancePolicyNumber, "text", false, "thirdParty", "insurancePolicyNumber")} <div className="md:col-span-2 lg:col-span-3"> {renderCommonInput("palestine.report.palestine.tpVehicleDamagesLabel", "vehicleDamages", formData.thirdParty.vehicleDamages, "textarea", false, "thirdParty", "vehicleDamages")} </div> </div>);
    const renderInjuriesAndWitnesses = () => ( <div className="space-y-6"> <div> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("palestine.report.palestine.injuriesTitle")}</h3> {(formData.injuries || []).map((injury, index) => ( <div key={`inj-${index}`} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-3 border dark:border-gray-600"> <div className="flex justify-between items-center mb-2"> <h4 className="text-md font-medium text-gray-600 dark:text-gray-300">{t('palestine.report.palestine.injuryItemTitle', { index: index + 1 })}</h4> <button type="button" onClick={() => removeArrayItem('injuries', index)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2"> {renderCommonInput("palestine.report.palestine.injuryNameLabel", "name", injury.name, "text", false, null, "name", "injuries", index, "name")} {renderCommonInput("palestine.report.palestine.injuryAgeLabel", "age", injury.age, "number", false, null, "age", "injuries", index, "age")} {renderCommonInput("palestine.report.palestine.injuryOccupationLabel", "occupation", injury.occupation, "text", false, null, "occupation", "injuries", index, "occupation")} {renderCommonInput("palestine.report.palestine.injuryAddressLabel", "address", injury.address, "text", false, null, "address", "injuries", index, "address")} <div className="md:col-span-2"> {renderCommonInput("palestine.report.palestine.injuryTypeLabel", "injuryType", injury.injuryType, "textarea", false, null, "injuryType", "injuries", index, "injuryType")} </div> </div> </div> ))} <button type="button" onClick={() => addArrayItem('injuries', { name: '', age: '', occupation: '', address: '', injuryType: '' })} className="mt-1 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t('palestine.report.palestine.addInjuryButton')} </button> </div> <div> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("palestine.report.palestine.witnessesTitle")}</h3> {(formData.witnesses || []).map((witness, index) => ( <div key={`wit-${index}`} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-3 border dark:border-gray-600"> <div className="flex justify-between items-center mb-2"> <h4 className="text-md font-medium text-gray-600 dark:text-gray-300">{t('palestine.report.palestine.witnessItemTitle', { index: index + 1 })}</h4> <button type="button" onClick={() => removeArrayItem('witnesses', index)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2"> {renderCommonInput("palestine.report.palestine.witnessNameLabel", "name", witness.name, "text", false, null, "name", "witnesses", index, "name")} {renderCommonInput("palestine.report.palestine.witnessAddressLabel", "address", witness.address, "text", false, null, "address", "witnesses", index, "address")} </div> {renderCommonInput("palestine.report.palestine.witnessStatementGivenLabel", "statementGiven", witness.statementGiven, "checkbox", false, null, "statementGiven", "witnesses", index, "statementGiven")} </div> ))} <button type="button" onClick={() => addArrayItem('witnesses', { name: '', address: '', statementGiven: false })} className="mt-1 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t('palestine.report.palestine.addWitnessButton')} </button> </div> </div>);
    const renderPassengersAndAdditional = () => ( <div className="space-y-6"> <div> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("palestine.report.palestine.passengersTitle")}</h3> {(formData.passengers || []).map((passenger, index) => ( <div key={`pass-${index}`} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-3 border dark:border-gray-600"> <div className="flex justify-between items-center mb-2"> <h4 className="text-md font-medium text-gray-600 dark:text-gray-300">{t('palestine.report.palestine.passengerItemTitle', { index: index + 1 })}</h4> <button type="button" onClick={() => removeArrayItem('passengers', index)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div> {renderCommonInput("palestine.report.palestine.passengerNameLabel", "name", passenger.name, "text", false, null, "name", "passengers", index, "name")} </div> ))} <button type="button" onClick={() => addArrayItem('passengers', { name: '' })} className="mt-1 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t('palestine.report.palestine.addPassengerButton')} </button> </div> <div className="pt-4 border-t dark:border-gray-600"> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("palestine.report.palestine.additionalDetailsTitle")}</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("palestine.report.palestine.notesLabel", "notes", formData.additionalDetails.notes, "textarea", false, "additionalDetails", "notes")} {renderCommonInput("palestine.report.palestine.signatureLabel", "signature", formData.additionalDetails.signature, "text", false, "additionalDetails", "signature")} {renderCommonInput("palestine.report.palestine.signatureDateLabel", "date", formData.additionalDetails.date, "date", false, "additionalDetails", "date")} {renderCommonInput("palestine.report.palestine.agentRemarksLabel", "agentRemarks", formData.additionalDetails.agentRemarks, "textarea", false, "additionalDetails", "agentRemarks")} </div> </div> </div> );

    const modalTitleText =t('palestine.report.palestine.modalTitle');
    const submitButtonText =t('submitButton');

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
                    <button onClick={() => {if (!isSubmitting) onClose()}} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400" disabled={isSubmitting}>
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
                            {currentStep === 1 && renderAgentPolicyInfo()}
                            {currentStep === 2 && renderVehicleInfo()}
                            {currentStep === 3 && renderDriverInfo()}
                            {currentStep === 4 && renderAccidentDetailsInfo()}
                            {currentStep === 5 && renderThirdPartyInfo()}
                            {currentStep === 6 && renderInjuriesAndWitnesses()}
                            {currentStep === 7 && renderPassengersAndAdditional()}
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-between items-center border-t dark:border-gray-700 sticky bottom-0 bg-[rgb(255,255,255)] dark:bg-navbarBack z-10">
                        <button
                            id="palestine-report-back-button"
                            type="button"
                            onClick={handleBack}
                            className={`px-4 py-2 text-sm rounded-md shadow-sm ${currentStep === 1 || isSubmitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-600 dark:text-gray-500' : 'text-gray-700 bg-[rgb(255,255,255)] border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600'}`}
                            disabled={currentStep === 1 || isSubmitting}
                        > {t('backButton')} </button>
                        {currentStep < 7 && (
                            <button
                                id="palestine-report-next-button"
                                type="button"
                                onClick={handleNext}
                                className={`px-4 py-2 text-sm text-[rgb(255,255,255)] bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                            > {t('nextButton')} </button>
                        )}
                        {currentStep === 7 && (
                            <button
                                id="palestine-report-submit-button"
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

export default InsurancePalestineRep;