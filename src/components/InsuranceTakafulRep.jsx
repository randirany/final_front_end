import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

function InsuranceTakafulRep({
    onClose,
    isOpen,
    onReportAdded,
}) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { vehicleId: paramsVehicleId } = useParams();
    const { t, i18n: { language } } = useTranslation();

    const memoizedInitialFormData = useMemo(() => ({
        accidentInfo: { reportDate: '', accidentDate: '', accidentType: '', accidentLocation: '', accidentTime: '', passengersCount: '', agentName: '' },
        policyInfo: { policyNumber: '', branch: '', durationFrom: '', durationTo: '', issueDate: '', isFullCoverage: false, fullCoverageFee: '', isThirdParty: false, thirdPartyFee: '', isMandatory: false, maxAllowedPassengers: '' },
        insuredPerson: { name: '', address: '', residence: '', workAddress: '', workPhone: '' },
        driverInfo: { name: '', idNumber: '', birthDate: '', age: '', residence: '', address: '', workAddress: '', workPhone: '', relationToInsured: '' },
        licenseInfo: { licenseNumber: '', licenseType: '', issueDate: '', expiryDate: '', matchesVehicleType: false },
        insuredVehicle: { plateNumber: '', damage: { front: '', back: '', left: '', right: '', estimatedValue: '', towingCompany: '', garage: '' } },
        otherVehicles: [],
        policeAndWitnesses: { reportedDate: '', policeAuthority: '', sketchDrawn: false, policeCame: false, witnesses: [] },
        passengers: [],
        accidentNarration: '',
        notifierSignature: '',
        receiverName: '',
        receiverNotes: '',
        declaration: { declarerName: '', declarationDate: '', documentCheckerName: '', checkerJob: '', checkerSignature: '', checkerDate: '' }
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
    }, [isOpen, memoizedInitialFormData, paramsVehicleId]);

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
                newState[subFieldOrItemFieldInArray] = valToSet;
            } else {
                if (eventTargetName && prev.hasOwnProperty(eventTargetName)) { newState[eventTargetName] = valToSet; }
            }
            return newState;
        });
    };

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 8));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        let endpointPath = '';
        const method = 'POST';


        if (!paramsVehicleId) {
            alert(t('vehicleIdParamRequiredError'));
            setIsSubmitting(false);
            return;
        }
        endpointPath = `add/${paramsVehicleId}`;


        const toNumberOrNull = (val) => (val === '' || val === null || val === undefined) ? null : (isNaN(Number(val)) ? null : Number(val));
        const toBoolean = (val) => typeof val === 'string' ? (val.toLowerCase() === 'true') : Boolean(val);
        const toDateStringOrNullISO = (val) => (!val || val.trim() === '') ? null : (new Date(val).toISOString());

        const dataToSend = {
            accidentInfo: { ...formData.accidentInfo, reportDate: toDateStringOrNullISO(formData.accidentInfo.reportDate), accidentDate: toDateStringOrNullISO(formData.accidentInfo.accidentDate), passengersCount: toNumberOrNull(formData.accidentInfo.passengersCount) },
            policyInfo: { ...formData.policyInfo, durationFrom: toDateStringOrNullISO(formData.policyInfo.durationFrom), durationTo: toDateStringOrNullISO(formData.policyInfo.durationTo), issueDate: toDateStringOrNullISO(formData.policyInfo.issueDate), isFullCoverage: toBoolean(formData.policyInfo.isFullCoverage), isThirdParty: toBoolean(formData.policyInfo.isThirdParty), isMandatory: toBoolean(formData.policyInfo.isMandatory), maxAllowedPassengers: toNumberOrNull(formData.policyInfo.maxAllowedPassengers) },
            insuredPerson: { ...formData.insuredPerson },
            driverInfo: { ...formData.driverInfo, birthDate: toDateStringOrNullISO(formData.driverInfo.birthDate), age: toNumberOrNull(formData.driverInfo.age) },
            licenseInfo: { ...formData.licenseInfo, issueDate: toDateStringOrNullISO(formData.licenseInfo.issueDate), expiryDate: toDateStringOrNullISO(formData.licenseInfo.expiryDate), matchesVehicleType: toBoolean(formData.licenseInfo.matchesVehicleType) },
            insuredVehicle: { ...formData.insuredVehicle, damage: { ...formData.insuredVehicle.damage } },
            otherVehicles: (formData.otherVehicles || []).map(v => ({ ...v })),
            policeAndWitnesses: { ...formData.policeAndWitnesses, reportedDate: toDateStringOrNullISO(formData.policeAndWitnesses.reportedDate), sketchDrawn: toBoolean(formData.policeAndWitnesses.sketchDrawn), policeCame: toBoolean(formData.policeAndWitnesses.policeCame), witnesses: (formData.policeAndWitnesses.witnesses || []).map(w => ({ ...w })) },
            passengers: (formData.passengers || []).map(p => ({ ...p, age: toNumberOrNull(p.age) })),
            accidentNarration: formData.accidentNarration,
            notifierSignature: formData.notifierSignature,
            receiverName: formData.receiverName,
            receiverNotes: formData.receiverNotes,
            declaration: { ...formData.declaration, declarationDate: toDateStringOrNullISO(formData.declaration.declarationDate), checkerDate: toDateStringOrNullISO(formData.declaration.checkerDate) },
        };

        const url = `http://localhost:3002/api/v1/TakafulAccidentReport/${endpointPath}`;
        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const response = await fetch(url, {
                method: method, headers: { 'Content-Type': 'application/json', token }, body: JSON.stringify(dataToSend)
            });
            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.message || `HTTP error! status: ${response.status}`);

            alert(t('takaful.report.takaful.formSubmissionSuccess') + (responseData.message ? `\n${responseData.message}` : ''));

             if (onReportAdded) {
                onReportAdded();
            } else {
                onClose();
            }

        } catch (error) {
            alert(t('takaful.report.takaful.formSubmissionError') + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addArrayItem = (arrayName, itemStructure = {}) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev)); const keys = arrayName.split('.'); let currentLevel = newState;
            for (let i = 0; i < keys.length - 1; i++) { if (!currentLevel[keys[i]] || typeof currentLevel[keys[i]] !== 'object') currentLevel[keys[i]] = {}; currentLevel = currentLevel[keys[i]]; }
            const finalKey = keys[keys.length - 1]; if (!currentLevel[finalKey] || !Array.isArray(currentLevel[finalKey])) currentLevel[finalKey] = [];
            currentLevel[finalKey].push(JSON.parse(JSON.stringify(itemStructure))); return newState;
        });
    };
    const removeArrayItem = (arrayName, index) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev)); const keys = arrayName.split('.'); let currentLevel = newState;
            for (let i = 0; i < keys.length - 1; i++) { if (!currentLevel[keys[i]] || typeof currentLevel[keys[i]] !== 'object') return prev; currentLevel = currentLevel[keys[i]]; }
            const finalKey = keys[keys.length - 1];
            if (currentLevel[finalKey] && Array.isArray(currentLevel[finalKey]) && currentLevel[finalKey].length > index) { currentLevel[finalKey].splice(index, 1); }
            return newState;
        });
    };

    const getStepTitle = () => { switch (currentStep) { case 1: return t('takaful.report.takaful.accidentInfoTitle'); case 2: return t('takaful.report.takaful.policyInfoTitle'); case 3: return t('takaful.report.takaful.insuredPersonTitle'); case 4: return t('takaful.report.takaful.driverLicenseTitle'); case 5: return t('takaful.report.takaful.insuredVehicleTitle'); case 6: return t('takaful.report.takaful.otherVehiclesTitle'); case 7: return t('takaful.report.takaful.policePassengersTitle'); case 8: return t('takaful.report.takaful.narrationDeclarationTitle'); default: return ''; } };
    const renderStepIndicator = () => (<div className="px-4 py-3 mb-4"> <div className="flex justify-between items-center"> {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (<div key={step} className="flex flex-col items-center text-center flex-1 px-1"> <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium ${currentStep >= step ? 'bg-indigo-600 text-[rgb(255,255,255)]' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{step}</div> <span className="text-[10px] leading-tight mt-1 text-gray-600 dark:text-gray-400"> {step === 1 && t('takaful.report.takaful.step1Indicator')} {step === 2 && t('takaful.report.takaful.step2Indicator')} {step === 3 && t('takaful.report.takaful.step3Indicator')} {step === 4 && t('takaful.report.takaful.step4Indicator')} {step === 5 && t('takaful.report.takaful.step5Indicator')} {step === 6 && t('takaful.report.takaful.step6Indicator')} {step === 7 && t('takaful.report.takaful.step7Indicator')} {step === 8 && t('takaful.report.takaful.step8Indicator')} </span> </div>))} </div> </div>);
    const renderCommonInput = (labelKey, nameAttribute, value, type = "text", required = false, section = null, subFieldOrItemField = null, arrayName = null, index = null, itemFieldInArray = null, subSubField = null, options = null) => { const inputId = `${section || ''}_${subFieldOrItemField || ''}_${subSubField || ''}_${arrayName || ''}_${index === null ? '' : index}_${itemFieldInArray || nameAttribute || labelKey}`.replace(/\W/g, '_'); if (type === "checkbox") { return (<div className="flex items-center mb-2 col-span-1 md:col-span-2"> <input type="checkbox" id={inputId} name={nameAttribute} checked={Boolean(value)} onChange={(e) => handleChange(e, section, subFieldOrItemField, arrayName, index, itemFieldInArray, subSubField)} className="h-4 w-4 text-indigo-600 border-gray-300 dark:!border-nonerounded focus:ring-indigo-500" /> <label htmlFor={inputId} className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"> {t(labelKey)} {required && <span className="text-red-500">*</span>} </label> </div>); } return (<div className="mb-2"> <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t(labelKey)} {required && <span className="text-red-500">*</span>}</label> {type === "select" ? (<select id={inputId} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, subFieldOrItemField, arrayName, index, itemFieldInArray, subSubField)} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" required={required} > <option value="">{t("selectDefault", "-- Select --")}</option> {options && options.map(opt => <option key={opt.value} value={opt.value}>{t(opt.label)}</option>)} </select>) : type === "textarea" ? (<textarea id={inputId} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, subFieldOrItemField, arrayName, index, itemFieldInArray, subSubField)} rows="2" className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" required={required} ></textarea>) : (<input id={inputId} type={type} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, subFieldOrItemField, arrayName, index, itemFieldInArray, subSubField)} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" required={required} step={type === "number" ? "any" : undefined} min={type === "number" ? 0 : undefined} />)} </div>); };
    const renderAccidentInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"> {renderCommonInput("takaful.report.takaful.reportDateLabel", "reportDate", formData.accidentInfo.reportDate, "date", true, "accidentInfo", "reportDate")} {renderCommonInput("takaful.report.takaful.accidentDateLabel", "accidentDate", formData.accidentInfo.accidentDate, "date", true, "accidentInfo", "accidentDate")} {renderCommonInput("takaful.report.takaful.accidentTimeLabel", "accidentTime", formData.accidentInfo.accidentTime, "time", true, "accidentInfo", "accidentTime")} {renderCommonInput("takaful.report.takaful.accidentTypeLabel", "accidentType", formData.accidentInfo.accidentType, "text", true, "accidentInfo", "accidentType")} {renderCommonInput("takaful.report.takaful.accidentLocationLabel", "accidentLocation", formData.accidentInfo.accidentLocation, "text", true, "accidentInfo", "accidentLocation")} {renderCommonInput("takaful.report.takaful.passengersCountLabel", "passengersCount", formData.accidentInfo.passengersCount, "number", true, "accidentInfo", "passengersCount")} {renderCommonInput("takaful.report.takaful.agentNameLabel", "agentName", formData.accidentInfo.agentName, "text", true, "accidentInfo", "agentName")} </div>);
    const renderPolicyInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"> {renderCommonInput("takaful.report.takaful.policyNumberLabel", "policyNumber", formData.policyInfo.policyNumber, "text", true, "policyInfo", "policyNumber")} {renderCommonInput("takaful.report.takaful.branchLabel", "branch", formData.policyInfo.branch, "text", true, "policyInfo", "branch")} {renderCommonInput("takaful.report.takaful.durationFromLabel", "durationFrom", formData.policyInfo.durationFrom, "date", true, "policyInfo", "durationFrom")} {renderCommonInput("takaful.report.takaful.durationToLabel", "durationTo", formData.policyInfo.durationTo, "date", true, "policyInfo", "durationTo")} {renderCommonInput("takaful.report.takaful.issueDateLabel", "issueDate", formData.policyInfo.issueDate, "date", true, "policyInfo", "issueDate")} {renderCommonInput("takaful.report.takaful.maxAllowedPassengersLabel", "maxAllowedPassengers", formData.policyInfo.maxAllowedPassengers, "number", true, "policyInfo", "maxAllowedPassengers")} {renderCommonInput("takaful.report.takaful.fullCoverageFeeLabel", "fullCoverageFee", formData.policyInfo.fullCoverageFee, "text", true, "policyInfo", "fullCoverageFee")} {renderCommonInput("takaful.report.takaful.thirdPartyFeeLabel", "thirdPartyFee", formData.policyInfo.thirdPartyFee, "text", true, "policyInfo", "thirdPartyFee")} <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3"> {renderCommonInput("takaful.report.takaful.isFullCoverageLabel", "isFullCoverage", formData.policyInfo.isFullCoverage, "checkbox", false, "policyInfo", "isFullCoverage")} {renderCommonInput("takaful.report.takaful.isThirdPartyLabel", "isThirdParty", formData.policyInfo.isThirdParty, "checkbox", false, "policyInfo", "isThirdParty")} {renderCommonInput("takaful.report.takaful.isMandatoryLabel", "isMandatory", formData.policyInfo.isMandatory, "checkbox", false, "policyInfo", "isMandatory")} </div> </div>);
    const renderInsuredPersonInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("takaful.report.takaful.insuredNameLabel", "name", formData.insuredPerson.name, "text", true, "insuredPerson", "name")} {renderCommonInput("takaful.report.takaful.insuredAddressLabel", "address", formData.insuredPerson.address, "text", true, "insuredPerson", "address")} {renderCommonInput("takaful.report.takaful.insuredResidenceLabel", "residence", formData.insuredPerson.residence, "text", true, "insuredPerson", "residence")} {renderCommonInput("takaful.report.takaful.insuredWorkAddressLabel", "workAddress", formData.insuredPerson.workAddress, "text", false, "insuredPerson", "workAddress")} {renderCommonInput("takaful.report.takaful.insuredWorkPhoneLabel", "workPhone", formData.insuredPerson.workPhone, "tel", false, "insuredPerson", "workPhone")} </div>);
    const renderDriverAndLicenseInfo = () => (<div className="space-y-6"> <div> <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("takaful.report.takaful.driverInfoTitle")}</h3> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"> {renderCommonInput("takaful.report.takaful.driverNameLabel", "name", formData.driverInfo.name, "text", true, "driverInfo", "name")} {renderCommonInput("takaful.report.takaful.driverIdNumberLabel", "idNumber", formData.driverInfo.idNumber, "text", true, "driverInfo", "idNumber")} {renderCommonInput("takaful.report.takaful.driverBirthDateLabel", "birthDate", formData.driverInfo.birthDate, "date", true, "driverInfo", "birthDate")} {renderCommonInput("takaful.report.takaful.driverAgeLabel", "age", formData.driverInfo.age, "number", true, "driverInfo", "age")} {renderCommonInput("takaful.report.takaful.driverResidenceLabel", "residence", formData.driverInfo.residence, "text", true, "driverInfo", "residence")} {renderCommonInput("takaful.report.takaful.driverAddressLabel", "address", formData.driverInfo.address, "text", true, "driverInfo", "address")} {renderCommonInput("takaful.report.takaful.driverWorkAddressLabel", "workAddress", formData.driverInfo.workAddress, "text", false, "driverInfo", "workAddress")} {renderCommonInput("takaful.report.takaful.driverWorkPhoneLabel", "workPhone", formData.driverInfo.workPhone, "tel", false, "driverInfo", "workPhone")} {renderCommonInput("takaful.report.takaful.relationToInsuredLabel", "relationToInsured", formData.driverInfo.relationToInsured, "text", true, "driverInfo", "relationToInsured")} </div> </div> <div> <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("takaful.report.takaful.licenseInfoTitle")}</h3> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"> {renderCommonInput("takaful.report.takaful.licenseNumberLabel", "licenseNumber", formData.licenseInfo.licenseNumber, "text", true, "licenseInfo", "licenseNumber")} {renderCommonInput("takaful.report.takaful.licenseTypeLabel", "licenseType", formData.licenseInfo.licenseType, "text", true, "licenseInfo", "licenseType")} {renderCommonInput("takaful.report.takaful.licenseIssueDateLabel", "issueDate", formData.licenseInfo.issueDate, "date", true, "licenseInfo", "issueDate")} {renderCommonInput("takaful.report.takaful.licenseExpiryDateLabel", "expiryDate", formData.licenseInfo.expiryDate, "date", true, "licenseInfo", "expiryDate")} </div> {renderCommonInput("takaful.report.takaful.matchesVehicleTypeLabel", "matchesVehicleType", formData.licenseInfo.matchesVehicleType, "checkbox", false, "licenseInfo", "matchesVehicleType")} </div> </div>);
    
    const renderInsuredVehicleInfo = () => (<div className="space-y-6"> <div> 
       
        </div>
         <div> <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("takaful.report.takaful.damageTitle")}</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("takaful.report.takaful.damageFrontLabel", "front", formData.insuredVehicle.damage.front, "textarea", false, "insuredVehicle", "damage", null, null, null, "front")} {renderCommonInput("takaful.report.takaful.damageBackLabel", "back", formData.insuredVehicle.damage.back, "textarea", false, "insuredVehicle", "damage", null, null, null, "back")} {renderCommonInput("takaful.report.takaful.damageLeftLabel", "left", formData.insuredVehicle.damage.left, "textarea", false, "insuredVehicle", "damage", null, null, null, "left")} {renderCommonInput("takaful.report.takaful.damageRightLabel", "right", formData.insuredVehicle.damage.right, "textarea", false, "insuredVehicle", "damage", null, null, null, "right")} {renderCommonInput("takaful.report.takaful.damageEstValueLabel", "estimatedValue", formData.insuredVehicle.damage.estimatedValue, "text", false, "insuredVehicle", "damage", null, null, null, "estimatedValue")} {renderCommonInput("takaful.report.takaful.damageTowingCoLabel", "towingCompany", formData.insuredVehicle.damage.towingCompany, "text", false, "insuredVehicle", "damage", null, null, null, "towingCompany")} {renderCommonInput("takaful.report.takaful.damageGarageLabel", "garage", formData.insuredVehicle.damage.garage, "text", false, "insuredVehicle", "damage", null, null, null, "garage")} </div> </div> </div>);
    const renderOtherVehicles = () => (<div> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('takaful.report.takaful.otherVehiclesTitle')}</h3> {(formData.otherVehicles || []).map((vehicle, index) => (<div key={`ov-${index}`} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-4 border dark:border-gray-600"> <div className="flex justify-between items-center mb-2"> <h4 className="text-md font-medium text-gray-600 dark:text-gray-300">{t('takaful.report.takaful.otherVehicleItemTitle', { index: index + 1 })}</h4> <button type="button" onClick={() => removeArrayItem('otherVehicles', index)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2"> {renderCommonInput("takaful.report.takaful.ovVehicleNumberLabel", "vehicleNumber", vehicle.vehicleNumber, "text", false, null, "vehicleNumber", "otherVehicles", index, "vehicleNumber")} {renderCommonInput("takaful.report.takaful.ovOwnerNameLabel", "ownerName", vehicle.ownerName, "text", false, null, "ownerName", "otherVehicles", index, "ownerName")} {renderCommonInput("takaful.report.takaful.ovDriverNameLabel", "driverName", vehicle.driverName, "text", false, null, "driverName", "otherVehicles", index, "driverName")} {renderCommonInput("takaful.report.takaful.ovColorAndTypeLabel", "colorAndType", vehicle.colorAndType, "text", false, null, "colorAndType", "otherVehicles", index, "colorAndType")} {renderCommonInput("takaful.report.takaful.ovTotalWeightLabel", "totalWeight", vehicle.totalWeight, "text", false, null, "totalWeight", "otherVehicles", index, "totalWeight")} {renderCommonInput("takaful.report.takaful.ovAddressLabel", "address", vehicle.address, "text", false, null, "address", "otherVehicles", index, "address")} {renderCommonInput("takaful.report.takaful.ovPhoneLabel", "phone", vehicle.phone, "tel", false, null, "phone", "otherVehicles", index, "phone")} {renderCommonInput("takaful.report.takaful.ovInsuranceCoLabel", "insuranceCompany", vehicle.insuranceCompany, "text", false, null, "insuranceCompany", "otherVehicles", index, "insuranceCompany")} {renderCommonInput("takaful.report.takaful.ovPolicyNumberLabel", "policyNumber", vehicle.policyNumber, "text", false, null, "policyNumber", "otherVehicles", index, "policyNumber")} {renderCommonInput("takaful.report.takaful.ovInsuranceTypeLabel", "insuranceType", vehicle.insuranceType, "text", false, null, "insuranceType", "otherVehicles", index, "insuranceType")} <div className="md:col-span-2 lg:col-span-3"> {renderCommonInput("takaful.report.takaful.ovDamageDescLabel", "damageDescription", vehicle.damageDescription, "textarea", false, null, "damageDescription", "otherVehicles", index, "damageDescription")} </div> </div> </div>))} <button type="button" onClick={() => addArrayItem('otherVehicles', { vehicleNumber: '', ownerName: '', driverName: '', colorAndType: '', totalWeight: '', address: '', phone: '', insuranceCompany: '', policyNumber: '', insuranceType: '', damageDescription: '' })} className="mt-2 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t('takaful.report.takaful.addOtherVehicleButton')} </button> </div>);
    const renderPolicePassengersInfo = () => (<div className="space-y-6"> <div> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("takaful.report.takaful.policeInfoTitle")}</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("takaful.report.takaful.policeReportedDateLabel", "reportedDate", formData.policeAndWitnesses.reportedDate, "date", false, "policeAndWitnesses", "reportedDate")} {renderCommonInput("takaful.report.takaful.policeAuthorityLabel", "policeAuthority", formData.policeAndWitnesses.policeAuthority, "text", false, "policeAndWitnesses", "policeAuthority")} </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3"> {renderCommonInput("takaful.report.takaful.sketchDrawnLabel", "sketchDrawn", formData.policeAndWitnesses.sketchDrawn, "checkbox", false, "policeAndWitnesses", "sketchDrawn")} {renderCommonInput("takaful.report.takaful.policeCameLabel", "policeCame", formData.policeAndWitnesses.policeCame, "checkbox", false, "policeAndWitnesses", "policeCame")} </div> <div className="mt-4"> <h4 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-2">{t("takaful.report.takaful.witnessesTitle")}</h4> {(formData.policeAndWitnesses.witnesses || []).map((witness, index) => (<div key={`wit-${index}`} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-3 border dark:border-gray-600"> <div className="flex justify-between items-center mb-2"> <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('takaful.report.takaful.witnessItemTitle', { index: index + 1 })}</h5> <button type="button" onClick={() => removeArrayItem('policeAndWitnesses.witnesses', index)} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div> <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-2"> {renderCommonInput("takaful.report.takaful.witnessNameLabel", "name", witness.name, "text", false, "policeAndWitnesses", "witnesses", "policeAndWitnesses.witnesses", index, "name")} {renderCommonInput("takaful.report.takaful.witnessPhoneLabel", "phone", witness.phone, "tel", false, "policeAndWitnesses", "witnesses", "policeAndWitnesses.witnesses", index, "phone")} {renderCommonInput("takaful.report.takaful.witnessAddressLabel", "address", witness.address, "text", false, "policeAndWitnesses", "witnesses", "policeAndWitnesses.witnesses", index, "address")} </div> </div>))} <button type="button" onClick={() => addArrayItem('policeAndWitnesses.witnesses', { name: '', phone: '', address: '' })} className="mt-1 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t('takaful.report.takaful.addWitnessButton')} </button> </div> </div> <div> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("takaful.report.takaful.passengersTitle")}</h3> {(formData.passengers || []).map((passenger, index) => (<div key={`pass-${index}`} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-3 border dark:border-gray-600"> <div className="flex justify-between items-center mb-2"> <h4 className="text-md font-medium text-gray-600 dark:text-gray-300">{t('takaful.report.takaful.passengerItemTitle', { index: index + 1 })}</h4> <button type="button" onClick={() => removeArrayItem('passengers', index)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2"> {renderCommonInput("takaful.report.takaful.passengerNameLabel", "name", passenger.name, "text", false, null, "name", "passengers", index, "name")} {renderCommonInput("takaful.report.takaful.passengerAgeLabel", "age", passenger.age, "number", false, null, "age", "passengers", index, "age")} {renderCommonInput("takaful.report.takaful.passengerAddressLabel", "address", passenger.address, "text", false, null, "address", "passengers", index, "address")} {renderCommonInput("takaful.report.takaful.passengerHospitalLabel", "hospital", passenger.hospital, "text", false, null, "hospital", "passengers", index, "hospital")} <div className="md:col-span-2 lg:col-span-3"> {renderCommonInput("takaful.report.takaful.passengerInjuryDescLabel", "injuryDescription", passenger.injuryDescription, "textarea", false, null, "injuryDescription", "passengers", index, "injuryDescription")} </div> </div> </div>))} <button type="button" onClick={() => addArrayItem('passengers', { name: '', age: '', address: '', hospital: '', injuryDescription: '' })} className="mt-2 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t('takaful.report.takaful.addPassengerButton')} </button> </div> </div>);
    const renderNarrationAndDeclaration = () => (<div className="space-y-6"> {renderCommonInput("takaful.report.takaful.accidentNarrationLabel", "accidentNarration", formData.accidentNarration, "textarea", true, null, "accidentNarration")} <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("takaful.report.takaful.notifierSignatureLabel", "notifierSignature", formData.notifierSignature, "text", true, null, "notifierSignature")} {renderCommonInput("takaful.report.takaful.receiverNameLabel", "receiverName", formData.receiverName, "text", true, null, "receiverName")} </div> {renderCommonInput("takaful.report.takaful.receiverNotesLabel", "receiverNotes", formData.receiverNotes, "textarea", false, null, "receiverNotes")} <div className="pt-4 border-t dark:border-gray-600"> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("takaful.report.takaful.declarationTitle")}</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("takaful.report.takaful.declarerNameLabel", "declarerName", formData.declaration.declarerName, "text", true, "declaration", "declarerName")} {renderCommonInput("takaful.report.takaful.declarationDateLabel", "declarationDate", formData.declaration.declarationDate, "date", true, "declaration", "declarationDate")} {renderCommonInput("takaful.report.takaful.docCheckerNameLabel", "documentCheckerName", formData.declaration.documentCheckerName, "text", true, "declaration", "documentCheckerName")} {renderCommonInput("takaful.report.takaful.checkerJobLabel", "checkerJob", formData.declaration.checkerJob, "text", true, "declaration", "checkerJob")} {renderCommonInput("takaful.report.takaful.checkerSignatureLabel", "checkerSignature", formData.declaration.checkerSignature, "text", true, "declaration", "checkerSignature")} {renderCommonInput("takaful.report.takaful.checkerDateLabel", "checkerDate", formData.declaration.checkerDate, "date", true, "declaration", "checkerDate")} </div> </div> </div>);

    const modalTitleText =t('takaful.report.takaful.modalTitle');
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
                            {currentStep === 1 && renderAccidentInfo()}
                            {currentStep === 2 && renderPolicyInfo()}
                            {currentStep === 3 && renderInsuredPersonInfo()}
                            {currentStep === 4 && renderDriverAndLicenseInfo()}
                            {currentStep === 5 && renderInsuredVehicleInfo()}
                            {currentStep === 6 && renderOtherVehicles()}
                            {currentStep === 7 && renderPolicePassengersInfo()}
                            {currentStep === 8 && renderNarrationAndDeclaration()}
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-between items-center border-t dark:border-gray-700 sticky bottom-0 bg-[rgb(255,255,255)] dark:bg-navbarBack z-10">
                        <button
                            type="button"
                            onClick={handleBack}
                            className={`px-4 py-2 text-sm rounded-md shadow-sm ${currentStep === 1 || isSubmitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-600 dark:text-gray-500' : 'text-gray-700 bg-[rgb(255,255,255)] border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600'}`}
                            disabled={currentStep === 1 || isSubmitting}
                        > {t('backButton')} </button>
                        {currentStep < 8 && (
                            <button
                                type="button"
                                onClick={handleNext}
                                className={`px-4 py-2 text-sm text-[rgb(255,255,255)] bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                            > {t('nextButton')} </button>
                        )}
                        {currentStep === 8 && (
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

export default InsuranceTakafulRep;