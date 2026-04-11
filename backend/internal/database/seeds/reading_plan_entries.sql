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
  (3,  'Romans 8:38-39',         'Nothing — not death, not life, not angels, not powers — can separate us from the love of God.'),
  (4,  '1 Corinthians 13:4-7',   'Love is patient. Love is kind. Read this slowly. Let it measure and reshape you.'),
  (5,  'Matthew 22:37-39',       'Love God with everything. Love your neighbor as yourself. All the law hangs on these two.'),
  (6,  'Ephesians 3:17-19',      'That you may be rooted and grounded in love — to know the love that surpasses knowledge.'),
  (7,  '1 John 4:19',            'We love because He first loved us. Love is a response, not an achievement.'),
  (8,  'John 13:34-35',          'Love one another as I have loved you. The world will know you are His disciples by this.'),
  (9,  'Luke 6:27-28',           'Love your enemies. Do good to those who hate you. This is the hardest verse on this path.'),
  (10, 'Song of Solomon 8:7',    'Many waters cannot quench love. It endures. It persists. It will not be drowned.'),
  (11, 'Zephaniah 3:17',         'The LORD your God is in your midst — He will rejoice over you with gladness and quiet you with His love.'),
  (12, 'Psalm 136:26',           'Give thanks to the God of heaven, for His steadfast love endures forever.'),
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
