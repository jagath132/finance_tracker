import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ProfileScreen: React.FC = () => {
    const navigate = useNavigate();
    const { user, session } = useAuth();
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user?.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name);
        }
        if (user?.user_metadata?.avatar_url) {
            setAvatarUrl(user.user_metadata.avatar_url);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = () => setAvatarUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !user) return;
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const { data, error } = await supabase.storage.from('avatars').upload(fileName, selectedFile, { upsert: true });
        if (error) {
            toast.error('Error uploading image: ' + error.message);
            return;
        }
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        const { error: updateError } = await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
        });
        if (updateError) {
            toast.error('Error updating profile: ' + updateError.message);
        } else {
            toast.success('Profile picture updated!');
            setAvatarUrl(publicUrl);
            setSelectedFile(null);
        }
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

            <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-light-secondary dark:border-dark-secondary" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-light-secondary dark:bg-dark-secondary flex items-center justify-center border-4 border-light-secondary dark:border-dark-secondary">
                            <User size={48} className="text-light-text-secondary dark:text-dark-text-secondary" />
                        </div>
                    )}
                    <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-brand-green text-white p-2 rounded-full hover:bg-brand-green/80 transition-colors">
                        <Camera size={16} />
                    </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                {selectedFile && (
                    <Button onClick={handleUpload} className="mb-4">Upload Picture</Button>
                )}
            </div>

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
