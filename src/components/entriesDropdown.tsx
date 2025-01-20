import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EntriesDropdown = ({ limit, handleLimitChange }: { limit: number, handleLimitChange: (limit: number) => void }) => {
  const options = [5, 10, 20, 25, 30, 50];

  return (
    <div className="flex h-[50px] justify-center px-3 py-2 font-bold">
      <FlyoutLink FlyoutContent={() => <DropdownContent options={options} handleLimitChange={handleLimitChange} />}>
        Records: {limit}
      </FlyoutLink>
    </div>
  );
};

const FlyoutLink = ({ children, FlyoutContent }: { children: React.ReactNode, FlyoutContent: React.ComponentType }) => {
  const [open, setOpen] = useState(false);

  const showFlyout = FlyoutContent && open;

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative w-fit h-fit"
    >
      <div className="relative text-darkText cursor-pointer">
        {children}
        <span
          style={{
            transform: showFlyout ? "scaleX(1)" : "scaleX(0)",
          }}
          className="absolute -bottom-2 -left-2 -right-2 h-1 origin-left scale-x-0 rounded-full bg-teal transition-transform duration-300 ease-out"
        />
      </div>
      <AnimatePresence>
        {showFlyout && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            style={{ translateX: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-1/2 top-12 bg-white text-black"
          >
            <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
            <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
            <FlyoutContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DropdownContent = ({ options, handleLimitChange }: { options: number[], handleLimitChange: (option: number) => void }) => {
  return (
    <div className="w-32 bg-white p-2 shadow-xl">
      {options.map(option => (
        <div
          key={option}
          onClick={() => handleLimitChange(option)}
          className="cursor-pointer p-2 hover:bg-gray-100"
        >
          {option}
        </div>
      ))}
    </div>
  );
};

export default EntriesDropdown;