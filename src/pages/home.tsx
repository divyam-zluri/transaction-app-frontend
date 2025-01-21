import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { currencies } from '../utils/currencies'; // Import currencies list
import EntriesDropdown from '../components/entriesDropdown'; // Import the EntriesDropdown component

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

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
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

  const handleEditCancel = () => {
    setEditingRecord(null); // Exit edit mode without saving
  };

  const downloadCSV = async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
    } catch (error) {
      toast.error('Error downloading CSV');
      console.error('Error downloading CSV:', error);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-darkText font-playwrite-in">Transaction Records</h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-tealLight">
            <div className="flex items-center">
              <EntriesDropdown limit={limit} handleLimitChange={handleLimitChange} />
            </div>
            <div className="flex items-center space-x-2 ml-auto">
              <button
                className="rounded-2xl border-2 border-dashed border-black bg-tealLight hover:bg-teal px-6 py-3 font-semibold uppercase text-black transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none mr-4"
                onClick={downloadCSV}
              >
                Export CSV
              </button>
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
          </div>
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-tealLight">
                <tr>
                  {['Description', 'Date', 'Amount', 'Currency', 'Amount in INR', 'Actions'].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-s font-semibold text-darkText uppercase tracking-wider">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map(record => (
                  <tr key={record.id} className="hover:bg-lightPink transition duration-150 ease-in-out group">
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
                        {/* Save and Cancel Buttons */}
                        <td colSpan={2} className="flex space-x-2 my-2">
                          <button onClick={handleEditSave} className="bg-teal px-4 py-2 rounded-md text-black hover:text-white hover:bg-tealDark">Save</button>
                          <button onClick={handleEditCancel} className="bg-teal px-4 py-2 rounded-md text-black hover:text-white hover:bg-tealDark">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Non-editable Row */}
                        <td className="px-6 py-4 whitespace-normal text-sm text-darkText">{record.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkText">{record.originalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.currency}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkText">{record.amountInINR.toFixed(2)}</td>
                        {/* Action Buttons */}
                        <td className="px-6 py-4 whitespace-nowrap flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
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