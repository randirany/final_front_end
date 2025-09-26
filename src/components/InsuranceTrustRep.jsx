import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
function InsuranceTrustRep({ onClose, isOpen, onReportAdded }) {

    const { vehicleId } = useParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t, i18n: { language } } = useTranslation();

    const memoizedInitialFormData = useMemo(() => ({
        accidentDetails: { location: '', date: '', time: '', accidentType: '', reportDate: '' },
        insuredVehicle: { type: '', model: '', color: '', ownership: '', usage: '', manufactureYear: '', chassisNumber: '', testExpiry: '', insuranceCompany: '', policyNumber: '', insuranceType: '', insurancePeriod: { from: '', to: '' } },
        driverDetails: { name: '', birthDate: '', address: '', licenseNumber: '', licenseType: '', licenseExpiry: '', relationToInsured: '' },
        damages: { front: '', back: '', right: '', left: '', estimatedCost: '', garageName: '', towCompany: '' },
        otherVehicle: { plateNumber: '', type: '', model: '', color: '', insuranceCompany: '', driverName: '', driverAddress: '', licenseNumber: '', damageDescription: '' },
        witnesses: [],
        policeReport: { reportDate: '', authority: '', sketchDrawn: false, officersPresent: false },
        narration: '',
        signature: '',
        declaration: { declarerName: '', declarationDate: '', reviewerName: '', reviewerSignature: '', reviewDate: '' }
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
            console.log("Opening Trust form in ADD mode, vehicleId from params:", vehicleId);
            setFormData(JSON.parse(JSON.stringify(memoizedInitialFormData)));
            setCurrentStep(1);
        }
    }, [isOpen, memoizedInitialFormData, vehicleId]);

    if (!isOpen) return null;

    const handleChange = (e, section, fieldKey, arrayName, index, itemKey) => {
        const { name: inputNameFromEvent, value, type, checked } = e.target;
        const valToSet = type === 'checkbox' ? checked : value;
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            if (arrayName && typeof index === 'number' && typeof itemKey === 'string') {
                if (!newState[arrayName]) newState[arrayName] = [];
                while (index >= newState[arrayName].length) newState[arrayName].push({});
                if (typeof newState[arrayName][index] !== 'object' || newState[arrayName][index] === null) newState[arrayName][index] = {};
                newState[arrayName][index][itemKey] = valToSet;
            } else if (section && fieldKey && itemKey) {
                if (!newState[section]) newState[section] = {};
                if (!newState[section][fieldKey]) newState[section][fieldKey] = {};
                newState[section][fieldKey][itemKey] = valToSet;
            } else if (section && fieldKey) {
                if (!newState[section]) newState[section] = {};
                newState[section][fieldKey] = valToSet;
            } else if (!section && fieldKey) {
                newState[fieldKey] = valToSet;
            } else {
                console.warn("handleChange (Trust): Unhandled case", { section, fieldKey, arrayName, index, itemKey, eventName: inputNameFromEvent });
            }
            return newState;
        });
    };

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 7));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!vehicleId) {
            alert(t('trust.report.trust.vehicleIdRequiredError'));
            setIsSubmitting(false);
            return;
        }

        const endpointPath = `add/${vehicleId}`;
        const method = 'POST';

        const toBoolean = (val) => typeof val === 'string' ? (val.toLowerCase() === 'true') : Boolean(val);
        const formatDateForBackend = (dateStr) => { if (!dateStr || String(dateStr).trim() === '') return null; try { return new Date(dateStr).toISOString(); } catch (error) { return null; } };
        const ensureStringOrNull = (val) => (val === null || val === undefined || String(val).trim() === '') ? null : String(val);

        const baseData = JSON.parse(JSON.stringify(formData));
        const requiredChecksConfig = { /* ... as defined in your previous code ... */ };
        if (currentStep === 7) {
            for (const fieldPath in requiredChecksConfig) {
                const pathParts = fieldPath.split('.');
                let value = baseData;
                for (const part of pathParts) {
                    if (value && typeof value === 'object' && part in value) {
                        value = value[part];
                    } else { value = undefined; break; }
                }
                const isDateField = fieldPath.toLowerCase().includes('date') || fieldPath.toLowerCase().includes('expiry') || fieldPath.includes('insuranceperiod');
                let isEmpty = isDateField ? (value === null || String(value).trim() === '') : (value === null || value === undefined || String(value).trim() === '');
                if (isEmpty) {
                    alert(t("trust.report.trust.fieldRequiredError", { fieldName: t(requiredChecksConfig[fieldPath]) }));
                    setIsSubmitting(false); return;
                }
            }
        }


        const dataForApi = {
            accidentDetails: { location: ensureStringOrNull(baseData.accidentDetails.location), date: formatDateForBackend(baseData.accidentDetails.date), time: ensureStringOrNull(baseData.accidentDetails.time), accidentType: ensureStringOrNull(baseData.accidentDetails.accidentType), reportDate: formatDateForBackend(baseData.accidentDetails.reportDate), },
            insuredVehicle: { plateNumber: vehicleId, type: ensureStringOrNull(baseData.insuredVehicle.type), model: ensureStringOrNull(baseData.insuredVehicle.model), color: ensureStringOrNull(baseData.insuredVehicle.color), ownership: ensureStringOrNull(baseData.insuredVehicle.ownership), usage: ensureStringOrNull(baseData.insuredVehicle.usage), manufactureYear: ensureStringOrNull(baseData.insuredVehicle.manufactureYear), chassisNumber: ensureStringOrNull(baseData.insuredVehicle.chassisNumber), testExpiry: formatDateForBackend(baseData.insuredVehicle.testExpiry), insuranceCompany: ensureStringOrNull(baseData.insuredVehicle.insuranceCompany), policyNumber: ensureStringOrNull(baseData.insuredVehicle.policyNumber), insuranceType: ensureStringOrNull(baseData.insuredVehicle.insuranceType), insurancePeriod: { from: formatDateForBackend(baseData.insuredVehicle.insurancePeriod.from), to: formatDateForBackend(baseData.insuredVehicle.insurancePeriod.to), }, },
            driverDetails: { name: ensureStringOrNull(baseData.driverDetails.name), birthDate: formatDateForBackend(baseData.driverDetails.birthDate), address: ensureStringOrNull(baseData.driverDetails.address), licenseNumber: ensureStringOrNull(baseData.driverDetails.licenseNumber), licenseType: ensureStringOrNull(baseData.driverDetails.licenseType), licenseExpiry: formatDateForBackend(baseData.driverDetails.licenseExpiry), relationToInsured: ensureStringOrNull(baseData.driverDetails.relationToInsured), },
            damages: { front: ensureStringOrNull(baseData.damages.front), back: ensureStringOrNull(baseData.damages.back), right: ensureStringOrNull(baseData.damages.right), left: ensureStringOrNull(baseData.damages.left), estimatedCost: ensureStringOrNull(baseData.damages.estimatedCost), garageName: ensureStringOrNull(baseData.damages.garageName), towCompany: ensureStringOrNull(baseData.damages.towCompany), },
            otherVehicle: { plateNumber: ensureStringOrNull(baseData.otherVehicle.plateNumber), type: ensureStringOrNull(baseData.otherVehicle.type), model: ensureStringOrNull(baseData.otherVehicle.model), color: ensureStringOrNull(baseData.otherVehicle.color), insuranceCompany: ensureStringOrNull(baseData.otherVehicle.insuranceCompany), driverName: ensureStringOrNull(baseData.otherVehicle.driverName), driverAddress: ensureStringOrNull(baseData.otherVehicle.driverAddress), licenseNumber: ensureStringOrNull(baseData.otherVehicle.licenseNumber), damageDescription: ensureStringOrNull(baseData.otherVehicle.damageDescription), },
            witnesses: (baseData.witnesses || []).map(w => ({ name: ensureStringOrNull(w.name), address: ensureStringOrNull(w.address), phone: ensureStringOrNull(w.phone), })).filter(w => w.name && w.address && w.phone),
            policeReport: { reportDate: formatDateForBackend(baseData.policeReport.reportDate), authority: ensureStringOrNull(baseData.policeReport.authority), sketchDrawn: toBoolean(baseData.policeReport.sketchDrawn), officersPresent: toBoolean(baseData.policeReport.officersPresent), },
            narration: ensureStringOrNull(baseData.narration),
            signature: ensureStringOrNull(baseData.signature),
            declaration: { declarerName: ensureStringOrNull(baseData.declaration.declarerName), declarationDate: formatDateForBackend(baseData.declaration.declarationDate), reviewerName: ensureStringOrNull(baseData.declaration.reviewerName), reviewerSignature: ensureStringOrNull(baseData.declaration.reviewerSignature), reviewDate: formatDateForBackend(baseData.declaration.reviewDate), },
        };

        try {
            const token = `islam__${localStorage.getItem("token")}`;
            const url = `http://localhost:3002/api/v1/TrustAccidentReport/${endpointPath}`;
            console.log(`Submitting Trust Data (${method}):`, url, JSON.stringify(dataForApi, null, 2));

            const response = await fetch(url, {
                method: method, headers: { 'Content-Type': 'application/json', token }, body: JSON.stringify(dataForApi)
            });
            const responseData = await response.json();
            if (!response.ok) {
                let detailedMessage = responseData.message || `HTTP error! status: ${response.status}`;
                if (responseData.errors) { detailedMessage += "\nDetails:\n"; for (const field in responseData.errors) { detailedMessage += `- ${field.replace(/\./g, ' -> ')}: ${responseData.errors[field]}\n`; } }
                else if (responseData.errorDetails) { detailedMessage += `\nDetails: ${responseData.errorDetails}`; }
                throw new Error(detailedMessage);
            }
            alert(t('trust.report.trust.formSubmissionSuccess') + (responseData.message ? `\n${responseData.message}` : ''));


            if (onReportAdded) {
                onReportAdded();
            } else {
                onClose(true);
            }

        } catch (error) {
            console.error('Submission error object (Trust):', error);
            alert(t('trust.report.trust.formSubmissionError') + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addArrayItem = (arrayName, itemStructure = {}) => { setFormData(prev => { const newState = JSON.parse(JSON.stringify(prev)); if (!newState[arrayName]) newState[arrayName] = []; newState[arrayName].push(JSON.parse(JSON.stringify(itemStructure))); return newState; }); };
    const removeArrayItem = (arrayName, index) => { setFormData(prev => { const newState = JSON.parse(JSON.stringify(prev)); if (newState[arrayName] && newState[arrayName].length > index) { newState[arrayName].splice(index, 1); } return newState; }); };
    const getStepTitle = () => { switch (currentStep) { case 1: return t('trust.report.trust.accidentDetailsTitle'); case 2: return t('trust.report.trust.insuredVehicleTitle'); case 3: return t('trust.report.trust.driverDetailsTitle'); case 4: return t('trust.report.trust.damagesTitle'); case 5: return t('trust.report.trust.otherVehicleTitle'); case 6: return t('trust.report.trust.witnessesPoliceTitle'); case 7: return t('trust.report.trust.narrationDeclarationTitle'); default: return ''; } };
    const renderStepIndicator = () => (<div className="px-4 py-3 mb-4"><div className="flex justify-between items-center">{[1, 2, 3, 4, 5, 6, 7].map((step) => (<div key={step} className="flex flex-col items-center text-center flex-1 px-1"><div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium ${currentStep >= step ? 'bg-indigo-600 text-[rgb(255,255,255)]' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{step}</div><span className="text-[10px] leading-tight mt-1 text-gray-600 dark:text-gray-400">{step === 1 && t('trust.report.trust.step1Indicator')}{step === 2 && t('trust.report.trust.step2Indicator')}{step === 3 && t('trust.report.trust.step3Indicator')}{step === 4 && t('trust.report.trust.step4Indicator')}{step === 5 && t('trust.report.trust.step5Indicator')}{step === 6 && t('trust.report.trust.step6Indicator')}{step === 7 && t('trust.report.trust.step7Indicator')}</span></div>))}</div></div>);
    const renderCommonInput = (labelKey, nameAttribute, value, type = "text", required = false, section = null, fieldKey = null, arrayName = null, index = null, itemKey = null, options = null) => { const inputId = `${section || ''}_${fieldKey || ''}_${itemKey || ''}_${arrayName || ''}_${index === null ? '' : index}_${nameAttribute || labelKey}`.replace(/\W/g, '_'); const keyForChange = itemKey || fieldKey || nameAttribute; let currentInputType = type; if (labelKey === "trust.report.trust.manufactureYearLabel" || labelKey === "trust.report.trust.estimatedCostLabel") { currentInputType = "text"; } if (currentInputType === "checkbox") { return (<div className="flex items-center mb-2 col-span-1 md:col-span-2"> <input type="checkbox" id={inputId} name={nameAttribute} checked={Boolean(value)} onChange={(e) => handleChange(e, section, fieldKey, arrayName, index, keyForChange)} className="h-4 w-4 text-indigo-600 border-gray-300 dark:!border-nonerounded focus:ring-indigo-500" /> <label htmlFor={inputId} className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"> {t(labelKey)} {required && <span className="text-red-500">*</span>} </label> </div>); } return (<div className="mb-2"> <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t(labelKey)} {required && <span className="text-red-500">*</span>}</label> {currentInputType === "select" ? (<select id={inputId} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, fieldKey, arrayName, index, keyForChange)} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" required={required}> <option value="">{options && options.find(o => o.value === '') ? t(options.find(o => o.value === '').label) : t("selectDefault", "-- Select --")}</option> {options && options.filter(o => o.value !== '').map(opt => <option key={opt.value} value={opt.value}>{t(opt.label)}</option>)} </select>) : currentInputType === "textarea" ? (<textarea id={inputId} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, keyForChange, arrayName, index, itemKey)} rows="2" className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" required={required}></textarea>) : (<input id={inputId} type={currentInputType} name={nameAttribute} value={value || ''} onChange={(e) => handleChange(e, section, fieldKey, arrayName, index, itemKey)} className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" required={required} step={currentInputType === "number" ? "any" : undefined} min={currentInputType === "number" ? 0 : undefined} />)} </div>); };
    const renderAccidentDetailsInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("trust.report.trust.accidentLocationLabel", "location", formData.accidentDetails.location, "text", true, "accidentDetails", "location")} {renderCommonInput("trust.report.trust.accidentDateLabel", "date", formData.accidentDetails.date, "date", true, "accidentDetails", "date")} {renderCommonInput("trust.report.trust.accidentTimeLabel", "time", formData.accidentDetails.time, "time", true, "accidentDetails", "time")} {renderCommonInput("trust.report.trust.accidentTypeLabel", "accidentType", formData.accidentDetails.accidentType, "text", true, "accidentDetails", "accidentType")} {renderCommonInput("trust.report.trust.reportDateLabel", "reportDate", formData.accidentDetails.reportDate, "date", true, "accidentDetails", "reportDate")} </div>);
    const renderInsuredVehicleInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"> {renderCommonInput("trust.report.trust.vehicleTypeLabel", "type", formData.insuredVehicle.type, "text", true, "insuredVehicle", "type")} {renderCommonInput("trust.report.trust.vehicleModelLabel", "model", formData.insuredVehicle.model, "text", true, "insuredVehicle", "model")} {renderCommonInput("trust.report.trust.vehicleColorLabel", "color", formData.insuredVehicle.color, "text", true, "insuredVehicle", "color")} {renderCommonInput("trust.report.trust.vehicleOwnershipLabel", "ownership", formData.insuredVehicle.ownership, "text", true, "insuredVehicle", "ownership")} {renderCommonInput("trust.report.trust.vehicleUsageLabel", "usage", formData.insuredVehicle.usage, "text", true, "insuredVehicle", "usage")} {renderCommonInput("trust.report.trust.manufactureYearLabel", "manufactureYear", formData.insuredVehicle.manufactureYear, "text", true, "insuredVehicle", "manufactureYear")} {renderCommonInput("trust.report.trust.chassisNumberLabel", "chassisNumber", formData.insuredVehicle.chassisNumber, "text", true, "insuredVehicle", "chassisNumber")} {renderCommonInput("trust.report.trust.testExpiryLabel", "testExpiry", formData.insuredVehicle.testExpiry, "date", true, "insuredVehicle", "testExpiry")} {renderCommonInput("trust.report.trust.insuranceCompanyLabel", "insuranceCompany", formData.insuredVehicle.insuranceCompany, "text", true, "insuredVehicle", "insuranceCompany")} {renderCommonInput("trust.report.trust.policyNumberLabel", "policyNumber", formData.insuredVehicle.policyNumber, "text", true, "insuredVehicle", "policyNumber")} {renderCommonInput("trust.report.trust.insuranceTypeLabel", "insuranceType", formData.insuredVehicle.insuranceType, "text", true, "insuredVehicle", "insuranceType")} {renderCommonInput("trust.report.trust.insurancePeriodFromLabel", "from", formData.insuredVehicle.insurancePeriod.from, "date", true, "insuredVehicle", "insurancePeriod", null, null, "from")} {renderCommonInput("trust.report.trust.insurancePeriodToLabel", "to", formData.insuredVehicle.insurancePeriod.to, "date", true, "insuredVehicle", "insurancePeriod", null, null, "to")} </div>);
    const renderDriverDetailsInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("trust.report.trust.driverNameLabel", "name", formData.driverDetails.name, "text", true, "driverDetails", "name")} {renderCommonInput("trust.report.trust.driverBirthDateLabel", "birthDate", formData.driverDetails.birthDate, "date", true, "driverDetails", "birthDate")} {renderCommonInput("trust.report.trust.driverAddressLabel", "address", formData.driverDetails.address, "text", true, "driverDetails", "address")} {renderCommonInput("trust.report.trust.driverLicenseNumberLabel", "licenseNumber", formData.driverDetails.licenseNumber, "text", true, "driverDetails", "licenseNumber")} {renderCommonInput("trust.report.trust.driverLicenseTypeLabel", "licenseType", formData.driverDetails.licenseType, "text", true, "driverDetails", "licenseType")} {renderCommonInput("trust.report.trust.driverLicenseExpiryLabel", "licenseExpiry", formData.driverDetails.licenseExpiry, "date", true, "driverDetails", "licenseExpiry")} {renderCommonInput("trust.report.trust.relationToInsuredLabel", "relationToInsured", formData.driverDetails.relationToInsured, "text", true, "driverDetails", "relationToInsured")} </div>);
    const renderDamagesInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("trust.report.trust.damageFrontLabel", "front", formData.damages.front, "textarea", true, "damages", "front")} {renderCommonInput("trust.report.trust.damageBackLabel", "back", formData.damages.back, "textarea", true, "damages", "back")} {renderCommonInput("trust.report.trust.damageRightLabel", "right", formData.damages.right, "textarea", true, "damages", "right")} {renderCommonInput("trust.report.trust.damageLeftLabel", "left", formData.damages.left, "textarea", true, "damages", "left")} {renderCommonInput("trust.report.trust.estimatedCostLabel", "estimatedCost", formData.damages.estimatedCost, "text", true, "damages", "estimatedCost")} {renderCommonInput("trust.report.trust.garageNameLabel", "garageName", formData.damages.garageName, "text", true, "damages", "garageName")} {renderCommonInput("trust.report.trust.towCompanyLabel", "towCompany", formData.damages.towCompany, "text", true, "damages", "towCompany")} </div>);
    const renderOtherVehicleInfo = () => (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"> {renderCommonInput("trust.report.trust.ovPlateNumberLabel", "plateNumber", formData.otherVehicle.plateNumber, "text", true, "otherVehicle", "plateNumber")} {renderCommonInput("trust.report.trust.ovTypeLabel", "type", formData.otherVehicle.type, "text", true, "otherVehicle", "type")} {renderCommonInput("trust.report.trust.ovModelLabel", "model", formData.otherVehicle.model, "text", true, "otherVehicle", "model")} {renderCommonInput("trust.report.trust.ovColorLabel", "color", formData.otherVehicle.color, "text", true, "otherVehicle", "color")} {renderCommonInput("trust.report.trust.ovInsuranceCompanyLabel", "insuranceCompany", formData.otherVehicle.insuranceCompany, "text", true, "otherVehicle", "insuranceCompany")} {renderCommonInput("trust.report.trust.ovDriverNameLabel", "driverName", formData.otherVehicle.driverName, "text", true, "otherVehicle", "driverName")} {renderCommonInput("trust.report.trust.ovDriverAddressLabel", "driverAddress", formData.otherVehicle.driverAddress, "text", true, "otherVehicle", "driverAddress")} {renderCommonInput("trust.report.trust.ovLicenseNumberLabel", "licenseNumber", formData.otherVehicle.licenseNumber, "text", true, "otherVehicle", "licenseNumber")} <div className="md:col-span-2 lg:col-span-3"> {renderCommonInput("trust.report.trust.ovDamageDescriptionLabel", "damageDescription", formData.otherVehicle.damageDescription, "textarea", true, "otherVehicle", "damageDescription")} </div> </div>);
    const renderWitnessesAndPoliceInfo = () => (<div className="space-y-6"> <div> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("trust.report.trust.witnessesTitle")}</h3> {(formData.witnesses || []).map((witness, index) => (<div key={`wit-${index}`} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-3 border dark:border-gray-600"> <div className="flex justify-between items-center mb-2"> <h4 className="text-md font-medium text-gray-600 dark:text-gray-300">{t('trust.report.trust.witnessItemTitle', { index: index + 1 })}</h4> <button type="button" onClick={() => removeArrayItem('witnesses', index)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={isSubmitting}>{t('deleteButton')}</button> </div> <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-2"> {renderCommonInput("trust.report.trust.witnessNameLabel", "name", witness.name, "text", true, null, null, "witnesses", index, "name")} {renderCommonInput("trust.report.trust.witnessAddressLabel", "address", witness.address, "text", true, null, null, "witnesses", index, "address")} {renderCommonInput("trust.report.trust.witnessPhoneLabel", "phone", witness.phone, "tel", true, null, null, "witnesses", index, "phone")} </div> </div>))} <button type="button" onClick={() => addArrayItem('witnesses', { name: '', address: '', phone: '' })} className="mt-1 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" disabled={isSubmitting}> {t('trust.report.trust.addWitnessButton')} </button> </div> <div className="pt-4 border-t dark:border-gray-600"> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("trust.report.trust.policeReportTitle")}</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("trust.report.trust.policeReportDateLabel", "reportDate", formData.policeReport.reportDate, "date", true, "policeReport", "reportDate")} {renderCommonInput("trust.report.trust.policeAuthorityLabel", "authority", formData.policeReport.authority, "text", true, "policeReport", "authority")} </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3"> {renderCommonInput("trust.report.trust.sketchDrawnLabel", "sketchDrawn", formData.policeReport.sketchDrawn, "checkbox", false, "policeReport", "sketchDrawn")} {renderCommonInput("trust.report.trust.officersPresentLabel", "officersPresent", formData.policeReport.officersPresent, "checkbox", false, "policeReport", "officersPresent")} </div> </div> </div>);
    const renderNarrationAndDeclarationInfo = () => (<div className="space-y-6"> {renderCommonInput("trust.report.trust.narrationLabel", "narration", formData.narration, "textarea", true, null, "narration")} {renderCommonInput("trust.report.trust.signatureLabel", "signature", formData.signature, "text", true, null, "signature")} <div className="pt-4 border-t dark:border-gray-600"> <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("trust.report.trust.declarationTitle")}</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {renderCommonInput("trust.report.trust.declarerNameLabel", "declarerName", formData.declaration.declarerName, "text", true, "declaration", "declarerName")} {renderCommonInput("trust.report.trust.declarationDateLabel", "declarationDate", formData.declaration.declarationDate, "date", true, "declaration", "declarationDate")} {renderCommonInput("trust.report.trust.reviewerNameLabel", "reviewerName", formData.declaration.reviewerName, "text", true, "declaration", "reviewerName")} {renderCommonInput("trust.report.trust.reviewerSignatureLabel", "reviewerSignature", formData.declaration.reviewerSignature, "text", true, "declaration", "reviewerSignature")} {renderCommonInput("trust.report.trust.reviewDateLabel", "reviewDate", formData.declaration.reviewDate, "date", true, "declaration", "reviewDate")} </div> </div> </div>);

    const modalTitleText = t('trust.report.trust.modalTitle');
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
                            {currentStep === 1 && renderAccidentDetailsInfo()}
                            {currentStep === 2 && renderInsuredVehicleInfo()}
                            {currentStep === 3 && renderDriverDetailsInfo()}
                            {currentStep === 4 && renderDamagesInfo()}
                            {currentStep === 5 && renderOtherVehicleInfo()}
                            {currentStep === 6 && renderWitnessesAndPoliceInfo()}
                            {currentStep === 7 && renderNarrationAndDeclarationInfo()}
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-between items-center border-t dark:border-gray-700 sticky bottom-0 bg-[rgb(255,255,255)] dark:bg-navbarBack z-10">
                        <button type="button" onClick={handleBack} className={`px-4 py-2 text-sm rounded-md shadow-sm ${currentStep === 1 || isSubmitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-600 dark:text-gray-500' : 'text-gray-700 bg-[rgb(255,255,255)] border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600'}`} disabled={currentStep === 1 || isSubmitting}> {t('backButton')} </button>
                        {currentStep === 7 ? (
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

export default InsuranceTrustRep;