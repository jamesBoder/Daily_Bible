-- Connection notes for Manna words where the answer does not appear literally
-- in the verse text. These explain the biblical link to the player post-game.
-- Idempotent: safe to run on every startup.

UPDATE manna_words SET connection_note = 'David wrote Psalm 51 as a prayer of repentance. Its heading reads: "A psalm of David. When the prophet Nathan came to him after David had committed adultery with Bathsheba" (2 Samuel 11–12).' WHERE word = 'DAVID';

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
