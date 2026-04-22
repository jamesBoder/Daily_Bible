-- Connection notes for Manna words where the answer does not appear literally
-- in the verse text. These explain the biblical link to the player post-game.
-- Idempotent: safe to run on every startup.

UPDATE manna_words SET connection_note = 'David wrote Psalm 51 as a prayer of repentance. Its heading reads: "A psalm of David. When the prophet Nathan came to him after David had committed adultery with Bathsheba" (2 Samuel 11–12).' WHERE word = 'DAVID';

-- HOSEA and ELIAS are in the manna_words_cleanup.sql deletion list; these UPDATEs
-- are intentionally kept here as documentation but affect 0 rows at runtime.
UPDATE manna_words SET connection_note = 'Hosea was a prophet in Israel''s northern kingdom whose life mirrored God''s faithfulness to an unfaithful people. This verse is from the book he authored.' WHERE word = 'HOSEA';

UPDATE manna_words SET connection_note = 'Elias is the Greek and Latin form of the prophet''s name — the same figure called "Elijah" throughout the Old Testament. James uses this form in the New Testament.' WHERE word = 'ELIAS';

UPDATE manna_words SET connection_note = 'The Book of Psalms is a collection of 150 Hebrew poems and hymns. Psalm 119, the longest chapter in the entire Bible, is a sweeping meditation on God''s Word.' WHERE word = 'PSALM' AND scripture_reference = 'Psalm 119:105';

UPDATE manna_words SET connection_note = 'Esther was a Jewish queen of Persia. When Haman plotted to destroy her people, her cousin Mordecai urged her to act, saying God may have placed her in the palace "for such a time as this."' WHERE word = 'QUEEN';

UPDATE manna_words SET connection_note = 'In the New Testament, "saint" translates the Greek hagios (holy one). Paul addressed Ephesians to "God''s holy people" — the saints of the early church — rather than using the title directly.' WHERE word = 'SAINT';

UPDATE manna_words SET connection_note = 'Titus was Paul''s trusted co-worker and church-planter. Paul wrote this letter to guide Titus in leading the churches of Crete, where Titus had been stationed.' WHERE word = 'TITUS';

UPDATE manna_words SET connection_note = 'Jeremiah wrote Jeremiah 29 as a letter to the Jewish exiles forcibly taken to Babylon by Nebuchadnezzar around 597 BC. God''s famous promise of hope was spoken directly to His displaced people.' WHERE word = 'EXILE' AND scripture_reference = 'Jeremiah 29:11';

UPDATE manna_words SET connection_note = 'Ruth spoke these words of steadfast loyalty to her mother-in-law Naomi, who had urged Ruth to return to her Moabite homeland after the death of their husbands.' WHERE word = 'NAOMI';

UPDATE manna_words SET connection_note = 'Isaac was Abraham''s long-awaited, promised son. Genesis 22 records God''s ultimate test of Abraham''s faith — commanding him to offer Isaac as a sacrifice on Mount Moriah.' WHERE word = 'ISAAC' AND scripture_reference = 'Genesis 22:8';

UPDATE manna_words SET connection_note = 'Jacob fled to Bethel after deceiving his brother Esau. God appeared to him in a dream and gave him this personal promise. Jacob''s twelve sons later became the twelve tribes of Israel.' WHERE word = 'JACOB' AND scripture_reference = 'Genesis 28:15';

UPDATE manna_words SET connection_note = 'Nahum was a 7th-century BC prophet from Judah. His book proclaims God''s coming judgment on Nineveh, the capital of Assyria, while offering this assurance to those who trust in God.' WHERE word = 'NAHUM';

UPDATE manna_words SET connection_note = 'Micah was a prophet in Judah during the 8th century BC, a contemporary of Isaiah. Micah 6:8 is one of the Bible''s most beloved one-verse summaries of the life God calls His people to live.' WHERE word = 'MICAH';

-- Scripture text corrections: fix entries where the word only appeared in a
-- possessive or hyphenated compound form, producing a clue with no clean blank.
UPDATE manna_words
  SET scripture_reference = '1 Thessalonians 5:6',
      scripture_text = 'So then, let us not be like others, who are asleep, but let us be awake and sober.'
  WHERE word = 'SOBER';

UPDATE manna_words
  SET scripture_reference = 'Deuteronomy 33:24',
      scripture_text = 'About Asher he said: ''Most blessed of sons is Asher; let him be favored by his brothers, and let him bathe his feet in oil.'''
  WHERE word = 'ASHER';

UPDATE manna_words
  SET scripture_reference = 'Psalm 120:5',
      scripture_text = 'Woe to me that I dwell in Meshek, that I live among the tents of Kedar!'
  WHERE word = 'KEDAR';

-- Restore words whose DB scripture text was changed by a migration and no longer
-- contains the target word, causing an invisible blank in the clue.
UPDATE manna_words
  SET scripture_reference = 'Isaiah 25:6',
      scripture_text = 'On this mountain the LORD Almighty will prepare a feast of rich food for all peoples.'
  WHERE word = 'FEAST';

UPDATE manna_words
  SET scripture_reference = 'Hebrews 1:7',
      scripture_text = 'He makes his angels winds, and his ministers a flame of fire.'
  WHERE word = 'FLAME';

UPDATE manna_words
  SET scripture_reference = 'James 1:5',
      scripture_text = 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault.'
  WHERE word = 'GIVES';

UPDATE manna_words
  SET scripture_reference = 'Romans 8:26',
      scripture_text = 'The Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us.'
  WHERE word = 'HELPS';

UPDATE manna_words
  SET scripture_reference = 'Psalm 95:6',
      scripture_text = 'Come, let us bow down in worship, let us kneel before the LORD our Maker.'
  WHERE word = 'KNEEL';

UPDATE manna_words
  SET scripture_reference = 'Galatians 2:20',
      scripture_text = 'I have been crucified with Christ and I no longer live, but Christ lives in me.'
  WHERE word = 'LIVES';

UPDATE manna_words
  SET scripture_reference = 'Job 9:15',
      scripture_text = 'Though I were innocent, I could not answer him; I could only plead with my Judge for mercy.'
  WHERE word = 'PLEAD';

UPDATE manna_words
  SET scripture_reference = 'Numbers 22:38',
      scripture_text = 'I must speak only what God puts in my mouth.'
  WHERE word = 'SPEAK';

UPDATE manna_words
  SET scripture_reference = 'Matthew 5:34',
      scripture_text = 'But I tell you, do not swear an oath at all: either by heaven, for it is God''s throne.'
  WHERE word = 'SWEAR';

UPDATE manna_words
  SET scripture_reference = 'Psalm 56:8',
      scripture_text = 'You have kept count of my tossings; put my tears in your bottle.'
  WHERE word = 'TEARS';

UPDATE manna_words
  SET scripture_reference = 'Matthew 18:20',
      scripture_text = 'For where two or three gather in my name, there am I with them.'
  WHERE word = 'THREE';

-- MIGHT: DB stored the NIV "strength" translation; switch to KJV so the target
-- word actually appears in the clue text.
UPDATE manna_words
  SET scripture_text = 'And thou shalt love the LORD thy God with all thine heart, and with all thy soul, and with all thy might.'
  WHERE word = 'MIGHT' AND scripture_reference = 'Deuteronomy 6:5';

-- ROOTS: update to Hosea 14:5 where the word appears literally.
UPDATE manna_words
  SET scripture_reference = 'Hosea 14:5',
      scripture_text = 'I will be like the dew to Israel; he will blossom like a lily. Like a cedar of Lebanon he will send down his roots.'
  WHERE word = 'ROOTS';

-- GRANT: update to Matthew 20:21 where the word appears literally.
UPDATE manna_words
  SET scripture_reference = 'Matthew 20:21',
      scripture_text = 'She said, Grant that one of these two sons of mine may sit at your right hand and the other at your left in your kingdom.'
  WHERE word = 'GRANT';

-- Words whose target is a concept rather than a word in the verse — connection
-- notes explain the biblical link for players after the game ends.
UPDATE manna_words
  SET connection_note = 'The word "Bible" derives from the Greek "biblia" (books) and does not appear in scripture itself. Psalm 119, the longest chapter in the entire Bible, is a sweeping meditation on God''s living Word — the very collection we call the Bible today.'
  WHERE word = 'BIBLE';

UPDATE manna_words
  SET connection_note = 'Romans 8:17 describes believers as co-heirs with Christ — joined together as children of God. The Greek term (sunkleronómos) literally means "joint heir," capturing the idea of being united and joined to Christ.'
  WHERE word = 'JOINS';

UPDATE manna_words
  SET scripture_reference = 'Colossians 3:12',
      scripture_text = 'Therefore, as God''s chosen people, holy and dearly loved, clothe yourselves with compassion, kindness, humility, gentleness and patience.',
      connection_note = 'Paul''s image of "clothing yourselves" with virtues is a vivid picture of what one wears spiritually. The Greek word (enduo) means to put on or dress — the daily choice of what a believer wears in character before God and others.'
  WHERE word = 'WEARS';
