-- Seed 002: Full Uzbekistan regions and districts/cities
-- Safe to run after 001_seed_data.sql
-- Uses WHERE NOT EXISTS to avoid duplicate inserts

-- Ensure all 14 regions exist
INSERT INTO regions (name)
SELECT v.name
FROM (
  VALUES
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
    ('Surxondaryo')
) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM regions r WHERE r.name = v.name
);

-- Insert full districts/cities list by region name
WITH districts_seed(name, region_name) AS (
  VALUES
    -- Toshkent shahri
    ('Bektemir tumani', 'Toshkent shahri'),
    ('Chilonzor tumani', 'Toshkent shahri'),
    ('Mirzo Ulug''bek tumani', 'Toshkent shahri'),
    ('Mirobod tumani', 'Toshkent shahri'),
    ('Olmazor tumani', 'Toshkent shahri'),
    ('Sergeli tumani', 'Toshkent shahri'),
    ('Shayxontohur tumani', 'Toshkent shahri'),
    ('Uchtepa tumani', 'Toshkent shahri'),
    ('Yakkasaroy tumani', 'Toshkent shahri'),
    ('Yashnobod tumani', 'Toshkent shahri'),
    ('Yunusobod tumani', 'Toshkent shahri'),
    ('Yangihayot tumani', 'Toshkent shahri'),

    -- Toshkent viloyati
    ('Angren shahri', 'Toshkent viloyati'),
    ('Bekobod shahri', 'Toshkent viloyati'),
    ('Chirchiq shahri', 'Toshkent viloyati'),
    ('Nurafshon shahri', 'Toshkent viloyati'),
    ('Ohangaron shahri', 'Toshkent viloyati'),
    ('Olmaliq shahri', 'Toshkent viloyati'),
    ('Yangiyo''l shahri', 'Toshkent viloyati'),
    ('Bekobod tumani', 'Toshkent viloyati'),
    ('Bo''ka tumani', 'Toshkent viloyati'),
    ('Bo''stonliq tumani', 'Toshkent viloyati'),
    ('Chinoz tumani', 'Toshkent viloyati'),
    ('Oqqo''rg''on tumani', 'Toshkent viloyati'),
    ('Ohangaron tumani', 'Toshkent viloyati'),
    ('O''rta Chirchiq tumani', 'Toshkent viloyati'),
    ('Parkent tumani', 'Toshkent viloyati'),
    ('Piskent tumani', 'Toshkent viloyati'),
    ('Qibray tumani', 'Toshkent viloyati'),
    ('Quyi Chirchiq tumani', 'Toshkent viloyati'),
    ('Yangiyo''l tumani', 'Toshkent viloyati'),
    ('Yuqori Chirchiq tumani', 'Toshkent viloyati'),
    ('Zangiota tumani', 'Toshkent viloyati'),

    -- Andijon viloyati
    ('Andijon shahri', 'Andijon'),
    ('Xonobod shahri', 'Andijon'),
    ('Andijon tumani', 'Andijon'),
    ('Asaka tumani', 'Andijon'),
    ('Baliqchi tumani', 'Andijon'),
    ('Bo''z tumani', 'Andijon'),
    ('Buloqboshi tumani', 'Andijon'),
    ('Izboskan tumani', 'Andijon'),
    ('Jalolquduq tumani', 'Andijon'),
    ('Marhamat tumani', 'Andijon'),
    ('Oltinko''l tumani', 'Andijon'),
    ('Paxtaobod tumani', 'Andijon'),
    ('Qo''rg''ontepa tumani', 'Andijon'),
    ('Shahrixon tumani', 'Andijon'),
    ('Ulug''nor tumani', 'Andijon'),
    ('Xo''jaobod tumani', 'Andijon'),

    -- Buxoro viloyati
    ('Buxoro shahri', 'Buxoro'),
    ('Kogon shahri', 'Buxoro'),
    ('Buxoro tumani', 'Buxoro'),
    ('G''ijduvon tumani', 'Buxoro'),
    ('Jondor tumani', 'Buxoro'),
    ('Kogon tumani', 'Buxoro'),
    ('Olot tumani', 'Buxoro'),
    ('Peshku tumani', 'Buxoro'),
    ('Qorako''l tumani', 'Buxoro'),
    ('Qorovulbozor tumani', 'Buxoro'),
    ('Romitan tumani', 'Buxoro'),
    ('Shofirkon tumani', 'Buxoro'),
    ('Vobkent tumani', 'Buxoro'),

    -- Farg'ona viloyati
    ('Farg''ona shahri', 'Farg''ona'),
    ('Marg''ilon shahri', 'Farg''ona'),
    ('Qo''qon shahri', 'Farg''ona'),
    ('Quvasoy shahri', 'Farg''ona'),
    ('Bag''dod tumani', 'Farg''ona'),
    ('Beshariq tumani', 'Farg''ona'),
    ('Buvayda tumani', 'Farg''ona'),
    ('Dang''ara tumani', 'Farg''ona'),
    ('Farg''ona tumani', 'Farg''ona'),
    ('Furqat tumani', 'Farg''ona'),
    ('Oltiariq tumani', 'Farg''ona'),
    ('O''zbekiston tumani', 'Farg''ona'),
    ('Qo''shtepa tumani', 'Farg''ona'),
    ('Quva tumani', 'Farg''ona'),
    ('Rishton tumani', 'Farg''ona'),
    ('So''x tumani', 'Farg''ona'),
    ('Toshloq tumani', 'Farg''ona'),
    ('Uchko''prik tumani', 'Farg''ona'),
    ('Yozyovon tumani', 'Farg''ona'),

    -- Jizzax viloyati
    ('Jizzax shahri', 'Jizzax'),
    ('Arnasoy tumani', 'Jizzax'),
    ('Baxmal tumani', 'Jizzax'),
    ('Do''stlik tumani', 'Jizzax'),
    ('Forish tumani', 'Jizzax'),
    ('G''allaorol tumani', 'Jizzax'),
    ('Jizzax tumani', 'Jizzax'),
    ('Mirzacho''l tumani', 'Jizzax'),
    ('Paxtakor tumani', 'Jizzax'),
    ('Sharof Rashidov tumani', 'Jizzax'),
    ('Yangiobod tumani', 'Jizzax'),
    ('Zafarobod tumani', 'Jizzax'),
    ('Zarbdor tumani', 'Jizzax'),

    -- Xorazm viloyati
    ('Urganch shahri', 'Xorazm'),
    ('Xiva shahri', 'Xorazm'),
    ('Bog''ot tumani', 'Xorazm'),
    ('Gurlan tumani', 'Xorazm'),
    ('Hazorasp tumani', 'Xorazm'),
    ('Xiva tumani', 'Xorazm'),
    ('Xonqa tumani', 'Xorazm'),
    ('Qo''shko''pir tumani', 'Xorazm'),
    ('Shovot tumani', 'Xorazm'),
    ('Tuproqqal''a tumani', 'Xorazm'),
    ('Urganch tumani', 'Xorazm'),
    ('Yangiariq tumani', 'Xorazm'),
    ('Yangibozor tumani', 'Xorazm'),

    -- Namangan viloyati
    ('Namangan shahri', 'Namangan'),
    ('Chortoq tumani', 'Namangan'),
    ('Chust tumani', 'Namangan'),
    ('Kosonsoy tumani', 'Namangan'),
    ('Mingbuloq tumani', 'Namangan'),
    ('Namangan tumani', 'Namangan'),
    ('Norin tumani', 'Namangan'),
    ('Pop tumani', 'Namangan'),
    ('To''raqo''rg''on tumani', 'Namangan'),
    ('Uchqo''rg''on tumani', 'Namangan'),
    ('Uychi tumani', 'Namangan'),
    ('Yangiqo''rg''on tumani', 'Namangan'),

    -- Navoiy viloyati
    ('Navoiy shahri', 'Navoiy'),
    ('Zarafshon shahri', 'Navoiy'),
    ('Karmana tumani', 'Navoiy'),
    ('Konimex tumani', 'Navoiy'),
    ('Navbahor tumani', 'Navoiy'),
    ('Nurota tumani', 'Navoiy'),
    ('Qiziltepa tumani', 'Navoiy'),
    ('Tomdi tumani', 'Navoiy'),
    ('Uchquduq tumani', 'Navoiy'),
    ('Xatirchi tumani', 'Navoiy'),

    -- Qashqadaryo viloyati
    ('Qarshi shahri', 'Qashqadaryo'),
    ('Shahrisabz shahri', 'Qashqadaryo'),
    ('Chiroqchi tumani', 'Qashqadaryo'),
    ('Dehqonobod tumani', 'Qashqadaryo'),
    ('G''uzor tumani', 'Qashqadaryo'),
    ('Kasbi tumani', 'Qashqadaryo'),
    ('Kitob tumani', 'Qashqadaryo'),
    ('Koson tumani', 'Qashqadaryo'),
    ('Mirishkor tumani', 'Qashqadaryo'),
    ('Muborak tumani', 'Qashqadaryo'),
    ('Nishon tumani', 'Qashqadaryo'),
    ('Qamashi tumani', 'Qashqadaryo'),
    ('Qarshi tumani', 'Qashqadaryo'),
    ('Shahrisabz tumani', 'Qashqadaryo'),
    ('Yakkabog'' tumani', 'Qashqadaryo'),

    -- Qoraqalpog'iston Respublikasi
    ('Nukus shahri', 'Qoraqalpog''iston Respublikasi'),
    ('Taxiatosh shahri', 'Qoraqalpog''iston Respublikasi'),
    ('Amudaryo tumani', 'Qoraqalpog''iston Respublikasi'),
    ('Beruniy tumani', 'Qoraqalpog''iston Respublikasi'),
    ('Chimboy tumani', 'Qoraqalpog''iston Respublikasi'),
    ('Ellikqal''a tumani', 'Qoraqalpog''iston Respublikasi'),
    ('Kegeyli tumani', 'Qoraqalpog''iston Respublikasi'),
    ('Mo''ynoq tumani', 'Qoraqalpog''iston Respublikasi'),
    ('Nukus tumani', 'Qoraqalpog''iston Respublikasi'),
    ('Qanliko''l tumani', 'Qoraqalpog''iston Respublikasi'),
    ('Qo''ng''irot tumani', 'Qoraqalpog''iston Respublikasi'),
    ('Qorao''zak tumani', 'Qoraqalpog''iston Respublikasi'),
    ('Shumanay tumani', 'Qoraqalpog''iston Respublikasi'),
    ('Taxtako''pir tumani', 'Qoraqalpog''iston Respublikasi'),
    ('Taxiatosh tumani', 'Qoraqalpog''iston Respublikasi'),
    ('To''rtko''l tumani', 'Qoraqalpog''iston Respublikasi'),
    ('Xo''jayli tumani', 'Qoraqalpog''iston Respublikasi'),

    -- Samarqand viloyati
    ('Samarqand shahri', 'Samarqand'),
    ('Kattaqo''rg''on shahri', 'Samarqand'),
    ('Bulung''ur tumani', 'Samarqand'),
    ('Ishtixon tumani', 'Samarqand'),
    ('Jomboy tumani', 'Samarqand'),
    ('Kattaqo''rg''on tumani', 'Samarqand'),
    ('Narpay tumani', 'Samarqand'),
    ('Nurobod tumani', 'Samarqand'),
    ('Oqdaryo tumani', 'Samarqand'),
    ('Paxtachi tumani', 'Samarqand'),
    ('Payariq tumani', 'Samarqand'),
    ('Pastdarg''om tumani', 'Samarqand'),
    ('Qo''shrabot tumani', 'Samarqand'),
    ('Samarqand tumani', 'Samarqand'),
    ('Toyloq tumani', 'Samarqand'),
    ('Urgut tumani', 'Samarqand'),

    -- Sirdaryo viloyati
    ('Guliston shahri', 'Sirdaryo'),
    ('Shirin shahri', 'Sirdaryo'),
    ('Yangiyer shahri', 'Sirdaryo'),
    ('Boyovut tumani', 'Sirdaryo'),
    ('Guliston tumani', 'Sirdaryo'),
    ('Mirzaobod tumani', 'Sirdaryo'),
    ('Oqoltin tumani', 'Sirdaryo'),
    ('Sardoba tumani', 'Sirdaryo'),
    ('Sayxunobod tumani', 'Sirdaryo'),
    ('Sirdaryo tumani', 'Sirdaryo'),
    ('Xovos tumani', 'Sirdaryo'),

    -- Surxondaryo viloyati
    ('Termiz shahri', 'Surxondaryo'),
    ('Angor tumani', 'Surxondaryo'),
    ('Bandixon tumani', 'Surxondaryo'),
    ('Boysun tumani', 'Surxondaryo'),
    ('Denov tumani', 'Surxondaryo'),
    ('Jarqo''rg''on tumani', 'Surxondaryo'),
    ('Muzrabot tumani', 'Surxondaryo'),
    ('Oltinsoy tumani', 'Surxondaryo'),
    ('Qiziriq tumani', 'Surxondaryo'),
    ('Qumqo''rg''on tumani', 'Surxondaryo'),
    ('Sariosiyo tumani', 'Surxondaryo'),
    ('Sherobod tumani', 'Surxondaryo'),
    ('Sho''rchi tumani', 'Surxondaryo'),
    ('Termiz tumani', 'Surxondaryo'),
    ('Uzun tumani', 'Surxondaryo')
)
INSERT INTO districts (name, region_id)
SELECT d.name, r.id
FROM districts_seed d
JOIN regions r ON r.name = d.region_name
WHERE NOT EXISTS (
  SELECT 1
  FROM districts x
  WHERE x.name = d.name
    AND x.region_id = r.id
);

DO $$
BEGIN
  RAISE NOTICE 'Seed 002: Uzbekistan regions/districts inserted successfully (missing only).';
END $$;
