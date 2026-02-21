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

        List<Address> existing = addressRepository.findByUser(user);
        if (existing.isEmpty()) {
            address.setIsDefault(true);
        } else if (Boolean.TRUE.equals(address.getIsDefault())) {
            // Unset previous default
            existing.stream()
                    .filter(a -> Boolean.TRUE.equals(a.getIsDefault()))
                    .forEach(a -> {
                        a.setIsDefault(false);
                        addressRepository.save(a);
                    });
        }

        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(User user, Long addressId, Address updated) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        address.setFullName(updated.getFullName());
        address.setPhoneNumber(updated.getPhoneNumber());
        address.setStreetAddress(updated.getStreetAddress());
        address.setCity(updated.getCity());
        address.setState(updated.getState());
        address.setZipCode(updated.getZipCode());

        if (Boolean.TRUE.equals(updated.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            // Unset other defaults
            List<Address> existing = addressRepository.findByUser(user);
            existing.stream()
                    .filter(a -> !a.getId().equals(address.getId()) && Boolean.TRUE.equals(a.getIsDefault()))
                    .forEach(a -> {
                        a.setIsDefault(false);
                        addressRepository.save(a);
                    });
            address.setIsDefault(true);
        } else if (updated.getIsDefault() != null) {
            address.setIsDefault(updated.getIsDefault());
        }

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
