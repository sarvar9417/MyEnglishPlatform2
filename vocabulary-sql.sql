-- Vocabulary Words Database Setup
-- Run this SQL in your Supabase SQL Editor

-- 1. Delete duplicates - keep only the first occurrence of each word per user
DELETE FROM vocabulary
WHERE id NOT IN (
  SELECT MIN(id)
  FROM vocabulary
  GROUP BY LOWER(word), user_id
);

-- 2. Insert vocabulary words (duplicates will be ignored due to ON CONFLICT)
INSERT INTO vocabulary (word, translation, example, category, user_id, next_review, review_count, created_at) VALUES
('bacon', 'bekon', 'Bacon is usually eaten on weekends.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('bagel', 'non turi', 'Bagels are popular for breakfast in America.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('breakfast', 'nonushta', 'I eat breakfast every morning.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('bright', 'yorqin', 'Blue, pink, and yellow are bright colors.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('brother-in-law', 'kuyov, pochcha', 'My brother-in-law is a doctor.', 'Advanced', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('cereal', 'yorma', 'Many Americans eat cereal for breakfast.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('chaotic', 'tartibsiz', 'American breakfast can be chaotic.', 'Intermediate', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('childhood', 'bolalik', 'I remember my childhood.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('clothes', 'kiyim', 'I like to wear comfortable clothes.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('coat', 'kurtka', 'In winter, people wear big coats.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('coffee', 'qahva', 'I always drink coffee in the morning.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('colorful', 'rang-bibarang', 'Uzbek people love wearing colorful clothes.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('cook', 'pishirmoq', 'I can cook plov at home.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('cute', 'yoqimli', 'The mini chopon is very cute.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('egg', 'tuxum', 'Eggs are healthy for breakfast.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('fashion show', 'moda namoyishi', 'Chorsu is like a fashion show.', 'Intermediate', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('focus', 'diqqatni jamlamoq', 'I can focus better after breakfast.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('fresh', 'barra', 'Fresh non is very tasty.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('friendly', 'dostonona', 'People at the bazaar are friendly.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('go for a walk', 'sayr qilmoq', 'In my free time, I go for a walk.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('grocery store', 'oziq-ovqat dokoni', 'I buy fruit at the grocery store.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('knife', 'pichoq', 'He saw a boy with a knife.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('knives', 'pichoqlar', 'Its just knives and forks.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('power combo', 'kuchli kombinatsiya', 'English plus breakfast is a power combo.', 'Intermediate', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('scarf', 'sharf', 'I bought a red scarf yesterday.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('sneakers', 'sport oyoq kiyimi', 'He wears sneakers for sport.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('socks', 'paypoq', 'Robert always finds funny socks.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('spicy', 'achchiq', 'Lagman is spicy.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('sugar', 'shakar', 'Some cereals have a lot of sugar.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('unbeatable', 'engib bolmas', 'Uzbek breakfast is unbeatable.', 'Intermediate', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('vietnamese', 'Vetnam', 'Shes Vietnamese.', 'Advanced', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW()),
('young', 'yosh', 'She was very young then.', 'Basic', 'd0e40305-47d1-4ff5-9b74-b1691aceb98c', NOW(), 0, NOW())
ON CONFLICT DO NOTHING;