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
            borderRadius: "14px",
            padding: "12px 16px",
            background: "#292524",
            color: "#fafaf9",
            border: "1px solid #44403c",
            boxShadow: "0 10px 25px -5px rgba(28, 25, 23, 0.2)",
          },
          success: {
            iconTheme: {
              primary: "#14b8a6",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#fb7185",
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
