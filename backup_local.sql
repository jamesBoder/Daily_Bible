--
-- PostgreSQL database dump
--

\restrict HnwbG8LIDcCUT41VZYJeTb5nuNwwVnPHu95PtwgtnBX6lfDtmbqioUDTOxdvVgC

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: dailybible_user
--

CREATE TABLE public.comments (
    id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    user_id bigint NOT NULL,
    verse_id bigint NOT NULL,
    verse_reference character varying(255) NOT NULL,
    comment_text text NOT NULL
);


ALTER TABLE public.comments OWNER TO dailybible_user;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: dailybible_user
--

CREATE SEQUENCE public.comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comments_id_seq OWNER TO dailybible_user;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dailybible_user
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: dailybible_user
--

CREATE TABLE public.favorites (
    id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    user_id bigint NOT NULL,
    verse_id bigint NOT NULL
);


ALTER TABLE public.favorites OWNER TO dailybible_user;

--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: dailybible_user
--

CREATE SEQUENCE public.favorites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.favorites_id_seq OWNER TO dailybible_user;

--
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dailybible_user
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- Name: histories; Type: TABLE; Schema: public; Owner: dailybible_user
--

CREATE TABLE public.histories (
    id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    user_id bigint NOT NULL,
    verse_id bigint NOT NULL,
    viewed_at timestamp with time zone NOT NULL
);


ALTER TABLE public.histories OWNER TO dailybible_user;

--
-- Name: histories_id_seq; Type: SEQUENCE; Schema: public; Owner: dailybible_user
--

CREATE SEQUENCE public.histories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.histories_id_seq OWNER TO dailybible_user;

--
-- Name: histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dailybible_user
--

ALTER SEQUENCE public.histories_id_seq OWNED BY public.histories.id;


--
-- Name: password_history; Type: TABLE; Schema: public; Owner: dailybible_user
--

CREATE TABLE public.password_history (
    id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    user_id bigint NOT NULL,
    password_hash text NOT NULL,
    changed_at timestamp with time zone NOT NULL
);


ALTER TABLE public.password_history OWNER TO dailybible_user;

--
-- Name: password_history_id_seq; Type: SEQUENCE; Schema: public; Owner: dailybible_user
--

CREATE SEQUENCE public.password_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.password_history_id_seq OWNER TO dailybible_user;

--
-- Name: password_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dailybible_user
--

ALTER SEQUENCE public.password_history_id_seq OWNED BY public.password_history.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: dailybible_user
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    email text NOT NULL,
    username character varying(50),
    password text,
    google_id text,
    google_email text,
    google_picture text,
    is_google_linked boolean
);


ALTER TABLE public.users OWNER TO dailybible_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: dailybible_user
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO dailybible_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dailybible_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: verses; Type: TABLE; Schema: public; Owner: dailybible_user
--

CREATE TABLE public.verses (
    id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    reference text NOT NULL,
    text text NOT NULL,
    book character varying(50) NOT NULL,
    chapter bigint NOT NULL,
    verse_number bigint NOT NULL,
    version character varying(20) DEFAULT 'KJV'::character varying,
    translation character varying(10) DEFAULT 'KJV'::character varying,
    daily_date date
);


ALTER TABLE public.verses OWNER TO dailybible_user;

--
-- Name: verses_id_seq; Type: SEQUENCE; Schema: public; Owner: dailybible_user
--

CREATE SEQUENCE public.verses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.verses_id_seq OWNER TO dailybible_user;

--
-- Name: verses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dailybible_user
--

ALTER SEQUENCE public.verses_id_seq OWNED BY public.verses.id;


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- Name: histories id; Type: DEFAULT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.histories ALTER COLUMN id SET DEFAULT nextval('public.histories_id_seq'::regclass);


--
-- Name: password_history id; Type: DEFAULT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.password_history ALTER COLUMN id SET DEFAULT nextval('public.password_history_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: verses id; Type: DEFAULT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.verses ALTER COLUMN id SET DEFAULT nextval('public.verses_id_seq'::regclass);


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: dailybible_user
--

COPY public.comments (id, created_at, updated_at, deleted_at, user_id, verse_id, verse_reference, comment_text) FROM stdin;
1	2026-02-02 07:20:01.367852+00	2026-02-02 07:20:01.367852+00	\N	5	1	2 Timothy 1:7	ok ok
2	2026-02-03 23:12:11.387122+00	2026-02-03 23:12:11.387122+00	\N	5	2	Hebrews 11:1	teting 123
3	2026-02-03 23:33:03.985701+00	2026-02-03 23:33:03.985701+00	2026-02-03 23:33:12.322995+00	6	2	Hebrews 11:1	eyyyyyy
4	2026-02-05 19:32:09.876761+00	2026-02-05 19:32:09.876761+00	\N	1	1	2 Timothy 1:7	ok
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: dailybible_user
--

COPY public.favorites (id, created_at, updated_at, deleted_at, user_id, verse_id) FROM stdin;
1	2026-02-02 07:17:43.037888+00	2026-02-02 07:17:43.037888+00	\N	1	1
2	2026-02-02 07:19:56.954362+00	2026-02-02 07:19:56.954362+00	2026-02-02 22:54:56.499056+00	5	1
4	2026-02-03 22:40:47.287809+00	2026-02-03 22:40:47.287809+00	\N	1	2
5	2026-02-03 23:11:40.11718+00	2026-02-03 23:11:40.11718+00	2026-02-03 23:11:41.343714+00	5	2
6	2026-02-03 23:12:20.981963+00	2026-02-03 23:12:20.981963+00	2026-02-03 23:12:21.513664+00	5	2
3	2026-02-02 22:54:59.482252+00	2026-02-02 22:54:59.482252+00	2026-02-03 23:13:06.747813+00	5	1
7	2026-02-03 23:13:10.042714+00	2026-02-03 23:13:10.042714+00	\N	5	2
8	2026-02-03 23:31:46.806252+00	2026-02-03 23:31:46.806252+00	2026-02-03 23:32:56.486623+00	6	2
9	2026-02-03 23:33:22.021461+00	2026-02-03 23:33:22.021461+00	\N	6	2
10	2026-02-07 01:10:16.785258+00	2026-02-07 01:10:16.785258+00	\N	5	4
11	2026-02-08 10:59:34.653089+00	2026-02-08 10:59:34.653089+00	\N	1	5
\.


--
-- Data for Name: histories; Type: TABLE DATA; Schema: public; Owner: dailybible_user
--

COPY public.histories (id, created_at, updated_at, deleted_at, user_id, verse_id, viewed_at) FROM stdin;
2	2026-02-02 07:18:17.913435+00	2026-02-02 23:18:52.769058+00	\N	5	1	2026-02-02 23:18:52.765485+00
4	2026-02-03 23:02:35.517215+00	2026-02-03 23:13:08.905639+00	\N	5	2	2026-02-03 23:13:08.905331+00
5	2026-02-03 23:20:51.790999+00	2026-02-03 23:31:22.108023+00	\N	7	2	2026-02-03 23:31:22.099811+00
3	2026-02-03 00:53:34.726373+00	2026-02-03 23:44:13.728589+00	\N	1	2	2026-02-03 23:44:13.726981+00
1	2026-02-02 07:17:27.825752+00	2026-02-05 21:07:43.105687+00	\N	1	1	2026-02-05 21:07:43.096398+00
6	2026-02-05 21:15:42.220294+00	2026-02-05 23:29:45.063273+00	\N	6	1	2026-02-05 23:29:45.03+00
7	2026-02-06 22:46:51.859001+00	2026-02-06 22:46:51.859001+00	\N	6	3	2026-02-06 22:46:51.855616+00
9	2026-02-07 01:10:10.873029+00	2026-02-07 02:12:05.801754+00	\N	5	4	2026-02-07 02:12:05.800936+00
8	2026-02-07 01:09:22.823023+00	2026-02-07 03:30:22.06734+00	\N	1	4	2026-02-07 03:30:22.059878+00
10	2026-02-08 10:43:52.775747+00	2026-02-08 11:49:52.789622+00	\N	1	5	2026-02-08 11:49:52.787594+00
\.


--
-- Data for Name: password_history; Type: TABLE DATA; Schema: public; Owner: dailybible_user
--

COPY public.password_history (id, created_at, updated_at, deleted_at, user_id, password_hash, changed_at) FROM stdin;
1	2026-02-05 22:52:56.968386+00	2026-02-05 22:52:56.968386+00	\N	6	$2a$12$afgFDDXOqXLp.F5zSlLYp.G7fycrI3X/PWFjwxhqBbOsrbhlOK2xW	2026-02-05 22:52:56.959021+00
2	2026-02-07 02:10:29.095077+00	2026-02-07 02:10:29.095077+00	\N	5	$2a$12$2NSeOAYRsVrpoJRUdcH2VeSLFuLQCETxT.ApA6I80vg4qO0ohwzCK	2026-02-07 02:10:29.093042+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: dailybible_user
--

COPY public.users (id, created_at, updated_at, deleted_at, email, username, password, google_id, google_email, google_picture, is_google_linked) FROM stdin;
2	2026-02-02 05:03:56.194773+00	2026-02-02 05:03:56.194773+00	\N	test@example.com	testuser	$2a$12$P9nbasld9ImMPjcI7BEN4O6X4MS5RJTmNKdqXC6oNHTMPCGsYL6gi				f
5	2026-02-02 07:18:16.524934+00	2026-02-07 02:12:04.669427+00	\N	beatsbyboxnyc@gmail.com	beatsbyboxnyc	$2a$12$2NSeOAYRsVrpoJRUdcH2VeSLFuLQCETxT.ApA6I80vg4qO0ohwzCK	110226158094732606979	beatsbyboxnyc@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocJTCKQgTrC5Ja7UAHY8dRaA3AXf1gGGOZ_-5rqz89sOS_mmXzs=s96-c	t
4	2026-02-02 06:03:41.952143+00	2026-02-02 06:03:41.952143+00	\N	manman@gmail.com	manman	$2a$12$JOJc2WnYXNeub2qmpcuNsuPdgnPqy0JTAYJjMMjfW9BC.rTTHu4MG	\N	\N	\N	f
1	2026-02-02 05:00:28.839617+00	2026-02-08 11:08:18.408517+00	\N	james.macean08@gmail.com	james.macean08		116643707899283631932	james.macean08@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocJhjTA9ajE7nHMIGcqW0Fpqo4EHvg5n8wG6UlTmw8NKLBJ8tBw=s96-c	t
7	2026-02-03 23:20:51.648094+00	2026-02-03 23:20:51.648094+00	\N	MrTester@gmail.com	MrTester	$2a$12$7eK5FVVwEN4NHNkD6IFHHej5ac2zbuSUYZEitrsi.3OfuWeues/0u	\N	\N	\N	f
6	2026-02-03 23:19:39.597698+00	2026-02-05 22:52:57.403639+00	\N	manman2@gmail.com	manman2	$2a$12$XQjukXQYXvrJZDeafqx6fudh.S0Mp59kb5NIRRVyQI2okTh1EVZO.	\N	\N	\N	f
\.


--
-- Data for Name: verses; Type: TABLE DATA; Schema: public; Owner: dailybible_user
--

COPY public.verses (id, created_at, updated_at, deleted_at, reference, text, book, chapter, verse_number, version, translation, daily_date) FROM stdin;
2	2026-02-03 00:53:34.68254+00	2026-02-03 00:53:34.68254+00	\N	Hebrews 11:1	Now faith is the substance of things hoped for, the evidence of things not seen.	Hebrews	11	1	KJV	KJV	\N
1	2026-02-02 07:17:27.774672+00	2026-02-05 18:53:47.915647+00	\N	2 Timothy 1:7	For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.	2 Timothy	1	7	KJV	KJV	\N
3	2026-02-06 22:46:51.764596+00	2026-02-06 22:46:51.764596+00	\N	Philippians 4:13	I can do all things through Christ which strengtheneth me.	Philippians	4	13	KJV	KJV	\N
4	2026-02-07 01:09:22.795976+00	2026-02-07 01:09:22.795976+00	\N	1 John 4:19	We love him, because he first loved us.	1 John	4	19	KJV	KJV	\N
5	2026-02-08 08:11:48.893872+00	2026-02-08 08:11:48.893872+00	\N	Colossians 3:23	And whatsoever ye do, do it heartily, as to the Lord, and not unto men;	Colossians	3	23	KJV	KJV	\N
6	2026-02-10 05:55:36.908979+00	2026-02-10 05:55:36.908979+00	\N	Proverbs 18:10	The name of the LORD is a strong tower: the righteous runneth into it, and is safe.	Proverbs	18	10	KJV	KJV	2026-02-10
\.


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dailybible_user
--

SELECT pg_catalog.setval('public.comments_id_seq', 4, true);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dailybible_user
--

SELECT pg_catalog.setval('public.favorites_id_seq', 11, true);


--
-- Name: histories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dailybible_user
--

SELECT pg_catalog.setval('public.histories_id_seq', 10, true);


--
-- Name: password_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dailybible_user
--

SELECT pg_catalog.setval('public.password_history_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dailybible_user
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: verses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dailybible_user
--

SELECT pg_catalog.setval('public.verses_id_seq', 6, true);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: histories histories_pkey; Type: CONSTRAINT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.histories
    ADD CONSTRAINT histories_pkey PRIMARY KEY (id);


--
-- Name: password_history password_history_pkey; Type: CONSTRAINT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.password_history
    ADD CONSTRAINT password_history_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verses verses_pkey; Type: CONSTRAINT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.verses
    ADD CONSTRAINT verses_pkey PRIMARY KEY (id);


--
-- Name: idx_comments_deleted_at; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_comments_deleted_at ON public.comments USING btree (deleted_at);


--
-- Name: idx_comments_user_id; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_comments_user_id ON public.comments USING btree (user_id);


--
-- Name: idx_comments_verse_reference; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_comments_verse_reference ON public.comments USING btree (verse_reference);


--
-- Name: idx_favorites_deleted_at; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_favorites_deleted_at ON public.favorites USING btree (deleted_at);


--
-- Name: idx_favorites_user_id; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_favorites_user_id ON public.favorites USING btree (user_id);


--
-- Name: idx_favorites_verse_id; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_favorites_verse_id ON public.favorites USING btree (verse_id);


--
-- Name: idx_histories_deleted_at; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_histories_deleted_at ON public.histories USING btree (deleted_at);


--
-- Name: idx_histories_user_id; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_histories_user_id ON public.histories USING btree (user_id);


--
-- Name: idx_histories_verse_id; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_histories_verse_id ON public.histories USING btree (verse_id);


--
-- Name: idx_histories_viewed_at; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_histories_viewed_at ON public.histories USING btree (viewed_at);


--
-- Name: idx_password_history_deleted_at; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_password_history_deleted_at ON public.password_history USING btree (deleted_at);


--
-- Name: idx_password_history_user_id; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_password_history_user_id ON public.password_history USING btree (user_id);


--
-- Name: idx_users_deleted_at; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_users_deleted_at ON public.users USING btree (deleted_at);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_google_id; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE UNIQUE INDEX idx_users_google_id ON public.users USING btree (google_id) WHERE (google_id IS NOT NULL);


--
-- Name: idx_verses_daily_date; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE UNIQUE INDEX idx_verses_daily_date ON public.verses USING btree (daily_date);


--
-- Name: idx_verses_deleted_at; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE INDEX idx_verses_deleted_at ON public.verses USING btree (deleted_at);


--
-- Name: idx_verses_reference; Type: INDEX; Schema: public; Owner: dailybible_user
--

CREATE UNIQUE INDEX idx_verses_reference ON public.verses USING btree (reference);


--
-- Name: comments fk_comments_user; Type: FK CONSTRAINT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: favorites fk_users_favorites; Type: FK CONSTRAINT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT fk_users_favorites FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: histories fk_users_history; Type: FK CONSTRAINT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.histories
    ADD CONSTRAINT fk_users_history FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: favorites fk_verses_favorites; Type: FK CONSTRAINT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT fk_verses_favorites FOREIGN KEY (verse_id) REFERENCES public.verses(id);


--
-- Name: histories fk_verses_history; Type: FK CONSTRAINT; Schema: public; Owner: dailybible_user
--

ALTER TABLE ONLY public.histories
    ADD CONSTRAINT fk_verses_history FOREIGN KEY (verse_id) REFERENCES public.verses(id);


--
-- PostgreSQL database dump complete
--

\unrestrict HnwbG8LIDcCUT41VZYJeTb5nuNwwVnPHu95PtwgtnBX6lfDtmbqioUDTOxdvVgC

