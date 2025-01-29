import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Trash2, Search, XCircle, ChartColumnBig, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactDOMServer from 'react-dom/server';
import { useLocation } from 'react-router-dom';
import { currencies } from '../utils/currencies'; // Import currencies list
import EntriesDropdown from '../components/entriesDropdown'; // Import the EntriesDropdown component
import TransactionChart from '../components/transactionChart'; // Import the TransactionChart component
import PrintableEntries from '../components/printable';
import { BarLoader } from '../components/barLoader'; // Import BarLoader component

const BASE_URL = import.meta.env.VITE_BASE_URL;

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
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]); // Track selected records
  const [searchCriteria, setSearchCriteria] = useState('description');
  const [searchValue, setSearchValue] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false); // Track if search is active
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [chartData, setChartData] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false); // Track loading state
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, [page, limit, location.pathname, isSearchActive]);

  const fetchData = async () => {
    setLoading(true); // Start loading
    try {
      const url = isSearchActive
        ? `${BASE_URL}/search?${searchCriteria}=${searchValue}&page=${page}&limit=${limit}&isDeleted=${false}`
        : `${BASE_URL}?page=${page}&limit=${limit}&isDeleted=${false}`;
      const response = await fetch(url);
      const result = await response.json();
      toast.success(result.message || 'Data fetched successfully');
      setData(result.transactions || []);
      setTotalPages(result.pages || 1);
    } catch (error) {
      toast.error('Error fetching data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // End loading
    }
  };
  const handleOpenChart = () => {
    setChartData(data);
    setIsChartOpen(true);
  };

  const handleCloseChart = () => {
    setIsChartOpen(false);
  };

  const handlePrintEntries = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printableContent = ReactDOMServer.renderToString(<PrintableEntries data={data} />);
      printWindow.document.write('<html><head><title>Print Transactions</title></head><body>');
      printWindow.document.write(printableContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
  
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      toast.error('Failed to open print window');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setSelectedRecords([]); // Clear selected records when page changes
      setPage(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${BASE_URL}/soft-delete/${id}`, { method: 'PUT' });
      toast.success('Record deleted successfully');
      fetchData(); // Refresh data after deletion
    } catch (error) {
      toast.error('Error deleting record');
      console.error('Error deleting record:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await fetch(`${BASE_URL}/delete-selected?isDeleted=${true}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRecords }),
      });

      if (response.ok) {
        toast.success('Selected records deleted successfully');
        setSelectedRecords([]);
        fetchData(); // Refresh data after deletion
      } else {
        const errorDetails = await response.json();
        toast.error(`Error deleting selected records: ${errorDetails.message || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Error deleting selected records');
      console.error('Error deleting selected records:', error);
    }
  };

  const handleEditStart = (record: Record) => {
    setEditingRecord(record); // Set the record to be edited
  };

  const handleEditSave = async () => {
    if (!editingRecord) return;

    // Ensure date is formatted as yyyy-mm-dd
    const date = new Date(editingRecord.date);
    if (isNaN(date.getTime())) {
      toast.error('Invalid date');
      return;
    }
    const formattedDate = date.toISOString().split('T')[0];

    const updatedData = {
      description: editingRecord.description.trim().normalize('NFKD').replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim(),
      date: formattedDate,
      originalAmount: editingRecord.originalAmount,
      currency: editingRecord.currency,
    };

    try {
      const response = await fetch(`${BASE_URL}/update-transaction/${editingRecord.id}`, {
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
      const response = await fetch(`${BASE_URL}/download`);
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

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a value to search');
      return;
    }

    setPage(1); // Reset to first page when search is performed
    setIsSearchActive(true); // Set search active state
    fetchData();
  };

  const handleCancelSearch = () => {
    setSearchCriteria('description');
    setSearchValue('');
    setIsSearchActive(false);
    setPage(1); // Reset to first page when search is canceled
  };

  const handleSelectRecord = (id: number) => {
    setSelectedRecords(prev =>
      prev.includes(id) ? prev.filter(recordId => recordId !== id) : [...prev, id]
    );
  };

  const renderSearchInput = () => {
    switch (searchCriteria) {
      case 'date':
        return (
          <input
            type="date"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            required
            min = {new Date('1990-01-01').toISOString().split('T')[0]}
            max = {new Date().toISOString().split('T')[0]}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-teal focus:border-teal transition-all duration-200"
            onKeyDown={(e) => e.preventDefault()} // Disable typing in date field
          />
        );
      case 'currency':
        return (
          <select
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-teal focus:border-teal transition-all duration-200"
          >
            <option value="" disabled>Select Currency</option> {/* Placeholder option */}
            {currencies.map(([currencyCode]) => (
              <option key={currencyCode} value={currencyCode}>
                {currencyCode}
              </option>
            ))}
          </select>
        );
      case 'amount':
        return (
          <input
            type="number"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-teal focus:border-teal transition-all duration-200"
          />
        );
      case 'description':
      default:
        return (
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-teal focus:border-teal transition-all duration-200"
          />
        );
    }
  };

  return (
    <div className="min-h-screen py-8 bg-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-darkText font-playwrite-in">Transaction Records</h1>
        <div className="flex justify-center mb-8">
          <div className="relative flex items-center w-full max-w-2xl space-x-2">
            {renderSearchInput()}
            <select
              value={searchCriteria}
              onChange={(e) => {
                setSearchCriteria(e.target.value);
                setSearchValue(''); // Clear search value when criteria changes
              }}
              className="border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-teal focus:border-teal transition-all duration-200"
            >
              <option value="description">Description</option>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="currency">Currency</option>
            </select>
            <button
              onClick={handleSearch}
              className="p-2 rounded-full bg-teal text-darkText hover:bg-tealDark hover:text-white transition duration-300"
            >
              <Search className="w-5 h-5" />
            </button>
            {isSearchActive && (
              <button
                onClick={handleCancelSearch}
                className="p-2 rounded-full bg-red-500 text-white hover:bg-red-700 transition duration-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center bg-tealLight">
            <div className="flex items-center mb-4 sm:mb-0">
              <EntriesDropdown limit={limit} handleLimitChange={handleLimitChange} />
              <button onClick={handleOpenChart} className="ml-4 p-2 rounded-full bg-teal text-darkText hover:bg-tealDark hover:text-white transition duration-300">
                <ChartColumnBig className="w-5 h-5"/>
              </button>
              <button onClick={handlePrintEntries} className="ml-4 p-2 rounded-full bg-teal text-darkText hover:bg-tealDark hover:text-white transition duration-300">
                <Printer className="w-5 h-5"/>
              </button>
            </div>
            <div className="flex items-center space-x-4 ml-auto">
              {selectedRecords.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-700 transition duration-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                className="rounded-2xl border-2 border-dashed border-black bg-tealLight hover:bg-teal px-6 py-3 font-semibold uppercase text-black transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none"
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
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <BarLoader/>
              </div>
            ) : data.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-lg text-gray-500">No data available</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-tealLight">
                  <tr>
                    <th className="px-6 py-3 text-left text-s font-semibold text-darkText uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecords(data.map(record => record.id));
                          } else {
                            setSelectedRecords([]);
                          }
                        }}
                        checked={selectedRecords.length === data.length}
                      />
                    </th>
                    {['Description', 'Date', 'Amount', 'Currency', 'Amount in INR', 'Actions'].map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-s font-semibold text-darkText uppercase tracking-wider">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map(record => (
                    <tr key={record.id} className="hover:bg-lightPink transition duration-150 ease-in-out group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <input
                          type="checkbox"
                          checked={selectedRecords.includes(record.id)}
                          onChange={() => handleSelectRecord(record.id)}
                        />
                      </td>
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
                              onFocus={(e) => e.target.removeAttribute('readonly')}
                              onBlur={(e) => e.target.setAttribute('readonly', 'true')}
                              readOnly
                              onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                              required
                              min={new Date('1990-01-01').toISOString().split('T')[0]}
                              max={new Date().toISOString().split('T')[0]}
                              className="border border-gray-300 rounded-md px-2 py-1 w-full"
                              onKeyDown={(e) => e.preventDefault()} // Disable typing in date field
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString('en-GB')}
                          </td>
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
            )}
          </div>
        </div>
        {isChartOpen && <TransactionChart data={chartData} onClose={handleCloseChart} />}
      </div>
    </div>
  );
}