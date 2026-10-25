INSERT INTO customers (document_number, full_name, email)
VALUES
    ('70000001', 'Ana Torres',   'ana.torres@example.test'),
    ('70000002', 'Luis Ramos',   'luis.ramos@example.test'),
    ('70000003', 'Maria Quispe', 'maria@example.test')
ON CONFLICT (document_number) DO NOTHING;

INSERT INTO orders (customer_id, total, status, external_reference, channel)
SELECT c.id, 150.00, 'PENDING', 'EXT-0001', 'WEB'
FROM customers c WHERE c.document_number = '70000001'
ON CONFLICT DO NOTHING;

INSERT INTO orders (customer_id, total, status, external_reference, channel)
SELECT c.id, 320.50, 'PAID', 'EXT-0002', 'MOBILE'
FROM customers c WHERE c.document_number = '70000002'
ON CONFLICT DO NOTHING;