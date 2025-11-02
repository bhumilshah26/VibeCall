import React from 'react';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4 relative z-[10000] shadow-2xl shadow-gray-900/20 dark:shadow-gray-950/50 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
          >
            {cancelText || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 font-medium shadow-lg shadow-indigo-600/20 dark:shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-600/30 dark:hover:shadow-indigo-500/30 hover:-translate-y-0.5"
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog; 