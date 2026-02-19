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
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-brand-gold/10">
            <h3 className="text-xl font-serif text-brand-maroon mb-4">Add New Address</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm p-2 border" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm p-2 border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm p-2 border" />
                </div>
            </div>

            <div className="flex items-center">
                <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange}
                    className="h-4 w-4 text-brand-gold focus:ring-brand-gold border-gray-300 rounded" />
                <label className="ml-2 block text-sm text-gray-900">Set as default address</label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold">
                    Cancel
                </button>
                <button type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-maroon hover:bg-brand-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition-colors duration-200">
                    Save Address
                </button>
            </div>
        </form>
    );
};

export default AddressForm;
