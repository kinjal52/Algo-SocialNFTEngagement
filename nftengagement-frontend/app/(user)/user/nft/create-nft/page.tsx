"use client";

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bounce, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import algosdk from 'algosdk';
import { ArrowLeft, Loader2 } from 'lucide-react';

type FormValues = {
    name: string;
    unitName: string;
    note?: string;
    price: string;
    image: FileList;
};

export default function CreateNFTPage() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>();

    const [walletAddress, setWalletAddress] = useState('');
    const [status, setStatus] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const addr = localStorage.getItem('walletAddress');
        if (addr) setWalletAddress(addr);
    }, []);

    const onSubmit = async (data: FormValues) => {

        if (!walletAddress) {
            setStatus('❌ Please connect your wallet first.');
            return;
        }
        setLoading(true);


        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('unitName', data.unitName);
        formData.append('price', data.price);
        formData.append('note', 'Algorand NFT');
        formData.append('image', data.image[0]);
        formData.append('creator', walletAddress);

        try {
            setStatus('🚀 Uploading and minting NFT...');
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/nft/create-nft`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setStatus(`✅ NFT Created! [Asset ID: ${res.data.assetId}]`);
            toast.success(`NFT Created!`), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            };
            reset();
            setPreviewUrl(null);
            // router.push('/app/(user)/user/nft/create-nft/page.tsx');
            router.push('/user/nft')

        } catch (err: any) {
            console.error(err);
            setStatus(`❌ Error: ${err?.response?.data?.error || 'Something went wrong'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-screen-lg mx-auto mt-8 p-8 rounded-2xl shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
            <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-gray-400 hover:text-white flex items-center"
                >
                    <ArrowLeft size={24} className="align-middle" />
                </button>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                    Create a New NFT
                </h1>
            </div>


            {!walletAddress && (
                <div className="mb-6 p-3 rounded-lg bg-red-900/30 border border-red-700/50">
                    <p className="text-red-300 font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Wallet not connected. Please connect your wallet first.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <Label className="block mb-2 font-medium text-gray-300">NFT Name</Label>
                    <Input
                        type="text"
                        {...register('name', { required: true })}
                        className="w-full bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500 text-white rounded-lg p-3"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-400">Name is required.</p>}
                </div>

                <div>
                    <Label className="block mb-2 font-medium text-gray-300">Unit Name</Label>
                    <Input
                        type="text"
                        {...register('unitName', { required: true })}
                        className="w-full bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500 text-white rounded-lg p-3"
                    />
                    {errors.unitName && <p className="mt-1 text-sm text-red-400">Unit Name is required.</p>}
                </div>

                <div>
                    <Label className="block mb-2 font-medium text-gray-300">Price (in ALGO)</Label>
                    <Input
                        step="any"
                        type="number"
                        {...register('price', { required: true })}
                        className="w-full bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500 text-white rounded-lg p-3"
                    />
                    {errors.price && <p className="mt-1 text-sm text-red-400">Price is required.</p>}
                </div>

                {/* <div>
          <Label className="block mb-2 font-medium text-gray-300">Note (optional)</Label>
          <Input
            type="text"
            {...register('note')}
            className="w-full bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500 text-white rounded-lg p-3"
          />
        </div> */}

                <div>
                    <Label className="block mb-2 font-medium text-gray-300">Upload Image</Label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-700/50 transition">
                            <div className="flex flex-col items-center justify-center pt-7">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="pt-1 text-sm tracking-wider text-gray-400">
                                    {previewUrl ? 'Image selected' : 'Select an image'}
                                </p>
                            </div>
                            <Input
                                type="file"
                                accept="image/*"
                                {...register('image', {
                                    required: true,
                                    onChange: (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setPreviewUrl(URL.createObjectURL(file));
                                    },
                                })}
                                className="opacity-0"
                            />
                        </label>
                    </div>
                    {errors.image && <p className="mt-1 text-sm text-red-400">Image is required.</p>}
                </div>

                {previewUrl && (
                    <div className="mt-4">
                        <p className="font-medium mb-2 text-gray-300">Image Preview:</p>
                        <img src={previewUrl} alt="Preview" className="rounded-lg shadow-lg max-h-64 border border-gray-600" />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!walletAddress || loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin h-4 w-4" />
                            Minting...
                        </>
                    ) : (
                        'Mint NFT'
                    )}
                </button>
            </form>

            {status && (
                <div className={`mt-6 p-3 rounded-lg font-medium ${status.includes('✅') ? 'bg-green-900/30 border border-green-700/50 text-green-300' : status.includes('❌') ? 'bg-red-900/30 border border-red-700/50 text-red-300' : 'bg-blue-900/30 border border-blue-700/50 text-blue-300'}`}>
                    {status}
                </div>
            )}
        </div>
    );
}