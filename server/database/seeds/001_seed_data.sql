-- Seed data for Qurilish Construction Management System

-- Insert regions (viloyatlar)
INSERT INTO regions (name) VALUES
    ('Toshkent shahri'),
    ('Toshkent viloyati'),
    ('Andijon'),
    ('Buxoro'),
    ('Farg''ona'),
    ('Jizzax'),
    ('Xorazm'),
    ('Namangan'),
    ('Navoiy'),
    ('Qashqadaryo'),
    ('Qoraqalpog''iston Respublikasi'),
    ('Samarqand'),
    ('Sirdaryo'),
    ('Surxondaryo');

-- Insert sample districts for Toshkent shahri
INSERT INTO districts (name, region_id) VALUES
    ('Bektemir tumani', 1),
    ('Chilonzor tumani', 1),
    ('Mirobod tumani', 1),
    ('Olmazor tumani', 1),
    ('Sergeli tumani', 1),
    ('Shayxontohur tumani', 1),
    ('Yakkasaroy tumani', 1),
    ('Yashnobod tumani', 1),
    ('Yunusobod tumani', 1);

-- Insert sample districts for Toshkent viloyati
INSERT INTO districts (name, region_id) VALUES
    ('Toshkent tumani', 2),
    ('Ohangaron shahri', 2),
    ('Angren shahri', 2),
    ('Bekobod tumani', 2),
    ('Bo''ka tumani', 2),
    ('Bo''stonliq tumani', 2),
    ('Chinoz tumani', 2),
    ('Qibray tumani', 2),
    ('Oqqo''rg''on tumani', 2),
    ('Parkent tumani', 2),
    ('Pskent tumani', 2),
    ('O''rtachirchiq tumani', 2),
    ('Yuqorichirchiq tumani', 2),
    ('Zangiota tumani', 2);

-- Insert sample organization
INSERT INTO organizations (name, tax_id, region_id) VALUES
    ('Davlat qurilish nazorati', '123456789', 1),
    ('Toshkent qurilish tashkiloti', '987654321', 1),
    ('O''zbekiston qurilish', '456789123', 2);

-- Insert sample project organizations
INSERT INTO project_organization (name, tax_id, address, phone_number, mfo) VALUES
    ('Qurilish loyihalash instituti', '111222333', 'Toshkent sh., Amir Temur ko''chasi 1', '+998712345678', '00014'),
    ('O''zmaroyihaloyi', '444555666', 'Toshkent sh., Navoi ko''chasi 12', '+998712345679', '00015'),
    ('Toshloiha', '777888999', 'Toshkent sh., Buyuk Ipak Yo''li 5', '+998712345680', '00016');

-- Insert contractors
INSERT INTO contractor (name, tax_id, address, phone_number, mfo) VALUES
    ('Qurilishservis MChJ', '101202303', 'Toshkent sh., Shota Rustaveli 10', '+998901234567', '00024'),
    ('Universal Qurilish', '404505606', 'Toshkent sh., Amir Temur 45', '+998901234568', '00025'),
    ('Mega Qurilish Kompaniyasi', '707808909', 'Toshkent sh., Bunyodkor 7', '+998901234569', '00026');

-- Construction statuses already inserted in init.sql

-- Insert construction items
INSERT INTO construction_items (name) VALUES
    ('Umumiy qurilish ishlari'),
    ('Beton va temir-beton ishlari'),
    ('Elektr jihozlari o''rnatish'),
    ('Suv ta''minoti va kanalizatsiya'),
    ('Issiqlik ta''minoti'),
    ('Ventilyatsiya va konditsionerlash'),
    ('Yo''l va bino atrofi obodlashtirish'),
    ('Tom qoplash ishlari'),
    ('Devorlarni bezash'),
    ('Yerga qarama-qarshi ishlar'),
    ('Lift o''rnatish'),
    ('Aloqa tizimlari'),
    ('Xavfsizlik tizimlari'),
    ('Yong''indan himoya tizimlari'),
    ('Oynalarni o''rnatish');

-- Insert admin user (password: admin123)
-- Note: This should be changed in production
INSERT INTO users (name, username, password, email, first_name, last_name, organization_id, role, user_type) VALUES
    ('Admin User', 'admin', '$2b$10$rHZl6qG5qVJz2V6LYVj6ZOLQxJFxVYvxPqPxGKxUZGKZxYvxJFxVY', 'admin@qurilish.uz', 'Admin', 'User', 1, 'SuperAdmin', 'SuperAdmin');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Seed data inserted successfully!';
END $$;
