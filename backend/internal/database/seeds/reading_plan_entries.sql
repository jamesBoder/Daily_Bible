-- Reading Plan Entries seed data
-- Entries are only inserted when zero entries exist for the plan (idempotent).

-- Walking in Peace (7 days)
INSERT INTO reading_plan_entries (plan_id, day_number, verse_ref, reflection, created_at)
SELECT p.id, v.day_number, v.verse_ref, v.reflection, NOW()
FROM reading_plans p,
(VALUES
  (1, 'John 14:27',       'Jesus offers a peace the world cannot give — not the absence of trouble, but the presence of God in the midst of it.'),
  (2, 'Psalm 23:2',       'Still waters do not mean stagnant waters. God leads us to a place of rest that restores the soul.'),
  (3, 'Isaiah 26:3',      'Perfect peace is not found in perfect circumstances. It is found in a mind fixed on God.'),
  (4, 'Philippians 4:7',  'The peace of God surpasses understanding. We cannot reason our way to it — we receive it through prayer.'),
  (5, 'Matthew 11:28-30', 'Jesus does not ask us to earn rest. He asks us to come to Him — yoke and all.'),
  (6, 'Psalm 46:10',      'Be still. Not passive — but present. God is God, and that is enough.'),
  (7, 'Romans 15:13',     'Peace is not the end of the journey. It is the foundation from which hope overflows.')
) AS v(day_number, verse_ref, reflection)
WHERE p.slug = 'walking-in-peace'
  AND NOT EXISTS (SELECT 1 FROM reading_plan_entries WHERE plan_id = p.id);

-- Strength in the Storm (7 days)
INSERT INTO reading_plan_entries (plan_id, day_number, verse_ref, reflection, created_at)
SELECT p.id, v.day_number, v.verse_ref, v.reflection, NOW()
FROM reading_plans p,
(VALUES
  (1, 'Psalm 46:1',         'God is our refuge — not after the storm, but in the very midst of it.'),
  (2, 'Isaiah 41:10',       'Fear not. Three words that carry the weight of a promise: God is with you, He will strengthen you, He will uphold you.'),
  (3, 'James 1:2-4',        'Trials produce steadfastness. Not despite suffering, but through it.'),
  (4, '2 Corinthians 4:17', 'The weight of glory is heavier than any burden. Paul writes from a prison cell — and he calls it light.'),
  (5, 'Romans 8:28',        'All things. Not just the good ones. God works through the broken pieces too.'),
  (6, 'Psalm 34:18',        'Brokenhearted. Crushed in spirit. God is close to those who are there.'),
  (7, 'Nahum 1:7',          'In the day of trouble, God knows those who take refuge in Him. He knows you.')
) AS v(day_number, verse_ref, reflection)
WHERE p.slug = 'strength-in-the-storm'
  AND NOT EXISTS (SELECT 1 FROM reading_plan_entries WHERE plan_id = p.id);

-- The Heart of Gratitude (14 days)
INSERT INTO reading_plan_entries (plan_id, day_number, verse_ref, reflection, created_at)
SELECT p.id, v.day_number, v.verse_ref, v.reflection, NOW()
FROM reading_plans p,
(VALUES
  (1,  'Psalm 100:4',          'Enter with thanksgiving. Gratitude is the posture of the heart before it is the words of the mouth.'),
  (2,  '1 Thessalonians 5:18', 'Give thanks in all circumstances. Not for all circumstances — but in them.'),
  (3,  'Psalm 107:1',          'Give thanks to the LORD, for He is good. Begin there. End there. Return there.'),
  (4,  'Colossians 3:15-17',   'Let the peace of Christ rule. Let the word of Christ dwell. And do everything with thanksgiving.'),
  (5,  'Psalm 9:1',            'With my whole heart. Gratitude is not a surface feeling — it is a whole-person posture.'),
  (6,  'Philippians 4:6',      'In everything by prayer and thanksgiving. Even the anxious moments become offerings.'),
  (7,  'Psalm 136:1',          'His steadfast love endures forever. Twenty-six times in twenty-six verses. Say it until it lands.'),
  (8,  'Luke 17:15-16',        'One returned to give thanks. Gratitude is a choice — and it is rarer than we think.'),
  (9,  'Psalm 34:1',           'I will bless the LORD at all times. Not when it is easy. At all times.'),
  (10, 'Ephesians 5:20',       'Always giving thanks for everything. Paul means it. Even this. Even now.'),
  (11, 'Psalm 50:14',          'Offer to God a sacrifice of thanksgiving. Sometimes gratitude is a sacrifice, not a feeling.'),
  (12, 'Hebrews 13:15',        'A sacrifice of praise — the fruit of lips that acknowledge His name.'),
  (13, 'Psalm 92:1-2',         'It is good to give thanks in the morning. To declare His steadfast love at nightfall.'),
  (14, 'Revelation 7:12',      'Blessing and glory and wisdom and thanksgiving. Gratitude is the language of eternity.')
) AS v(day_number, verse_ref, reflection)
WHERE p.slug = 'heart-of-gratitude'
  AND NOT EXISTS (SELECT 1 FROM reading_plan_entries WHERE plan_id = p.id);

-- Light for the Path (14 days)
-- NOTE: Day 3 placeholder is James 1:5; Part 1c upgrades it to 1 Kings 3:5-12
-- to avoid passage overlap with Strength in the Storm Day 3 (James 1:2-8).
INSERT INTO reading_plan_entries (plan_id, day_number, verse_ref, reflection, created_at)
SELECT p.id, v.day_number, v.verse_ref, v.reflection, NOW()
FROM reading_plans p,
(VALUES
  (1,  'Psalm 119:105',  'Your word is a lamp to my feet — not a floodlight to the horizon. One step at a time.'),
  (2,  'Proverbs 3:5-6', 'Trust in the LORD with all your heart. Lean not on your own understanding. He will make straight your paths.'),
  (3,  'James 1:5',      'If any of you lacks wisdom, let him ask God. The asking is part of the receiving.'),
  (4,  'Isaiah 30:21',   'Your ears shall hear a word behind you: "This is the way, walk in it." He speaks — are we listening?'),
  (5,  'John 8:12',      'I am the light of the world. The one who follows Me will not walk in darkness.'),
  (6,  'Proverbs 16:9',  'The heart of man plans his way, but the LORD establishes his steps.'),
  (7,  'Psalm 25:4-5',   'Make me to know your ways, O LORD. Lead me in your truth. A prayer for every crossroads.'),
  (8,  'Romans 12:2',    'Be transformed by the renewal of your mind, that you may discern what is the will of God.'),
  (9,  'Jeremiah 29:11', 'Plans for welfare and not for evil, to give you a future and a hope. This is His posture toward you.'),
  (10, 'Psalm 32:8',     'I will instruct you and teach you in the way you should go. He will not leave you to navigate alone.'),
  (11, 'Proverbs 11:14', 'Where there is no guidance, a people falls; but in an abundance of counselors there is safety.'),
  (12, 'Matthew 7:7-8',  'Ask, and it will be given. Seek, and you will find. Knock, and it will be opened.'),
  (13, 'Colossians 1:9', 'That you may be filled with the knowledge of His will in all spiritual wisdom and understanding.'),
  (14, 'Psalm 48:14',    'This is God, our God forever and ever. He will guide us forever.')
) AS v(day_number, verse_ref, reflection)
WHERE p.slug = 'light-for-the-path'
  AND NOT EXISTS (SELECT 1 FROM reading_plan_entries WHERE plan_id = p.id);

-- Rooted in Love (30 days)
INSERT INTO reading_plan_entries (plan_id, day_number, verse_ref, reflection, created_at)
SELECT p.id, v.day_number, v.verse_ref, v.reflection, NOW()
FROM reading_plans p,
(VALUES
  (1,  'John 3:16',              'For God so loved the world. The most famous verse in Scripture. Read it again as if for the first time.'),
  (2,  '1 John 4:8',             'God is love. Not that God is loving — that He is love itself. It is His nature, not a mood.'),
  (3,  'Hosea 11:1-4',           'God drew Israel with cords of a man, with bands of love — persistent and parental, working beneath the surface while they did not know it.'),
  (4,  '1 Corinthians 13:4-7',   'Love is patient. Love is kind. Read this slowly. Let it measure and reshape you.'),
  (5,  'Matthew 22:37-39',       'Love God with everything. Love your neighbor as yourself. All the law hangs on these two.'),
  (6,  'Ephesians 3:17-19',      'That you may be rooted and grounded in love — to know the love that surpasses knowledge.'),
  (7,  '1 John 4:19',            'We love because He first loved us. Love is a response, not an achievement.'),
  (8,  'John 13:34-35',          'Love one another as I have loved you. The world will know you are His disciples by this.'),
  (9,  'Luke 6:27-28',           'Love your enemies. Do good to those who hate you. This is the hardest verse on this path.'),
  (10, 'Song of Solomon 8:7',    'Many waters cannot quench love. It endures. It persists. It will not be drowned.'),
  (11, 'Zephaniah 3:17',         'The LORD your God is in your midst — He will rejoice over you with gladness and quiet you with His love.'),
  (12, 'Psalm 103:8-12',         'As far as the east is from the west — a directionality without poles. God removes transgressions in infinite, not merely large, terms.'),
  (13, 'Romans 5:8',             'God shows His love for us in that while we were still sinners, Christ died for us.'),
  (14, 'Galatians 5:13',         'You were called to freedom. Only do not use your freedom as an opportunity for the flesh, but serve one another in love.'),
  (15, 'Colossians 3:14',        'Above all these, put on love, which binds everything together in perfect harmony.'),
  (16, 'Proverbs 17:17',         'A friend loves at all times, and a brother is born for a time of adversity.'),
  (17, 'John 15:12-13',          'Love one another as I have loved you. Greater love has no one than this: to lay down one''s life.'),
  (18, '1 Peter 4:8',            'Above all, keep loving one another earnestly, since love covers a multitude of sins.'),
  (19, 'Psalm 103:17',           'The steadfast love of the LORD is from everlasting to everlasting on those who fear Him.'),
  (20, 'Micah 6:8',              'Do justice, and love kindness, and walk humbly with your God. Love made visible in the world.'),
  (21, '1 John 3:18',            'Let us not love in word or talk but in deed and in truth. Love is a verb.'),
  (22, 'Isaiah 54:10',           'Though the mountains be shaken and the hills be removed, my unfailing love for you will not be shaken.'),
  (23, 'Matthew 5:43-45',        'Love your enemies and pray for those who persecute you, so that you may be sons of your Father.'),
  (24, 'Psalm 86:15',            'You, O Lord, are a God merciful and gracious, slow to anger and abounding in steadfast love.'),
  (25, 'John 16:27',             'The Father Himself loves you, because you have loved Me and believed that I came from God.'),
  (26, '2 Thessalonians 3:5',    'May the Lord direct your hearts to the love of God and to the steadfastness of Christ.'),
  (27, 'Lamentations 3:22-23',   'The steadfast love of the LORD never ceases; His mercies never come to an end. They are new every morning.'),
  (28, 'Deuteronomy 7:9',        'The faithful God who keeps covenant and steadfast love with those who love Him — to a thousand generations.'),
  (29, '1 Corinthians 16:14',    'Let all that you do be done in love. Not just the big moments. Everything.'),
  (30, 'Romans 8:39',            'Nor anything else in all creation will be able to separate us from the love of God in Christ Jesus our Lord. Amen.')
) AS v(day_number, verse_ref, reflection)
WHERE p.slug = 'rooted-in-love'
  AND NOT EXISTS (SELECT 1 FROM reading_plan_entries WHERE plan_id = p.id);

-- ============================================================
-- Part 1b Enrichment — UPDATE existing entries with prayer,
-- application, question, context_note, and is_memory_verse.
-- Uses (plan_slug, day_number) as the stable key so these
-- are safe to re-run (idempotent UPDATEs).
-- ============================================================

-- Walking in Peace (7 days)
UPDATE reading_plan_entries e
SET
  prayer         = v.prayer,
  application    = v.application,
  question       = v.question,
  context_note   = v.context_note,
  content_type   = 'verse',
  is_memory_verse = v.is_memory_verse
FROM reading_plans p,
(VALUES
  (1,
   'Lord Jesus, You offered Your peace as a parting gift before the cross. I receive it now. Still my heart wherever it is unsettled, and remind me that Your presence is enough. Amen.',
   'Write down one thing stealing your peace today. Hold it in your open hands for thirty seconds and consciously give it to God before you do anything else.',
   'When have you experienced a peace that made no logical sense given your circumstances? What was different about that season?',
   'Jesus spoke these words in the upper room the night before His crucifixion (John 14). His peace was not the absence of suffering — He was walking directly toward it.',
   true
  ),
  (2,
   'Good Shepherd, lead me beside still waters today. Where my soul is worn and restless, restore it. I trust You to know the path I cannot see. Amen.',
   'Find five minutes of physical stillness today — no screen, no sound. Just sit. Notice what happens in your body and your thoughts.',
   'What does "rest" actually mean to you right now? Is there a form of rest you have been avoiding?',
   'Psalm 23 is likely David''s most personal poem. The imagery of still waters (Hebrew: *me menuhot*) means resting waters — the kind that do not frighten sheep, who fear fast currents.',
   false
  ),
  (3,
   'Father, fix my mind on You today. When anxious thoughts rise up, help me return to this promise: perfect peace for a steadfast heart. Amen.',
   'Choose one worry you have been carrying and rehearse a single truth about God that speaks directly to it. Write that truth somewhere visible.',
   'What does it look like practically for you to "keep your mind" on God during an ordinary workday?',
   'Isaiah 26:3 comes from a song of praise in a chapter describing God''s final victory. The word "perfect" in Hebrew is *shalom shalom* — peace doubled for emphasis.',
   false
  ),
  (4,
   'Lord, I bring my anxiety to You right now in prayer. What I cannot understand, You hold. Guard my heart and mind with the peace that is beyond all reasoning. Amen.',
   'Before you check your phone or email this morning, spend two minutes in prayer listing specific things you are grateful for. Let that be the first input of the day.',
   'Paul wrote Philippians from prison. How does knowing that change the weight of his instruction to "not be anxious about anything"?',
   'Philippians 4:6-7 was written from a Roman prison cell, likely around AD 61. The "peace of God" Paul describes was a present reality for him in chains — not a future hope.',
   true
  ),
  (5,
   'Jesus, I come to You weary. I accept Your invitation. Teach me what it means to take Your yoke — to share the burden instead of carrying it alone. Amen.',
   'Identify the heaviest thing you are carrying right now. Ask a trusted person to pray with you about it today — share the load literally.',
   'What is the difference between Jesus'' yoke being "easy" and life being painless? Have you ever experienced genuine rest in the middle of a hard season?',
   'In first-century Jewish culture, a "yoke" was also a metaphor for a rabbi''s teaching. Jesus is inviting His followers to exchange the burden of religious law for the lightness of relationship with Him.',
   false
  ),
  (6,
   'God, I quiet myself before You now. Help me to stop striving and simply know — really know — that You are God and that is enough. Be exalted in my life today. Amen.',
   'Set a two-minute timer and sit in silence before God. No agenda, no list. Simply be still. If thoughts intrude, gently return to the phrase: "You are God."',
   'Stillness is countercultural. What makes it hard for you personally? What would change if you practiced one minute of intentional stillness each morning?',
   'Psalm 46 was likely written in response to a military crisis — possibly the Assyrian siege of Jerusalem in 701 BC. "Be still" (*raphah*) means to let go, to release, to stop fighting.',
   false
  ),
  (7,
   'God of hope, fill me with all joy and peace as I trust in You, so that I may overflow with hope by the power of Your Holy Spirit. Make that promise real in my life today. Amen.',
   'End this plan by writing one sentence about how your understanding of peace has shifted over these seven days. Keep it somewhere you will find it in a hard moment.',
   'Romans 15:13 describes peace as a foundation from which hope overflows. Looking back at this week — where do you feel the most peace? Where is God inviting you to grow?',
   'Romans 15:13 is Paul''s closing benediction before his final greetings. He has spent fifteen chapters building a case for the gospel — and he closes not with doctrine, but with a blessing of peace.',
   false
  )
) AS v(day_number, prayer, application, question, context_note, is_memory_verse)
WHERE p.slug = 'walking-in-peace'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Strength in the Storm (7 days)
UPDATE reading_plan_entries e
SET
  prayer         = v.prayer,
  application    = v.application,
  question       = v.question,
  context_note   = v.context_note,
  content_type   = 'verse',
  is_memory_verse = v.is_memory_verse
FROM reading_plans p,
(VALUES
  (1,
   'Lord, You are my refuge right now, in the middle of this storm — not on the other side of it. I choose to run to You, not away from You. Be my very present help. Amen.',
   'Name the storm you are in right now. Write it down plainly. Then write the words "God is my refuge" directly beneath it.',
   'Psalm 46 says God is a "very present help in trouble." When has God felt most present to you during a difficult season — not before or after it, but in it?',
   'Psalm 46 is an anonymous psalm of confidence, possibly written in response to the miraculous deliverance of Jerusalem from Assyria (2 Kings 19). The opening declaration is present tense — not future.',
   true
  ),
  (2,
   'Father, I receive Your command: "Fear not." Not because my circumstances have changed, but because You are with me. Strengthen me today, uphold me with Your righteous right hand. Amen.',
   'Read Isaiah 41:10 aloud three times slowly. Let each reading land on a different word: "I am with you." "I will strengthen you." "I will uphold you."',
   '"Fear not" appears over 300 times in the Bible. Why do you think God repeats this command so often? What specific fear are you carrying right now that needs to hear it?',
   'Isaiah 41:10 was addressed to Israel in Babylonian exile — a people who had lost everything: homeland, temple, and national identity. God''s command to not fear was spoken into total devastation.',
   false
  ),
  (3,
   'Lord, I confess I do not always want steadfastness — I want relief. Teach me to see this trial through Your eyes. Produce in me the character that only suffering makes possible. Amen.',
   'Write down one way you have already grown through a past difficulty you would never have chosen. Let that be evidence that God can work through this one too.',
   'James says to "consider it all joy" when you face trials. What would it look like to hold both genuine grief and genuine trust at the same time — not pretending the pain isn''t real?',
   'James 1:2-4 echoes a Stoic philosophical tradition James reframes through faith: hardship produces virtue. But unlike Stoicism, James points to a Person — not willpower — as the source of endurance.',
   false
  ),
  (4,
   'Jesus, when I look at my circumstances I feel crushed. Help me to look up and see what Paul saw from his prison cell — that this is light and momentary, and glory is coming. Amen.',
   'Write down the hardship you are carrying. Next to it write: "This is preparing an eternal weight of glory beyond all comparison." Read it again tomorrow.',
   'Paul calls his suffering "light and momentary" — yet he was shipwrecked, beaten, imprisoned, and eventually executed. What does it mean to hold suffering that lightly? Is that even possible?',
   '2 Corinthians 4:17 was written by Paul after extraordinary suffering (see 2 Cor 11:23-27). His ability to call it "light" was not denial — it was perspective forged by genuine encounter with the risen Christ.',
   true
  ),
  (5,
   'Father, I trust that You are working in this — even the parts I cannot see or understand. Help me to stop demanding an explanation and start looking for Your hand. Amen.',
   'Think of one "broken piece" in your life right now. Ask God in prayer: "What are You making out of this?" Then listen for even a partial answer.',
   'Romans 8:28 says "all things" — not just the good ones. What is one painful thing in your past that you can now see God used for good? What does that tell you about what He might do now?',
   'Romans 8:28 is one of the most misused verses in the Bible — often quoted to minimize pain. Paul''s context is one of suffering, groaning creation, and the Spirit interceding with wordless sighs (v.26). "Good" means conformity to Christ, not personal comfort.',
   false
  ),
  (6,
   'Lord, You are close to me right now even when I cannot feel it. Draw near to my broken heart today. I am not too far gone, not too crushed for You. Amen.',
   'Reach out to someone you know who is brokenhearted today — not to fix anything, just to say: "I am here." Be the nearness of God to someone else.',
   'David writes that God is "close to the brokenhearted." When have you felt that closeness most acutely? What made it real to you — a person, a moment, a word?',
   'Psalm 34 is an acrostic psalm (each verse begins with the next letter of the Hebrew alphabet) written after David feigned madness before the Philistine king Abimelech. He writes praise in the aftermath of fear.',
   false
  ),
  (7,
   'Lord, in this day of trouble, I take refuge in You. You know me. You know this storm. And You are good. I trust You with what I cannot control. Amen.',
   'Close this plan by writing a one-sentence declaration of trust. Not that the storm is over — but that God is good in the middle of it. Keep it somewhere visible.',
   'Nahum 1:7 says God "knows those who take refuge in Him." What does it mean to be known by God in the middle of suffering — not just helped, but known?',
   'The book of Nahum is rarely read — it is an oracle of judgment against Nineveh, the capital of Assyria that had brutalized Israel. Verse 1:7 is a sudden pivot in the middle of the oracle: God is good, and He knows those who hide in Him.',
   false
  )
) AS v(day_number, prayer, application, question, context_note, is_memory_verse)
WHERE p.slug = 'strength-in-the-storm'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 1c — Walking in Peace: passage text, day titles,
-- expanded verse refs, cross-references, enriched reflections,
-- and content_type = 'passage'.
-- Fully idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET
  verse_ref    = v.verse_ref,
  day_title    = v.day_title,
  passage_text = v.passage_text,
  passage_refs = v.passage_refs,
  reflection   = v.reflection,
  content_type = 'passage'
FROM reading_plans p,
(VALUES
  (1,
   'John 14:23-27',
   'The Peace That Passes Understanding',
   'Jesus answered and said unto him, If a man love me, he will keep my words: and my Father will love him, and we will come unto him, and make our abode with him. He that loveth me not keepeth not my sayings: and the word which ye hear is not mine, but the Father''s which sent me. These things have I spoken unto you, being yet present with you. But the Comforter, which is the Holy Ghost, whom the Father will send in my name, he shall teach you all things, and bring all things to your remembrance, whatsoever I have said unto you. Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.',
   '["John 14:1", "Colossians 3:15"]',
   'Jesus spoke these words on the night He would be betrayed, hours before the cross. He knew exactly what was coming — and He gave His peace anyway. This is not the peace of a man who has escaped trouble; it is the peace of One walking directly into it. The word "give" here is used elsewhere for an inheritance — something permanent, not conditional. The Comforter He promises is the very presence of God in the believer. Whatever you are carrying today, this peace is not a reward to be earned. It is already yours.'
  ),
  (2,
   'Psalm 23:1-6',
   'Still Waters',
   'The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name''s sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me. Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over. Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.',
   '["Psalm 62:1", "Isaiah 40:11"]',
   'David wrote this psalm as a shepherd himself — he knew what it meant to search out quiet water for anxious sheep. The Hebrew *me menuhot* (still waters) describes resting, restoring water — not stagnant pools but calm places of refreshment. But notice: God does not force the sheep. He leads. You can resist the leading and stay in the dry place, or you can follow. The promise is not a life without valleys — verse four places still waters just before the shadow of death. The Shepherd does not reroute you around the hard path. He walks every step of it with you.'
  ),
  (3,
   'Isaiah 26:3-4',
   'The Steadfast Mind',
   'Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee. Trust ye in the LORD for ever: for in the LORD JEHOVAH is everlasting strength.',
   '["Philippians 4:7", "Psalm 112:7"]',
   'In the Hebrew, "perfect peace" is *shalom shalom* — peace doubled, peace upon peace. It is not a diminished calm but an overflowing abundance. And the condition is striking: not perfect obedience, not a season without hardship, but a mind that is *stayed* — leaned, supported, resting its full weight on God. When the mind is the problem, willpower is not the solution. Re-anchoring is. Every anxious thought is an invitation to lean again. The peace is waiting on the other side of that choice.'
  ),
  (4,
   'Philippians 4:4-8',
   'The Peace That Guards',
   'Rejoice in the Lord alway: and again I say, Rejoice. Let your moderation be known unto all men. The Lord is at hand. Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus. Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things.',
   '["Isaiah 26:3", "Colossians 3:15"]',
   'Paul wrote these words from a Roman prison cell, likely around AD 61. He opens with a command that sounds almost flippant in that context: "Rejoice always." What he is describing is not a feeling that comes when circumstances improve — it is a discipline of re-orientation. The instruction is specific: bring everything to God by prayer, with thanksgiving, and let your requests be made known. The result is not that God fixes everything. The result is that a peace which *surpasses understanding* guards your heart like a soldier posted at the gate. And then Paul names what to fill the mind with instead: the true, the honest, the just, the pure, the lovely. This is the practical path.'
  ),
  (5,
   'Matthew 11:28-30',
   'The Easy Yoke',
   'Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls. For my yoke is easy, and my burden is light.',
   '["Psalm 55:22", "1 Peter 5:7"]',
   'In first-century Jewish culture, a rabbi''s "yoke" was his interpretation of the law — the particular set of demands he placed on his disciples. The scribes and Pharisees had made the yoke impossibly heavy, piling regulation upon regulation. Jesus offers a different yoke: not the absence of demand, but a burden carried alongside Him. "Learn of me," He says — this is not a transaction but a relationship. The rest He promises is not the rest of having nothing to carry. It is the rest of carrying it with someone who is meek and lowly in heart, who will never crush you under what He asks.'
  ),
  (6,
   'Psalm 46:1-11',
   'Be Still and Know',
   'God is our refuge and strength, a very present help in trouble. Therefore will not we fear, though the earth be removed, and though the mountains be carried into the midst of the sea; Though the waters thereof roar and be troubled, though the mountains shake with the swelling thereof. Selah. There is a river, the streams whereof shall make glad the city of God, the holy place of the tabernacles of the most High. God is in the midst of her; she shall not be moved: God shall help her, and that right early. The heathen raged, the kingdoms were moved: he uttered his voice, the earth melted. The LORD of hosts is with us; the God of Jacob is our refuge. Selah. Come, behold the works of the LORD, what desolations he hath made in the earth. He maketh wars to cease unto the end of the earth; he breaketh the bow, and cutteth the spear in sunder; he burneth the chariot in the fire. Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth. The LORD of hosts is with us; the God of Jacob is our refuge. Selah.',
   '["Psalm 62:5", "Zephaniah 3:17"]',
   'This psalm was likely written in the shadow of war — possibly the Assyrian siege that threatened to annihilate Jerusalem. The Psalmist does not deny the mountains shaking or the waters roaring. He names them directly. But then, in the middle of the storm, comes the anchor: "God is in the midst of her; she shall not be moved." The turning point is not a change in circumstances but a change in attention. "Be still" (*raphah* in Hebrew) does not mean passive. It means to let go of your grip, to stop striving, to release your clenched effort to control the outcome. The reason given is not that things will improve — it is that God is God. And that has always been enough.'
  ),
  (7,
   'Romans 15:9-13',
   'The God of Hope',
   'And that the Gentiles might glorify God for his mercy; as it is written, For this cause I will confess to thee among the Gentiles, and sing unto thy name. And again he saith, Rejoice, ye Gentiles, with his people. And again, Praise the Lord, all ye Gentiles; and laud him, all ye people. And again, Esaias saith, There shall be a root of Jesse, and he that shall rise to reign over the Gentiles; in him shall the Gentiles trust. Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.',
   '["Philippians 4:7", "Romans 5:1"]',
   'Paul closes fifteen chapters of dense theological argument not with a formula but a benediction — a gift. He does not say "understand peace" or "achieve peace." He says "be filled with all joy and peace *in believing*." The believing is the engine; the filling is God''s work. This is not a one-time act but a sustained posture: trusting the God who has proven Himself faithful across the whole sweep of Scripture Paul has just traced. And the result is not quiet contentment but overflowing hope — abundance spilling outward. Peace is not where this journey ends. It is where the next one begins.'
  )
) AS v(day_number, verse_ref, day_title, passage_text, passage_refs, reflection)
WHERE p.slug = 'walking-in-peace'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 2a — Walking in Peace: comprehension check questions.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET
  quiz_question    = v.question,
  quiz_options     = v.options,
  quiz_explanation = v.explanation
FROM reading_plans p,
(VALUES
  (1,
   'What does Jesus say He leaves with His disciples in verse 27?',
   '[{"label":"A","text":"His teaching","correct":false},{"label":"B","text":"His peace","correct":true},{"label":"C","text":"His Spirit","correct":false}]',
   'Verse 27 says "Peace I leave with you, my peace I give unto you" — a parting gift before the cross, distinct from anything the world can offer.'
  ),
  (2,
   'What does the shepherd-psalmist say God does for the soul in verse 3?',
   '[{"label":"A","text":"Strengthens it","correct":false},{"label":"B","text":"Restores it","correct":true},{"label":"C","text":"Judges it","correct":false}]',
   'Verse 3 says "He restoreth my soul" — the Hebrew nephesh means the whole person, breath and being. Restoration here means renewed vitality after deep exhaustion.'
  ),
  (3,
   'What does Isaiah say is the condition for God keeping someone in "perfect peace"?',
   '[{"label":"A","text":"A mind stayed on God","correct":true},{"label":"B","text":"A life without trials","correct":false},{"label":"C","text":"Faithful obedience to the law","correct":false}]',
   '"Whose mind is stayed on thee: because he trusteth in thee." The condition is not perfect behavior — it is a mind leaned on God, a posture of trust rather than achievement.'
  ),
  (4,
   'Paul says the peace of God will "keep" the heart and mind. What does the Greek word phroureō mean?',
   '[{"label":"A","text":"To sustain and nourish","correct":false},{"label":"B","text":"To guard like a soldier at a gate","correct":true},{"label":"C","text":"To fill and overflow","correct":false}]',
   'Phroureō is a military term — to garrison, to post soldiers at a gate. Paul says the peace of God stands watch over the heart and mind like a sentinel.'
  ),
  (5,
   'According to Jesus, where will those who take His yoke find rest?',
   '[{"label":"A","text":"In better circumstances","correct":false},{"label":"B","text":"In their souls","correct":true},{"label":"C","text":"At the end of life","correct":false}]',
   'Jesus says "ye shall find rest unto your souls" — not rest from all difficulty, but rest at the deepest level of the person. It comes from learning His ways and sharing the burden with Him.'
  ),
  (6,
   'The psalmist commands "Be still." What does the Hebrew word raphah actually mean?',
   '[{"label":"A","text":"To be silent in prayer","correct":false},{"label":"B","text":"To release your grip and stop striving","correct":true},{"label":"C","text":"To wait patiently for rescue","correct":false}]',
   'Raphah means to let go, to release your grip, to cease striving — an active choice to stop fighting for control. It is surrender to the One who is God.'
  ),
  (7,
   'In verse 13, what does Paul say believers will "abound in" through the power of the Holy Ghost?',
   '[{"label":"A","text":"Peace","correct":false},{"label":"B","text":"Joy","correct":false},{"label":"C","text":"Hope","correct":true}]',
   'Paul says "that ye may abound in hope, through the power of the Holy Ghost." Joy and peace are the means; hope is the overflow — the abundance the Spirit produces in the believing heart.'
  )
) AS v(day_number, question, options, explanation)
WHERE p.slug = 'walking-in-peace'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 2c — Walking in Peace: word studies for memory verse
-- days (days 1 and 4). Keys are lowercase, punctuation-stripped
-- forms of the word as it appears in the passage text.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (1,
   '{"peace":{"original":"εἰρήνη","transliteration":"eirēnē","definition":"Wholeness and wellbeing — the NT equivalent of shalom. Not merely the absence of conflict but the presence of all good.","refs":["Numbers 6:26","Colossians 3:15"]},"comforter":{"original":"παράκλητος","transliteration":"paraklētos","definition":"One called alongside to help — an advocate, helper, or counselor. Used of the Holy Spirit and of Christ interceding for believers.","refs":["John 15:26","1 John 2:1"]},"troubled":{"original":"ταράσσω","transliteration":"tarassō","definition":"To stir up, agitate, or disturb — used of waves churned by wind. Jesus uses this same word in John 14:1.","refs":["John 14:1"]}}'
  ),
  (4,
   '{"peace":{"original":"εἰρήνη","transliteration":"eirēnē","definition":"Wholeness and wellbeing that transcends rational explanation. Paul says it passes all understanding — it cannot be produced by the mind, only received.","refs":["Isaiah 26:3","Colossians 3:15"]},"keep":{"original":"φρουρέω","transliteration":"phroureo","definition":"A military term — to guard or garrison. Used of soldiers posted at a city gate. This is the metaphor Paul uses for how the peace of God protects the heart.","refs":["1 Peter 1:5"]},"understanding":{"original":"νοῦς","transliteration":"nous","definition":"The rational mind or human comprehension. Paul says the peace of God surpasses it — it is received through prayer and trust, not produced by reason.","refs":["Romans 12:2"]}}'
  )
) AS v(day_number, ws)
WHERE p.slug = 'walking-in-peace'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 1c — Strength in the Storm: passage text, day titles,
-- expanded verse refs, cross-references, enriched reflections,
-- and content_type = 'passage'.
-- Fully idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET
  verse_ref    = v.verse_ref,
  day_title    = v.day_title,
  passage_text = v.passage_text,
  passage_refs = v.passage_refs,
  reflection   = v.reflection,
  content_type = 'passage'
FROM reading_plans p,
(VALUES
  (1,
   'Psalm 46:1-3',
   'God in the Midst of the Storm',
   'God is our refuge and strength, a very present help in trouble. Therefore will not we fear, though the earth be removed, and though the mountains be carried into the midst of the sea; Though the waters thereof roar and be troubled, though the mountains shake with the swelling thereof. Selah.',
   '["Isaiah 41:10", "Deuteronomy 31:6"]',
   'The opening of Psalm 46 does not minimize the storm — it names it. Mountains removed, seas roaring, the whole world in upheaval. Into that chaos comes a single declaration: God is our refuge and strength. Not was, not will be — is. The present tense is the psalm''s whole argument: the refuge is not waiting on the other side of the storm; it is already occupied, and you are already inside it. Whatever waters are roaring around you today, you are standing on ground that cannot be moved.'
  ),
  (2,
   'Isaiah 41:10-13',
   'Fear Not, I Am With You',
   'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness. Behold, all they that were incensed against thee shall be ashamed and confounded: they shall be as nothing; and they that strive with thee shall perish. Thou shalt seek them, and shalt not find them, even them that contended with thee: they that war against thee shall be as nothing, and as a thing of nought. For I the LORD thy God will hold thy right hand, saying unto thee, Fear not; I will help thee.',
   '["Psalm 46:1", "Joshua 1:9"]',
   '"Fear not" is the most repeated command in the Bible — spoken over and over because God knows fear never truly stops whispering. Here He does not merely command the fear to stop; He gives five reasons in a single verse: I am with you, I am your God, I will strengthen you, I will help you, I will uphold you. The image that closes verse 13 is intimate: God takes your right hand. Not the hand you extend in formal greeting, but the working hand, the trembling hand, the hand that signals how afraid you really are. The One holding it is not troubled by what He feels there. You do not have to hide your fear from the One whose hand is wrapped around it.'
  ),
  (3,
   'James 1:2-8',
   'The Making of Steadfastness',
   'My brethren, count it all joy when ye fall into divers temptations; Knowing this, that the trying of your faith worketh patience. But let patience have her perfect work, that ye may be perfect and entire, wanting nothing. If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him. But let him ask in faith, nothing wavering. For he that wavereth is like a wave of the sea driven with the wind and tossed. For let not that man think that he shall receive any thing of the Lord. A double minded man is unstable in all his ways.',
   '["Romans 5:3-4", "1 Peter 1:6-7"]',
   'James begins with a command that sounds like a provocation: count it all joy when trials come. He is not telling us to pretend the pain isn''t real — the word "fall into" (Greek: peripiptō) means to stumble into unexpectedly, to be surrounded on all sides. He knows the trials are real. What he insists on is the reframe: the test of faith is not destroying you; it is producing something in you that nothing else can produce. Steadfastness — the patience that holds its shape under pressure — is not a personality trait you either have or don''t. It is forged. And for the moments when you don''t know how to hold on, James gives you an invitation in verse five: ask for wisdom, and God will give it without making you feel ashamed for needing it.'
  ),
  (4,
   '2 Corinthians 4:14-18',
   'Light and Momentary',
   'Knowing that he which raised up the Lord Jesus shall raise up us also by Jesus, and shall present us with you. For all things are for your sakes, that the abundant grace might through the thanksgiving of many redound to the glory of God. For which cause we faint not; but though our outward man perish, yet the inward man is renewed day by day. For our light affliction, which is but for a moment, worketh for us a far more exceeding and eternal weight of glory; While we look not at the things which are seen, but at the things which are not seen: for the things which are seen are temporal; but the things which are unseen are eternal.',
   '["Romans 8:18", "1 Peter 5:10"]',
   'Paul calls his suffering "light and momentary" — and this is the man who was beaten with rods three times, shipwrecked three times, imprisoned, stoned, and left for dead. This is not denial; it is calibration. He has placed his suffering next to something so massive that the ratio collapses: "an eternal weight of glory beyond all comparison." The key to his perspective is revealed in verse 18: he is not looking at the visible. He is looking at the invisible. Whatever you can see — the diagnosis, the loss, the broken relationship — is temporal. What is being built for you is not. The outward man perishes, he says, but the inward man is renewed every single day.'
  ),
  (5,
   'Romans 8:26-30',
   'Working All Things Together',
   'Likewise the Spirit also helpeth our infirmities: for we know not what we should pray for as we ought: but the Spirit itself maketh intercession for us with groanings which cannot be uttered. And he that searcheth the hearts knoweth what is the mind of the Spirit, because he maketh intercession for the saints according to the will of God. And we know that all things work together for good to them that love God, to them who are the called according to his purpose. For whom he did foreknow, he also did predestinate to be conformed to the image of his Son, that he might be the firstborn among many brethren. Moreover whom he did predestinate, them he also called: and whom he called, them he also justified: and whom he justified, them he also glorified.',
   '["Jeremiah 29:11", "Genesis 50:20"]',
   'The famous promise of verse 28 is embedded in a passage about the Spirit interceding for us with groanings too deep for words. Paul is not describing a tidy theology of everything-works-out; he is describing a God who groans with us in the suffering, whose Spirit carries our prayers when we don''t have the language for them. "All things" in verse 28 is not a promise of comfort — it is a promise of purpose. The good that God is working toward is not our ease or our restoration to a prior state; it is conformity to the image of His Son. The suffering is part of the shaping. You are not a problem to be solved. You are a life being formed.'
  ),
  (6,
   'Psalm 34:15-19',
   'Close to the Brokenhearted',
   'The eyes of the LORD are upon the righteous, and his ears are open unto their cry. The face of the LORD is against them that do evil, to cut off the remembrance of them from the earth. The righteous cry, and the LORD heareth, and delivereth them out of all their troubles. The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit. Many are the afflictions of the righteous: but the LORD delivereth him out of them all.',
   '["Isaiah 61:1", "Psalm 51:17"]',
   'The psalmist does not promise freedom from affliction — he promises companionship in it. Verse 19 is startlingly honest: "Many are the afflictions of the righteous." The righteous do not get fewer troubles; they get a God who is close. The Hebrew word translated "nigh" (qarov) means near, present, not distant — and it is used elsewhere for the nearness of God at the temple, at the moment of prayer, in the holy of holies. The God who fills the universe draws particularly close to the brokenhearted and the crushed in spirit — not to the proud or the self-sufficient, but to the ones who know they need Him. If you are there today, you are not at the edge of His attention. You are at the center of it.'
  ),
  (7,
   'Nahum 1:6-7',
   'He Knows Those Who Hide in Him',
   'Who can stand before his indignation? and who can abide in the fierceness of his anger? his fury is poured out like fire, and the rocks are thrown down by him. The LORD is good, a strong hold in the day of trouble; and he knoweth them that trust in him.',
   '["Psalm 46:1", "Psalm 91:1-2"]',
   'Nahum is rarely opened — it is an oracle of judgment against Nineveh, the brutal capital of the empire that had terrorized Israel. Verse 7 is a sudden pivot in the middle of that oracle, and its position makes it more powerful: against the backdrop of a God before whom rocks are thrown down and no enemy can stand, God is also good. The contrast is not softened. The same God before whom no enemy survives is a stronghold to those who run to Him. And then the detail that no other passage in this plan quite captures: "He knoweth them that trust in Him." Not knows about — knows. Personally. By name. In the trouble. You are not anonymous to God in your storm. You are the one He is close to.'
  )
) AS v(day_number, verse_ref, day_title, passage_text, passage_refs, reflection)
WHERE p.slug = 'strength-in-the-storm'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 2b — Strength in the Storm: comprehension check questions.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET
  quiz_question    = v.question,
  quiz_options     = v.options,
  quiz_explanation = v.explanation
FROM reading_plans p,
(VALUES
  (1,
   'What does Psalm 46 call God in its opening verse?',
   '[{"label":"A","text":"Our shepherd and guide","correct":false},{"label":"B","text":"Our refuge and strength","correct":true},{"label":"C","text":"Our tower and fortress","correct":false}]',
   'Verse 1 declares "God is our refuge and strength, a very present help in trouble." The double description — refuge for shelter, strength for power — says God is both protection and resource in the storm.'
  ),
  (2,
   'In verse 13, what does God say He will do with your hand?',
   '[{"label":"A","text":"Lift you up high","correct":false},{"label":"B","text":"Lead you forward","correct":false},{"label":"C","text":"Hold your right hand","correct":true}]',
   '"For I the LORD thy God will hold thy right hand, saying unto thee, Fear not; I will help thee." God does not point the way from a distance — He takes your hand personally and walks with you.'
  ),
  (3,
   'What does "the trying of your faith" produce, according to verse 3?',
   '[{"label":"A","text":"Joy","correct":false},{"label":"B","text":"Patience","correct":true},{"label":"C","text":"Wisdom","correct":false}]',
   '"Knowing this, that the trying of your faith worketh patience." The Greek hupomonē means steadfast endurance under pressure — not passive waiting but active holding. It is forged in the trial, not given before it.'
  ),
  (4,
   'In verse 18, what does Paul say we must NOT look at?',
   '[{"label":"A","text":"Our own weakness","correct":false},{"label":"B","text":"The things which are seen","correct":true},{"label":"C","text":"Our enemies","correct":false}]',
   '"While we look not at the things which are seen, but at the things which are not seen: for the things which are seen are temporal; but the things which are unseen are eternal." Perspective shifts when we stop fixing our gaze on the visible and train it on the eternal.'
  ),
  (5,
   'What does the Spirit do for believers when they do not know what to pray?',
   '[{"label":"A","text":"Teaches them the right words","correct":false},{"label":"B","text":"Reminds them of Scripture","correct":false},{"label":"C","text":"Intercedes with groanings that cannot be uttered","correct":true}]',
   '"The Spirit itself maketh intercession for us with groanings which cannot be uttered." When suffering robs us of language, the Spirit does not wait for us to find the right words — He carries the prayer Himself.'
  ),
  (6,
   'To whom does verse 18 say the LORD is "nigh" (close)?',
   '[{"label":"A","text":"Those who serve Him faithfully","correct":false},{"label":"B","text":"The brokenhearted and those crushed in spirit","correct":true},{"label":"C","text":"Those who study His word","correct":false}]',
   '"The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit." Brokenness is not a disqualification from God''s presence — it is the condition He draws closest to.'
  ),
  (7,
   'Beyond being good and a stronghold, what does Nahum 1:7 say God does?',
   '[{"label":"A","text":"He hears every prayer","correct":false},{"label":"B","text":"He delivers them from all trouble","correct":false},{"label":"C","text":"He knoweth them that trust in Him","correct":true}]',
   '"And he knoweth them that trust in him." This is not general oversight — it is personal knowledge. God knows by name each person who takes refuge in Him, in the middle of the trouble, not just after it.'
  )
) AS v(day_number, question, options, explanation)
WHERE p.slug = 'strength-in-the-storm'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 2c — Strength in the Storm: word studies for memory
-- verse days (days 1 and 4). Keys are lowercase, punctuation-
-- stripped forms of the word as it appears in the passage text.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (1,
   '{"refuge":{"original":"מַחְסֶה","transliteration":"machseh","definition":"A shelter or place of protection — often used for the shadow of a rock or cave. Not a distant fortress but an immediate cover. The word implies close concealment, not just proximity.","refs":["Psalm 91:2","Isaiah 25:4"]},"strength":{"original":"עֹז","transliteration":"oz","definition":"Might, force, power. Used of God''s inherent power that He lends to those who trust in Him. In the Psalms it is often paired with refuge — shelter plus capacity.","refs":["Psalm 28:7","Isaiah 40:31"]},"present":{"original":"נִמְצָא","transliteration":"nimtsa","definition":"To be found, to be available, to be right there. God is described as very findable — accessible in trouble, not waiting to be located after the crisis passes.","refs":["Psalm 145:18","Acts 17:27"]}}'
  ),
  (4,
   '{"affliction":{"original":"θλῖψις","transliteration":"thlipsis","definition":"Pressing, squeezing, pressure — like grapes under a wine press. Paul uses it to describe suffering that comes from all sides. He calls his thlipsis light compared to the eternal weight of glory.","refs":["John 16:33","Romans 8:35"]},"eternal":{"original":"αἰώνιος","transliteration":"aiōnios","definition":"Of the age to come — not merely long-lasting but belonging to a different quality of existence altogether. The weight of glory Paul describes is not more of this life, but life of a different kind.","refs":["John 17:3","2 Corinthians 5:1"]},"glory":{"original":"δόξα","transliteration":"doxa","definition":"Splendor, radiance, honor — in the OT context, the kabod of God, His weighty and manifest presence. Paul''s eternal weight of glory is conformity to the radiant image of Christ.","refs":["Romans 8:30","2 Corinthians 3:18"]}}'
  )
) AS v(day_number, ws)
WHERE p.slug = 'strength-in-the-storm'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 2h — Dig deeper: extended commentary + further-study
-- refs for Walking in Peace days 1, 4, and 6.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET
  deep_dive_text = v.text,
  deep_dive_refs = v.refs
FROM reading_plans p,
(VALUES
  (1,
   'The word Jesus uses for "Comforter" is παράκλητος (Paraklétos) — literally "one called alongside." In ancient Greek courts this was the word for an advocate who stands beside the accused and speaks on their behalf. Jesus was not promising a distant spiritual force but a constant personal Presence: a divine companion posted at the side of every believer in every moment. After the ascension, believers would have their own heavenly advocate — not just for judgment day, but for every ordinary Tuesday. The peace He leaves is therefore not a one-time gift but an ongoing reality sustained by this Presence. When peace feels absent, the Paraclete has not departed; our awareness of Him has dimmed. The deeper question is not "where is God?" but "how do I attend to the One who is already here?" Practicing that attention — pausing to acknowledge the Spirit''s presence before you react, before you speak, before you decide — is the discipline that keeps the gift open.',
   '["John 16:7-11", "Romans 8:26-27"]'
  ),
  (4,
   'Paul uses φρουρέω (phroureō) — typically translated "keep" or "guard" — but the word''s root is a military garrison standing watch over a city gate. The peace of God, Paul says, will garrison your heart and mind. This is a startlingly active image: peace is not an emotion that descends on passive recipients. It is a standing army that repels the enemy at the gate of thought. The gate is the mind. What we allow through that threshold determines the security of the inner life. Paul''s list in verse 8 — true, honest, just, pure, lovely, of good report — is not a moral checklist but an entry protocol: criteria the mind can apply to any incoming thought before it crosses the threshold. Train the mind to ask these questions at the gate, and the garrison has allies on the inside. The harder practice is not finding better thoughts but noticing the exact moment anxiety first appears — and posting the watch there, before it takes ground.',
   '["Isaiah 26:3", "2 Corinthians 10:5"]'
  ),
  (6,
   'The command "Be still" (*raphah* in Hebrew) appears only a handful of times in the Old Testament, and its meaning is stronger than the English suggests. Raphah means to release your grip, to let go, to stop striving — the same word used elsewhere for hands that go slack or a sword that drops. It is an active surrender, not a passive waiting. Psalm 46 was almost certainly written in a military context — possibly the Assyrian siege of Jerusalem in 701 BC (2 Kings 19), when the city faced annihilation and God miraculously intervened. The instruction to release follows a scene of absolute catastrophe: mountains removed, seas roaring, kingdoms raging. God does not wait for the chaos to settle before commanding stillness. He commands it in the middle of the storm, and gives the reason: "I am God." That fact — not the resolution of the crisis — is the ground of the stillness. The practical invitation is to practice releasing one thing per day that you have been trying to control, and to name the specific truth about God that makes the release possible.',
   '["Psalm 62:5-8", "Hebrews 4:9-11"]'
  )
) AS v(day_number, text, refs)
WHERE p.slug = 'walking-in-peace'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 2h — Strength in the Storm: dig deeper commentary +
-- further-study refs for days 1, 4, and 6.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET
  deep_dive_text = v.text,
  deep_dive_refs = v.refs
FROM reading_plans p,
(VALUES
  (1,
   'The word "refuge" (Hebrew: machseh) appears repeatedly in the Psalms, but in Psalm 46 it is paired with something unusual: oz, translated "strength." Most refuge imagery in Scripture is passive — a rock to hide behind, a shadow to shelter under. Here the refuge is also power. God is not just the place you go when you cannot fight anymore; He is also the capacity that enables you to stand back up. The third descriptor in verse 1 is equally precise: "very present help" translates a phrase built on the Hebrew nimtsa — "found," "available." This is not the language of a God who shows up when He feels like it. It is the language of a God who is already there when you arrive, findable in the chaos rather than waiting on the other side of it. The three words of verse 1 map onto three kinds of need: refuge for fear, strength for exhaustion, presence for loneliness. Whatever form your storm takes today, verse 1 has named its provision.',
   '["Isaiah 25:4", "Psalm 91:1-2"]'
  ),
  (4,
   'Paul uses θλῖψις (thlipsis) — translated "affliction" — a word that carries the image of pressing and compression: grapes under a wine press, a body crushed in a crowd. Paul calls his thlipsis "light." The counterweight he sets against it is βάρος δόξης — the weight of glory — and he calls that one "far more exceeding and eternal." He is making a deliberate reversal: what is pressing you is the light thing; what is being built for you is the heavy thing. The Greek word for glory (doxa) echoes the OT kavod — the weighty, substantial, manifest presence of God. What Paul is describing is not a more comfortable future but a more fully God-shaped self. Verse 18 is the key to the whole passage: he is not looking at the visible. The affliction is visible; the glory is not. The practice he is describing is not optimism but trained attention — deliberately turning the eyes from the temporal to the eternal, not once but as a repeated daily discipline.',
   '["Romans 8:17-18", "1 Peter 4:12-13"]'
  ),
  (6,
   'Psalm 34 is an acrostic poem in which each verse begins with the next letter of the Hebrew alphabet — a form reserved in Scripture for subjects worth meditating through completely, letter by letter. It was written by David after he feigned madness before Abimelech, a moment of acute fear, humiliation, and desperate improvisation. The psalm is not abstract theology; it is field testimony from a man who discovered what was true in the middle of an undignified moment. The Hebrew word translated "nigh" (qarov) is used elsewhere in the Psalms for the nearness of God in the sanctuary — in the holy of holies, at the moment of deepest prayer. David is not saying God will eventually make His way to the brokenhearted. He is saying God is where the brokenhearted are — that the sanctuary nearness belongs most fully to them. The word translated "contrite" (dakah) means pulverized, ground down. The person who has been reduced that far is not furthest from God. They are standing where His presence is most concentrated.',
   '["Isaiah 57:15", "Psalm 51:17"]'
  )
) AS v(day_number, text, refs)
WHERE p.slug = 'strength-in-the-storm'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 1b Enrichment — Heart of Gratitude (14 days):
-- prayer, application, question, context_note, is_memory_verse.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET
  prayer          = v.prayer,
  application     = v.application,
  question        = v.question,
  context_note    = v.context_note,
  content_type    = 'verse',
  is_memory_verse = v.is_memory_verse
FROM reading_plans p,
(VALUES
  (1,
   'Father, I enter Your gates with thanksgiving right now — not because every circumstance is resolved, but because You are good. Your mercy is everlasting and Your truth endures to all generations. Let that be enough to open my heart this morning. Amen.',
   'Start your day by entering God''s gates with thanksgiving before you open any app or check any news. Name five specific things you are grateful for — not general blessings, but particular ones from the last 24 hours.',
   'The psalm says to "serve the LORD with gladness." What is the difference between serving God out of duty and serving Him with gladness? What makes the difference?',
   'Psalm 100 is the only psalm with the title "A Psalm of Thanksgiving" — the word todah (thanksgiving) in the title refers to the thank-offering sacrifice at the temple, a voluntary act of gratitude rather than a required atonement.',
   true
  ),
  (2,
   'Lord, I choose to rejoice right now, not because everything is resolved, but because You are present. Teach me what it means to pray without ceasing and give thanks in everything. Let that be my posture today, not just in the good moments. Amen.',
   'Set three reminders on your phone today, spaced throughout the day. Each time one fires, stop for 60 seconds and give thanks — not for what you wish were true, but for what is actually true about God right now.',
   'Paul says giving thanks in everything is "the will of God." Does knowing something is God''s will make it easier or harder for you to do it? What does it tell you that God made gratitude part of His will?',
   '1 Thessalonians was Paul''s earliest surviving letter, written around AD 50 to a young church in a hostile city. The compressed imperatives of chapter 5 were not guidelines for comfortable Christianity — they were survival tools for a persecuted minority.',
   false
  ),
  (3,
   'Father, I am one of the redeemed. Let me say so today. Where I have been wandering, where I have been hungry — remind me of the times You led me to where I needed to be. I give thanks not just for the destination but for every moment of faithful leading. Amen.',
   'Think of a time you cried out to God in trouble and He answered. Write a one-paragraph "testimony entry" — just for yourself — describing what happened and what it revealed about God''s goodness. Keep it somewhere you can return to.',
   'Psalm 107 calls the redeemed to "say so" — to speak their deliverance aloud. Is there a story of God''s faithfulness in your life that you have never told anyone? What would it cost to tell it?',
   'Psalm 107 is a congregational thanksgiving psalm, probably used in the Second Temple period after the return from Babylonian exile. The four stanzas describe four categories of those whom God redeemed — wanderers, prisoners, the sick, and sailors — and invite each group to offer thanks.',
   false
  ),
  (4,
   'Lord, let Your peace rule in my heart today — not just in the quiet moments but in the decisions and conversations. Let Your word dwell richly. And let thanksgiving rise out of that, not as an effort but as an overflow. Amen.',
   'Before each significant task today — a meeting, a conversation, a meal — pause for ten seconds and give thanks for something specific about that moment. Turn ordinary actions into acts of gratitude.',
   'Paul says to let the word of Christ "dwell richly" — not briefly or sparingly. How much of your daily mental space does Scripture actually occupy? What would change if you increased it?',
   'Colossians was written to a church Paul had never visited, facing pressure from a local philosophy that elevated secret knowledge and angelic intermediaries. Paul''s answer is not more complexity — it is letting the word of Christ, simply and richly, fill everything.',
   false
  ),
  (5,
   'Lord, I give You my whole heart in praise today — not the part that feels ready, but all of it. You have maintained my cause when I could not defend myself. I declare Your marvellous works even when I cannot see them all at once. You are the Most High. Amen.',
   'Find one thing God has done for you that you have not told anyone — a specific, particular act of faithfulness. Tell someone about it today. Gratitude grows when we speak it.',
   'What does it mean to praise God "with your whole heart"? Is there any part of your heart you have been holding back from God? What would it take to offer that part?',
   'Psalm 9 is an acrostic — each stanza begins with the next letter of the Hebrew alphabet, running through the first half; Psalm 10 continues the second half. The acrostic form emphasizes completeness — praise from A to Z, covering the full range of human experience.',
   false
  ),
  (6,
   'Father, I call upon Your name right now. I want to make known what You have done — not just in history but in my own story. Help me to remember Your marvellous works today and let that remembering become worship. Amen.',
   'Make a "remembrance list" of five specific times God has been faithful to you personally — moments when He came through, provided, answered, or simply showed up. Keep this list and add to it over time.',
   'David appointed specific people to lead thanksgiving. Who in your life helps you stay grateful? Who do you help? Is gratitude something you practice alone, or with others?',
   '1 Chronicles 16:8-36 is a composite psalm, drawing from Psalms 105, 96, and 106. The Chronicler assembled it as the definitive song for the return of the ark — an event that represented God''s presence returning to His people after years of displacement.',
   false
  ),
  (7,
   'O Lord, Your hesed endures forever — not just in the good seasons but in every one. I join my voice to this ancient refrain today: for his mercy endureth for ever. Thank You for the sun, for the moon, for the earth I stand on, for the covenant that holds me. Amen.',
   'Read the full Psalm 136 aloud, responding to each verse with the refrain: "His mercy endures forever." Let the repetition do its work. Notice what changes in your heart as you say it twenty-six times.',
   'The psalm returns to the same refrain twenty-six times. Why does repetition matter in worship and gratitude? Is there a truth about God you need to hear — and say — more than once?',
   'Psalm 136 was called "The Great Hallel" in Jewish tradition and was sung at Passover. The refrain was not decorative — it was congregational, likely sung by the entire assembly after each cantor''s verse, making the whole community speakers of God''s enduring faithfulness.',
   true
  ),
  (8,
   'Lord Jesus, let me be the one who returns. I have received mercy in ways I do not fully understand. Whatever healing You have worked in me — physical, relational, spiritual — I come back to say thank You. I fall at Your feet. Amen.',
   'Think of someone who has done something significant for you that you never properly thanked. Today, reach out — a note, a message, a call — and say thank you specifically. Name what they did and what it meant.',
   'Why did only one of the ten return? What is it in human nature that receives a gift and moves on without pausing to give thanks? Where do you see that pattern in your own life?',
   'The Samaritans were a mixed-race people who had developed their own form of worship at Mount Gerizim rather than Jerusalem, and were despised by Jewish society. Luke highlights the Samaritan''s return deliberately — the outsider recognizes what the insiders took for granted.',
   false
  ),
  (9,
   'Lord, I bless You right now — not because everything is perfect, but because You have heard me and delivered me from fears I could not carry alone. At all times, let Your praise be continually in my mouth. Taste and see — I am tasting You today. Amen.',
   'Find one moment today that is genuinely difficult — the commute, the meeting, the hard conversation — and practice blessing the Lord specifically in that moment, not despite it. Notice what happens.',
   '"At all times" is a large claim. What are the times when gratitude feels most impossible for you? What is the one truth about God that could anchor you even there?',
   'Psalm 34 is an acrostic (each verse beginning with the next Hebrew letter) and was written after David feigned madness before the Philistine king Achish. The title connects the psalm to a moment of desperate improvisation — David praises God from the other side of a humiliating escape.',
   false
  ),
  (10,
   'Holy Spirit, fill me today. Not partially — fill me. Let the evidence of Your filling be the psalm in my heart and the thanks on my lips, even in moments I would not naturally choose to be grateful. Redeem my time by filling it with You. Amen.',
   'For the next hour, try to notice every gift that enters your awareness — light through a window, a working phone, a breath, a word from a colleague. Give thanks in your heart for each one as you notice it. This is practicing the "always" Paul describes.',
   'What does it mean that being filled with the Spirit produces thanksgiving? Have you ever experienced a season when gratitude came naturally — when you were simply more aware of gifts? What was different about that season?',
   'Ephesians was written to a predominantly Gentile church in a city known for its occult practices and the temple of Artemis. Paul''s instruction to be "filled with the Spirit" rather than drunk with wine was a deliberate contrast with the ecstatic practices of pagan worship.',
   false
  ),
  (11,
   'Father, I cannot give You anything You do not already own. What You want is not my sacrifice — it is my thanksgiving. I offer it now. Not performance, not duty, but honest acknowledgment: You are God, You are good, and everything I have is already Yours. Amen.',
   'Consider what you have been giving God lately. Is it routine, obligatory, performed? Try offering something today that is genuinely voluntary — a choice to praise when you are not required to, an act of thanks that costs you something (time, attention, comfort).',
   'Why does God say He prefers thanksgiving to sacrifice? What does that reveal about what God is actually looking for from you?',
   'Psalm 50 is attributed to Asaph, one of David''s chief musicians and a seer. The psalm pictures God as the judge of all creation, summoning Israel to account — not for neglecting sacrifices but for misunderstanding what the sacrificial system was communicating: that relationship matters more than ritual.',
   false
  ),
  (12,
   'Lord Jesus, You suffered outside the gate for me. Let me go to You there — not where worship is comfortable and easy, but where it costs something. I offer You today the sacrifice of praise: my lips, acknowledging Your name, in whatever moment I find myself in. Amen.',
   'Find one moment today where gratitude is genuinely hard — a frustration, a disappointment, a tedious task — and consciously offer "the fruit of lips" in that moment. Speak thanks aloud, even briefly. That is the sacrifice.',
   'What makes praise a "sacrifice"? What does it cost you to give thanks in the circumstances you are in right now?',
   'Hebrews was written to Jewish Christians who were under pressure to return to Judaism, where the sacrificial system was familiar and still operating. The writer''s argument is total: the old sacrifices are shadows; Christ is the substance; the new sacrifice is praise from a transformed heart.',
   false
  ),
  (13,
   'Lord Most High, I declare Your lovingkindness this morning and Your faithfulness tonight. You have made me glad through Your works, even the ones I cannot fully see. Let gratitude frame my day at both ends, so everything in between is held in it. Amen.',
   'Establish a two-part rhythm for today: spend two minutes in the morning naming specific gifts from God, and two minutes at night naming specific evidences of God''s faithfulness from the day. Try this as a daily practice for the remainder of this plan.',
   'The psalm says it is "good" to give thanks. Not required, not commanded — good. What makes gratitude good for us, not just good to offer? What does it actually do to the person who practices it?',
   'Psalm 92 is the only psalm specifically designated for the Sabbath. In Jewish tradition it was sung by the Levites in the temple on the seventh day. Its position as the Sabbath song suggests that rest and thanksgiving are meant to inhabit the same space — that gratitude is itself a form of rest.',
   false
  ),
  (14,
   'Lord, let everything I have learned about gratitude on this plan be the beginning of something that does not end. Let the song of thanksgiving — begun quietly in daily life — swell into the chorus I will one day sing with the uncountable multitude before Your throne. Salvation belongs to God. Amen.',
   'Write a one-page entry — a letter to yourself to open in one year — about what this plan taught you about gratitude. Be specific: what shifted, what you want to remember, what you intend to carry forward. Date it and keep it.',
   'The scene in Revelation 7 shows gratitude as the language of eternity. What does that tell you about the importance of practicing it now? What would you do differently if you knew gratitude was the one practice that prepared you for heaven?',
   'Revelation 7 falls between the sixth and seventh seals — a pause in the vision of judgment, where John is shown the fullness of those who have been redeemed. The great multitude is identified in verse 14 as those who "have come out of the great tribulation." Their song of thanksgiving arises from suffering that has been answered, not avoided.',
   false
  )
) AS v(day_number, prayer, application, question, context_note, is_memory_verse)
WHERE p.slug = 'heart-of-gratitude'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 1c — Heart of Gratitude: passage text, day titles,
-- expanded verse refs, cross-references, enriched reflections,
-- and content_type = 'passage'.
-- Fully idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET
  verse_ref    = v.verse_ref,
  day_title    = v.day_title,
  passage_text = v.passage_text,
  passage_refs = v.passage_refs,
  reflection   = v.reflection,
  content_type = 'passage'
FROM reading_plans p,
(VALUES
  (1,
   'Psalm 100:1-5',
   'The Heart That Enters Singing',
   'Make a joyful noise unto the LORD, all ye lands. Serve the LORD with gladness: come before his presence with singing. Know ye that the LORD he is God: it is he that hath made us, and not we ourselves; we are his people, and the sheep of his pasture. Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name. For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.',
   '["Psalm 95:1-2", "Philippians 4:4"]',
   'Psalm 100 is not a request — it is an instruction, and it begins not with feeling but with action: make a joyful noise, serve with gladness, come before His presence. The ancient worshipper was told to enter through thanksgiving as through a gate, and the gate opens outward, not inward — we do not wait to feel grateful before we begin to praise; we praise until we feel it. The reason given is theological before it is experiential: "Know ye that the LORD he is God." Gratitude is grounded in who God is, not in what He has done for us lately. His goodness, mercy, and truth are not occasional blessings — they are fixed, permanent, the very nature of the One we approach. To give thanks is to agree with reality as God has ordered it.'
  ),
  (2,
   '1 Thessalonians 5:16-22',
   'In Everything, Give Thanks',
   'Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you. Quench not the Spirit. Despise not prophesyings. Prove all things; hold fast that which is good. Abstain from all appearance of evil.',
   '["Romans 12:12", "Philippians 4:6"]',
   'Paul compresses the whole posture of the Christian life into three back-to-back imperatives: rejoice always, pray without ceasing, give thanks in everything. These are not three separate commands — they are one continuous orientation of the heart toward God. The most striking word is the smallest: in. Paul does not say give thanks for everything, as if we must manufacture gratitude for grief or loss. He says in everything — inside the circumstance, not because of it. And then he anchors it: "this is the will of God in Christ Jesus concerning you." There is no need to search anxiously for God''s will about your career or your future; here it is, stated plainly — a heart that prays in the difficulty and gives thanks inside the storm. The verses that follow are not accidental: quench not the Spirit. Gratitude and attentiveness to God are not separate disciplines; they are the same.'
  ),
  (3,
   'Psalm 107:1-9',
   'He Satisfies the Longing Soul',
   'O give thanks unto the LORD, for he is good: for his mercy endureth for ever. Let the redeemed of the LORD say so, whom he hath redeemed from the hand of the enemy; And gathered them out of the lands, from the east, and from the west, from the north, and from the south. They wandered in the wilderness in a solitary way; they found no city to dwell in. Hungry and thirsty, their soul fainted in them. Then they cried unto the LORD in their trouble, and he delivered them out of their distresses. And he led them forth by the right way, that they might go to a city of habitation. Oh that men would praise the LORD for his goodness, and for his wonderful works to the children of men! For he satisfieth the longing soul, and filleth the hungry soul with goodness.',
   '["Lamentations 3:22-23", "Psalm 34:8"]',
   'Psalm 107 opens with the same declaration that anchors Psalms 106, 118, and 136 — "give thanks, for He is good." But this psalm immediately fills that goodness with faces: wanderers, prisoners, the sick, those swept away by storms. The people who are called to give thanks are not those in comfortable circumstances but those who have cried out in their trouble and been heard. The Hebrew structure of verses 4-9 follows a pattern that repeats across all four of Psalm 107''s stanzas: trouble, cry, deliverance, give thanks. Gratitude in this psalm is not the product of a good season — it is the conclusion drawn by those who have been through the worst and found God faithful. Verse 9 is the psalm''s emotional heart: God satisfies the longing soul. Not fills temporarily. Satisfies — a word that implies completeness, the end of searching, arriving at the place you have always been heading.'
  ),
  (4,
   'Colossians 3:15-17',
   'Let Everything Overflow',
   'And let the peace of God rule in your hearts, to the which also ye are called in one body; and be ye thankful. And let the word of Christ dwell in you richly in all wisdom; teaching and admonishing one another in psalms and hymns and spiritual songs, singing with grace in your hearts to the Lord. And whatsoever ye do in word or deed, do all in the name of the Lord Jesus, giving thanks to God and the Father by him.',
   '["Ephesians 5:19-20", "Philippians 4:7"]',
   'These three verses form a single arc of instruction that moves from inner life to outward action: let peace rule, let the word dwell, and then — as a natural overflow — let thanksgiving fill everything you say and do. The structure matters: gratitude is not the starting point here but the fruit. When the peace of Christ governs the heart and the word of Christ is at home there, thanksgiving is what spills out. The verb Paul uses for "dwell" implies permanent residence, as a family moves into a house and rearranges the furniture. The word is not a visitor. It is meant to inhabit every room and reorganize everything it touches. And then verse 17 makes the extraordinary claim: whatever you do — not just in prayer, not just on Sunday — do all of it with thanksgiving to God. The whole of life, in every word and deed, becomes an act of gratitude.'
  ),
  (5,
   'Psalm 9:1-4',
   'With My Whole Heart',
   'I will praise thee, O LORD, with my whole heart; I will shew forth all thy marvellous works. I will be glad and rejoice in thee: I will sing praise to thy name, O thou most High. When mine enemies are turned back, they shall fall and perish at thy presence. For thou hast maintained my right and my cause; thou satest in the throne judging right.',
   '["Psalm 111:1", "Psalm 138:1"]',
   'The opening of Psalm 9 is built on repeated first-person declarations — I will praise, I will show forth, I will be glad, I will rejoice, I will sing — and the repetition is deliberate. David is not describing something that has already happened; he is declaring what he intends to do. Gratitude here is a choice before it is a feeling. The qualification "with my whole heart" is the one that stops us: not the part of us that feels grateful, not the portion willing to praise, but the whole. In Hebrew thinking, the heart is the seat of will, intellect, and emotion together — not just feelings but the entire person''s orientation. Whole-heart praise means there is no corner reserved for doubt or self-pity while you praise with the rest. And the foundation is what comes last: "thou hast maintained my right and my cause." Gratitude is anchored in God''s history of faithfulness — in what He has already done, not only in what we hope He will do.'
  ),
  (6,
   '1 Chronicles 16:8-13',
   'Remember What He Has Done',
   'Give thanks unto the LORD, call upon his name, make known his deeds among the people. Sing unto him, sing psalms unto him, talk ye of all his wondrous works. Glory ye in his holy name: let the heart of them rejoice that seek the LORD. Seek the LORD and his strength, seek his face continually. Remember his marvellous works that he hath done, his wonders, and the judgments of his mouth; O ye seed of Israel his servant, ye children of Jacob, his chosen ones.',
   '["Deuteronomy 8:2", "Psalm 105:1-3"]',
   'This song was written for a specific moment — the day David brought the ark of the LORD back to Jerusalem, placing it in the tent he had prepared. The instinct to sing was not spontaneous; David appointed Levites to give thanks and lead the people in it. Gratitude organized, gratitude led, gratitude as a public act of worship. The commands pile on top of each other: give thanks, call upon, make known, sing, talk, glory, rejoice, seek, remember. But the center of gravity is in verses 12-13: remember his marvellous works. Memory is gratitude''s raw material. When we cannot feel grateful, we can remember — what God has done in Scripture, what He has done in our history, what He has done for those we love. The act of remembering is not passive nostalgia; it is an active assertion against despair.'
  ),
  (7,
   'Psalm 136:1-9',
   'His Love Endures Forever',
   'O give thanks unto the LORD; for he is good: for his mercy endureth for ever. O give thanks unto the God of gods: for his mercy endureth for ever. O give thanks to the Lord of lords: for his mercy endureth for ever. To him who alone doeth great wonders: for his mercy endureth for ever. To him that by wisdom made the heavens: for his mercy endureth for ever. To him that stretched out the earth above the waters: for his mercy endureth for ever. To him that made great lights: for his mercy endureth for ever: The sun to rule by day: for his mercy endureth for ever: The moon and stars to rule by night: for his mercy endureth for ever.',
   '["Lamentations 3:22-23", "1 Chronicles 16:34"]',
   'Psalm 136 is the great litany of thanksgiving — twenty-six verses, each ending with the same refrain: "for his mercy endureth for ever." In temple worship, this refrain was sung by a second choir answering the first, creating a call and response that filled the courts with repeated declaration. You cannot read Psalm 136 casually. The repetition is the point. Something is being hammered into the heart by return, by insistence, by the refusal to say it only once. The Hebrew word translated "mercy" is hesed — covenant faithfulness, the love that will not revoke what it has promised. These opening nine verses trace God''s hesed backward through creation: the making of light, the spreading of the earth, the setting of sun and moon — all of it, the psalmist insists, is the ongoing expression of love that will not end. Before we were, before anything was, there was already a love that would not stop. Gratitude is the right response to that.'
  ),
  (8,
   'Luke 17:11-19',
   'The One Who Returned',
   'And it came to pass, as he went to Jerusalem, that he passed through the midst of Samaria and Galilee. And as he entered into a certain village, there met him ten men that were lepers, which stood afar off: And they lifted up their voices, and said, Jesus, Master, have mercy on us. And when he saw them, he said unto them, Go shew yourselves unto the priests. And it came to pass, that, as they went, they were cleansed. And one of them, when he saw that he was healed, turned back, and with a loud voice glorified God, And fell down on his face at his feet, giving him thanks: and he was a Samaritan. And Jesus answering said, Were there not ten cleansed? but where are the nine? Arise, go thy way: thy faith hath made thee whole.',
   '["Psalm 50:14-15", "Romans 1:21"]',
   'Ten men asked for mercy. Ten men received it. One came back. Luke records this moment carefully, noting two things about the one who returned: he was a Samaritan — the cultural outsider, the one least expected to recognize the gift — and he fell on his face at Jesus'' feet. Jesus'' question is not rhetorical; it lands with weight: "Were there not ten cleansed? But where are the nine?" The nine were healed, but the healing did not lead them back to gratitude. And Jesus makes a careful distinction at the end: the physical healing was not revoked. But to the one who returned He says something more: "Thy faith hath made thee whole." The Greek word implies salvation — being made entirely well in a deeper sense than physical healing. The nine got what they came for. The one who returned received something more. Gratitude is not a transaction; it is the posture that keeps you near the Giver.'
  ),
  (9,
   'Psalm 34:1-8',
   'At All Times',
   'I will bless the LORD at all times: his praise shall continually be in my mouth. My soul shall make her boast in the LORD: the humble shall hear thereof, and be glad. O magnify the LORD with me, and let us exalt his name together. I sought the LORD, and he heard me, and delivered me from all my fears. They looked unto him, and were lightened: and their faces were not ashamed. This poor man cried, and the LORD heard him, and saved him out of all his troubles. The angel of the LORD encampeth round about them that fear him, and delivereth them. O taste and see that the LORD is good: blessed is the man that trusteth in him.',
   '["1 Thessalonians 5:16-18", "Psalm 103:1-2"]',
   'David''s opening declaration is the most uncompromising statement of gratitude in the Psalter: "I will bless the LORD at all times." Not in good times. Not when it feels natural. At all times. The Hebrew covers everything — the feast and the famine, the victory and the defeat, the morning of clarity and the night when nothing makes sense. What makes this possible? David does not leave us wondering. He traces his own story: "I sought the LORD, and he heard me." The gratitude is grounded in history. The refrain "at all times" is not a demand that we perform a feeling we do not have; it is a choice to keep the record open, to keep counting what God has done even when circumstances push against it. And then verse 8 extends the invitation outward: "Taste and see that the LORD is good." Come and find out for yourself. The promise is not just spoken — it is offered as something to experience.'
  ),
  (10,
   'Ephesians 5:15-20',
   'Redeeming Every Moment',
   'See then that ye walk circumspectly, not as fools, but as wise, Redeeming the time, because the days are evil. Wherefore be ye not unwise, but understanding what the will of the Lord is. And be not drunk with wine, wherein is excess; but be filled with the Spirit; Speaking to yourselves in psalms and hymns and spiritual songs, singing and making melody in your heart to the Lord; Giving thanks always for all things unto God and the Father in the name of our Lord Jesus Christ.',
   '["Colossians 3:16-17", "1 Thessalonians 5:18"]',
   'Paul''s instruction to "redeem the time" is often read as a productivity mandate, but the verse that follows reveals something different: understand what the will of the Lord is. And then he says it plainly — be not drunk with wine, but be filled with the Spirit. The filling he describes looks like music: psalms, hymns, spiritual songs, melody in the heart. And the culminating act of a Spirit-filled life, in this passage, is thanksgiving — "giving thanks always for all things." The parallel with Colossians 3 is intentional; Paul gives this same teaching to two churches in nearly identical words because it is central. Spirit-filling and thanksgiving are not separate disciplines. When the Spirit fills a life, gratitude is the sound it makes. The phrase "for all things" is expansive in the same way "in everything" was in 1 Thessalonians 5 — all things, including the ones that make no obvious sense to thank God for.'
  ),
  (11,
   'Psalm 50:7-15',
   'The Sacrifice God Wants',
   'Hear, O my people, and I will speak; O Israel, and I will testify against thee: I am God, even thy God. I will not reprove thee for thy sacrifices or thy burnt offerings, to have been continually before me. I will take no bullock out of thy house, nor he goats out of thy folds. For every beast of the forest is mine, and the cattle upon a thousand hills. I know all the fowls of the mountains: and the wild beasts of the field are mine. If I were hungry, I would not tell thee: for the world is mine, and the fulness thereof. Will I eat the flesh of bulls, or drink the blood of goats? Offer unto God thanksgiving; and pay thy vows unto the most High: And call upon me in the day of trouble: I will deliver thee, and thou shalt glorify me.',
   '["Psalm 51:16-17", "Hosea 6:6"]',
   'This passage is one of the most startling in the Psalms — God putting His own sacrificial system on trial. Not to abolish it, but to expose its misunderstanding. "I will take no bullock out of your house" — not because the sacrifices are worthless, but because they were being given as if God needed them. The universe belongs to Him. Every creature in every forest is already His. What then does He want? Verse 14 is the answer: "Offer unto God thanksgiving." The Hebrew todah here is the thank-offering — not a guilt offering, not a burnt offering, not something given to settle a debt. It is the voluntary overflow of a grateful heart. And then the promise in verse 15 is remarkable: call on Me in the day of trouble, and I will deliver you — and you shall glorify Me. The whole economy of thanksgiving is revealed: we call, He delivers, we glorify, which is itself a form of thanksgiving. The loop is gratitude all the way through.'
  ),
  (12,
   'Hebrews 13:12-16',
   'The Sacrifice of Praise',
   'Wherefore Jesus also, that he might sanctify the people with his own blood, suffered without the gate. Let us go forth therefore unto him without the camp, bearing his reproach. For here have we no continuing city, but we seek one to come. By him therefore let us offer the sacrifice of praise to God continually, that is, the fruit of lips giving thanks to his name. But to do good and to communicate forget not: for with such sacrifices God is well pleased.',
   '["Psalm 50:14-15", "1 Peter 2:9"]',
   'The writer of Hebrews has just spent twelve chapters tracing the whole sacrificial system of Israel — priest, tabernacle, blood, covenant — and showing how all of it pointed to Christ. Now, in the closing chapter, he gives the practical conclusion: what does sacrifice look like after the cross? It is no longer animals. It is the "sacrifice of praise" — the fruit of lips that acknowledge His name. The word "sacrifice" is retained deliberately; Hebrews does not let us make gratitude cheap. This is not merely a nice attitude. It is something offered, given, extended — a genuine act of the will in a world that does not always make it easy. "Without the camp" means outside the approved, comfortable, socially acceptable place. Jesus suffered outside the gate. Our praise follows Him there — into places where gratitude is not the expected response, not the natural one, not the easy one. That is where it becomes a sacrifice.'
  ),
  (13,
   'Psalm 92:1-5',
   'Morning and Evening',
   'It is good to give thanks unto the LORD, and to sing praises unto thy name, O most High: To shew forth thy lovingkindness in the morning, and thy faithfulness every night, Upon an instrument of ten strings, and upon the psaltery; upon the harp with a solemn sound. For thou, LORD, hast made me glad through thy work: I will triumph in the works of thy hands. O LORD, how great are thy works! and thy thoughts are very deep.',
   '["Psalm 5:3", "Lamentations 3:23"]',
   'The title of Psalm 92 marks it as "A Song for the Sabbath Day" — meaning gratitude is the Sabbath work, the proper occupation of the day set apart for rest and worship. The psalmist is specific about timing: lovingkindness in the morning, faithfulness at night. Gratitude is not a one-time annual exercise; it frames the day at both ends. What is declared in the morning sets the orientation for everything that follows; what is recalled at night consolidates what God has been doing in the hours between. Verse 4 is the key to understanding why this is possible even in hard seasons: "Thou, LORD, hast made me glad through thy work." The gladness is located in God''s works, not in the circumstances of the day. And then the quiet confession of verse 5: Your thoughts are very deep. Not everything will be understood. Gratitude does not require comprehension; it requires trust.'
  ),
  (14,
   'Revelation 7:9-12',
   'The Song That Never Ends',
   'After this I beheld, and, lo, a great multitude, which no man could number, of all nations, and kindreds, and people, and tongues, stood before the throne, and before the Lamb, clothed with white robes, and palms in their hands; And cried with a loud voice, saying, Salvation to our God which sitteth upon the throne, and unto the Lamb. And all the angels stood round about the throne, and about the elders and the four beasts, and fell before the throne on their faces, and worshipped God, Saying, Amen: Blessing, and glory, and wisdom, and thanksgiving, and honour, and power, and might, be unto our God for ever and ever. Amen.',
   '["Psalm 150:6", "Isaiah 25:9"]',
   'The final day of this plan ends not with a teaching but with a scene — a vision of what gratitude ultimately is for. John sees a multitude no one can count, drawn from every nation, every kindred, every people, every tongue, and they are not silent. They are crying out with a loud voice. The palms in their hands are not symbols of peace but of celebration — waved at the Feast of Tabernacles and when Jesus entered Jerusalem. And in verse 12, the angels add their voices, and the list of what they offer God is sevenfold: blessing, glory, wisdom, thanksgiving, honor, power, and might — and in the middle of that majestic doxology is thanksgiving. Not as a footnote. In the center of the language of heaven, gratitude finds its permanent home. Everything this plan has been building toward — the thankful heart, the sacrifice of praise, the blessing at all times — is a rehearsal for this. We are practicing now what we will do forever.'
  )
) AS v(day_number, verse_ref, day_title, passage_text, passage_refs, reflection)
WHERE p.slug = 'heart-of-gratitude'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 2b — Heart of Gratitude: comprehension check questions.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET
  quiz_question    = v.question,
  quiz_options     = v.options,
  quiz_explanation = v.explanation
FROM reading_plans p,
(VALUES
  (1,
   'What does Psalm 100 give as the theological reason we should enter God''s gates with thanksgiving?',
   '[{"label":"A","text":"Because He has answered all our prayers","correct":false},{"label":"B","text":"Because the LORD is good, His mercy everlasting, and His truth enduring","correct":true},{"label":"C","text":"Because we are His servants and owe Him worship","correct":false}]',
   'Verse 5 states: "For the LORD is good; his mercy is everlasting; and his truth endureth to all generations." The reason for thanksgiving is not our circumstances but God''s unchanging character.'
  ),
  (2,
   'Paul says giving thanks in everything is "the will of God." What preposition does he use — give thanks FOR everything or IN everything?',
   '[{"label":"A","text":"FOR everything","correct":false},{"label":"B","text":"IN everything","correct":true},{"label":"C","text":"BECAUSE OF everything","correct":false}]',
   '"In every thing give thanks" — the preposition is in, not for. Paul is not asking us to be grateful for suffering or loss itself, but to maintain a posture of gratitude inside whatever circumstance we face.'
  ),
  (3,
   'What does verse 9 of Psalm 107 say God does for the longing soul?',
   '[{"label":"A","text":"Strengthens it","correct":false},{"label":"B","text":"Guides it home","correct":false},{"label":"C","text":"Satisfieth it","correct":true}]',
   '"For he satisfieth the longing soul, and filleth the hungry soul with goodness." Satisfies implies completeness — not a temporary filling, but arriving at the place the soul has always been heading.'
  ),
  (4,
   'According to Colossians 3:15-17, what should "rule" in the hearts of believers?',
   '[{"label":"A","text":"The word of Christ","correct":false},{"label":"B","text":"The peace of God","correct":true},{"label":"C","text":"A spirit of thanksgiving","correct":false}]',
   '"Let the peace of God rule in your hearts." The word "rule" is the Greek brabeuō — to umpire or arbitrate. Peace is the deciding factor in the inner life, the one that calls plays when we are pulled in different directions.'
  ),
  (5,
   'What does David say God has done that grounds his declaration "I will praise thee with my whole heart"?',
   '[{"label":"A","text":"Made me glad through his works","correct":false},{"label":"B","text":"Maintained my right and my cause","correct":true},{"label":"C","text":"Delivered me from all my fears","correct":false}]',
   '"For thou hast maintained my right and my cause; thou satest in the throne judging right." Whole-heart praise is not manufactured optimism — it is anchored in what God has already demonstrated He will do.'
  ),
  (6,
   'What does 1 Chronicles 16 say we should do with God''s marvellous works?',
   '[{"label":"A","text":"Remember them","correct":true},{"label":"B","text":"Study them","correct":false},{"label":"C","text":"Meditate on them silently","correct":false}]',
   '"Remember his marvellous works that he hath done, his wonders, and the judgments of his mouth." Memory is gratitude''s raw material — the passage commands active remembering as an act of worship, not passive nostalgia.'
  ),
  (7,
   'How many times does the refrain "his mercy endureth for ever" appear in the full Psalm 136?',
   '[{"label":"A","text":"Seven times","correct":false},{"label":"B","text":"Fourteen times","correct":false},{"label":"C","text":"Twenty-six times","correct":true}]',
   'Psalm 136 has twenty-six verses and each one ends with "for his mercy endureth for ever." The repetition is the point — the refrain is hammered into the heart by return and insistence until it lands.'
  ),
  (8,
   'Beyond the physical healing the ten lepers all received, what did Jesus say to the one who returned?',
   '[{"label":"A","text":"Your sins are forgiven","correct":false},{"label":"B","text":"Thy faith hath made thee whole","correct":true},{"label":"C","text":"Go and tell no one","correct":false}]',
   '"Thy faith hath made thee whole" — the Greek sōzō carries the weight of salvation, wholeness in a deeper dimension than physical healing. The nine received healing; the one who returned received something more.'
  ),
  (9,
   'David opens Psalm 34 with "I will bless the LORD at all times." What word does he use to describe how often his praise will continue?',
   '[{"label":"A","text":"Daily","correct":false},{"label":"B","text":"Continually","correct":true},{"label":"C","text":"Evermore","correct":false}]',
   '"His praise shall continually be in my mouth." The Hebrew tamid means always, without interruption. Not seasonally, not when feeling it — continually. This is a declaration of intent before it is a description of feeling.'
  ),
  (10,
   'What does Paul say the Spirit-filled life looks like in Ephesians 5:19-20?',
   '[{"label":"A","text":"Boldness in prayer and fasting","correct":false},{"label":"B","text":"Speaking psalms, making melody, and giving thanks always","correct":true},{"label":"C","text":"Holiness and separation from the world","correct":false}]',
   'Verses 19-20 describe Spirit-filling as: speaking to one another in psalms and hymns and spiritual songs, singing and making melody in the heart, and giving thanks always for all things. Gratitude is the sound of the Spirit-filled life.'
  ),
  (11,
   'In Psalm 50, what does God say He wants instead of burnt offerings?',
   '[{"label":"A","text":"Fasting and prayer","correct":false},{"label":"B","text":"Obedience to the law","correct":false},{"label":"C","text":"The sacrifice of thanksgiving","correct":true}]',
   '"Offer unto God thanksgiving" — the Hebrew todah, the thank-offering. God owns the cattle on a thousand hills; He needs nothing from us. What He wants is the voluntary offering of a grateful heart that acknowledges Him.'
  ),
  (12,
   'What does the writer of Hebrews call the "sacrifice of praise"?',
   '[{"label":"A","text":"A daily act of prayer","correct":false},{"label":"B","text":"The fruit of lips giving thanks to His name","correct":true},{"label":"C","text":"A sacrifice of obedience","correct":false}]',
   '"By him therefore let us offer the sacrifice of praise to God continually, that is, the fruit of lips giving thanks to his name." The definition is precise: the sacrifice is speech — spoken acknowledgment of God''s name, offered continuously.'
  ),
  (13,
   'At what two specific times of day does Psalm 92 say we should declare God''s attributes?',
   '[{"label":"A","text":"At dawn and dusk","correct":false},{"label":"B","text":"In the morning and every night","correct":true},{"label":"C","text":"At noon and at midnight","correct":false}]',
   '"To shew forth thy lovingkindness in the morning, and thy faithfulness every night." The morning and the evening become bookends of gratitude — what is declared at the start sets the orientation; what is recalled at night consolidates the day.'
  ),
  (14,
   'In the sevenfold doxology of Revelation 7:12, where does "thanksgiving" appear in the list?',
   '[{"label":"A","text":"First","correct":false},{"label":"B","text":"Last","correct":false},{"label":"C","text":"In the middle — fourth of seven","correct":true}]',
   '"Blessing, and glory, and wisdom, and thanksgiving, and honour, and power, and might." Thanksgiving is the fourth of seven — placed at the center of the language of heaven, not as an afterthought but as the heart of eternal worship.'
  )
) AS v(day_number, question, options, explanation)
WHERE p.slug = 'heart-of-gratitude'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 2c — Heart of Gratitude: word studies for memory verse
-- days (days 1 and 7). Keys are lowercase, punctuation-stripped
-- forms of the word as it appears in the passage text.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (1,
   '{"thanksgiving":{"original":"תּוֹדָה","transliteration":"todah","definition":"The thank-offering sacrifice — a voluntary act of gratitude distinct from required atonement offerings. Its root yadah means to extend the hand in praise and acknowledgment. Todah was given not to pay a debt but to celebrate God''s goodness freely.","refs":["Leviticus 7:12","Psalm 107:22"]},"mercy":{"original":"חֶסֶד","transliteration":"hesed","definition":"Covenant loyalty and steadfast love — not a feeling but a commitment. Hesed is the word used for what a faithful husband owes a wife, what a king owes his people. God''s hesed is not mood-dependent; it is bound to His own character.","refs":["Lamentations 3:22","Micah 7:18"]},"gladness":{"original":"שִׂמְחָה","transliteration":"simchah","definition":"Joy, delight, exuberant rejoicing — the kind that breaks out in song and celebration. David brought the ark to Jerusalem with simchah (2 Sam 6:12). This is not reserved contentment; it is expressed, embodied, voiced.","refs":["2 Samuel 6:12","Nehemiah 8:10"]}}'
  ),
  (7,
   '{"mercy":{"original":"חֶסֶד","transliteration":"hesed","definition":"Covenant faithfulness — the love that does not revoke what it has promised. Hesed is not sentiment; it is commitment bound by covenant. Psalm 136 repeats it twenty-six times because repetition is the only language adequate to its permanence.","refs":["Psalm 100:5","Lamentations 3:22"]},"endureth":{"original":"עוֹלָם","transliteration":"olam","definition":"Forever, for the age, without end. Not merely a very long time but duration of a different quality. Olam is used for God''s name (Exodus 3:15) and His kingdom (Psalm 145:13). Hesed plus olam: a love that is both infinite in quality and endless in duration.","refs":["Psalm 90:2","Isaiah 40:28"]},"thanks":{"original":"יָדָה","transliteration":"yadah","definition":"To praise, to acknowledge, to extend the hands — the physical gesture of open arms is embedded in the word. Gratitude in Hebrew was never merely internal; it was embodied, spoken aloud, offered in the assembly of the people.","refs":["Psalm 111:1","Isaiah 12:4"]}}'
  )
) AS v(day_number, ws)
WHERE p.slug = 'heart-of-gratitude'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 2h — Heart of Gratitude: dig deeper commentary +
-- further-study refs for days 1, 7, and 14.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET
  deep_dive_text = v.text,
  deep_dive_refs = v.refs
FROM reading_plans p,
(VALUES
  (1,
   'The word todah appears in the title of Psalm 100 — "A Psalm of Thanksgiving" — and it is the only psalm with this specific designation. Todah was the name of a particular sacrifice in the Israelite temple system: the thank-offering, described in Leviticus 7:12-15. Unlike the sin offering or the burnt offering, the todah was entirely voluntary. No law required it. You brought it when God had delivered you from trouble — from illness, from a dangerous journey, from an enemy — and you came to the temple to say so publicly. The sacrifice was accompanied by leavened bread (unusual for offerings), shared with family and friends, and had to be eaten the same day. It was a feast of gratitude: public, communal, and urgent. When the psalmist titles Psalm 100 with todah, he is saying: come before God with that posture — the posture of someone who has been delivered and knows it, who cannot wait until tomorrow to say thank You. The practical implication is significant. Todah-gratitude is not a private attitude. It is public acknowledgment. It names what God has done, in the hearing of others, in real time. The question the psalm asks each generation is: what has God delivered you from, and have you said so out loud?',
   '["Leviticus 7:12-15", "Psalm 107:22"]'
  ),
  (7,
   'The word hesed appears over 250 times in the Hebrew Bible, and no single English word captures it. It is usually translated "mercy," "lovingkindness," or "steadfast love," but each of those translations catches only part of it. Hesed is covenant loyalty — the love that is bound by promise, not driven by feeling. When a king shows hesed to a defeated enemy''s family, he is not acting sentimentally; he is honoring the bond he made with the man''s father. When God shows hesed to Israel in the wilderness, He is fulfilling what He promised at Sinai — a covenant sworn by His own name. The reason Psalm 136 repeats "for his mercy endureth for ever" twenty-six times is not poetry for its own sake. It is because the Israelite congregation would have responded with the refrain after each line — the entire assembly, not just a choir, became the voice of the declaration. Every person in the temple courts became a speaker of the truth: the hesed of God does not expire, does not wear thin, does not run out at the edge of your worst day. The theological weight of this repetition is significant. The psalm traces hesed through the creation of the heavens, the Exodus, the wilderness, the conquest — and invites the worshipper to locate their own story within that line. God''s hesed that parted the Red Sea is the same hesed that is present in your life today. It has not changed in quality or in quantity. Returning to that truth is not repetition for its own sake. It is the discipline of memory that keeps despair from winning.',
   '["Exodus 34:6-7", "Lamentations 3:22-23"]'
  ),
  (14,
   'The vision of Revelation 7 is deliberately placed between the sixth and seventh seals — a structural pause in the revelation of judgment. John has been watching the first six seals open in rapid succession: war, famine, death, cosmic signs, the sun darkened and the stars falling. And then, before the seventh seal, there is silence in heaven, and John sees a different scene entirely: the redeemed, standing before the throne. The multitude is described in terms that answer the chaos of the seals: every nation, every kindred, every people, every tongue — the fragmentation of Babel is undone. The white robes identify them as those who have come through the great tribulation, washed in the blood of the Lamb (v.14). Their song — salvation, and then thanksgiving in the middle of the sevenfold doxology — is not the song of people who avoided suffering. It is the song of people whose suffering was answered. The palms they carry were the festival palms of Tabernacles, the great harvest feast of thanksgiving that anticipated the final gathering of all nations. What the vision shows is that the gratitude cultivated in ordinary daily life — the todah, the hesed declared morning and evening, the sacrifice of praise in hard moments — is not a discipline that ends at death. It is the language being learned now for a conversation that does not end. Every act of gratitude in a hard season is a rehearsal. The song is already written. We are learning the words.',
   '["Revelation 5:9-10", "Leviticus 23:39-43"]'
  )
) AS v(day_number, text, refs)
WHERE p.slug = 'heart-of-gratitude'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 1b Enrichment — Light for the Path (14 days):
-- prayer, application, question, context_note, is_memory_verse.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET
  prayer          = v.prayer,
  application     = v.application,
  question        = v.question,
  context_note    = v.context_note,
  content_type    = 'verse',
  is_memory_verse = v.is_memory_verse
FROM reading_plans p,
(VALUES
  (1,
   'Lord, Your word is enough light for where I am. I may not see the path ahead, but I can see the next step. I choose to incline my heart to walk it. Guide me by Your word today — not just in what I read, but in what I do. Amen.',
   'Before making a decision today — even a small one — open your Bible and ask God to speak. It does not have to be a passage that seems "relevant." Practice the discipline of listening before acting. Write down what you noticed.',
   'The image is a lamp to the feet, not a floodlight to the horizon. What would change about how you seek God''s guidance if you stopped demanding a full roadmap before taking the next step?',
   'Psalm 119 is the longest chapter in the Bible — 176 verses arranged as an acrostic in which eight consecutive verses begin with each of the 22 Hebrew letters. This section (the fourteenth stanza, Nun) comes after years of the psalmist''s experience of the word tested under real pressure.',
   true
  ),
  (2,
   'Lord, I choose to trust You with all my heart today — not with part of it while the rest runs its own calculations. In everything I encounter, I want to acknowledge You. Make straight the paths I cannot straighten myself. Amen.',
   'Name one area where you have been "leaning on your own understanding" — relying entirely on your own analysis without genuinely seeking God''s voice. Bring that area to prayer today and ask a different question: Lord, what do You see that I am not seeing?',
   'What is the difference between acknowledging God mentally and acknowledging Him practically? What would it look like for you to acknowledge God "in all your ways" — including the ordinary decisions, not just the major ones?',
   'Proverbs 3:5-6 is among the most quoted passages in wisdom literature, but verse 7 is often omitted: "Be not wise in thine own eyes." This is the practical test for every decision — are we too confident in our own conclusions to check them?',
   false
  ),
  (3,
   'Father, I lack wisdom. I am not pretending otherwise. I ask You now — not wavering, not running a parallel calculation — just asking. Give me wisdom for what I am facing today. I trust that You give generously and without making me feel small for needing it. Amen.',
   'Write down one decision you are navigating right now. Then spend three minutes in prayer asking God specifically for wisdom about it — not explaining it to Him but asking Him to give what you lack. After, sit in silence for one minute and listen.',
   'Solomon says "I am but a little child: I know not how to go out or come in." What does that kind of acknowledged ignorance make possible? When is the last time you brought that level of honesty to God about a decision you face?',
   'Solomon''s request at Gibeon is the paradigm case of what James 1:5 describes: asking God for wisdom without holding back. The detail that God was "pleased" by the request — not by Solomon''s qualifications — shows that the asking itself was the right move.',
   false
  ),
  (4,
   'Lord, I trust that You are behind me even when I cannot feel You. Speak when I begin to drift. I want to hear Your voice — "this is the way, walk in it" — at every turning. Give me ears to hear You in the middle of ordinary moments. Amen.',
   'As you move through today, practice paying attention to moments of quiet redirection — a thought that checks your direction, a passage that reads differently than it did, a conversation that reframes a decision. God speaks behind us. Practice noticing.',
   'Isaiah says the voice comes when you "turn to the right hand, and when ye turn to the left" — at the moments of decision. How do you discern whether an internal prompt is God''s voice or your own inclination? What helps you tell the difference?',
   'Isaiah 30 addresses Israel''s choice to seek military alliance with Egypt rather than trusting God. The guidance of verse 21 was promised to a people who had been looking in the wrong direction for help. The Teacher''s voice is for those who have been looking elsewhere — it meets us at the turning, not before it.',
   false
  ),
  (5,
   'Lord Jesus, You are the light of the world. When I do not know where I am going, You do. Help me to stay close enough to You to be in the light — not straining to find the right path, but following the One who is the light. Amen.',
   'Spend five minutes today simply walking in Jesus'' presence — not asking for direction, not presenting problems, just acknowledging that He is the light and you are following. Practice being near Him before you ask what He wants from you.',
   'Jesus says those who follow Him will not walk in darkness. What is the difference between seeking a roadmap from God and following the person of Jesus? Have you ever experienced guidance that came simply from staying close to Him?',
   'Jesus speaks these words at the Feast of Tabernacles (Sukkot), which commemorated Israel''s wilderness wandering, during which God guided them by a pillar of cloud by day and fire by night. His claim to be "the light of the world" places Him in the position of that guiding pillar.',
   false
  ),
  (6,
   'Lord, I commit my works to You today — I roll them onto You. I cannot carry them to the outcomes I envision without Your hand directing the steps. Establish my thoughts according to Your purposes, not my projections. Amen.',
   'Take one project or plan you are currently working on. Write it out as you see it. Then pause and ask: Lord, what would You establish here? Write that question at the top of the page and leave it open. Come back to it tonight and see if anything has shifted.',
   'Verse 2 says "all the ways of a man are clean in his own eyes; but the LORD weigheth the spirits." How do you distinguish between a plan you are genuinely committed to and one that merely feels right to you? What checks do you have in place?',
   'Proverbs 16 sits at the structural center of the book of Proverbs — the 10th of 22 chapters. Scholars have noted it contains the highest concentration of verses that specifically attribute outcomes to God in the entire book. The center of Proverbs is divine sovereignty over human planning.',
   false
  ),
  (7,
   'Show me Your ways, O LORD. Teach me Your paths. Lead me in Your truth — not just the truth I find comfortable, but the truth that will make me into who You intend. I wait on You today. Amen.',
   'Pray Psalm 25:4-5 aloud three times today — as your morning prayer, as a midday pause, and before sleep. Make it the frame of the day. Notice whether anything shifts in how you perceive what is happening around you.',
   'Verse 10 says all the paths of the LORD are mercy and truth. Is there a path you are on right now that does not feel like mercy? What would it take to trust that His characterization of it is more accurate than yours?',
   'Psalm 25 is an acrostic — each verse beginning with the next Hebrew letter — making it a complete, comprehensive prayer for guidance. The acrostic form itself is a statement: I need God''s guidance for everything, from A to Z.',
   true
  ),
  (8,
   'Lord, I present myself to You now — not perfectly, but genuinely. Transform my mind by Your word, not conforming me to what surrounds me but shaping me toward what is good, acceptable, and perfect in Your eyes. Let me recognize Your will when I see it. Amen.',
   'Identify one area where you know you have been "conformed to this world" — thinking in ways shaped more by culture than by God''s word. Name it. Then find one verse that speaks directly to that area and meditate on it today.',
   'Paul says the renewed mind can "prove" the will of God. How does a mind get renewed? What habits or practices have you found that actually transform your thinking — not just inform it?',
   'Romans 12:1-2 is the pivot point of the entire letter to the Romans. The first eleven chapters are theological argument; chapters 12-16 are application. Paul opens the application section with transformation of the mind — because everything that follows in the Christian life depends on it.',
   false
  ),
  (9,
   'Lord, I trust that Your thoughts toward me are thoughts of peace and not of evil. Even in this season — which may look like exile from where I expected to be — You are working toward a planned end. Help me to seek You with all my heart and find You. Amen.',
   'Read Jeremiah 29:11 in its full context (at least verses 4-14). Notice how much God expected of Israel while they waited in Babylon: build houses, plant gardens, seek the welfare of the city. What does it mean to "settle in" while trusting God''s future plans?',
   'Jeremiah 29:11 is one of the most quoted verses in Scripture, but often torn from context. Knowing it was spoken to people in exile who would wait seventy years — how does that change what the verse means for your own circumstances?',
   'Jeremiah 29 is a letter written to the exiles already deported to Babylon in 597 BC, before the final destruction of Jerusalem. The false prophets were telling the exiles they would return quickly; Jeremiah told them to settle in — the exile would last seventy years. The good plans ran through the long wait, not around it.',
   false
  ),
  (10,
   'Father, I want to know You well enough to catch Your eye — to receive Your guidance not through crisis management but through intimacy developed over time. Guide me with Your eye today. I want to be the kind of person who needs only a glance to know. Amen.',
   'Spend ten minutes today in silence — not speaking, not presenting requests, just being with God. The practice of unhurried presence is how the guidance of the eye develops. Notice what comes into your awareness in the quiet.',
   'The contrast in verse 9 is between coerced direction (horse and mule) and responsive guidance (guided by the eye). Which of those more accurately describes your current relationship with God''s guidance? What would bring you closer to the second?',
   'Psalm 32 is one of the seven penitential psalms, attributed to David, likely written in the aftermath of his sin with Bathsheba. The instruction of verse 8 is God speaking back — the one who confessed and was forgiven is now the one being guided. The path of restoration and the path of instruction are the same path.',
   false
  ),
  (11,
   'Lord, give me the humility to seek counsel — not to replace Your voice but to hear it more clearly through those You have placed around me. Help me find people of faithful spirit whose wisdom can help me stay on course. Amen.',
   'Identify one decision you are making largely alone that would benefit from the perspective of a trusted, wise person. Make a plan to seek that counsel this week — not for validation, but for genuine input from someone who will tell you the truth.',
   'What makes seeking counsel a sign of wisdom rather than weakness? Who are the "faithful-spirited" people in your life whose counsel you trust? If you cannot name anyone, what would it take to build that kind of relationship?',
   'Proverbs 11:14 uses the word tachbuloth — steering ropes, the cables used to direct an ancient ship. The nautical metaphor suggests that community counsel is not optional enrichment for the already-decided; it is the steering system. Without it, the vessel drifts.',
   false
  ),
  (12,
   'Father, I knock today. I ask for wisdom I do not have, for guidance I cannot manufacture, for light on the path ahead. I trust that You are not a God who gives stones when I ask for bread. Give me what is good. Amen.',
   'Write down one specific thing you have been wanting to ask God but have been hesitant to bring before Him. Bring it today — not with elaboration or apology, just ask. Then bring it again tomorrow. And the day after. Practice the persistence Jesus commends.',
   'Jesus says "every one that asketh receiveth." Does that match your experience? When have you asked persistently and found — perhaps not the answer you expected, but an answer? What did that teach you about the character of God?',
   'This passage is part of the Sermon on the Mount, addressed to Jesus'' disciples — people already following Him. The ask-seek-knock instruction is not for unbelievers seeking God; it is for disciples who need to learn persistent prayer as a discipline of the already-committed life.',
   false
  ),
  (13,
   'Lord, fill me with the knowledge of Your will in all wisdom and spiritual understanding. Not so I can have clarity on every question, but so I can walk worthy of You — fruitful, increasing in knowledge, strengthened for the long way. I thank You for the inheritance You have prepared. Amen.',
   'Pray Colossians 1:9-12 for someone else today — name them specifically as you go through each petition: that they would be filled with the knowledge of God''s will, walk worthy, be fruitful, be strengthened. Let the prayer shape your own heart as you pray it for them.',
   'Paul prays for the Colossians without ceasing from "the day we heard it." What does sustained, ongoing intercessory prayer for another person''s discernment say about what Paul believed about guidance? What would it mean to pray that way for someone in your life?',
   'Colossians 1:9-12 is one of Paul''s most comprehensive intercessory prayers. He had never visited Colossae — the church was planted by his colleague Epaphras — yet he prays without ceasing for people he has never met. The prayer demonstrates that Paul believed God was eager to give the knowledge of His will, not withhold it.',
   false
  ),
  (14,
   'Lord, You are my God forever and ever. You will be my guide even unto death. I place everything I face — every decision, every crossroads, every season of uncertainty — into the hands of the One who guides without end. Thank You. Amen.',
   'Write a short "guidance testimony" — three to five sentences about a time when God''s guidance became clear to you, even if only in retrospect. Share it with one person before the week is out. Let your testimony become part of how God guides someone else.',
   'Psalm 48:14 ends with "he will be our guide even unto death." What does it mean that God''s guidance has no terminal point — that the guide does not stop at the boundary that stops everything else? How does that change how you face whatever is ahead?',
   'Psalm 48 is a "Zion psalm" — a celebration of God''s presence and protection in Jerusalem. The final verse is the theological climax: the God who has defended Zion is the God who will guide His people for all time. Every guide in life eventually reaches a limit; this Guide does not.',
   false
  )
) AS v(day_number, prayer, application, question, context_note, is_memory_verse)
WHERE p.slug = 'light-for-the-path'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 1c — Light for the Path: passage text, day titles,
-- expanded verse refs, cross-references, enriched reflections,
-- and content_type = 'passage'.
-- Fully idempotent UPDATEs keyed on (plan_slug, day_number).
-- NOTE: Day 3 uses 1 Kings 3:5-12 (Solomon at Gibeon) instead
-- of James 1:5-8 to avoid passage overlap with Strength in
-- the Storm Day 3 (James 1:2-8).
-- ============================================================

UPDATE reading_plan_entries e
SET
  verse_ref    = v.verse_ref,
  day_title    = v.day_title,
  passage_text = v.passage_text,
  passage_refs = v.passage_refs,
  reflection   = v.reflection,
  content_type = 'passage'
FROM reading_plans p,
(VALUES
  (1,
   'Psalm 119:105-112',
   'A Lamp to My Feet',
   'Thy word is a lamp unto my feet, and a light unto my path. I have sworn, and I will perform it, that I will keep thy righteous judgments. I am afflicted very much: quicken me, O LORD, according unto thy word. Accept, I beseech thee, the freewill offerings of my mouth, O LORD, and teach me thy judgments. My soul is continually in mine hand: yet do I not forget thy law. The wicked have laid a snare for me: yet I erred not from thy precepts. Thy testimonies have I taken as an heritage for ever: for they are the rejoicing of my heart. I have inclined mine heart to perform thy statutes alway, even unto the end.',
   '["Proverbs 6:23", "2 Peter 1:19"]',
   'The lamp in verse 105 is a small, portable lamp — the kind carried in one hand at night, illuminating only the ground immediately ahead, not the horizon. This is the actual experience of walking by God''s word: not a panoramic view of the future, but enough light for the next step. The psalmist makes his declaration in the middle of difficulty — "I am afflicted very much" (v.107); this is not guidance received in comfortable conditions. The word is a lamp precisely in the darkness, precisely when it is impossible to see far ahead. Notice what he does with it: he inclines his heart to perform the statutes "alway, even unto the end." The guidance is not a one-time GPS recalculation — it is an ongoing submission to the One whose word lights the way. God does not reveal the whole path at once. He reveals the next step. That is enough for those who trust the One holding the lamp.'
  ),
  (2,
   'Proverbs 3:5-8',
   'Lean Not',
   'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths. Be not wise in thine own eyes: fear the LORD, and depart from evil. It shall be health to thy navel, and marrow to thy bones.',
   '["Isaiah 55:8-9", "James 4:13-15"]',
   'The verb "lean" carries the image of pressing your full body weight against something for support — leaning on our own understanding means making our best analysis the load-bearing wall of our decisions. Proverbs does not say our understanding is worthless — it says it is insufficient as the thing we press our full weight against. The condition for straight paths is in verse 6: "in all thy ways acknowledge him." The word for acknowledge is relational knowing — not a mental nod but a recognition that involves the whole person, the way one partner in a marriage knows the other. The verse is not a formula for GPS navigation. It is a description of a relationship in which we involve God in everything, not just the crossroads moments. And then comes the promise: He shall direct, or literally "make straight," your paths. The direction is His responsibility when the acknowledgment is genuinely ours.'
  ),
  (3,
   '1 Kings 3:5-12',
   'Ask What I Shall Give Thee',
   'In Gibeon the LORD appeared to Solomon in a dream by night: and God said, Ask what I shall give thee. And Solomon said, Thou hast shewed unto thy servant David my father great mercy, according as he walked before thee in truth, and in righteousness, and in uprightness of heart with thee; and thou hast kept for him this great kindness, that thou hast given him a son to sit on his throne, as it is this day. And now, O LORD my God, thou hast made thy servant king instead of David my father: and I am but a little child: I know not how to go out or come in. And thy servant is in the midst of thy people which thou hast chosen, a great people, that cannot be numbered nor counted for multitude. Give therefore thy servant an understanding heart to judge thy people, that I may discern between good and bad: for who is able to judge this thy so great a people? And it pleased the Lord that Solomon had asked this thing. And God said unto him, Because thou hast asked this thing, and hast not asked for thyself long life; neither hast asked riches for thyself, nor hast asked the life of thine enemies; but hast asked for thyself understanding to discern judgment; Behold, I have done according to thy words: lo, I have given thee a wise and an understanding heart; so that there was none like thee before thee, neither after thee shall any arise like thee.',
   '["James 1:5", "Proverbs 2:3-6"]',
   'Solomon''s request at Gibeon is the paradigm case of wisdom-seeking: he acknowledges exactly what he lacks — "I know not how to go out or come in" — and asks for the one thing that would make him sufficient to his calling. He does not ask for riches or long life or the defeat of his enemies. He asks for an understanding heart to discern between good and bad. And then comes the striking detail: "it pleased the Lord that Solomon had asked this thing." God is not merely willing to give wisdom to those who ask; He is pleased by the asking itself. A request grounded in genuine need, oriented toward serving others rather than serving the self, offered without holding back a parallel plan — that is the asking James 1:5 describes. The wisdom given to Solomon was not just for Solomon. It was so that he could judge the people well. The wisdom God gives is always larger than the person it flows through.'
  ),
  (4,
   'Isaiah 30:18-21',
   'This Is the Way',
   'And therefore will the LORD wait, that he may be gracious unto you, and therefore will he be exalted, that he may have mercy upon you: for the LORD is a God of judgment: blessed are all they that wait for him. For the people shall dwell in Zion at Jerusalem: thou shalt weep no more: he will be very gracious unto thee at the voice of thy cry; when he shall hear it, he will answer thee. And though the Lord give you the bread of adversity, and the water of affliction, yet shall not thy teachers be removed into a corner any more, but thine eyes shall see thy teachers: And thine ears shall hear a word behind thee, saying, This is the way, walk ye in it, when ye turn to the right hand, and when ye turn to the left.',
   '["Psalm 32:8", "John 10:27"]',
   'The voice in verse 21 comes from behind — not from ahead of the path, where we might expect guidance to stand, but from behind, where the shepherd walks with the flock. This is the guidance of One who watches you move and speaks when you begin to veer. The context in verse 18 is essential: "the LORD will wait, that he may be gracious unto you." He does not rush His answers. He watches. And when you turn — in either direction — His voice comes. Not in the moment before, not after you are deeply lost, but at the turning: "this is the way, walk in it." This guidance is not a pre-provided map. It is ongoing companionship from the Teacher who never leaves. And notice what precedes the guidance: "the bread of adversity, and the water of affliction." This voice speaks in the middle of hard seasons, not in their absence. The difficulty that makes us listen is often what makes us capable of hearing.'
  ),
  (5,
   'John 8:12-14',
   'I Am the Light',
   'Then spake Jesus again unto them, saying, I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life. The Pharisees therefore said unto him, Thou bearest record of thyself; thy record is not true. Jesus answered and said unto them, Though I bear record of myself, yet my record is true: for I know whence I came, and whither I go; but ye cannot tell whence I come, and whither I go.',
   '["Psalm 27:1", "John 1:4-5"]',
   'At the Feast of Tabernacles, massive golden lampstands lit the Court of Women in the Jerusalem temple — their light was said to illuminate all the surrounding city. Against that backdrop, Jesus makes His declaration: "I am the light of the world." He is not claiming to be a better lamp. He is claiming to be the source from which all light comes. And the promise He attaches is not that the path will be clear — it is that following Him means not walking in darkness. The light is inseparable from the person. This reframes the whole question of divine guidance: the primary question is not "what path should I take?" but "am I close enough to Him to be in the light?" The Pharisees dispute His testimony; He answers with certainty about two things they cannot know: where He came from and where He is going. The follower who knows neither can trust the guide who knows both.'
  ),
  (6,
   'Proverbs 16:1-9',
   'The LORD Directs the Steps',
   'The preparations of the heart in man, and the answer of the tongue, is from the LORD. All the ways of a man are clean in his own eyes; but the LORD weigheth the spirits. Commit thy works unto the LORD, and thy thoughts shall be established. The LORD hath made all things for himself: yea, even the wicked for the day of evil. Every one that is proud in heart is an abomination to the LORD: though hand join in hand, he shall not be unpunished. By mercy and truth iniquity is purged: and by the fear of the LORD men depart from evil. When a man''s ways please the LORD, he maketh even his enemies to be at peace with him. Better is a little with righteousness than great revenues without right. A man''s heart deviseth his way: but the LORD directeth his steps.',
   '["Psalm 37:5", "Romans 8:28"]',
   'These nine proverbs return again and again to one theme: human planning does not negate divine sovereignty, and divine sovereignty does not negate human planning. Both are real. Both are happening simultaneously. The key is verse 3: "Commit thy works unto the LORD, and thy thoughts shall be established." The Hebrew galal means to roll — to roll your burden off your back onto a stronger back. The image is not passive resignation. It is an active choice to release what you were carrying alone. When that rolling happens, the promise is not that your works will succeed as you imagined; it is that your thoughts — your inner sense of purpose and direction — will be established. God shapes the planner before He shapes the plan. And verse 9 holds both sides in a single breath: devise your way, and let the One who holds the future direct every step of it.'
  ),
  (7,
   'Psalm 25:4-10',
   'Lead Me in Your Truth',
   'Shew me thy ways, O LORD; teach me thy paths. Lead me in thy truth, and teach me: for thou art the God of my salvation; on thee do I wait all the day. Remember, O LORD, thy tender mercies and thy lovingkindnesses; for they have been ever of old. Remember not the sins of my youth, nor my transgressions: according to thy mercy remember thou me for thy goodness'' sake, O LORD. Good and upright is the LORD: therefore will he teach sinners in the way. The meek will he guide in judgment: and the meek will he teach his way. All the paths of the LORD are mercy and truth unto such as keep his covenant and his testimonies.',
   '["Psalm 143:8-10", "Isaiah 42:16"]',
   'David''s prayer in these verses moves through three petitions — show me, teach me, lead me — and they are not random. Showing is what God does for the eyes; teaching is what He does for the understanding; leading is what He does for the will. Guidance from God touches all three. But the climax of the passage is verse 10: "All the paths of the LORD are mercy and truth." Not some. All. Whatever path God is leading you on — including the difficult one, the one that makes no sense, the one that looks like detour — it is characterized by hesed and emet: covenant love and faithfulness. The guidance is not only directional. It is relational. And notice the condition: "unto such as keep his covenant and his testimonies." This is not a merit clause; it is a description of the person oriented toward God — for whom His paths are both visible and inhabited by His character.'
  ),
  (8,
   'Romans 12:1-2',
   'The Renewing of Your Mind',
   'I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service. And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.',
   '["Ephesians 4:23-24", "Colossians 3:10"]',
   'The key to discerning God''s will, Paul says, is not a technique for hearing voices — it is a transformation. The mind that has been renewed can "prove" the will of God — the Greek dokimazō, to test and approve, the way a metallurgist tests metal for purity. The renewed mind does not need a vision for every decision; it has been shaped to recognize what is good, acceptable, and perfect in God''s eyes. But the transformation Paul describes is preceded by a sacrifice: the whole self, presented to God. Conformity to this world is the default; it happens without effort. Transformation requires direction — the ongoing offering of the self to God. When we are shaped by God''s word and ways over time, guidance becomes less of a crisis and more of an ongoing capacity to see what He sees.'
  ),
  (9,
   'Jeremiah 29:10-14',
   'Plans for Your Future',
   'For thus saith the LORD, That after seventy years be accomplished at Babylon I will visit you, and perform my good word toward you, in causing you to return to this place. For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end. Then shall ye call upon me, and ye shall go and pray unto me, and I will hearken unto you. And ye shall seek me, and find me, when ye shall search for me with all your heart. And I will be found of you, saith the LORD: and I will turn away your captivity, and I will gather you from all the nations, and from all the places whither I have driven you, saith the LORD; and I will bring you again into the place whence I caused you to be carried away captive.',
   '["Romans 8:28", "Psalm 139:16-17"]',
   'The context of Jeremiah 29:11 is one of the most important details in Scripture: it was written to people in Babylon, in exile, told they would be there for seventy years. The plans for welfare and not for evil were spoken into the worst circumstances imaginable — loss of homeland, temple, and national identity. God''s good plans for Israel did not exempt them from the decades in Babylon; they ran through those decades. This is the critical reframe: the plans are not plans to avoid suffering, but plans that hold in the middle of it and arrive at a promised destination on the other side. And then comes verse 13: "ye shall seek me, and find me, when ye shall search for me with all your heart." The promise is not that God will be easy to find. It is that He will be findable to those who search with everything. The good plans require seeking.'
  ),
  (10,
   'Psalm 32:6-11',
   'I Will Guide Thee with Mine Eye',
   'For this shall every one that is godly pray unto thee in a time when thou mayest be found: surely in the floods of great waters they shall not come nigh unto him. Thou art my hiding place; thou shalt preserve me from trouble; thou shalt compass me about with songs of deliverance. Selah. I will instruct thee and teach thee in the way which thou shalt go: I will guide thee with mine eye. Be ye not as the horse, or as the mule, which have no understanding: whose mouth must be held in with bit and bridle, lest they come near unto thee. Many sorrows shall be to the wicked: but he that trusteth in the LORD, mercy shall compass him about. Be glad in the LORD, and rejoice, ye righteous: and shout for joy, all ye upright in heart.',
   '["Isaiah 30:21", "John 10:3-4"]',
   'Verse 8 offers the most intimate image of guidance in Scripture: "I will guide thee with mine eye." Not with a sign, not with a sermon, not even with a word — with the eye. This is the guidance of someone who knows you so well that a glance communicates direction, the way a parent''s look across a room tells a child everything without a word being spoken. The contrast in verse 9 is deliberate: be not as the horse or mule, controlled by bit and bridle because they have no understanding of where they are being led or why. The animal must be coerced; the person who knows the guide responds to a look. The implication is clear: the more time we spend in God''s presence, in His word, in prayer — the more sensitive we become to the guidance of His eye. The practice of silence, of unhurried waiting before God, is not spiritual passivity; it is learning to read the face of the One who guides.'
  ),
  (11,
   'Proverbs 11:12-14',
   'Safety in Counsel',
   'He that is void of wisdom despiseth his neighbour: but a man of understanding holdeth his tongue. A talebearer revealeth secrets: but he that is of a faithful spirit concealeth the matter. Where no counsel is, the people fall: but in the multitude of counsellors there is safety.',
   '["Proverbs 15:22", "Proverbs 20:18"]',
   'The word translated "counsel" in verse 14 — the Hebrew tachbuloth — is a nautical term: the steering ropes, the cables used to direct a ship through difficult water. Where there are no steering ropes, the ship drifts. The proverb is not recommending a committee for every decision; it is naming a structural reality about human navigation. We are not built to find our way through hard seasons alone. And verse 13 frames what makes counsel trustworthy: a faithful spirit, one that holds confidence without broadcasting what has been shared. The counsel being recommended is not the kind that gossips your uncertainty around. It is the counsel of the faithful — those who can be trusted with what is fragile. To seek that kind of counsel is not a failure of faith. It is a form of humility that God has built into the architecture of the community.'
  ),
  (12,
   'Matthew 7:7-11',
   'Ask, Seek, Knock',
   'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you: For every one that asketh receiveth; and he that seeketh findeth; and to him that knocketh it shall be opened. Or what man is there of you, whom if his son ask bread, will he give him a stone? Or if he ask a fish, will he give him a serpent? If ye then, being evil, know how to give good gifts unto your children, how much more shall your Father which is in heaven give good things to them that ask him?',
   '["James 1:5", "Luke 11:9-13"]',
   'The three imperatives — ask, seek, knock — form a deliberate escalation. Asking is verbal request. Seeking is active investigation, moving toward the object. Knocking is sustained, persistent engagement — the repeated action at a closed door. Each level requires more of the person making the request, and each is matched by a corresponding promise: it will be given, you will find, it will be opened. The guarantee is not that you will receive exactly what you expected. It is that the request will be heard and answered. Jesus then grounds the promise in the most ordinary experience: a child asking a parent for food. No good parent responds to a hungry child''s request for bread with a stone. If flawed parents know how to give good gifts, how much more does the Father? The persistent asking does not wear Him down. It aligns us with what He is already disposed to give.'
  ),
  (13,
   'Colossians 1:9-12',
   'Filled with the Knowledge of His Will',
   'For this cause we also, since the day we heard it, do not cease to pray for you, and to desire that ye might be filled with the knowledge of his will in all wisdom and spiritual understanding; That ye might walk worthy of the Lord unto all pleasing, being fruitful in every good work, and increasing in the knowledge of God; Strengthened with all might, according to his glorious power, unto all patience and longsuffering with joyfulness; Giving thanks unto the Father, which hath made us meet to be partakers of the inheritance of the saints in light.',
   '["Romans 12:2", "Ephesians 1:17-18"]',
   'Paul prays that believers would be filled with the knowledge of God''s will — and then immediately describes what that knowledge produces. It is not primarily a list of correct decisions. It is a walk: worthy of the Lord, pleasing to Him, fruitful in every good work, increasing in the knowledge of God. The fruit of knowing God''s will is not a mapped-out life plan; it is a quality of living that reflects His character. This is the mature vision of divine guidance: not GPS navigation for every crossroads, but a person so shaped by the knowledge of God''s ways that their life naturally tends in the right direction. The prayer continues into strength for patience and longsuffering with joyfulness — guidance for the long haul. And the prayer closes with thanksgiving: not for all questions having been answered, but for having been made partakers of the inheritance. The knowledge of God''s will begins and ends in gratitude.'
  ),
  (14,
   'Psalm 48:9-14',
   'He Will Guide Us Forever',
   'We have thought of thy lovingkindness, O God, in the midst of thy temple. According to thy name, O God, so is thy praise unto the ends of the earth: thy right hand is full of righteousness. Let mount Zion rejoice, let the daughters of Judah be glad, because of thy judgments. Walk about Zion, and go round about her: tell the towers thereof. Mark ye well her bulwarks, consider her palaces; that ye may tell it to the generation following. For this God is our God for ever and ever: he will be our guide even unto death.',
   '["Isaiah 58:11", "John 14:1-3"]',
   'The plan closes with a declaration that reframes all fourteen days: the God who has been guiding — by His word, by His presence, by His wisdom, by His voice from behind — will be our guide even unto death. The Hebrew of the final phrase can be read as "until death," "beyond death," or "forever" — and all three readings agree on the essential thing: guidance is not a temporary provision. It is the character of the God who holds us, permanent and covenantal. The psalm invites its readers to walk around Zion and count the towers — to take careful note of what God has built and protected — so they can tell it to the next generation. On the last day of this plan, the same invitation stands: count what God has guided you through. Name it. Tell someone. The testimony of His guidance is part of how He guides others.'
  )
) AS v(day_number, verse_ref, day_title, passage_text, passage_refs, reflection)
WHERE p.slug = 'light-for-the-path'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 2b — Light for the Path: comprehension check questions.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET
  quiz_question    = v.question,
  quiz_options     = v.options,
  quiz_explanation = v.explanation
FROM reading_plans p,
(VALUES
  (1,
   'Psalm 119:105 calls God''s word "a lamp unto my feet." What does the lamp image tell us about how guidance arrives?',
   '[{"label":"A","text":"A floodlight that reveals the full route ahead","correct":false},{"label":"B","text":"A small lamp giving enough light for the next step only","correct":true},{"label":"C","text":"A beacon that shines from a fixed point above","correct":false}]',
   '"A lamp unto my feet" — the ancient clay oil lamp illuminated roughly a foot of ground ahead of the walker. Not the horizon; just the next step. God''s word guides by revealing what is immediately before you, not by producing a complete roadmap.'
  ),
  (2,
   'In Proverbs 3:6, what is the stated condition for God directing your paths?',
   '[{"label":"A","text":"Trusting Him with all your heart","correct":false},{"label":"B","text":"Acknowledging Him in all your ways","correct":true},{"label":"C","text":"Departing from evil","correct":false}]',
   '"In all thy ways acknowledge him, and he shall direct thy paths." Trust (v.5) is the foundation; acknowledgment (v.6) is the daily practice. Involving God in everything — not just major decisions — is what produces straight paths.'
  ),
  (3,
   'What was God''s response when He was pleased by Solomon''s request at Gibeon?',
   '[{"label":"A","text":"He told Solomon to prove himself first","correct":false},{"label":"B","text":"He gave Solomon a wise and understanding heart immediately","correct":true},{"label":"C","text":"He said Solomon should also ask for long life","correct":false}]',
   '"I have given thee a wise and an understanding heart; so that there was none like thee before thee." God did not delay or require proof — the asking itself pleased Him, and He gave generously at once.'
  ),
  (4,
   'In Isaiah 30:21, from which direction does the guiding voice come?',
   '[{"label":"A","text":"Ahead of you, as a light on the path","correct":false},{"label":"B","text":"From within, as an inner conviction","correct":false},{"label":"C","text":"From behind","correct":true}]',
   '"Thine ears shall hear a word behind thee, saying, This is the way, walk ye in it." The voice comes from behind — accompanying, not leading from in front. It speaks at the moment of turning, correcting direction the instant the drift begins.'
  ),
  (5,
   'What does Jesus promise to those who follow Him in John 8:12?',
   '[{"label":"A","text":"They will see all things clearly","correct":false},{"label":"B","text":"They will not walk in darkness","correct":true},{"label":"C","text":"Their path will be made straight","correct":false}]',
   '"He that followeth me shall not walk in darkness, but shall have the light of life." The promise is not panoramic clarity — it is that following the person of Jesus keeps you out of darkness. The light is inseparable from the relationship, not a feature of the road itself.'
  ),
  (6,
   'What does the Hebrew word galal — translated "commit" in Proverbs 16:3 — literally mean?',
   '[{"label":"A","text":"To present and dedicate","correct":false},{"label":"B","text":"To roll your burden onto","correct":true},{"label":"C","text":"To surrender and release","correct":false}]',
   'Galal means to roll — the image of rolling a heavy load off your back onto a stronger back. The result is not that your plan succeeds as imagined, but that your thoughts — your inner sense of direction — are established by God.'
  ),
  (7,
   'According to Psalm 25:10, what characterizes all the paths of the LORD?',
   '[{"label":"A","text":"Power and victory","correct":false},{"label":"B","text":"Mercy and truth","correct":true},{"label":"C","text":"Peace and rest","correct":false}]',
   '"All the paths of the LORD are mercy and truth." Not some paths — all. The Hebrew is hesed (covenant love) and emet (faithfulness). Whatever path God leads on, even a difficult one, is characterized by these two qualities at its core.'
  ),
  (8,
   'According to Romans 12:2, what does the renewed mind enable the believer to do?',
   '[{"label":"A","text":"Receive visions and prophetic words","correct":false},{"label":"B","text":"Prove what is the good, acceptable, and perfect will of God","correct":true},{"label":"C","text":"Be free from doubt and confusion","correct":false}]',
   '"Be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God." The Greek dokimazō means to test and approve. The renewed mind discerns — it recognizes God''s will rather than waiting for it to be announced from outside.'
  ),
  (9,
   'To whom were the "plans for welfare and not for evil" of Jeremiah 29:11 originally spoken?',
   '[{"label":"A","text":"Israel in the promised land","correct":false},{"label":"B","text":"Israel in exile in Babylon","correct":true},{"label":"C","text":"The Jerusalem remnant after the exile","correct":false}]',
   'Jeremiah wrote this letter to the exiles already in Babylon — people who had lost homeland, temple, and national identity. The good plans ran through the decades of exile, not around them.'
  ),
  (10,
   'What is the most intimate image of divine guidance in Psalm 32:8?',
   '[{"label":"A","text":"I will light your path","correct":false},{"label":"B","text":"I will guide thee with mine eye","correct":true},{"label":"C","text":"I will speak to you in the night","correct":false}]',
   '"I will guide thee with mine eye" — not by sign, command, or word, but by a look. The contrast with the horse and mule (v.9) makes the point: the animal requires force; the one who knows the guide responds to a glance.'
  ),
  (11,
   'What does the Hebrew word tachbuloth — translated "counsel" in Proverbs 11:14 — literally mean?',
   '[{"label":"A","text":"Wisdom of the elders","correct":false},{"label":"B","text":"Steering ropes of a ship","correct":true},{"label":"C","text":"The counsel of the assembly","correct":false}]',
   'Tachbuloth is a nautical term for the ropes used to steer an ancient ship. Community counsel is not optional enrichment for the already-decided; it is the steering system. Without it, the vessel drifts.'
  ),
  (12,
   'What does Jesus compare the Father to, to assure us God gives good things to those who ask?',
   '[{"label":"A","text":"A king who rewards faithful subjects","correct":false},{"label":"B","text":"A good father who gives food when his child asks","correct":true},{"label":"C","text":"A merchant with abundant goods in store","correct":false}]',
   '"What man is there of you, whom if his son ask bread, will he give him a stone?" If flawed parents know how to give good gifts, how much more does the Father. The persistent asking aligns us with what He is already disposed to give.'
  ),
  (13,
   'What does being filled with the knowledge of God''s will immediately produce, according to Colossians 1:10?',
   '[{"label":"A","text":"Clarity about which decisions to make","correct":false},{"label":"B","text":"A worthy walk — fruitful in every good work","correct":true},{"label":"C","text":"Freedom from uncertainty","correct":false}]',
   '"That ye might walk worthy of the Lord unto all pleasing, being fruitful in every good work." The first fruit of knowing God''s will is not a mapped-out plan — it is a quality of life that reflects His character. Guidance shapes the person before it specifies the path.'
  ),
  (14,
   'Psalm 48:14 says God will be our guide "even unto death." What is the significance of that phrase?',
   '[{"label":"A","text":"God guides us so we will not die prematurely","correct":false},{"label":"B","text":"God''s guidance has no terminal point — even death does not end it","correct":true},{"label":"C","text":"Death is the ultimate destination of the guided life","correct":false}]',
   'The Hebrew allows "until death," "beyond death," or "forever" — all consistent with the psalm''s theology. Every other guide eventually reaches the edge of their capacity. This Guide does not.'
  )
) AS v(day_number, question, options, explanation)
WHERE p.slug = 'light-for-the-path'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 2c — Light for the Path: word studies for memory verse
-- days (days 1 and 7). Keys are lowercase, punctuation-stripped
-- forms of the word as it appears in the passage text.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (1,
   '{"lamp":{"original":"נֵר","transliteration":"ner","definition":"A small clay oil lamp — the kind cupped in one hand, with a wick floating in olive oil, illuminating roughly a foot of ground ahead. Not a floodlight but a personal, intimate source of light for one person on one road in darkness.","refs":["Proverbs 6:23","2 Samuel 22:29"]},"word":{"original":"דָּבָר","transliteration":"dabar","definition":"Speech, word, message — but with weight and effect. In Hebrew thought, dabar accomplishes what it says: God''s dabar created the world (Gen 1) and called nations into existence. When the psalmist says God''s dabar is his lamp, he is claiming that same creative, guiding power for his daily walk.","refs":["Genesis 1:3","Isaiah 55:11"]},"light":{"original":"אוֹר","transliteration":"or","definition":"Light itself — the first thing God created (Gen 1:3). Or is used for physical light, for the light of God''s face, and for wisdom and revelation. Proverbs 4:18 says the path of the righteous is like the dawning or, shining brighter and brighter until full day.","refs":["Proverbs 4:18","Psalm 27:1"]}}'
  ),
  (7,
   '{"ways":{"original":"דֶּרֶך","transliteration":"derek","definition":"A road, a path, a way of life — used for both physical routes and moral directions. When the psalmist asks God to show him His derek, he is asking for both the direction to walk and the character to walk in. Derek appears four times in Psalm 25 alone.","refs":["Psalm 1:6","Proverbs 3:6"]},"lead":{"original":"נָחָה","transliteration":"nachah","definition":"To lead, to guide, to bring to the right place — implying active accompaniment, not remote direction. Nachah is used for God leading Israel through the wilderness (Ex 13:17) and for the Spirit''s guidance (Ps 143:10). It is the guidance of a shepherd, not a signpost.","refs":["Exodus 13:17","Psalm 143:10"]},"truth":{"original":"אֱמֶת","transliteration":"emet","definition":"Faithfulness, reliability, steadfastness — not abstract truth but the quality of something that can be trusted completely. God''s emet is His character of doing what He says. The path led in emet is a path walked with a guide who has never once misled.","refs":["Psalm 86:11","John 14:6"]}}'
  )
) AS v(day_number, ws)
WHERE p.slug = 'light-for-the-path'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Part 2h — Light for the Path: dig deeper commentary +
-- further-study refs for days 1, 7, and 14.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

UPDATE reading_plan_entries e
SET
  deep_dive_text = v.text,
  deep_dive_refs = v.refs
FROM reading_plans p,
(VALUES
  (1,
   'The lamp described in Psalm 119:105 is almost certainly a small clay oil lamp — the kind common across the ancient Near East, small enough to cup in one hand, with a short wick floating in olive oil. Such a lamp illuminated roughly a foot of ground ahead of the walker. Not a yard. A foot. This is not an accident of ancient technology — it is the precise metaphor the psalmist intends. You see enough to take the next step. You do not see the bend in the road fifty yards ahead. This is frustrating to people who want comprehensive guidance before they commit — who need to see the whole plan before they will move. The lamp metaphor is God''s answer to that desire: I will not give you the whole plan. I will give you light for the step you are on. There is a second implication worth sitting with. A lamp held still illuminates a small circle. A lamp carried forward continuously reveals new ground. The guidance of the word is not a deposit made once and drawn on forever. It is received in the act of walking — each step forward bringing the lamp''s light to new territory. The person who waits for complete clarity before moving never receives the next revelation. The guidance comes to the one who is already walking.',
   '["Psalm 119:129-136", "2 Peter 1:19-21"]'
  ),
  (7,
   'Psalm 25 is an acrostic — 22 verses, each beginning with the next letter of the Hebrew alphabet. This makes it a complete prayer, a comprehensive petition: guidance requested in every letter, for every season, covering the full scope of human need for direction. The acrostic form was not decorative in ancient Hebrew poetry; it signified totality — guidance from A to Z, for everything and not just the obvious crossroads. The Hebrew derek (path/way) appears four times in this section of the psalm — reflecting how central the idea of life-direction was to the psalmist''s understanding of what it means to live before God. But the most theologically loaded verse is 10: "All the paths of the LORD are mercy and truth." The Hebrew word for paths here is orach — a track, a well-worn route. The paths that God walks with His people — every single one (kol, "all") — are characterized by hesed (covenant love) and emet (faithfulness). This is not a promise that every path feels like mercy. It is a declaration that love and faithfulness are the actual substance of every road God leads His people down — the rough ones and the smooth ones alike. The condition attached ("unto such as keep his covenant") is not a merit clause; it is a description of the people whose eyes are turned toward God and who are therefore able to perceive His mercy and truth in the path they are already on.',
   '["Psalm 143:8-10", "Isaiah 42:16"]'
  ),
  (14,
   'The final verse of Psalm 48 contains one of the most discussed translation challenges in the Psalter. The phrase rendered "even unto death" is the Hebrew al-muth (or almut), which appears only twice in the entire Hebrew Bible, and its meaning is genuinely disputed. The Septuagint (the Greek Old Testament) translates it "unto the ages" — forever. Some scholars read it as "until death" — guidance that accompanies us to the very edge of the boundary no human crosses twice. Others, including several early church fathers, read it as "beyond death" — the guide who crosses even that threshold with us. All three readings are held in the phrase, and all three are theologically consistent with the God presented throughout Psalm 48: the One who routed the kings (v.4-7), who established Zion forever (v.8), whose right hand is full of righteousness (v.10). What every reading shares is the same essential claim: this guide does not stop. Every other guide in a human life eventually reaches the edge of their capacity — the mentor, the counselor, the parent, the closest friend. They can accompany us only so far. The God of Psalm 48 accompanies the worshipper without a terminal point. Whatever is ahead — in the coming year, in the final chapter, in the moment everyone eventually faces — this Guide has already been there. He is not waiting at the edge. He goes past it.',
   '["Isaiah 58:11", "John 14:1-6"]'
  )
) AS v(day_number, text, refs)
WHERE p.slug = 'light-for-the-path'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Rooted in Love (30 days) — Part 1b Enrichment
-- ============================================================

-- Rooted in Love (30 days)
UPDATE reading_plan_entries e
SET
  prayer          = v.prayer,
  application     = v.application,
  question        = v.question,
  context_note    = v.context_note,
  content_type    = 'verse',
  is_memory_verse = v.is_memory_verse
FROM reading_plans p,
(VALUES
  (1,
   'Lord, I have read John 3:16 a hundred times. Today let me read it as if for the first time. Let the word "world" include me. Let the word "gave" cost something. Open my heart to the full weight of what You did.',
   'Write down three words from John 3:14-17 that carry the most weight for you today. Sit with each one for a moment before moving on.',
   'When you hear "God so loved the world," do you instinctively place yourself in the "world"? What would change in your daily life if you did?',
   'John 3:14-17 is Jesus'' response to Nicodemus, a Pharisee who came by night. Jesus opens with a typological reference to Numbers 21:9 — the bronze serpent Moses lifted in the desert — as a figure for His own crucifixion. The phrase "God so loved the world" is not a standalone declaration; it is embedded in a statement about the cross as the mechanism of love''s expression. Memory verse day.',
   true
  ),
  (2,
   'Father, Your definition of Yourself — "God is love" — is not a mood or a quality but Your very nature. Teach me what it means to truly know You, and let that knowledge change how I love the people around me today.',
   'Identify one person today whom you find difficult to love. Pray for them specifically before you interact with them. Notice what changes, if anything.',
   'John says "he that loveth not knoweth not God." Does your love for others reveal how well you know God — or how poorly?',
   '1 John 4:7-12 is part of the apostle John''s second extended teaching on love in this letter. John''s central argument is that love for God and love for neighbor are not two separate subjects — they are the same subject approached from two directions. Anyone who claims to know God but does not love others has misunderstood both terms.',
   false
  ),
  (3,
   'God of Hosea, You drew Israel with bands of love, and You draw me the same way. I confess that like Ephraim, I often fail to perceive Your hand guiding me. Open my eyes to the cords You have placed around my life.',
   'Think back over the past year. Where do you see a cord — a moment, a person, a providential turn — by which God was drawing you closer? Write it down.',
   'Hosea says Israel "knew not" that God was healing them. Are there areas of your life right now where God may be at work without your awareness?',
   'Hosea 11 is one of the most surprising passages in the prophetic literature. The book is largely a record of Israel''s unfaithfulness and God''s coming judgment — but in chapter 11 the voice shifts to a parent remembering a child. The image of drawing with "cords of a man" (v.4) uses the Hebrew chevel — rope, cord — to describe not constraint but the persuasive pull of relational love.',
   false
  ),
  (4,
   'Lord, as I read the anatomy of love today, show me where I am missing. Do not let me read this as a description of You alone — read it over me as a mirror. Where I am impatient, where I am proud, where I seek my own — meet me there.',
   'Read 1 Corinthians 13:4-8 slowly, replacing the word "Charity" with your own name. Notice which phrases ring true and which convict you. That is your prayer for this week.',
   'Love "beareth all things, believeth all things, hopeth all things, endureth all things." Which of these four is hardest for you? What would it look like to grow in that one?',
   'The Greek word translated "Charity" throughout 1 Corinthians 13 in the KJV is agapē — the same word used in John 3:16. The KJV translators chose "charity" (from the Latin caritas) partly to distinguish it from the emotional overtones of "love" in early modern English. Paul writes this chapter in a letter addressing divisions in the Corinthian church — it is a corrective aimed at specific prideful behaviors he had documented in chapters 1-12.',
   false
  ),
  (5,
   'Lord Jesus, the teacher of the law asked You a question to test You. You answered with two commandments that upended everything. Help me to love You today with all that I am — not just with the parts that already want to.',
   'The two great commandments require wholeness — all your heart, soul, and mind for God; love of neighbor as yourself. Where is your love divided today? Offer that divided place to God.',
   'Jesus says all the law "hangs" on these two commandments. How does understanding love as the foundation of the law change how you read the commands of Scripture?',
   'The question in Matthew 22:35 is phrased as a trap. The lawyer expected Jesus to elevate one law school''s preferred hierarchy and alienate others. Instead, Jesus quotes Deuteronomy 6:5 (the Shema) and Leviticus 19:18 together — a combination no other rabbi had made as a unified response. The word "hang" (kremata) implies that removing love as the foundation would cause the entire legal structure to collapse.',
   false
  ),
  (6,
   'Father, Paul prays that I would be "rooted and grounded" in Your love. I confess my roots are often shallow — I know about Your love more than I have planted myself in it. Today, let me draw deeply from what Christ has done.',
   'Paul says the love of Christ "passeth knowledge." Spend five minutes today in silence with this: God''s love for you is larger than your mind can contain. Do not explain it. Just receive it.',
   'What would change in your daily life if you were genuinely "filled with all the fulness of God"? What does that phrase mean to you?',
   'Ephesians 3:14-21 is Paul''s second great prayer in this letter. The phrase "rooted and grounded" uses two metaphors from different domains: rooted (agriculture — planted in soil) and grounded (architecture — set on a foundation). The double metaphor suggests love is not just a spiritual experience but the structural and nutritive basis of the whole life.',
   false
  ),
  (7,
   'Lord, I bring You my fears today. Where I draw back from Your people, from vulnerability, from commitment — I know that is the measure of imperfect love. Perfect Your love in me. Cast out what holds me back from You and from others.',
   'Perfect love casts out fear. Identify one fear you have about loving others — fear of rejection, of being hurt, of being taken advantage of. Pray specifically: "Lord, perfect Your love in me here."',
   'John says "he that feareth is not made perfect in love." Does fear play a role in how you love others? In what ways?',
   '1 John 4:17-21 is the conclusion of a section that began in verse 7. "Perfect love casteth out fear" is often quoted in isolation, but its context is specifically the fear of judgment — "that we may have boldness in the day of judgment" (v.17). The love being perfected is not a general emotional warmth but the covenant love that stands with confidence before God because it is grounded in what God has already done, not in what we have achieved.',
   false
  ),
  (8,
   'Jesus, You gave us a new commandment — not new in that it had never been heard, but new in the depth at which You command it: "as I have loved you." That standard changes everything. Give me the capacity to love with the kind of love that only You model.',
   'Jesus says the world will know His disciples by their love "one to another." Think of one person in your church or community with whom your love has grown cold. Take one specific step toward restoration today.',
   'Jesus says "as I have loved you" — His own love as the standard and template. What does that specifically require of how you love the people in your life right now?',
   'John 13 records the Last Supper and the washing of the disciples'' feet. In verse 31, Judas has just departed to betray Jesus. The new commandment of love is given in the shadow of betrayal — it is not issued in an idealized setting but in a room where love has just been refused by one and will be denied by another. The command to love is not an abstraction; it was given in the presence of failure.',
   false
  ),
  (9,
   'Lord, the love You command here is hard — the hardest command on this path. I do not come to it with much natural warmth. Teach me to start with the actions — to bless, to pray, to do good — and trust that the feeling may follow. I am willing. Make me able.',
   'Is there someone who has wronged you, whom you consider an enemy? Today, pray specifically for them — not for their correction, but for their genuine wellbeing. This is the practice.',
   'Jesus commands both action and attitude: "love... do good... bless... pray." Which of these four responses to enemies is hardest for you? Why?',
   'Luke 6:27-31 is part of Luke''s Sermon on the Plain. The Golden Rule in verse 31 was already known in the ancient world in its negative form — "do not do to others what you do not want done to you" — in Hillel, Confucius, and Tobit 4:15. Jesus radicalizes it to its positive, active form: do good first. The direction of love is always outward and always initiating.',
   false
  ),
  (10,
   'God, You placed a love like this in the human heart as a whisper of Your own love for us. Remind me today that every deep human love is a shadow of Yours — the love that many waters cannot quench.',
   'Think of a love in your life that has endured hardship — a friendship, a marriage, a family bond that has weathered difficulty. Give thanks for it specifically. Then consider: how does God''s enduring love for you make that human love possible?',
   '"Many waters cannot quench love." When have you experienced a love that persisted through something that should have ended it? What did that teach you?',
   'Song of Solomon 8:6-7 is widely regarded as the theological summit of the book. The passage uses death and sheol as the measure of love''s intensity — love is not weaker than death, it is equally fierce. The Hebrew word translated "cruel" when applied to jealousy (qasheh) means not malicious but unyielding — the same word used of Pharaoh''s hard heart, the most stubborn thing the OT knows. Love''s jealousy is equally resolute.',
   false
  ),
  (11,
   'Lord, the thought that You sing over me stops me. I do not feel worthy of Your singing. Let that unworthiness not be the last word — let Your joy over me be louder than my sense of inadequacy. I receive Your delight. I do not understand it, but I receive it.',
   'Read Zephaniah 3:17 again, replacing "thee" and "Jerusalem" with your own name. Sit with the discomfort and the wonder of it. This is your memory verse — carry it through the day.',
   '"He will joy over thee with singing." What resistance do you feel when you try to believe that God is genuinely delighted in you — not merely tolerating you? Where does that resistance come from?',
   'Zephaniah 3:14-17 closes one of the most severe books in the prophetic canon. Chapters 1-2 contain some of the harshest language of judgment in all of Scripture. The declaration of joy in 3:17 is the resolution of the whole book''s tension: the God who judged is the same God who sings. The Hebrew word sus (translated "joy" in "he will joy over thee") implies whirling, spinning — a physically expressed exultation. Memory verse day.',
   true
  ),
  (12,
   'Lord, You have removed my sins as far as east is from west — a direction that never converges, that has no meeting point. Thank You that there is no compass that can find what You have removed. Help me to live in that freedom today.',
   'Is there a past sin or failure that you still carry internally despite having confessed it? Write it on a piece of paper. Then write Psalm 103:12 over it. Dispose of the paper. The sin is gone. The verse remains.',
   '"As far as the east is from the west, so far hath he removed our transgressions." Why does this direction matter? What would be different if the psalm had said "north from south"?',
   'Psalm 103 is a solo psalm of blessing in which the psalmist calls his own soul to bless the LORD. The phrase "as far as the east is from the west" (v.12) uses a directionality that, unlike north and south, has no defined poles. You can travel east indefinitely and never reach the point where east becomes west. North and south have poles — finite endpoints. East and west do not. The removal of sin is described in infinite terms, not just large ones.',
   false
  ),
  (13,
   'Father, I was not seeking You when Christ died for me. I was in opposition to You. That is the weight of this passage — You did not wait for me to become worthy. You acted first. Let that kindness undo any remaining pride in my spiritual life.',
   'Romans 5:8 says God "commendeth" — proved, demonstrated, displayed — His love in the cross. It is an act, not an announcement. How are you demonstrating, not just announcing, your love to those around you today?',
   '"When we were yet without strength, in due time Christ died." Where in your life right now are you "without strength"? Can you receive help there the way a helpless person receives it — without earning it first?',
   'Romans 5:6-11 develops Paul''s argument that the righteousness of God is not earned but received. The sequence in verses 6-10 moves through four stages of human unworthiness: "without strength" (v.6), "ungodly" (v.6), "sinners" (v.8), "enemies" (v.10). Each stage is more morally compromised than the last. The love of God breaks through at every stage — not just the mildest, but especially the worst.',
   false
  ),
  (14,
   'Lord, You have called me to freedom — and then asked me to spend that freedom serving others. Show me today that serving others from love is the fullest expression of freedom, not the loss of it.',
   'Think of one practical way you can serve someone today — not out of obligation, but as an expression of deliberate love. Do it, and notice what freedom feels like from the inside.',
   'Paul warns against using liberty "for an occasion to the flesh." What is the difference between freedom lived in love and freedom lived for self-indulgence?',
   'Galatians 5:13-16 comes after Paul''s extended argument against returning to the law as a means of earning God''s favor. The freedom he defends is freedom from the law as a merit system. But he immediately redirects it: that freedom is not self-directed but love-directed. The word translated "serve" (douleuete) is the verb form of doulos — bond-servant. The free person voluntarily becomes a servant, which is the paradox at the heart of the gospel.',
   false
  ),
  (15,
   'Father, Paul says love is the bond of perfectness — the ligament holding all the virtues together. I know the list: compassion, kindness, humility, meekness, patience. Some I wear better than others. Without love holding them together they become disconnected pieces. Integrate my character through love today.',
   'Re-read Colossians 3:12-13. Which virtue do you wear most naturally? Which is most often missing? Ask God to develop the missing one — specifically through love.',
   'If love is the "bond" that holds the other virtues together, what happens to patience without love? What happens to forgiveness without love? Pick one virtue and think through what it becomes when love is absent.',
   'The Greek word for "bond" in verse 14 is syndesmos — literally a binding-together, used in medical literature for a ligament. Colossians 3:12-14 uses the image of clothing (endysasthe, "clothe yourselves," v.12), suggesting that the virtues are not natural traits but garments deliberately worn each day. Love is the final piece that completes the outfit and makes all the other garments cohere as a whole.',
   false
  ),
  (16,
   'God, friendship is a gift I often take for granted. Let me recognize the friends You have placed in my life as expressions of Your love. And let me be the kind of friend who loves at all times — not just when it is convenient.',
   'Think of a friend who has been present for you in a hard season. Have you told them what their faithfulness meant? Do that today — a message, a call, a note.',
   'Proverbs 17:17 says a brother is "born" for adversity — as if hardship is the very purpose for which close relationships exist. Do you have a friend in this sense? Are you that friend for someone?',
   'Proverbs 17:17 stands in a cluster of sayings about relationships (vv.14-18). The word "loveth" is the Hebrew ahab — the primary word for deep affection and attachment, the same word used of God''s love for Israel in Hosea 11:1. The contrast between "friend" (who loves at all times) and "brother" (who is born for adversity) does not pit them against each other — it layers them: the true friend is most recognizable precisely in hard times.',
   false
  ),
  (17,
   'Jesus, You said "continue ye in my love." I know how easily I drift — how quickly the morning''s warmth fades in the afternoon''s demands. Teach me what it means to abide — to stay, to remain, to not drift. I want to be the kind of branch that does not drop from the vine.',
   'John 15:11 says Jesus spoke these things "that my joy might remain in you, and that your joy might be full." Abiding in love produces fullness of joy — not just peace but overflow. Where is your joy depleted today? Return to the vine.',
   'Jesus calls His disciples friends because "I have made known unto you all things that I have heard of my Father." What does it mean that Jesus has made you His friend by bringing you into God''s confidence?',
   'John 15:9-17 is part of the Farewell Discourse, spoken the night of Jesus'' arrest. The metaphor of vine and branches (beginning at v.1) provides the framework: love is not just an emotion or a command but the life-substance flowing through vine and branches. "Abide in my love" (v.9) uses the Greek menō — to remain, to dwell, to stay in a place — the same word used in John 1:38 when the disciples asked where Jesus was dwelling.',
   false
  ),
  (18,
   'Lord, Peter says love covers a multitude of sins. That covering — not ignoring, not excusing, but absorbing — is what You have done for me. Teach me to do the same for others. Make me a person whose love creates space for others to fail and recover.',
   '"Use hospitality one to another without grudging." Is there someone to whom you owe welcome — space, presence, being seen — but from whom you have withdrawn? Make a concrete move toward them today.',
   'Peter describes love as "fervent" — from the Greek ektenes, stretched to the limit. What would it look like for your love for others to operate at that intensity in the ordinary moments of this week?',
   '1 Peter 4:7-11 opens with "the end of all things is at hand" — written to churches likely under Nero''s persecution. The exhortations that follow are crisis theology: when everything is under threat, the response is prayer, love, hospitality, and service. Love that "covers a multitude of sins" (v.8 — quoting Proverbs 10:12) does not mean ignoring sin but extending patient, absorbing grace that enables restoration rather than fracture.',
   false
  ),
  (19,
   'Lord God, You said "I have called thee by thy name; thou art mine." I belong to You — not by achievement, not by performance, but by Your word and Your act of redemption. Let that belonging be my security today when everything else feels uncertain.',
   'Isaiah 43:2 promises presence through waters, rivers, fire, and flame — not absence of the trial but accompaniment through it. What fire or flood are you walking through right now? Name it. Then name the promise: "thou shalt not be burned."',
   'God says "thou wast precious in my sight." Do you believe that? What would change if you lived from the conviction that you are genuinely precious to God — not just forgiven, but valued?',
   'Isaiah 43 opens the Book of Consolation (chapters 40-66). The words "But now" in v.1 are the pivotal transition — despite everything that has preceded (judgment, exile, failure), a new word is being spoken. "I have called thee by thy name" echoes the intimate knowledge of a shepherd who names each sheep — in the ancient Near East, to know a person''s name was to know the person. God''s love here is particular, named, and specific.',
   false
  ),
  (20,
   'Lord, Micah''s question is my question: what does my love look like in practice? Not in feeling, not in intention — in action. Show me today where I can do justice, where I can choose mercy, and help me walk with You in the small decisions, not just the large ones.',
   'Micah 6:8 has three commands: do justly, love mercy, walk humbly. For each one, name one specific action in your life this week — not abstract commitments but concrete choices. Write them down.',
   '"Love mercy" — not just show mercy but love it. What is the difference between someone who shows mercy reluctantly and someone who genuinely loves it? Which describes you today?',
   'Micah 6:6-8 is structured as a dialogue: verses 6-7 are the questions of a worshipper offering increasingly extravagant sacrifices. God''s response in v.8 redirects everything: you have already been shown what is good — the word "shewed" (nagad) means it has already been declared and is not a new revelation. The love God requires is not ceremonial performance but relational fidelity: justice toward others, mercy as a disposition, humility as the posture of walking.',
   false
  ),
  (21,
   'Lord Jesus, You did not just say the words of love — You laid down Your life. That is the measure. I confess that my love often stops at words. Give me the courage and the wisdom to love in the concrete ways that are available to me today.',
   '1 John 3:17 asks: "whoso hath this world''s good... and shutteth up his bowels of compassion from him, how dwelleth the love of God in him?" Look at your week. Has love stopped at word or talk? What one action would move it into deed?',
   'John says "let us not love in word, neither in tongue; but in deed and in truth." Why do you think it is easier to love in word than in deed? What makes the gap between intention and action so common?',
   '1 John 3:16-18 is the New Testament''s clearest definition of love as action rather than emotion. The word for "perceive" in v.16 (egnōkamen, perfect tense) means "we have come to know and continue to know" — the knowledge of love is not theoretical but experiential, settled in by a completed past act whose effects continue into the present. "Bowels of compassion" (v.17, splanchna) is the Greek word for intestines — the ancient seat of deep emotion. Compassion that is "shut up" (kleiō, locked) is the opposite of the love the passage commands. Memory verse day.',
   true
  ),
  (22,
   'Lord, You have sworn by Your own name that Your kindness will not depart. I hold You to that today — not presumptuously, but because You placed the oath in Scripture precisely so I could hold You to it in hard moments. Let that everlasting kindness be my foundation.',
   'Isaiah 54:10 says the covenant of peace will not be removed. The word "peace" (shalom) includes wholeness, completeness, flourishing — not just absence of conflict. Where in your life is shalom absent? Pray this verse over that specific place.',
   'God compares His oath of kindness to the promise He made after Noah''s flood — a promise so foundational the entire physical world still bears witness to it. How does framing God''s love as a covenant-oath change how you relate to it?',
   'Isaiah 54 is addressed to the "barren woman" — a figure for Israel in exile, without a home or a future. The comparison to Noah''s flood (v.9) is carefully chosen: the most catastrophic divine judgment in human memory. God says: just as I swore after that never again, so I swear now. The kindness (chesed — covenant loyalty) and the covenant of peace are sworn on God''s own character, not conditioned on Israel''s behavior.',
   false
  ),
  (23,
   'Lord, I cannot love my enemies in my own strength. The command exceeds what I am naturally capable of. But You make Your sun rise on the evil and the good without asking their permission. Give me even a fraction of that unconditionality today.',
   'Jesus commands us to "pray for them which despitefully use you." There is no smaller starting point. Pick someone who has wronged you and pray one specific prayer for their genuine good — not for their change, but for their blessing.',
   'Jesus sets the standard in v.48: "Be ye therefore perfect, even as your Father which is in heaven is perfect." What is the connection between loving enemies and being like the Father? What does this tell you about God''s character?',
   'Matthew 5:43-48 closes the antitheses ("You have heard that it was said... But I say to you") that structure the Sermon on the Mount. The command to love enemies intensifies the OT command rather than replacing it. The phrase "be perfect as your Father is perfect" uses the Greek teleios — complete, having reached the intended end. It is not a moral-achievement bar but a description of the wholeness that comes from total allegiance.',
   false
  ),
  (24,
   'Lord, I pray with the psalmist today: unite my heart to fear Your name. I know how easily my heart divides — pursuing God in one part and self in another. Let Your love be the unifying principle, the thing that makes me singular and whole before You today.',
   'Psalm 86:11 is the prayer of an undivided heart. Where are you divided — pursuing God and something else simultaneously? Name it. Offer that division to God. Ask specifically for integration.',
   'The psalmist says "great is thy mercy toward me," citing personal experience. What specific mercy from God in your own story can you point to today? Name it aloud.',
   'Psalm 86 is one of only two psalms in Book III attributed to David. The prayer for a "united heart" (leb yachid — a singular, integrated heart) reflects the ancient Hebrew understanding that the heart is not the emotional center but the seat of will and decision. A divided heart chooses between competing loyalties. God''s love, received and trusted, makes the heart one.',
   false
  ),
  (25,
   'Father, I confess that I have sometimes thought of prayer as reaching You through Jesus because You are distant. Today let this verse correct me: the Father Himself loveth me. Not through intermediary affection — directly. Let that love be something I walk in, not just acknowledge.',
   'John 16:27 says the Father loves you "because ye have loved me, and have believed that I came out from God." Today, practice resting in the Father''s direct love for you — not striving for it, just receiving it.',
   'Jesus says the Father loves His disciples directly and personally. How does this affect how you approach prayer? Does knowing the Father loves you change the tone of your conversations with Him?',
   'John 16:25-27 is part of the final Farewell Discourse, hours before Gethsemane. The statement "the Father himself loveth you" uses the Greek phileō (tenderness, personal affection) rather than agapaō — one of only two places in John''s Gospel where phileō describes the Father''s love for believers. It signals intimacy: the love shared between close friends, not just sovereign benefactors.',
   false
  ),
  (26,
   'Lord, direct my heart today. I cannot always find my way back to love on my own — I get distracted, I get hurt, I get self-focused. Be my compass. Lead me back to Your love when I drift, and forward into patient waiting when I grow impatient.',
   'Paul prays for heart direction, not just doctrinal correction. Pray this verse over yourself today: "May the Lord direct my heart into the love of God and into the patient waiting for Christ." Then sit in silence and let the prayer take hold.',
   'Paul links love for God with "patient waiting for Christ." What is the connection between these two? How does love make waiting easier — or harder?',
   '2 Thessalonians 3:4-5 closes Paul''s section of practical instructions. The Thessalonian church had struggled with impatience around the return of Christ — some had stopped working because they believed the end was imminent (see 3:6-12). Paul''s prayer is pastoral: redirect your hearts from anxious expectation to grounded love, and from impatience to steadfast waiting. Love of God and the endurance of Christ are the twin anchors he identifies for a church under eschatological pressure.',
   false
  ),
  (27,
   'Lord of mercies, I come this morning knowing Your mercies are indeed new. Whatever I brought to last night''s sleep — failure, guilt, anxiety, grief — it has not exhausted Your supply. Thank You that Your compassions do not fail. I receive what is new today.',
   'Lamentations 3:22-23 was written in the ruins of Jerusalem''s destruction. The author had no material evidence that God''s mercies were new — only the declaration of faith. Is there an area of your life where you must declare God''s faithfulness before the evidence appears? Speak that declaration aloud today.',
   '"Great is thy faithfulness" — the author says this in the aftermath of catastrophe, not in comfort. When has God''s faithfulness been most real to you in a hard season? What did it cost to affirm it then?',
   'Lamentations is a book of five acrostic poems written in the wake of Jerusalem''s fall to Babylon in 586 BC. Lamentations 3 is the central poem and most personal — the voice shifts from communal lament to individual "I." The statement "It is of the LORD''s mercies that we are not consumed" is breathtaking in context: the author is sitting in the rubble of a destroyed city. The Hebrew chesed (translated "mercies") is the same covenant-love word used throughout the Psalms — a theological lifeline thrown into the worst scene in the OT.',
   false
  ),
  (28,
   'Lord, You chose me not because of what I bring but because of who You are. The logic of Your love runs backwards from everything I expect: smallest to most valued, weakness to strength, nothing to covenant. Let that logic undo my performance-based relationship with You today.',
   'Deuteronomy 7:7-8 says God chose the smallest nation. Where do you feel small, insufficient, or overlooked? That is precisely the territory in which God has historically chosen to work. Offer your insufficiency to Him.',
   'God''s love for Israel was not based on their size, strength, or righteousness. What does it do to your understanding of grace to know that divine love is not proportional to human merit?',
   'Deuteronomy 7:7-9 is part of Moses'' final address before Israel enters Canaan. The theological argument matters: Israel has no basis for pride — they were the fewest of all people (v.7). God''s love (ahab) and His kept oath (sheba) are the sole reasons for their election — both entirely located in God''s character. The phrase "to a thousand generations" (v.9) is an OT idiom for permanence beyond calculation, not a finite count.',
   false
  ),
  (29,
   'Lord, the simplest and hardest command — let all that I do be done in love. Not just the visible acts of service. Not just the spiritual exercises. The small decisions, the small interactions, the small moments. Let love be the atmosphere, not the occasional act.',
   '"Let all your things be done with charity." Pick three ordinary things you will do today — cooking, commuting, working, messaging. What would each look like if love were the motive? Choose one and do it consciously in love.',
   'Paul does not say "let the important things be done in love." He says all things. What parts of your daily life have you implicitly exempted from the love command? What is one way to bring love into that area?',
   '1 Corinthians 16:13-14 is Paul''s final direct exhortation before his personal greetings. The four commands in verse 13 (watch, stand fast, quit you like men, be strong) are military in tone. Verse 14 ("Let all your things be done with charity") recontextualizes the military language: the strength Paul calls for is not martial aggression but love-informed courage. Paul ends his longest letter with love as the orienting principle of everything that precedes it.',
   false
  ),
  (30,
   'Lord, I have spent thirty days in Your love. Thank You. I end where Paul ends — persuaded. Persuaded that death cannot reach it, life cannot dilute it, powers cannot overpower it, time cannot erode it. Let that persuasion be the thing I carry from this plan into everything that follows.',
   'Romans 8:37 says we are "more than conquerors" — not despite the things Paul listed (tribulation, distress, persecution, famine, peril, sword) but in the middle of them. The conqueror does not bypass the hard thing; the conqueror goes through it differently. What are you going through right now? Name it. Then receive the title: more than conqueror.',
   'Paul says he is "persuaded" — the language of conviction arrived at through evidence and experience. What evidence from your own life persuades you that nothing can separate you from the love of God?',
   'Romans 8:37-39 is the climax of the longest sustained theological argument in Paul''s letters. The Greek hypernikōmen ("more than conquerors") appears only here in the entire New Testament — the prefix huper pushes victory past its ordinary register. Paul grounds this entirely in the love: "through him that loved us" — the aorist participle, the same form used throughout this plan. The book that began with "the gospel of God" (1:1) ends with "the love of God" (8:39). The two are the same.',
   false
  )
) AS v(day_number, prayer, application, question, context_note, is_memory_verse)
WHERE p.slug = 'rooted-in-love'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Rooted in Love (30 days) — Part 1c: passages, day titles,
-- reflections, passage_refs. Overwrites placeholder verse_refs.
-- ============================================================

UPDATE reading_plan_entries e
SET
  verse_ref    = v.verse_ref,
  day_title    = v.day_title,
  passage_text = v.passage_text,
  passage_refs = v.passage_refs,
  reflection   = v.reflection,
  content_type = 'passage'
FROM reading_plans p,
(VALUES
  (1,
   'John 3:14-17',
   'The Source',
   'And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up: That whosoever believeth in him should not perish, but have eternal life. For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. For God sent not his Son into the world to condemn the world; but that the world through him might be saved.',
   '["1 John 4:9-10", "Romans 5:8"]',
   'The most quoted verse in Scripture does not stand alone — it is anchored to the cross by the verse immediately before it. Jesus draws a direct line from Moses lifting the bronze serpent in the wilderness (Numbers 21:9) to the Son of Man being lifted up — crucifixion as the mechanism of love. The word "so" in "God so loved" does not mean "so much"; in Greek (houtōs) it means "in this manner" — love expressed not as a feeling but as a specific historical act. The gift of the only begotten Son is a phrase pointing not to method of origin but to uniqueness — monogenēs means "one of a kind." John 3:17 then completes the logic: the entire mission was rescue, not condemnation — love moving toward the world, not away from it.'
  ),
  (2,
   '1 John 4:7-12',
   'God Is Love',
   'Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth God. He that loveth not knoweth not God; for God is love. In this was manifested the love of God toward us, because that God sent his only begotten Son into the world, that we might live through him. Herein is love, not that we loved God, but that he loved us, and sent his Son to be the propitiation for our sins. Beloved, if God so loved us, we ought also to love one another. No man hath seen God at any time. If we love one another, God dwelleth in us, and his love is perfected in us.',
   '["John 4:24", "1 John 3:17"]',
   'John does not say God is loving — a description that could apply in some moments and not others. He says God is love — love is His nature, not a mood. The passage builds a remarkable syllogism: love is of God; God sent His Son in love; therefore the love we show one another is the same substance made visible. Verse 10 inverts the expected direction: herein is love — not that we initiated it but that He did. The propitiation (the atoning act) was performed while we were not yet seeking. The section closes with an extraordinary claim: when believers love one another, the invisible God becomes perceptible in the world — His love perfected, brought to its intended completion, in the community.'
  ),
  (3,
   'Hosea 11:1-4',
   'Cords of Love',
   'When Israel was a child, then I loved him, and called my son out of Egypt. As they called them, so they went from them: they sacrificed unto Baalim, and burned incense to graven images. I taught Ephraim also to go, taking them by their arms; but they knew not that I healed them. I drew them with cords of a man, with bands of love: and I was to them as they that take off the yoke on their jaws, and I laid meat unto them.',
   '["Isaiah 49:15-16", "Romans 8:38-39"]',
   'Hosea 11 is one of the most unexpected passages in the prophetic literature — a book largely structured around judgment suddenly shifts into the voice of a parent remembering a beloved child. The love declared in verse 1 is retrospective and unconditional: God loved Israel when Israel was a child, before Israel had done anything to merit or forfeit that love. The tragedy of verse 2 follows immediately: the more God called, the further they went. Yet verse 4 reveals that even amid the departure, God was drawing — using the Hebrew chevel (cords, bands) not of compulsion but of persuasion, of relational love. He was healing them while they did not know it. This is one of Scripture''s most tender portraits of divine love: persistent, parental, working beneath the surface of Israel''s awareness.'
  ),
  (4,
   '1 Corinthians 13:4-8',
   'The Anatomy of Love',
   'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up, Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil; Rejoiceth not in iniquity, but rejoiceth in the truth; Beareth all things, believeth all things, hopeth all things, endureth all things. Charity never faileth: but whether there be prophecies, they shall fail; whether there be tongues, they shall cease; whether there be knowledge, it shall vanish away.',
   '["Romans 13:10", "1 John 4:7-8"]',
   'Paul does not define love abstractly — he defines it by what it does and what it does not do. The passage gives fifteen descriptions, and notably, none of them describe a feeling. Every one describes a choice or a habit: suffers long, is kind, bears, believes, hopes, endures. Paul wrote this chapter to a church riven by pride and spiritual one-upmanship — the love he describes is the precise antidote to every specific failure he had documented in chapters 1-12. The Greek word translated "Charity" is agapē — the same word in John 3:16. The KJV translators chose "charity" (from the Latin caritas) to emphasize the selfless, outward-directed quality of the love Paul means. The climactic claim — "Charity never faileth" — uses a Greek word (piptō) meaning to collapse, to fall, to be brought down. Love is the one thing that will not be brought down.'
  ),
  (5,
   'Matthew 22:35-40',
   'The Weight of Love',
   'Then one of them, which was a lawyer, asked him a question, tempting him, and saying, Master, which is the great commandment in the law? Jesus said unto him, Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind. This is the first and great commandment. And the second is like unto it, Thou shalt love thy neighbour as thyself. On these two commandments hang all the law and the prophets.',
   '["Deuteronomy 6:4-5", "Leviticus 19:18"]',
   'The lawyer''s question was designed as a trap — whichever command Jesus elevated would alienate the school that preferred another. Jesus sidesteps the debate by pairing two commands no rabbi had combined before: Deuteronomy 6:5 (the Shema, the central Jewish confession) and Leviticus 19:18 (love of neighbor). By joining them, He declares them inseparable — the vertical and horizontal axes of the same love. The phrase "hang all the law and the prophets" uses the Greek kremata, to hang suspended from a point: remove love and the entire legal structure falls. Love is not one command among many; it is the load-bearing principle from which every other obligation is suspended. To know God and to love neighbor are not two disciplines — they are the same discipline approached from two directions.'
  ),
  (6,
   'Ephesians 3:14-21',
   'Rooted and Grounded',
   'For this cause I bow my knees unto the Father of our Lord Jesus Christ, Of whom the whole family in heaven and earth is named, That he would grant you, according to the riches of his glory, to be strengthened with might by his Spirit in the inner man; That Christ may dwell in your hearts by faith; that ye, being rooted and grounded in love, May be able to comprehend with all saints what is the breadth, and length, and depth, and height; And to know the love of Christ, which passeth knowledge, that ye might be filled with all the fulness of God. Now unto him that is able to do exceeding abundantly above all that we ask or think, according to the power that worketh in us, Unto him be glory in the church by Christ Jesus throughout all ages, world without end. Amen.',
   '["Colossians 2:6-7", "Romans 11:33-36"]',
   'Paul''s prayer in verses 14-19 is one of the most concentrated theological petitions in the New Testament, and its center is love. The phrase "rooted and grounded in love" combines two metaphors from entirely different domains — agriculture (rooted, drawing nourishment from soil) and architecture (grounded, set on a foundation) — to say that love is not one feature of the Christian life but its formative substance. The four dimensions Paul names (breadth, length, depth, height) intentionally exceed any geometry — love has no bounded shape. The paradox that closes the prayer is unmistakable: he prays that believers would "know the love of Christ, which passeth knowledge" — to experientially encounter what the mind alone cannot contain. The doxology that follows is the overflow of that encounter: a God who acts "exceeding abundantly above" what we ask or imagine.'
  ),
  (7,
   '1 John 4:17-21',
   'Perfect Love',
   'Herein is our love made perfect, that we may have boldness in the day of judgment: because as he is, so are we in this world. There is no fear in love; but perfect love casteth out fear: because fear hath torment. He that feareth is not made perfect in love. We love him, because he first loved us. If a man say, I love God, and hateth his brother, he is a liar: for he that loveth not his brother whom he hath seen, how can he love God whom he hath not seen? And this commandment have we from him, That he who loveth God love his brother also.',
   '["Romans 8:15-16", "2 Timothy 1:7"]',
   'The "perfect love" of verse 18 is often read as an emotional achievement — perfect feelings casting out fearful feelings. But John''s context is the day of judgment (v.17): the love he means is the covenant love that enables boldness before God, not because we have become fearless people but because the basis of our standing is what God has done, not what we have achieved. Fear in this passage is specifically the terror of condemnation — the torment of a person who does not know whether they are accepted. Perfect love — love that has been brought to its completion in the believer — removes that torment not by suppressing the emotion but by changing the ground beneath it. The closing verses make explicit what runs through the whole chapter: love of God and love of neighbor are the same love, and claiming one while refusing the other is self-deception.'
  ),
  (8,
   'John 13:31-35',
   'A New Commandment',
   'Therefore, when he was gone out, Jesus said, Now is the Son of man glorified, and God is glorified in him. If God be glorified in him, God shall also glorify him in himself, and shall straightway glorify him. Little children, yet a little while I am with you. Ye shall seek me: and as I said unto the Jews, Whither I go, ye cannot come; so now I say to you. A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another. By this shall all men know that ye are my disciples, if ye have love one to another.',
   '["John 17:20-23", "1 John 3:14"]',
   'The new commandment is given at the precise moment Judas has left the room to betray Jesus — love is commanded in the presence of its refusal. The commandment is new not because love was unknown before but because the standard is new: "as I have loved you." The OT commanded love of neighbor as oneself; Jesus commands love modeled on His own example, which would include washing feet and laying down life. The phrase "by this shall all men know" makes the disciples'' love for one another the primary apologetic — not their doctrine, not their miracles, but the observable quality of their mutual love. The world reads the reality of Christ not primarily in arguments but in the community He forms.'
  ),
  (9,
   'Luke 6:27-31',
   'The Hardest Command',
   'But I say unto you which hear, Love your enemies, do good to them which hate you, Bless them that curse you, and pray for them which despitefully use you. And unto him that smiteth thee on the one cheek offer also the other; and him that taketh away thy cloke forbid not to take thy coat also. Give to every man that asketh of thee; and of him that taketh away thy goods ask them not again. And as ye would that men should do to you, do ye also to them likewise.',
   '["Romans 12:19-21", "Matthew 5:45"]',
   'Jesus does not command a feeling — He commands four actions: love (in the sense of deliberate, chosen goodwill), do good, bless, pray. The sequence moves from the interior (choosing goodwill) outward to the most concrete (pray for them by name). The Golden Rule in verse 31 was already known in the ancient world in its negative form — "do not do to others what you do not want done to you." Jesus inverts it to the active, positive form: initiate the good you would want. The direction of love is always outward and always first. The radical nature of this teaching is not lost on the original audience — Jesus says "but I say unto you which hear," implying that not everyone is ready to receive it. Love of enemies is the graduate course.'
  ),
  (10,
   'Song of Solomon 8:6-7',
   'Love Strong as Death',
   'Set me as a seal upon thine heart, as a seal upon thine arm: for love is strong as death; jealousy is cruel as the grave: the coals thereof are coals of fire, which hath a most vehement flame. Many waters cannot quench love, neither can the floods drown it: if a man would give all the substance of his house for love, it would utterly be contemned.',
   '["Ruth 1:16-17", "Romans 8:35"]',
   'Song of Solomon 8:6-7 is the theological summit of the book and one of the most compressed definitions of love in all of Scripture. The beloved asks to be set as a seal upon the heart and arm — a seal in the ancient world was a personal mark of ownership and identity, used to authenticate. To be set as a seal is to be carried as identity, not merely as affection. The comparison of love to death is not romantic hyperbole — death is the most tenacious force in the natural order, the one thing that does not negotiate or relent. Love is equally tenacious. The "most vehement flame" uses the Hebrew shalhebetyah — a compound that some scholars read as containing the divine name, suggesting the flame of love is of divine origin. Many waters and floods represent the chaos forces in ancient Near Eastern cosmology — and they cannot quench it.'
  ),
  (11,
   'Zephaniah 3:14-17',
   'He Sings Over You',
   'Sing, O daughter of Zion; shout, O Israel; be glad and rejoice with all the heart, O daughter of Jerusalem. The LORD hath taken away thy judgments, he hath cast out thine enemy: the king of Israel, even the LORD, is in the midst of thee: thou shalt not see evil any more. In that day it shall be said to Jerusalem, Fear thou not: and to Zion, Let not thine hands be slack. The LORD thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy; he will rest in his love, he will joy over thee with singing.',
   '["Isaiah 62:4-5", "Romans 15:13"]',
   'Zephaniah 3:17 is one of the most startling verses in the prophetic canon: God is not described as enduring His people or patiently tolerating them but as being unable to contain His delight — He rejoices, He rests in love, He sings. The Hebrew word sus (translated "joy over thee") implies whirling, spinning, a physically expressive exultation — the kind of joy that cannot stay still. The phrase "he will rest in his love" (charash — to be silent, to be still) forms a remarkable contrast: alongside His singing, God also settles into a quiet that has no agitation in it, a love that has come to rest. The passage opens with commands to shout and rejoice, then reveals the reason: the king of Israel, the LORD Himself, is in the midst — not distant, not absent, but present at the center. This is the memory verse to carry through the remaining days.'
  ),
  (12,
   'Psalm 103:8-12',
   'As Far as the East',
   'The LORD is merciful and gracious, slow to anger, and plenteous in mercy. He will not always chide: neither will he keep his anger for ever. He hath not dealt with us after our sins; nor rewarded us according to our iniquities. For as the heaven is high above the earth, so great is his mercy toward them that fear him. As far as the east is from the west, so far hath he removed our transgressions from us.',
   '["Psalm 103:17-18", "Micah 7:18-19"]',
   'The psalmist begins by calling his own soul to bless the LORD — this is deliberate, chosen praise, not spontaneous emotion. The divine attributes in verse 8 echo Exodus 34:6-7, the self-declaration God made to Moses on Sinai: merciful, gracious, slow to anger, plenteous in mercy. These are not abstract qualities but God''s own stated character. The mercy of verse 11 is measured vertically — as high as heaven is above the earth — a distance that defies measurement by any ancient tool. The removal of transgressions in verse 12 is measured directionally — east from west — and the choice of direction is deliberate: north and south have poles, fixed endpoints. East and west have none. You can travel east indefinitely and never reach the point where east becomes west. The removal of sin is described in infinite terms, not merely large ones.'
  ),
  (13,
   'Romans 5:6-11',
   'While We Were Sinners',
   'For when we were yet without strength, in due time Christ died for the ungodly. For scarcely for a righteous man will one die: yet peradventure for a good man some would even dare to die. But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us. Much more then, being now justified by his blood, we shall be saved from wrath through him. For if, when we were enemies, we were reconciled to God by the death of his Son, much more, being reconciled, we shall be saved by his life. And not only so, but we also joy in God through our Lord Jesus Christ, by whom we have now received the atonement.',
   '["Ephesians 2:4-5", "Titus 3:4-7"]',
   'Paul constructs a descending scale of human unworthiness to make a single point about divine love. He begins with "without strength" — the merely helpless. Then "ungodly" — morally deficient. Then "sinners" — actively transgressing. Then finally "enemies" — in a state of active opposition to God. At each stage, the love of God is already present and acting. The word translated "commendeth" (sunistēmi) means to demonstrate, to prove by action — God did not announce His love in theory. He proved it in the specific historical act of the cross, at the specific historical moment of our worst condition. Paul then runs the logic forward: if God acted for us at our worst, how much more certain is His provision for us now that we are reconciled?'
  ),
  (14,
   'Galatians 5:13-16',
   'Freedom to Love',
   'For, brethren, ye have been called unto liberty; only use not liberty for an occasion to the flesh, but by love serve one another. For all the law is fulfilled in one word, even in this; Thou shalt love thy neighbour as thyself. But if ye bite and devour one another, take heed that ye be not consumed one of another. This I say then, Walk in the Spirit, and ye shall not fulfil the lust of the flesh.',
   '["Romans 6:18-19", "James 2:14-17"]',
   'Paul has spent four chapters defending freedom from the law as a system of earning God''s favor. He immediately redirects that freedom: it is not license — it is love. The word translated "serve" (douleuete) is the verb form of doulos, bond-servant. Paul is saying: the free person voluntarily becomes a servant — not because they are compelled but because love is now the organizing motive. This is the paradox at the center of the gospel: the most fully free person is the one who gives themselves most freely in service. Verse 14 makes the connection to the law explicit: all the law is fulfilled — not abolished but brought to its completion — in the single word of neighbor-love. Freedom without love collapses into what Paul describes with vivid imagery: biting and devouring one another until there is nothing left.'
  ),
  (15,
   'Colossians 3:12-14',
   'The Bond of Perfection',
   'Put on therefore, as the elect of God, holy and beloved, bowels of mercies, kindness, humbleness of mind, meekness, longsuffering; Forbearing one another, and forgiving one another, if any man have a quarrel against any: even as Christ forgave you, so also do ye. And above all these things put on charity, which is the bond of perfectness.',
   '["Romans 13:8-10", "Ephesians 4:15-16"]',
   'Paul uses the image of clothing — "put on" (endysasthe) — which implies that the virtues in verses 12-13 are not natural traits that emerge over time but garments deliberately chosen each morning. The list is concrete: compassion, kindness, humility, meekness, patience, forbearance, forgiveness. Each is specific, each is actionable. But verse 14 reveals that these garments do not hold together on their own. The Greek word for "bond" is syndesmos — a ligament, a binding. Love is the ligament that connects all the other virtues and allows them to function as a coherent whole. Without it, patience becomes mere stoicism, kindness becomes transaction, forgiveness becomes performance. Love is not the last item on the list but the integrating principle that brings the whole wardrobe to its intended function — the teleiotēs (perfectness, completion) that gives the other virtues their full meaning.'
  ),
  (16,
   'Proverbs 17:14-17',
   'A Friend at All Times',
   'The beginning of strife is as when one letteth out water: therefore leave off contention, before it be meddled with. He that justifieth the wicked, and he that condemneth the just, even they both are abomination to the LORD. Wherefore is there a price in the hand of a fool to get wisdom, seeing he hath no heart to it? A friend loveth at all times, and a brother is born for adversity.',
   '["Ecclesiastes 4:9-10", "John 15:13"]',
   'Proverbs 17:17 stands in a cluster of sayings about community and relationship, each illuminating what makes human bonds either destructive or enduring. The verse pairs two complementary images: the friend who loves "at all times" and the brother who is "born for adversity." These are not two different people — they are two descriptions of the same faithful presence. The word "loveth" is the Hebrew ahab — the primary word for deep affection and attachment, the same word used of God''s love for Israel in Hosea 11:1. A friend whose love is conditional on circumstances is not described here; the love defined is invariant. The surrounding proverbs about strife (v.14) and perverted justice (v.15) frame the verse: friendship is what resists the dissolution that strife and injustice bring. The faithful friend is a structural element of the community, not merely a comfort.'
  ),
  (17,
   'John 15:9-17',
   'Abide in My Love',
   'As the Father hath loved me, so have I loved you: continue ye in my love. If ye keep my commandments, ye shall abide in my love; even as I have kept my Father''s commandments, and abide in his love. These things have I spoken unto you, that my joy might remain in you, and that your joy might be full. This is my commandment, That ye love one another, as I have loved you. Greater love hath no man than this, that a man lay down his life for his friends. Ye are my friends, if ye do whatsoever I command you. Henceforth I call you not servants; for the servant knoweth not what his lord doeth: but I have called you friends; for all things that I have heard of my Father I have made known unto you. Ye have not chosen me, but I have chosen you, and ordained you, that ye should go and bring forth fruit, and that your fruit should remain: that whatsoever ye shall ask of the Father in my name, he may give it you. These things I command you, that ye love one another.',
   '["John 14:21", "Romans 8:17"]',
   'The love in this passage has a specific shape: it flows from the Father to the Son and from the Son to the disciples — a single current of the same love, not a series of imitations. "Abide in my love" uses the Greek menō — to remain, to dwell, to stay in a place — not as a passive attitude but as the active practice of staying connected to the source. Joy is directly linked: these things are spoken so that joy might remain and be full. Love and joy are not separate outcomes — they are cause and effect. The elevation from servant to friend in verses 15-16 is one of the most significant status-changes in the Gospels: the basis of friendship is full disclosure — "all things that I have heard of my Father I have made known unto you." The disciples are brought into confidence, and that confidence is the ground of the love.'
  ),
  (18,
   '1 Peter 4:7-11',
   'Earnest Love',
   'But the end of all things is at hand: be ye therefore sober, and watch unto prayer. And above all things have fervent charity among yourselves: for charity shall cover the multitude of sins. Use hospitality one to another without grudging. As every man hath received the gift, even so minister the same one to another, as good stewards of the manifold grace of God. If any man speak, let him speak as the oracles of God; if any man minister, let him do it as of the ability which God giveth: that God in all things may be glorified through Jesus Christ, to whom be praise and dominion for ever and ever. Amen.',
   '["Proverbs 10:12", "James 5:16"]',
   'Peter writes to churches under pressure — the phrase "the end of all things is at hand" is not speculation but pastoral urgency, framing everything that follows as crisis theology. When external conditions are most threatening, the communal response is not self-preservation but intensified love. The word "fervent" (ektenes) means stretched to full extension — love operating at the limit of its capacity. The phrase "charity shall cover the multitude of sins" quotes Proverbs 10:12 and means not that love ignores sin but that it creates the conditions for restoration rather than fracture — the covering of a wound that enables healing, not the concealment that enables rot. The gifts that follow (speaking, ministering) are all expressions of love made concrete: stewarding what God has given toward the flourishing of others.'
  ),
  (19,
   'Isaiah 43:1-4',
   'Thou Art Mine',
   'But now thus saith the LORD that created thee, O Jacob, and he that formed thee, O Israel, Fear not: for I have redeemed thee, I have called thee by thy name; thou art mine. When thou passest through the waters, I will be with thee; and through the rivers, they shall not overflow thee: when thou walkest through the fire, thou shalt not be burned; neither shall the flame kindle upon thee. For I am the LORD thy God, the Holy One of Israel, thy Saviour: I gave Egypt for thy ransom, Ethiopia and Seba for thee. Since thou wast precious in my sight, thou hast been honourable, and I have loved thee: therefore will I give men for thee, and people for thy life.',
   '["Isaiah 40:28-31", "Psalm 139:1-4"]',
   'The words "But now" at the opening of verse 1 are the pivot of the entire passage — everything that came before (judgment, exile, failure) is met by a new word. God''s claim is stated in three short phrases that build on one another: I have redeemed you, I have called you by name, you are mine. The naming is significant — in the ancient Near East, to know a person''s name was to know the person. God''s love is not generic but particular, named, and specific. The promise of verses 2-3 does not guarantee the absence of waters or fire — it guarantees presence through them. The love revealed in verse 4 is staggering in its personal directness: "thou wast precious in my sight... I have loved thee." Not merely important, not merely useful — precious. The Hebrew yaqar means costly, prized, rare. This is how God characterizes Israel to Israel: you are what I count as valuable.'
  ),
  (20,
   'Micah 6:6-8',
   'Love Made Visible',
   'Wherewith shall I come before the LORD, and bow myself before the high God? shall I come before him with burnt offerings, with calves of a year old? Will the LORD be pleased with thousands of rams, or with ten thousands of rivers of oil? shall I give my firstborn for my transgression, the fruit of my body for the sin of my soul? He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?',
   '["Amos 5:24", "Deuteronomy 10:18-19"]',
   'The structure of this passage is a dialogue: verses 6-7 are the increasingly desperate offers of a worshipper trying to earn God''s favor through escalating sacrifice — first calves, then thousands of rams, then ten thousand rivers of oil, then finally a firstborn child. Each offer is larger than the last, and each misses the point. The divine response in verse 8 redirects everything: you have already been shown what is good — the word "shewed" (nagad) means it has already been declared and is not a new revelation. Three things are named, each with different scope: do justly (action toward others in specific situations), love mercy (a disposition of heart toward mercy as a habitual posture), walk humbly with your God (the ongoing orientation of the entire life). The love God requires is not ceremonial performance but relational fidelity made visible in the texture of daily decisions.'
  ),
  (21,
   '1 John 3:16-18',
   'Love in Deed and Truth',
   'Hereby perceive we the love of God, because he laid down his life for us: and we ought to lay down our lives for the brethren. But whoso hath this world''s good, and seeth his brother have need, and shutteth up his bowels of compassion from him, how dwelleth the love of God in him? My little children, let us not love in word, neither in tongue; but in deed and in truth.',
   '["James 2:14-17", "John 15:13"]',
   'John provides the New Testament''s clearest definition of love as action: we know what love is because of a specific historical act — the cross. The word "perceive" (egnōkamen) is in the perfect tense, meaning we have come to know and continue to know, a completed past act with ongoing present effect. The cross is not an idea about love — it is the event by which love is defined and recognized. Verse 17 then applies the same logic to the ordinary: the person who sees a brother in need and closes their compassion (kleiō — locks, seals shut) demonstrates that the love of God does not dwell in them. "Bowels of compassion" (splanchna) refers to the visceral seat of deep feeling — the gut. The contrast in verse 18 is complete: word vs. deed, tongue vs. truth. Love that stops at verbal expression has not yet become what it is supposed to be. This is the memory verse that closes the middle section of this plan.'
  ),
  (22,
   'Isaiah 54:8-10',
   'Everlasting Kindness',
   'In a little wrath I hid my face from thee for a moment; but with everlasting kindness will I have mercy on thee, saith the LORD thy Redeemer. For this is as the waters of Noah unto me: for as I have sworn that the waters of Noah should no more go over the earth; so have I sworn that I would not be wroth with thee, nor rebuke thee. For the mountains shall depart, and the hills be removed; but my kindness shall not depart from thee, neither shall the covenant of my peace be removed, saith the LORD that hath mercy on thee.',
   '["Romans 8:38-39", "Psalm 89:33-34"]',
   'God speaks here to Israel in exile — the "barren woman" addressed in verse 1 who has no home and no future. The comparison to Noah''s flood is carefully chosen: the most catastrophic divine judgment in human memory is cited as the precedent for an oath of kindness. God''s logic is precise: just as I swore after Noah''s flood never to cover the earth again with water, so now I swear that my kindness (chesed — covenant love, steadfast loyalty) will not depart from you. The oath is sworn on God''s own character, not conditioned on Israel''s behavior. The closing image places God''s kindness and covenant of peace on a footing more stable than mountains and hills — which will themselves depart and be removed. The geological order of the world is less permanent than the love God has declared over His people.'
  ),
  (23,
   'Matthew 5:43-48',
   'Love Your Enemies',
   'Ye have heard that it hath been said, Thou shalt love thy neighbour, and hate thine enemy. But I say unto you, Love your enemies, bless them that curse you, do good to them that hate you, and pray for them which despitefully use you, and persecute you; That ye may be the children of your Father which is in heaven: for he maketh his sun to rise on the evil and on the good, and sendeth rain on the just and on the unjust. For if ye love them which love you, what reward have ye? do not even the publicans the same? And if ye salute your brethren only, what do ye more than others? do not even the publicans so? Be ye therefore perfect, even as your Father which is in heaven is perfect.',
   '["Luke 23:34", "Acts 7:59-60"]',
   'This passage closes the antitheses that structure the Sermon on the Mount, each of which begins "Ye have heard... but I say unto you." The "hate thine enemy" half of verse 43 is not found verbatim in the OT — it represents a common popular inference. Jesus corrects not just the inference but the logic beneath it: love that only reaches those who love back is not distinctively divine. God''s love is demonstrated by the sun and rain — given without discrimination to the just and unjust alike. Four specific actions constitute enemy-love: love (chosen goodwill), bless (speak well of), do good (act toward their welfare), pray (intercede for). The standard in verse 48 — "be perfect as your Father is perfect" — uses the Greek teleios, meaning complete, having reached the intended end. The perfection called for is not flawlessness but the wholeness that comes from loving without the condition of reciprocity.'
  ),
  (24,
   'Psalm 86:11-15',
   'Abounding in Mercy',
   'Teach me thy way, O LORD; I will walk in thy truth: unite my heart to fear thy name. I will praise thee, O Lord my God, with all my heart: and I will glorify thy name for evermore. For great is thy mercy toward me: and thou hast delivered my soul from the lowest hell. O God, the proud are risen against me, and the assemblies of violent men have sought after my soul; and have not set thee before them. But thou, O Lord, art a God full of compassion, and gracious, longsuffering, and plenteous in mercy and truth.',
   '["Psalm 27:1-4", "Deuteronomy 6:4-5"]',
   'The prayer for a "united heart" (leb yachid — a singular, integrated heart) in verse 11 reflects the ancient Hebrew understanding that the heart is not primarily the emotional center but the seat of will and decision. The psalmist does not pray for stronger feelings toward God — he prays for a heart that is no longer divided between competing loyalties. The contrast with the proud in verse 14 is deliberate: the proud have not set God before them — their orientation is inward and self-referential. The psalmist''s response is not to match their violence but to name God''s character in verse 15: "full of compassion, gracious, longsuffering, plenteous in mercy and truth" — the same cluster of attributes from Exodus 34:6, God''s self-declaration to Moses. When surrounded by threats, the psalmist anchors himself to who God is, not to what he can do.'
  ),
  (25,
   'John 16:25-27',
   'The Father Loves You',
   'These things have I spoken unto you in proverbs: but the time cometh, when I shall no more speak unto you in proverbs, but I shall shew you plainly of the Father. At that day ye shall ask in my name: and I say not unto you, that I will pray the Father for you: For the Father himself loveth you, because ye have loved me, and have believed that I came out from God.',
   '["John 14:20-21", "Galatians 4:6-7"]',
   'Jesus makes a remarkable clarification in verse 26: He will not need to intercede with the Father on the disciples'' behalf — not because intercession is unimportant but because the Father''s love for them is direct and personal. The word Jesus uses for the Father''s love in verse 27 is the Greek phileō — not the more commonly used agapaō, but the word for tender personal affection, the love between close friends. This is one of only two places in John''s Gospel where phileō describes the Father''s love for believers. The basis given is striking: the Father loves you because you have loved Me and believed. This is not a merit clause — it is a description of what has happened: the disciples have turned toward Jesus, and the Father''s personal affection is the response to that turning. The Father is not distant, accessed only through an intermediary. He loves directly.'
  ),
  (26,
   '2 Thessalonians 3:4-5',
   'Direct My Heart',
   'And we have confidence in the Lord touching you, that ye both do and will do the things which we command you. And the Lord direct your hearts into the love of God, and into the patient waiting for Christ.',
   '["Romans 5:5", "Jude 1:20-21"]',
   'This brief prayer — only one sentence in verse 5 — is among the most practically directed in the epistles. Paul does not pray for the Thessalonians'' doctrinal clarity or their external circumstances; he prays for heart direction. The Greek word for "direct" (kateuthunō) means to guide straight, to clear the path toward a destination. The destination named is double: the love of God and the patient waiting (hupomonē — steadfast endurance) for Christ. The Thessalonian church had become anxious and destabilized by confusion about the return of Christ; some had stopped working (see 3:6-12). Paul''s pastoral response is to redirect their hearts not to doctrinal resolution of the eschatological question but to love and patient endurance — the two postures that sustain a community through uncertainty. Love grounds the waiting; waiting is shaped by love.'
  ),
  (27,
   'Lamentations 3:22-26',
   'New Every Morning',
   'It is of the LORD''s mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness. The LORD is my portion, saith my soul; therefore will I hope in him. The LORD is good unto them that wait for him, to the soul that seeketh him. It is good that a man should both hope and quietly wait for the salvation of the LORD.',
   '["Psalm 30:4-5", "Isaiah 40:28-31"]',
   'Lamentations 3 is the central poem of a book written in the ruins of Jerusalem''s destruction by Babylon in 586 BC — among the worst events in Israel''s history. The speaker is sitting in the aftermath of catastrophe. The declaration of verse 22 is breathtaking in this context: "It is of the LORD''s mercies that we are not consumed." The Hebrew chesed (translated "mercies") is the covenant-love word that runs through the Psalms — its appearance here in the debris of a destroyed city is a lifeline thrown into the worst scene in the OT. The mercies are "new every morning" — not because they run out overnight but because each morning brings a fresh supply of what never actually fails. The declaration in verse 24 — "The LORD is my portion" — uses the language of inheritance: in a world where everything has been stripped away, God Himself is what the speaker claims as their share.'
  ),
  (28,
   'Deuteronomy 7:7-9',
   'A Thousand Generations',
   'The LORD did not set his love upon you, nor choose you, because ye were more in number than any people; for ye were the fewest of all people: But because the LORD loved you, and because he would keep the oath which he had sworn unto your fathers, hath the LORD brought you out with a mighty hand, and redeemed you out of the house of bondmen, from the hand of Pharaoh king of Egypt. Know therefore that the LORD thy God, he is God, the faithful God, which keepeth covenant and mercy with them that love him and keep his commandments to a thousand generations.',
   '["Exodus 34:6-7", "Romans 11:29"]',
   'Moses places before Israel the most disorienting truth in the entire Sinai covenant: they were chosen not because of anything they possessed or achieved but because God loved them and because He kept an oath. Both reasons are entirely located in God''s character — His love and His faithfulness — and neither is connected to Israel''s merit. The phrase "for ye were the fewest of all people" (v.7) removes the last possible ground for national pride. The love that chose Israel is the kind of love that chooses the smallest, the weakest, the least impressive — because that kind of election makes the source of the choosing unmistakable. The phrase "to a thousand generations" (v.9) is not a finite count but a declaration of covenant permanence: beyond what any human calculation can reach, God''s faithfulness extends.'
  ),
  (29,
   '1 Corinthians 16:13-14',
   'Let All Be Done in Love',
   'Watch ye, stand fast in the faith, quit you like men, be strong. Let all your things be done with charity.',
   '["Galatians 5:6", "Romans 13:8-10"]',
   'Paul''s four commands in verse 13 are military in cadence — watch, stand fast, be courageous, be strong — and they mirror the language of soldiers receiving orders before battle. Verse 14 then reframes the entire sequence: "Let all your things be done with charity." The scope word is "all" (panta) — not some, not the spiritual things, not the important things. All things. Love is not one discipline among the four; it is the atmosphere in which all four are practiced. Watchfulness without love becomes paranoia. Courage without love becomes aggression. Paul ends his longest letter with this one-sentence summary, placing love not at the beginning of the Christian life (where it might be read as an entry requirement) but at the end of the most complete theological argument he ever wrote — as the principle that integrates everything the argument has produced.'
  ),
  (30,
   'Romans 8:37-39',
   'More Than Conquerors',
   'Nay, in all these things we are more than conquerors through him that loved us. For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
   '["John 10:27-29", "Jude 1:24-25"]',
   'Paul closes the longest sustained theological argument in his letters with a declaration not about doctrine but about love. The Greek hypernikōmen — "more than conquerors" — appears only here in the entire New Testament; the prefix huper pushes victory past its ordinary register into something that has no adequate English equivalent. The basis is stated immediately: "through him that loved us" — the aorist participle agapēsantos, the same form used throughout Scripture for the definitive, completed act of divine love. The list of potential separators (death, life, angels, principalities, powers, things present, things to come, height, depth, any other creature) is a merism — a rhetorical device that names the extreme ends of a category to indicate every possible thing within it. Nothing in the entire structure of existence can get between a person and the love of God in Christ Jesus. The plan closes where it must: with the love that started it, undefeated.'
  )
) AS v(day_number, verse_ref, day_title, passage_text, passage_refs, reflection)
WHERE p.slug = 'rooted-in-love'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Rooted in Love (30 days) — Part 2b: Comprehension checks
-- ============================================================

UPDATE reading_plan_entries e
SET
  quiz_question   = v.quiz_question,
  quiz_options    = v.quiz_options,
  quiz_explanation = v.quiz_explanation
FROM reading_plans p,
(VALUES
  (1,
   'In John 3:14, what Old Testament event does Jesus reference as a type of His crucifixion?',
   '[{"label":"A","text":"Moses lifting the bronze serpent in the wilderness","correct":true},{"label":"B","text":"The Passover lamb in Egypt","correct":false},{"label":"C","text":"The binding of Isaac on Mount Moriah","correct":false}]',
   'Jesus draws a direct typological line from Numbers 21:9 — when Moses lifted a bronze serpent on a pole and all who looked at it were healed — to the Son of Man being lifted up on the cross. The Greek word hypsōthēnai means both physical lifting and exaltation, so "God so loved the world" is framed immediately by a reference to the cross as love''s mechanism.'
  ),
  (2,
   'According to 1 John 4:7-12, what is the theological basis for the command "let us love one another"?',
   '[{"label":"A","text":"Love is of God, and loving one another reflects knowing God","correct":true},{"label":"B","text":"Love produces good results in the community","correct":false},{"label":"C","text":"The law of Moses commands it explicitly","correct":false}]',
   'John''s argument is that love for God and love for neighbor are the same subject approached from two directions. "Every one that loveth is born of God, and knoweth God" — loving one another is not merely a community virtue but evidence of knowing God Himself. Anyone who does not love has misunderstood both terms.'
  ),
  (3,
   'In Hosea 11:4, what did God say He used to draw Israel to Himself?',
   '[{"label":"A","text":"Cords of a man — bands of love","correct":true},{"label":"B","text":"The commandments of the law","correct":false},{"label":"C","text":"Signs and wonders in Egypt","correct":false}]',
   'The Hebrew chevel (cords, bands) describes not physical constraint but the persuasive pull of relational love. God drew Israel not by compulsion but by the same kind of relational bonds that exist between people — cords of a man, bands of love. The passage reveals God working beneath the surface of Israel''s awareness, healing them while they did not know it.'
  ),
  (4,
   'In the KJV, Paul uses the word "Charity" throughout 1 Corinthians 13. What Greek word does this translate?',
   '[{"label":"A","text":"Agapē — unconditional, self-giving love","correct":true},{"label":"B","text":"Philia — friendship and affection","correct":false},{"label":"C","text":"Eros — passionate desire","correct":false}]',
   'The KJV translators chose "charity" (from the Latin caritas) to distinguish this love from the emotional or erotic overtones "love" carried in early modern English. The Greek agapē is the same word used in John 3:16 and throughout the New Testament for God''s self-giving love. Paul''s 15 descriptions of agapē are all actions or habits, not feelings.'
  ),
  (5,
   'According to Jesus in Matthew 22:40, what is the relationship between the two great commandments and the rest of the law?',
   '[{"label":"A","text":"All the law and the prophets hang on these two commandments","correct":true},{"label":"B","text":"These two commandments summarize the most important parts of the law","correct":false},{"label":"C","text":"These two commandments replace the law and the prophets","correct":false}]',
   'Jesus uses the word "hang" (kremata) — to hang suspended from a supporting point. Remove love as the foundation and the entire legal structure falls. He does not say the law is unimportant; He says it derives its meaning and weight from love. The two great commandments are not a summary of the law but the load-bearing principle from which every other command is suspended.'
  ),
  (6,
   'Paul prays that believers would know the love of Christ "which passeth knowledge" (Ephesians 3:19). What does this paradox mean?',
   '[{"label":"A","text":"The love exceeds what intellectual understanding alone can contain","correct":true},{"label":"B","text":"The love is mysterious and unknowable even in principle","correct":false},{"label":"C","text":"Only spiritually mature Christians can access this knowledge","correct":false}]',
   'Paul is not saying love is unknowable but that it exceeds the capacity of intellectual comprehension alone. The Greek huperballousa means surpassing, going beyond — love that is real and knowable experientially but that overflows any conceptual container the mind can build. This is why Paul prays for experiential "knowing" (ginōskō) not just doctrinal knowledge.'
  ),
  (7,
   'According to 1 John 4:18, what specifically does "perfect love" cast out?',
   '[{"label":"A","text":"Fear — specifically the fear of condemnation in judgment","correct":true},{"label":"B","text":"All negative emotions including grief and sadness","correct":false},{"label":"C","text":"The desires of the flesh","correct":false}]',
   'The context of verse 18 is verse 17: "that we may have boldness in the day of judgment." The fear being cast out is the terror of condemnation — the torment of a person uncertain whether they are accepted before God. Perfect love removes this not by suppressing the emotion but by changing its ground: the basis of our standing is what God has done, not what we have achieved.'
  ),
  (8,
   'In John 13:35, Jesus says the world will know His disciples by what sign?',
   '[{"label":"A","text":"Their love for one another","correct":true},{"label":"B","text":"Their miracles and signs","correct":false},{"label":"C","text":"Their teaching and correct doctrine","correct":false}]',
   'Jesus makes the observable love between believers the primary apologetic for the reality of the gospel. Not doctrine, not miracles — the visible quality of mutual love in the community. The new commandment is given not in an idealized setting but in the room where Judas has just left to betray Jesus — love is commanded in the presence of its refusal.'
  ),
  (9,
   'In Luke 6:27-28, what does Jesus tell His followers to do toward their enemies?',
   '[{"label":"A","text":"Love, do good, bless, and pray for them","correct":true},{"label":"B","text":"Only avoid retaliation and resentment","correct":false},{"label":"C","text":"Forgive them once and then keep distance","correct":false}]',
   'Jesus moves from interior (chosen goodwill) to the most concrete (pray for them by name): love, do good, bless, pray. The Golden Rule in verse 31 is given in its active, positive form — initiate the good you would want — rather than the negative form known in Hillel, Confucius, and Tobit. Enemy-love is not passive neutrality but active goodwill.'
  ),
  (10,
   'In Song of Solomon 8:7, what cannot quench love?',
   '[{"label":"A","text":"Many waters and floods","correct":true},{"label":"B","text":"Time and long separation","correct":false},{"label":"C","text":"The poverty or lowliness of the beloved","correct":false}]',
   'The waters and floods represent chaos forces in ancient Near Eastern cosmology — the most powerful natural forces the ancient world knew. Love is declared more tenacious than all of them. The passage also says that no amount of wealth can purchase love — if a man offered all the substance of his house for it, it would be contemned (utterly despised). Love belongs to a different order than power or money.'
  ),
  (11,
   'In Zephaniah 3:17, how does God express His love and delight in His people?',
   '[{"label":"A","text":"He rejoices over them with joy and sings over them","correct":true},{"label":"B","text":"He gives them silence and long-suffering patience","correct":false},{"label":"C","text":"He delivers them from all enemies immediately","correct":false}]',
   'The Hebrew sus (translated "joy over thee") implies whirling, spinning, physically expressed exultation — a joy that cannot stay still. Alongside this, "he will rest in his love" (charash — to be silent, still) describes God settling into a quiet that has no agitation in it. The passage closes one of the most severe prophetic books: the God who judged in chapters 1-2 is the same God who sings in 3:17.'
  ),
  (12,
   'In Psalm 103:12, how far has God removed our transgressions from us?',
   '[{"label":"A","text":"As far as the east is from the west","correct":true},{"label":"B","text":"Into the depths of the sea","correct":false},{"label":"C","text":"To be remembered no more forever","correct":false}]',
   'The choice of east-west rather than north-south is deliberate: north and south have defined poles — finite endpoints. East and west have no poles. You can travel east indefinitely and never reach the point where east becomes west. The removal of sin is described in infinite terms, not merely large ones. The psalmist intentionally chooses a directionality that has no convergence point.'
  ),
  (13,
   'According to Romans 5:8, at what moment did God demonstrate His love for us?',
   '[{"label":"A","text":"While we were still sinners — before we repented or sought Him","correct":true},{"label":"B","text":"After we turned to God in faith and repentance","correct":false},{"label":"C","text":"When we were righteous enough to receive His grace","correct":false}]',
   'Paul''s argument is that God''s love acted at the worst possible moment — not when we were neutral or seeking but while we were sinners and (in v.10) enemies. The word "commendeth" (sunistēmi) means to prove by action. God did not announce His love in theory; He demonstrated it in the specific historical act of the cross, at the specific historical moment of our worst moral condition.'
  ),
  (14,
   'According to Galatians 5:13, what should the freedom of the gospel be used for?',
   '[{"label":"A","text":"Serving one another in love","correct":true},{"label":"B","text":"Personal liberty in all areas of life","correct":false},{"label":"C","text":"Freedom from all moral obligation","correct":false}]',
   'Paul immediately redirects the freedom he has defended: not license but love-directed service. The word "serve" (douleuete) is the verb form of doulos — bond-servant. The free person voluntarily becomes a servant, not from compulsion but because love is now the organizing motive of their freedom. Verse 14 makes the logic explicit: all the law is fulfilled in neighbor-love. Freedom without love collapses into mutual destruction.'
  ),
  (15,
   'In Colossians 3:14, what metaphor does Paul use to describe love''s role among the other virtues?',
   '[{"label":"A","text":"The bond — a ligament that holds everything together","correct":true},{"label":"B","text":"A crown worn above all the other virtues","correct":false},{"label":"C","text":"The foundation beneath all the others","correct":false}]',
   'The Greek syndesmos means a binding-together, used in medical literature for a ligament. Without the ligament, individual virtues are present but disconnected — a collection of joints without a joint mechanism. Patience without love becomes stoicism; forgiveness without love becomes transaction. Love is the integrating principle that brings every virtue to its intended function — its teleiotēs (perfectness, completion).'
  ),
  (16,
   'When does Proverbs 17:17 say a friend loves?',
   '[{"label":"A","text":"At all times — love that does not vary with circumstances","correct":true},{"label":"B","text":"In times of celebration and shared joy","correct":false},{"label":"C","text":"When the covenant is formally renewed","correct":false}]',
   'The Hebrew ahab (loveth) is the primary word for deep affection and attachment — the same word used of God''s love for Israel in Hosea 11:1. The proverb defines friendship not by feeling but by invariance: a friend whose love changes with the season is not what the verse describes. The paired statement — "a brother is born for adversity" — does not introduce a different person but layers the portrait: the true friend is most recognizable precisely when circumstances are worst.'
  ),
  (17,
   'In John 15:15, on what basis does Jesus call His disciples friends rather than servants?',
   '[{"label":"A","text":"He has made known to them all things He heard from the Father","correct":true},{"label":"B","text":"They have kept all His commandments faithfully","correct":false},{"label":"C","text":"They have suffered persecution for His name","correct":false}]',
   'The distinction between servant and friend is one of information and confidence: the servant does not know what the master is doing; the friend is brought into full disclosure. Jesus defines friendship as being trusted with God''s own counsel — "all things that I have heard of my Father I have made known unto you." This is the ground of the new relationship. The love flows from this shared confidence, not merely from shared history.'
  ),
  (18,
   'According to 1 Peter 4:8, what does fervent love do?',
   '[{"label":"A","text":"It covers a multitude of sins","correct":true},{"label":"B","text":"It fulfills all the requirements of the law","correct":false},{"label":"C","text":"It produces boldness before God in prayer","correct":false}]',
   'Peter quotes Proverbs 10:12: "Hatred stirreth up strifes: but love covereth all sins." The covering is not concealment but the creation of conditions for restoration rather than fracture — love that absorbs injury in the way a wound-covering enables healing. The word "fervent" (ektenes) means stretched to full extension — love operating at the limit of its capacity, appropriate to the crisis context Peter addresses.'
  ),
  (19,
   'In Isaiah 43:1, what two acts does God cite as the basis for His claim "thou art mine"?',
   '[{"label":"A","text":"I have redeemed thee and I have called thee by thy name","correct":true},{"label":"B","text":"I have delivered thee from Egypt and given thee the law","correct":false},{"label":"C","text":"I have chosen thy fathers and sworn an oath to Abraham","correct":false}]',
   'Redemption and naming are the two acts God cites: to redeem is to buy back at cost; to call by name is to know personally and specifically. In the ancient Near East, knowing a person''s name was to know the person — name represented identity and relationship. God''s love in this passage is not generic; it is particular, named, and costly. The declaration "thou art mine" follows from both acts: redeemed and known by name.'
  ),
  (20,
   'According to Micah 6:8, what three things does the LORD require?',
   '[{"label":"A","text":"Do justly, love mercy, and walk humbly with thy God","correct":true},{"label":"B","text":"Sacrifice, prayer, and fasting","correct":false},{"label":"C","text":"Observe the feasts, pay tithes, and read the law","correct":false}]',
   'The three requirements move from outward action (do justly — specific decisions toward others), to inward disposition (love mercy — mercy as a habitual posture of heart), to the orientation of the entire life (walk humbly with thy God — ongoing relational alignment). The word "shewed" (nagad) in verse 8 means this has already been declared — it is not a new revelation but a summary of what was always the point beneath the ceremonial system.'
  ),
  (21,
   'In 1 John 3:16, how does John say we perceive — come to know — the love of God?',
   '[{"label":"A","text":"Because Christ laid down His life for us","correct":true},{"label":"B","text":"By studying the theological definition of agapē","correct":false},{"label":"C","text":"By observing the miracles Jesus performed","correct":false}]',
   'The word "perceive" (egnōkamen) is in the perfect tense: we have come to know and continue to know, a completed past act with ongoing present effect. The cross is not an idea about love — it is the event by which love is defined and recognized. John then applies the same logic downward: we ought to lay down our lives for the brethren. Love is not defined abstractly and then applied; it is defined by the cross and then extended.'
  ),
  (22,
   'In Isaiah 54:9-10, to what Old Testament promise does God compare His oath of kindness?',
   '[{"label":"A","text":"The oath to Noah that the waters would not again cover the earth","correct":true},{"label":"B","text":"The promise to Abraham about the land of Canaan","correct":false},{"label":"C","text":"The covenant with David for an eternal throne","correct":false}]',
   'God deliberately chooses the most catastrophic divine judgment in human memory — Noah''s flood — as the precedent for an oath of kindness. The logic is precise: just as I swore never again after the flood, so I swear now that my kindness will not depart. The oath is sworn on God''s own character (not Israel''s behavior), and the kindness (chesed — covenant love) is declared more stable than mountains and hills, which will themselves depart.'
  ),
  (23,
   'In Matthew 5:45, why does Jesus say we should love our enemies?',
   '[{"label":"A","text":"That we may be children of our Father — because God gives sun and rain to just and unjust alike","correct":true},{"label":"B","text":"So our enemies may eventually become friends","correct":false},{"label":"C","text":"Because the law requires equal treatment for all people","correct":false}]',
   'The motive Jesus gives is not pragmatic but theological: enemy-love is how believers reflect the character of their Father. God''s love is demonstrated by the sun and rain — distributed without discrimination, not withheld from the unjust. Loving only those who love you requires no divine character — even the publicans do that. The perfection called for (v.48, teleios) is the completeness of a love that does not depend on the worthiness of its object.'
  ),
  (24,
   'Psalm 86:11 contains a unique prayer not found elsewhere in the Psalter. What does the psalmist ask God to do to his heart?',
   '[{"label":"A","text":"Unite it — make it singular and undivided in fearing God","correct":true},{"label":"B","text":"Soften it toward his enemies","correct":false},{"label":"C","text":"Fill it with wisdom and understanding","correct":false}]',
   'The Hebrew leb yachid means a singular, integrated heart — one that is not divided between competing loyalties. The psalmist does not pray for stronger feelings toward God but for a heart that is no longer split. The ancient Hebrew understood the heart as the seat of will and decision, not primarily emotion. A divided heart chooses between masters. God''s love, received and trusted, makes the heart one.'
  ),
  (25,
   'In John 16:27, Jesus says the Father loves His disciples directly. What two things does He cite as the reason?',
   '[{"label":"A","text":"They have loved Jesus and believed that He came from God","correct":true},{"label":"B","text":"They have kept His commandments and loved one another","correct":false},{"label":"C","text":"They have suffered persecution and remained faithful","correct":false}]',
   'The statement is striking: the Father''s love does not need to be mediated through Jesus''s intercession — it is direct and personal. The word used for the Father''s love here is phileō (tender personal affection) rather than the more common agapaō — one of only two places in John where phileō describes the Father''s love for believers. The disciples have turned toward Jesus, and the Father''s personal love is the response to that turning.'
  ),
  (26,
   'In 2 Thessalonians 3:5, what two things does Paul pray the Lord would direct the Thessalonians'' hearts into?',
   '[{"label":"A","text":"The love of God and the patient waiting for Christ","correct":true},{"label":"B","text":"Sound doctrine and faithful service to the church","correct":false},{"label":"C","text":"Wisdom to understand prophecy and courage to endure","correct":false}]',
   'The Thessalonian church had become anxious about the return of Christ, with some stopping work altogether (see 3:6-12). Paul''s pastoral response is not to resolve the eschatological question but to redirect their hearts: toward love (as the grounding reality) and toward patient endurance (hupomonē — steadfast waiting). Love and waiting are the two postures that sustain a community through uncertainty. Love grounds the waiting; waiting is shaped by love.'
  ),
  (27,
   'According to Lamentations 3:22, what is the reason Israel was not consumed despite the destruction around them?',
   '[{"label":"A","text":"The steadfast love of the LORD — His mercies that never fail","correct":true},{"label":"B","text":"Their faithfulness and repentance during the exile","correct":false},{"label":"C","text":"The intercession of the prophets on their behalf","correct":false}]',
   'The author is sitting in the ruins of Jerusalem and making this declaration purely by faith — there is no material evidence visible to him. The Hebrew chesed (translated "mercies") is the covenant-love word of the Psalms. Its appearance in the debris of a destroyed city is a theological lifeline. The mercies are "new every morning" not because they run out overnight but because each morning brings a fresh supply of what never actually ceases.'
  ),
  (28,
   'According to Deuteronomy 7:7-8, why did God choose Israel to be His people?',
   '[{"label":"A","text":"Because He loved them and kept His oath — not because of their size or merit","correct":true},{"label":"B","text":"Because they were the most righteous nation among the peoples","correct":false},{"label":"C","text":"Because they were numerous enough to fulfill His purposes","correct":false}]',
   'Moses makes it explicit: Israel was the fewest of all people (v.7). No basis for pride exists — the election is entirely located in God''s character: His love (ahab) and His faithfulness to the oath sworn to the fathers. Both reasons are inside God, not inside Israel. This is the theological heart of unconditional covenant love: it does not begin with or depend on the worthiness of its object.'
  ),
  (29,
   'In 1 Corinthians 16:14, what is the scope of the command to do all things in love?',
   '[{"label":"A","text":"All things — not just spiritual or important acts, but everything","correct":true},{"label":"B","text":"All things done in the context of church life and worship","correct":false},{"label":"C","text":"All things related to leadership and teaching in the community","correct":false}]',
   'Paul uses the Greek panta — all, everything, without exception. He does not say "let the important things" or "let the spiritual things" — he says all things. Love is not one discipline among the four commands in verse 13; it is the atmosphere in which all four are practiced. Placed at the end of Paul''s longest letter, it functions as the integrating principle of everything the letter has built — the final word.'
  ),
  (30,
   'In Romans 8:37, Paul calls believers "more than conquerors." What makes this possible?',
   '[{"label":"A","text":"Through Christ who loved us — His love is the source of the victory","correct":true},{"label":"B","text":"Their own spiritual discipline and perseverance in faith","correct":false},{"label":"C","text":"Because the Holy Spirit has freed them from the power of sin","correct":false}]',
   'The Greek hypernikōmen (more than conquerors) appears only here in the entire New Testament — the prefix huper pushes victory beyond its ordinary register. Paul grounds this immediately in the love: "through him that loved us." The aorist participle (agapēsantos — the one who loved) points to the completed historical act of the cross. The victory is a consequence of the love, not the reverse. The list of potential separators that follows is a rhetorical merism covering every category of existence — and none of them can reach through the love of God.'
  )
) AS v(day_number, quiz_question, quiz_options, quiz_explanation)
WHERE p.slug = 'rooted-in-love'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Rooted in Love (30 days) — Part 2c: Word studies
-- Memory verse days: 1 (John 3:14-17), 11 (Zephaniah 3:14-17),
-- 21 (1 John 3:16-18)
-- ============================================================

UPDATE reading_plan_entries e
SET word_studies = v.word_studies
FROM reading_plans p,
(VALUES
  (1,
   '{"loved": {"original": "ἠγάπησεν", "transliteration": "ēgapēsen", "definition": "The aorist tense of agapaō — love expressed as a specific completed act, not a continuous attitude. God loved the world at a definite historical moment in a definite historical event. The aorist form emphasizes the once-for-all character of the cross as love''s demonstration.", "refs": ["1 John 4:10", "Romans 5:8"]}, "begotten": {"original": "μονογενῆ", "transliteration": "monogenē", "definition": "Not ''only begotten'' in a biological sense but ''one of a kind'' — uniquely existing, of an entirely different order. The word points to the Son''s singular nature and incomparable relationship with the Father, not to the method of His origin.", "refs": ["John 1:14", "Hebrews 11:17"]}, "perish": {"original": "ἀπόληται", "transliteration": "apolyto", "definition": "To be destroyed, to be lost, to experience total ruin. The word carries the sense of irreversible loss — not simply ceasing to exist but being definitively and completely undone. Its use here makes the alternative to eternal life concrete and serious.", "refs": ["Luke 15:4", "John 10:28"]}}'
  ),
  (11,
   '{"rejoice": {"original": "שִׂישׂ", "transliteration": "sus", "definition": "To exult, to spin around, to be beside oneself with joy. An active, almost physical expression of delight — the word implies a joy that cannot stay still, that must move and express itself outwardly. Used here of God''s joy over His people.", "refs": ["Isaiah 62:5", "Psalm 35:9"]}, "rest": {"original": "חָרַשׁ", "transliteration": "charash", "definition": "To be silent, to be still, to hold peace. Used here of God settling into a quiet love that has no agitation in it — love that has come to rest, undisturbed and untroubled. Alongside His singing, God also dwells in a stillness that speaks of love fully settled.", "refs": ["Exodus 14:14", "Psalm 37:7"]}, "singing": {"original": "רִנָּה", "transliteration": "rinnah", "definition": "A shout of joy, a ringing cry of exultation — used of the cry of a victor, the shout of someone overwhelmed with joy. God''s delight over His people is expressed not in a quiet murmur but in the joyful cry of one who has prevailed.", "refs": ["Psalm 30:5", "Isaiah 35:10"]}}'
  ),
  (21,
   '{"perceive": {"original": "ἐγνώκαμεν", "transliteration": "egnōkamen", "definition": "Perfect tense of ginōskō — we have come to know and continue to know. Not theoretical knowledge but experiential, relational knowing. The perfect tense indicates a completed past action (the cross) with continuing present effect — love-knowledge that has settled into the knower and remains.", "refs": ["John 10:14", "Galatians 4:9"]}, "deed": {"original": "ἔργῳ", "transliteration": "ergō", "definition": "Work, action, the product of hands and deliberate effort. Contrasted with logos (word) and glōssa (tongue), deed is what can be observed and measured — love that has left the realm of intention and taken concrete form in the world.", "refs": ["James 2:17", "Matthew 5:16"]}, "truth": {"original": "ἀληθείᾳ", "transliteration": "alētheia", "definition": "Literally ''un-hidden-ness'' — from the Greek a- (not) + lanthano (to hide or escape notice). That which is real and not concealed. Love in truth is love that matches the inner reality, that has no gap between the stated intention and the actual motivation.", "refs": ["John 14:6", "3 John 1:3"]}}'
  )
) AS v(day_number, word_studies)
WHERE p.slug = 'rooted-in-love'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Rooted in Love (30 days) — Part 2h: Dig deeper
-- Extended commentary for days 1, 15, and 30
-- ============================================================

UPDATE reading_plan_entries e
SET
  deep_dive_text = v.text,
  deep_dive_refs = v.refs
FROM reading_plans p,
(VALUES
  (1,
   'The context of John 3:14 is Numbers 21:4-9 — the account of the bronze serpent. Israel had spoken against God and against Moses in the wilderness, and the LORD sent serpents among them. When the people repented, Moses was instructed to make a serpent of brass and lift it on a pole: everyone who looked at it lived. Jesus draws a direct typological line from this moment to His own crucifixion, and the parallel is precise in ways that reward close attention. In both cases, the people are mortally wounded by something that came from within their own situation — in Numbers, the serpents came because of Israel''s sin; in John, humanity is perishing because of sin. In both cases, the instrument of healing is lifted up on a pole and must be looked at — not worked for, not earned, just looked at. In both cases, the looking is an act of faith, not of merit. The Greek word used for "lifted up" in John 3:14 is hypsōthēnai, and it appears three times in John''s Gospel (3:14, 8:28, 12:32-34), always carrying a double meaning: physical lifting (the crucifixion) and glorification (exaltation). John''s Gospel is structured so that the cross and the glorification are the same event, not two separate moments. The passage that contains "God so loved the world" is therefore not a standalone declaration of sentiment — it is a theological statement embedded in a typology of the cross. The love is demonstrated by a specific act at a specific historical moment. The ēgapēsen (aorist tense) of verse 16 is the same grammatical form: a completed act, a definite point in history. "God so loved the world" means God loved the world in this manner — by doing this specific thing. The architecture of John 3:14-17 is: Moses (type) → Son of Man (antitype) → cross (means) → love (motive) → rescue (purpose). Understanding this architecture is what makes "God so loved the world" mean what John intends it to mean.',
   '["Numbers 21:7-9", "John 12:32-34"]'
  ),
  (15,
   'The Greek word translated "bond of perfectness" in Colossians 3:14 is syndesmos — literally a binding-together, a thing that ties and holds. In the medical literature of Paul''s time, syndesmos was used specifically for a ligament — the connective tissue that holds joints together and allows them to function as a single system rather than as a collection of disconnected bones. Paul''s metaphor is anatomically precise in a way that rewards reflection. The virtues he lists in verses 12-13 — compassion, kindness, humility, meekness, patience, forbearance, forgiveness — are not abstractions. Each is a joint, a point of connection between people. A joint that lacks a ligament is present but functionless; it cannot bear weight or transmit movement. Patience without love is present — you can see it — but it does not connect anything. It becomes mere stoicism: endurance as a closed system, suffering without the relational dimension that makes suffering redemptive. Forgiveness without love is also present but becomes a transaction: the debt is canceled, the accounts are cleared, but the relationship is not restored because the ligament — love — is not there to hold the restored joint in place. The word teleiotēs, translated "perfectness," comes from telos — end, purpose, completion. This is the same root from which Jesus''s cry "It is finished" (tetelestai, John 19:30) comes. Love''s role among the virtues is not to make you abstractly perfect but to bring the virtues to their intended purpose — to complete them. Without love, the virtues are present but incomplete, like a hand with all its bones but no tendons. The phrase "above all these things" (epi pasin de toutois) literally means "upon all these" — a final layer placed over the whole structure, not an additional item added to the end of a list. Love is the outer layer that makes the inner structure cohere. Paul''s clothing metaphor (endysasthe, "clothe yourselves," v.12) extends here: all the garments are on, and love is the final layer that makes the whole outfit hang as intended.',
   '["Ephesians 4:13-16", "Romans 12:9-13"]'
  ),
  (30,
   'The Greek word hypernikōmen in Romans 8:37 appears only once in the entire New Testament. The base word is nikaō — to conquer, to prevail, to overcome — which is strong enough on its own: it is the word used in Revelation repeatedly for those who overcome (nikōn). But Paul adds the prefix huper, which means above, beyond, surpassing. The result is a word that has no precise English equivalent: not merely winning but winning so overwhelmingly that no rematch is conceivable, not barely prevailing but prevailing so decisively that the adversary is exposed as never having been a real threat to the ultimate outcome. The word is carefully placed: Paul does not say we will be hypernikōmen (future tense, eventual hope) — he says we are hypernikōmen (present tense, current reality). And he says this in the middle of a list that includes tribulation, distress, persecution, famine, nakedness, peril, and sword (v.35). The conqueror is not someone who has escaped the list. The conqueror is the one going through the list — differently. The phrase that immediately follows is the theological load-bearer: "through him that loved us" (dia tou agapēsantos hēmas). The aorist participle again — agapēsantos, the one who loved in a completed definitive act. The victory is entirely grounded in the love, not in the believer''s spiritual achievement or endurance capacity. The list in verses 38-39 is a rhetorical merism — a device that names the extremes of a category to indicate everything within it. Death and life cover the full boundary of biological existence. Things present and things to come cover the entire horizontal axis of time. Height and depth cover the entire vertical axis of existence. Angels, principalities, and powers cover every category of spiritual agency. The phrase "any other creature" (tis ktisis hetera) is the catch-all: Paul has covered every category he can name, and then adds an explicit remainder clause for anything he has not named. The construction is exhaustive by design. The love of God in Christ Jesus is not pierced by any category of existence that can be named or imagined. This plan began with "God so loved the world" — a definite historical act in a definite historical moment. It closes with the declaration that nothing in the entire structure of reality can reach between a person and that love. The love that started it cannot be ended by it.',
   '["Romans 8:31-34", "Jude 1:24-25"]'
  )
) AS v(day_number, text, refs)
WHERE p.slug = 'rooted-in-love'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- The Names of God (7 days) — base entries.
-- Content run 2026-07-02. Evergreen plan, sort_order 6.
-- Idempotent: inserted only when the plan has zero entries.
-- ============================================================
INSERT INTO reading_plan_entries (plan_id, day_number, verse_ref, reflection, created_at)
SELECT p.id, v.day_number, v.verse_ref, v.reflection, NOW()
FROM reading_plans p,
(VALUES
  (1, 'Genesis 1:1-3',   'Before God is described by any single attribute, He acts — He creates. Elohim is the first name Scripture gives Him, and it is plural in form, hinting at a fullness the Hebrew mind could not yet fathom. Everything that exists began at His word.'),
  (2, 'Genesis 16:13',   'Hagar, a runaway slave with no status and no future, becomes the first person in Scripture to give God a name — El Roi, the God who sees me. He found her in the wilderness precisely because He had never lost sight of her.'),
  (3, 'Genesis 22:13-14','On the mountain where Abraham raised the knife over his son, God provided a ram in the thicket. Abraham named the place Jehovah-Jireh — the LORD will provide. The provision came at the last moment, but it came.'),
  (4, 'Exodus 15:26',    'Three days after crossing the Red Sea, Israel found only bitter water. There God revealed Himself as Jehovah-Rapha — the LORD who heals. He heals not only bodies but the bitterness of a people who have forgotten His power.'),
  (5, 'Genesis 17:1',    'When Abram was ninety-nine and long past hope of a child, God appeared as El Shaddai — God Almighty, God all-sufficient. The name answers the question every waiting heart asks: is He enough for what I cannot do myself?'),
  (6, 'Isaiah 40:10-11', 'The same God whose arm rules the nations gathers lambs in that arm and carries them close. Jehovah-Raah, the LORD my Shepherd, is not a distant sovereign but a tender guide who leads the weak gently, at their pace.'),
  (7, 'Exodus 17:15-16', 'After Israel defeated Amalek while Moses held up his hands, Moses built an altar and named it Jehovah-Nissi — the LORD my Banner. In ancient war a banner was the rallying point; God Himself is the standard His people gather under.')
) AS v(day_number, verse_ref, reflection)
WHERE p.slug = 'names-of-god'
  AND NOT EXISTS (SELECT 1 FROM reading_plan_entries WHERE plan_id = p.id);

-- The Names of God — text, titles, passages, prayer, application, question, context, memory flags.
UPDATE reading_plan_entries e
SET
  day_title       = v.day_title,
  passage_text    = v.passage_text,
  passage_refs    = v.passage_refs,
  prayer          = v.prayer,
  application     = v.application,
  question        = v.question,
  context_note    = v.context_note,
  content_type    = 'passage',
  is_memory_verse = v.is_memory_verse
FROM reading_plans p,
(VALUES
  (1,
   'Elohim: The Creator God',
   'In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters. And God said, Let there be light: and there was light.',
   '["Nehemiah 9:6", "Colossians 1:16"]',
   'Elohim, my Maker, You spoke light into darkness and order into chaos. Speak into the formless places of my life today, and let there be light where I have only known shadow. Amen.',
   'Step outside for two minutes and look at one created thing — a tree, the sky, your own hands. Say aloud: "Elohim made this." Let creation preach to you before the day begins.',
   'The name Elohim is grammatically plural yet takes singular verbs. What does it stir in you to know the God who made the galaxies also chose to make you?',
   'Elohim is the name used throughout Genesis 1 — 35 times in the creation account alone. Its plural form (a plural of majesty) hints at a fullness later revealed as the Trinity.',
   true
  ),
  (2,
   'El Roi: The God Who Sees Me',
   'And she called the name of the LORD that spake unto her, Thou God seest me: for she said, Have I also here looked after him that seeth me?',
   '["Psalm 139:1-4", "Hebrews 4:13"]',
   'El Roi, You see me — not just my actions but my aching, unspoken places. Thank You that I am never invisible to You. Meet me in my wilderness as You met Hagar. Amen.',
   'Think of the part of your life you feel no one notices. Bring it to God in one honest sentence, knowing you are already fully seen and still fully loved.',
   'Hagar was overlooked by everyone around her, yet fully seen by God. Where in your life do you most need to remember that you are not invisible to Him?',
   'Hagar, an Egyptian slave, is the only person in the Bible to give God a name. God met her twice in the desert — the God who sees pursues the forgotten.',
   false
  ),
  (3,
   'Jehovah-Jireh: The LORD Will Provide',
   'And Abraham lifted up his eyes, and looked, and behold behind him a ram caught in a thicket by his horns: and Abraham went and took the ram, and offered him up for a burnt offering in the stead of his son. And Abraham called the name of that place Jehovahjireh: as it is said to this day, In the mount of the LORD it shall be seen.',
   '["Philippians 4:19", "Matthew 6:31-33"]',
   'Jehovah-Jireh, You provided a ram for Abraham and Your own Son for me. Teach me to trust Your provision even when I cannot yet see it in the thicket. Amen.',
   'Name one thing you are anxious about providing for. Write "Jehovah-Jireh" next to it and choose to release the timeline of the provision to God.',
   'Abraham named the place "The LORD will provide" before he saw how. What would change if you named your current need by God''s character instead of your fear?',
   'The name means literally "the LORD will see to it." Provision and seeing share the same Hebrew root (ra''ah) — God provides because He sees ahead to the need.',
   false
  ),
  (4,
   'Jehovah-Rapha: The LORD Who Heals',
   'And said, If thou wilt diligently hearken to the voice of the LORD thy God, and wilt do that which is right in his sight, and wilt give ear to his commandments, and keep all his statutes, I will put none of these diseases upon thee, which I have brought upon the Egyptians: for I am the LORD that healeth thee.',
   '["Psalm 103:2-3", "1 Peter 2:24"]',
   'Jehovah-Rapha, You are the LORD who heals. Where I am broken in body, mind, or memory, bring Your restoring touch. I trust the timing and the depth of Your healing. Amen.',
   'Bring one wound — physical or emotional — before God today. Instead of demanding a cure, ask Him to be present in it as the Healer, and notice what shifts.',
   'God revealed Himself as Healer at bitter waters, not beside a spring. Why do you think He so often reveals this name in the hard places rather than the easy ones?',
   'The bitter water at Marah was made sweet when God showed Moses a tree to cast in — an early picture of healing coming through wood, later fulfilled at the cross.',
   false
  ),
  (5,
   'El Shaddai: God Almighty',
   'And when Abram was ninety years old and nine, the LORD appeared to Abram, and said unto him, I am the Almighty God; walk before me, and be thou perfect.',
   '["Genesis 35:11", "Revelation 1:8"]',
   'El Shaddai, God all-sufficient, You are enough where I am not. When my strength and my options run out, You are only beginning. Be my sufficiency today. Amen.',
   'Identify one place you have been striving in your own strength. Consciously hand it to El Shaddai and take one small step of obedience, trusting Him for the outcome.',
   'God revealed this name to a man far past his own ability to fulfill the promise. Where are you waiting on something you cannot produce yourself?',
   'El Shaddai is often translated "God Almighty," suggesting all-sufficiency and overflowing supply. God gave Abram this name — and a new name, Abraham — in the same encounter.',
   false
  ),
  (6,
   'Jehovah-Raah: The LORD My Shepherd',
   'Behold, the Lord GOD will come with strong hand, and his arm shall rule for him: behold, his reward is with him, and his work before him. He shall feed his flock like a shepherd: he shall gather the lambs with his arm, and carry them in his bosom, and shall gently lead those that are with young.',
   '["Psalm 23:1", "John 10:11"]',
   'Jehovah-Raah, my Shepherd, gather me when I stray and carry me when I am too weak to walk. Lead me gently today, at the pace You know I can bear. Amen.',
   'Where are you exhausted from trying to lead yourself? Picture the Shepherd carrying you today, and let one decision be surrendered to His leading rather than your striving.',
   'Isaiah pairs God''s ruling arm with His carrying arm in a single breath. How does it change your view of God''s power to know it is used to carry the weak gently?',
   'Isaiah 40 was written to exiles who felt abandoned. Into that despair God reveals Himself not first as ruler but as Shepherd — strength expressed as tenderness.',
   true
  ),
  (7,
   'Jehovah-Nissi: The LORD My Banner',
   'And Moses built an altar, and called the name of it Jehovahnissi: For he said, Because the LORD hath sworn that the LORD will have war with Amalek from generation to generation.',
   '["Exodus 17:11-13", "2 Corinthians 2:14"]',
   'Jehovah-Nissi, You are the banner I rally under. When I am tempted to fight my battles alone, remind me that the victory is Yours and my place is beneath Your standard. Amen.',
   'Name a battle you are facing. Rather than strategizing first, begin today by lifting it to God in prayer — raising the banner before raising your own hands.',
   'Israel prevailed only while Moses'' hands were lifted, held up by others. Who helps hold up your hands in the long battles — and whose hands can you help hold today?',
   'A "banner" (Hebrew nes) was the standard an army rallied around and could see from afar. Moses names God Himself as that rallying point after the victory over Amalek.',
   false
  )
) AS v(day_number, day_title, passage_text, passage_refs, prayer, application, question, context_note, is_memory_verse)
WHERE p.slug = 'names-of-god'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- The Names of God — comprehension check questions (all 7 days).
UPDATE reading_plan_entries e
SET
  quiz_question    = v.question,
  quiz_options     = v.options,
  quiz_explanation = v.explanation
FROM reading_plans p,
(VALUES
  (1,
   'What is the first thing Scripture tells us Elohim does?',
   '[{"label":"A","text":"He speaks His law","correct":false},{"label":"B","text":"He creates","correct":true},{"label":"C","text":"He judges","correct":false}]',
   'Genesis 1:1 opens with action: "In the beginning God created." Before any attribute is named, Elohim is revealed as the Maker of everything that exists.'
  ),
  (2,
   'Who gave God the name El Roi, "the God who sees me"?',
   '[{"label":"A","text":"Abraham","correct":false},{"label":"B","text":"Moses","correct":false},{"label":"C","text":"Hagar","correct":true}]',
   'Hagar, an overlooked Egyptian slave, is the only person in Scripture to give God a name — El Roi — after He met her in the wilderness.'
  ),
  (3,
   'What did God provide on the mountain in place of Abraham''s son?',
   '[{"label":"A","text":"A ram caught in a thicket","correct":true},{"label":"B","text":"A dove","correct":false},{"label":"C","text":"A lamb from the flock","correct":false}]',
   'Abraham saw "a ram caught in a thicket by his horns" and offered it in his son''s place, then named the place Jehovah-Jireh, the LORD will provide.'
  ),
  (4,
   'Where did God reveal Himself as Jehovah-Rapha, the LORD who heals?',
   '[{"label":"A","text":"At the Red Sea","correct":false},{"label":"B","text":"At the bitter waters of Marah","correct":true},{"label":"C","text":"On Mount Sinai","correct":false}]',
   'Three days past the Red Sea, Israel found only bitter water at Marah. There God made it sweet and declared, "I am the LORD that healeth thee."'
  ),
  (5,
   'How old was Abram when God appeared to him as El Shaddai?',
   '[{"label":"A","text":"Seventy-five","correct":false},{"label":"B","text":"Ninety-nine","correct":true},{"label":"C","text":"One hundred twenty","correct":false}]',
   'Genesis 17:1 says Abram was "ninety years old and nine" — long past natural hope of a child — when God revealed Himself as God Almighty, the all-sufficient One.'
  ),
  (6,
   'In Isaiah 40:11, how does the LORD the Shepherd treat the lambs?',
   '[{"label":"A","text":"He drives them forward","correct":false},{"label":"B","text":"He gathers and carries them","correct":true},{"label":"C","text":"He leaves them to follow","correct":false}]',
   'Isaiah says He "shall gather the lambs with his arm, and carry them in his bosom, and shall gently lead" — power expressed as tenderness toward the weak.'
  ),
  (7,
   'What does the name Jehovah-Nissi mean?',
   '[{"label":"A","text":"The LORD my Peace","correct":false},{"label":"B","text":"The LORD my Banner","correct":true},{"label":"C","text":"The LORD my Rock","correct":false}]',
   'Moses named the altar Jehovah-Nissi, "the LORD my Banner" — the rallying standard His people gather under — after the victory over Amalek.'
  )
) AS v(day_number, question, options, explanation)
WHERE p.slug = 'names-of-god'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- The Names of God — word studies (the Hebrew name for each day).
UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (1, '{"god":{"original":"אֱלֹהִים","transliteration":"Elohim","definition":"God, the Creator — a plural form used with singular verbs, expressing majesty and fullness. The name emphasizes God''s power and sovereignty over all He has made.","refs":["Genesis 1:1","Deuteronomy 10:17"]}}'),
  (2, '{"seest":{"original":"אֵל רֳאִי","transliteration":"El Roi","definition":"The God who sees me. Roi comes from ra''ah, to see or perceive. God is the One whose attentive gaze reaches the overlooked and the hidden.","refs":["Genesis 16:13","Psalm 139:1-4"]}}'),
  (3, '{"jehovahjireh":{"original":"יְהוָה יִרְאֶה","transliteration":"Yahweh Yireh","definition":"The LORD will provide — literally, the LORD will see to it. Provision and seeing share the same root: God provides because He sees the need ahead of time.","refs":["Genesis 22:14","Philippians 4:19"]}}'),
  (4, '{"healeth":{"original":"יְהוָה רֹפְאֶךָ","transliteration":"Yahweh Rapha","definition":"The LORD who heals. Rapha means to mend, restore, or make whole — used of physical healing and of God restoring what is broken in body, soul, and nation.","refs":["Exodus 15:26","Psalm 103:3"]}}'),
  (5, '{"almighty":{"original":"אֵל שַׁדַּי","transliteration":"El Shaddai","definition":"God Almighty, God all-sufficient. Often linked to the idea of overflowing supply — the God who is enough when human strength has run out.","refs":["Genesis 17:1","Genesis 35:11"]}}'),
  (6, '{"shepherd":{"original":"רָעָה","transliteration":"raah","definition":"To shepherd, to tend, to feed. The verb behind Jehovah-Raah (Psalm 23:1) — it pictures the constant, caring work of a shepherd toward a flock that cannot guide itself.","refs":["Psalm 23:1","Ezekiel 34:11-12"]}}'),
  (7, '{"jehovahnissi":{"original":"נִסִּי","transliteration":"nissi","definition":"My banner or standard (from nes). The raised pole an army rallied around and could see from far off. God Himself is the banner His people gather beneath.","refs":["Exodus 17:15","Isaiah 11:10"]}}')
) AS v(day_number, ws)
WHERE p.slug = 'names-of-god'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- The Names of God — dig deeper commentary (days 1, 4, 7).
UPDATE reading_plan_entries e
SET
  deep_dive_text = v.text,
  deep_dive_refs = v.refs
FROM reading_plans p,
(VALUES
  (1,
   'The very first sentence of the Bible makes a claim that shapes everything after it: reality is not an accident. Elohim (אֱלֹהִים) is grammatically plural, yet Genesis 1 pairs it with singular verbs — "God created," not "the gods created." Hebrew scholars call this a plural of majesty, a way of expressing fullness and greatness beyond what a singular form could hold. Christians have long seen in it a whisper of what is later revealed: the Father speaking, the Spirit hovering over the waters (v.2), and the Word through whom all things were made (John 1:1-3, Colossians 1:16). Notice also how God creates — not by struggle or by shaping pre-existing matter, as the surrounding creation myths described, but by speech. "And God said... and there was." The universe is spoken, not wrestled into being. That has a pastoral edge: the same voice that ordered galaxies can speak order into a chaotic life. Where you see formlessness and void today, the Creator is not intimidated. He has done His best work in exactly such places.',
   '["John 1:1-3", "Colossians 1:16-17"]'
  ),
  (4,
   'Jehovah-Rapha (יְהוָה רֹפְאֶךָ) is revealed at Marah, where water that should have refreshed instead turned bitter (Exodus 15:22-26). The setting matters. God does not announce Himself as Healer beside a clear spring but beside undrinkable water, only three days after the greatest deliverance in Israel''s history. The lesson is that rescue and disappointment can sit close together, and God is Lord of both. The Hebrew rapha means to mend, to stitch, to restore — it is used of repairing an altar, healing a body, and restoring a broken people. Crucially, the healing at Marah came through a tree that Moses cast into the water (v.25), an image the church has long read as a foreshadowing of the cross, where "by his wounds we are healed" (1 Peter 2:24, Isaiah 53:5). Not every healing in this life is physical or immediate; Paul carried a thorn God chose not to remove (2 Corinthians 12:7-9). But the name holds: the trajectory of everyone under Jehovah-Rapha is toward wholeness, even when the final healing waits for the world made new.',
   '["Isaiah 53:4-5", "Revelation 21:4"]'
  ),
  (7,
   'Jehovah-Nissi (יְהוָה נִסִּי) closes this journey through the names, and it gathers the others into a posture. The battle against Amalek (Exodus 17:8-16) is strange: Israel prevailed only while Moses held up his hands, and when his arms grew heavy, Aaron and Hur held them up on either side. The victory was real, but it was never Israel''s achievement — it flowed from lifted hands, sustained by community, directed upward. A nes was the standard raised on a hill so a scattered army could find its rallying point; to name God your banner is to say that He, not your strategy or your strength, is what you gather around and fight beneath. Paul later picks up the same military image and turns it into a procession: "thanks be unto God, which always causeth us to triumph in Christ" (2 Corinthians 2:14). The names build to this. Elohim made you, El Roi sees you, Jehovah-Jireh provides for you, Jehovah-Rapha heals you, El Shaddai is enough for you, Jehovah-Raah shepherds you — and Jehovah-Nissi is the standard over it all. Knowing God''s name is not trivia; it is learning where to run in every kind of trouble.',
   '["Exodus 17:8-16", "2 Corinthians 2:14"]'
  )
) AS v(day_number, text, refs)
WHERE p.slug = 'names-of-god'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Holy Week (7 days) — base entries. Seasonal (season_key 'holy-week').
-- Content run 2026-07-02. Palm Sunday through Easter morning.
-- Idempotent: inserted only when the plan has zero entries.
-- ============================================================
INSERT INTO reading_plan_entries (plan_id, day_number, verse_ref, reflection, created_at)
SELECT p.id, v.day_number, v.verse_ref, v.reflection, NOW()
FROM reading_plans p,
(VALUES
  (1, 'Luke 19:37-40',  'The crowd hailed Jesus as King as He rode into Jerusalem on a borrowed colt — not a war horse. The praise was real, yet within days many of these same voices would fall silent. He received the worship knowing exactly what the week would hold.'),
  (2, 'Mark 11:15-17',  'Jesus'' first public act in the temple was not to teach but to cleanse. Zeal for His Father''s house overturned both the money-changers'' tables and everyone''s expectations. Worship had become commerce, and He would not let it stand.'),
  (3, 'Mark 12:28-31',  'Asked to name the greatest commandment, Jesus refused to separate love for God from love for neighbor. The whole law hangs on these two loves held together — the vertical and the horizontal, never one without the other.'),
  (4, 'Mark 14:3-9',    'While religious leaders plotted His death, an unnamed woman poured out a year''s wages in worship. Jesus called it a beautiful thing, done for His burial. Extravagant love always looks like waste to those who are only calculating.'),
  (5, 'Luke 22:19-20',  'On the night He was betrayed, Jesus took bread and wine and gave them new meaning: His body broken, His blood poured out. The new covenant would be sealed not in ceremony but in sacrifice — and remembered at every table since.'),
  (6, 'Luke 23:33-46',  'At Calvary the King wore thorns. Jesus prayed forgiveness over the very hands that nailed Him. When He gave up His spirit, the temple veil tore from top to bottom — the barrier between God and humanity opened from heaven''s side.'),
  (7, 'Luke 24:1-6',    'The women came to anoint a body and found an empty tomb. "Why seek ye the living among the dead?" The stone was not rolled away to let Jesus out, but to let the world see in. He is not here — He is risen.')
) AS v(day_number, verse_ref, reflection)
WHERE p.slug = 'holy-week'
  AND NOT EXISTS (SELECT 1 FROM reading_plan_entries WHERE plan_id = p.id);

-- Holy Week — text, titles, passages, prayer, application, question, context, memory flags.
UPDATE reading_plan_entries e
SET
  day_title       = v.day_title,
  passage_text    = v.passage_text,
  passage_refs    = v.passage_refs,
  prayer          = v.prayer,
  application     = v.application,
  question        = v.question,
  context_note    = v.context_note,
  content_type    = 'passage',
  is_memory_verse = v.is_memory_verse
FROM reading_plans p,
(VALUES
  (1,
   'The King on a Colt',
   'And when he was come nigh, even now at the descent of the mount of Olives, the whole multitude of the disciples began to rejoice and praise God with a loud voice for all the mighty works that they had seen; Saying, Blessed be the King that cometh in the name of the Lord: peace in heaven, and glory in the highest. And some of the Pharisees from among the multitude said unto him, Master, rebuke thy disciples. And he answered and said unto them, I tell you that, if these should hold their peace, the stones would immediately cry out.',
   '["Zechariah 9:9", "Psalm 118:26"]',
   'King Jesus, You entered Jerusalem knowing the cross awaited. Teach me to worship You for who You are, not only for what I hope You will do. Let my praise hold even when the road turns hard. Amen.',
   'Begin Holy Week by naming Jesus as King over one specific area of your life you have been quietly running yourself. Hand Him the reins there today.',
   'The crowds praised Jesus for the "mighty works" they had seen. How does your worship change when it is rooted in His character rather than in your circumstances?',
   'Jesus deliberately fulfilled Zechariah 9:9 by riding a colt — the mount of a king coming in peace, not a war horse. The crowd''s cry echoed Psalm 118, a psalm sung at Passover.',
   false
  ),
  (2,
   'Cleansing the Temple',
   'And they come to Jerusalem: and Jesus went into the temple, and began to cast out them that sold and bought in the temple, and overthrew the tables of the moneychangers, and the seats of them that sold doves; And would not suffer that any man should carry any vessel through the temple. And he taught, saying unto them, Is it not written, My house shall be called of all nations the house of prayer? but ye have made it a den of thieves.',
   '["Isaiah 56:7", "John 2:17"]',
   'Lord, You are jealous for true worship. Search the temple of my own heart and overturn whatever I have let crowd out prayer. Make me a house of prayer, not a marketplace. Amen.',
   'Identify one thing that has quietly turned your devotional life into a transaction — a box to check, a bargain with God. Name it and clear the table today.',
   'Jesus was angriest at religion that exploited the poor and blocked access to God. What "tables" in your own spiritual life might He want to overturn?',
   'The money-changers and dove-sellers operated in the Court of the Gentiles — the one place non-Jews could pray. Their commerce literally crowded out the nations Jesus said the temple was for.',
   false
  ),
  (3,
   'The Greatest Commandment',
   'And one of the scribes came, and having heard them reasoning together, and perceiving that he had answered them well, asked him, Which is the first commandment of all? And Jesus answered him, The first of all the commandments is, Hear, O Israel; The Lord our God is one Lord: And thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind, and with all thy strength: this is the first commandment. And the second is like, namely this, Thou shalt love thy neighbour as thyself. There is none other commandment greater than these.',
   '["Deuteronomy 6:4-5", "1 John 4:20-21"]',
   'Father, You ask for my whole heart, soul, mind, and strength — and then send me to my neighbor. Unite these two loves in me so that loving You overflows into loving the people right in front of me. Amen.',
   'Pick one person who is hard for you to love. Do one concrete, unrequested act of kindness for them today as an expression of loving God.',
   'Jesus binds love for God and love for neighbor into a single command. Which of the two comes harder for you right now, and why?',
   'Jesus quotes the Shema (Deuteronomy 6:4-5), the prayer every faithful Jew recited daily, then joins it to Leviticus 19:18 — welding worship and ethics into one inseparable whole.',
   false
  ),
  (4,
   'The Extravagant Offering',
   'And being in Bethany in the house of Simon the leper, as he sat at meat, there came a woman having an alabaster box of ointment of spikenard very precious; and she brake the box, and poured it on his head. And there were some that had indignation within themselves, and said, Why was this waste of the ointment made? And they murmured against her. And Jesus said, Let her alone; why trouble ye her? she hath wrought a good work on me. She hath done what she could: she is come aforehand to anoint my body to the burying. Verily I say unto you, Wheresoever this gospel shall be preached throughout the whole world, this also that she hath done shall be spoken of for a memorial of her.',
   '["John 12:3", "2 Corinthians 8:9"]',
   'Jesus, teach me the freedom of extravagant love that does not count the cost. Where I have been cautious with You, let me break the jar and pour it out. You are worth it. Amen.',
   'Do one thing for God today that others might call impractical — a gift, an hour, an act of worship that makes no strategic sense except love.',
   'The onlookers saw waste; Jesus saw worship. Where in your life has caution masqueraded as wisdom when love was actually being called for?',
   'Spikenard was imported from India; the alabaster jar held roughly a year''s wages. Breaking the neck of the jar meant it could never be resealed — the gift was total and irreversible.',
   false
  ),
  (5,
   'The Last Supper',
   'And he took bread, and gave thanks, and brake it, and gave unto them, saying, This is my body which is given for you: this do in remembrance of me. Likewise also the cup after supper, saying, This cup is the new testament in my blood, which is shed for you.',
   '["1 Corinthians 11:23-26", "Jeremiah 31:31-34"]',
   'Lord Jesus, at Your table I remember that Your body was broken and Your blood poured out for me. Let this not become routine. Feed my soul afresh on Your sacrifice today. Amen.',
   'Pause before your next meal and take the bread slowly, deliberately, remembering His body given for you. Let one ordinary meal become an act of remembrance.',
   'Jesus turned a memorial of the exodus into a memorial of Himself. What does it mean to you that He asked to be remembered specifically through His broken body and shed blood?',
   'Jesus reinterpreted the Passover meal — Israel''s memorial of rescue from Egypt — around Himself, inaugurating the new covenant Jeremiah had promised centuries earlier.',
   true
  ),
  (6,
   'The Torn Veil',
   'And when they were come to the place, which is called Calvary, there they crucified him, and the malefactors, one on the right hand, and the other on the left. Then said Jesus, Father, forgive them; for they know not what they do. And they parted his raiment, and cast lots. And it was about the sixth hour, and there was a darkness over all the earth until the ninth hour. And the sun was darkened, and the veil of the temple was rent in the midst. And when Jesus had cried with a loud voice, he said, Father, into thy hands I commend my spirit: and having said thus, he gave up the ghost.',
   '["Hebrews 10:19-20", "Isaiah 53:5"]',
   'Jesus, from the cross You forgave. The veil is torn and the way to the Father is open because of Your sacrifice. I come boldly now, only because You bled. Thank You. Amen.',
   'Sit for five minutes in silence before the cross today. Do not rush to Easter. Let the weight of what it cost Him rest on you before the joy of Sunday.',
   'The veil that separated the Holy of Holies was torn from top to bottom — from God''s side down. What does it mean to you that God Himself removed the barrier?',
   'The temple veil was a heavy curtain separating the Most Holy Place, where God''s presence dwelt, from everyone else. Its tearing at the moment of Jesus'' death signaled open access to God for all.',
   false
  ),
  (7,
   'He Is Risen',
   'Now upon the first day of the week, very early in the morning, they came unto the sepulchre, bringing the spices which they had prepared, and certain others with them. And they found the stone rolled away from the sepulchre. And they entered in, and found not the body of the Lord Jesus. And it came to pass, as they were much perplexed thereabout, behold, two men stood by them in shining garments: And as they were afraid, and bowed down their faces to the earth, they said unto them, Why seek ye the living among the dead? He is not here, but is risen.',
   '["1 Corinthians 15:20", "Romans 6:9"]',
   'Risen Lord, the tomb is empty and death is undone. Let the power that raised You from the grave raise every dead and hopeless place in me. He is risen — He is risen indeed. Amen.',
   'Tell one person today the simple news the angels gave: He is risen. Let the week end not in private reflection but in shared, spoken joy.',
   'The women expected a corpse and met a resurrection. Where are you still bringing spices to a tomb — grieving something God may be about to raise?',
   'The women came to complete a burial, not to witness a resurrection. Their bewilderment is the honest starting point of Easter faith: the empty tomb made no sense until the risen Christ explained it.',
   true
  )
) AS v(day_number, day_title, passage_text, passage_refs, prayer, application, question, context_note, is_memory_verse)
WHERE p.slug = 'holy-week'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Holy Week — comprehension check questions (all 7 days).
UPDATE reading_plan_entries e
SET
  quiz_question    = v.question,
  quiz_options     = v.options,
  quiz_explanation = v.explanation
FROM reading_plans p,
(VALUES
  (1,
   'According to Jesus, what would happen if the crowd fell silent?',
   '[{"label":"A","text":"The disciples would be scattered","correct":false},{"label":"B","text":"The stones would cry out","correct":true},{"label":"C","text":"The Pharisees would rejoice","correct":false}]',
   'Jesus said "if these should hold their peace, the stones would immediately cry out" — creation itself would praise the King the crowds hailed.'
  ),
  (2,
   'What did Jesus say the temple was meant to be called?',
   '[{"label":"A","text":"A house of prayer","correct":true},{"label":"B","text":"A house of sacrifice","correct":false},{"label":"C","text":"A house of teaching","correct":false}]',
   'Quoting Isaiah 56:7, Jesus said "My house shall be called of all nations the house of prayer" — but it had been made "a den of thieves."'
  ),
  (3,
   'To what second command did Jesus join "love the Lord your God"?',
   '[{"label":"A","text":"Honor your father and mother","correct":false},{"label":"B","text":"Love your neighbour as yourself","correct":true},{"label":"C","text":"Keep the Sabbath holy","correct":false}]',
   'Jesus said the second is like the first: "Thou shalt love thy neighbour as thyself. There is none other commandment greater than these."'
  ),
  (4,
   'How did Jesus describe the woman''s anointing at Bethany?',
   '[{"label":"A","text":"A waste of costly ointment","correct":false},{"label":"B","text":"A good work, done for His burial","correct":true},{"label":"C","text":"A gift for the poor","correct":false}]',
   'Against the critics, Jesus said "she hath wrought a good work on me... she is come aforehand to anoint my body to the burying."'
  ),
  (5,
   'What did Jesus say the cup represented at the Last Supper?',
   '[{"label":"A","text":"The old covenant renewed","correct":false},{"label":"B","text":"The new testament in His blood","correct":true},{"label":"C","text":"The Passover of Egypt","correct":false}]',
   'Jesus said "This cup is the new testament in my blood, which is shed for you" — sealing a new covenant through His own sacrifice.'
  ),
  (6,
   'What happened to the temple veil at the moment of Jesus'' death?',
   '[{"label":"A","text":"It was drawn shut","correct":false},{"label":"B","text":"It was rent in the midst","correct":true},{"label":"C","text":"It caught fire","correct":false}]',
   'Luke records "the veil of the temple was rent in the midst" — the barrier to God''s presence torn open at the instant Christ died.'
  ),
  (7,
   'What did the two men in shining garments tell the women at the tomb?',
   '[{"label":"A","text":"He is not here, but is risen","correct":true},{"label":"B","text":"He has gone before you to Galilee","correct":false},{"label":"C","text":"Do not touch him","correct":false}]',
   'They asked "Why seek ye the living among the dead?" and declared "He is not here, but is risen" — the heart of the Easter message.'
  )
) AS v(day_number, question, options, explanation)
WHERE p.slug = 'holy-week'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Holy Week — word studies (a key word from each day''s passage).
UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (1, '{"blessed":{"original":"εὐλογημένος","transliteration":"eulogēmenos","definition":"Spoken well of, praised, blessed. From eu (well) and logos (word) — to invoke good upon someone. The crowd blesses the King who comes in the LORD''s name.","refs":["Psalm 118:26","Luke 19:38"]}}'),
  (2, '{"prayer":{"original":"προσευχή","transliteration":"proseuchē","definition":"Prayer directed to God; by extension, a place of prayer. Jesus insists the temple''s defining purpose is communion with God, not commerce.","refs":["Isaiah 56:7","Mark 11:17"]}}'),
  (3, '{"love":{"original":"ἀγαπάω","transliteration":"agapaō","definition":"To love with the will as well as the affections — a deliberate, self-giving love that seeks the good of the other. The word for loving both God and neighbor.","refs":["Deuteronomy 6:5","Mark 12:30"]}}'),
  (4, '{"memorial":{"original":"μνημόσυνον","transliteration":"mnēmosynon","definition":"A remembrance, a memorial — something done that keeps a person or act alive in memory. Jesus promises the woman''s worship will be told wherever the gospel goes.","refs":["Mark 14:9","Acts 10:4"]}}'),
  (5, '{"remembrance":{"original":"ἀνάμνησις","transliteration":"anamnēsis","definition":"A calling to mind, a memorial re-enactment. More than recollection — it makes a past reality present. Jesus asks to be remembered this way at every table.","refs":["Luke 22:19","1 Corinthians 11:24"]}}'),
  (6, '{"forgive":{"original":"ἀφίημι","transliteration":"aphiēmi","definition":"To send away, release, cancel a debt. The word for forgiveness pictures a burden let go. Jesus releases His executioners even as they crucify Him.","refs":["Luke 23:34","Matthew 6:12"]}}'),
  (7, '{"risen":{"original":"ἐγείρω","transliteration":"egeirō","definition":"To wake, to raise up, to rise from the dead. The verb of resurrection — used throughout the New Testament for God raising Jesus and, one day, all who are His.","refs":["Luke 24:6","1 Corinthians 15:20"]}}')
) AS v(day_number, ws)
WHERE p.slug = 'holy-week'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Holy Week — dig deeper commentary (days 5, 6, 7).
UPDATE reading_plan_entries e
SET
  deep_dive_text = v.text,
  deep_dive_refs = v.refs
FROM reading_plans p,
(VALUES
  (5,
   'When Jesus lifted the bread and said "this is my body," He was sitting at a Passover table saturated with meaning. For over a thousand years, Jewish families had eaten this meal to remember the night the angel of death passed over Egypt and God led their ancestors out of slavery (Exodus 12). Every element pointed backward to that rescue. Then Jesus did something startling: He made the meal point to Himself. The unleavened bread of affliction became His body "given for you"; the cup of redemption became "the new testament in my blood." The exodus had rescued a nation from Pharaoh; this new exodus would rescue humanity from sin and death. The word He used, anamnēsis ("remembrance"), does not mean merely recalling a fact. In Hebrew worship, to remember was to make a past reality present and active. Every time the church breaks bread, it is not staging a reenactment but participating afresh in the one sacrifice that saves. Jeremiah had promised a coming day when God would write His law on hearts and remember sins no more (Jeremiah 31:31-34). At this table, that day arrived.',
   '["Exodus 12:21-27", "Jeremiah 31:31-34"]'
  ),
  (6,
   'Two details in Luke''s account of the crucifixion carry enormous theological weight. The first is Jesus'' prayer: "Father, forgive them; for they know not what they do." He does not wait until the pain is over to forgive; He forgives in the act of being killed, interceding for His executioners while the nails are still being driven. This is the love of God on display at its most costly — not sentiment but sacrifice. The second is the torn veil. The curtain before the Most Holy Place was, by tradition, a hand''s-breadth thick, woven so densely that horses tied to each side could not pull it apart. It existed to keep sinful humanity at a distance from the holy presence of God; only the high priest could pass through it, and only once a year, with sacrificial blood. At the instant Jesus died, that veil "was rent in the midst" — and Matthew notes it tore from top to bottom, from God''s side down, not man''s. The message is unmistakable: the barrier is gone, torn by God Himself. Hebrews later names Jesus'' own flesh as the new and living way opened through the veil (Hebrews 10:19-20). The access we have to the Father in prayer was purchased at Calvary.',
   '["Hebrews 10:19-22", "Isaiah 53:4-6"]'
  ),
  (7,
   'The resurrection is the hinge on which the entire Christian faith turns, and the Gospel writers report it with a striking, almost awkward honesty: the first witnesses did not expect it. The women came at dawn "bringing the spices which they had prepared" — they were planning to finish a burial, not to celebrate a rising. Their perplexity, their fear, their bowed faces are not the marks of people inventing a triumphant legend but of people confronted by something that shattered their categories. The angels'' question — "Why seek ye the living among the dead?" — gently rebukes a grief that had already written the ending. Paul would later stake everything on this event: "if Christ be not raised, your faith is vain" (1 Corinthians 15:17). But he also calls the risen Christ "the firstfruits of them that slept" (15:20) — the first sheaf of a harvest still coming. The empty tomb is not only a fact about Jesus; it is a promise about everyone united to Him. Death, Paul says, no longer has dominion over Him (Romans 6:9) — and therefore its grip on His people has been broken too. Easter is the announcement that the worst thing is never the last thing.',
   '["1 Corinthians 15:17-22", "Romans 6:8-11"]'
  )
) AS v(day_number, text, refs)
WHERE p.slug = 'holy-week'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Pentecost: Breath of Fire (7 days) — base entries.
-- Seasonal (season_key 'pentecost'). Content run 2026-07-02.
-- The coming of the Holy Spirit and the birth of the Church.
-- Idempotent: inserted only when the plan has zero entries.
-- ============================================================
INSERT INTO reading_plan_entries (plan_id, day_number, verse_ref, reflection, created_at)
SELECT p.id, v.day_number, v.verse_ref, v.reflection, NOW()
FROM reading_plans p,
(VALUES
  (1, 'John 14:16-17',  'Before He left, Jesus promised not to leave His followers as orphans. The Father would send another Comforter — the Spirit of truth — to abide with them forever. What Jesus had been beside them, the Spirit would now be within them.'),
  (2, 'Acts 1:8-9',     'Jesus told the disciples to wait. Power was coming, but not yet. Then a cloud received Him from their sight. The waiting between promise and fulfillment is often where faith is forged and expectation is stretched.'),
  (3, 'Acts 2:1-4',     'When Pentecost came, the Spirit arrived like wind and fire — unmistakable, uncontainable. The same Spirit that hovered over creation now filled ordinary people and set them speaking the wonders of God in every language under heaven.'),
  (4, 'Acts 2:38-41',   'Peter, who had denied Jesus only weeks before, now preached without fear — and three thousand were added in a single day. The Spirit turns cowards into witnesses and a listening crowd into the living Church.'),
  (5, 'Acts 2:42-47',   'The first believers devoted themselves to teaching, fellowship, the breaking of bread, and prayer. The Spirit did not merely save individuals; He knit them into a community so close they shared everything they had.'),
  (6, 'Galatians 5:22-25','The surest evidence of the Spirit is not spectacle but character: love, joy, peace, patience. Fruit grows slowly, quietly, from the inside out. A Spirit-filled life looks less like fireworks and more like a tree in season.'),
  (7, 'Romans 8:14-16', 'The Spirit does not make us slaves cowering in fear but children crying "Abba, Father." He bears witness with our spirit that we truly belong to God. Our deepest identity is settled by His quiet voice within us.')
) AS v(day_number, verse_ref, reflection)
WHERE p.slug = 'pentecost-breath-of-fire'
  AND NOT EXISTS (SELECT 1 FROM reading_plan_entries WHERE plan_id = p.id);

-- Pentecost — text, titles, passages, prayer, application, question, context, memory flags.
UPDATE reading_plan_entries e
SET
  day_title       = v.day_title,
  passage_text    = v.passage_text,
  passage_refs    = v.passage_refs,
  prayer          = v.prayer,
  application     = v.application,
  question        = v.question,
  context_note    = v.context_note,
  content_type    = 'passage',
  is_memory_verse = v.is_memory_verse
FROM reading_plans p,
(VALUES
  (1,
   'The Promise of the Comforter',
   'And I will pray the Father, and he shall give you another Comforter, that he may abide with you for ever; Even the Spirit of truth; whom the world cannot receive, because it seeth him not, neither knoweth him: but ye know him; for he dwelleth with you, and shall be in you.',
   '["John 16:7", "Romans 8:9"]',
   'Father, thank You for the gift of Your Spirit who abides with me forever. Make me aware today of the Comforter who is not far off but dwells within me. Amen.',
   'Whenever you feel alone today, pause and quietly acknowledge the Spirit''s presence with a single sentence: "You are with me, and You are in me."',
   'Jesus calls the Spirit "another Comforter" — one just like Himself. How does it change your day to know God is not only with you but in you?',
   'The Greek word for "another" (allos) means another of the same kind. The Spirit is not a lesser substitute for Jesus but His very presence continued in every believer.',
   false
  ),
  (2,
   'Wait for the Power',
   'But ye shall receive power, after that the Holy Ghost is come upon you: and ye shall be witnesses unto me both in Jerusalem, and in all Judaea, and in Samaria, and unto the uttermost part of the earth. And when he had spoken these things, while they beheld, he was taken up; and a cloud received him out of their sight.',
   '["Luke 24:49", "Acts 2:33"]',
   'Lord, teach me to wait well. Where I am tempted to run ahead in my own strength, hold me until Your power comes. Make me a witness, not by force but by Your Spirit. Amen.',
   'Name one thing you have been trying to accomplish for God on willpower alone. Consciously wait on Him in prayer for it today before acting.',
   'The disciples were told to wait before they witnessed. Why do you think God so often calls us to wait before He empowers us?',
   'Jesus maps the mission outward — Jerusalem, Judea, Samaria, the ends of the earth — an outline the book of Acts then follows exactly. The Spirit''s power is given for witness, not comfort alone.',
   false
  ),
  (3,
   'Wind and Fire',
   'And when the day of Pentecost was fully come, they were all with one accord in one place. And suddenly there came a sound from heaven as of a rushing mighty wind, and it filled all the house where they were sitting. And there appeared unto them cloven tongues like as of fire, and it sat upon each of them. And they were all filled with the Holy Ghost, and began to speak with other tongues, as the Spirit gave them utterance.',
   '["Joel 2:28-29", "Acts 1:5"]',
   'Holy Spirit, fill me as You filled the waiting disciples. Blow through the shut rooms of my heart and set a holy fire in me for the glory of God. Amen.',
   'Ask God to fill you afresh with His Spirit this morning — simply and expectantly. Then look for one specific prompting to obey during the day.',
   'The Spirit came on all of them, not just the leaders. What does it mean to you that God poured out His Spirit on ordinary believers without distinction?',
   'Wind (ruach/pneuma) and fire were ancient signs of God''s presence — at Sinai, in the burning bush. At Pentecost they rest on each believer, marking the whole people as God''s dwelling.',
   true
  ),
  (4,
   'The Church Is Born',
   'Then Peter said unto them, Repent, and be baptized every one of you in the name of Jesus Christ for the remission of sins, and ye shall receive the gift of the Holy Ghost. For the promise is unto you, and to your children, and to all that are afar off, even as many as the Lord our God shall call. Then they that gladly received his word were baptized: and the same day there were added unto them about three thousand souls.',
   '["Acts 2:14-21", "Ephesians 2:19-22"]',
   'Lord, the same Spirit who emboldened Peter lives in me. Give me courage to speak of Jesus when the moment comes, and trust You for the harvest. Amen.',
   'Pray by name for one person who does not yet know Christ. Ask the Spirit for one natural opportunity to point them toward Jesus this week.',
   'Peter had denied Jesus three times; here he preaches to thousands. What does his transformation tell you about what the Spirit can do with your failures?',
   'Peter''s sermon interprets Pentecost through Joel''s prophecy of the Spirit poured out on all flesh. The "three thousand" mirrors the exodus — but where the law once brought death, the Spirit now brings life.',
   false
  ),
  (5,
   'The Fellowship of Believers',
   'And they continued stedfastly in the apostles'' doctrine and fellowship, and in breaking of bread, and in prayers. And fear came upon every soul: and many wonders and signs were done by the apostles. And all that believed were together, and had all things common; And sold their possessions and goods, and parted them to all men, as every man had need. And they, continuing daily with one accord in the temple, and breaking bread from house to house, did eat their meat with gladness and singleness of heart, Praising God, and having favour with all the people. And the Lord added to the church daily such as should be saved.',
   '["Hebrews 10:24-25", "1 John 1:7"]',
   'Father, save me from a private faith. Weave me into Your people — to learn, to break bread, to pray, and to share. Make me a giver, not only a receiver. Amen.',
   'Do one tangible thing for your church community today: a message of encouragement, a shared meal, a met need, a prayer for someone by name.',
   'The early church shared teaching, table, prayer, and possessions. Which of these four marks is most missing from your own life with other believers?',
   'Luke lists four devotions — doctrine, fellowship, breaking of bread, prayer — as the DNA of the Spirit-born church. Generosity was not commanded but overflowed naturally from shared life.',
   false
  ),
  (6,
   'The Fruit of the Spirit',
   'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law. And they that are Christ''s have crucified the flesh with the affections and lusts. If we live in the Spirit, let us also walk in the Spirit.',
   '["John 15:4-5", "Ephesians 5:9"]',
   'Spirit of God, grow Your fruit in me. Where I am impatient, unkind, or unruled, produce what I cannot manufacture myself. Let my character quietly testify to Your work. Amen.',
   'Pick the one fruit you most lack right now. Ask the Spirit to grow it, then choose one concrete action today that practices it deliberately.',
   'Paul calls it the "fruit" (singular) of the Spirit, not "fruits." How does seeing these nine qualities as one cluster change how you pursue them?',
   'Fruit grows from within by the life of the plant, not by external effort. Paul contrasts it with the "works" of the flesh — the Spirit produces character; striving only imitates it.',
   true
  ),
  (7,
   'The Spirit of Adoption',
   'For as many as are led by the Spirit of God, they are the sons of God. For ye have not received the spirit of bondage again to fear; but ye have received the Spirit of adoption, whereby we cry, Abba, Father. The Spirit itself beareth witness with our spirit, that we are the children of God.',
   '["Galatians 4:6-7", "1 John 3:1"]',
   'Abba, Father, by Your Spirit I know I am Yours — not a slave, but a beloved child. Quiet every fear with the assurance of belonging. Let me live today as one who is fully adopted. Amen.',
   'When fear or striving to earn approval rises today, answer it out loud with the truth of your identity: "I am a child of God, and the Spirit says so."',
   'The Spirit lets us cry "Abba" — an intimate, family word. Where does fear still make you relate to God as a slave rather than a child?',
   'Adoption in the Roman world granted full legal sonship, inheritance included, irrevocably. Paul says the Spirit Himself confirms this new status — belonging is not something we achieve but receive.',
   false
  )
) AS v(day_number, day_title, passage_text, passage_refs, prayer, application, question, context_note, is_memory_verse)
WHERE p.slug = 'pentecost-breath-of-fire'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Pentecost — comprehension check questions (all 7 days).
UPDATE reading_plan_entries e
SET
  quiz_question    = v.question,
  quiz_options     = v.options,
  quiz_explanation = v.explanation
FROM reading_plans p,
(VALUES
  (1,
   'How does Jesus describe the Comforter the Father will send?',
   '[{"label":"A","text":"The Spirit of truth","correct":true},{"label":"B","text":"The Spirit of judgment","correct":false},{"label":"C","text":"The Spirit of the law","correct":false}]',
   'Jesus calls Him "the Spirit of truth" who will "abide with you for ever" — dwelling with the disciples and, He promises, in them.'
  ),
  (2,
   'What did Jesus say the disciples would receive when the Holy Ghost came?',
   '[{"label":"A","text":"Wealth","correct":false},{"label":"B","text":"Power","correct":true},{"label":"C","text":"Rest","correct":false}]',
   '"Ye shall receive power, after that the Holy Ghost is come upon you" — power specifically to be His witnesses to the ends of the earth.'
  ),
  (3,
   'What two signs accompanied the Spirit''s coming at Pentecost?',
   '[{"label":"A","text":"Thunder and rain","correct":false},{"label":"B","text":"A rushing wind and tongues of fire","correct":true},{"label":"C","text":"An earthquake and light","correct":false}]',
   'There came "a rushing mighty wind" and "cloven tongues like as of fire" that sat upon each of them — and they were all filled with the Holy Ghost.'
  ),
  (4,
   'About how many were added to the church on the day of Peter''s sermon?',
   '[{"label":"A","text":"Three hundred","correct":false},{"label":"B","text":"One thousand","correct":false},{"label":"C","text":"Three thousand","correct":true}]',
   'Those who gladly received the word were baptized, and "the same day there were added unto them about three thousand souls."'
  ),
  (5,
   'To what four things did the first believers devote themselves?',
   '[{"label":"A","text":"Fasting, tithing, teaching, and travel","correct":false},{"label":"B","text":"Doctrine, fellowship, breaking of bread, and prayers","correct":true},{"label":"C","text":"Preaching, healing, building, and giving","correct":false}]',
   'They "continued stedfastly in the apostles'' doctrine and fellowship, and in breaking of bread, and in prayers" — the four marks of the Spirit-born church.'
  ),
  (6,
   'Paul says "the fruit of the Spirit is..." — which word does he use, singular or plural?',
   '[{"label":"A","text":"Fruit (singular)","correct":true},{"label":"B","text":"Fruits (plural)","correct":false},{"label":"C","text":"Gifts","correct":false}]',
   'Paul writes "the fruit of the Spirit is love, joy, peace..." — one cluster of qualities, grown together by the Spirit''s life within.'
  ),
  (7,
   'What intimate word does the Spirit of adoption let believers cry to God?',
   '[{"label":"A","text":"Lord","correct":false},{"label":"B","text":"Abba, Father","correct":true},{"label":"C","text":"Master","correct":false}]',
   'We have received "the Spirit of adoption, whereby we cry, Abba, Father" — a family word of belonging, not the language of a slave.'
  )
) AS v(day_number, question, options, explanation)
WHERE p.slug = 'pentecost-breath-of-fire'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Pentecost — word studies (a key word from each day''s passage).
UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (1, '{"comforter":{"original":"παράκλητος","transliteration":"paraklētos","definition":"One called alongside to help — an advocate, counselor, or helper. Used of the Holy Spirit and of Christ interceding for us. Jesus promises the Spirit as another of the same kind as Himself.","refs":["John 14:16","1 John 2:1"]}}'),
  (2, '{"power":{"original":"δύναμις","transliteration":"dunamis","definition":"Power, ability, might — the root of the word dynamite. Not raw force but Spirit-given capacity to do what we could never do alone, here aimed at bold witness.","refs":["Acts 1:8","Ephesians 3:20"]}}'),
  (3, '{"wind":{"original":"πνοή","transliteration":"pnoē","definition":"A blast of breath or wind, closely related to pneuma (spirit). At Pentecost the sound of rushing wind signals the Breath of God filling the house and its people.","refs":["Acts 2:2","Genesis 2:7"]}}'),
  (4, '{"repent":{"original":"μετανοέω","transliteration":"metanoeō","definition":"To change one''s mind and direction — a complete turning of the whole person toward God. Peter''s first call to the crowd is not to try harder but to turn.","refs":["Acts 2:38","Mark 1:15"]}}'),
  (5, '{"fellowship":{"original":"κοινωνία","transliteration":"koinōnia","definition":"Sharing, partnership, communion — holding things in common. More than friendly company, it is a shared life in the Spirit that reaches into possessions, prayer, and the table.","refs":["Acts 2:42","1 Corinthians 1:9"]}}'),
  (6, '{"fruit":{"original":"καρπός","transliteration":"karpos","definition":"Fruit — the natural produce of a living plant. Paul uses the singular: one integrated harvest of character grown by the Spirit, not manufactured by effort.","refs":["Galatians 5:22","John 15:5"]}}'),
  (7, '{"adoption":{"original":"υἱοθεσία","transliteration":"huiothesia","definition":"The placing of a son — the legal act granting full sonship and inheritance. Paul says the Spirit confirms believers as adopted children who may cry Abba, Father.","refs":["Romans 8:15","Galatians 4:5"]}}')
) AS v(day_number, ws)
WHERE p.slug = 'pentecost-breath-of-fire'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Pentecost — dig deeper commentary (days 3, 6, 7).
UPDATE reading_plan_entries e
SET
  deep_dive_text = v.text,
  deep_dive_refs = v.refs
FROM reading_plans p,
(VALUES
  (3,
   'Pentecost was already an ancient festival before the Spirit fell. Fifty days after Passover, Jews gathered in Jerusalem to celebrate the wheat harvest and, by the first century, to commemorate the giving of the law at Sinai. That backdrop makes the day''s events resonate. At Sinai, God descended in fire, the mountain shook, and the law was written on tablets of stone; three thousand died after the golden calf (Exodus 32:28). At this new Pentecost, God descends in fire again — but the fire rests on people, not a mountain, and the law is written not on stone but on hearts, exactly as Jeremiah and Ezekiel had promised (Jeremiah 31:33, Ezekiel 36:26-27). And instead of three thousand dying, three thousand are given life (Acts 2:41). The "rushing mighty wind" recalls the Hebrew ruach and Greek pneuma — both meaning breath, wind, and spirit. The same breath that God breathed into Adam (Genesis 2:7), that blew over the valley of dry bones (Ezekiel 37), now fills the church. The tongues of fire distributed to each believer signal something revolutionary: the presence of God, once confined to the temple''s inner room, now dwells in ordinary people. Every believer becomes a temple.',
   '["Jeremiah 31:31-34", "Ezekiel 36:26-27"]'
  ),
  (6,
   'Paul''s language is deliberate: he does not call these qualities the "works" of the Spirit but its "fruit." The distinction is everything. Works are produced by effort; fruit is produced by life. No apple tree strains to make apples — it bears them naturally because of what it is and what flows through it. Earlier in the same chapter Paul lists the "works of the flesh" (Galatians 5:19-21), a frantic catalog of things people do. Against that, the fruit of the Spirit is what a person becomes when the Spirit''s life flows uninterrupted. Notice, too, that "fruit" is singular. These are not nine separate virtues to be collected like badges but one integrated character — love expressing itself as joy, peace, patience, and the rest. Jesus had used the same image: "I am the vine, ye are the branches... without me ye can do nothing" (John 15:5). The branch''s only job is to stay connected. This reframes the whole spiritual life: the goal is not to squeeze out more patience by willpower but to abide, to stay attached to the source, and to let the Spirit produce what striving never could. Growth is real, but it is grown, not forced.',
   '["John 15:1-8", "Galatians 5:16-25"]'
  ),
  (7,
   'The word Paul reaches for to describe the believer''s standing is huiothesia — "adoption," literally "the placing of a son." In the Roman world an adopted son was not a second-class member of the family. The act was legally binding and irreversible; it transferred a person out of one household and into another, cancelling old debts and granting full rights of inheritance. Paul deliberately chooses this cultural image over mere forgiveness: God does not simply pardon offenders and leave them at arm''s length — He brings them into the family as heirs. The proof is experiential. The Spirit prompts believers to cry "Abba, Father" — Abba being the warm Aramaic word a child used for a trusted father, the very word Jesus Himself prayed in Gethsemane (Mark 14:36). That the same word rises in us is no accident; the Spirit of the Son places the Son''s own prayer on our lips. And this Spirit "beareth witness with our spirit" — a double testimony assuring us of belonging when our feelings waver. Where fear whispers that we must earn our place, the Spirit answers with settled fact: you are a child of God. Identity, for the Christian, is not an achievement to be won but a gift to be received and rested in.',
   '["Galatians 4:4-7", "Mark 14:36"]'
  )
) AS v(day_number, text, refs)
WHERE p.slug = 'pentecost-breath-of-fire'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Word-study leveling (content run 2026-07-02): bring the 5
-- original plans up to word studies on every day, matching the
-- newer plans. Keys are lowercase, punctuation-stripped forms of
-- a word that appears in each day''s passage_text.
-- Idempotent UPDATEs keyed on (plan_slug, day_number).
-- ============================================================

-- Walking in Peace — word studies for days 2, 3, 5, 6, 7.
UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (2, '{"shepherd":{"original":"רֹעִי","transliteration":"roi","definition":"My shepherd — from raah, to tend or feed a flock. To call the LORD my shepherd is to claim personal, attentive care from the One who guides, provides, and protects.","refs":["Psalm 23:1","John 10:11"]}}'),
  (3, '{"trust":{"original":"בָּטַח","transliteration":"batach","definition":"To lean on, rely upon, feel secure. Trust here is not a leap in the dark but resting your full weight on someone proven trustworthy — the ground of perfect peace.","refs":["Isaiah 26:3","Proverbs 3:5"]}}'),
  (5, '{"yoke":{"original":"ζυγός","transliteration":"zygos","definition":"A wooden yoke joining two animals; in Jewish usage, a rabbi''s body of teaching. Jesus offers His yoke as a burden shared alongside Him, not one carried alone.","refs":["Matthew 11:29","Acts 15:10"]}}'),
  (6, '{"refuge":{"original":"מַחֲסֶה","transliteration":"machaseh","definition":"A shelter from storm or danger, a place of safety. God is not a refuge we run to after the trouble passes but one available in the very midst of it.","refs":["Psalm 46:1","Psalm 91:2"]}}'),
  (7, '{"hope":{"original":"ἐλπίς","transliteration":"elpis","definition":"Confident expectation, not wishful thinking. Biblical hope is certainty about the future grounded in God''s character — the overflow the Spirit produces in the believing heart.","refs":["Romans 15:13","Hebrews 6:19"]}}')
) AS v(day_number, ws)
WHERE p.slug = 'walking-in-peace'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Strength in the Storm — word studies for days 2, 3, 5, 6, 7.
UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (2, '{"strengthen":{"original":"אָמַץ","transliteration":"amats","definition":"To be strong, to make firm, to fortify. God does not merely wish us courage — He supplies the strength Himself, holding us up with His own right hand.","refs":["Isaiah 41:10","Joshua 1:9"]}}'),
  (3, '{"patience":{"original":"ὑπομονή","transliteration":"hupomonē","definition":"Steadfast endurance — literally remaining under a weight rather than escaping it. Not passive waiting but active perseverance forged in the trial itself.","refs":["James 1:3","Romans 5:3-4"]}}'),
  (5, '{"intercession":{"original":"ἐντυγχάνω","transliteration":"entygchanō","definition":"To appeal to, to plead on another''s behalf. When suffering steals our words, the Spirit Himself carries the prayer to the Father with groanings too deep for speech.","refs":["Romans 8:26","Hebrews 7:25"]}}'),
  (6, '{"broken":{"original":"שָׁבַר","transliteration":"shabar","definition":"To break, shatter, burst. A broken heart is one crushed under grief — and this is precisely the condition the LORD is said to draw nearest to, not turn away from.","refs":["Psalm 34:18","Psalm 51:17"]}}'),
  (7, '{"trust":{"original":"חָסָה","transliteration":"chasah","definition":"To seek shelter, to flee for protection. Different from mere belief — it is the act of running to God as your hiding place in the day of trouble. He knows by name all who do.","refs":["Nahum 1:7","Psalm 2:12"]}}')
) AS v(day_number, ws)
WHERE p.slug = 'strength-in-the-storm'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Heart of Gratitude — word studies for days 2-6, 8-14 (the range of biblical thanks-vocabulary).
UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (2,  '{"rejoice":{"original":"χαίρω","transliteration":"chairō","definition":"To rejoice, to be glad — the root of charis (grace) and chara (joy). Paul pairs it with unceasing prayer and constant thanks as marks of a life aligned with God''s will.","refs":["1 Thessalonians 5:16","Philippians 4:4"]}}'),
  (3,  '{"redeemed":{"original":"גָּאַל","transliteration":"gaal","definition":"To redeem, to buy back, to act as a kinsman who rescues. The redeemed are those God has personally reclaimed from the enemy''s hand — and gratitude is their proper response.","refs":["Psalm 107:2","Isaiah 43:1"]}}'),
  (4,  '{"thankful":{"original":"εὐχάριστος","transliteration":"eucharistos","definition":"Grateful, thankful — literally full of good grace. Paul makes thankfulness the atmosphere in which the peace of Christ rules and His word dwells richly.","refs":["Colossians 3:15","Colossians 4:2"]}}'),
  (5,  '{"praise":{"original":"יָדָה","transliteration":"yadah","definition":"To give thanks, to praise — from a root meaning to extend the hand, to throw. Praise here is a whole-hearted, outward-reaching acknowledgment of what God has done.","refs":["Psalm 9:1","Psalm 100:4"]}}'),
  (6,  '{"remember":{"original":"זָכַר","transliteration":"zakar","definition":"To remember, to call to mind, to mention. In Hebrew thought remembering is active — it summons the past into the present as fuel for present worship and trust.","refs":["1 Chronicles 16:12","Deuteronomy 8:2"]}}'),
  (8,  '{"thanks":{"original":"εὐχαριστέω","transliteration":"eucharisteō","definition":"To give thanks, to express gratitude. Only one leper of ten returned to give it — a reminder that receiving a gift and thanking the Giver are two separate acts.","refs":["Luke 17:16","Colossians 3:17"]}}'),
  (9,  '{"bless":{"original":"בָּרַךְ","transliteration":"barak","definition":"To bless — its root pictures kneeling, the posture of homage. To bless the LORD at all times is to bow the heart in gratitude whether or not circumstances warrant it.","refs":["Psalm 34:1","Psalm 103:1"]}}'),
  (10, '{"melody":{"original":"ψάλλω","transliteration":"psallō","definition":"To pluck a string, to make music, to sing praise. The Spirit-filled life overflows into song — melody made in the heart to the Lord, thanks set to music.","refs":["Ephesians 5:19","Psalm 98:5"]}}'),
  (11, '{"thanksgiving":{"original":"תּוֹדָה","transliteration":"todah","definition":"A thank-offering, a confession of praise. God owns every beast on a thousand hills and needs nothing; what He desires is the voluntary offering of a grateful heart.","refs":["Psalm 50:14","Psalm 100:4"]}}'),
  (12, '{"praise":{"original":"αἴνεσις","transliteration":"ainesis","definition":"Praise, a sacrifice of thanksgiving spoken aloud. Hebrews defines this sacrifice precisely: the fruit of lips that give thanks to His name, offered continually.","refs":["Hebrews 13:15","Psalm 50:23"]}}'),
  (13, '{"lovingkindness":{"original":"חֶסֶד","transliteration":"chesed","definition":"Steadfast covenant love, mercy, loyal kindness. To declare His lovingkindness in the morning and faithfulness at night is to bracket the whole day in gratitude.","refs":["Psalm 92:2","Lamentations 3:22-23"]}}'),
  (14, '{"thanksgiving":{"original":"εὐχαριστία","transliteration":"eucharistia","definition":"Thanksgiving, the giving of thanks. In heaven''s sevenfold doxology it stands at the center — proof that gratitude is not a passing duty but the permanent language of worship.","refs":["Revelation 7:12","Philippians 4:6"]}}')
) AS v(day_number, ws)
WHERE p.slug = 'heart-of-gratitude'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Light for the Path — word studies for days 2-6, 8-14 (vocabulary of guidance).
UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (2,  '{"acknowledge":{"original":"יָדַע","transliteration":"yada","definition":"To know, to recognize, to acknowledge relationally. To acknowledge God in all your ways is to bring Him into every decision as the One you know, not merely believe in.","refs":["Proverbs 3:6","Jeremiah 9:24"]}}'),
  (3,  '{"understanding":{"original":"בִּין","transliteration":"bin","definition":"To discern, to perceive, to distinguish between things. Solomon asked not for riches but for a discerning heart — the ability to tell good from bad in the act of leading.","refs":["1 Kings 3:9","Proverbs 2:6"]}}'),
  (4,  '{"wait":{"original":"חָכָה","transliteration":"chakah","definition":"To wait, to long for, to await expectantly. Isaiah pronounces a blessing on those who wait for the LORD — guidance often comes to those willing to pause for it.","refs":["Isaiah 30:18","Psalm 27:14"]}}'),
  (5,  '{"light":{"original":"φῶς","transliteration":"phōs","definition":"Light — illumination, and by extension truth and life. Jesus does not merely give light for the road; He is the Light, and following Him is what keeps one out of darkness.","refs":["John 8:12","John 1:4"]}}'),
  (6,  '{"steps":{"original":"צַעַד","transliteration":"tsaad","definition":"A step, a pace, a going. A person plans the route in the heart, but the LORD establishes the actual steps — guidance is God''s quiet work within our honest planning.","refs":["Proverbs 16:9","Psalm 37:23"]}}'),
  (8,  '{"transformed":{"original":"μεταμορφόω","transliteration":"metamorphoō","definition":"To be changed in form from the inside out — the root of metamorphosis. God guides not chiefly by external signs but by renewing the mind until it discerns His will.","refs":["Romans 12:2","2 Corinthians 3:18"]}}'),
  (9,  '{"thoughts":{"original":"מַחֲשָׁבָה","transliteration":"machashabah","definition":"A thought, plan, intention, design. The plans God thinks toward His people are purposed and deliberate — thoughts of peace and a future, even spoken into exile.","refs":["Jeremiah 29:11","Isaiah 55:8-9"]}}'),
  (10, '{"instruct":{"original":"שָׂכַל","transliteration":"sakal","definition":"To be prudent, to give insight, to make wise. God promises not just to point the way but to impart understanding — to instruct the traveler, not only mark the road.","refs":["Psalm 32:8","Psalm 25:12"]}}'),
  (11, '{"safety":{"original":"תְּשׁוּעָה","transliteration":"teshuah","definition":"Deliverance, safety, victory. Proverbs locates safety not in the lone decision-maker but in a multitude of counsellors — wise guidance is a community, not a solo act.","refs":["Proverbs 11:14","Proverbs 24:6"]}}'),
  (12, '{"ask":{"original":"αἰτέω","transliteration":"aiteō","definition":"To ask, to request, to beg. The present-tense force is keep asking. Jesus grounds guidance in a Father who delights to give good gifts to children who simply ask.","refs":["Matthew 7:7","James 1:5"]}}'),
  (13, '{"knowledge":{"original":"ἐπίγνωσις","transliteration":"epignōsis","definition":"Full, thorough knowledge — deeper than mere information. To be filled with the knowledge of God''s will is to know Him well enough that His desires shape the walk.","refs":["Colossians 1:9","Ephesians 1:17"]}}'),
  (14, '{"guide":{"original":"נָהַג","transliteration":"nahag","definition":"To lead, to guide, to drive a flock along. The word pictures a shepherd steadily conducting the flock all the way home — God guides not for a season but even unto death.","refs":["Psalm 48:14","Isaiah 58:11"]}}')
) AS v(day_number, ws)
WHERE p.slug = 'light-for-the-path'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Rooted in Love — word studies for days 2-10, 12-20, 22-30.
UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (2,  '{"propitiation":{"original":"ἱλασμός","transliteration":"hilasmos","definition":"An atoning sacrifice that satisfies and turns away wrath. John locates the definition of love here: not that we loved God, but that He sent His Son as the propitiation for our sins.","refs":["1 John 4:10","1 John 2:2"]}}'),
  (3,  '{"healed":{"original":"רָפָא","transliteration":"rapha","definition":"To heal, mend, restore. God tended Israel like a parent teaching a child to walk — healing them even while they did not recognize the hand that held them.","refs":["Hosea 11:3","Exodus 15:26"]}}'),
  (4,  '{"beareth":{"original":"στέγω","transliteration":"stegō","definition":"To cover, to bear up under, to endure without leaking. Love bears all things the way a sound roof holds back the storm — protecting rather than exposing.","refs":["1 Corinthians 13:7","1 Corinthians 9:12"]}}'),
  (5,  '{"neighbour":{"original":"πλησίον","transliteration":"plēsion","definition":"The one near you, the fellow person. Jesus binds love for this near one to love for God — the second command is like the first, and the whole law hangs on both.","refs":["Matthew 22:39","Leviticus 19:18"]}}'),
  (6,  '{"rooted":{"original":"ῥιζόω","transliteration":"rhizoō","definition":"To be firmly rooted, to take root like a tree. Paul prays believers would be rooted and grounded in love — drawing life from it as a plant draws from soil.","refs":["Ephesians 3:17","Colossians 2:7"]}}'),
  (7,  '{"fear":{"original":"φόβος","transliteration":"phobos","definition":"Fear, dread, terror. The specific fear perfect love expels is the terror of judgment — love changes the ground of our standing so that dread has no place left to stand.","refs":["1 John 4:18","Romans 8:15"]}}'),
  (8,  '{"new":{"original":"καινός","transliteration":"kainos","definition":"New in kind and quality, not merely recent. The command to love is new not because love was unknown but because its measure is new: as I have loved you.","refs":["John 13:34","2 Corinthians 5:17"]}}'),
  (9,  '{"bless":{"original":"εὐλογέω","transliteration":"eulogeō","definition":"To speak well of, to invoke good upon. Jesus commands active blessing of those who curse us — answering hostility not with silence but with spoken good.","refs":["Luke 6:28","Romans 12:14"]}}'),
  (10, '{"seal":{"original":"חוֹתָם","transliteration":"chotam","definition":"A signet, a seal of ownership pressed into wax or clay. To be set as a seal on the heart is to be carried as identity and belonging, not merely affection.","refs":["Song of Solomon 8:6","Haggai 2:23"]}}'),
  (12, '{"merciful":{"original":"רַחוּם","transliteration":"rachum","definition":"Compassionate, merciful — from rechem, the womb. It pictures the deep, gut-level tenderness of a parent, the love from which God deals with us not as our sins deserve.","refs":["Psalm 103:8","Exodus 34:6"]}}'),
  (13, '{"reconciled":{"original":"καταλλάσσω","transliteration":"katallassō","definition":"To change from enmity to friendship, to restore a relationship. While we were still enemies, the death of God''s Son turned the hostility to peace.","refs":["Romans 5:10","2 Corinthians 5:18"]}}'),
  (14, '{"liberty":{"original":"ἐλευθερία","transliteration":"eleutheria","definition":"Freedom, liberty. Paul insists gospel freedom is not license for the flesh but freedom to serve one another in love — the free person voluntarily becomes a servant.","refs":["Galatians 5:13","2 Corinthians 3:17"]}}'),
  (15, '{"beloved":{"original":"ἀγαπητός","transliteration":"agapētos","definition":"Dearly loved, beloved. Before Paul lists the virtues to put on, he names the identity underneath them: the elect of God, holy and beloved. We clothe ourselves out of belovedness.","refs":["Colossians 3:12","Romans 1:7"]}}'),
  (16, '{"friend":{"original":"רֵעַ","transliteration":"rea","definition":"A companion, friend, associate. Proverbs defines friendship not by feeling but by constancy — a friend loves at all times, and is most recognizable in adversity.","refs":["Proverbs 17:17","Proverbs 18:24"]}}'),
  (17, '{"abide":{"original":"μένω","transliteration":"menō","definition":"To remain, dwell, continue. Jesus repeats it like a refrain: abide in my love. Love is not a single act but a dwelling place we are told to stay inside.","refs":["John 15:9","John 15:4"]}}'),
  (18, '{"hospitality":{"original":"φιλοξενία","transliteration":"philoxenia","definition":"Literally love of strangers — the practice of welcome. Peter names it as fervent love made concrete: opening the door, and doing it without grudging.","refs":["1 Peter 4:9","Hebrews 13:2"]}}'),
  (19, '{"precious":{"original":"יָקָר","transliteration":"yaqar","definition":"Precious, prized, costly, weighty. God tells a redeemed and renamed people that they are precious in His sight — love that assigns worth, not love earned by worth.","refs":["Isaiah 43:4","Psalm 116:15"]}}'),
  (20, '{"humbly":{"original":"צָנַע","transliteration":"tsana","definition":"To be modest, humble, lowly. The LORD requires not grand offerings but a life walked humbly with Him — love expressed as quiet, ongoing alignment with God.","refs":["Micah 6:8","Proverbs 11:2"]}}'),
  (22, '{"covenant":{"original":"בְּרִית","transliteration":"berith","definition":"A binding covenant, a sworn bond. God stakes His kindness on covenant, not on our behavior — the covenant of peace stands even when the mountains depart.","refs":["Isaiah 54:10","Genesis 9:16"]}}'),
  (23, '{"perfect":{"original":"τέλειος","transliteration":"teleios","definition":"Complete, mature, brought to its intended end. The perfection Jesus calls for is love that, like the Father''s sun and rain, does not depend on the worthiness of its object.","refs":["Matthew 5:48","Colossians 1:28"]}}'),
  (24, '{"longsuffering":{"original":"אֶרֶךְ אַפַּיִם","transliteration":"erek appayim","definition":"Literally long of nostrils — slow to anger, patient. It describes a God whose fuse is long, full of compassion and abounding in mercy toward His people.","refs":["Psalm 86:15","Exodus 34:6"]}}'),
  (25, '{"plainly":{"original":"παρρησία","transliteration":"parrēsia","definition":"Openness, plain speech, boldness. Jesus promises to shift from veiled proverbs to plain disclosure of the Father — love that no longer keeps its distance behind a veil.","refs":["John 16:25","Ephesians 3:12"]}}'),
  (26, '{"direct":{"original":"κατευθύνω","transliteration":"kateuthynō","definition":"To make straight, to guide, to set on a direct course. Paul prays the Lord would steer the heart into God''s love and into patient waiting for Christ.","refs":["2 Thessalonians 3:5","1 Thessalonians 3:11"]}}'),
  (27, '{"faithfulness":{"original":"אֱמוּנָה","transliteration":"emunah","definition":"Firmness, steadfastness, faithfulness. Spoken from the ruins of Jerusalem, this word declares that God''s reliability is fresh every morning — great is His faithfulness.","refs":["Lamentations 3:23","Deuteronomy 7:9"]}}'),
  (28, '{"faithful":{"original":"אָמַן","transliteration":"aman","definition":"To be firm, trustworthy, reliable — the root of amen. God is the faithful God who keeps covenant to a thousand generations; His love rests on His own character, not ours.","refs":["Deuteronomy 7:9","1 Corinthians 1:9"]}}'),
  (29, '{"faith":{"original":"πίστις","transliteration":"pistis","definition":"Faith, trust, faithfulness. Paul''s final charges — watch, stand fast, be strong — are anchored in faith and framed by the command that all be done in love.","refs":["1 Corinthians 16:13","Hebrews 11:1"]}}'),
  (30, '{"separate":{"original":"χωρίζω","transliteration":"chorizō","definition":"To divide, sever, put apart. Paul runs through every category of existence and declares that none of them can separate us from the love of God in Christ Jesus.","refs":["Romans 8:39","Romans 8:35"]}}')
) AS v(day_number, ws)
WHERE p.slug = 'rooted-in-love'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Advent: Waiting for the Light (28 days) — base entries.
-- Seasonal (season_key 'advent'). Content run 2026-07-02.
-- A 4-week arc: Hope (prophecy) -> Peace (preparation) ->
-- Joy (the announcements) -> Love (the incarnation).
-- Idempotent: inserted only when the plan has zero entries.
-- ============================================================
INSERT INTO reading_plan_entries (plan_id, day_number, verse_ref, reflection, created_at)
SELECT p.id, v.day_number, v.verse_ref, v.reflection, NOW()
FROM reading_plans p,
(VALUES
  (1,  'Genesis 3:15',    'Advent begins not in Bethlehem but in Eden. In the very sentence God speaks over the serpent, a promise is buried: the woman''s seed will one day crush his head. From humanity''s first failure, the rescue is already announced.'),
  (2,  'Isaiah 9:2',      'The prophets learned to speak of salvation as light breaking into darkness. To a people walking in shadow, Isaiah promises not a lamp but a dawn — a great light that will rise on those who dwell in the land of death.'),
  (3,  'Isaiah 9:6',      'Seven centuries before the manger, Isaiah names the child yet unborn: Wonderful, Counsellor, the mighty God, the everlasting Father, the Prince of Peace. The government of the whole world will rest on an infant''s shoulder.'),
  (4,  'Isaiah 7:14',     'The sign God gives is a name: Immanuel — God with us. Not God above us, or God watching us, but God come near enough to be held. The whole hope of Advent is compressed into that one word.'),
  (5,  'Micah 5:2',       'The Messiah''s birthplace is named centuries in advance — and it is nowhere important. Little Bethlehem, least among Judah''s towns, will cradle the One whose goings forth have been from everlasting.'),
  (6,  'Isaiah 11:1-2',   'The royal line of David had been cut down to a stump. But from that dead-looking stump, Isaiah says, a living Branch will grow — the Spirit of the LORD resting upon Him. God specializes in life from what looks finished.'),
  (7,  'Jeremiah 23:5-6', 'To a nation ruled by corrupt kings, Jeremiah promises a righteous Branch — a King who will reign in justice, whose very name is THE LORD OUR RIGHTEOUSNESS. The coming One will be everything the failed kings were not.'),
  (8,  'Isaiah 40:3-5',   'A voice cries in the wilderness: prepare the way. Valleys lifted, mountains flattened, crooked places made straight. Advent is not only about God coming to us — it is a summons to make the road ready in our own hearts.'),
  (9,  'Malachi 3:1',     'The last prophet before four centuries of silence promises a messenger who will prepare the way, and then the Lord Himself suddenly coming to His temple. The long wait that follows makes the eventual coming all the more startling.'),
  (10, 'Malachi 4:2',     'Malachi closes the Old Testament with a sunrise: the Sun of righteousness will arise with healing in His wings. After the last prophetic word, four hundred years of darkness — and then the dawn Malachi foresaw.'),
  (11, 'Isaiah 35:4-6',   'To fearful hearts Isaiah says: be strong, your God will come and save you. And when He comes, blind eyes open, deaf ears unstop, the lame leap. The coming of God is the healing of everything sin has broken.'),
  (12, 'Zechariah 9:9',   'Zechariah tells Zion to rejoice: her King is coming — but not on a war horse. He comes just and having salvation, yet lowly, riding on a colt. The King of all the earth arrives in humility, exactly as He will.'),
  (13, 'Isaiah 61:1-2',   'Isaiah gives the coming Messiah His mission statement centuries early: good news to the meek, binding up the brokenhearted, liberty to captives. Jesus will one day read these very words aloud and say, Today this is fulfilled.'),
  (14, 'Numbers 24:17',   'Even a hired pagan prophet could not help but see it: a Star will come out of Jacob, a Sceptre out of Israel. The hope of a coming King was written so deep in Scripture that outsiders glimpsed it too.'),
  (15, 'Luke 1:30-33',    'The waiting ends with an angel in a small town, speaking to a young woman. Fear not, Mary. The child she will bear is the Son of the Highest, heir to David''s throne, whose kingdom will never end. Prophecy becomes personal.'),
  (16, 'Luke 1:38',       'Mary''s answer is four words that change history: be it unto me. No demand for explanation, no bargaining — only surrender. The whole plan of salvation waits on the yes of a servant willing to be interrupted by God.'),
  (17, 'Luke 1:46-49',    'Mary responds to the impossible not with anxiety but a song. Her soul magnifies the Lord who has regarded her low estate. The Magnificat is the voice of every heart that discovers God lifts up exactly the ones the world overlooks.'),
  (18, 'Luke 1:76-79',    'Zechariah, silent for nine months, finds his voice in prophecy over his infant son John. The dayspring — the dawn — from on high has visited us, to give light to those who sit in darkness and guide our feet into peace.'),
  (19, 'Matthew 1:20-21', 'Joseph, too, receives an angel. The child is of the Holy Ghost; call His name Jesus, for He shall save His people from their sins. The name itself is the gospel: Yeshua means the LORD saves.'),
  (20, 'Luke 2:10-11',    'To shepherds on a hillside, the announcement finally lands: good tidings of great joy, to all people. Unto you is born this day a Saviour, which is Christ the Lord. The long-promised One has arrived.'),
  (21, 'Luke 2:13-14',    'Heaven cannot keep the news to itself. A multitude of angels erupts over the fields: Glory to God in the highest, and on earth peace. The birth of one baby splits the sky open with praise.'),
  (22, 'Luke 2:6-7',      'The eternal Word enters the world with no room to receive Him — wrapped in swaddling clothes, laid in a feeding trough. The God who made the inn is turned away from it, and begins His life among the overlooked.'),
  (23, 'John 1:1-5',      'John tells the Christmas story without a stable. In the beginning was the Word, and the Word was God — and all things were made by Him. The baby in the manger is the One through whom the universe came to be.'),
  (24, 'John 1:14',       'Here is the heart of Advent: the Word was made flesh and dwelt among us. The Greek says He tabernacled — pitched His tent — among us. The God who once filled the temple now takes on skin and moves into the neighborhood.'),
  (25, 'Luke 2:15-16',    'The shepherds do not merely believe the message; they go. They come with haste, find the babe in the manger, and return glorifying God. The right response to good news is to seek Him out and then to tell it everywhere.'),
  (26, 'Matthew 2:1-2',   'From the east, wise men follow a star, asking where the King of the Jews is born, for they have come to worship Him. The first to seek the newborn King are outsiders — a sign that this salvation is for all nations.'),
  (27, 'Matthew 2:10-11', 'The magi rejoice with exceeding great joy, fall down, and worship, opening their treasures: gold for a king, frankincense for God, myrrh for one who will die. Their gifts preach the whole gospel over a cradle.'),
  (28, 'John 3:16-17',    'Advent ends where the coming was always aimed: God so loved the world that He gave His only Son. The star, the manger, the prophecies — all of it flows from love, and all of it is offered so that the world might be saved.')
) AS v(day_number, verse_ref, reflection)
WHERE p.slug = 'advent-waiting-for-the-light'
  AND NOT EXISTS (SELECT 1 FROM reading_plan_entries WHERE plan_id = p.id);

-- Advent — text, titles, passages, prayer, application, question, context, memory flags.
UPDATE reading_plan_entries e
SET
  day_title       = v.day_title,
  passage_text    = v.passage_text,
  passage_refs    = v.passage_refs,
  prayer          = v.prayer,
  application     = v.application,
  question        = v.question,
  context_note    = v.context_note,
  content_type    = 'passage',
  is_memory_verse = v.is_memory_verse
FROM reading_plans p,
(VALUES
  (1, 'The First Promise',
   'And I will put enmity between thee and the woman, and between thy seed and her seed; it shall bruise thy head, and thou shalt bruise his heel.',
   '["Romans 16:20", "Galatians 4:4"]',
   'Father, even in my failures You are already speaking rescue. Thank You that Advent begins with a promise made in the dark. Teach me to wait in hope. Amen.',
   'Write down one situation that feels beyond repair. Beside it, note that God announced the rescue before the wound of Eden had even healed — He is not finished.',
   'Where in your life do you most need to believe that God has already set a rescue in motion, even if you cannot yet see it?',
   'Genesis 3:15 is called the protoevangelium — the "first gospel." Spoken as judgment on the serpent, it is the earliest promise of a coming deliverer born of a woman who will crush evil at the cost of His own wounding.',
   false),
  (2, 'A Great Light',
   'The people that walked in darkness have seen a great light: they that dwell in the land of the shadow of death, upon them hath the light shined.',
   '["John 8:12", "Matthew 4:16"]',
   'Lord, You are the light that darkness cannot overcome. Where I am walking in shadow, let Your dawn break. I wait for You as the watchman waits for morning. Amen.',
   'Notice one area of your life you tend to think of as "shadowed." Speak Isaiah''s promise over it aloud: the light has shined on those who dwell in darkness.',
   'What does it mean to you that God comes to people specifically while they are still in the darkness, not after they have found their own way out?',
   'Isaiah spoke this to the northern territories of Israel first to fall to Assyria — a region of defeat and darkness. Matthew later quotes it as fulfilled when Jesus began His ministry in that same Galilee.',
   false),
  (3, 'Unto Us a Child Is Born',
   'For unto us a child is born, unto us a son is given: and the government shall be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace.',
   '["Luke 2:11", "Isaiah 9:7"]',
   'Wonderful Counsellor, mighty God, Prince of Peace — every name is a promise. Be all of these to me today, and let me rest under the government that sits on Your shoulder. Amen.',
   'Choose the one name from Isaiah 9:6 you most need right now — Counsellor, mighty God, everlasting Father, Prince of Peace — and carry it with you as a prayer through the day.',
   'Which of the four names given to the coming child speaks most directly to what you are facing this season, and why?',
   'These titles pile divine names onto a human child — an astonishing claim in a fiercely monotheistic culture. "The mighty God" (El Gibbor) is used of Yahweh Himself elsewhere in Isaiah. The child is fully God.',
   true),
  (4, 'Immanuel: God With Us',
   'Therefore the Lord himself shall give you a sign; Behold, a virgin shall conceive, and bear a son, and shall call his name Immanuel.',
   '["Matthew 1:23", "Isaiah 8:10"]',
   'Immanuel, You are God with us — not distant, not watching from afar, but near. Thank You that You came close enough to be held. Be with me in the ordinary of this day. Amen.',
   'All day, when you feel alone, quietly say the one word: "Immanuel." Let the name preach to you that God is not far off but present.',
   'The name Immanuel means "God with us." Where do you most need to know God''s nearness rather than merely His existence right now?',
   'Given as a sign to faithless King Ahaz, the promise reached beyond his day. Matthew declares its ultimate fulfillment in Jesus — the moment God did what the name Immanuel says: came to dwell with His people in person.',
   true),
  (5, 'O Little Town of Bethlehem',
   'But thou, Bethlehem Ephratah, though thou be little among the thousands of Judah, yet out of thee shall he come forth unto me that is to be ruler in Israel; whose goings forth have been from of old, from everlasting.',
   '["Matthew 2:6", "John 7:42"]',
   'Lord, You choose the small and overlooked to carry Your greatest works. Do not let me despise the little places of my life, for You love to arrive there. Amen.',
   'Think of the most "insignificant" part of your life or day. Offer it to God as a Bethlehem — a small place He may be planning to use.',
   'Bethlehem was too small to matter, yet God chose it centuries in advance. What small or hidden thing might God be preparing to use in your life?',
   'Micah names both the town and the paradox: the ruler born there has "goings forth from everlasting." The One with a birthplace in time is also the eternal God who has always existed.',
   false),
  (6, 'The Branch from Jesse''s Stump',
   'And there shall come forth a rod out of the stem of Jesse, and a Branch shall grow out of his roots: And the spirit of the LORD shall rest upon him, the spirit of wisdom and understanding, the spirit of counsel and might, the spirit of knowledge and of the fear of the LORD.',
   '["Revelation 22:16", "Isaiah 11:10"]',
   'Lord, You bring life out of what looks dead. Where my hope has been cut down to a stump, grow something new by Your Spirit. I trust Your resurrection habit. Amen.',
   'Name one area of your life that feels like a cut-down stump. Ask God, who grows Branches from dead wood, to bring unexpected life there.',
   'Isaiah pictures David''s fallen dynasty as a stump. Where in your life do you need to trust that God can grow something living from what looks finished?',
   'By Isaiah''s prophecy the Davidic monarchy would be reduced to a "stump" in exile. The Branch (netzer) growing from it is the Messiah — and some hear an echo of "Nazarene" in the word.',
   false),
  (7, 'The LORD Our Righteousness',
   'Behold, the days come, saith the LORD, that I will raise unto David a righteous Branch, and a King shall reign and prosper, and shall execute judgment and justice in the earth. In his days Judah shall be saved, and Israel shall dwell safely: and this is his name whereby he shall be called, THE LORD OUR RIGHTEOUSNESS.',
   '["1 Corinthians 1:30", "Jeremiah 33:15-16"]',
   'Righteous King, You are my righteousness — not my own record, but Yours given to me. Reign in me with the justice and mercy the earthly kings never had. Amen.',
   'Where you are tempted today to rely on your own goodness, consciously rest instead in the truth that Christ Himself is called "the LORD our righteousness."',
   'The coming King''s name is "the LORD our righteousness." What changes when your standing before God rests on His righteousness rather than your own performance?',
   'Jeremiah wrote as Judah''s last kings failed catastrophically. The promised Branch would be the true King — and Paul later says Christ "is made unto us... righteousness," fulfilling the name.',
   false),
  (8, 'Prepare the Way',
   'The voice of him that crieth in the wilderness, Prepare ye the way of the LORD, make straight in the desert a highway for our God. Every valley shall be exalted, and every mountain and hill shall be made low: and the crooked shall be made straight, and the rough places plain: And the glory of the LORD shall be revealed, and all flesh shall see it together: for the mouth of the LORD hath spoken it.',
   '["Mark 1:2-3", "Luke 3:4-6"]',
   'Lord, prepare the way in me. Level my pride, lift my discouragement, straighten what is crooked, so there is a clear road for You to arrive. Amen.',
   'Identify one "mountain" (a pride, a grudge) or one "valley" (a discouragement) in your heart. Name it in prayer as ground you are asking God to level to prepare His way.',
   'Advent is a season of preparation. What in your heart most needs to be leveled or straightened to make room for God this year?',
   'All four Gospels apply this text to John the Baptist. In the ancient world, roads were built ahead of a visiting king; Isaiah casts repentance as roadwork done in the heart to welcome the coming LORD.',
   false),
  (9, 'The Messenger of the Covenant',
   'Behold, I will send my messenger, and he shall prepare the way before me: and the Lord, whom ye seek, shall suddenly come to his temple, even the messenger of the covenant, whom ye delight in: behold, he shall come, saith the LORD of hosts.',
   '["Matthew 11:10", "Mark 1:2"]',
   'Lord, You promise that after every silence You will suddenly come. Sustain my hope in the seasons when heaven seems quiet, for You are never late. Amen.',
   'Is there a place you have been waiting on God so long you have stopped expecting Him? Renew your watch there today, remembering He "shall suddenly come."',
   'God''s people waited four centuries after this promise before it was fulfilled. Where are you being asked to keep waiting on a promise that seems delayed?',
   'Malachi 3:1 is the last book of the Old Testament chronologically for many readers. After it came roughly 400 "silent years" with no prophet — until John the Baptist arrived as the promised messenger.',
   false),
  (10, 'The Sun of Righteousness',
   'But unto you that fear my name shall the Sun of righteousness arise with healing in his wings; and ye shall go forth, and grow up as calves of the stall.',
   '["Luke 1:78", "Malachi 3:1"]',
   'Sun of righteousness, rise on me with healing today. Where I have been shut in by cold and fear, let Your warmth draw me out into freedom and life. Amen.',
   'Step into literal sunlight for a moment today and let it remind you: the Sun of righteousness rises with healing. Name one thing you are asking Him to heal.',
   'Malachi pictures the Messiah as a sunrise with "healing in his wings." What area of your life most needs the warmth and healing of His coming?',
   'These are the final words of the Old Testament. The image of a winged sun was common in the ancient Near East; Malachi redeems it, promising the true dawn — Christ — after the long night of silence.',
   false),
  (11, 'He Will Come and Save',
   'Say to them that are of a fearful heart, Be strong, fear not: behold, your God will come with vengeance, even God with a recompence; he will come and save you. Then the eyes of the blind shall be opened, and the ears of the deaf shall be unstopped. Then shall the lame man leap as an hart, and the tongue of the dumb sing.',
   '["Matthew 11:4-5", "Isaiah 61:1"]',
   'Lord, You come to save, not only to rule. Open what is blind and deaf and bound in me, and let me leap and sing at Your coming. Amen.',
   'Where fear has made your heart weak, speak Isaiah''s command to yourself today: "Be strong, fear not — your God will come and save you."',
   'Isaiah lists the signs of God''s coming as healing and restoration. Which of these — sight, hearing, freedom, song — do you most long for God to work in you?',
   'When John the Baptist later doubted in prison, Jesus answered by pointing to exactly these signs — the blind seeing, the lame walking — as proof that Isaiah''s promised salvation had arrived in Him.',
   false),
  (12, 'Behold, Your King',
   'Rejoice greatly, O daughter of Zion; shout, O daughter of Jerusalem: behold, thy King cometh unto thee: he is just, and having salvation; lowly, and riding upon an ass, and upon a colt the foal of an ass.',
   '["Matthew 21:5", "John 12:15"]',
   'King Jesus, You come in humility, not in the pomp I expect. Teach me to welcome a Saviour who rides low, and to follow You in the same lowliness. Amen.',
   'Where do you expect God to act with power and spectacle? Look today for Him arriving instead in something humble and easily missed.',
   'The prophesied King comes "lowly," not in grandeur. How does a humble Messiah challenge your expectations of how God should show up?',
   'Zechariah''s prophecy was fulfilled on Palm Sunday when Jesus entered Jerusalem on a colt. The King who could have come on a war horse chose the mount of peace, exactly as foretold.',
   false),
  (13, 'The Spirit of the Lord Is Upon Me',
   'The Spirit of the Lord GOD is upon me; because the LORD hath anointed me to preach good tidings unto the meek; he hath sent me to bind up the brokenhearted, to proclaim liberty to the captives, and the opening of the prison to them that are bound; To proclaim the acceptable year of the LORD.',
   '["Luke 4:18-19", "Isaiah 42:1"]',
   'Anointed Saviour, You came for the meek, the brokenhearted, the captive. I am one of these. Preach Your good news to me and set me free today. Amen.',
   'Which word describes you most right now — meek, brokenhearted, captive, bound? Bring that exact condition to the Messiah who was anointed for it.',
   'Jesus opened His public ministry by reading this passage and saying it was fulfilled in Him. Which part of His mission do you most need Him to fulfill in you this season?',
   'In Luke 4, Jesus read these very verses in the Nazareth synagogue, stopped mid-sentence, and declared, "This day is this scripture fulfilled in your ears" — claiming Isaiah''s Servant as Himself.',
   false),
  (14, 'A Star Out of Jacob',
   'I shall see him, but not now: I shall behold him, but not nigh: there shall come a Star out of Jacob, and a Sceptre shall rise out of Israel.',
   '["Matthew 2:2", "Revelation 22:16"]',
   'Lord, the hope of Your coming was written so deep that even strangers glimpsed it. Give me eyes to see Your light rising, however far off it seems. Amen.',
   'Look up at the night sky tonight if you can. Let the stars remind you of a promise so certain that God wrote it into the expectation of the nations.',
   'Balaam, no friend of Israel, still foresaw the Star. Where have you noticed hints of God''s truth in unexpected places or people?',
   'Balaam, a pagan diviner hired to curse Israel, instead prophesied a coming Star and Sceptre. Many scholars connect this ancient oracle to the star the magi followed to Bethlehem.',
   false),
  (15, 'The Angel to Mary',
   'And the angel said unto her, Fear not, Mary: for thou hast found favour with God. And, behold, thou shalt conceive in thy womb, and bring forth a son, and shalt call his name JESUS. He shall be great, and shall be called the Son of the Highest: and the Lord God shall give unto him the throne of his father David: And he shall reign over the house of Jacob for ever; and of his kingdom there shall be no end.',
   '["Isaiah 9:7", "2 Samuel 7:16"]',
   'Lord, You still come to ordinary people in ordinary places with extraordinary callings. Give me Mary''s open heart to receive whatever You ask. Amen.',
   'Consider one way God may be inviting you into something larger than you feel ready for. Practice Mary''s posture: "Fear not" comes before the calling.',
   'The angel came to an unknown girl in an unimportant town. What does it tell you about God that He entrusts His greatest work to the overlooked?',
   'Gabriel''s announcement ties the child directly to the promise God made David in 2 Samuel 7 — an everlasting throne. Centuries of prophecy converge on this single conversation in Nazareth.',
   false),
  (16, 'Let It Be',
   'And Mary said, Behold the handmaid of the Lord; be it unto me according to thy word. And the angel departed from her.',
   '["1 Samuel 3:10", "Luke 1:45"]',
   'Lord, teach me to say yes to You before I understand. Like Mary, let my answer be simple surrender: be it unto me according to Your word. Amen.',
   'Bring one area where you have been bargaining with God instead of surrendering. Pray Mary''s words over it: "Be it unto me according to Thy word."',
   'Mary said yes with no guarantee of how it would go. What is God asking you to surrender before you can see the outcome?',
   'Mary faced real risk — an unexplained pregnancy could mean shame or worse. Her consent was not naive but courageous trust, given before she knew how the story would unfold.',
   false),
  (17, 'Mary''s Song',
   'And Mary said, My soul doth magnify the Lord, And my spirit hath rejoiced in God my Saviour. For he hath regarded the low estate of his handmaiden: for, behold, from henceforth all generations shall call me blessed. For he that is mighty hath done to me great things; and holy is his name.',
   '["1 Samuel 2:1-2", "Psalm 34:3"]',
   'Lord, like Mary let my first response to Your work be a song. You have regarded my low estate. My soul magnifies You. Amen.',
   'Write your own one-line "magnificat" today: a single sentence naming one great thing God has done for you, and say it aloud as praise.',
   'Mary''s instinct in the face of the impossible was worship, not worry. What would change if praise became your first response instead of anxiety?',
   'The Magnificat echoes Hannah''s song (1 Samuel 2) and is saturated with Old Testament language — evidence that this young woman knew her Scriptures deeply. Her theology fuels her joy.',
   false),
  (18, 'The Dayspring from on High',
   'And thou, child, shalt be called the prophet of the Highest: for thou shalt go before the face of the Lord to prepare his ways; To give knowledge of salvation unto his people by the remission of their sins, Through the tender mercy of our God; whereby the dayspring from on high hath visited us, To give light to them that sit in darkness and in the shadow of death, to guide our feet into the way of peace.',
   '["Malachi 4:2", "Isaiah 9:2"]',
   'Tender God, Your mercy is the dawn that visits me. Give light where I sit in shadow, and guide my feet into the way of peace today. Amen.',
   'Name one place you are "sitting in darkness." Ask the Dayspring to visit it, and take one small step today toward the way of peace.',
   'Zechariah calls Christ''s coming the "dayspring" — the sunrise — born of God''s tender mercy. Where do you most need that mercy to dawn on you?',
   'Zechariah had been struck mute for doubting the angel; these are his first words when speech returns. Nine months of silence give way to some of the richest prophecy in the Gospels.',
   false),
  (19, 'The Angel to Joseph',
   'But while he thought on these things, behold, the angel of the Lord appeared unto him in a dream, saying, Joseph, thou son of David, fear not to take unto thee Mary thy wife: for that which is conceived in her is of the Holy Ghost. And she shall bring forth a son, and thou shalt call his name JESUS: for he shall save his people from their sins.',
   '["Matthew 1:23", "Psalm 130:8"]',
   'Lord, like Joseph I want to obey even what I do not fully understand. Give me quiet courage to do the next right thing and trust You with the rest. Amen.',
   'Where obedience to God will cost you something (comfort, reputation, a plan), take Joseph''s next quiet step of trust today without needing every answer.',
   'Joseph obeyed at real cost to his reputation. What act of quiet, costly obedience might God be asking of you this season?',
   'The name Jesus (Yeshua) means "the LORD saves," and the angel explains it: "he shall save his people from their sins." The mission of the cross is embedded in the name given at the cradle.',
   false),
  (20, 'Good Tidings of Great Joy',
   'And the angel said unto them, Fear not: for, behold, I bring you good tidings of great joy, which shall be to all people. For unto you is born this day in the city of David a Saviour, which is Christ the Lord.',
   '["Isaiah 9:6", "Titus 2:11"]',
   'Saviour, the news that reached the shepherds reaches me: unto you is born a Saviour. Let that joy be mine today, and let me carry it to others. Amen.',
   'Tell one person today a piece of genuinely good news about Jesus. The angels announced it to be shared, not hoarded — pass the great joy along.',
   'The announcement came first to shepherds — laborers on the margins. What does it mean that God addressed His best news to the overlooked "you"?',
   'Shepherds were considered ceremonially unclean and were often distrusted. That the angelic announcement of the Messiah came to them first signals a kingdom that begins with the lowly.',
   true),
  (21, 'Glory in the Highest',
   'And suddenly there was with the angel a multitude of the heavenly host praising God, and saying, Glory to God in the highest, and on earth peace, good will toward men.',
   '["Luke 19:38", "Isaiah 6:3"]',
   'Lord, heaven could not stay silent at Your coming. Let my life join that chorus: glory to God in the highest, and peace on the earth You love. Amen.',
   'Pause at some point today and simply add your voice to the angels'': say or sing "Glory to God in the highest." Let praise interrupt your ordinary hours.',
   'The birth of one baby made heaven erupt in praise. What in the story of Christ''s coming most stirs worship in you?',
   'The angelic song links God''s glory in heaven with peace on earth — the two are connected. The peace announced is not merely absence of conflict but the wholeness (shalom) that comes when God draws near.',
   false),
  (22, 'No Room in the Inn',
   'And so it was, that, while they were there, the days were accomplished that she should be delivered. And she brought forth her firstborn son, and wrapped him in swaddling clothes, and laid him in a manger; because there was no room for them in the inn.',
   '["Philippians 2:6-7", "2 Corinthians 8:9"]',
   'Lord, You entered the world with no room and no comfort, choosing the lowest place. Do not let me crowd You out of my life. I make room for You today. Amen.',
   'Ask honestly: what has been crowding God out of your days lately? Clear one small space — a few quiet minutes, a turned-off screen — to make room for Him.',
   'The Lord of all was born where animals fed, with no room prepared for Him. Where in your busy life have you left "no room" for Christ?',
   'A "manger" was a feeding trough; "swaddling clothes" were strips of cloth. Every detail underscores the humility of the incarnation — the King of glory laid where livestock ate.',
   false),
  (23, 'In the Beginning Was the Word',
   'In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made. In him was life; and the life was the light of men. And the light shineth in darkness; and the darkness comprehended it not.',
   '["Genesis 1:1", "Colossians 1:16-17"]',
   'Eternal Word, the baby of Bethlehem is the God who made all things. Let me never shrink You to sentiment — You are the Author of life, come in person. Amen.',
   'Hold together two truths today: the vulnerable infant of the manger and the eternal Word who made the stars. Let both shape how you approach Him.',
   'John tells the Christmas story with no stable — only the eternal Word. How does knowing the baby is the Creator change the way you see the manger?',
   'John deliberately opens with "In the beginning," echoing Genesis 1:1. Before Bethlehem, the Son already existed as the eternal Word (Logos) through whom everything was made.',
   false),
  (24, 'The Word Made Flesh',
   'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.',
   '["Philippians 2:7", "Colossians 2:9"]',
   'Immanuel, You did not stay far off — You were made flesh and moved in among us. Thank You for coming this close. Let me behold Your glory today. Amen.',
   'Sit for three quiet minutes with one thought: God became a human being. Let the wonder of the incarnation rest on you before you rush into the day.',
   'The infinite God took on a finite body. What does it mean to you that God chose to draw this near — to become flesh and dwell among us?',
   'The Greek for "dwelt" (skēnoō) means to pitch a tent or tabernacle. As God once dwelt with Israel in the tabernacle, now He tabernacles in human flesh — the glory of God housed in a body.',
   true),
  (25, 'The Shepherds'' Worship',
   'And it came to pass, as the angels were gone away from them into heaven, the shepherds said one to another, Let us now go even unto Bethlehem, and see this thing which is come to pass, which the Lord hath made known unto us. And they came with haste, and found Mary, and Joseph, and the babe lying in a manger. And the shepherds returned, glorifying and praising God for all the things that they had heard and seen.',
   '["Luke 2:20", "Psalm 96:2-3"]',
   'Lord, let me be like the shepherds: quick to seek You, and quick to tell others what I have found. Turn my wonder into worship and my worship into witness. Amen.',
   'Do both things the shepherds did today: seek Christ with intention (a few minutes of prayer), and tell someone one true thing about Him.',
   'The shepherds did not just marvel — they went, and then they told. Which comes harder for you: seeking Christ out, or speaking of Him to others?',
   'The shepherds model the full response to the gospel: they hear, they seek "with haste," they find, and they return "glorifying and praising God." Wonder becomes worship becomes witness.',
   false),
  (26, 'Wise Men from the East',
   'Now when Jesus was born in Bethlehem of Judaea in the days of Herod the king, behold, there came wise men from the east to Jerusalem, Saying, Where is he that is born King of the Jews? for we have seen his star in the east, and are come to worship him.',
   '["Isaiah 60:3", "Numbers 24:17"]',
   'Lord, You drew strangers from far away to worship a Jewish infant King. Thank You that Your salvation reaches every nation — including me. Amen.',
   'Consider someone far outside your circle of faith. Pray today that the same God who drew the magi from the east would draw them to Christ.',
   'The first worshippers of the King were Gentile outsiders following a star. What does that tell you about who this salvation is for?',
   'The magi were likely astrologers or scholars from Persia or Babylon — Gentiles with no covenant claim on Israel''s God. Their arrival signals from the outset that the newborn King is for all nations.',
   false),
  (27, 'Gold, Frankincense, and Myrrh',
   'When they saw the star, they rejoiced with exceeding great joy. And when they were come into the house, they saw the young child with Mary his mother, and fell down, and worshipped him: and when they had opened their treasures, they presented unto him gifts; gold, and frankincense, and myrrh.',
   '["Psalm 72:10-11", "Isaiah 60:6"]',
   'Lord, the magi gave their best and their most costly. Show me what treasure I am holding back, and give me the joy to lay it down before You. Amen.',
   'Identify one "treasure" — time, money, a talent, a comfort — you have been reluctant to offer God. Present it to Him deliberately today.',
   'The magi opened their treasures and gave their best. What treasure of yours is God inviting you to open and offer this season?',
   'The gifts are read as a threefold confession: gold for a king, frankincense for God, and myrrh — a burial spice — for one destined to die. The magi''s offering quietly foretells the whole gospel.',
   false),
  (28, 'For God So Loved the World',
   'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. For God sent not his Son into the world to condemn the world; but that the world through him might be saved.',
   '["Romans 5:8", "1 John 4:9-10"]',
   'Father, all of Advent flows from this: You so loved that You gave. Let me receive Your Son, and let Your love become the center of my Christmas and my life. Amen.',
   'End this Advent by receiving the gift plainly. Pray a simple sentence of trust in the Son God gave, and thank Him that the whole story was love from the start.',
   'Every prophecy and every part of the Christmas story flows from one source: love. How does it change Christmas to see it as God''s gift of love to you personally?',
   'This single verse gathers the whole of Advent: the giving God, the given Son, the loved world. The coming was never about condemnation but rescue — love enacted so the world "might be saved."',
   true)
) AS v(day_number, day_title, passage_text, passage_refs, prayer, application, question, context_note, is_memory_verse)
WHERE p.slug = 'advent-waiting-for-the-light'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Advent — comprehension check questions (all 28 days).
UPDATE reading_plan_entries e
SET
  quiz_question    = v.question,
  quiz_options     = v.options,
  quiz_explanation = v.explanation
FROM reading_plans p,
(VALUES
  (1,  'In Genesis 3:15, whose "seed" is promised to bruise the serpent''s head?',
       '[{"label":"A","text":"The serpent''s seed","correct":false},{"label":"B","text":"The woman''s seed","correct":true},{"label":"C","text":"Adam''s seed","correct":false}]',
       'God promises enmity between the serpent and "the woman''s seed" — the earliest hint of a deliverer born of a woman who will crush evil at the cost of His own wounding.'),
  (2,  'What do the people walking in darkness see in Isaiah 9:2?',
       '[{"label":"A","text":"A great light","correct":true},{"label":"B","text":"A distant city","correct":false},{"label":"C","text":"A guiding cloud","correct":false}]',
       '"The people that walked in darkness have seen a great light." Isaiah casts salvation as a dawn breaking over those who dwell in the shadow of death.'),
  (3,  'Which title is given to the child in Isaiah 9:6?',
       '[{"label":"A","text":"King of Kings","correct":false},{"label":"B","text":"Lamb of God","correct":false},{"label":"C","text":"Prince of Peace","correct":true}]',
       'Isaiah names the coming child "Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace" — divine titles piled onto an unborn infant.'),
  (4,  'What does the name Immanuel mean?',
       '[{"label":"A","text":"God is coming","correct":false},{"label":"B","text":"God with us","correct":true},{"label":"C","text":"God saves","correct":false}]',
       'Immanuel means "God with us." The sign God gives is a name that captures the whole hope of Advent — God come near enough to be held.'),
  (5,  'What town does Micah name as the Messiah''s birthplace?',
       '[{"label":"A","text":"Nazareth","correct":false},{"label":"B","text":"Jerusalem","correct":false},{"label":"C","text":"Bethlehem","correct":true}]',
       'Micah 5:2 names "Bethlehem Ephratah," though it was "little among the thousands of Judah" — the small town chosen centuries in advance to cradle the eternal Ruler.'),
  (6,  'In Isaiah 11:1, out of whose roots does the Branch grow?',
       '[{"label":"A","text":"Jesse","correct":true},{"label":"B","text":"Abraham","correct":false},{"label":"C","text":"Solomon","correct":false}]',
       'The Branch grows "out of the stem of Jesse" — David''s father. From the cut-down stump of the royal line, God grows new, Spirit-anointed life.'),
  (7,  'What name is given to the righteous Branch in Jeremiah 23:6?',
       '[{"label":"A","text":"The Prince of Peace","correct":false},{"label":"B","text":"THE LORD OUR RIGHTEOUSNESS","correct":true},{"label":"C","text":"The Ancient of Days","correct":false}]',
       'The coming King''s name is "THE LORD OUR RIGHTEOUSNESS" — He will be the very righteousness His people could never produce themselves.'),
  (8,  'What does the voice in the wilderness command in Isaiah 40:3?',
       '[{"label":"A","text":"Prepare ye the way of the LORD","correct":true},{"label":"B","text":"Flee to the mountains","correct":false},{"label":"C","text":"Rebuild the temple","correct":false}]',
       '"Prepare ye the way of the LORD, make straight in the desert a highway for our God." Advent is a summons to make the road ready in the heart.'),
  (9,  'In Malachi 3:1, who will suddenly come to His temple?',
       '[{"label":"A","text":"The messenger who prepares the way","correct":false},{"label":"B","text":"The Lord, the messenger of the covenant","correct":true},{"label":"C","text":"The high priest","correct":false}]',
       'After the messenger prepares the way, "the Lord, whom ye seek, shall suddenly come to his temple, even the messenger of the covenant."'),
  (10, 'What arises "with healing in his wings" in Malachi 4:2?',
       '[{"label":"A","text":"The morning star","correct":false},{"label":"B","text":"The Sun of righteousness","correct":true},{"label":"C","text":"The angel of the LORD","correct":false}]',
       'Malachi closes the Old Testament with a sunrise: "the Sun of righteousness" arising with healing — the dawn after four centuries of prophetic silence.'),
  (11, 'According to Isaiah 35:5, what happens when God comes to save?',
       '[{"label":"A","text":"The eyes of the blind are opened","correct":true},{"label":"B","text":"The seas are calmed","correct":false},{"label":"C","text":"The nations bow","correct":false}]',
       'When God comes, "the eyes of the blind shall be opened" and the lame leap — the coming of God is the healing of everything sin has broken.'),
  (12, 'How does the King come to Zion in Zechariah 9:9?',
       '[{"label":"A","text":"On a war horse in triumph","correct":false},{"label":"B","text":"Lowly, riding on a colt","correct":true},{"label":"C","text":"On the clouds of heaven","correct":false}]',
       'The King comes "lowly, and riding upon an ass, and upon a colt" — humility fulfilled on Palm Sunday, not the grandeur people expected.'),
  (13, 'In Isaiah 61:1, what is the Anointed One sent to do for the brokenhearted?',
       '[{"label":"A","text":"To bind them up","correct":true},{"label":"B","text":"To judge them","correct":false},{"label":"C","text":"To scatter them","correct":false}]',
       'The Spirit-anointed Servant is sent "to bind up the brokenhearted" and proclaim liberty — the mission Jesus claimed as His own in Luke 4.'),
  (14, 'What does Balaam foresee coming out of Jacob in Numbers 24:17?',
       '[{"label":"A","text":"A river","correct":false},{"label":"B","text":"A Star","correct":true},{"label":"C","text":"A cloud","correct":false}]',
       '"There shall come a Star out of Jacob, and a Sceptre out of Israel" — a coming King foreseen even by a pagan diviner, later linked to the magi''s star.'),
  (15, 'In Gabriel''s announcement, how long will the child''s kingdom last?',
       '[{"label":"A","text":"A thousand years","correct":false},{"label":"B","text":"Until the exile ends","correct":false},{"label":"C","text":"There shall be no end","correct":true}]',
       'Of His kingdom "there shall be no end" — Gabriel ties the child directly to God''s everlasting-throne promise to David in 2 Samuel 7.'),
  (16, 'How does Mary respond to the angel in Luke 1:38?',
       '[{"label":"A","text":"Be it unto me according to thy word","correct":true},{"label":"B","text":"How can this be?","correct":false},{"label":"C","text":"Depart from me","correct":false}]',
       'Mary answers with surrender: "Behold the handmaid of the Lord; be it unto me according to thy word" — a yes given before she could see the outcome.'),
  (17, 'What does Mary''s soul do in the opening of her song?',
       '[{"label":"A","text":"Fears the Lord","correct":false},{"label":"B","text":"Magnifies the Lord","correct":true},{"label":"C","text":"Questions the Lord","correct":false}]',
       '"My soul doth magnify the Lord." Mary''s instinct before the impossible is worship — the Magnificat, steeped in Scripture she clearly knew by heart.'),
  (18, 'What does Zechariah call the coming Christ in Luke 1:78?',
       '[{"label":"A","text":"The dayspring from on high","correct":true},{"label":"B","text":"The bright cloud","correct":false},{"label":"C","text":"The lamp of Israel","correct":false}]',
       'Zechariah calls Him "the dayspring from on high" — the sunrise, born of God''s tender mercy, to give light to those who sit in darkness.'),
  (19, 'Why is the child to be named Jesus, according to Matthew 1:21?',
       '[{"label":"A","text":"For he shall rule the nations","correct":false},{"label":"B","text":"For he shall save his people from their sins","correct":true},{"label":"C","text":"For he shall rebuild the temple","correct":false}]',
       '"Thou shalt call his name JESUS: for he shall save his people from their sins." The name (Yeshua, "the LORD saves") carries the mission of the cross.'),
  (20, 'What is born "in the city of David" in Luke 2:11?',
       '[{"label":"A","text":"A prophet","correct":false},{"label":"B","text":"A Saviour, which is Christ the Lord","correct":true},{"label":"C","text":"A priest","correct":false}]',
       '"Unto you is born this day in the city of David a Saviour, which is Christ the Lord" — good tidings of great joy announced first to shepherds.'),
  (21, 'What do the angels say comes to earth in Luke 2:14?',
       '[{"label":"A","text":"Peace, good will toward men","correct":true},{"label":"B","text":"Fire and judgment","correct":false},{"label":"C","text":"A new law","correct":false}]',
       '"Glory to God in the highest, and on earth peace, good will toward men." Heaven links God''s glory above with the wholeness (shalom) His coming brings.'),
  (22, 'Where was the newborn Jesus laid in Luke 2:7?',
       '[{"label":"A","text":"In a cradle at the inn","correct":false},{"label":"B","text":"In a manger","correct":true},{"label":"C","text":"In the temple","correct":false}]',
       'She "laid him in a manger; because there was no room for them in the inn" — the King of glory placed in a feeding trough.'),
  (23, 'What does John 1:1 say the Word was?',
       '[{"label":"A","text":"With God, and was God","correct":true},{"label":"B","text":"A created spirit","correct":false},{"label":"C","text":"An angel of light","correct":false}]',
       '"The Word was with God, and the Word was God." John tells the Christmas story by revealing the baby as the eternal Creator through whom all things were made.'),
  (24, 'What was the Word "made" in John 1:14?',
       '[{"label":"A","text":"Spirit","correct":false},{"label":"B","text":"Flesh","correct":true},{"label":"C","text":"Light","correct":false}]',
       '"The Word was made flesh, and dwelt among us." The Greek for "dwelt" means to tabernacle — God pitching His tent in human flesh.'),
  (25, 'What did the shepherds do after the angels departed?',
       '[{"label":"A","text":"Returned to their flocks in silence","correct":false},{"label":"B","text":"Went with haste to Bethlehem","correct":true},{"label":"C","text":"Waited for a further sign","correct":false}]',
       'They "came with haste" to find the babe, then "returned, glorifying and praising God" — wonder became worship became witness.'),
  (26, 'What did the wise men follow to seek the newborn King?',
       '[{"label":"A","text":"A prophet''s letter","correct":false},{"label":"B","text":"His star","correct":true},{"label":"C","text":"A pillar of cloud","correct":false}]',
       '"We have seen his star in the east, and are come to worship him." Gentile outsiders were among the first to seek the King — salvation is for all nations.'),
  (27, 'What three gifts did the magi present in Matthew 2:11?',
       '[{"label":"A","text":"Gold, frankincense, and myrrh","correct":true},{"label":"B","text":"Bread, wine, and oil","correct":false},{"label":"C","text":"Silver, spices, and linen","correct":false}]',
       'Gold for a king, frankincense for God, and myrrh — a burial spice — for one who would die. The gifts quietly preach the whole gospel over a cradle.'),
  (28, 'According to John 3:16, why did God give His only Son?',
       '[{"label":"A","text":"To condemn the world","correct":false},{"label":"B","text":"Because He so loved the world","correct":true},{"label":"C","text":"To test the world","correct":false}]',
       '"For God so loved the world, that he gave his only begotten Son." Every part of Advent flows from love, offered so the world "might be saved."')
) AS v(day_number, question, options, explanation)
WHERE p.slug = 'advent-waiting-for-the-light'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Advent — word studies (a key word from each day''s passage, all 28 days).
UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (1,  '{"seed":{"original":"זֶרַע","transliteration":"zera","definition":"Seed, offspring, descendant. God promises the woman''s seed will crush the serpent — a singular descendant Paul later identifies as Christ.","refs":["Genesis 3:15","Galatians 3:16"]}}'),
  (2,  '{"light":{"original":"אוֹר","transliteration":"or","definition":"Light — the first thing God spoke into being. Isaiah uses it for salvation dawning on a people in the shadow of death.","refs":["Isaiah 9:2","John 1:5"]}}'),
  (3,  '{"prince":{"original":"שַׂר","transliteration":"sar","definition":"A prince, ruler, chief. In Sar Shalom (Prince of Peace) the child is named the very ruler and source of the wholeness only God can give.","refs":["Isaiah 9:6","Daniel 8:25"]}}'),
  (4,  '{"immanuel":{"original":"עִמָּנוּ אֵל","transliteration":"immanu el","definition":"Literally with-us God. Not a description of God''s power but of His nearness — the sign is a name announcing His presence among His people.","refs":["Isaiah 7:14","Matthew 1:23"]}}'),
  (5,  '{"everlasting":{"original":"עוֹלָם","transliteration":"olam","definition":"Distant time, antiquity, eternity. The Ruler born in Bethlehem has goings forth from olam — He has a birthplace in time yet has always existed.","refs":["Micah 5:2","Psalm 90:2"]}}'),
  (6,  '{"branch":{"original":"נֵצֶר","transliteration":"netzer","definition":"A green shoot or sprout. From the cut stump of David''s line a netzer grows — many hear an echo of Nazareth in the word for the Branch.","refs":["Isaiah 11:1","Isaiah 60:21"]}}'),
  (7,  '{"righteousness":{"original":"צֶדֶק","transliteration":"tsedeq","definition":"Rightness, justice, righteousness. The King''s name declares He is the righteousness His people cannot manufacture — the LORD our righteousness.","refs":["Jeremiah 23:6","1 Corinthians 1:30"]}}'),
  (8,  '{"prepare":{"original":"פָּנָה","transliteration":"panah","definition":"To turn, to clear away, to make ready. The command is to clear a road through the heart so the coming LORD has a straight way in.","refs":["Isaiah 40:3","Malachi 3:1"]}}'),
  (9,  '{"messenger":{"original":"מַלְאָךְ","transliteration":"malak","definition":"A messenger or envoy (also translated angel). God promises a herald to prepare His way — fulfilled centuries later in John the Baptist.","refs":["Malachi 3:1","Mark 1:2"]}}'),
  (10, '{"healing":{"original":"מַרְפֵּא","transliteration":"marpe","definition":"Healing, cure, restoration. The Sun of righteousness rises with marpe in His wings — the dawn of God''s coming brings the mending of what sin broke.","refs":["Malachi 4:2","Proverbs 4:22"]}}'),
  (11, '{"save":{"original":"יָשַׁע","transliteration":"yasha","definition":"To save, deliver, rescue — the root behind the name Yeshua (Jesus). Isaiah promises God Himself will come and yasha His people.","refs":["Isaiah 35:4","Matthew 1:21"]}}'),
  (12, '{"king":{"original":"מֶלֶךְ","transliteration":"melek","definition":"King, sovereign. Zion''s melek comes not on a war horse but on a colt — a king whose greatness is expressed in humility.","refs":["Zechariah 9:9","Psalm 24:8"]}}'),
  (13, '{"anointed":{"original":"מָשַׁח","transliteration":"mashach","definition":"To anoint with oil, setting apart for God''s service — the root of Mashiach, Messiah. The Servant is the Anointed One sent to preach and heal.","refs":["Isaiah 61:1","Luke 4:18"]}}'),
  (14, '{"star":{"original":"כּוֹכָב","transliteration":"kokab","definition":"A star. Balaam foresees a kokab rising out of Jacob — an ancient oracle many connect to the star that led the magi to Bethlehem.","refs":["Numbers 24:17","Matthew 2:2"]}}'),
  (15, '{"jesus":{"original":"Ἰησοῦς","transliteration":"Iēsous","definition":"The Greek form of Hebrew Yeshua, meaning the LORD saves. The angel names the child before birth — the name itself announces His mission.","refs":["Luke 1:31","Matthew 1:21"]}}'),
  (16, '{"handmaid":{"original":"δούλη","transliteration":"doulē","definition":"A female servant, bondmaid. Mary names herself the Lord''s doulē — her identity is glad submission, the posture from which she says her yes.","refs":["Luke 1:38","Luke 1:48"]}}'),
  (17, '{"magnify":{"original":"μεγαλύνω","transliteration":"megalynō","definition":"To make great, to enlarge, to exalt. Mary''s soul magnifies the Lord — not adding to His greatness but making it large in her own sight and song.","refs":["Luke 1:46","Psalm 34:3"]}}'),
  (18, '{"dayspring":{"original":"ἀνατολή","transliteration":"anatolē","definition":"A rising, the dawn, the sunrise (and elsewhere a shoot or branch). Zechariah calls Christ the anatolē from on high — the sunrise breaking on those in darkness.","refs":["Luke 1:78","Malachi 4:2"]}}'),
  (19, '{"save":{"original":"σῴζω","transliteration":"sōzō","definition":"To save, rescue, heal, make whole. The angel explains the name Jesus by this verb: He shall sōzō His people from their sins — the cross is in the cradle.","refs":["Matthew 1:21","Luke 19:10"]}}'),
  (20, '{"saviour":{"original":"σωτήρ","transliteration":"sōtēr","definition":"A saviour, deliverer, rescuer — a title the Roman world gave to Caesar. The angels give it to a baby in a manger: the true Saviour is Christ the Lord.","refs":["Luke 2:11","Titus 2:13"]}}'),
  (21, '{"glory":{"original":"δόξα","transliteration":"doxa","definition":"Glory, splendor, radiant honor. The heavenly host ascribes doxa to God in the highest — the birth of one baby fills the sky with the weight of God''s worth.","refs":["Luke 2:14","John 1:14"]}}'),
  (22, '{"manger":{"original":"φάτνη","transliteration":"phatnē","definition":"A feeding trough or stall for animals. The eternal Word is laid in a phatnē — the first bed of the King of glory is where the livestock ate.","refs":["Luke 2:7","Luke 2:16"]}}'),
  (23, '{"word":{"original":"λόγος","transliteration":"logos","definition":"Word, reason, the self-expression of God. John names the pre-existent Christ the Logos — God speaking Himself into creation and, at Christmas, into flesh.","refs":["John 1:1","Revelation 19:13"]}}'),
  (24, '{"dwelt":{"original":"σκηνόω","transliteration":"skēnoō","definition":"To pitch a tent, to tabernacle, to dwell. As God once dwelt with Israel in the tabernacle, the Word now tabernacles in human flesh among us.","refs":["John 1:14","Revelation 21:3"]}}'),
  (25, '{"praising":{"original":"αἰνέω","transliteration":"aineō","definition":"To praise, to extol aloud. The shepherds return aineō God — having sought and found the child, their wonder overflows into vocal praise.","refs":["Luke 2:20","Psalm 148:1"]}}'),
  (26, '{"worship":{"original":"προσκυνέω","transliteration":"proskyneō","definition":"To prostrate oneself, to do homage, to worship. The magi come to proskyneō the newborn King — Gentile outsiders bowing before Israel''s Messiah.","refs":["Matthew 2:2","John 4:24"]}}'),
  (27, '{"gifts":{"original":"δῶρον","transliteration":"dōron","definition":"A gift, present, offering. The magi open their treasures and give their dōra — gold, frankincense, and myrrh — an offering that confesses king, God, and coming death.","refs":["Matthew 2:11","Ephesians 2:8"]}}'),
  (28, '{"loved":{"original":"ἀγαπάω","transliteration":"agapaō","definition":"To love with deliberate, self-giving choice. God so agapaō the world that He gave His Son — the whole coming flows from this one costly love.","refs":["John 3:16","Romans 5:8"]}}')
) AS v(day_number, ws)
WHERE p.slug = 'advent-waiting-for-the-light'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Advent — dig deeper commentary (days 1, 4, 17, 23, 24, 28).
UPDATE reading_plan_entries e
SET
  deep_dive_text = v.text,
  deep_dive_refs = v.refs
FROM reading_plans p,
(VALUES
  (1,
   'Theologians call Genesis 3:15 the protoevangelium — the "first gospel" — because it is the earliest announcement of redemption in the Bible, spoken before the couple is even sent out of Eden. Notice where it appears: not in a promise made to Adam and Eve directly, but in the sentence of judgment pronounced over the serpent. Grace is smuggled into the middle of the curse. The wording repays attention. God speaks of "her seed" — an unusual phrase, since offspring are normally reckoned through the father — which the church has long read as a quiet hint toward a child born of a woman in a singular way. Paul picks up this exact category in Galatians 3:16, insisting the promised "seed" is ultimately one person: Christ. And the outcome is a double wound: the serpent will "bruise his heel" (a real injury — the cross), while the seed will "bruise thy head" (a fatal blow — the resurrection and final defeat of evil). From humanity''s first catastrophe, God is already narrating the rescue. Advent begins here, in the dark, with a promise — which is exactly where hope is meant to be born.',
   '["Romans 16:20", "Revelation 12:9"]'),
  (4,
   'Isaiah 7:14 was first spoken into a specific political crisis. King Ahaz of Judah faced invasion, and God offered him a sign; when Ahaz refused, God gave one anyway: "a virgin shall conceive... and shall call his name Immanuel." Scholars debate the immediate reference — the Hebrew almah means a young woman of marriageable age — but Matthew, writing under the Spirit and using the Greek translation''s parthenos (virgin), declares the ultimate fulfillment in the miraculous conception of Jesus (Matthew 1:22-23). What matters most is the name. Immanuel is not a statement about God''s attributes — His power, His holiness, His justice — but about His location. "God with us." The entire trajectory of Scripture bends toward this nearness: God walking in the garden, dwelling in the tabernacle, filling the temple, and finally taking on flesh. Matthew frames his whole Gospel with the promise: he opens with Immanuel, "God with us," and closes with the risen Jesus saying, "I am with you always" (Matthew 28:20). The name given at the manger is the promise kept at the empty tomb.',
   '["Matthew 1:22-23", "Matthew 28:20"]'),
  (17,
   'Mary''s song, the Magnificat, is one of the most theologically dense passages in the Gospels — remarkable for coming from an unknown teenage girl. It is saturated with the Old Testament: its structure and themes closely follow Hannah''s song in 1 Samuel 2, and it weaves in language from the Psalms and the prophets. This is not the speech of someone stumbling for words but of a young woman whose imagination is furnished with Scripture. Her theology is a theology of reversal. God "hath regarded the low estate" of His servant; He scatters the proud, puts down the mighty, exalts the lowly, fills the hungry, and sends the rich away empty. In other words, the coming of Christ turns the world''s ranking system upside down — the very pattern the whole Gospel will follow, from a birth among animals to a throne that is a cross. Notice, too, the tenses: Mary speaks of God''s future acts as though already done ("he hath put down... he hath exalted"). Faith speaks of God''s promises in the past tense, so certain of them that they are counted as finished. Her first response to being handed the impossible is not anxiety but a song built on remembering who God has always been.',
   '["1 Samuel 2:1-10", "Luke 6:20-21"]'),
  (23,
   'John opens his Gospel not in Bethlehem but in eternity: "In the beginning was the Word." The phrase is a deliberate echo of Genesis 1:1 — John is announcing a new creation and rooting it in the same God who spoke the first one into being. The term he chooses, Logos ("Word"), is a bridge between two worlds. To Jewish readers it recalled the God who created by speaking ("And God said... and there was") and the personified Wisdom of Proverbs 8. To Greek readers, Logos named the rational principle believed to order the cosmos. John takes this loaded word and makes a staggering claim: the Logos is not an abstract principle but a person, who "was with God, and was God," and who "was made flesh." Three assertions are stacked in a single verse: the Word is eternal (was in the beginning), personal (was with God — distinct), and fully divine (was God). Then verse 3 removes any category of created being: "all things were made by him." The baby in the manger is not a creature God made to save the world; He is the uncreated One through whom the world was made, stepping into His own creation. Christmas, John insists, is the Creator entering the story as a character in it.',
   '["Genesis 1:1-3", "Colossians 1:15-17"]'),
  (24,
   'John 1:14 is the hinge of the whole Bible: "the Word was made flesh, and dwelt among us." Everything before it leans forward to this moment; everything after flows from it. The scandal of the claim is easy to miss from a distance. Greek philosophy generally held that the divine was pure spirit and that flesh was lower, even corrupting; the idea that God would become a body was not just surprising but offensive. John insists on it anyway, and his verb is precise: eskēnōsen, "he tabernacled" — he pitched his tent — among us. The word deliberately recalls the tabernacle of the Exodus, the tent where God''s glory came to dwell in the midst of Israel (Exodus 40:34). Now that dwelling is a human body. "We beheld his glory," John writes — the same glory that once filled the tent and the temple is now seen in a face. And it comes "full of grace and truth," echoing the character God revealed to Moses (Exodus 34:6). The incarnation means God did not save us from a safe distance. He entered the mess in person, took on hunger and weariness and tears, and made His dwelling in the middle of ordinary human life — which means no part of your life is now beneath His reach.',
   '["Exodus 40:34-35", "Hebrews 2:14-17"]'),
  (28,
   'John 3:16 is so familiar it is easy to stop hearing it — but as the close of Advent it gathers the entire season into a single sentence. Every clause carries weight. "God so loved" — the coming was never God''s reluctant duty but the overflow of His nature; love is the engine of the whole story. "the world" — not a worthy or attractive world but the kosmos in rebellion, the very world that would reject Him. "that he gave" — the manger is already an act of giving that points to the greater giving of the cross; the same love that sends the Son to Bethlehem sends Him to Calvary. "his only begotten Son" — the gift is not something God has but the Someone God is, His own Son. "that whosoever believeth" — the door is flung open to anyone, of any nation, matching the Gentile magi who close the story. And verse 17 removes the last fear: God "sent not his Son... to condemn the world; but that the world through him might be saved." The star, the prophecies, the angels, the manger — trace them all back and you arrive here, at love that gives itself away. The proper response to Advent is not merely to admire the story but to receive the Gift.',
   '["1 John 4:9-10", "Romans 8:32"]')
) AS v(day_number, text, refs)
WHERE p.slug = 'advent-waiting-for-the-light'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- ============================================================
-- Lent: The Road to the Cross (40 days) — base entries.
-- Seasonal (season_key 'lent'). Content run 2026-07-02.
-- Repentance -> the wilderness -> dying to self -> the
-- Suffering Servant (Isaiah 53 / Psalm 22) -> the cross.
-- Complements Holy Week (Palm Sunday -> Easter).
-- Idempotent: inserted only when the plan has zero entries.
-- ============================================================
INSERT INTO reading_plan_entries (plan_id, day_number, verse_ref, reflection, created_at)
SELECT p.id, v.day_number, v.verse_ref, v.reflection, NOW()
FROM reading_plans p,
(VALUES
  (1,  'Genesis 3:19',       'Lent begins with an honest word most of the year avoids: dust. Remember that you are mortal, that your days are numbered, that you will return to the ground. This is not despair but the ground of true repentance — a life measured against eternity.'),
  (2,  'Psalm 51:1-4',       'David, confronted with his sin, does not minimize or excuse. He throws himself on God''s mercy: blot out my transgressions, wash me, cleanse me. Repentance begins where self-defense ends.'),
  (3,  'Psalm 51:10-12',     'Beyond forgiveness, David asks for renovation: create in me a clean heart. He wants not just his record cleared but his heart remade — and only the God who created can create again.'),
  (4,  'Joel 2:12-13',       'God calls for a return that is inward, not theatrical: rend your heart, not your garments. Real repentance is not a performance of sorrow but a torn-open heart turned back toward a God who is gracious and merciful.'),
  (5,  'Isaiah 58:6-7',      'God rejects fasting that leaves the world untouched. The fast He chooses looses chains, frees the oppressed, feeds the hungry. Lenten self-denial that never spills into mercy has missed the point.'),
  (6,  'Matthew 4:1-4',      'Before His ministry, Jesus is driven into the wilderness to fast forty days and face the tempter. Where Israel failed in the desert, He stands — answering hunger not with bread but with the word of God.'),
  (7,  'Matthew 4:8-11',     'Offered all the kingdoms of the world without a cross, Jesus refuses the shortcut: worship God only. The road to His throne runs through Calvary, and He will not take the easier road the tempter offers.'),
  (8,  'Psalm 32:1-5',       'David describes the misery of unconfessed sin — bones wasting, strength drying up — and then the relief of confession: I acknowledged my sin, and thou forgavest. Hidden sin festers; confessed sin is covered.'),
  (9,  '1 John 1:8-9',       'To claim we have no sin is self-deception. But confession opens a sure promise: He is faithful and just to forgive. Repentance is not groveling to earn mercy but honesty that receives it.'),
  (10, 'Luke 15:17-20',      'The prodigal rehearses a servant''s speech, but the father will not let him finish it. While he is still a great way off, the father runs. Repentance is met not by a grudging welcome but by a sprinting embrace.'),
  (11, '2 Corinthians 7:9-10','Paul distinguishes two sorrows: godly sorrow that leads to repentance and life, and worldly sorrow that only produces death. The difference is direction — one turns us toward God, the other collapses inward.'),
  (12, 'Psalm 130:1-5',      'From the depths the psalmist cries, and finds his footing on one truth: if God marked iniquities, no one could stand — but there is forgiveness with Him. Mercy, not merit, is what makes God approachable.'),
  (13, 'Micah 7:18-19',      'Micah stands amazed at a God who pardons iniquity and delights in mercy — who casts our sins into the depths of the sea. The One we have sinned against is the same One most eager to forgive.'),
  (14, 'Ezekiel 36:25-27',   'God promises what we cannot do for ourselves: a new heart, a heart of flesh in place of stone, His own Spirit within. Lent exposes our need; only God can supply the transplant.'),
  (15, 'Matthew 16:24-26',   'Jesus names the terms plainly: deny yourself, take up your cross, follow me. The way to save your life is to lose it for His sake. The road to the cross is not only His to walk but ours to follow.'),
  (16, 'Luke 9:57-62',       'Following Jesus costs more than eager volunteers expect — no place to lay His head, no looking back. He will not soften the terms to win a crowd. The plough is set forward, toward the cross.'),
  (17, 'John 12:24-26',      'Jesus reveals the deep logic of the cross: a grain of wheat must fall and die to bear fruit. His death will bring a harvest — and the same pattern shapes every life that follows Him.'),
  (18, 'Galatians 2:20',     'Paul locates his whole identity at the cross: I am crucified with Christ. The old self is not improved but put to death, so that Christ may live in him. This is what dying to self actually means.'),
  (19, 'Romans 6:4-6',       'Baptism preaches a death and a resurrection: buried with Christ, raised to walk in newness of life. The old self was crucified with Him so that sin''s reign might be broken. Death is the doorway to new life.'),
  (20, 'Philippians 3:8-10', 'Paul counts every gain as loss for the surpassing worth of knowing Christ — including the fellowship of His sufferings. To know Him fully means sharing not only His resurrection power but His road of suffering.'),
  (21, 'Matthew 6:16-18',    'Jesus warns against fasting for an audience. Disfigure your face for others, and their notice is your whole reward. Fast for the Father who sees in secret, and the reward is Him.'),
  (22, 'James 4:8-10',       'The way up is down: draw near to God, cleanse your hands, humble yourselves, and He will lift you up. Lent is a season of deliberate lowering, trusting God to do the raising.'),
  (23, 'Isaiah 52:13-15',    'Seven centuries early, Isaiah unveils the Servant — exalted, yet with a visage marred more than any man. The paradox of the cross is here in seed: the highest glory reached through the deepest disfigurement.'),
  (24, 'Isaiah 53:1-3',      'The Servant grows up like a root out of dry ground — no beauty, no status, despised and rejected. A man of sorrows, acquainted with grief. He does not arrive in splendor but in the company of the suffering.'),
  (25, 'Isaiah 53:4-6',      'Here is the heart of the gospel, foretold: He was wounded for our transgressions, bruised for our iniquities. We wandered like sheep; the LORD laid on Him the iniquity of us all. The exchange is total.'),
  (26, 'Isaiah 53:7-9',      'Oppressed and afflicted, He opens not His mouth — a lamb led to the slaughter, silent before the shearers. The Servant does not resist or protest. He goes willingly, and He goes without deceit.'),
  (27, 'Isaiah 53:10-12',    'The strangest line in Scripture: it pleased the LORD to bruise Him. The cross was no accident but the deliberate plan of God, whose Servant pours out His soul unto death and bears the sin of many.'),
  (28, 'Psalm 22:1-5',       'A thousand years early, David''s cry becomes the Messiah''s: My God, my God, why hast thou forsaken me? Jesus will pray this psalm from the cross — abandonment given voice, yet still addressed to God.'),
  (29, 'Psalm 22:14-18',     'The psalm describes a death by crucifixion centuries before Rome invented it: bones out of joint, strength dried up, pierced hands and feet, garments parted by lot. David saw the cross from far off.'),
  (30, 'Zechariah 12:10',    'God speaks of a day when His people will look on Him whom they have pierced and mourn as for an only son. Even in the piercing, He pours out a spirit of grace — the wound becomes the place of repentance.'),
  (31, 'Luke 9:51',          'A quiet, decisive verse: when the time came, He stedfastly set His face to go to Jerusalem. Everything after this bends toward the cross. Jesus does not drift toward Calvary; He walks toward it on purpose.'),
  (32, 'Mark 10:32-34',      'On the road up to Jerusalem, Jesus goes ahead, and the disciples are afraid. He tells them plainly what waits: betrayal, mocking, scourging, death — and resurrection. He walks into it with open eyes.'),
  (33, 'Mark 10:45',         'In one sentence Jesus explains His whole mission: the Son of man came not to be served but to serve, and to give His life a ransom for many. The cross is not tragedy befalling Him but the purpose He came for.'),
  (34, 'John 10:17-18',      'No one takes Jesus'' life from Him; He lays it down of Himself. The cross is not Rome overpowering a victim but the Good Shepherd freely laying down His life for the sheep, with power to take it up again.'),
  (35, 'Hebrews 12:1-2',     'We run our race looking to Jesus, who for the joy set before Him endured the cross, despising its shame. He saw past the agony to the joy on the other side — and that vision carried Him through.'),
  (36, 'Matthew 26:36-39',   'In Gethsemane the weight lands fully: fallen on His face, Jesus asks that the cup pass. Yet He surrenders — not as I will, but as thou wilt. The victory of the cross is won first in a garden of surrender.'),
  (37, 'Isaiah 50:5-7',      'The Servant gives His back to the smiters and does not turn away. He sets His face like a flint, certain the Lord GOD will help Him. Obedience unto death is not weakness but resolve forged in trust.'),
  (38, 'John 19:1-6',        'Scourged, crowned with thorns, draped in mock purple, Jesus is led out, and Pilate says, Behold the man. The King of glory stands beaten and humiliated — and even here, He is more royal than His judges.'),
  (39, 'John 19:28-30',      'Knowing all was accomplished, Jesus says, It is finished, and gives up His spirit. It is not a cry of defeat but of completion — the work of salvation done, the debt paid in full, nothing left owing.'),
  (40, '1 Peter 2:24',       'Lent ends at the tree, where He bore our sins in His own body, so that we might die to sin and live to righteousness. By His stripes we are healed. The road to the cross was, all along, the road to our healing.')
) AS v(day_number, verse_ref, reflection)
WHERE p.slug = 'lent-road-to-the-cross'
  AND NOT EXISTS (SELECT 1 FROM reading_plan_entries WHERE plan_id = p.id);

-- Lent — text, titles, passages, prayer, application, question, context, memory flags.
UPDATE reading_plan_entries e
SET
  day_title       = v.day_title,
  passage_text    = v.passage_text,
  passage_refs    = v.passage_refs,
  prayer          = v.prayer,
  application     = v.application,
  question        = v.question,
  context_note    = v.context_note,
  content_type    = 'passage',
  is_memory_verse = v.is_memory_verse
FROM reading_plans p,
(VALUES
  (1, 'Dust to Dust',
   'In the sweat of thy face shalt thou eat bread, till thou return unto the ground; for out of it wast thou taken: for dust thou art, and unto dust shalt thou return.',
   '["Psalm 103:14", "Ecclesiastes 12:7"]',
   'Lord, I am dust, and my days are short. Teach me to number them, that I may spend this life on what will last. Let my mortality make me wise. Amen.',
   'Sit for a moment with the fact of your own mortality — not morbidly, but honestly. Ask God what He would have you stop delaying if your time is truly limited.',
   'How does remembering that you are mortal — dust, and returning to dust — change what you treat as urgent and what you treat as trivial?',
   'The traditional Ash Wednesday words — "remember that you are dust" — come straight from this verse. Lent opens by facing mortality honestly, the ground from which real repentance grows.',
   false),
  (2, 'Have Mercy on Me',
   'Have mercy upon me, O God, according to thy lovingkindness: according unto the multitude of thy tender mercies blot out my transgressions. Wash me throughly from mine iniquity, and cleanse me from my sin. For I acknowledge my transgressions: and my sin is ever before me. Against thee, thee only, have I sinned, and done this evil in thy sight: that thou mightest be justified when thou speakest, and be clear when thou judgest.',
   '["2 Samuel 12:13", "Psalm 32:5"]',
   'God, have mercy on me according to Your lovingkindness. I stop defending myself. I acknowledge my sin and throw myself on Your tender mercy. Amen.',
   'Name one specific sin honestly before God today — no minimizing, no excuse. Then receive, by faith, the mercy David reached for.',
   'David says "against thee only have I sinned." Why does true repentance ultimately reckon with God, even when others were also wronged?',
   'David wrote Psalm 51 after the prophet Nathan confronted him over Bathsheba and Uriah (2 Samuel 11-12). It is the Bible''s deepest model of a repentance that hides nothing.',
   false),
  (3, 'Create in Me a Clean Heart',
   'Create in me a clean heart, O God; and renew a right spirit within me. Cast me not away from thy presence; and take not thy holy spirit from me. Restore unto me the joy of thy salvation; and uphold me with thy free spirit.',
   '["Ezekiel 36:26", "Psalm 24:3-4"]',
   'Create in me a clean heart, O God. I cannot make myself new — only You can. Renew a right spirit in me and restore my joy. Amen.',
   'Ask God not just to forgive a sin but to change the desire beneath it. Name the heart-level thing you long for Him to recreate.',
   'David asks God to "create" a clean heart — the same verb as Genesis 1. Where do you need God to make something new rather than merely repair the old?',
   'The Hebrew verb bara ("create") is used only of God and only for what He alone can make. David knows forgiveness is not enough; he needs a heart remade from nothing.',
   true),
  (4, 'Rend Your Heart',
   'Therefore also now, saith the LORD, turn ye even to me with all your heart, and with fasting, and with weeping, and with mourning: And rend your heart, and not your garments, and turn unto the LORD your God: for he is gracious and merciful, slow to anger, and of great kindness, and repenteth him of the evil.',
   '["Joel 2:14", "Psalm 34:18"]',
   'Lord, I do not want a religion of torn clothes and untouched hearts. Rend my heart. Turn me back to You with everything I am, for You are gracious and merciful. Amen.',
   'Ask where your devotion has become outward performance. Choose one inward act of return today — honest prayer over public display.',
   'God says "rend your heart, and not your garments." Where might you be performing repentance outwardly while your heart stays intact?',
   'Tearing one''s garments was the ancient sign of grief. Joel insists God wants the inner reality, not the ritual gesture — a heart genuinely turned, not a garment torn.',
   false),
  (5, 'The Fast God Chooses',
   'Is not this the fast that I have chosen? to loose the bands of wickedness, to undo the heavy burdens, and to let the oppressed go free, and that ye break every yoke? Is it not to deal thy bread to the hungry, and that thou bring the poor that are cast out to thy house? when thou seest the naked, that thou cover him; and that thou hide not thyself from thine own flesh?',
   '["Matthew 25:35-36", "James 1:27"]',
   'Lord, let my fasting spill into mercy. Free me from a devotion that stays private while my neighbor goes hungry. Make my self-denial a doorway to love. Amen.',
   'Pair your Lenten fasting with one act of justice or mercy today — give something you would have consumed to someone in need.',
   'God ties true fasting to feeding the hungry and freeing the oppressed. How might your self-denial this season actually reach someone else?',
   'Israel fasted while ignoring injustice, and God rejected it. Isaiah 58 redefines fasting: not merely going without food, but loosening the chains that bind the vulnerable.',
   false),
  (6, 'Tempted in the Wilderness',
   'Then was Jesus led up of the Spirit into the wilderness to be tempted of the devil. And when he had fasted forty days and forty nights, he was afterward an hungred. And when the tempter came to him, he said, If thou be the Son of God, command that these stones be made bread. But he answered and said, It is written, Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God.',
   '["Deuteronomy 8:3", "Hebrews 4:15"]',
   'Lord Jesus, You met temptation with the word of God, not with Your own power. When I am tested, put Your word in my mouth and hold me steady. Amen.',
   'Identify the temptation that presses on you when you are depleted. Find one Scripture that answers it and keep it ready, as Jesus did.',
   'Jesus answered hunger with Scripture, not with a shortcut. What "stones into bread" shortcut are you most tempted to reach for when weary?',
   'Jesus'' forty days recall Israel''s forty years in the wilderness — but where Israel grumbled and failed, Jesus trusts and stands. Lent''s forty days trace His steps.',
   false),
  (7, 'Worship the Lord Only',
   'Again, the devil taketh him up into an exceeding high mountain, and sheweth him all the kingdoms of the world, and the glory of them; And saith unto him, All these things will I give thee, if thou wilt fall down and worship me. Then saith Jesus unto him, Get thee hence, Satan: for it is written, Thou shalt worship the Lord thy God, and him only shalt thou serve. Then the devil leaveth him, and, behold, angels came and ministered unto him.',
   '["Deuteronomy 6:13", "Philippians 2:8-9"]',
   'Lord, keep me from every crown that skips the cross. I will worship You alone and serve You only, even when a shortcut is offered. Amen.',
   'Name one "shortcut" you are tempted to take to get a good thing the wrong way. Refuse it today, choosing the harder, faithful road.',
   'Satan offered the kingdoms without the cross. Where are you tempted to grasp a good end through a compromised means?',
   'The tempter offered Jesus the world''s glory in exchange for worship — the throne without the cross. Jesus chose the long road to the same kingdoms, through Calvary.',
   false),
  (8, 'The Blessing of Confession',
   'Blessed is he whose transgression is forgiven, whose sin is covered. Blessed is the man unto whom the LORD imputeth not iniquity, and in whose spirit there is no guile. When I kept silence, my bones waxed old through my roaring all the day long. For day and night thy hand was heavy upon me: my moisture is turned into the drought of summer. Selah. I acknowledged my sin unto thee, and mine iniquity have I not hid. I said, I will confess my transgressions unto the LORD; and thou forgavest the iniquity of my sin.',
   '["Romans 4:7-8", "Proverbs 28:13"]',
   'Lord, I am tired of the weight of what I have hidden. I bring it into the light before You now. Thank You that the confessed sin is the covered sin. Amen.',
   'Break one silence today. Confess to God — and if wisdom allows, to a trusted person — something you have been carrying alone.',
   'David describes hidden sin as physically draining. What has staying silent about a sin been costing you?',
   'Psalm 32 is the flip side of Psalm 51 — the relief that follows confession. David describes concealment as a slow wasting, and honesty as sudden release.',
   false),
  (9, 'Faithful and Just to Forgive',
   'If we say that we have no sin, we deceive ourselves, and the truth is not in us. If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.',
   '["Psalm 32:5", "Isaiah 1:18"]',
   'Father, I will not pretend I have no sin. I confess it plainly, and I trust Your promise: You are faithful and just to forgive. Cleanse me now. Amen.',
   'Take John at his word today. Confess honestly, then refuse to keep grovelling — rest in the promise that He is "faithful and just to forgive."',
   'God is called "faithful and just" to forgive, not merely merciful. How does it steady you that forgiveness rests on His justice, secured at the cross?',
   'John says God is "just" to forgive — not overlooking sin, but forgiving on the righteous basis of Christ''s atonement. Mercy and justice meet at the cross.',
   false),
  (10, 'The Long Way Home',
   'And when he came to himself, he said, How many hired servants of my father''s have bread enough and to spare, and I perish with hunger! I will arise and go to my father, and will say unto him, Father, I have sinned against heaven, and before thee, And am no more worthy to be called thy son: make me as one of thy hired servants. And he arose, and came to his father. But when he was yet a great way off, his father saw him, and had compassion, and ran, and fell on his neck, and kissed him.',
   '["Luke 15:7", "Ephesians 2:4-5"]',
   'Father, I am the one who wandered, and You are the One who runs. Thank You that You meet my repentance not with a lecture but with an embrace. Amen.',
   'If you have been avoiding God out of shame, take one step home today — a single honest prayer. The Father is already running toward you.',
   'The son rehearsed a servant''s speech, but the father interrupted with an embrace. What false version of God''s welcome have you been believing?',
   'The father''s running was scandalous in that culture — dignified elders did not run. Jesus paints God as a Father who abandons His dignity to reach a returning child.',
   false),
  (11, 'Godly Sorrow',
   'Now I rejoice, not that ye were made sorry, but that ye sorrowed to repentance: for ye were made sorry after a godly manner, that ye might receive damage by us in nothing. For godly sorrow worketh repentance to salvation not to be repented of: but the sorrow of the world worketh death.',
   '["Psalm 51:17", "2 Corinthians 7:11"]',
   'Lord, give me godly sorrow that turns me toward You, not worldly sorrow that only sinks me in regret. Let my grief over sin lead to life. Amen.',
   'Notice whether your sorrow over a fault turns you toward God or just spirals into self-pity. Aim today''s sorrow at repentance, not mere regret.',
   'Paul distinguishes godly sorrow from worldly sorrow. How can you tell which one you are feeling when you fail?',
   'Worldly sorrow grieves the consequences of sin; godly sorrow grieves the sin itself and turns to God. One produces death, the other salvation without regret.',
   false),
  (12, 'Out of the Depths',
   'Out of the depths have I cried unto thee, O LORD. Lord, hear my voice: let thine ears be attentive to the voice of my supplications. If thou, LORD, shouldest mark iniquities, O Lord, who shall stand? But there is forgiveness with thee, that thou mayest be feared. I wait for the LORD, my soul doth wait, and in his word do I hope.',
   '["Psalm 103:10", "Micah 7:18"]',
   'Lord, from the depths I cry to You. If You kept a record of sins, I could not stand — but there is forgiveness with You. In Your word I put my hope. Amen.',
   'Bring your lowest place to God today, unedited. Then rest on the one fact that lets you stand: "there is forgiveness with thee."',
   'The psalmist says forgiveness leads to God being feared. Why might mercy, more than judgment, produce reverence in us?',
   'Psalm 130 is one of the "songs of ascents" pilgrims sang going up to Jerusalem. It names the only ground on which any sinner can stand before God: His forgiveness.',
   false),
  (13, 'Who Is a God Like This?',
   'Who is a God like unto thee, that pardoneth iniquity, and passeth by the transgression of the remnant of his heritage? he retaineth not his anger for ever, because he delighteth in mercy. He will turn again, he will have compassion upon us; he will subdue our iniquities; and thou wilt cast all their sins into the depths of the sea.',
   '["Exodus 34:6-7", "Psalm 103:12"]',
   'Lord, who is a God like You — delighting in mercy, casting my sins into the depths of the sea? I stand amazed at how eager You are to forgive. Amen.',
   'Picture the specific sin that haunts you being cast into the depths of the sea, as Micah promises. Refuse to keep dragging it back up.',
   'Micah says God "delights in mercy." Do you picture God as reluctant to forgive or delighting to? Where did that picture come from?',
   'Micah''s name means "Who is like the LORD?" — and he ends his book answering it: a God who delights in mercy and drowns sin in the sea, remembering it no more.',
   false),
  (14, 'A New Heart',
   'Then will I sprinkle clean water upon you, and ye shall be clean: from all your filthiness, and from all your idols, will I cleanse you. A new heart also will I give you, and a new spirit will I put within you: and I will take away the stony heart out of your flesh, and I will give you an heart of flesh. And I will put my spirit within you, and cause you to walk in my statutes, and ye shall keep my judgments, and do them.',
   '["Jeremiah 31:33", "2 Corinthians 5:17"]',
   'Lord, take out my heart of stone and give me a heart of flesh. Put Your Spirit in me and move me to walk in Your ways. Do what I cannot do for myself. Amen.',
   'Name one "stony" place in you — a hardness, a resistance to God. Ask Him for the heart transplant only He can perform.',
   'God promises to replace a heart of stone with a heart of flesh. Where do you sense hardness that only God can soften?',
   'Ezekiel prophesied to exiles who had failed under the old covenant. God promises a new-covenant miracle: not just forgiveness but an inward transformation, His Spirit within.',
   false),
  (15, 'Take Up Your Cross',
   'Then said Jesus unto his disciples, If any man will come after me, let him deny himself, and take up his cross, and follow me. For whosoever will save his life shall lose it: and whosoever will lose his life for my sake shall find it. For what is a man profited, if he shall gain the whole world, and lose his own soul? or what shall a man give in exchange for his soul?',
   '["Luke 9:23", "Galatians 6:14"]',
   'Lord, teach me the strange arithmetic of Your kingdom: that I find my life by losing it for You. Give me courage to take up my cross and follow. Amen.',
   'Identify one thing you are clinging to for "life." Practice loosening your grip on it today for Christ''s sake, trusting His promise that you will find life.',
   'Jesus says saving your life loses it, and losing it for Him finds it. What are you trying to save that He may be asking you to surrender?',
   'To "take up the cross" was not a metaphor to Jesus'' hearers — they had seen condemned men carry crossbeams to execution. He is calling for a death: the end of self-rule.',
   true),
  (16, 'No Looking Back',
   'And it came to pass, that, as they went in the way, a certain man said unto him, Lord, I will follow thee whithersoever thou goest. And Jesus said unto him, Foxes have holes, and birds of the air have nests; but the Son of man hath not where to lay his head. And another also said, Lord, I will follow thee; but let me first go bid them farewell, which are at home at my house. And Jesus said unto him, No man, having put his hand to the plough, and looking back, is fit for the kingdom of God.',
   '["Philippians 3:13-14", "Genesis 19:26"]',
   'Lord, I put my hand to the plough. Keep me from looking back at what I have left behind. Set my eyes forward on You. Amen.',
   'Name one thing behind you that keeps pulling your gaze backward. Consciously set your face forward today, refusing to relitigate what you have already surrendered.',
   'Jesus warns against looking back once the plough is set. What "backward glance" most tempts you away from wholehearted following?',
   'A ploughman who looks back cuts a crooked furrow. Jesus uses the image to describe divided discipleship — a hand on the plough but a heart still facing home.',
   false),
  (17, 'Unless a Grain of Wheat',
   'Verily, verily, I say unto you, Except a corn of wheat fall into the ground and die, it abideth alone: but if it die, it bringeth forth much fruit. He that loveth his life shall lose it; and he that hateth his life in this world shall keep it unto life eternal. If any man serve me, let him follow me; and where I am, there shall also my servant be: if any man serve me, him will my Father honour.',
   '["1 Corinthians 15:36", "John 15:5"]',
   'Lord, teach me the way of the seed: that death is the path to fruit. Where You are calling me to fall and die, give me faith that a harvest is coming. Amen.',
   'Where is God asking something in you to "fall into the ground and die" — an ambition, a comfort, a right? Offer it, trusting the harvest He promises.',
   'Jesus makes His own death the pattern for fruitfulness. What in your life might need to die for something greater to grow?',
   'Jesus spoke this as Greeks came seeking Him, days before His death. His answer: the harvest of the nations would come only through His falling into the ground like a seed.',
   false),
  (18, 'Crucified with Christ',
   'I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.',
   '["Romans 6:6", "Colossians 3:3"]',
   'Lord, I have been crucified with Christ. Let it not be I who live, but Christ in me. I live by faith in the Son who loved me and gave Himself for me. Amen.',
   'Wherever "I want" rises up to rule you today, answer it with Paul''s words: "not I, but Christ liveth in me." Let Christ, not self, decide one thing.',
   'Paul says the old "I" was crucified so Christ could live in him. What would change today if Christ, not self, were on the throne?',
   'This is the paradox of Christian identity: a death that leads to life. The self that must be its own god is crucified; the self that lives by Christ''s love is set free.',
   true),
  (19, 'Buried and Raised',
   'Therefore we are buried with him by baptism into death: that like as Christ was raised up from the dead by the glory of the Father, even so we also should walk in newness of life. For if we have been planted together in the likeness of his death, we shall be also in the likeness of his resurrection: Knowing this, that our old man is crucified with him, that the body of sin might be destroyed, that henceforth we should not serve sin.',
   '["Colossians 2:12", "Galatians 2:20"]',
   'Lord, I was buried with You and raised to walk in newness of life. Let sin no longer reign where You have already broken its power. Amen.',
   'Name one habit of the "old man" you have been treating as still alive. Reckon it dead with Christ today, and take one step in "newness of life."',
   'Paul says your old self is already crucified with Christ. How would you live differently if you truly believed sin''s reign was broken?',
   'Baptism dramatizes the gospel: going under the water as burial, rising as resurrection. Paul argues that union with Christ makes His death and life ours.',
   false),
  (20, 'That I May Know Him',
   'Yea doubtless, and I count all things but loss for the excellency of the knowledge of Christ Jesus my Lord: for whom I have suffered the loss of all things, and do count them but dung, that I may win Christ, And be found in him, not having mine own righteousness, which is of the law, but that which is through the faith of Christ, the righteousness which is of God by faith: That I may know him, and the power of his resurrection, and the fellowship of his sufferings, being made conformable unto his death.',
   '["Philippians 1:21", "Matthew 13:45-46"]',
   'Lord, let me count everything as loss to gain You. I want to know You — Your resurrection power and even the fellowship of Your sufferings. You are worth it all. Amen.',
   'List the things you tend to build your worth on. Hold them next to "the excellency of the knowledge of Christ," and let one of them go today.',
   'Paul counts all his gains as loss to know Christ. What would you have to release to say the same and mean it?',
   'Paul, once proud of his religious résumé, calls it "dung" beside knowing Christ. To know Him fully includes sharing His sufferings, not only His power.',
   false),
  (21, 'When You Fast',
   'Moreover when ye fast, be not, as the hypocrites, of a sad countenance: for they disfigure their faces, that they may appear unto men to fast. Verily I say unto you, They have their reward. But thou, when thou fastest, anoint thine head, and wash thy face; That thou appear not unto men to fast, but unto thy Father which is in secret: and thy Father, which seeth in secret, shall reward thee openly.',
   '["Matthew 6:6", "Colossians 3:23"]',
   'Father, let my devotion be for Your eyes, not for an audience. When I fast or pray, let it be to You in secret, and let that be reward enough. Amen.',
   'Do one act of devotion today that no one but God will ever know about. Let the secrecy itself be part of the offering.',
   'Jesus warns that seeking others'' notice becomes "your reward." Where does your devotion quietly angle for an audience?',
   'Jesus assumes His followers will fast ("when," not "if"), but warns against the performance of piety. The Father who sees in secret is the only audience worth having.',
   false),
  (22, 'Draw Near to God',
   'Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded. Be afflicted, and mourn, and weep: let your laughter be turned to mourning, and your joy to heaviness. Humble yourselves in the sight of the Lord, and he shall lift you up.',
   '["Isaiah 57:15", "1 Peter 5:6"]',
   'Lord, I draw near to You, trusting Your promise to draw near to me. I humble myself before You; lift me up in Your time, not mine. Amen.',
   'Take one deliberate step of drawing near today — extended prayer, silence, confession — trusting the promise that God will draw near in return.',
   'James pairs drawing near with humbling ourselves. Why is lowering yourself the way up in God''s kingdom?',
   'James echoes the prophets: God dwells with the humble and contrite. The way up is down — a truth Lent enacts through humbling practices of confession and self-denial.',
   false),
  (23, 'Behold My Servant',
   'Behold, my servant shall deal prudently, he shall be exalted and extolled, and be very high. As many were astonied at thee; his visage was so marred more than any man, and his form more than the sons of men: So shall he sprinkle many nations; the kings shall shut their mouths at him: for that which had not been told them shall they see; and that which they had not heard shall they consider.',
   '["Philippians 2:9-11", "Isaiah 42:1"]',
   'Lord, You reached the highest glory through the deepest disfigurement. Teach me that Your kingdom exalts through lowliness and wins through wounds. Amen.',
   'Where you assume greatness requires impressiveness, look today for God at work through something marred, weak, or overlooked.',
   'Isaiah says the Servant is both "very high" and "marred more than any man." How does the cross redefine what glory looks like?',
   'This begins the fourth and greatest of Isaiah''s "Servant Songs." Written centuries before Christ, it describes a suffering that leads, paradoxically, to exaltation.',
   false),
  (24, 'Despised and Rejected',
   'Who hath believed our report? and to whom is the arm of the LORD revealed? For he shall grow up before him as a tender plant, and as a root out of a dry ground: he hath no form nor comeliness; and when we shall see him, there is no beauty that we should desire him. He is despised and rejected of men; a man of sorrows, and acquainted with grief: and we hid as it were our faces from him; he was despised, and we esteemed him not.',
   '["John 1:11", "Hebrews 4:15"]',
   'Man of sorrows, You were despised and rejected, yet You came near to the suffering. Thank You that You understand grief from the inside. Draw near to me in mine. Amen.',
   'Bring one grief or rejection you carry to the "man of sorrows" who knows it firsthand. Let His acquaintance with grief be a comfort today.',
   'The Messiah came without beauty or status, "acquainted with grief." How does a suffering Savior meet you differently than a distant, glorious one?',
   'Isaiah foresaw a Messiah with "no beauty that we should desire him" — the opposite of every human expectation of a conquering king. He would be recognized only by faith.',
   false),
  (25, 'He Was Wounded for Us',
   'Surely he hath borne our griefs, and carried our sorrows: yet we did esteem him stricken, smitten of God, and afflicted. But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed. All we like sheep have gone astray; we have turned every one to his own way; and the LORD hath laid on him the iniquity of us all.',
   '["1 Peter 2:24", "Romans 4:25"]',
   'Lord Jesus, You were wounded for my transgressions and bruised for my iniquities. The punishment that brought my peace fell on You. I can never thank You enough. Amen.',
   'Read Isaiah 53:5 slowly, replacing "our" and "we" with "my" and "I." Let the personal weight of the exchange land on you today.',
   'Isaiah says "the LORD hath laid on him the iniquity of us all." What does it mean to you that your specific sin was laid on Christ?',
   'This is the clearest Old Testament picture of substitutionary atonement: our transgressions, His wounds; our peace, His chastisement. Written 700 years before the cross.',
   true),
  (26, 'Led as a Lamb',
   'He was oppressed, and he was afflicted, yet he opened not his mouth: he is brought as a lamb to the slaughter, and as a sheep before her shearers is dumb, so he openeth not his mouth. He was taken from prison and from judgment: and who shall declare his generation? for he was cut off out of the land of the living: for the transgression of my people was he stricken. And he made his grave with the wicked, and with the rich in his death; because he had done no violence, neither was any deceit in his mouth.',
   '["Acts 8:32-35", "1 Peter 2:23"]',
   'Lamb of God, You went silent to the slaughter for me. When I am wronged, teach me Your quiet strength — to entrust myself to the Father rather than defend myself. Amen.',
   'The next time you are tempted to defend yourself today, pause and consider the silent Lamb. Choose, once, to entrust the outcome to God instead.',
   'The Servant "opened not his mouth" though innocent. Where is God inviting you to trust Him rather than justify yourself?',
   'The Ethiopian official was reading this exact passage when Philip explained it was about Jesus (Acts 8). The silent, sacrificial Lamb is the key to the whole gospel.',
   false),
  (27, 'It Pleased the Lord',
   'Yet it pleased the LORD to bruise him; he hath put him to grief: when thou shalt make his soul an offering for sin, he shall see his seed, he shall prolong his days, and the pleasure of the LORD shall prosper in his hand. He shall see of the travail of his soul, and shall be satisfied: by his knowledge shall my righteous servant justify many; for he shall bear their iniquities. He hath poured out his soul unto death: and he was numbered with the transgressors; and he bare the sin of many, and made intercession for the transgressors.',
   '["Acts 2:23", "Romans 3:25"]',
   'Father, the cross was no accident but Your deliberate love. Thank You that the Servant''s travail was not wasted — He is satisfied, and by it many, including me, are justified. Amen.',
   'Sit with the hard phrase "it pleased the LORD to bruise him." Let it deepen your sense that the cross was intentional love, not tragic misfortune, and thank God for it.',
   'The cross is called the LORD''s pleasure and plan. How does knowing the crucifixion was purposed, not accidental, change how you see it?',
   'The most jarring line in Isaiah 53: it "pleased" God to bruise His Servant — not because He delighted in suffering, but because through it He would justify many and be satisfied.',
   false),
  (28, 'Why Have You Forsaken Me?',
   'My God, my God, why hast thou forsaken me? why art thou so far from helping me, and from the words of my roaring? O my God, I cry in the daytime, but thou hearest not; and in the night season, and am not silent. But thou art holy, O thou that inhabitest the praises of Israel. Our fathers trusted in thee: they trusted, and thou didst deliver them. They cried unto thee, and were delivered: they trusted in thee, and were not confounded.',
   '["Matthew 27:46", "Psalm 22:24"]',
   'Lord, You entered even the darkness of feeling forsaken, so that I would never be truly abandoned. When You feel far, help me, like the psalmist, to keep crying out to You. Amen.',
   'If you feel distant from God, follow the psalm''s pattern today: voice the honest lament, then deliberately recall one time God proved faithful before.',
   'Jesus prayed this psalm''s first line from the cross. What does it mean that even His cry of abandonment was still addressed to God?',
   'Psalm 22 opens in apparent abandonment but turns to triumph by its end. When Jesus quoted its first line on the cross, He was invoking the whole psalm — including its victory.',
   false),
  (29, 'They Pierced My Hands',
   'I am poured out like water, and all my bones are out of joint: my heart is like wax; it is melted in the midst of my bowels. My strength is dried up like a potsherd; and my tongue cleaveth to my jaws; and thou hast brought me into the dust of death. For dogs have compassed me: the assembly of the wicked have inclosed me: they pierced my hands and my feet. I may tell all my bones: they look and stare upon me. They part my garments among them, and cast lots upon my vesture.',
   '["John 19:23-24", "John 20:25"]',
   'Lord, You endured every detail of this suffering for me — pierced hands, parted garments, bones out of joint. I bow before the price You paid. Amen.',
   'Compare this psalm with the crucifixion accounts today. Let the precision of the prophecy deepen your trust that God''s word is sure.',
   'David described death by crucifixion centuries before it existed as a Roman practice. What does such precise prophecy stir in you about Scripture?',
   'Psalm 22:16-18 describes pierced hands and feet and garments divided by lot — details fulfilled at Golgotha, written perhaps a thousand years before and before crucifixion was invented.',
   false),
  (30, 'Whom They Pierced',
   'And I will pour upon the house of David, and upon the inhabitants of Jerusalem, the spirit of grace and of supplications: and they shall look upon me whom they have pierced, and they shall mourn for him, as one mourneth for his only son, and shall be in bitterness for him, as one that is in bitterness for his firstborn.',
   '["John 19:37", "Revelation 1:7"]',
   'Lord, when I look on the One I have pierced, give me the spirit of grace that turns sorrow into repentance, not despair. Let my mourning lead me home. Amen.',
   'Look honestly today at the cost of the cross — that your sin helped pierce Him. Let it produce not shame that hides but the grace-given mourning that draws near.',
   'God pours out "a spirit of grace" alongside the piercing. How can honest grief over sin become a doorway to grace rather than despair?',
   'Zechariah foresaw people looking on "me whom they have pierced" — God speaking of Himself as pierced. John quotes it at the cross; the wound becomes the place of repentance.',
   false),
  (31, 'Set His Face to Jerusalem',
   'And it came to pass, when the time was come that he should be received up, he stedfastly set his face to go to Jerusalem.',
   '["Isaiah 50:7", "Luke 18:31"]',
   'Lord Jesus, You set Your face toward the cross on purpose, for me. Thank You that You did not drift toward Calvary but walked there deliberately, out of love. Amen.',
   'Consider one hard, God-given path you have been avoiding. Following Jesus'' example, take one deliberate step toward it today rather than drifting.',
   'Jesus "stedfastly set his face" toward the cross. What does His deliberate resolve teach you about facing hard things God has called you to?',
   'From this verse Luke''s Gospel turns decisively toward Jerusalem. Everything after it is shadowed by the cross Jesus is walking toward with open eyes and fixed resolve.',
   false),
  (32, 'Going Up to Jerusalem',
   'And they were in the way going up to Jerusalem; and Jesus went before them: and they were amazed; and as they followed, they were afraid. And he took again the twelve, and began to tell them what things should happen unto him, Saying, Behold, we go up to Jerusalem; and the Son of man shall be delivered unto the chief priests, and unto the scribes; and they shall condemn him to death, and shall deliver him to the Gentiles: And they shall mock him, and shall scourge him, and shall spit upon him, and shall kill him: and the third day he shall rise again.',
   '["Mark 8:31", "John 10:18"]',
   'Lord, You told Your disciples plainly what waited for You, and walked into it anyway. Give me courage to follow You even when the road ahead looks costly. Amen.',
   'Where fear of what "might happen" is keeping you from obedience, remember Jesus walked knowingly into far worse. Take the faithful next step despite the fear.',
   'Jesus predicted His death in detail, yet kept walking toward it. How does His clear-eyed courage speak to a fear you are carrying?',
   'This is the third and most detailed of Jesus'' passion predictions. He names the betrayal, mocking, scourging, and death — and, each time, the resurrection on the third day.',
   false),
  (33, 'A Ransom for Many',
   'For even the Son of man came not to be ministered unto, but to minister, and to give his life a ransom for many.',
   '["1 Timothy 2:5-6", "Isaiah 53:11"]',
   'Lord Jesus, You came not to be served but to serve, and to give Your life as my ransom. Let me receive it, and let me follow You into a life of serving. Amen.',
   'Do one act of lowly service today, unasked and unseen, in imitation of the One who came "not to be ministered unto, but to minister."',
   'Jesus defines His mission as service and ransom. How does His example reshape your idea of greatness?',
   'A "ransom" (lutron) was the price paid to free a slave or captive. Jesus frames His death not as tragedy but as the purchase price of freedom for "many."',
   false),
  (34, 'I Lay Down My Life',
   'Therefore doth my Father love me, because I lay down my life, that I might take it again. No man taketh it from me, but I lay it down of myself. I have power to lay it down, and I have power to take it again. This commandment have I received of my Father.',
   '["John 15:13", "Philippians 2:8"]',
   'Good Shepherd, no one took Your life — You laid it down for me by Your own power and love. I entrust myself wholly to a Savior who chose the cross. Amen.',
   'Where you feel like a helpless victim of your circumstances today, remember Jesus was never a victim. Ask Him for the freedom to choose love as He did.',
   'Jesus insists no one took His life; He laid it down freely. How does it change the cross to see it as His choice rather than His defeat?',
   'The cross was not Rome overpowering a helpless man. Jesus states plainly that He lays down His life "of myself," with the authority to take it up again — the Shepherd, not the victim.',
   false),
  (35, 'Looking unto Jesus',
   'Wherefore seeing we also are compassed about with so great a cloud of witnesses, let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before us, Looking unto Jesus the author and finisher of our faith; who for the joy that was set before him endured the cross, despising the shame, and is set down at the right hand of the throne of God.',
   '["Philippians 3:14", "1 Corinthians 9:24-25"]',
   'Lord, help me lay aside every weight and run my race looking to You. As You endured the cross for joy set ahead, let me endure my trials with my eyes on the joy to come. Amen.',
   'Name one "weight" or besetting sin slowing your race. Lay it aside deliberately today, and fix your eyes on Jesus rather than on the difficulty.',
   'Jesus endured the cross "for the joy that was set before him." What joy on the far side of obedience might God be asking you to fix your eyes on?',
   'The image is an athlete stripping off every hindrance to run. Jesus is both the example who ran before us and the goal we run toward — the author and finisher of faith.',
   false),
  (36, 'Not My Will',
   'Then cometh Jesus with them unto a place called Gethsemane, and saith unto the disciples, Sit ye here, while I go and pray yonder. And he took with him Peter and the two sons of Zebedee, and began to be sorrowful and very heavy. Then saith he unto them, My soul is exceeding sorrowful, even unto death: tarry ye here, and watch with me. And he went a little further, and fell on his face, and prayed, saying, O my Father, if it be possible, let this cup pass from me: nevertheless not as I will, but as thou wilt.',
   '["Luke 22:42", "Hebrews 5:7-8"]',
   'Father, in my own Gethsemanes, teach me to pray as Jesus did: honest about my dread, yet surrendered to Your will. Not as I will, but as You will. Amen.',
   'Bring one thing you desperately want changed to God today. Voice the honest ask — then, like Jesus, add and mean the words: "nevertheless, not as I will, but as thou wilt."',
   'Jesus asked for the cup to pass, yet surrendered to the Father''s will. How do you hold honest desire and real surrender together in prayer?',
   'Gethsemane shows the cost was real — Jesus was "sorrowful even unto death." The victory of the cross was won first here, in a garden, through an agonized yes to the Father.',
   false),
  (37, 'I Set My Face Like Flint',
   'The Lord GOD hath opened mine ear, and I was not rebellious, neither turned away back. I gave my back to the smiters, and my cheeks to them that plucked off the hair: I hid not my face from shame and spitting. For the Lord GOD will help me; therefore shall I not be confounded: therefore have I set my face like a flint, and I know that I shall not be ashamed.',
   '["Luke 9:51", "1 Peter 2:23"]',
   'Lord, You gave Your back to the smiters and set Your face like flint, sure the Father would help You. Give me that same steadfast trust when obedience costs me. Amen.',
   'Where obedience may bring you "shame and spitting" — criticism, misunderstanding — set your face like flint today, trusting that God will help and not fail you.',
   'The Servant endures shame by trusting God will help Him. What steadies you to endure hard obedience — the outcome you can see, or the God you cannot?',
   'This third Servant Song shows the Messiah''s resolve: obedient, unflinching, certain of vindication. "Set my face like a flint" is the same resolve Luke describes as Jesus turned toward Jerusalem.',
   false),
  (38, 'Behold the Man',
   'Then Pilate therefore took Jesus, and scourged him. And the soldiers platted a crown of thorns, and put it on his head, and they put on him a purple robe, And said, Hail, King of the Jews! and they smote him with their hands. Pilate therefore went forth again, and saith unto them, Behold, I bring him forth to you, that ye may know that I find no fault in him. Then came Jesus forth, wearing the crown of thorns, and the purple robe. And Pilate saith unto them, Behold the man!',
   '["Isaiah 52:14", "1 Peter 2:24"]',
   'Lord, they crowned You with thorns and mocked Your kingship — yet You were more royal in Your suffering than any king on a throne. I behold You, and I worship. Amen.',
   'Sit with the image of the scourged, thorn-crowned Christ. Do not rush past it. Let the cost of your redemption move you to gratitude before the day fills up.',
   'The soldiers meant "Hail, King" as mockery, but it was true. Where do you see God''s glory hidden in what looks like humiliation?',
   'The crown of thorns and purple robe were a soldier''s cruel joke — dressing a condemned man as royalty. John records it knowing the deeper truth: the mocked man really is the King.',
   false),
  (39, 'It Is Finished',
   'After this, Jesus knowing that all things were now accomplished, that the scripture might be fulfilled, saith, I thirst. Now there was set a vessel full of vinegar: and they filled a spunge with vinegar, and put it upon hyssop, and put it to his mouth. When Jesus therefore had received the vinegar, he said, It is finished: and he bowed his head, and gave up the ghost.',
   '["Colossians 2:14", "Hebrews 10:12-14"]',
   'Lord Jesus, "It is finished." The work of my salvation is complete — there is nothing left for me to add. I rest in Your finished work today. Amen.',
   'Wherever you are still trying to earn what Christ has already secured, stop today. Say His words over that striving: "It is finished."',
   'Jesus said "It is finished," not "I am finished." What is the difference, and what does it mean that the work of salvation is complete?',
   'The Greek word tetelestai ("It is finished") was written across paid bills to mean "paid in full." Jesus'' final word from the cross was not a sigh of defeat but a shout of completion.',
   true),
  (40, 'By His Stripes',
   'Who his own self bare our sins in his own body on the tree, that we, being dead to sins, should live unto righteousness: by whose stripes ye were healed. For ye were as sheep going astray; but are now returned unto the Shepherd and Bishop of your souls.',
   '["Isaiah 53:5", "1 Peter 2:25"]',
   'Lord Jesus, You bore my sins in Your body on the tree so that I could die to sin and live to righteousness. By Your stripes I am healed. Thank You for the road You walked for me. Amen.',
   'As Lent closes at the cross, receive the healing it purchased. Name one way you want to "live unto righteousness" now, in response to what He bore for you.',
   'The whole road of Lent ends here: "by his stripes ye were healed." How does seeing the cross as your healing change the way you carry your wounds and your sin?',
   'Peter gathers Isaiah 53 into a sentence, pointing to the cross ("the tree") as the place our sins were borne. The road to the cross was, all along, the road to our healing and return.',
   true)
) AS v(day_number, day_title, passage_text, passage_refs, prayer, application, question, context_note, is_memory_verse)
WHERE p.slug = 'lent-road-to-the-cross'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Lent — comprehension check questions (all 40 days).
UPDATE reading_plan_entries e
SET
  quiz_question    = v.question,
  quiz_options     = v.options,
  quiz_explanation = v.explanation
FROM reading_plans p,
(VALUES
  (1,  'According to Genesis 3:19, what will the man return to?',
       '[{"label":"A","text":"The garden","correct":false},{"label":"B","text":"Dust","correct":true},{"label":"C","text":"The sea","correct":false}]',
       '"For dust thou art, and unto dust shalt thou return." Lent begins by facing mortality honestly — the traditional Ash Wednesday words come from this verse.'),
  (2,  'On what basis does David ask God to blot out his transgressions?',
       '[{"label":"A","text":"His good deeds","correct":false},{"label":"B","text":"God''s lovingkindness and tender mercies","correct":true},{"label":"C","text":"His royal position","correct":false}]',
       'David appeals only to "thy lovingkindness" and "the multitude of thy tender mercies" — repentance throws itself on God''s mercy, not on merit.'),
  (3,  'What does David ask God to create in Psalm 51:10?',
       '[{"label":"A","text":"A clean heart","correct":true},{"label":"B","text":"A new kingdom","correct":false},{"label":"C","text":"A long life","correct":false}]',
       '"Create in me a clean heart, O God." David wants not just forgiveness but a heart remade — using bara, the verb for what God alone can create.'),
  (4,  'In Joel 2:13, what does God say to rend instead of garments?',
       '[{"label":"A","text":"Your garments","correct":false},{"label":"B","text":"Your heart","correct":true},{"label":"C","text":"The veil","correct":false}]',
       '"Rend your heart, and not your garments." God wants inward return, not the outward performance of grief.'),
  (5,  'What kind of fast has God chosen in Isaiah 58?',
       '[{"label":"A","text":"To loose bands of wickedness and free the oppressed","correct":true},{"label":"B","text":"To abstain from all food for a week","correct":false},{"label":"C","text":"To fast in the public square","correct":false}]',
       'The fast God chooses is "to loose the bands of wickedness... to let the oppressed go free" and feed the hungry — self-denial that reaches others.'),
  (6,  'How does Jesus answer the temptation to turn stones to bread?',
       '[{"label":"A","text":"Man shall not live by bread alone","correct":true},{"label":"B","text":"It is not yet my time","correct":false},{"label":"C","text":"Get thee behind me","correct":false}]',
       '"Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God." Jesus meets hunger with Scripture, not a shortcut.'),
  (7,  'What does Jesus command in response to the offer of the kingdoms?',
       '[{"label":"A","text":"Worship the Lord thy God, and him only serve","correct":true},{"label":"B","text":"Give me the kingdoms now","correct":false},{"label":"C","text":"Wait until my hour","correct":false}]',
       '"Thou shalt worship the Lord thy God, and him only shalt thou serve." Jesus refuses the crown that skips the cross.'),
  (8,  'Whom does David call "blessed" in Psalm 32?',
       '[{"label":"A","text":"The one who never sins","correct":false},{"label":"B","text":"He whose transgression is forgiven","correct":true},{"label":"C","text":"The one who fasts often","correct":false}]',
       '"Blessed is he whose transgression is forgiven, whose sin is covered." The blessing is not sinlessness but forgiveness.'),
  (9,  'According to 1 John 1:9, if we confess our sins, God is:',
       '[{"label":"A","text":"Faithful and just to forgive","correct":true},{"label":"B","text":"Reluctant but willing","correct":false},{"label":"C","text":"Slow to respond","correct":false}]',
       '"He is faithful and just to forgive us our sins" — forgiveness rests on God''s justice, secured at the cross, not merely on His leniency.'),
  (10, 'What did the father do while the prodigal was still far off?',
       '[{"label":"A","text":"Waited for an apology","correct":false},{"label":"B","text":"Ran and embraced him","correct":true},{"label":"C","text":"Sent a servant","correct":false}]',
       '"When he was yet a great way off, his father saw him, and had compassion, and ran, and fell on his neck." Repentance is met with a sprinting embrace.'),
  (11, 'What does godly sorrow produce, according to 2 Corinthians 7:10?',
       '[{"label":"A","text":"Repentance to salvation","correct":true},{"label":"B","text":"Lasting regret","correct":false},{"label":"C","text":"Despair","correct":false}]',
       '"Godly sorrow worketh repentance to salvation not to be repented of: but the sorrow of the world worketh death." The difference is direction.'),
  (12, 'In Psalm 130, if God marked iniquities, who could stand?',
       '[{"label":"A","text":"Only the priests","correct":false},{"label":"B","text":"No one","correct":true},{"label":"C","text":"The righteous","correct":false}]',
       '"If thou, LORD, shouldest mark iniquities, O Lord, who shall stand? But there is forgiveness with thee." Mercy, not merit, makes God approachable.'),
  (13, 'In what does God delight, according to Micah 7:18?',
       '[{"label":"A","text":"Judgment","correct":false},{"label":"B","text":"Sacrifice","correct":false},{"label":"C","text":"Mercy","correct":true}]',
       '"He retaineth not his anger for ever, because he delighteth in mercy." God casts our sins "into the depths of the sea."'),
  (14, 'What does God promise to replace the stony heart with?',
       '[{"label":"A","text":"A heart of flesh","correct":true},{"label":"B","text":"A heart of gold","correct":false},{"label":"C","text":"A stronger stone","correct":false}]',
       '"I will take away the stony heart... and I will give you an heart of flesh." God promises an inward transplant, plus His Spirit within.'),
  (15, 'What three things does Jesus say a follower must do in Matthew 16:24?',
       '[{"label":"A","text":"Fast, pray, and give","correct":false},{"label":"B","text":"Deny himself, take up his cross, follow","correct":true},{"label":"C","text":"Believe, be baptized, wait","correct":false}]',
       '"Let him deny himself, and take up his cross, and follow me." The way to save your life is to lose it for His sake.'),
  (16, 'Who does Jesus say is unfit for the kingdom in Luke 9:62?',
       '[{"label":"A","text":"One who puts his hand to the plough and looks back","correct":true},{"label":"B","text":"One who has no possessions","correct":false},{"label":"C","text":"One who doubts","correct":false}]',
       '"No man, having put his hand to the plough, and looking back, is fit for the kingdom of God." A backward glance cuts a crooked furrow.'),
  (17, 'What must a grain of wheat do to bring forth fruit?',
       '[{"label":"A","text":"Be watered daily","correct":false},{"label":"B","text":"Fall into the ground and die","correct":true},{"label":"C","text":"Stay whole","correct":false}]',
       '"Except a corn of wheat fall into the ground and die, it abideth alone: but if it die, it bringeth forth much fruit." Death is the path to harvest.'),
  (18, 'According to Galatians 2:20, who lives in Paul?',
       '[{"label":"A","text":"Christ","correct":true},{"label":"B","text":"The law","correct":false},{"label":"C","text":"His better self","correct":false}]',
       '"I am crucified with Christ... yet not I, but Christ liveth in me." The old self is put to death so that Christ may live.'),
  (19, 'We are buried with Christ by baptism so that we might do what?',
       '[{"label":"A","text":"Walk in newness of life","correct":true},{"label":"B","text":"Escape the world","correct":false},{"label":"C","text":"Earn our salvation","correct":false}]',
       '"Buried with him by baptism into death: that... even so we also should walk in newness of life." Death is the doorway to new life.'),
  (20, 'What does Paul count all things but loss for?',
       '[{"label":"A","text":"The knowledge of Christ","correct":true},{"label":"B","text":"His reputation","correct":false},{"label":"C","text":"The law","correct":false}]',
       'Paul counts everything "but loss for the excellency of the knowledge of Christ Jesus" — even to share "the fellowship of his sufferings."'),
  (21, 'For whose notice should fasting be done, according to Matthew 6?',
       '[{"label":"A","text":"The Father who sees in secret","correct":true},{"label":"B","text":"The congregation","correct":false},{"label":"C","text":"No one at all","correct":false}]',
       'Fast "unto thy Father which is in secret: and thy Father, which seeth in secret, shall reward thee." The only audience worth having is God.'),
  (22, 'What does James 4:8 promise if we draw near to God?',
       '[{"label":"A","text":"He will draw near to us","correct":true},{"label":"B","text":"He will test us","correct":false},{"label":"C","text":"He will wait","correct":false}]',
       '"Draw nigh to God, and he will draw nigh to you." The way up is down — humble yourselves, and He will lift you up.'),
  (23, 'In Isaiah 52:14, what was "marred more than any man"?',
       '[{"label":"A","text":"His visage (appearance)","correct":true},{"label":"B","text":"His reputation","correct":false},{"label":"C","text":"His words","correct":false}]',
       'The Servant''s "visage was so marred more than any man" — yet He is also "exalted and extolled." The cross reaches glory through disfigurement.'),
  (24, 'How is the Servant described in Isaiah 53:3?',
       '[{"label":"A","text":"Mighty and feared","correct":false},{"label":"B","text":"Despised and rejected, a man of sorrows","correct":true},{"label":"C","text":"Robed in splendor","correct":false}]',
       '"He is despised and rejected of men; a man of sorrows, and acquainted with grief." The Messiah came without beauty or status.'),
  (25, 'According to Isaiah 53:5, why was the Servant wounded?',
       '[{"label":"A","text":"For His own sins","correct":false},{"label":"B","text":"For our transgressions","correct":true},{"label":"C","text":"By accident","correct":false}]',
       '"He was wounded for our transgressions, he was bruised for our iniquities... and with his stripes we are healed." The exchange is total.'),
  (26, 'To what is the silent Servant compared in Isaiah 53:7?',
       '[{"label":"A","text":"A lion","correct":false},{"label":"B","text":"A lamb to the slaughter","correct":true},{"label":"C","text":"A shepherd","correct":false}]',
       '"He is brought as a lamb to the slaughter... so he openeth not his mouth." He goes willingly and without protest.'),
  (27, 'Whose plan was it to bruise the Servant, according to Isaiah 53:10?',
       '[{"label":"A","text":"Rome''s","correct":false},{"label":"B","text":"The crowd''s","correct":false},{"label":"C","text":"The LORD''s","correct":true}]',
       '"Yet it pleased the LORD to bruise him." The cross was no accident but the deliberate, saving plan of God.'),
  (28, 'What are the opening words of Psalm 22?',
       '[{"label":"A","text":"The LORD is my shepherd","correct":false},{"label":"B","text":"My God, my God, why hast thou forsaken me?","correct":true},{"label":"C","text":"Out of the depths I cry","correct":false}]',
       '"My God, my God, why hast thou forsaken me?" — the very words Jesus prayed from the cross, invoking the whole psalm, victory included.'),
  (29, 'What does Psalm 22:16 say was done to the sufferer''s hands and feet?',
       '[{"label":"A","text":"They were bound","correct":false},{"label":"B","text":"They were pierced","correct":true},{"label":"C","text":"They were washed","correct":false}]',
       '"They pierced my hands and my feet" — a description of crucifixion written centuries before Rome practiced it.'),
  (30, 'In Zechariah 12:10, on whom will the people look and mourn?',
       '[{"label":"A","text":"Him whom they have pierced","correct":true},{"label":"B","text":"A fallen king","correct":false},{"label":"C","text":"The temple","correct":false}]',
       '"They shall look upon me whom they have pierced, and they shall mourn." God pours out a spirit of grace even in the piercing.'),
  (31, 'Where did Jesus stedfastly set His face to go in Luke 9:51?',
       '[{"label":"A","text":"Galilee","correct":false},{"label":"B","text":"Jerusalem","correct":true},{"label":"C","text":"The wilderness","correct":false}]',
       '"He stedfastly set his face to go to Jerusalem." Jesus did not drift toward the cross; He walked there on purpose.'),
  (32, 'What did Jesus say would happen on the third day, in Mark 10:34?',
       '[{"label":"A","text":"He shall rise again","correct":true},{"label":"B","text":"The temple would fall","correct":false},{"label":"C","text":"He would return to Galilee","correct":false}]',
       'After naming His betrayal, mocking, and death, Jesus adds: "and the third day he shall rise again." He walked in with open eyes.'),
  (33, 'Why did the Son of Man come, according to Mark 10:45?',
       '[{"label":"A","text":"To be served","correct":false},{"label":"B","text":"To give His life a ransom for many","correct":true},{"label":"C","text":"To restore Israel''s throne","correct":false}]',
       '"The Son of man came not to be ministered unto, but to minister, and to give his life a ransom for many." The cross was His purpose.'),
  (34, 'According to John 10:18, who takes Jesus'' life from Him?',
       '[{"label":"A","text":"Rome","correct":false},{"label":"B","text":"No one; He lays it down of Himself","correct":true},{"label":"C","text":"The chief priests","correct":false}]',
       '"No man taketh it from me, but I lay it down of myself." The cross is the Shepherd''s free choice, with power to take His life up again.'),
  (35, 'For what did Jesus endure the cross, according to Hebrews 12:2?',
       '[{"label":"A","text":"The joy set before Him","correct":true},{"label":"B","text":"To prove a point","correct":false},{"label":"C","text":"Out of obligation only","correct":false}]',
       '"Who for the joy that was set before him endured the cross, despising the shame." He saw past the agony to the joy beyond it.'),
  (36, 'What did Jesus pray in Gethsemane, in Matthew 26:39?',
       '[{"label":"A","text":"Let this cup pass; nevertheless not as I will, but as thou wilt","correct":true},{"label":"B","text":"Father, forgive them","correct":false},{"label":"C","text":"It is finished","correct":false}]',
       '"O my Father, if it be possible, let this cup pass from me: nevertheless not as I will, but as thou wilt." Honest desire held together with real surrender.'),
  (37, 'How did the Servant set His face in Isaiah 50:7?',
       '[{"label":"A","text":"Like a flint","correct":true},{"label":"B","text":"Toward the sea","correct":false},{"label":"C","text":"Away in shame","correct":false}]',
       '"I have set my face like a flint, and I know that I shall not be ashamed." Obedience unto death, forged in trust that God would help.'),
  (38, 'What did Pilate say as he presented the scourged Jesus in John 19:5?',
       '[{"label":"A","text":"Behold the man!","correct":true},{"label":"B","text":"He is innocent","correct":false},{"label":"C","text":"Crucify him","correct":false}]',
       '"Behold the man!" Crowned with thorns and draped in mock purple, Jesus was more royal in His suffering than His judges knew.'),
  (39, 'What were Jesus'' final words in John 19:30?',
       '[{"label":"A","text":"Into thy hands I commit my spirit","correct":false},{"label":"B","text":"It is finished","correct":true},{"label":"C","text":"Why hast thou forsaken me?","correct":false}]',
       '"It is finished" (tetelestai) — not a cry of defeat but of completion. The word was written on paid bills to mean "paid in full."'),
  (40, 'According to 1 Peter 2:24, by what are we healed?',
       '[{"label":"A","text":"His stripes","correct":true},{"label":"B","text":"Our own efforts","correct":false},{"label":"C","text":"The law","correct":false}]',
       '"By whose stripes ye were healed." The whole road of Lent ends at the cross — which was, all along, the road to our healing.')
) AS v(day_number, question, options, explanation)
WHERE p.slug = 'lent-road-to-the-cross'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Lent — word studies (a key word from each day''s passage, all 40 days).
UPDATE reading_plan_entries e
SET word_studies = v.ws
FROM reading_plans p,
(VALUES
  (1,  '{"dust":{"original":"עָפָר","transliteration":"aphar","definition":"Dust, dry earth, powder. Man is formed from aphar and returns to it — a word that anchors Lent in the humbling truth of human mortality.","refs":["Genesis 3:19","Psalm 103:14"]}}'),
  (2,  '{"mercy":{"original":"חָנַן","transliteration":"chanan","definition":"To show favor, to be gracious, to have mercy. David''s plea rests entirely on God''s free grace, not on anything David can offer in return.","refs":["Psalm 51:1","Exodus 34:6"]}}'),
  (3,  '{"create":{"original":"בָּרָא","transliteration":"bara","definition":"To create — used in Scripture only of God, only for what He alone can make from nothing. David needs not repair but a heart newly created.","refs":["Psalm 51:10","Genesis 1:1"]}}'),
  (4,  '{"rend":{"original":"קָרַע","transliteration":"qara","definition":"To tear, to rend. Tearing the garments was the ancient sign of grief; God asks instead for a torn-open heart — the inward reality, not the outward gesture.","refs":["Joel 2:13","2 Kings 22:11"]}}'),
  (5,  '{"fast":{"original":"צוֹם","transliteration":"tsom","definition":"A fast, abstinence from food. Isaiah insists the tsom God chooses is inseparable from mercy — self-denial that loosens the chains binding the oppressed.","refs":["Isaiah 58:6","Joel 2:12"]}}'),
  (6,  '{"tempted":{"original":"πειράζω","transliteration":"peirazō","definition":"To test, try, or tempt. The same word covers both a trial meant to strengthen and a temptation meant to destroy. Jesus was truly tested, yet did not fail.","refs":["Matthew 4:1","Hebrews 4:15"]}}'),
  (7,  '{"serve":{"original":"λατρεύω","transliteration":"latreuō","definition":"To serve, to render religious worship. Jesus answers the tempter with Deuteronomy: God alone is to be worshipped and latreuō — served with the devotion due to Him only.","refs":["Matthew 4:10","Deuteronomy 6:13"]}}'),
  (8,  '{"forgiven":{"original":"נָשָׂא","transliteration":"nasa","definition":"To lift, to carry, to bear away. Forgiveness pictures a burden lifted off and carried away — the very thing the Servant will do by bearing sin Himself.","refs":["Psalm 32:1","Isaiah 53:12"]}}'),
  (9,  '{"confess":{"original":"ὁμολογέω","transliteration":"homologeō","definition":"To say the same thing, to agree, to confess. Confession is agreeing with God about our sin rather than excusing it — and it meets a sure promise of forgiveness.","refs":["1 John 1:9","Proverbs 28:13"]}}'),
  (10, '{"compassion":{"original":"σπλαγχνίζομαι","transliteration":"splagchnizomai","definition":"To be moved in the inward parts, to feel gut-deep compassion. The father''s pity for the returning son is visceral — it moves him to run.","refs":["Luke 15:20","Matthew 9:36"]}}'),
  (11, '{"repentance":{"original":"μετάνοια","transliteration":"metanoia","definition":"A change of mind and direction, a turning. Godly sorrow produces metanoia — not mere regret but a genuine turn toward God that leads to life.","refs":["2 Corinthians 7:10","Acts 3:19"]}}'),
  (12, '{"forgiveness":{"original":"סְלִיחָה","transliteration":"selichah","definition":"Pardon, forgiveness — a word used only of God. The psalmist''s hope from the depths is that selichah is found with the LORD, so that sinners may stand.","refs":["Psalm 130:4","Daniel 9:9"]}}'),
  (13, '{"compassion":{"original":"רָחַם","transliteration":"racham","definition":"To love deeply, to have tender compassion — related to rechem, the womb. God will have racham on His people, subduing their sins and drowning them in the sea.","refs":["Micah 7:19","Psalm 103:13"]}}'),
  (14, '{"heart":{"original":"לֵב","transliteration":"lev","definition":"The heart — in Hebrew thought the center of will, mind, and desire, not merely emotion. God promises to replace a lev of stone with a lev of flesh.","refs":["Ezekiel 36:26","Jeremiah 31:33"]}}'),
  (15, '{"deny":{"original":"ἀπαρνέομαι","transliteration":"aparneomai","definition":"To disown, to renounce, to deny utterly — the same verb used of Peter denying Jesus. To follow Christ is to renounce the claim of self to rule one''s own life.","refs":["Matthew 16:24","Luke 9:23"]}}'),
  (16, '{"plough":{"original":"ἄροτρον","transliteration":"arotron","definition":"A plough. A ploughman who looks back cuts a crooked furrow; Jesus uses the image for divided discipleship — a hand on the plough but a heart facing home.","refs":["Luke 9:62","Philippians 3:13"]}}'),
  (17, '{"wheat":{"original":"κόκκος","transliteration":"kokkos","definition":"A grain, a seed (of wheat). Jesus makes the buried, dying seed the pattern of His own death — and of every fruitful life that follows Him.","refs":["John 12:24","1 Corinthians 15:36"]}}'),
  (18, '{"crucified":{"original":"συσταυρόω","transliteration":"systauroō","definition":"To crucify together with. Paul says his old self was co-crucified with Christ — not improved but put to death, so that Christ might live in him.","refs":["Galatians 2:20","Romans 6:6"]}}'),
  (19, '{"buried":{"original":"συνθάπτω","transliteration":"synthaptō","definition":"To bury together with. In baptism the believer is buried with Christ and raised with Him — His death and resurrection become the pattern of a new life.","refs":["Romans 6:4","Colossians 2:12"]}}'),
  (20, '{"know":{"original":"γινώσκω","transliteration":"ginōskō","definition":"To know by experience and relationship, not merely by information. Paul''s aim is to ginōskō Christ — to know Him personally, including the fellowship of His sufferings.","refs":["Philippians 3:10","John 17:3"]}}'),
  (21, '{"secret":{"original":"κρυπτός","transliteration":"kruptos","definition":"Hidden, secret, concealed. Jesus commends devotion done in the kruptos place, seen only by the Father — the one audience whose reward is worth having.","refs":["Matthew 6:18","Matthew 6:6"]}}'),
  (22, '{"humble":{"original":"ταπεινόω","transliteration":"tapeinoō","definition":"To make low, to humble. James commands us to tapeinoō ourselves before God, with the promise that He will do the lifting — the way up is down.","refs":["James 4:10","1 Peter 5:6"]}}'),
  (23, '{"servant":{"original":"עֶבֶד","transliteration":"ebed","definition":"A servant, slave, or bondman. Isaiah''s Suffering Servant (ebed) is God''s chosen one who saves not by power but by lowly, obedient suffering.","refs":["Isaiah 52:13","Isaiah 42:1"]}}'),
  (24, '{"sorrows":{"original":"מַכְאוֹב","transliteration":"makob","definition":"Pain, sorrow, suffering. The Messiah is a man of makob, acquainted with grief — One who does not stand aloof from human suffering but enters it.","refs":["Isaiah 53:3","Lamentations 1:12"]}}'),
  (25, '{"wounded":{"original":"חָלַל","transliteration":"chalal","definition":"To be pierced, wounded, fatally hurt. The Servant was chalal for our transgressions — the wound was ours by right, borne by Him in our place.","refs":["Isaiah 53:5","Zechariah 13:6"]}}'),
  (26, '{"lamb":{"original":"שֶׂה","transliteration":"seh","definition":"A lamb or sheep, the animal of sacrifice. The Servant is led as a seh to the slaughter — silent, willing, the Passover lamb who takes away sin.","refs":["Isaiah 53:7","John 1:29"]}}'),
  (27, '{"offering":{"original":"אָשָׁם","transliteration":"asham","definition":"A guilt offering, a sacrifice for trespass. God makes the Servant''s soul an asham for sin — the reparation offering that satisfies what the guilty owe.","refs":["Isaiah 53:10","Leviticus 5:15"]}}'),
  (28, '{"forsaken":{"original":"עָזַב","transliteration":"azab","definition":"To leave, abandon, forsake. The cry azabtani — why hast thou forsaken me — is the psalm''s opening, and the very word Jesus took onto His lips at the cross.","refs":["Psalm 22:1","Matthew 27:46"]}}'),
  (29, '{"pierced":{"original":"כָּאֲרִי","transliteration":"kaari","definition":"The disputed word behind they pierced my hands and feet, read as digging or piercing through. The psalm describes crucifixion long before Rome practiced it.","refs":["Psalm 22:16","John 20:25"]}}'),
  (30, '{"mourn":{"original":"סָפַד","transliteration":"saphad","definition":"To wail, lament, mourn — the ritual grief for the dead. Zechariah foresees a mourning over the pierced One as deep as grief for an only son, turned by grace toward repentance.","refs":["Zechariah 12:10","Amos 8:10"]}}'),
  (31, '{"set":{"original":"στηρίζω","transliteration":"stērizō","definition":"To fix firmly, to establish, to set steadfastly. Jesus stērizō His face toward Jerusalem — a settled, immovable resolve to walk the road to the cross.","refs":["Luke 9:51","Isaiah 50:7"]}}'),
  (32, '{"delivered":{"original":"παραδίδωμι","transliteration":"paradidōmi","definition":"To hand over, to deliver up, to betray. Jesus foretells being paradidōmi to the priests and Gentiles — the same word used of His betrayal and of God giving Him up for us.","refs":["Mark 10:33","Romans 8:32"]}}'),
  (33, '{"ransom":{"original":"λύτρον","transliteration":"lutron","definition":"The price paid to free a slave or captive. Jesus gives His life as a lutron for many — His death is the purchase price of our freedom.","refs":["Mark 10:45","1 Timothy 2:6"]}}'),
  (34, '{"power":{"original":"ἐξουσία","transliteration":"exousia","definition":"Authority, right, power to act. Jesus lays down His life by His own exousia and takes it up again — the cross is His sovereign choice, not His defeat.","refs":["John 10:18","John 19:11"]}}'),
  (35, '{"author":{"original":"ἀρχηγός","transliteration":"archēgos","definition":"A pioneer, founder, trailblazer, captain. Jesus is the archēgos of faith — the one who blazed the trail ahead of us and now stands as its goal.","refs":["Hebrews 12:2","Hebrews 2:10"]}}'),
  (36, '{"cup":{"original":"ποτήριον","transliteration":"potērion","definition":"A cup; figuratively one''s appointed portion of suffering or wrath. Jesus asks that the potērion pass, yet drinks it — taking the cup of judgment we deserved.","refs":["Matthew 26:39","Isaiah 51:17"]}}'),
  (37, '{"flint":{"original":"חַלָּמִישׁ","transliteration":"challamish","definition":"Flint, hard rock. The Servant sets His face like challamish — an image of unbreakable resolve, obedient to the point of shame and suffering, sure of vindication.","refs":["Isaiah 50:7","Ezekiel 3:8-9"]}}'),
  (38, '{"thorns":{"original":"ἄκανθα","transliteration":"akantha","definition":"A thorn, thorn-plant. The soldiers'' crown of akantha was cruel mockery — and an echo of Eden''s curse (Genesis 3:18), now pressed onto the head of the One who bears it.","refs":["John 19:2","Genesis 3:18"]}}'),
  (39, '{"finished":{"original":"τελέω","transliteration":"teleō","definition":"To complete, finish, accomplish, pay in full. Tetelestai — It is finished — was written on settled bills to mean paid in full. The work of salvation was done.","refs":["John 19:30","Colossians 2:14"]}}'),
  (40, '{"healed":{"original":"ἰάομαι","transliteration":"iaomai","definition":"To heal, to cure, to make whole. Quoting Isaiah, Peter says by Christ''s stripes ye were iaomai — the wounds of the cross are the source of our deepest healing.","refs":["1 Peter 2:24","Isaiah 53:5"]}}')
) AS v(day_number, ws)
WHERE p.slug = 'lent-road-to-the-cross'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;

-- Lent — dig deeper commentary (days 1, 6, 17, 25, 27, 28, 33, 39).
UPDATE reading_plan_entries e
SET
  deep_dive_text = v.text,
  deep_dive_refs = v.refs
FROM reading_plans p,
(VALUES
  (1,
   'Lent begins where we least want to look: at our own mortality. The traditional words spoken while ashes are marked on the forehead — "Remember that you are dust, and to dust you shall return" — come directly from Genesis 3:19, part of the sentence God pronounced after the fall. It sounds bleak, but the church has always understood it as a strange mercy. To remember that you are dust is to be freed from the exhausting pretense that you are the center of the universe, self-sufficient and permanent. The Hebrew word aphar means the dry, powdery earth — the same material from which God formed Adam in Genesis 2:7. So the reminder cuts both ways: you are dust, yes, but you are dust that God stooped to shape with His own hands and breathe life into. Psalm 103:14 makes the tenderness explicit: "he knoweth our frame; he remembereth that we are dust." Our frailty is not something God holds against us; it is something He factors into His compassion. Facing mortality honestly is the doorway to real repentance, because only those who know they are dust feel their need of a Savior who is not. The whole season that follows is the story of what that Savior did about our returning to dust.',
   '["Genesis 2:7", "Psalm 103:13-16"]'),
  (6,
   'The Gospel writers frame Jesus'' forty days in the wilderness as a deliberate replay of Israel''s story — with the opposite ending. Israel was led through the sea and into the wilderness for forty years, where they were tested and failed repeatedly: they grumbled for bread, doubted God''s provision, and bowed to idols. Jesus, the true Israel, is led by the Spirit into the wilderness for forty days, hungry and tested — and at each temptation He answers by quoting Deuteronomy, the very book that recounts Israel''s wilderness failures. To the demand for bread He replies, "Man shall not live by bread alone" (Deuteronomy 8:3) — the lesson Israel never learned. Where the first Adam fell to temptation in a garden of plenty, the last Adam stands firm in a desert of want. This is why Lent is forty days: the church walks with Jesus through His wilderness, learning from Him how temptation is met — not with our own strength or clever shortcuts, but with the word of God trusted and obeyed. Hebrews 4:15 adds the comfort: He was "in all points tempted like as we are, yet without sin." He does not test us from a safe distance; He has stood exactly where we stand and held the ground we lose.',
   '["Deuteronomy 8:2-3", "Hebrews 4:15-16"]'),
  (17,
   'Jesus speaks of the dying grain of wheat at a hinge moment: John 12 records that some Greeks — Gentiles — had come seeking Him, and instead of celebrating His growing fame, Jesus announces that the hour of His death has come. The connection is the whole point. How would the good news reach these Greeks and all the nations? Not through a popular teacher gathering crowds, but through a seed falling into the ground and dying. "Except a corn of wheat fall into the ground and die, it abideth alone: but if it die, it bringeth forth much fruit." A single grain kept safe on a shelf remains exactly one grain forever; only by being buried and broken open does it multiply into a harvest. Jesus is describing the strange economy of the cross: His death is not the failure of His mission but its mechanism. The worldwide harvest of the church — every believer of every nation — grows from that one buried seed. And then He turns it on us: "He that loveth his life shall lose it." The same law that governs the seed governs the disciple. The instinct to clutch and preserve our lives leads to a barren, solitary existence; the willingness to let our tightly-held ambitions and rights fall into the ground and die is the only path to a fruitful one. Death, in the kingdom of God, is never the end of the story — it is how the harvest begins.',
   '["John 12:20-23", "1 Corinthians 15:36-38"]'),
  (25,
   'Isaiah 53:4-6 is the clearest statement of substitutionary atonement in the Old Testament — the truth that Christ took the place of sinners, bearing what they deserved. Written some seven hundred years before the crucifixion, it reads like an eyewitness account. Notice the relentless exchange of pronouns: "he" bore "our" griefs; "he" was wounded for "our" transgressions; the chastisement of "our" peace was upon "him"; with "his" stripes "we" are healed. Every clause moves the weight from us to Him. The passage also corrects a natural misreading: "we did esteem him stricken, smitten of God" — the onlookers assumed the Servant suffered for His own guilt. The truth was the reverse: "the LORD hath laid on him the iniquity of us all." The image in verse 6 is devastating in its ordinariness — "all we like sheep have gone astray; we have turned every one to his own way." Sin here is not dramatic villainy but the quiet, universal act of self-direction, each person turning off toward his own path. And onto that scattered, wayward flock''s collective guilt, laid on one Shepherd-Servant, the whole burden falls. This is the heart of the gospel Lent walks toward: not that God overlooked sin, but that He bore it Himself in the person of His Servant, so that the healing might be ours.',
   '["1 Peter 2:24-25", "2 Corinthians 5:21"]'),
  (27,
   'Isaiah 53:10 contains perhaps the most jarring sentence in all of Scripture: "Yet it pleased the LORD to bruise him." How can the suffering of the innocent Servant be the Father''s pleasure? The answer is not that God delights in pain, but that He delights in what the suffering accomplishes — the salvation of many. The verse itself explains: the Servant''s soul is made "an offering for sin" (the Hebrew asham, a guilt offering), and the result is that "he shall see his seed... the pleasure of the LORD shall prosper in his hand." The cross was not a tragedy that befell Jesus against God''s will; it was the deliberate, eternal plan of God, in which Father and Son acted together in love for our rescue. Peter would later preach exactly this at Pentecost: Jesus was "delivered by the determinate counsel and foreknowledge of God" (Acts 2:23) — and yet the human hands that crucified Him were fully guilty. Both are true. The passage ends in triumph, not defeat: "He shall see of the travail of his soul, and shall be satisfied." The word "satisfied" matters. The Servant looks back on the agony and counts it worth it, because of the "seed" — the countless people justified by bearing their iniquities. When you wonder whether your salvation was worth the cross to Him, Isaiah answers: He looked at the cost, and He was satisfied.',
   '["Acts 2:23", "Romans 3:24-26"]'),
  (28,
   'When Jesus cried "My God, my God, why hast thou forsaken me?" from the cross (Matthew 27:46), He was not improvising a scream of despair — He was praying Psalm 22, and every Jew within earshot would have recognized it. This matters, because in the ancient world quoting a psalm''s first line invoked the whole psalm. And Psalm 22, though it begins in the darkness of apparent abandonment, does not end there. It moves, in its second half, into one of the most triumphant declarations of vindication and worldwide worship in the Psalter: "All the ends of the world shall remember and turn unto the LORD" (v.27). So the cry from the cross holds two truths at once. First, the abandonment was real: as Jesus bore the sin of the world, He experienced a forsakenness we cannot fully fathom — the Son, for the only time in eternity, feeling the Father''s face turned away, so that we would never have to. Second, even that cry was an act of faith. Notice the psalm never stops addressing God: "MY God, MY God." It is a lament hurled toward heaven, not away from it — the prayer of one who feels forsaken yet still clings. This is a gift to every believer who has felt God''s absence: the sinless Son prayed His way through that exact darkness, and it did not have the last word. The psalm that opens "why hast thou forsaken me?" closes with the confident cry, "he hath done this" — a Hebrew phrase strikingly close to "It is finished."',
   '["Matthew 27:46", "Psalm 22:22-31"]'),
  (33,
   'Mark 10:45 is often called the "ransom saying," and it sits at the theological center of Mark''s Gospel. Jesus has just found His disciples arguing about who will be greatest, and He upends their entire notion of greatness: in His kingdom, the way up is down, and the model is the Son of Man Himself, who "came not to be ministered unto, but to minister, and to give his life a ransom for many." The word ransom (lutron) was concrete and familiar — it was the price paid to purchase the freedom of a slave or to redeem a captive or debtor. By using it, Jesus interprets His own coming death in advance: it is not a defeat or an accident but a transaction of liberation. His life is the price; our freedom is what it buys. The phrase "for many" (which echoes Isaiah 53:11-12, where the Servant "bare the sin of many") does not limit the offer but emphasizes the vast number set free by the one life given. And crucially, Jesus makes this the pattern for His followers: greatness is not measured by how many serve you but by how much you spend yourself for others. The cross is both the price of our redemption and the shape of the redeemed life. The One who gave everything to purchase our freedom now calls the freed to live as servants.',
   '["Isaiah 53:11-12", "Philippians 2:5-8"]'),
  (39,
   'The single Greek word Jesus spoke as His last breath left Him — tetelestai, translated "It is finished" — is one of the most important words in the Bible, and it is essential to hear it correctly. It is not the whimper of a defeated man ("I am finished"); it is the shout of a workman who has completed his task. Tetelestai comes from teleō, meaning to complete, accomplish, or bring to its intended goal. In the commercial world of the first century, the word was stamped or written across a bill of debt when it was paid, meaning "paid in full." Archaeologists have found receipts bearing exactly this word. So when Jesus said tetelestai, He was declaring that the debt of sin — the whole account of what humanity owed to God — had been paid, completely and finally, leaving nothing outstanding. This is why the gospel is genuinely good news and not merely good advice: salvation is not a project we contribute to but a finished work we receive. Every religious impulse to add our own payments — our good deeds, our penance, our self-improvement — stumbles over this word. There is nothing left to pay. Notice, too, that John says Jesus spoke it "knowing that all things were now accomplished, that the scripture might be fulfilled" — the prophecies of Genesis 3:15, of Isaiah 53, of Psalm 22, all converging and completed at this moment. The road that began in Eden with a promise ends here with a receipt: paid in full.',
   '["Colossians 2:13-14", "Hebrews 10:11-14"]')
) AS v(day_number, text, refs)
WHERE p.slug = 'lent-road-to-the-cross'
  AND e.plan_id = p.id
  AND e.day_number = v.day_number;
