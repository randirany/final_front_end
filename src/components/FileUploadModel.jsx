
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from 'react-i18next';

function FileUploadModal({ isOpen, onClose }) {
    const { t } = useTranslation();

    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const dropAreaRef = useRef(null);
    const [fileDescription, setFileDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                if (!isSubmitting) onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose, isSubmitting]);

    useEffect(() => {
        if (!isOpen) {
            setFiles([]);
            setFileDescription("");
            setIsSubmitting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }, [isOpen]);


    if (!isOpen) return null;


    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files);
            setFiles(newFiles);
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles(newFiles);
        }
    };

    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDescriptionChange = (e) => {
        setFileDescription(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            alert(t("fileUploadModal.alerts.selectFile", "Please select at least one file to upload."));
            return;
        }
        setIsSubmitting(true);
        try {
            await onUpload(files, fileDescription);
            onClose();
        } catch (error) {
            console.error("Upload failed:", error);
            alert(t("fileUploadModal.alerts.uploadFailed", "Upload failed. Please try again."));
        } finally {
            setIsSubmitting(false);
        }

    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
            onClick={() => { if (!isSubmitting) onClose(); }}
        >
            <div
                className="w-full max-w-2xl bg-[rgb(255,255,255)] rounded-lg shadow-xl p-6 dark:bg-navbarBack h-[90vh] overflow-y-auto  hide-scrollbar  flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between pb-3 border-b dark:border-gray-700 mb-4">
                    <h2 className="text-xl font-semibold dark:text-[rgb(255,255,255)]">{t("fileUploadModal.title", "Attach File To Customer")}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400" disabled={isSubmitting}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="fileDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("fileUploadModal.labels.description", "File Description")}
                        </label>
                        <input
                            id="fileDescription"
                            type="text"
                            value={fileDescription}
                            onChange={handleDescriptionChange}
                            className="mt-1 w-full p-2.5 border border-gray-300 dark:!border-none dark:bg-gray-700 dark:text-[rgb(255,255,255)] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder={t("fileUploadModal.placeholders.description", "Enter File Description")}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("fileUploadModal.labels.uploadFiles", "Upload File(s)")}
                        </label>
                        <div
                            onClick={handleBrowseClick}
                            ref={dropAreaRef}
                            className={`relative flex cursor-pointer flex-col items-center justify-center h-48 border-2 border-dashed rounded-md transition-colors
                                        ${isDragging
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                                    : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700/30"
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col items-center justify-center space-y-3 text-center p-4">
                                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline" onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}>
                                        {t("fileUploadModal.dropArea.clickToUpload", "Click to upload")}
                                    </span> {t("fileUploadModal.dropArea.orDragAndDrop", "or drag and drop")}
                                </p>
                                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInputChange} />
                            </div>
                        </div>
                        {/* {files.length > 0 && (
                            <div className="mt-3 text-sm dark:text-gray-300">
                                <p className="font-medium">{t("fileUploadModal.labels.selectedFiles", "Selected file(s):")}</p>
                                <ul className="list-disc pl-5 mt-1">
                                    {files.map((file, index) => (
                                        <li key={index} className="truncate" title={file.name}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                                    ))}
                                </ul>
                            </div>
                        )} */}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                            {t("common.cancel", "Cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={files.length === 0 || isSubmitting}
                            className="px-6 py-2 text-sm font-medium text-[rgb(255,255,255)] bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isSubmitting ? t("fileUploadModal.buttons.uploading", "Uploading...") : t("fileUploadModal.buttons.upload", "Upload File(s)")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FileUploadModal;