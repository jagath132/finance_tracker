import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const FloatingActionButton: React.FC = () => {
    const { openModal } = useModal();

    return (
        <motion.button
            onClick={() => openModal('addTransaction')}
            aria-label="Add Transaction"
            className="fixed bottom-24 right-6 bg-brand-green text-white p-4 rounded-full shadow-lg z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <Plus size={24} />
        </motion.button>
    );
};

export default FloatingActionButton;
