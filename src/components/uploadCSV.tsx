import { useState, ChangeEvent, FormEvent } from 'react';
import { TiUpload } from "react-icons/ti";
import toast from 'react-hot-toast';
import { BarLoader } from './barLoader';

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface UploadCSVFormProps {
  onClose: () => void;
}

export default function UploadCSVForm({ onClose }: UploadCSVFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true); // Set loading state to true

    try {
      const response = await fetch(`${BASE_URL}/uploadCSV`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('CSV uploaded successfully!');
        if (result.warnings.length > 0) {
          if (result.warnings.length <= 5) {
            result.warnings.forEach((warning: string) => toast.error(warning));
          } else {
            const blob = new Blob([result.warnings.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'warnings.txt';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Some records skipped due to errors. Downloading warnings...');
          }
        } else {
          toast.success('All records uploaded successfully');
        }
        onClose(); // Close the modal on success
      } else {
        console.error('Failed to upload CSV:', response);
        toast.error(`Failed to upload CSV: ${result.message} ${result.error? ', '+result.error : ''}`);
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('An error occurred while uploading the CSV');
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-cream p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-darkText">Upload CSV</h2>
      <div className="mb-4 flex flex-col items-center">
        <label className="block text-darkText mb-2" htmlFor="file">Select CSV File</label>
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
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col justify-center items-center">
            <div className="p-4 rounded-full border-2 border-dashed border-tealDark hover:border-teal transition duration-300">
              <TiUpload className="text-4xl text-teal hover:text-tealDark transition duration-300" />
            </div>
          </label>
          {file && (
            <span className="ml-4 text-darkText truncate max-w-[10rem]" title={file.name}>
              {file.name}
            </span>
          )}
        </div>
        <div>
          Click on the icon to select a CSV file
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center my-4">
          <BarLoader />
        </div>
      ) : (
        <div className="flex flex-row justify-center">
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
            Upload
          </button>
        </div>
      )}
    </form>
  );
}