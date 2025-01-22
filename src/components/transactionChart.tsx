import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

interface TransactionChartProps {
  data: any[];
  onClose: () => void;
}

const TransactionChart: React.FC<TransactionChartProps> = ({ data, onClose }) => {
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString(), // Format the date
  }));

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-11/12 max-w-4xl">
        <button onClick={onClose} className="text-red-500 hover:text-red-700 float-right">Close</button>
        <BarChart
          series={[
            { data: formattedData.map((item) => item.amountInINR) },
          ]}
          height={400}
          xAxis={[{ data: formattedData.map((item) => item.date), scaleType: 'band' }]}
          yAxis={[
            {
              scaleType: 'linear',
              valueFormatter: (value) =>
                `₹${value.toLocaleString('en-IN')}`, // Format as Indian Rupee with thousands separator
            },
          ]}
          margin={{ top: 20, bottom: 30, left: 60, right: 10 }} // Adjust left margin for longer labels
        />
      </div>
    </div>
  );
};

export default TransactionChart;
