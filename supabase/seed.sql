-- ============================================
-- YILLAR · seed — стартовый каталог треков
-- ============================================
-- Узбекские/советские/русские песни трёх эр.
-- Заменяйте youtube_id на проверенные ID, у которых разрешён embed.

insert into public.tracks (youtube_id, artist, title, year, era) values
  -- KLASSIKA (1960–89)
  ('hT_nvWreIhg', 'BOTIR ZAKIROV',  'ARABCHA TANGO',     1968, 'klassika'),
  ('L_jWHffIx5E', 'OYBEK',           'VATAN',             1974, 'klassika'),
  ('dQw4w9WgXcQ', 'YALLA',           'UCHQUDUQ',          1981, 'klassika'),
  ('OPf0YbXqDm0', 'DILSHOD',         'MUHABBAT',          1985, 'klassika'),
  -- KASSETA (1990–99)
  ('fJ9rUzIMcZQ', 'NARGIZ',          'OYDIN KECHALAR',    1992, 'kasseta'),
  ('JGwWNGJdvx8', 'SOG''INDI',       'KO''CHALAR',        1995, 'kasseta'),
  ('9bZkp7q19f0', 'BOLALIK',         'QORA KO''ZLAR',     1996, 'kasseta'),
  ('uelHwf8o7_U', 'YULDUZ USMONOVA', 'AYOLLAR',           1998, 'kasseta'),
  -- TSIFRA (2000+)
  ('kJQP7kiw5Fk', 'SETORA',          'GULBAHOR',          2007, 'tsifra'),
  ('YQHsXMglC9A', 'RAYHON',          'BAXTLI BO''LING',   2008, 'tsifra'),
  ('CevxZvSJLk8', 'ZIYODA',          'QIZIL OLMA',        2011, 'tsifra'),
  ('RgKAFK5djSk', 'BENYAMIN',        'TASHKENT',          2015, 'tsifra')
on conflict (youtube_id) do nothing;
