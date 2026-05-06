-- Normalize legacy plural category naming for engine oil products
UPDATE public.products
SET category = 'Engine Oil'
WHERE lower(trim(category)) = 'engine oils';
