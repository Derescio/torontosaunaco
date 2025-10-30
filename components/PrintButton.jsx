"use client";
import React from "react";

const PrintButton = () => {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium text-gray-800 hover:bg-slate-50"
    >
      Print this page
    </button>
  );
};

export default PrintButton;
