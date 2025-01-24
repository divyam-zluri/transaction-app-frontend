import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, XCircle, ChartColumnBig, Printer, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactDOMServer from 'react-dom/server';
import { useLocation } from 'react-router-dom';
import { currencies } from '../utils/currencies'; // Import currencies list
import EntriesDropdown from '../components/entriesDropdown'; // Import the EntriesDropdown component
import TransactionChart from '../components/transactionChart'; // Import the TransactionChart component
import PrintableEntries from '../components/printable';

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface Record {
  id: number;
  description: string;
  originalAmount: number;
  date: string;
  currency: string;
  amountInINR: number;
}

export default function Restore() {
  const [data, setData] = useState<Record[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]); // Track selected records
  const [searchCriteria, setSearchCriteria] = useState('description');
  const [searchValue, setSearchValue] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false); // Track if search is active
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [chartData, setChartData] = useState<Record[]>([]);
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, [page, limit, location.pathname, isSearchActive]);

  const fetchData = async () => {
    try {
      const url = isSearchActive
        ? `${BASE_URL}/search?${searchCriteria}=${searchValue}&page=${page}&limit=${limit}&isDeleted=${true}`
        : `${BASE_URL}?page=${page}&limit=${limit}&isDeleted=${true}`;
      const response = await fetch(url);
      const result = await response.json();
      toast.success(result.message || 'Data fetched successfully');
      setData(result.transactions || []);
      setTotalPages(result.pages || 1);
    } catch (error) {
      toast.error('Error fetching data');
      console.error('Error fetching data:', error);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await fetch(`${BASE_URL}/restore/${id}`, { method: 'PUT' });
      toast.success('Record restored successfully');
      fetchData(); // Refresh data after restoration
    } catch (error) {
      toast.error('Error restoring record');
      console.error('Error restoring record:', error);
    }
  };

  const handleBulkRestore = async () => {
    try {
      const response = await fetch(`${BASE_URL}/delete-selected?isDeleted=${false}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRecords }),
      });

      if (response.ok) {
        toast.success('Selected records restored successfully');
        setSelectedRecords([]);
        fetchData(); // Refresh data after restoration
      } else {
        const errorDetails = await response.json();
        toast.error(`Error restoring selected records: ${errorDetails.message || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Error restoring selected records');
      console.error('Error restoring selected records:', error);
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

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a value to search');
      return;
    }

    setPage(1); // Reset to first page when search is performed
    setIsSearchActive(true); // Set search active state
    fetchData();
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
            max={new Date().toISOString().split('T')[0]}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-teal focus:border-teal transition-all duration-200"
          />
        );
      case 'currency':
        return (
          <select
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-teal focus:border-teal transition-all duration-200"
          >
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
        <h1 className="text-4xl font-bold mb-8 text-center text-darkText font-playwrite-in">Restore Records</h1>
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
                onClick={handleBulkRestore}
                className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-700 transition duration-300"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
              )}
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
            {data.length === 0 ? (
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
                      <td className="px-6 py-4 whitespace-normal text-sm text-darkText">{record.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-darkText">{record.originalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.currency}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-darkText">{record.amountInINR.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        {/* Restore Button */}
                        <button onClick={() => handleRestore(record.id)} className="text-green-500 hover:text-green-700">
                            <RefreshCcw className=" text-blue-500 hover:text-blue-700"/>
                        </button>
                      </td>
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