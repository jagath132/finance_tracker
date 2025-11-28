import { useState } from "react";
import { storage } from "../lib/firebase";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export const useStorage = () => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (
        file: File,
        path: string = "attachments"
    ): Promise<string | null> => {
        if (!user) {
            setError("User must be logged in to upload files");
            return null;
        }

        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            // Create a unique filename
            const timestamp = Date.now();
            const uniqueName = `${timestamp}_${file.name}`;
            const storagePath = `users/${user.uid}/${path}/${uniqueName}`;
            const storageRef = ref(storage, storagePath);

            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress =
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setProgress(progress);
                    },
                    (error) => {
                        console.error("Upload error:", error);
                        setError(error.message);
                        setUploading(false);
                        toast.error("Failed to upload file");
                        reject(error);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setUploading(false);
                        resolve(downloadURL);
                    }
                );
            });
        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message);
            setUploading(false);
            return null;
        }
    };

    const deleteFile = async (url: string) => {
        if (!user) return;

        try {
            const storageRef = ref(storage, url);
            await deleteObject(storageRef);
            toast.success("File deleted");
        } catch (err: any) {
            console.error("Delete error:", err);
            // Don't show error toast if file doesn't exist (might have been deleted already)
            if (err.code !== "storage/object-not-found") {
                toast.error("Failed to delete file");
            }
        }
    };

    return {
        uploadFile,
        deleteFile,
        uploading,
        progress,
        error,
    };
};
