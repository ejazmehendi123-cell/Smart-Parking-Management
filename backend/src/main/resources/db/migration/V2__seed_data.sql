-- SmartPark Database Seed Data
-- V2: Initial seed for users, locations, slots, vehicles, and pricing

-- 1. Users (Admin, Operator, Customer)
INSERT INTO users (id, full_name, email, password_hash, role, account_status) VALUES
(1, 'System Administrator', 'admin@smartpark.com', '$2a$10$J8b5Bk8ECJcORLuuGNpUwOlVf3EyBaJAm0dFb1gkvu3qtspb4fMkW', 'ADMIN', 'ACTIVE'),
(2, 'Gate Operator John', 'operator@smartpark.com', '$2a$10$O3gXb2iFuMX0l4q3B38fveEruVlKX6qlJPY6t7ixahhvQu6s4w4ti', 'OPERATOR', 'ACTIVE'),
(3, 'Sarah Connor', 'customer@smartpark.com', '$2a$10$HCH/kx9v3CgICaPwA/xxVui.FnrLEceaJ1tYApPP18zOAWwwPFi6u', 'CUSTOMER', 'ACTIVE'),
(4, 'Michael Scott', 'michael@smartpark.com', '$2a$10$HCH/kx9v3CgICaPwA/xxVui.FnrLEceaJ1tYApPP18zOAWwwPFi6u', 'CUSTOMER', 'ACTIVE');

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. Parking Locations
INSERT INTO parking_locations (id, name, address, description, status) VALUES
(1, 'Central Business Hub', '100 MG Road, Central District, Bengaluru', 'Multi-level premium parking facility with EV charging stations and 24/7 CCTV surveillance', 'ACTIVE'),
(2, 'Airport Terminal 2 Express', 'Terminal 2 Boulevard, Airport Zone, Bengaluru', 'Fast-access automated parking lot with designated shuttle service', 'ACTIVE'),
(3, 'Tech Park East Campus', 'Plot 45, Electronic City Phase 1, Bengaluru', 'Corporate smart parking facility with dedicated bike and disabled spaces', 'ACTIVE');

SELECT setval('parking_locations_id_seq', (SELECT MAX(id) FROM parking_locations));

-- 3. Parking Slots (Central Business Hub - Location 1)
INSERT INTO parking_slots (location_id, slot_number, slot_type, status, floor, description) VALUES
(1, 'A-101', 'CAR', 'AVAILABLE', 'Ground', 'Near Main Entrance'),
(1, 'A-102', 'CAR', 'AVAILABLE', 'Ground', 'Near Elevators'),
(1, 'A-103', 'CAR', 'AVAILABLE', 'Ground', 'Wide bay parking'),
(1, 'A-104', 'EV', 'AVAILABLE', 'Ground', 'Fast AC Charger 22kW'),
(1, 'A-105', 'EV', 'AVAILABLE', 'Ground', 'DC Fast Charger 50kW'),
(1, 'A-106', 'ACCESSIBLE', 'AVAILABLE', 'Ground', 'Handicapped accessible with ramp'),
(1, 'A-107', 'MOTORCYCLE', 'AVAILABLE', 'Ground', 'Covered two-wheeler bay'),
(1, 'A-108', 'MOTORCYCLE', 'AVAILABLE', 'Ground', 'Covered two-wheeler bay'),
(1, 'B-201', 'CAR', 'AVAILABLE', '1st Floor', 'Standard bay'),
(1, 'B-202', 'CAR', 'AVAILABLE', '1st Floor', 'Standard bay'),
(1, 'B-203', 'CAR', 'AVAILABLE', '1st Floor', 'Standard bay'),
(1, 'B-204', 'EV', 'AVAILABLE', '1st Floor', 'EV Charging Spot'),
(1, 'B-205', 'ACCESSIBLE', 'AVAILABLE', '1st Floor', 'Close to lift lobby'),
(1, 'B-206', 'MOTORCYCLE', 'AVAILABLE', '1st Floor', 'Bike bay'),
(1, 'C-301', 'CAR', 'AVAILABLE', '2nd Floor', 'Rooftop covered bay'),
(1, 'C-302', 'CAR', 'AVAILABLE', '2nd Floor', 'Rooftop covered bay');

-- 4. Parking Slots (Airport Terminal 2 - Location 2)
INSERT INTO parking_slots (location_id, slot_number, slot_type, status, floor, description) VALUES
(2, 'T2-G01', 'CAR', 'AVAILABLE', 'Ground', 'Express Departure Pickup'),
(2, 'T2-G02', 'CAR', 'AVAILABLE', 'Ground', 'Express Departure Pickup'),
(2, 'T2-G03', 'EV', 'AVAILABLE', 'Ground', 'Supercharger Bay 150kW'),
(2, 'T2-G04', 'ACCESSIBLE', 'AVAILABLE', 'Ground', 'Direct terminal access'),
(2, 'T2-G05', 'MOTORCYCLE', 'AVAILABLE', 'Ground', 'Short stay bike zone'),
(2, 'T2-101', 'CAR', 'AVAILABLE', '1st Floor', 'Long term secure parking'),
(2, 'T2-102', 'CAR', 'AVAILABLE', '1st Floor', 'Long term secure parking'),
(2, 'T2-103', 'CAR', 'AVAILABLE', '1st Floor', 'Long term secure parking');

-- 5. Parking Slots (Tech Park East Campus - Location 3)
INSERT INTO parking_slots (location_id, slot_number, slot_type, status, floor, description) VALUES
(3, 'TP-01', 'CAR', 'AVAILABLE', 'Ground', 'Executive bay'),
(3, 'TP-02', 'CAR', 'AVAILABLE', 'Ground', 'Staff parking'),
(3, 'TP-03', 'EV', 'AVAILABLE', 'Ground', 'Company EV Charging'),
(3, 'TP-04', 'ACCESSIBLE', 'AVAILABLE', 'Ground', 'Accessibility designated'),
(3, 'TP-05', 'MOTORCYCLE', 'AVAILABLE', 'Ground', 'Two-wheeler bay A'),
(3, 'TP-06', 'MOTORCYCLE', 'AVAILABLE', 'Ground', 'Two-wheeler bay B');

-- 6. Vehicles for Customer Sarah Connor (User 3) & Michael Scott (User 4)
INSERT INTO vehicles (id, owner_id, registration_number, vehicle_type) VALUES
(1, 3, 'KA-01-MJ-1234', 'CAR'),
(2, 3, 'KA-01-EV-5678', 'EV'),
(3, 3, 'KA-05-BK-9999', 'MOTORCYCLE'),
(4, 4, 'DL-04-SC-7777', 'CAR');

SELECT setval('vehicles_id_seq', (SELECT MAX(id) FROM vehicles));

-- 7. Pricing Rule (Default: ₹50 for 3 hours)
INSERT INTO pricing_rules (rate_amount, billing_interval_hours, effective_from, active) VALUES
(50.00, 3, CURRENT_TIMESTAMP, TRUE);

-- 8. Welcome notification
INSERT INTO notifications (user_id, message, type, is_read) VALUES
(3, 'Welcome to SmartPark! You can book slots, generate digital tickets, and pay seamlessly.', 'GENERAL', FALSE),
(4, 'Welcome to SmartPark! Experience hassle-free parking management.', 'GENERAL', FALSE);
