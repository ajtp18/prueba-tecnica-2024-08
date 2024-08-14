CREATE OR REPLACE PROCEDURE load_random_products(num_rows INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..num_rows LOOP
        INSERT INTO product (name, price, stock)
        VALUES (
            'Product ' || i,
            (random() * 1000)::numeric(10,2),
            (random() * 100 + 1)::integer
        );
    END LOOP;
END;
$$;

CALL load_random_products(100);