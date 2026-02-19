import React, { useEffect, useState } from 'react';
import type { Address } from '../types/Address';
import { getUserAddresses, deleteAddress } from '../services/AddressService';
import AddressForm from './AddressForm';
import { Plus, Trash2 } from 'lucide-react';

interface AddressListProps {
    onSelectAddress: (addressId: number) => void;
    selectedAddressId?: number;
}

const AddressList: React.FC<AddressListProps> = ({ onSelectAddress, selectedAddressId }) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchAddresses = async () => {
        try {
            const data = await getUserAddresses();
            setAddresses(data);
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    // Actually, let's inject the service call here or pass it down. 
    // For simplicity, let's assume the Form passes back the data and WE call the service.
    // Re-reading AddressForm code above: "onSave: (address: Address) => void;"
    // So yes, we need to implement the save logic here.

    const handleSaveAddress = async (newAddress: Address) => {
        try {
            const { addAddress } = await import('../services/AddressService');
            await addAddress(newAddress);
            await fetchAddresses();
            setShowForm(false);
        } catch (error) {
            console.error("Failed to add address", error);
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this address?")) {
            try {
                await deleteAddress(id);
                fetchAddresses();
            } catch (error) {
                console.error("Failed to delete address", error);
            }
        }
    };

    if (loading) return <div className="text-center p-4">Loading addresses...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Delivery Address</h3>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="text-sm flex items-center text-brand-maroon hover:text-brand-gold font-medium">
                        <Plus className="w-4 h-4 mr-1" /> Add New
                    </button>
                )}
            </div>

            {showForm ? (
                <AddressForm onSave={handleSaveAddress} onCancel={() => setShowForm(false)} />
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {addresses.map((addr) => (
                        <div key={addr.id}
                            onClick={() => onSelectAddress(addr.id!)}
                            className={`relative border rounded-lg p-4 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-brand-maroon ring-1 ring-brand-maroon bg-brand-gold/5' : 'border-gray-200 hover:border-brand-gold'}`}>

                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-gray-900">{addr.fullName}</p>
                                    <p className="text-sm text-gray-500">{addr.streetAddress}</p>
                                    <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                                    <p className="text-sm text-gray-500 mt-1">Phone: {addr.phoneNumber}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {selectedAddressId === addr.id && (
                                        <span className="bg-brand-maroon text-white text-xs px-2 py-1 rounded-full">Selected</span>
                                    )}
                                    <button onClick={(e) => handleDelete(addr.id!, e)} className="text-gray-400 hover:text-red-500 p-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {addresses.length === 0 && (
                        <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <p>No addresses found.</p>
                            <button onClick={() => setShowForm(true)} className="mt-2 text-brand-maroon font-medium hover:underline">Add your first address</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AddressList;
