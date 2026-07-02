-- Reading Plans seed data
-- Idempotent: ON CONFLICT DO NOTHING on slug uniqueIndex

INSERT INTO reading_plans (slug, title, description, length_days, is_seasonal, season_key, season_start, season_end, requires_premium, is_active, sort_order, created_at, updated_at)
VALUES
  ('walking-in-peace',            'Walking in Peace',              'Seven verses on peace, stillness, and trust in God''s provision. A gentle path for any season.',                                            7,  false, '',          NULL, NULL, false, true, 1,  NOW(), NOW()),
  ('strength-in-the-storm',       'Strength in the Storm',         'Perseverance, courage, and God''s faithfulness in the midst of trials. For when the waters are rough.',                                      7,  false, '',          NULL, NULL, true,  true, 2,  NOW(), NOW()),
  ('heart-of-gratitude',          'The Heart of Gratitude',        'A two-week journey through thanksgiving and praise, from the Psalms to the Epistles.',                                                       14, false, '',          NULL, NULL, true,  true, 3,  NOW(), NOW()),
  ('light-for-the-path',          'Light for the Path',            'Wisdom, guidance, and discernment. Fourteen days drawing from Proverbs, the Psalms, and the Gospels.',                                      14, false, '',          NULL, NULL, true,  true, 4,  NOW(), NOW()),
  ('rooted-in-love',              'Rooted in Love',                'A month through Scripture''s teaching on love — for God, for neighbor, for self, and for enemy.',                                           30, false, '',          NULL, NULL, true,  true, 5,  NOW(), NOW()),
  ('names-of-god',                'The Names of God',              'Seven days discovering who God is through the names He reveals in Scripture — Creator, the One who sees, Provider, Healer, Almighty, Shepherd, and Banner.', 7,  false, '',          NULL, NULL, true,  true, 6,  NOW(), NOW()),
  ('advent-waiting-for-the-light','Advent: Waiting for the Light', 'A 28-day Advent devotional walking through prophecy, anticipation, and the coming of the Light of the World.',                             28, true,  'advent',    NULL, NULL, true,  true, 10, NOW(), NOW()),
  ('lent-road-to-the-cross',      'Lent: The Road to the Cross',   'Forty days of Scripture on sacrifice, repentance, and the road to Calvary.',                                                               40, true,  'lent',      NULL, NULL, true,  true, 11, NOW(), NOW()),
  ('holy-week',                   'Holy Week',                     'Seven days walking with Jesus through the final week — Palm Sunday through Easter morning.',                                                 7,  true,  'holy-week', NULL, NULL, true,  true, 12, NOW(), NOW()),
  ('pentecost-breath-of-fire',    'Pentecost: Breath of Fire',     'Seven days exploring the coming of the Holy Spirit and the birth of the Church.',                                                           7,  true,  'pentecost', NULL, NULL, true,  true, 13, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
