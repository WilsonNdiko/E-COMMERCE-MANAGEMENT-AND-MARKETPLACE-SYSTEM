"use client";
import { DashboardSidebar } from "@/components";
import BulkUploadHistory from "@/components/BulkUploadHistory";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  FaFileUpload,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

interface UploadResult {
  message: string;
  batchId: string;
  status: string;
  summary: {
    total: number;
    created: number;
    failed: number;
  };
}

const BulkUploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectCsv = (selectedFile: File) => {
    if (
      selectedFile.type === "text/csv" ||
      selectedFile.name.toLowerCase().endsWith(".csv")
    ) {
      setFile(selectedFile);
      setUploadResult(null);
    } else {
      toast.error("Please select a .csv file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/bulk-upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setUploadResult(data);
        toast.success(
          `Uploaded! ${data.summary?.created ?? 0} product(s) imported.`
        );
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setHistoryKey((k) => k + 1);
      } else {
        toast.error(data.error || "Failed to upload CSV");
      }
    } catch (_) {
      toast.error("Network error uploading CSV");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `title,price,manufacturer,inStock,mainImage,description,slug,categoryId
Wireless ANC Headphones,199,Sony,25,product3.webp,Premium wireless noise-cancelling headphones,wireless-anc-headphones-demo,4c2cc9ec-7504-4b7c-8ecd-2379a854a423
UltraSlim Mechanical Keyboard,129,Logitech,15,product7.webp,Low-profile tactile mechanical keyboard,ultraslim-mechanical-keyboard-demo,a6896b67-197c-4b2a-b5e2-93954474d8b4`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "singitronic-bulk-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("CSV template downloaded!");
  };

  return (
    <div className="bg-slate-50 min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                CSV Bulk Upload
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Import dozens of products in seconds using a standardized CSV template.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm"
            >
              <FaDownload className="text-blue-600" />
              <span>Download CSV Template</span>
            </button>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files?.[0])
                selectCsv(e.dataTransfer.files[0]);
            }}
            className={`bg-white rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50/50"
                : "border-slate-200 hover:border-blue-300"
            }`}
          >
            <FaFileUpload className="text-4xl text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800 mb-1">
              {file
                ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)`
                : "Drop your CSV file here, or browse"}
            </p>
            <p className="text-xs text-slate-500 mb-5">
              Columns: title, price, manufacturer, inStock, mainImage, description, slug, categoryId
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files?.[0]) selectCsv(e.target.files[0]);
              }}
              className="hidden"
              id="csv-upload"
            />
            <div className="flex items-center justify-center gap-3">
              <label
                htmlFor="csv-upload"
                className="cursor-pointer rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700"
              >
                Select CSV File
              </label>
              {file && (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 text-xs font-bold"
                >
                  {uploading ? "Importing..." : "Import Products Now"}
                </button>
              )}
            </div>
          </div>

          {uploadResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                {uploadResult.summary.failed === 0 ? (
                  <FaCheckCircle className="text-emerald-600 text-base" />
                ) : (
                  <FaTimesCircle className="text-amber-500 text-base" />
                )}
                <span>{uploadResult.message}</span>
              </div>
              <div className="flex gap-4 font-semibold">
                <span>Total: {uploadResult.summary.total}</span>
                <span className="text-emerald-600">
                  Created: {uploadResult.summary.created}
                </span>
                <span className="text-rose-600">
                  Failed: {uploadResult.summary.failed}
                </span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4">
              Import History
            </h2>
            <BulkUploadHistory key={historyKey} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadPage;
