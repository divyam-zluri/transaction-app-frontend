import React, { useState } from 'react';
import { currencies } from '../utils/currencies';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface AddTransactionFormProps {
  onClose: () => void;
}

interface FormData {
  description: string;
  originalAmount: number;
  date: string;
  currency: string;
}

export default function AddTransactionForm({ onClose }: AddTransactionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    description: '',
    originalAmount: 1,
    date: '',
    currency: '', // Set default currency to empty
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'originalAmount' ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      description: formData.description.trim().normalize('NFKD').replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim(),
      date: new Date(formData.date).toISOString().split('T')[0], // Format date as yyyy-mm-dd
    };
    try {
      const response = await fetch(`${BASE_URL}/add-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const result  = await response.json();
      if (response.ok) {
        toast.success('Transaction added successfully!');
        setFormData({
          description: '',
          originalAmount: 1,
          date: '',
          currency: '', // Reset currency to empty
        });
        onClose(); // Close the modal on success
      } else {
        toast.error(`${result.message}`);
      }
    } catch (error) {
      toast.error('Error adding transaction. Please try again later.');
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-cream p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-darkText">Add New Transaction</h2>
      <div className="mb-4">
        <label className="block text-darkText mb-2" htmlFor="description">Description</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:ring-2 focus:ring-teal focus:border-teal transition-all duration-200"
        />
      </div>
      <div className="mb-4">
        <label className="block text-darkText mb-2" htmlFor="originalAmount">Amount</label>
        <input
          type="number"
          name="originalAmount"
          value={formData.originalAmount}
          onChange={handleChange}
          min={0.0001}
          step='any'
          required
          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:ring-2 focus:ring-teal focus:border-teal transition-all duration-200"
        />
      </div>
      <div className="mb-4">
        <label className="block text-darkText mb-2" htmlFor="currency">Currency</label>
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:ring-2 focus:ring-teal focus:border-teal transition-all duration-200"
        >
          <option value="" disabled>Select currency</option> {/* Add a placeholder option */}
          {currencies.map(([code]) => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-darkText mb-2" htmlFor="date">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          min = {new Date('1990-01-01').toISOString().split('T')[0]}
          max={new Date().toISOString().split('T')[0]} // Set max date to today
          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:ring-2 focus:ring-teal focus:border-teal transition-all duration-200"
          onKeyDown={(e) => e.preventDefault()} // Disable typing in date field
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg mr-2 hover:bg-gray-400 transition duration-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-teal text-darkText rounded-lg hover:bg-tealDark hover:text-white transition duration-300"
        >
          Add
        </button>
      </div>
    </form>
  );
}