import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ProfileScreen: React.FC = () => {
    const navigate = useNavigate();
    const { user, session } = useAuth();
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user?.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name);
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const { error } = await supabase.auth.updateUser({
            data: { full_name: fullName }
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Profile updated successfully!');
            // The auth listener will handle the state update
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6">
            <header className="flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-light-secondary dark:bg-dark-secondary">
                    <ArrowLeft size={24} className="text-light-text-secondary dark:text-dark-text-secondary" />
                </button>
                <h1 className="text-xl font-bold">Edit Profile</h1>
                <div className="w-10"></div>
            </header>

            <form onSubmit={handleUpdateProfile} className="max-w-md mx-auto bg-light-secondary dark:bg-dark-secondary p-8 rounded-2xl shadow-lg">
                <Input
                    label="Full Name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                />
                <Input
                    label="Email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                />
                <div className="mt-6">
                    <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                </div>
            </form>
        </div>
    );
};

export default ProfileScreen;
