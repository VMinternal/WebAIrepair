/* 
==========================================================================
SQL QUERY SCRIPTS FOR WebAIRepair SYSTEM
==========================================================================
*/

-- 1. DIAGNOSIS & PRICING SCRIPT
-- Purpose: Display all potential issues and costs when a user selects a specific device.
-- Note: '1' is a placeholder. In NestJS, this will be replaced by a dynamic variable.
SELECT 
    d.model AS device_name,
    i.title AS issue_name,
    p.name AS suggested_part,
    p.price AS repair_cost,
    p.warranty_period
FROM devices d
JOIN part_devices pd ON d.id = pd.device_id
JOIN parts p ON pd.part_id = p.id
JOIN issue_parts ip ON p.id = ip.part_id
JOIN issues i ON ip.issue_id = i.id
WHERE d.id = 1; 


-- 2. QUICK SEARCH SCRIPT
-- Purpose: Search for parts or devices by name (Used for the Search Bar on Web).
SELECT name, price, warranty_period 
FROM parts 
WHERE name ILIKE '%Screen%'; -- Replace 'Screen' with the user's input


-- 3. REVENUE FORECAST SCRIPT
-- Purpose: Calculate total potential value of all parts in inventory (For Admin Dashboard).
SELECT SUM(price) AS total_potential_revenue 
FROM parts;


-- 4. CREATE DATABASE VIEW (MASTER VIEW)
-- Purpose: Create a virtual table to simplify NestJS queries.
CREATE OR REPLACE VIEW full_repair_catalog AS
SELECT 
    d.id AS device_id,
    d.model AS device_name,
    i.id AS issue_id,
    i.title AS issue_name,
    p.name AS part_name,
    p.price AS repair_cost,
    p.warranty_period
FROM devices d
JOIN part_devices pd ON d.id = pd.device_id
JOIN parts p ON pd.part_id = p.id
JOIN issue_parts ip ON p.id = ip.part_id
JOIN issues i ON ip.issue_id = i.id;


-- 5. WARRANTY CHECK SCRIPT
-- Purpose: Filter parts with premium warranty periods (e.g., 6 or 12 months).
SELECT name, warranty_period 
FROM parts 
WHERE warranty_period ILIKE '%12 months%' 
   OR warranty_period ILIKE '%6 months%';