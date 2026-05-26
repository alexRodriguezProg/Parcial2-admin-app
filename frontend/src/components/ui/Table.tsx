import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children }) => {
  return (
    <div className="overflow-x-auto w-full border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white text-gray-900">
          {children}
        </tbody>
      </table>
    </div>
  );
};