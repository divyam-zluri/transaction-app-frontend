import React, { useState, ChangeEvent, FormEvent } from 'react';
import { TiUpload } from "react-icons/ti";
import toast from 'react-hot-toast';

interface UploadCSVFormProps {
  onClose: () => void;
}

export default function UploadCSVForm({ onClose }: UploadCSVFormProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/api/uplaodCSV', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('CSV uploaded successfully!');
        toast.success(result.warnings.length !== 0 ? 'Some records skipped due to errors' : 'All records uploaded successfully');
        if(result.warnings.length !== 0) console.log(result.warnings);  
        onClose(); // Close the modal on success
      } else {
        console.error('Failed to upload CSV:', response);
        toast.error(`Failed to upload CSV : ${result.message}`);
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('An error occurred while uploading the CSV');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg">
      <h2 className="text-lg font-bold mb-4 text-center">Upload CSV</h2>
      <div className="mb-4 flex flex-col items-center">
        <label className="block text-gray-700 mb-2" htmlFor="file">Select CSV File</label>
        <div className="flex items-center justify-center">
          <input
            type="file"
            name="file"
            accept=".csv"
            onChange={handleFileChange}
            required
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <TiUpload className="text-4xl my-3 hover:text-5xl hover:bg-teal hover:rounded-lg hover:px-1 transition duration-300" />
          </label>
          {file && <span className="ml-4">{file.name}</span>}
        </div>
      </div>
      <div className="flex flex-rown justify-center">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg mr-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-teal-600 text-black bg-teal rounded-lg"
        >
          Upload
        </button>
      </div>
    </form>
  );
}