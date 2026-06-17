import React from 'react';

interface FormAlertProps {
  message: string;
  type?: 'error' | 'success';
}

export const FormAlert: React.FC<FormAlertProps> = ({ message, type = 'error' }) => {
  if (!message) return null;

  const styles = type === 'error' 
    ? 'bg-red-50 border border-red-200 text-red-700' 
    : 'bg-green-50 border border-green-200 text-green-700';

  return (
    <div className={`p-3 rounded text-sm font-medium ${styles}`}>
      {message}
    </div>
  );
};