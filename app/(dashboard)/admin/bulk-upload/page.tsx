"use client";
import DashboardSidebar from "@/components/DashboardSidebar";
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
Bose QuietComfort Wireless Headphones,249,Bose,18,headphones 1.png,Comfortable over-ear Bluetooth headphones with quiet mode and 24-hour battery,bose-quietcomfort-headphones,headphones
Asus VivoBook 14 Everyday Laptop,599,Asus,12,laptop 1.webp,Lightweight 14-inch Full HD laptop with 16GB RAM and 512GB SSD,asus-vivobook-14-laptop,laptops`;
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
    <div className="bg-canvas min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900">
                CSV Bulk Upload
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Import dozens of products in seconds using a standardized CSV template.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white hover:bg-canvas px-4 py-2.5 text-xs font-bold text-stone-700 shadow-sm"
            >
              <FaDownload className="text-teal-700" />
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
                ? "border-teal-600 bg-teal-50/50"
                : "border-stone-200 hover:border-teal-300"
            }`}
          >
            <FaFileUpload className="text-4xl text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-stone-800 mb-1">
              {file
                ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)`
                : "Drop your CSV file here, or browse"}
            </p>
            <p className="text-xs text-stone-500 mb-5">
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
                className="cursor-pointer rounded-xl border border-stone-200 bg-white hover:bg-canvas px-5 py-2.5 text-xs font-bold text-stone-700"
              >
                Select CSV File
              </label>
              {file && (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white px-6 py-2.5 text-xs font-bold"
                >
                  {uploading ? "Importing..." : "Import Products Now"}
                </button>
              )}
            </div>
          </div>

          {uploadResult && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-stone-900">
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

          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-stone-900 mb-4">
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
