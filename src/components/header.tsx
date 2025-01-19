import React, { useState } from 'react';
import icon from '../assets/icon.png';
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Overlay from './overlay';
import AddTransactionForm from './addTransaction';
import UploadCSVForm from './uploadCSV';

interface HeaderProps {
  username: string;
  onRefresh: () => void;
}

export default function Header({ username, onRefresh }: HeaderProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    onRefresh();
    navigate('/');
  };
  const openUpload = () => setUploadOpen(true);
  const closeUpload = () => {
    setUploadOpen(false);
    onRefresh();
    navigate('/');
  };
  const toggleMenu = () => setMenuOpen(!isMenuOpen);

  return (
    <header className={`bg-teal text-darkText p-4 shadow-md ${isMenuOpen ? 'h-auto' : 'h-20'} overflow-hidden`}>
      <div className="container mx-auto flex justify-between items-center h-full">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <img src={icon} alt="App Icon" className="w-10 h-10 rounded-full" />
          <h1 className="text-2xl font-bold font-playwrite-in">Transaction Manager</h1>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-pink duration-500"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <FaTimes className="text-darkText" /> : <FaBars className="text-black" />}
        </button>

        {/* Navigation */}
        <nav className="hidden lg:flex space-x-4">
          <Link
            to="/"
            className="hover:bg-pink hover:rounded-lg hover:text-lg px-4 py-2 duration-500"
          >
            Home
          </Link>
          <button
            onClick={openUpload}
            className="hover:bg-pink hover:rounded-lg hover:text-lg px-4 py-2 duration-500"
          >
            Upload CSV
          </button>
          <button
            onClick={openModal}
            className="hover:bg-pink hover:rounded-lg hover:text-lg px-4 py-2 duration-500"
          >
            Add Transaction
          </button>
        </nav>

        {/* User Section */}
        <div className="hidden lg:flex items-center space-x-4">
          <span className="text-sm">
            Welcome, <strong>{username || 'Guest'}</strong>
          </span>
          <FaUserCircle className="text-3xl" />
          <div className="bg-pink rounded-full px-3 py-2 shadow-md text-sm">
            {username ? 'Logged In' : 'Not Logged In'}
          </div>
        </div>
      </div>

      {/* Dropdown Menu for Mobile */}
      {isMenuOpen && (
        <div className="lg:hidden bg-teal text-darkText p-4">
          <nav className="flex flex-col items-center space-y-4">
            <Link
              to="/"
              className="hover:bg-pink hover:rounded-lg hover:text-lg px-4 py-2 duration-500"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <button
              onClick={() => { openUpload(); toggleMenu(); }}
              className="hover:bg-pink hover:rounded-lg hover:text-lg px-4 py-2 duration-500"
            >
              Upload CSV
            </button>
            <button
              onClick={() => { openModal(); toggleMenu(); }}
              className="hover:bg-pink hover:rounded-lg hover:text-lg px-4 py-2 duration-500"
            >
              Add Transaction
            </button>
            {/* User Section in Dropdown */}
            <div className="flex flex-col items-center space-y-2 mt-4">
              <span className="text-sm">
                Welcome, <strong>{username || 'Guest'}</strong>
              </span>
              <FaUserCircle className="text-3xl" />
              <div className="bg-pink rounded-full px-3 py-2 shadow-md text-sm">
                {username ? 'Logged In' : 'Not Logged In'}
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Modal for Add Transaction */}
      {isModalOpen && (
        <Overlay onClose={closeModal}>
          <AddTransactionForm onClose={closeModal} />
        </Overlay>
      )}
      {/* Modal for Upload CSV */}
      {isUploadOpen && (
        <Overlay onClose={closeUpload}>
          <UploadCSVForm onClose={closeUpload} />
        </Overlay>
      )}
    </header>
  );
}