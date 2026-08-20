import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, X, CheckCircle2, BookOpen, Share2, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { VaultItem } from '../../types';

interface DocumentSummaryModalProps {
  vaultItem: VaultItem;
  onClose: () => void;
  onDownload: (item: VaultItem) => void;
}

interface SummaryData {
  simpleSummary: string;
  extractedMedicines: string[];
  medicalTermsExplained: { term: string; definition: string }[];
  keyTakeaways: string[];
  sharingNote: string;
}

export const DocumentSummaryModal: React.FC<DocumentSummaryModalProps> = ({
  vaultItem,
  onClose,
  onDownload
}) => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/gemini/document-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vaultItem })
        });
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setSummaryData(json.data);
        }
      } catch (err) {
        console.error('Document summary error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, [vaultItem]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                {vaultItem.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">{vaultItem.date}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">
              AI Summary: {vaultItem.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Doctor: {vaultItem.doctorName || 'N/A'} • Tag: {vaultItem.diseaseOrTag}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Generating factual clinical summary & terminology decoder...</p>
          </div>
        )}

        {/* Content */}
        {!loading && summaryData && (
          <div className="space-y-5">
            {/* Plain English Summary */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" /> Summary
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                {summaryData.simpleSummary}
              </p>
            </div>

            {/* Extracted Medicines */}
            {summaryData.extractedMedicines && summaryData.extractedMedicines.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Prescribed / Mentioned Medications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summaryData.extractedMedicines.map((med, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700">
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Terms Explained */}
            {summaryData.medicalTermsExplained && summaryData.medicalTermsExplained.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Medical Terminology Decoder
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {summaryData.medicalTermsExplained.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="font-bold text-slate-800 dark:text-white">{item.term}: </span>
                      <span className="text-slate-600 dark:text-slate-300">{item.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Clinical Takeaways */}
            {summaryData.keyTakeaways && summaryData.keyTakeaways.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Conclusions</h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {summaryData.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Doctor Sharing Note */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 font-medium">
              💡 <span className="font-bold">Sharing Note for Doctors: </span>{summaryData.sharingNote}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onDownload(vaultItem);
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Original Document</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
