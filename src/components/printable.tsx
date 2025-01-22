import React from 'react';

interface Record {
  id: number;
  description: string;
  originalAmount: number;
  date: string;
  currency: string;
  amountInINR: number;
}

interface PrintableEntriesProps {
  data: Record[];
}

const PrintableEntries: React.FC<PrintableEntriesProps> = ({ data }) => {
  return (
    <div>
      <h1>Transaction Records</h1>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Amount in INR</th>
          </tr>
        </thead>
        <tbody>
          {data.map(record => (
            <tr key={record.id}>
              <td>{record.description}</td>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td>{record.originalAmount.toFixed(2)}</td>
              <td>{record.currency}</td>
              <td>{record.amountInINR.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrintableEntries;