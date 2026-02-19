package com.mrsdeores.services;

import com.mrsdeores.models.Address;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    public List<Address> getUserAddresses(User user) {
        return addressRepository.findByUser(user);
    }

    @Transactional
    public Address addAddress(User user, Address address) {
        address.setUser(user);
        // If first address, make it default? Logic could go here.
        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(User user, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        addressRepository.delete(address);
    }
}
