import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { currencies } from '../utils/currencies'; // Import currencies list

interface Record {
  id: number;
  description: string;
  originalAmount: number;
  date: string;
  currency: string;
  amountInINR: number;
}

export default function Home() {
  const [data, setData] = useState<Record[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null); // Track record being edited
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, [page, limit, location.pathname]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}?page=${page}&limit=${limit}`);
      const result = await response.json();
      toast.success('Data fetched successfully');
      setData(result.transactions);
      setTotalPages(Math.ceil(result.pages));
    } catch (error) {
      toast.error('Error fetching data');
      console.error('Error fetching data:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(e.target.value, 10));
    setPage(1); // Reset to first page when limit changes
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${process.env.BASE_URL}/soft-delete/${id}`, { method: 'PUT' });
      toast.success('Record deleted successfully');
      fetchData(); // Refresh data after deletion
    } catch (error) {
      toast.error('Error deleting record');
      console.error('Error deleting record:', error);
    }
  };

  const handleEditStart = (record: Record) => {
    setEditingRecord(record); // Set the record to be edited
  };

  const handleEditSave = async () => {
    if (!editingRecord) return;

    // Ensure date is formatted as yyyy-mm-dd
    const formattedDate = new Date(editingRecord.date).toISOString().split('T')[0];

    const updatedData = {
      description: editingRecord.description,
      date: formattedDate,
      originalAmount: editingRecord.originalAmount,
      currency: editingRecord.currency,
    };

    try {
      const response = await fetch(`${process.env.BASE_URL}/update-transaction/${editingRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        toast.success('Record updated successfully');
        fetchData(); // Refresh data after update
        setEditingRecord(null); // Exit edit mode
      } else {
        const errorDetails = await response.json();
        console.error('Error updating record:', errorDetails);
        toast.error(`Error updating record: ${errorDetails.message || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Error updating record');
      console.error('Error updating record:', error);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-darkText font-playwrite-in">Transaction Records</h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-pink">
            <div className="flex items-center">
              <label htmlFor="limit" className="mr-2 text-sm font-medium text-darkText">Records per page:</label>
              <select
                id="limit"
                value={limit}
                onChange={handleLimitChange}
                className="border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`p-2 rounded-full bg-teal text-darkText hover:bg-tealDark hover:text-white disabled:opacity-50 ${page === 1 ? 'opacity-50' : ''}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-darkText">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`p-2 rounded-full bg-teal text-darkText hover:bg-tealDark hover:text-white disabled:opacity-50 ${page === totalPages ? 'opacity-50' : ''}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-pink">
                <tr>
                  {['Description', 'Date', 'Amount', 'Currency', 'Amount in INR', 'Actions'].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-darkText uppercase tracking-wider">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map(record => (
                  <tr key={record.id} className="hover:bg-pink transition duration-150 ease-in-out">
                    {editingRecord?.id === record.id ? (
                      <>
                        {/* Editable Row */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input
                            type="text"
                            value={editingRecord.description}
                            onChange={(e) => setEditingRecord({ ...editingRecord, description: e.target.value })}
                            className="border border-gray-300 rounded-md px-2 py-1 w-full"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input
                            type="date"
                            value={new Date(editingRecord.date).toISOString().split('T')[0]}
                            onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                            className="border border-gray-300 rounded-md px-2 py-1 w-full"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input
                            type="number"
                            value={editingRecord.originalAmount}
                            onChange={(e) => setEditingRecord({ ...editingRecord, originalAmount: parseFloat(e.target.value) })}
                            className="border border-gray-300 rounded-md px-2 py-1 w-full"
                          />
                        </td>
                        {/* Dropdown for Currency */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <select
                            value={editingRecord.currency}
                            onChange={(e) => setEditingRecord({ ...editingRecord, currency: e.target.value })}
                            className="border border-gray-300 rounded-md px-2 py-1 w-full"
                          >
                            {currencies.map(([currencyCode]) => (
                              <option key={currencyCode} value={currencyCode}>
                                {currencyCode}
                              </option>
                            ))}
                          </select>
                        </td>
                        {/* Non-editable Amount in INR */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkText">
                          {editingRecord.amountInINR.toFixed(2)}
                        </td>
                        {/* Save Button */}
                        <td colSpan={2}>
                          <button onClick={handleEditSave} className="bg-teal px-4 py-2 rounded-md text-white hover:bg-tealDark">Save</button>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Non-editable Row */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkText">{record.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkText">{record.originalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.currency}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkText">{record.amountInINR.toFixed(2)}</td>
                        {/* Action Buttons */}
                        <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                          {/* Edit Button */}
                          <button onClick={() => handleEditStart(record)} className="text-blue-500 hover:text-blue-700">
                            <Edit2 />
                          </button>
                          {/* Delete Button */}
                          <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
