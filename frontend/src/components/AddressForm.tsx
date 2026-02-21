import React, { useState } from 'react';
import type { Address } from '../types/Address';

interface AddressFormProps {
    onSave: (address: Address) => void;
    onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState<Address>({
        fullName: '',
        phoneNumber: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
            <h3 className="text-2xl font-serif font-black text-gray-900 mb-6 pb-4 border-b border-gray-100">Add New Address</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                        className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-colors" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required
                        className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-colors" />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Street Address</label>
                <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required
                        className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-colors" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} required
                        className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-colors" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Zip Code</label>
                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} required
                        className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-colors" />
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange}
                    className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded-lg cursor-pointer" />
                <label className="text-sm font-bold text-gray-900 cursor-pointer">Set as default delivery address</label>
            </div>

            <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-100">
                <button type="button" onClick={onCancel}
                    className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                    Cancel
                </button>
                <button type="submit"
                    className="px-10 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-accent transition-all active:scale-95">
                    Save Address
                </button>
            </div>
        </form>
    );
};

export default AddressForm;
