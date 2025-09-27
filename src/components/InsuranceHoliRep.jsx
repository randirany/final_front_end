import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

function InsuranceHoliRep({ onClose, isOpen }) {
    const { vehicleId } = useParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t, i18n: { language } } = useTranslation();

    const memoizedInitialFormData = useMemo(() => ({
        insuranceDetails: { policyNumber: '', insuranceDuration: '', fromDate: '', toDate: '', insuranceType: '' },
        vehicleDetails: { vehicleBranch: '', chassisNumber: '' },
        ownerAndDriverDetails: { driverName: '', driverID: '', driverLicenseNumber: '', driverLicenseGrade: '', licenseIssueDate: '', driverPhone: '', driverAddress: '', driverProfession: '', licenseIssuePlace: '' },
        accidentDetails: { accidentDate: '', accidentTime: '', speedAtTime: '', numberOfPassengers: '', lightsUsed: '', directionFrom: '', accidentDirection: '', accidentLocation: '', accidentDetailsText: '', accidentCause: '', notesByBranchManager: '', policeNotified: false, whoInformedPolice: '' },
        otherVehicles: [],
        involvementDetails: { damageToUserCar: '', damageToThirdParty: '' },
        injuries: [],
        injuredNamesAndAddresses: '',
        passengerNamesAndAddresses: '',
        additionalDetails: '',
        signature: '',
        signatureDate: '',
        employeeNotes: '',
        employeeSignature: '',
        employeeDate: '',
    }), []);

    const [formData, setFormData] = useState(() => JSON.parse(JSON.stringify(memoizedInitialFormData)));

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && !isSubmitting) {
                onClose(false); 
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

    const handleChange = (e, path, isCheckbox = false, arrayDetails = null) => {
        const { value, checked, name: inputName } = e.target;
        const valToSet = isCheckbox ? checked : value;
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            let currentLevel = newState;
            if (arrayDetails) {
                const { arrayName, index, itemKey } = arrayDetails;
                if (!currentLevel[arrayName] || !Array.isArray(currentLevel[arrayName])) currentLevel[arrayName] = [];
                while (index >= currentLevel[arrayName].length) currentLevel[arrayName].push({});
                if (typeof currentLevel[arrayName][index] !== 'object' || currentLevel[arrayName][index] === null) currentLevel[arrayName][index] = {};
                currentLevel[arrayName][index][itemKey] = valToSet;
            } else if (path && path.length > 0) {
                for (let i = 0; i < path.length - 1; i++) {
                    const segment = path[i];
                    if (!currentLevel[segment] || typeof currentLevel[segment] !== 'object') currentLevel[segment] = {};
                    currentLevel = currentLevel[segment];
                }
                currentLevel[path[path.length - 1]] = valToSet;
            } else {
            }
            return newState;
        });
    };

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 6));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!vehicleId) {
            alert(t('holyLand.report.holi.urlPlateNumberRequiredError'));
            setIsSubmitting(false);
            return;
        }

        const dataToSubmit = JSON.parse(JSON.stringify(formData));
        const requiredFieldsConfig = {
            "ownerAndDriverDetails.driverName": { labelKey: "holyLand.report.holi.driverNameLabel", step: 2 },
            "accidentDetails.accidentDate": { labelKey: "holyLand.report.holi.accidentDateLabel", step: 3 },
            "signature": { labelKey: "holyLand.report.holi.signatureLabel", step: 6 },
            "signatureDate": { labelKey: "holyLand.report.holi.signatureDateLabel", step: 6 },
        };

        if (currentStep === 6) {
            for (const fieldPath in requiredFieldsConfig) {
                const fieldData = requiredFieldsConfig[fieldPath];
                const pathParts = fieldPath.split('.');
                let valueToCheck = dataToSubmit;
                for (const part of pathParts) {
                    if (valueToCheck && typeof valueToCheck === 'object' && part in valueToCheck) {
                        valueToCheck = valueToCheck[part];
                    } else { valueToCheck = undefined; break; }
                }
                let isEmpty = (fieldData.labelKey.toLowerCase().includes('date')) ?
                    (valueToCheck === null || String(valueToCheck).trim() === '') :
                    (valueToCheck === null || valueToCheck === undefined || String(valueToCheck).trim() === '');
                if (isEmpty) {
                    alert(t("trust.fieldRequiredError", { fieldName: t(fieldData.labelKey) }) + ` (In Step: ${t(`holyLand.report.holi.step${fieldData.step}Indicator`)})`);
                    setCurrentStep(fieldData.step);
                    setIsSubmitting(false);
                    return;
                }
            }
        }

        const toNumberOrNull = (val) => { const num = Number(val); return isNaN(num) || val === '' || val === null || val === undefined ? null : num; };
        const toBoolean = (val) => typeof val === 'string' ? (val.toLowerCase() === 'true') : Boolean(val);
        const formatDateForBackend = (dateStr) => { if (!dateStr || String(dateStr).trim() === '') return null; try { return new Date(dateStr).toISOString(); } catch (err) { return null; } };

        const apiPayload = {
            insuranceDetails: { policyNumber: dataToSubmit.insuranceDetails.policyNumber || null, insuranceDuration: dataToSubmit.insuranceDetails.insuranceDuration || null, fromDate: formatDateForBackend(dataToSubmit.insuranceDetails.fromDate), toDate: formatDateForBackend(dataToSubmit.insuranceDetails.toDate), insuranceType: dataToSubmit.insuranceDetails.insuranceType || null, },
            vehicleDetails: { vehicleBranch: dataToSubmit.vehicleDetails.vehicleBranch || null, chassisNumber: dataToSubmit.vehicleDetails.chassisNumber || null, },
            ownerAndDriverDetails: { driverName: dataToSubmit.ownerAndDriverDetails.driverName || null, driverID: dataToSubmit.ownerAndDriverDetails.driverID || null, driverLicenseNumber: dataToSubmit.ownerAndDriverDetails.driverLicenseNumber || null, driverLicenseGrade: dataToSubmit.ownerAndDriverDetails.driverLicenseGrade || null, licenseIssueDate: formatDateForBackend(dataToSubmit.ownerAndDriverDetails.licenseIssueDate), driverPhone: dataToSubmit.ownerAndDriverDetails.driverPhone || null, driverAddress: dataToSubmit.ownerAndDriverDetails.driverAddress || null, driverProfession: dataToSubmit.ownerAndDriverDetails.driverProfession || null, licenseIssuePlace: dataToSubmit.ownerAndDriverDetails.licenseIssuePlace || null, },
            accidentDetails: { accidentDate: formatDateForBackend(dataToSubmit.accidentDetails.accidentDate), accidentTime: dataToSubmit.accidentDetails.accidentTime || null, speedAtTime: dataToSubmit.accidentDetails.speedAtTime || null, numberOfPassengers: toNumberOrNull(dataToSubmit.accidentDetails.numberOfPassengers), lightsUsed: dataToSubmit.accidentDetails.lightsUsed || null, directionFrom: dataToSubmit.accidentDetails.directionFrom || null, accidentDirection: dataToSubmit.accidentDetails.accidentDirection || null, accidentLocation: dataToSubmit.accidentDetails.accidentLocation || null, accidentDetailsText: dataToSubmit.accidentDetails.accidentDetailsText || null, accidentCause: dataToSubmit.accidentDetails.accidentCause || null, notesByBranchManager: dataToSubmit.accidentDetails.notesByBranchManager || null, policeNotified: toBoolean(dataToSubmit.accidentDetails.policeNotified), whoInformedPolice: dataToSubmit.accidentDetails.policeNotified ? (dataToSubmit.accidentDetails.whoInformedPolice || null) : null, },
            otherVehicles: (dataToSubmit.otherVehicles || []).map(ov => ({ vehicleNumber: ov.vehicleNumber || null, vehicleType: ov.vehicleType || null, make: ov.make || null, model: ov.model || null, plateNumber: ov.plateNumber || null, insuranceCompany: ov.insuranceCompany || null, driverName: ov.driverName || null, driverAddress: ov.driverAddress || null, details: ov.details || null, })).filter(ov => ov.plateNumber || ov.driverName || ov.vehicleNumber),
            involvementDetails: { damageToUserCar: dataToSubmit.involvementDetails.damageToUserCar || null, damageToThirdParty: dataToSubmit.involvementDetails.damageToThirdParty || null, },
            injuries: (dataToSubmit.injuries || []).map(inj => ({ name: inj.name || null, age: toNumberOrNull(inj.age), address: inj.address || null, occupation: inj.occupation || null, maritalStatus: inj.maritalStatus || null, injuryType: inj.injuryType || null, })).filter(inj => inj.name),
            injuredNamesAndAddresses: dataToSubmit.injuredNamesAndAddresses || null,
            passengerNamesAndAddresses: dataToSubmit.passengerNamesAndAddresses || null,
            additionalDetails: dataToSubmit.additionalDetails || null,
            signature: dataToSubmit.signature || null,
            signatureDate: formatDateForBackend(dataToSubmit.signatureDate),
            employeeNotes: dataToSubmit.employeeNotes || null,
            employeeSignature: dataToSubmit.employeeSignature || null,
            employeeDate: formatDateForBackend(dataToSubmit.employeeDate),
        };

        const endpoint = `http://localhost:3002/api/v1/HolyLand/add/${vehicleId}`;
        const method = 'POST';

        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const response = await fetch(endpoint, { method: method, headers: { 'Content-Type': 'application/json', token }, body: JSON.stringify(apiPayload) });
            const responseData = await response.json();
            if (!response.ok) {
                let detailedMessage = responseData.message || `HTTP error! status: ${response.status}`;
                if (responseData.errors) { detailedMessage += "\nDetails:\n"; for (const field in responseData.errors) { detailedMessage += `- ${field.replace(/\./g, ' -> ')}: ${responseData.errors[field].message || responseData.errors[field]}\n`; } }
                else if (responseData.errorDetails) { detailedMessage += `\nDetails: ${responseData.errorDetails}`; }
                throw new Error(detailedMessage);
            }
            alert(t('holyLand.report.holi.formSubmissionSuccess') + (responseData.message ? `\n${responseData.message}` : ''));

            onClose(true);

        } catch (error) {
            alert(t('holyLand.report.holi.formSubmissionError') + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addArrayItem = (arrayName, itemStructure = {}) => { setFormData(prev => { const newState = JSON.parse(JSON.stringify(prev)); if (!newState[arrayName]) newState[arrayName] = []; newState[arrayName].push(JSON.parse(JSON.stringify(itemStructure))); return newState; }); };
    const removeArrayItem = (arrayName, index) => { setFormData(prev => { const newState = JSON.parse(JSON.stringify(prev)); if (newState[arrayName] && newState[arrayName].length > index) { newState[arrayName].splice(index, 1); } return newState; }); };
    const getStepTitle = () => { switch (currentStep) { case 1: return t('holyLand.report.holi.insuranceVehicleTitle'); case 2: return t('holyLand.report.holi.ownerDriverTitle'); case 3: return t('holyLand.report.holi.accidentDetailsTitle'); case 4: return t('holyLand.report.holi.otherVehiclesTitle'); case 5: return t('holyLand.report.holi.involvementInjuriesTitle'); case 6: return t('holyLand.report.holi.signaturesNotesTitle'); default: return ''; } };
    const renderStepIndicator = () => (<div className="px-4 py-3 mb-4"><div className="flex justify-between items-center">{[1, 2, 3, 4, 5, 6].map((step) => (<div key={step} className="flex flex-col items-center text-center flex-1 px-1"><div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium ${currentStep >= step ? 'bg-indigo-600 text-[rgb(255,255,255)]' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{step}</div><span className="text-[10px] leading-tight mt-1 text-gray-600 dark:text-gray-400">{step === 1 && t('holyLand.report.holi.step1Indicator')}{step === 2 && t('holyLand.report.holi.step2Indicator')}{step === 3 && t('holyLand.report.holi.step3Indicator')}{step === 4 && t('holyLand.report.holi.step4Indicator')}{step === 5 && t('holyLand.report.holi.step5Indicator')}{step === 6 && t('holyLand.report.holi.step6Indicator')}</span></div>))}</div></div>);
    const renderCommonInput = (labelKey, nameAttribute, value, type = "text", required = false, path = [], arrayName = null, index = null, itemKeyInArray = null, options = null) => { const inputId = `${path.join('_')}_${arrayName || ''}_${index ?? ''}_${itemKeyInArray || nameAttribute}`.replace(/\W/g, '_'); const isCheckbox = type === "checkbox"; let arrayDetailsObj = null; let currentPath = [...path]; if (arrayName && typeof index === 'number' && itemKeyInArray) { arrayDetailsObj = { arrayName, index, itemKey: itemKeyInArray }; currentPath = []; } else if (currentPath.length === 0) { if (nameAttribute && !arrayName) { currentPath = [nameAttribute]; } } const commonProps = { id: inputId, name: nameAttribute, className: "mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm", required: required, }; if (isCheckbox) { return (<div className="flex items-center mb-2 col-span-1 md:col-span-2"> <input {...commonProps} type="checkbox" checked={Boolean(value)} onChange={(e) => handleChange(e, currentPath, true, arrayDetailsObj)} /> <label htmlFor={inputId} className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"> {t(labelKey)} {required && <span className="text-red-500">*</span>} </label> </div>); } return (<div className="mb-2"> <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t(labelKey)} {required && <span className="text-red-500">*</span>}</label> {type === "select" ? (<select {...commonProps} value={value || ''} onChange={(e) => handleChange(e, currentPath, false, arrayDetailsObj)}> <option value="">{options && options.find(o => o.value === '') ? t(options.find(o => o.value === '').label) : t("selectDefault", "-- Select --")}</option> {options && options.filter(o => o.value !== '').map(opt => <option key={opt.value} value={opt.value}>{t(opt.label)}</option>)} </select>) : type === "textarea" ? (<textarea {...commonProps} value={value || ''} rows="2" onChange={(e) => handleChange(e, currentPath, false, arrayDetailsObj)}></textarea>) : (<input {...commonProps} type={type} value={value || ''} onChange={(e) => handleChange(e, currentPath, false, arrayDetailsObj)} step={type === "number" ? "any" : undefined} min={type === "number" ? 0 : undefined} />)} </div>); };
    const renderInsuranceAndVehicle = () => (<div className="space-y-6"> <div> <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("holyLand.report.holi.insuranceDetailsTitle")}</h3> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"> {renderCommonInput("holyLand.report.holi.policyNumberLabel", "policyNumber", formData.insuranceDetails.policyNumber, "text", false, ["insuranceDetails", "policyNumber"])} {renderCommonInput("holyLand.report.holi.insuranceDurationLabel", "insuranceDuration", formData.insuranceDetails.insuranceDuration, "text", false, ["insuranceDetails", "insuranceDuration"])} {renderCommonInput("holyLand.report.holi.fromDateLabel", "fromDate", formData.insuranceDetails.fromDate, "date", false, ["insuranceDetails", "fromDate"])} {renderCommonInput("holyLand.report.holi.toDateLabel", "toDate", formData.insuranceDetails.toDate, "date", false, ["insuranceDetails", "toDate"])} {renderCommonInput("holyLand.report.holi.insuranceTypeLabel", "insuranceType", formData.insuranceDetails.insuranceType, "text", false, ["insuranceDetails", "insuranceType"])} </div> </div> <div> <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("holyLand.report.holi.vehicleDetailsTitle")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"> {renderCommonInput("holyLand.report.holi.vehicleBranchLabel", "vehicleBranch", formData.vehicleDetails.vehicleBranch, "text", false, ["vehicleDetails", "vehicleBranch"])} {renderCommonInput("holyLand.report.holi.chassisNumberLabel", "chassisNumber", formData.vehicleDetails.chassisNumber, "text", false, ["vehicleDetails", "chassisNumber"])} </div> </div> </div>);
    const renderOwnerAndDriver = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderCommonInput("holyLand.report.holi.driverNameLabel", "driverName", formData.ownerAndDriverDetails.driverName, "text", true, ["ownerAndDriverDetails", "driverName"])} {renderCommonInput("holyLand.report.holi.driverIDLabel", "driverID", formData.ownerAndDriverDetails.driverID, "text", false, ["ownerAndDriverDetails", "driverID"])} {renderCommonInput("holyLand.report.holi.driverLicenseNumberLabel", "driverLicenseNumber", formData.ownerAndDriverDetails.driverLicenseNumber, "text", false, ["ownerAndDriverDetails", "driverLicenseNumber"])} {renderCommonInput("holyLand.report.holi.driverLicenseGradeLabel", "driverLicenseGrade", formData.ownerAndDriverDetails.driverLicenseGrade, "text", false, ["ownerAndDriverDetails", "driverLicenseGrade"])} {renderCommonInput("holyLand.report.holi.licenseIssueDateLabel", "licenseIssueDate", formData.ownerAndDriverDetails.licenseIssueDate, "date", false, ["ownerAndDriverDetails", "licenseIssueDate"])} {renderCommonInput("holyLand.report.holi.driverPhoneLabel", "driverPhone", formData.ownerAndDriverDetails.driverPhone, "tel", false, ["ownerAndDriverDetails", "driverPhone"])} {renderCommonInput("holyLand.report.holi.driverAddressLabel", "driverAddress", formData.ownerAndDriverDetails.driverAddress, "text", false, ["ownerAndDriverDetails", "driverAddress"])} {renderCommonInput("holyLand.report.holi.driverProfessionLabel", "driverProfession", formData.ownerAndDriverDetails.driverProfession, "text", false, ["ownerAndDriverDetails", "driverProfession"])} {renderCommonInput("holyLand.report.holi.licenseIssuePlaceLabel", "licenseIssuePlace", formData.ownerAndDriverDetails.licenseIssuePlace, "text", false, ["ownerAndDriverDetails", "licenseIssuePlace"])} </div>);
    const renderAccidentDetailsInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("holyLand.report.holi.accidentDateLabel", "accidentDate", formData.accidentDetails.accidentDate, "date", true, ["accidentDetails", "accidentDate"])} {renderCommonInput("holyLand.report.holi.accidentTimeLabel", "accidentTime", formData.accidentDetails.accidentTime, "time", false, ["accidentDetails", "accidentTime"])} {renderCommonInput("holyLand.report.holi.speedAtTimeLabel", "speedAtTime", formData.accidentDetails.speedAtTime, "text", false, ["accidentDetails", "speedAtTime"])} {renderCommonInput("holyLand.report.holi.numberOfPassengersLabel", "numberOfPassengers", formData.accidentDetails.numberOfPassengers, "number", false, ["accidentDetails", "numberOfPassengers"])} {renderCommonInput("holyLand.report.holi.lightsUsedLabel", "lightsUsed", formData.accidentDetails.lightsUsed, "text", false, ["accidentDetails", "lightsUsed"])} {renderCommonInput("holyLand.report.holi.directionFromLabel", "directionFrom", formData.accidentDetails.directionFrom, "text", false, ["accidentDetails", "directionFrom"])} {renderCommonInput("holyLand.report.holi.accidentDirectionLabel", "accidentDirection", formData.accidentDetails.accidentDirection, "text", false, ["accidentDetails", "accidentDirection"])} {renderCommonInput("holyLand.report.holi.accidentLocationLabel", "accidentLocation", formData.accidentDetails.accidentLocation, "text", false, ["accidentDetails", "accidentLocation"])} <div className="md:col-span-2"> {renderCommonInput("holyLand.report.holi.accidentDetailsTextLabel", "accidentDetailsText", formData.accidentDetails.accidentDetailsText, "textarea", false, ["accidentDetails", "accidentDetailsText"])} </div> {renderCommonInput("holyLand.report.holi.accidentCauseLabel", "accidentCause", formData.accidentDetails.accidentCause, "text", false, ["accidentDetails", "accidentCause"])} <div className="md:col-span-2"> {renderCommonInput("holyLand.report.holi.notesByBranchManagerLabel", "notesByBranchManager", formData.accidentDetails.notesByBranchManager, "textarea", false, ["accidentDetails", "notesByBranchManager"])} </div> {renderCommonInput("holyLand.report.holi.policeNotifiedLabel", "policeNotified", formData.accidentDetails.policeNotified, "checkbox", false, ["accidentDetails", "policeNotified"])} {formData.accidentDetails.policeNotified && renderCommonInput("holyLand.report.holi.whoInformedPoliceLabel", "whoInformedPolice", formData.accidentDetails.whoInformedPolice, "text", false, ["accidentDetails", "whoInformedPolice"])} </div>);
    const renderOtherVehiclesInfo = () => (<div> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("holyLand.report.holi.otherVehiclesTitle")}</h3> {(formData.otherVehicles || []).map((vehicle, index) => (<div key={`ov-${index}`} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-4 border dark:border-gray-600"> <div className="flex justify-between items-center mb-2"> <h4 className="text-md font-medium text-gray-600 dark:text-gray-300">{t('holyLand.report.holi.otherVehicleItemTitle', { index: index + 1 })}</h4> <button type="button" onClick={() => removeArrayItem('otherVehicles', index)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2"> {renderCommonInput("holyLand.report.holi.ovVehicleNumberLabel", "vehicleNumber", vehicle.vehicleNumber, "text", false, [], "otherVehicles", index, "vehicleNumber")} {renderCommonInput("holyLand.report.holi.ovVehicleTypeLabel", "vehicleType", vehicle.vehicleType, "text", false, [], "otherVehicles", index, "vehicleType")} {renderCommonInput("holyLand.report.holi.ovMakeLabel", "make", vehicle.make, "text", false, [], "otherVehicles", index, "make")} {renderCommonInput("holyLand.report.holi.ovModelLabel", "model", vehicle.model, "text", false, [], "otherVehicles", index, "model")} {renderCommonInput("holyLand.report.holi.ovPlateNumberLabel", "plateNumber", vehicle.plateNumber, "text", false, [], "otherVehicles", index, "plateNumber")} {renderCommonInput("holyLand.report.holi.ovInsuranceCompanyLabel", "insuranceCompany", vehicle.insuranceCompany, "text", false, [], "otherVehicles", index, "insuranceCompany")} {renderCommonInput("holyLand.report.holi.ovDriverNameLabel", "driverName", vehicle.driverName, "text", false, [], "otherVehicles", index, "driverName")} {renderCommonInput("holyLand.report.holi.ovDriverAddressLabel", "driverAddress", vehicle.driverAddress, "text", false, [], "otherVehicles", index, "driverAddress")} <div className="md:col-span-2 lg:col-span-3"> {renderCommonInput("holyLand.report.holi.ovDetailsLabel", "details", vehicle.details, "textarea", false, [], "otherVehicles", index, "details")} </div> </div> </div>))} <button type="button" onClick={() => addArrayItem('otherVehicles', { vehicleNumber: '', vehicleType: '', make: '', model: '', plateNumber: '', insuranceCompany: '', driverName: '', driverAddress: '', details: '' })} className="mt-2 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t('holyLand.report.holi.addOtherVehicleButton')} </button> </div>);
    const renderInvolvementAndInjuries = () => (<div className="space-y-6"> <div> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("holyLand.report.holi.involvementDetailsTitle")}</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("holyLand.report.holi.damageToUserCarLabel", "damageToUserCar", formData.involvementDetails.damageToUserCar, "textarea", false, ["involvementDetails", "damageToUserCar"])} {renderCommonInput("holyLand.report.holi.damageToThirdPartyLabel", "damageToThirdParty", formData.involvementDetails.damageToThirdParty, "textarea", false, ["involvementDetails", "damageToThirdParty"])} </div> </div> <div> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("holyLand.report.holi.injuriesTitle")}</h3> {(formData.injuries || []).map((injury, index) => (<div key={`inj-${index}`} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-3 border dark:border-gray-600"> <div className="flex justify-between items-center mb-2"> <h4 className="text-md font-medium text-gray-600 dark:text-gray-300">{t('holyLand.report.holi.injuryItemTitle', { index: index + 1 })}</h4> <button type="button" onClick={() => removeArrayItem('injuries', index)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2"> {renderCommonInput("holyLand.report.holi.injuryNameLabel", "name", injury.name, "text", false, [], "injuries", index, "name")} {renderCommonInput("holyLand.report.holi.injuryAgeLabel", "age", injury.age, "number", false, [], "injuries", index, "age")} {renderCommonInput("holyLand.report.holi.injuryAddressLabel", "address", injury.address, "text", false, [], "injuries", index, "address")} {renderCommonInput("holyLand.report.holi.injuryOccupationLabel", "occupation", injury.occupation, "text", false, [], "injuries", index, "occupation")} {renderCommonInput("holyLand.report.holi.injuryMaritalStatusLabel", "maritalStatus", injury.maritalStatus, "text", false, [], "injuries", index, "maritalStatus")} <div className="md:col-span-2"> {renderCommonInput("holyLand.report.holi.injuryTypeLabel", "injuryType", injury.injuryType, "textarea", false, [], "injuries", index, "injuryType")} </div> </div> </div>))} <button type="button" onClick={() => addArrayItem('injuries', { name: '', age: '', address: '', occupation: '', maritalStatus: '', injuryType: '' })} className="mt-1 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t('holyLand.report.holi.addInjuryButton')} </button> </div> </div>);
    const renderSignaturesAndNotes = () => (<div className="space-y-4"> {renderCommonInput("holyLand.report.holi.injuredNamesAndAddressesLabel", "injuredNamesAndAddresses", formData.injuredNamesAndAddresses, "textarea", false, ["injuredNamesAndAddresses"])} {renderCommonInput("holyLand.report.holi.passengerNamesAndAddressesLabel", "passengerNamesAndAddresses", formData.passengerNamesAndAddresses, "textarea", false, ["passengerNamesAndAddresses"])} {renderCommonInput("holyLand.report.holi.additionalDetailsLabel", "additionalDetails", formData.additionalDetails, "textarea", false, ["additionalDetails"])} <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("holyLand.report.holi.signatureLabel", "signature", formData.signature, "text", true, ["signature"])} {renderCommonInput("holyLand.report.holi.signatureDateLabel", "signatureDate", formData.signatureDate, "date", true, ["signatureDate"])} </div> {renderCommonInput("holyLand.report.holi.employeeNotesLabel", "employeeNotes", formData.employeeNotes, "textarea", false, ["employeeNotes"])} <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("holyLand.report.holi.employeeSignatureLabel", "employeeSignature", formData.employeeSignature, "text", false, ["employeeSignature"])} {renderCommonInput("holyLand.report.holi.employeeDateLabel", "employeeDate", formData.employeeDate, "date", false, ["employeeDate"])} </div> </div>);

    const modalTitleText = t('holyLand.report.holi.modalTitle');
    const submitButtonText = t('submitButton');

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm overflow-y-auto hide-scrollbar"
            onClick={() => { if (!isSubmitting) onClose(false); }}
        >
            <div
                className="w-full max-w-5xl bg-[rgb(255,255,255)] rounded-lg shadow-xl flex flex-col dark:bg-navbarBack max-h-[95vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 sticky top-0 bg-[rgb(255,255,255)] dark:bg-navbarBack z-10">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-[rgb(255,255,255)]">{modalTitleText}</h2>
                    <button onClick={() => { if (!isSubmitting) onClose(false); }} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400" disabled={isSubmitting}>
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
                            {currentStep === 1 && renderInsuranceAndVehicle()}
                            {currentStep === 2 && renderOwnerAndDriver()}
                            {currentStep === 3 && renderAccidentDetailsInfo()}
                            {currentStep === 4 && renderOtherVehiclesInfo()}
                            {currentStep === 5 && renderInvolvementAndInjuries()}
                            {currentStep === 6 && renderSignaturesAndNotes()}
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-between items-center border-t dark:border-gray-700 sticky bottom-0 bg-[rgb(255,255,255)] dark:bg-navbarBack z-10">
                        <button type="button" onClick={handleBack} className={`px-4 py-2 text-sm rounded-md shadow-sm ${currentStep === 1 || isSubmitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-600 dark:text-gray-500' : 'text-gray-700 bg-[rgb(255,255,255)] border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600'}`} disabled={currentStep === 1 || isSubmitting}> {t('backButton')} </button>
                        {currentStep === 6 ? (
                            <button type="submit" className={`px-6 py-2 text-sm text-[rgb(255,255,255)] bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isSubmitting}> {isSubmitting ? t('submitting') : submitButtonText} </button>
                        ) : (
                            <button type="button" onClick={handleNext} className={`px-4 py-2 text-sm text-[rgb(255,255,255)] bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isSubmitting}> {t('nextButton')} </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InsuranceHoliRep;