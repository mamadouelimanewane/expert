"use client";

import React, { useState } from 'react';
import { UploadCloud, FileType, X, Check } from 'lucide-react';

export function ImportBalance({ year }: { year: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Balance {year}
                </h3>
                {file ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <Check size={14} /> Chargée
                    </span>
                ) : (
                    <span className="text-xs text-slate-500">En attente</span>
                )}
            </div>

            <div
                className={`relative flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${dragActive
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 z-50 h-full w-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    accept=".xlsx,.xls,.csv"
                />

                {file ? (
                    <div className="z-10 flex flex-col items-center">
                        <div className="flex items-center justify-center rounded-full bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                            <FileType className="h-6 w-6" />
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                            {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                            {(file.size / 1024).toFixed(2)} KB
                        </p>
                        <button
                            onClick={(e) => { e.preventDefault(); setFile(null); }}
                            className="mt-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                        >
                            Retirer le fichier
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400 dark:bg-slate-800">
                            <UploadCloud className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Glissez-déposez le fichier Excel ici
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            ou cliquez pour parcourir (.xlsx, .xls)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
