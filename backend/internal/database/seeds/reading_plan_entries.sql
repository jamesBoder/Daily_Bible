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
   'In Luke 6:27-31, Jesus gives four specific responses to enemies. Which of these four does He list?',
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
