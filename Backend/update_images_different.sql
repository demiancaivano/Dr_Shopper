-- Script SQL para actualizar imágenes de productos con URLs ÚNICAS y ESPECÍFICAS por categoría
-- Ejecutar en pgAdmin

-- Primero, vamos a ver las categorías que tenemos
SELECT DISTINCT c.name as categoria, COUNT(p.id) as cantidad_productos
FROM product p
LEFT JOIN category c ON p.category_id = c.id
GROUP BY c.name
ORDER BY c.name;

-- Actualizar productos de Mobile Phones (imágenes específicas de smartphones)
UPDATE product 
SET 
    image_url = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
    images = ARRAY[
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
    ]
WHERE category_id = (SELECT id FROM category WHERE name = 'Mobile Phones');

-- Actualizar productos de Laptops (imágenes específicas de computadoras portátiles)
UPDATE product 
SET 
    image_url = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
    images = ARRAY[
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&fit=crop'
    ]
WHERE category_id = (SELECT id FROM category WHERE name = 'Laptops');

-- Actualizar productos de Tablets (imágenes específicas de tablets)
UPDATE product 
SET 
    image_url = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    images = ARRAY[
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
    ]
WHERE category_id = (SELECT id FROM category WHERE name = 'Tablets');

-- Actualizar productos de TVs (imágenes específicas de televisores)
UPDATE product 
SET 
    image_url = 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
    images = ARRAY[
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop'
    ]
WHERE category_id = (SELECT id FROM category WHERE name = 'TVs');

-- Actualizar productos de Headphones (imágenes específicas de auriculares)
UPDATE product 
SET 
    image_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    images = ARRAY[
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    ]
WHERE category_id = (SELECT id FROM category WHERE name = 'Headphones');

-- Actualizar productos de Sound Systems (imágenes específicas de altavoces)
UPDATE product 
SET 
    image_url = 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop',
    images = ARRAY[
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop'
    ]
WHERE category_id = (SELECT id FROM category WHERE name = 'Sound Systems');

-- Actualizar productos de Air Conditioner (imágenes específicas de aire acondicionado)
UPDATE product 
SET 
    image_url = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
    images = ARRAY[
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop'
    ]
WHERE category_id = (SELECT id FROM category WHERE name = 'Air Conditioner');

-- Actualizar productos de E-Books (imágenes específicas de lectores electrónicos)
UPDATE product 
SET 
    image_url = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
    images = ARRAY[
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop'
    ]
WHERE category_id = (SELECT id FROM category WHERE name = 'E-Books');

-- Verificar los resultados
SELECT 
    p.name as producto,
    c.name as categoria,
    p.image_url,
    p.images
FROM product p
LEFT JOIN category c ON p.category_id = c.id
ORDER BY c.name, p.name
LIMIT 20; 