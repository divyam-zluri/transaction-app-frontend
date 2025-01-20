import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import Overlay from './overlay';
import AddTransactionForm from './addTransaction';
import UploadCSVForm from './uploadCSV';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import icon from '../assets/icon.png';

interface HeaderProps {
  onRefresh: () => void;
}

export default function Header({ onRefresh }: HeaderProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const logoutAction = () => {
    toast.success('Logged out successfully');
    navigate('/login');
  };

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

  const home = () => navigate('/');
  const toggleMenu = () => setMenuOpen(!isMenuOpen);

  return (
    <header className={`bg-tealDark text-darkText p-4 shadow-md ${isMenuOpen ? 'h-auto' : 'h-20'} overflow-hidden`}>
      <div className="container mx-auto flex justify-between items-center h-full">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <img src={icon} alt="App Icon" className="w-10 h-10 rounded-full" />
          <h1 className="text-2xl font-bold font-playwrite-in text-cream">Transaction Manager</h1>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-lightPink duration-500"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <FaTimes className="text-cream hover:text-darkText" /> : <FaBars className="text-cream hover:text-darkText" />}
        </button>

        {/* Navigation */}
        <nav className="hidden lg:flex space-x-4 ml-auto">
          <button
            className="rounded-2xl text-cream transition-transform hover:text-black hover:border-2 hover:border-dashed hover:border-black bg-tealDark hover:bg-teal px-6 py-3 font-semibold uppercase duration-500 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none"
            onClick={home}
          >
            Home
          </button>
          <button
            className="rounded-2xl text-cream transition-transform hover:text-black hover:border-2 hover:border-dashed hover:border-black bg-tealDark hover:bg-teal px-6 py-3 font-semibold uppercase duration-500 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none"
            onClick={openUpload}
          >
            Upload CSV
          </button>
          <button
            className="rounded-2xl text-cream transition-transform hover:text-black hover:border-2 hover:border-dashed hover:border-black bg-tealDark hover:bg-teal px-6 py-3 font-semibold uppercase duration-500 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none"
            onClick={openModal}
          >
            Add Transaction
          </button>
        </nav>

        {/* User Section */}
        <div className="hidden lg:flex items-center space-x-4 ml-4">
          {user ? (
            <>
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
              <span className="text-sm text-cream">
                Welcome, <strong>{user.name}</strong>
              </span>
            </>
          ) : (
            <>
              <FaUserCircle className="text-3xl text-cream" />
              <span className="text-sm text-cream">
                Welcome, <strong>Zluri</strong>
              </span>
            </>
          )}
          <button className='bg-pink hover:shadow-orange-950 hover:bg-lightPink rounded-full px-3 py-2 shadow-md text-sm text-darkText hover:text-black duration-500' onClick={logoutAction}>
            Log Out
          </button>
        </div>
      </div>

      {/* Dropdown Menu for Mobile */}
      {isMenuOpen && (
        <div className="lg:hidden bg-tealDark text-darkText p-4">
          <nav className="flex flex-col items-center space-y-4">
            <button
              className="rounded-2xl text-cream transition-transform hover:text-black hover:border-2 hover:border-dashed hover:border-black bg-tealDark hover:bg-teal px-6 py-3 font-semibold uppercase duration-500 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none"
              onClick={home}
            >
              Home
            </button>
            <button
              className="rounded-2xl text-cream transition-transform hover:text-black hover:border-2 hover:border-dashed hover:border-black bg-tealDark hover:bg-teal px-6 py-3 font-semibold uppercase duration-500 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none"
              onClick={openUpload}
            >
              Upload CSV
            </button>
            <button
              className="rounded-2xl text-cream transition-transform hover:text-black hover:border-2 hover:border-dashed hover:border-black bg-tealDark hover:bg-teal px-6 py-3 font-semibold uppercase duration-500 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none"
              onClick={openModal}
            >
              Add Transaction
            </button>
            {/* User Section in Dropdown */}
            <div className="flex flex-col items-center space-y-2 mt-4">
              {user ? (
                <>
                  <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                  <span className="text-sm text-cream">
                    Welcome, <strong>{user.name}</strong>
                  </span>
                </>
              ) : (
                <>
                  <FaUserCircle className="text-3xl text-cream" />
                  <span className="text-sm text-cream">
                    Welcome, <strong>Guest</strong>
                  </span>
                </>
              )}
              <button className='bg-pink hover:shadow-orange-950 hover:bg-lightPink rounded-full px-3 py-2 shadow-md text-sm text-darkText hover:text-black duration-500' onClick={logoutAction}>
                Log Out
              </button>
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