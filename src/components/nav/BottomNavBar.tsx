import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Folder, Settings } from 'lucide-react';

const navItems = [
    { path: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { path: '/categories', icon: Folder, label: 'Categories' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

const BottomNavBar: React.FC = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-light-secondary dark:bg-dark-secondary border-t border-light-border dark:border-dark-border p-2 z-50">
            <div className="flex justify-around max-w-md mx-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-24 h-16 rounded-lg transition-colors ${
                                isActive ? 'text-brand-green' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                            }`
                        }
                    >
                        <item.icon size={24} strokeWidth={1.5} />
                        <span className="text-xs mt-1">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNavBar;
