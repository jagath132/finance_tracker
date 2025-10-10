import React from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  option1: string;
  option2: string;
  selected: 'income' | 'expense';
  setSelected: (value: 'income' | 'expense') => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ option1, option2, selected, setSelected }) => {
  const isExpense = selected === 'expense';

  return (
    <div className="relative flex items-center w-64 p-1 bg-dark-secondary rounded-full">
      <motion.div
        className="absolute h-10 w-1/2 rounded-full"
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          left: isExpense ? '2px' : '50%',
          backgroundColor: isExpense ? '#EF4444' : '#22C55E',
        }}
      />
      <button
        type="button"
        onClick={() => setSelected('expense')}
        className={`relative z-10 w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${!isExpense ? 'text-gray-400' : 'text-white'}`}
      >
        {option1}
      </button>
      <button
        type="button"
        onClick={() => setSelected('income')}
        className={`relative z-10 w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${isExpense ? 'text-gray-400' : 'text-white'}`}
      >
        {option2}
      </button>
    </div>
  );
};

export default ToggleSwitch;
