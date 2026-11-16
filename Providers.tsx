"use client";
import { Toaster } from "react-hot-toast";
import React from "react";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            fontSize: "14px",
            fontWeight: 500,
            borderRadius: "12px",
            padding: "12px 16px",
            background: "#0f172a",
            color: "#f8fafc",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.25)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#f43f5e",
              secondary: "#ffffff",
            },
          },
        }}
      />
      {children}
    </>
  );
};

export default Providers;
