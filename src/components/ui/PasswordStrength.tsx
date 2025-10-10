import React from 'react';

interface PasswordStrengthProps {
  strength: 'weak' | 'medium' | 'strong' | '';
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ strength }) => {
  if (!strength) return null;

  const strengthLevels = [
    { id: 'weak', color: 'bg-red-500', label: 'Weak' },
    { id: 'medium', color: 'bg-yellow-500', label: 'Medium' },
    { id: 'strong', color: 'bg-green-500', label: 'Strong' },
  ];

  const currentLevelIndex = strengthLevels.findIndex(level => level.id === strength);

  return (
    <div className="flex items-center space-x-2 mt-2">
      <div className="flex-grow grid grid-cols-3 gap-2">
        {strengthLevels.map((level, index) => (
          <div
            key={level.id}
            className={`h-1 rounded-full transition-colors ${index <= currentLevelIndex ? level.color : 'bg-gray-600'}`}
          ></div>
        ))}
      </div>
      <span className="text-sm text-gray-400 w-16 text-right capitalize">{strength}</span>
    </div>
  );
};

export default PasswordStrength;
