package com.smartpark.service;

import com.smartpark.dto.request.LocationRequest;
import com.smartpark.dto.request.SlotRequest;
import com.smartpark.dto.request.VehicleRequest;
import com.smartpark.dto.response.LocationResponse;
import com.smartpark.dto.response.SlotResponse;
import com.smartpark.dto.response.VehicleResponse;
import com.smartpark.entity.*;
import com.smartpark.entity.enums.*;
import com.smartpark.exception.*;
import com.smartpark.mapper.EntityMapper;
import com.smartpark.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ParkingLocationRepository locationRepository;
    private final ParkingSlotRepository slotRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public ResourceService(ParkingLocationRepository locationRepository, ParkingSlotRepository slotRepository,
                           VehicleRepository vehicleRepository, UserRepository userRepository,
                           AuditService auditService) {
        this.locationRepository = locationRepository;
        this.slotRepository = slotRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    // ==================== LOCATIONS ====================

    @Transactional(readOnly = true)
    public List<LocationResponse> getAllLocations() {
        return locationRepository.findAll().stream().map(loc -> {
            long total = slotRepository.countByLocationId(loc.getId());
            long avail = slotRepository.countByLocationIdAndStatus(loc.getId(), SlotStatus.AVAILABLE);
            return EntityMapper.toLocationResponse(loc, total, avail);
        }).collect(Collectors.toList());
    }

    @Transactional
    public LocationResponse createLocation(LocationRequest request, Long adminId) {
        ParkingLocation location = ParkingLocation.builder()
                .name(request.getName())
                .address(request.getAddress())
                .description(request.getDescription())
                .status(LocationStatus.ACTIVE)
                .build();
        location = locationRepository.save(location);
        User admin = userRepository.findById(adminId).orElse(null);
        auditService.log(admin, "LOCATION_CREATED", "LOCATION", location.getId(), "name=" + location.getName());
        return EntityMapper.toLocationResponse(location, 0, 0);
    }

    @Transactional
    public LocationResponse updateLocation(Long id, LocationRequest request, Long adminId) {
        ParkingLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", id));
        if (request.getName() != null) location.setName(request.getName());
        if (request.getAddress() != null) location.setAddress(request.getAddress());
        if (request.getDescription() != null) location.setDescription(request.getDescription());
        if (request.getStatus() != null) location.setStatus(LocationStatus.valueOf(request.getStatus().toUpperCase()));
        location = locationRepository.save(location);
        long total = slotRepository.countByLocationId(id);
        long avail = slotRepository.countByLocationIdAndStatus(id, SlotStatus.AVAILABLE);
        User admin = userRepository.findById(adminId).orElse(null);
        auditService.log(admin, "LOCATION_UPDATED", "LOCATION", id, null);
        return EntityMapper.toLocationResponse(location, total, avail);
    }

    // ==================== SLOTS ====================

    @Transactional(readOnly = true)
    public List<SlotResponse> getAllSlots(Long locationId, String type, String status) {
        List<ParkingSlot> slots;
        if (locationId != null) {
            slots = slotRepository.findByLocationIdWithLocation(locationId);
        } else {
            slots = slotRepository.findAllWithLocation();
        }
        return slots.stream()
                .filter(s -> type == null || s.getSlotType().name().equalsIgnoreCase(type))
                .filter(s -> status == null || s.getStatus().name().equalsIgnoreCase(status))
                .map(EntityMapper::toSlotResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getAvailableSlots(Long locationId, String type) {
        List<ParkingSlot> slots;
        if (locationId != null && type != null) {
            SlotType slotType = SlotType.valueOf(type.toUpperCase());
            slots = slotRepository.findByLocationAndTypeAndStatus(locationId, slotType, SlotStatus.AVAILABLE);
        } else if (locationId != null) {
            slots = slotRepository.findByLocationIdAndStatus(locationId, SlotStatus.AVAILABLE);
        } else {
            slots = slotRepository.findByStatusWithLocation(SlotStatus.AVAILABLE);
        }
        return slots.stream().map(EntityMapper::toSlotResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getOccupiedSlots(Long locationId, String type) {
        List<ParkingSlot> slots;
        if (locationId != null && type != null) {
            SlotType slotType = SlotType.valueOf(type.toUpperCase());
            slots = slotRepository.findByLocationAndTypeAndStatus(locationId, slotType, SlotStatus.OCCUPIED);
        } else if (locationId != null) {
            slots = slotRepository.findByLocationIdAndStatus(locationId, SlotStatus.OCCUPIED);
        } else {
            slots = slotRepository.findByStatusWithLocation(SlotStatus.OCCUPIED);
        }
        return slots.stream().map(EntityMapper::toSlotResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SlotResponse getSlot(Long id) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking Slot", id));
        return EntityMapper.toSlotResponse(slot);
    }

    @Transactional
    public SlotResponse createSlot(SlotRequest request, Long adminId) {
        ParkingLocation location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location", request.getLocationId()));

        if (slotRepository.existsByLocationIdAndSlotNumber(request.getLocationId(), request.getSlotNumber())) {
            throw new ConflictException("Slot number " + request.getSlotNumber() + " already exists at this location");
        }

        ParkingSlot slot = ParkingSlot.builder()
                .location(location)
                .slotNumber(request.getSlotNumber())
                .slotType(SlotType.valueOf(request.getSlotType().toUpperCase()))
                .status(request.getStatus() != null ? SlotStatus.valueOf(request.getStatus().toUpperCase()) : SlotStatus.AVAILABLE)
                .floor(request.getFloor())
                .description(request.getDescription())
                .build();
        slot = slotRepository.save(slot);
        User admin = userRepository.findById(adminId).orElse(null);
        auditService.log(admin, "SLOT_CREATED", "SLOT", slot.getId(), "number=" + slot.getSlotNumber());
        return EntityMapper.toSlotResponse(slot);
    }

    @Transactional
    public SlotResponse updateSlot(Long id, SlotRequest request, Long userId) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking Slot", id));
        if (request.getSlotNumber() != null) slot.setSlotNumber(request.getSlotNumber());
        if (request.getSlotType() != null) slot.setSlotType(SlotType.valueOf(request.getSlotType().toUpperCase()));
        if (request.getStatus() != null) slot.setStatus(SlotStatus.valueOf(request.getStatus().toUpperCase()));
        if (request.getFloor() != null) slot.setFloor(request.getFloor());
        if (request.getDescription() != null) slot.setDescription(request.getDescription());
        slot = slotRepository.save(slot);
        User user = userRepository.findById(userId).orElse(null);
        auditService.log(user, "SLOT_UPDATED", "SLOT", id, "status=" + slot.getStatus());
        return EntityMapper.toSlotResponse(slot);
    }

    // ==================== VEHICLES ====================

    @Transactional(readOnly = true)
    public List<VehicleResponse> getMyVehicles(Long userId) {
        return vehicleRepository.findByOwnerId(userId).stream()
                .map(EntityMapper::toVehicleResponse).collect(Collectors.toList());
    }

    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request, Long userId) {
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber().toUpperCase())) {
            throw new ConflictException("Vehicle with registration " + request.getRegistrationNumber() + " is already registered");
        }

        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Vehicle vehicle = Vehicle.builder()
                .owner(owner)
                .registrationNumber(request.getRegistrationNumber().toUpperCase().trim())
                .vehicleType(VehicleType.valueOf(request.getVehicleType().toUpperCase()))
                .build();
        vehicle = vehicleRepository.save(vehicle);
        return EntityMapper.toVehicleResponse(vehicle);
    }

    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request, Long userId) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        if (!vehicle.getOwner().getId().equals(userId)) {
            throw new UnauthorizedException("You can only update your own vehicles");
        }
        if (request.getRegistrationNumber() != null) {
            String reg = request.getRegistrationNumber().toUpperCase().trim();
            if (!reg.equals(vehicle.getRegistrationNumber()) && vehicleRepository.existsByRegistrationNumber(reg)) {
                throw new ConflictException("Vehicle with registration " + reg + " is already registered");
            }
            vehicle.setRegistrationNumber(reg);
        }
        if (request.getVehicleType() != null) {
            vehicle.setVehicleType(VehicleType.valueOf(request.getVehicleType().toUpperCase()));
        }
        vehicle = vehicleRepository.save(vehicle);
        return EntityMapper.toVehicleResponse(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id, Long userId) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        if (!vehicle.getOwner().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own vehicles");
        }
        vehicleRepository.delete(vehicle);
    }
}
