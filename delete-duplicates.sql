-- Barcha duplicate'arni o'chirish (har bir so'zdan faqat bitta qoldirish)
-- Supabase SQL Editor'da shu kodni ishga tushiring:

DELETE FROM vocabulary
WHERE id NOT IN (
  SELECT MIN(id)
  FROM vocabulary
  GROUP BY LOWER(word), user_id
);