--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-1.pgdg120+1)
-- Dumped by pg_dump version 15.12 (Debian 15.12-1.pgdg120+1)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: letterland_admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO letterland_admin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: letterland_admin
--

COMMENT ON SCHEMA public IS '';


--
-- Name: EnglishLevel; Type: TYPE; Schema: public; Owner: letterland_admin
--

CREATE TYPE public."EnglishLevel" AS ENUM (
    'A1',
    'A2',
    'B1',
    'B2',
    'C1',
    'C2'
);


ALTER TYPE public."EnglishLevel" OWNER TO letterland_admin;

--
-- Name: GameType; Type: TYPE; Schema: public; Owner: letterland_admin
--

CREATE TYPE public."GameType" AS ENUM (
    'WORD_SEARCH',
    'CROSSWORD_SEARCH'
);


ALTER TYPE public."GameType" OWNER TO letterland_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Achievement; Type: TABLE; Schema: public; Owner: letterland_admin
--

CREATE TABLE public."Achievement" (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    "coinReward" integer NOT NULL,
    "imageUrl" text
);


ALTER TABLE public."Achievement" OWNER TO letterland_admin;

--
-- Name: Achievement_id_seq; Type: SEQUENCE; Schema: public; Owner: letterland_admin
--

CREATE SEQUENCE public."Achievement_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Achievement_id_seq" OWNER TO letterland_admin;

--
-- Name: Achievement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: letterland_admin
--

ALTER SEQUENCE public."Achievement_id_seq" OWNED BY public."Achievement".id;


--
-- Name: ExtraWordFound; Type: TABLE; Schema: public; Owner: letterland_admin
--

CREATE TABLE public."ExtraWordFound" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    word text NOT NULL,
    "foundAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "gameId" integer NOT NULL,
    "audioUrl" text
);


ALTER TABLE public."ExtraWordFound" OWNER TO letterland_admin;

--
-- Name: ExtraWordFound_id_seq; Type: SEQUENCE; Schema: public; Owner: letterland_admin
--

CREATE SEQUENCE public."ExtraWordFound_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ExtraWordFound_id_seq" OWNER TO letterland_admin;

--
-- Name: ExtraWordFound_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: letterland_admin
--

ALTER SEQUENCE public."ExtraWordFound_id_seq" OWNED BY public."ExtraWordFound".id;


--
-- Name: Game; Type: TABLE; Schema: public; Owner: letterland_admin
--

CREATE TABLE public."Game" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "gameTemplateId" integer NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "finishedAt" timestamp(3) without time zone,
    "isHintUsed" boolean DEFAULT false NOT NULL,
    "isFinished" boolean DEFAULT false NOT NULL,
    timer integer,
    "gameType" public."GameType" NOT NULL
);


ALTER TABLE public."Game" OWNER TO letterland_admin;

--
-- Name: GameTemplate; Type: TABLE; Schema: public; Owner: letterland_admin
--

CREATE TABLE public."GameTemplate" (
    id integer NOT NULL,
    "gameTopic" text NOT NULL,
    difficulty public."EnglishLevel" NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    "imageUrl" text,
    "ownerId" integer NOT NULL,
    "gameCode" text
);


ALTER TABLE public."GameTemplate" OWNER TO letterland_admin;

--
-- Name: GameTemplateQuestion; Type: TABLE; Schema: public; Owner: letterland_admin
--

CREATE TABLE public."GameTemplateQuestion" (
    "gameTemplateId" integer NOT NULL,
    "questionId" integer NOT NULL,
    id integer NOT NULL
);


ALTER TABLE public."GameTemplateQuestion" OWNER TO letterland_admin;

--
-- Name: GameTemplateQuestion_id_seq; Type: SEQUENCE; Schema: public; Owner: letterland_admin
--

CREATE SEQUENCE public."GameTemplateQuestion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GameTemplateQuestion_id_seq" OWNER TO letterland_admin;

--
-- Name: GameTemplateQuestion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: letterland_admin
--

ALTER SEQUENCE public."GameTemplateQuestion_id_seq" OWNED BY public."GameTemplateQuestion".id;


--
-- Name: GameTemplate_id_seq; Type: SEQUENCE; Schema: public; Owner: letterland_admin
--

CREATE SEQUENCE public."GameTemplate_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GameTemplate_id_seq" OWNER TO letterland_admin;

--
-- Name: GameTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: letterland_admin
--

ALTER SEQUENCE public."GameTemplate_id_seq" OWNED BY public."GameTemplate".id;


--
-- Name: Game_id_seq; Type: SEQUENCE; Schema: public; Owner: letterland_admin
--

CREATE SEQUENCE public."Game_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Game_id_seq" OWNER TO letterland_admin;

--
-- Name: Game_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: letterland_admin
--

ALTER SEQUENCE public."Game_id_seq" OWNED BY public."Game".id;


--
-- Name: Question; Type: TABLE; Schema: public; Owner: letterland_admin
--

CREATE TABLE public."Question" (
    id integer NOT NULL,
    name text NOT NULL,
    answer text NOT NULL,
    hint text NOT NULL,
    "audioUrl" text
);


ALTER TABLE public."Question" OWNER TO letterland_admin;

--
-- Name: Question_id_seq; Type: SEQUENCE; Schema: public; Owner: letterland_admin
--

CREATE SEQUENCE public."Question_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Question_id_seq" OWNER TO letterland_admin;

--
-- Name: Question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: letterland_admin
--

ALTER SEQUENCE public."Question_id_seq" OWNED BY public."Question".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: letterland_admin
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    age integer NOT NULL,
    "englishLevel" public."EnglishLevel" NOT NULL,
    coin integer DEFAULT 0 NOT NULL,
    hint integer DEFAULT 3 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    total_playtime integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."User" OWNER TO letterland_admin;

--
-- Name: UserAchievement; Type: TABLE; Schema: public; Owner: letterland_admin
--

CREATE TABLE public."UserAchievement" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "achievementId" integer NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "earnedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isClaimed" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."UserAchievement" OWNER TO letterland_admin;

--
-- Name: UserAchievement_id_seq; Type: SEQUENCE; Schema: public; Owner: letterland_admin
--

CREATE SEQUENCE public."UserAchievement_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserAchievement_id_seq" OWNER TO letterland_admin;

--
-- Name: UserAchievement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: letterland_admin
--

ALTER SEQUENCE public."UserAchievement_id_seq" OWNED BY public."UserAchievement".id;


--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: letterland_admin
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO letterland_admin;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: letterland_admin
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: WordFound; Type: TABLE; Schema: public; Owner: letterland_admin
--

CREATE TABLE public."WordFound" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "questionId" integer NOT NULL,
    word text NOT NULL,
    "foundAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "gameId" integer NOT NULL
);


ALTER TABLE public."WordFound" OWNER TO letterland_admin;

--
-- Name: WordFound_id_seq; Type: SEQUENCE; Schema: public; Owner: letterland_admin
--

CREATE SEQUENCE public."WordFound_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."WordFound_id_seq" OWNER TO letterland_admin;

--
-- Name: WordFound_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: letterland_admin
--

ALTER SEQUENCE public."WordFound_id_seq" OWNED BY public."WordFound".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: letterland_admin
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO letterland_admin;

--
-- Name: Achievement id; Type: DEFAULT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."Achievement" ALTER COLUMN id SET DEFAULT nextval('public."Achievement_id_seq"'::regclass);


--
-- Name: ExtraWordFound id; Type: DEFAULT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."ExtraWordFound" ALTER COLUMN id SET DEFAULT nextval('public."ExtraWordFound_id_seq"'::regclass);


--
-- Name: Game id; Type: DEFAULT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."Game" ALTER COLUMN id SET DEFAULT nextval('public."Game_id_seq"'::regclass);


--
-- Name: GameTemplate id; Type: DEFAULT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."GameTemplate" ALTER COLUMN id SET DEFAULT nextval('public."GameTemplate_id_seq"'::regclass);


--
-- Name: GameTemplateQuestion id; Type: DEFAULT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."GameTemplateQuestion" ALTER COLUMN id SET DEFAULT nextval('public."GameTemplateQuestion_id_seq"'::regclass);


--
-- Name: Question id; Type: DEFAULT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."Question" ALTER COLUMN id SET DEFAULT nextval('public."Question_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: UserAchievement id; Type: DEFAULT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."UserAchievement" ALTER COLUMN id SET DEFAULT nextval('public."UserAchievement_id_seq"'::regclass);


--
-- Name: WordFound id; Type: DEFAULT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."WordFound" ALTER COLUMN id SET DEFAULT nextval('public."WordFound_id_seq"'::regclass);


--
-- Data for Name: Achievement; Type: TABLE DATA; Schema: public; Owner: letterland_admin
--

COPY public."Achievement" (id, name, description, "coinReward", "imageUrl") FROM stdin;
2	Vocabulary Master	Learn 10 new words.	50	Vocabulary.png
1	First Puzzle Solved	Welcome to the game!	50	First_Puzzle.png
11	Puzzle Solver	Complete 5 puzzles.	80	Puzzle_Solver.png
13	Puzzle Master	Complete 30 puzzles.	300	Puzzle_Solver.png
14	Puzzle Super 	Complete 50 puzzles.	500	Puzzle_Solver.png
12	Puzzle Expert	Complete 15 puzzles.	150	Puzzle_Solver.png
3	Puzzle Solver	Complete 3 puzzles. 	100	Puzzle_Solver.png
9	Lexicon Legend	Find 100 words.	200	Vocabulary.png
5	Bonus Hunter	Find 5 extra words.	30	Extraword.png
6	Word Explorer	Find 20 extra words.	60	Extraword.png
15	Crossword Beginner	Finish your first crossword game.	20	CrosswordSearch.png
7	Hidden Word Master	Find 50 extra words	100	Extraword.png
4	Curious Finder	Find your first extra word	10	Extraword.png
16	Crossword Solver	Finish 10 crossword games.	100	CrosswordSearch.png
8	Vocabulary Collector	Find 40 words.	100	Vocabulary.png
10	Super Vocabulary	Find 200 words.	400	Vocabulary.png
17	Crossword Prodigy	Finish 20 crossword games.	200	CrosswordSearch.png
18	Wordsearch Beginner	Finish your first word search game.	20	WordSearch.png
20	Wordsearch Prodigy	Finish 20 word search games.	200	WordSearch.png
19	Wordsearch Solver	Finish 10 word search games.	100	WordSearch.png
\.


--
-- Data for Name: ExtraWordFound; Type: TABLE DATA; Schema: public; Owner: letterland_admin
--

COPY public."ExtraWordFound" (id, "userId", word, "foundAt", "gameId", "audioUrl") FROM stdin;
750	46	gold	2025-10-29 04:26:06.418	654	https://drive.google.com/file/d/1AfC-PFPY24uzsDPaZrs4zgldypXuoHTx/view?usp=drivesdk
766	57	live	2025-10-31 11:02:59.103	682	https://drive.google.com/file/d/1KX6OCJyV2xrj1VADp3L4Zds7rxGd0-gg/view?usp=drivesdk
777	45	god	2025-11-01 13:32:27.288	703	https://drive.google.com/file/d/1-vriV9tClTgSiC9uWrc4r31OcPqqRwu6/view?usp=drivesdk
731	43	tea	2025-10-20 10:15:20.936	594	https://drive.google.com/file/d/1ptpQxwDdM3W8mGT2CM5Rs_wb4MGv_VBu/view?usp=drivesdk
798	66	dear	2025-11-07 01:53:28.41	723	https://drive.google.com/file/d/1h_3tcrghlTLl41t3iCN_gpB1nMoP8RyE/view?usp=drivesdk
810	66	wing	2025-11-07 04:18:17.729	741	https://drive.google.com/file/d/14XFMVZPmSB5oTVfi_K3vqML_WDaPlSwk/view?usp=drivesdk
811	66	peris	2025-11-07 04:21:29.386	742	https://drive.google.com/file/d/15HNUB_xHJ7sfqmyBSeCXdwwA0KFmKG9K/view?usp=drivesdk
824	66	scoped	2025-11-07 07:04:45.791	759	https://drive.google.com/file/d/1UC7AG-heFDWDSbyJD6hoyF7Ehf78Y7j0/view?usp=drivesdk
825	66	work	2025-11-07 07:06:07.171	759	https://drive.google.com/file/d/1lp8LvAYRG-84zMT_UQ3J1LBWCm82_zo4/view?usp=drivesdk
826	66	frame	2025-11-07 07:06:35.625	759	https://drive.google.com/file/d/1bIyrHhexernOD9bp-MH4H5TcjyR4gcMs/view?usp=drivesdk
837	66	frag	2025-11-07 08:54:12.054	773	https://drive.google.com/file/d/1IXp21SGJAz7HZknhaOo36j613OWutVtS/view?usp=drivesdk
751	46	petal	2025-10-29 04:28:41.021	655	https://drive.google.com/file/d/1KEjml37aF5tY3Z-fo1y5VxUr9cBJ6Zbk/view?usp=drivesdk
752	46	just	2025-10-29 04:28:52.068	655	https://drive.google.com/file/d/1A0zsxEHu5reBHbUrwSVMYMpSusc153q3/view?usp=drivesdk
753	46	men	2025-10-29 04:29:04.918	655	https://drive.google.com/file/d/1V90ZpXHkV-fLQTEfQktlx7lyW_o1cQMt/view?usp=drivesdk
754	46	evolve	2025-10-29 04:29:14.631	655	https://drive.google.com/file/d/14uRo3C9s4gxElrdpYLL3_QlC0jZiMSjC/view?usp=drivesdk
755	46	stamen	2025-10-29 04:29:48.478	655	https://drive.google.com/file/d/1oFdGaCF-nmfhGOhOtEre62cvQjIiet9Y/view?usp=drivesdk
767	45	coevolution	2025-10-31 11:12:04.777	685	https://drive.google.com/file/d/1issk03TRVKJptTc1dW7qi9oEny2geix7/view?usp=drivesdk
778	64	dry	2025-11-04 07:13:27.923	704	https://drive.google.com/file/d/1t-QmakzfhUFS8NVKunx0SMl3Cku6j7dE/view?usp=drivesdk
799	66	ant	2025-11-07 02:18:10.274	726	https://drive.google.com/file/d/1VqSXbWGq3MuWtvx0SXN8DrXxUEt7oaJX/view?usp=drivesdk
800	66	red	2025-11-07 02:18:39.496	726	https://drive.google.com/file/d/1er3z6nNJMnnRhMkNsVAwCSHsdZjGhkpK/view?usp=drivesdk
812	66	son	2025-11-07 04:32:52.837	744	https://drive.google.com/file/d/1YLjH45WWmzMTR34l8mpeKvpIxipHFF3l/view?usp=drivesdk
113	1	proper	2025-09-19 17:56:02.66	223	https://drive.google.com/file/d/1ukRv-JC6w6FFyormGbr3GuYFacYkzwTS/view?usp=drivesdk
114	1	gel	2025-09-19 17:56:22.525	223	https://drive.google.com/file/d/1xngS1NZSs9n_NshxZKqwXxExQHM07JHH/view?usp=drivesdk
115	1	lag	2025-09-19 17:56:25.144	223	https://drive.google.com/file/d/1kr_tXo4AfMNadqX51qbkQdxuoZCm_AT-/view?usp=drivesdk
732	43	say	2025-10-20 10:16:02.461	594	https://drive.google.com/file/d/1_MxgmIMZZVovjiqKAe76H_HzoZjATwO9/view?usp=drivesdk
117	1	closet	2025-09-19 17:56:39.59	223	https://drive.google.com/file/d/1x-LXC_PPj0Ss7KLHFPos8LHrCWRxtbcG/view?usp=drivesdk
120	1	main	2025-09-19 18:12:34.733	223	https://drive.google.com/file/d/1K0We9mJqzF7u-lTH3l24J3GZ2YyqjdMd/view?usp=drivesdk
121	1	gas	2025-09-19 18:20:18.957	223	https://drive.google.com/file/d/1c3P1SdYcUvQ9sy9tNJ1LsgrjeMu1OH6Y/view?usp=drivesdk
827	66	read	2025-11-07 07:20:41.066	761	https://drive.google.com/file/d/1QUBcnPbre1p9vOZIxsFMESJ7nSldTmUV/view?usp=drivesdk
841	66	fee	2025-11-19 09:40:00.474	777	https://drive.google.com/file/d/1ejC-cSetK9msa5qgxjz2WvIawFGiz7l2/view?usp=drivesdk
130	1	pose	2025-09-19 18:40:56.651	224	https://drive.google.com/file/d/1qOchmTglZfIrhjTEr6Y5vDmRaiwaeXpM/view?usp=drivesdk
131	1	put	2025-09-19 18:41:17.196	224	https://drive.google.com/file/d/106nX5GdripzXj6tswGGriRUf-FZBxM3r/view?usp=drivesdk
132	1	pen	2025-09-19 18:41:34.477	224	https://drive.google.com/file/d/1zN3oTKHVbVZCNED9uPwbvNcHjxKXJf-m/view?usp=drivesdk
133	1	pens	2025-09-19 18:41:39.053	224	https://drive.google.com/file/d/1_vlm5lOGd7lgFKKfj9_AKL0tCR_wES4q/view?usp=drivesdk
134	1	ass	2025-09-19 18:42:51.841	224	https://drive.google.com/file/d/1fWKscIumxoqOMu3m0g1O09SlC0TBrtbv/view?usp=drivesdk
138	1	cat	2025-09-19 18:55:59.749	224	https://drive.google.com/file/d/1SKHrVWSjAOQOOWbwNA8yVCcsf89QnNkE/view?usp=drivesdk
141	1	composer	2025-09-19 18:57:52.802	224	https://drive.google.com/file/d/1MQHvGVBevG65uXps76fPThMsiqew7D5q/view?usp=drivesdk
144	1	ret	2025-09-19 19:17:44.794	224	https://drive.google.com/file/d/1C8buMm5sgltmsl4drKnxbANZLbGX40pD/view?usp=drivesdk
145	1	sit	2025-09-19 19:17:57.479	224	https://drive.google.com/file/d/1DD28FAkG6LP24LvQ8WXk4ndSewNT5M4h/view?usp=drivesdk
152	1	educated	2025-09-22 09:23:48.759	225	https://drive.google.com/file/d/1nbk7yKNake3PGkZ595PwT2mGXJtPTFCP/view?usp=drivesdk
160	1	pen	2025-09-22 09:28:42.913	225	https://drive.google.com/file/d/1zN3oTKHVbVZCNED9uPwbvNcHjxKXJf-m/view?usp=drivesdk
161	1	pens	2025-09-22 09:28:44.856	225	https://drive.google.com/file/d/1_vlm5lOGd7lgFKKfj9_AKL0tCR_wES4q/view?usp=drivesdk
168	1	pre	2025-09-22 09:48:24.704	225	https://drive.google.com/file/d/1y-8R7hvl5Rqfh9lSbl_UQuEQnYlIS9ys/view?usp=drivesdk
169	1	educatep	2025-09-22 09:48:29.519	225	https://drive.google.com/file/d/1VkTh4nlbRp23U6rRoK1xL6nyV6OmvAfn/view?usp=drivesdk
756	47	work	2025-10-29 04:42:37.416	657	https://drive.google.com/file/d/1lp8LvAYRG-84zMT_UQ3J1LBWCm82_zo4/view?usp=drivesdk
757	47	won	2025-10-29 04:42:41.386	657	https://drive.google.com/file/d/15bTHSSgCwTOymScxQl0KUPEC-EqtyuSR/view?usp=drivesdk
768	59	awaken	2025-10-31 14:25:49.606	689	https://drive.google.com/file/d/15cEnjyV-4FpPRSQEd35IyqexlTXapXx_/view?usp=drivesdk
779	63	rue	2025-11-04 07:31:19.466	707	https://drive.google.com/file/d/1rRmln2UIBRoq3uFsfnKgdcwMRWSr7ED0/view?usp=drivesdk
733	43	goo	2025-10-20 11:39:07.386	606	https://drive.google.com/file/d/1BlfZPFlwnxdZDCzp-n2rTFgE0P-Y_Wmt/view?usp=drivesdk
744	2	owl	2025-10-28 10:07:58.402	619	https://drive.google.com/file/d/1heBqO2abFp8ofoPbSyXKdj2aFhMwGE9v/view?usp=drivesdk
182	1	man	2025-09-22 10:57:32.661	225	https://drive.google.com/file/d/1wV5eIGUfdQpToZ_Z8yll9Uaa5Bmo5EbD/view?usp=drivesdk
781	63	dut	2025-11-04 07:31:23.521	707	https://drive.google.com/file/d/1hy9uNfoIVMn-zhEKmA5i6vm3i4wm-qWf/view?usp=drivesdk
801	66	toy	2025-11-07 02:22:23.79	727	https://drive.google.com/file/d/1VQ7yrz8eidzIqj9iM51bh7dKJLNUKSzf/view?usp=drivesdk
802	66	rice	2025-11-07 02:23:02.102	727	https://drive.google.com/file/d/1SwGeRVWPazYGYI5Ec3z-9UcDoIV9uSnG/view?usp=drivesdk
813	66	bubbled	2025-11-07 04:38:29.998	745	https://drive.google.com/file/d/1hCqJ0EFX1pTUyCT7onk9jtBACDUVEUkV/view?usp=drivesdk
814	66	mix	2025-11-07 04:38:46.736	745	https://drive.google.com/file/d/1KZz4V1kfyYFW0I8Gm8myc9RwNj5UKksq/view?usp=drivesdk
828	66	nutrient	2025-11-07 07:35:31.291	764	https://drive.google.com/file/d/1lYUJyZBWPiQBWUkTUS8uoMbLHtzgc_c-/view?usp=drivesdk
190	1	cat	2025-09-22 10:58:51.166	225	https://drive.google.com/file/d/1SKHrVWSjAOQOOWbwNA8yVCcsf89QnNkE/view?usp=drivesdk
842	66	headlight	2025-11-19 12:46:22.027	778	https://drive.google.com/file/d/1CWMF6svHz8oA6Kb0eF9smFS3dKXtdK-R/view?usp=drivesdk
843	66	head	2025-11-19 12:46:22.823	778	https://drive.google.com/file/d/1l2g1-QLPTQopJSiD7aYxiogJavzTb6ol/view?usp=drivesdk
844	66	board	2025-11-19 12:47:01.252	778	https://drive.google.com/file/d/1K_wnxkfTOR9VhBVbKW3Jq7lf9fnx8uHa/view?usp=drivesdk
199	1	pose	2025-09-22 11:35:41.435	225	https://drive.google.com/file/d/1qOchmTglZfIrhjTEr6Y5vDmRaiwaeXpM/view?usp=drivesdk
201	1	comp	2025-09-22 12:12:04.741	225	https://drive.google.com/file/d/1ozWplQ8kCnp5QkIswSaVoOa_or28iDbs/view?usp=drivesdk
233	1	closes	2025-09-22 14:09:56.276	223	https://drive.google.com/file/d/1Suy9cj65Vz4r0iGVJpyZ-goNHS180vLr/view?usp=drivesdk
234	1	fact	2025-09-22 14:15:00.352	225	https://drive.google.com/file/d/1Iv8lsBmj6YSx-fj2MQEsKg8Zp3MSnCW6/view?usp=drivesdk
758	47	war	2025-10-29 04:46:33.034	658	https://drive.google.com/file/d/12gzBZ75EI6RMmBUZRH5IIRvDqXrodZjE/view?usp=drivesdk
769	60	sample	2025-10-31 14:37:48.816	691	https://drive.google.com/file/d/1SQudkMhChpZ3c-pa7PRGzgOQ3ayX-QZH/view?usp=drivesdk
782	63	fan	2025-11-04 07:35:11.252	707	https://drive.google.com/file/d/14GNbmc2rQ1oza6J8t6JKkMZkr8K77TSF/view?usp=drivesdk
803	66	health	2025-11-07 02:34:53.014	729	https://drive.google.com/file/d/1w90jkfBf1IlbDniJFZbrsxRaW5CP_PIf/view?usp=drivesdk
816	66	provision	2025-11-07 05:19:29.471	748	https://drive.google.com/file/d/11hHET6zpu6xdebI0ETUVck72Wpsx7xBM/view?usp=drivesdk
829	66	rap	2025-11-07 07:39:17.293	765	https://drive.google.com/file/d/1TNzvwi8fTTiuxALWIk6E3F2ZZ2_7qPw-/view?usp=drivesdk
667	10	bend	2025-10-15 14:41:16.071	398	https://drive.google.com/file/d/1h8Adzx16cbckK6Z6MaD_cGT_7SqIVlXu/view?usp=drivesdk
668	10	per	2025-10-15 14:41:28.933	398	https://drive.google.com/file/d/1UPmAnFlFSpDlBSUzVOLCOUQwiyBiF-81/view?usp=drivesdk
669	10	lag	2025-10-15 14:41:34.563	398	https://drive.google.com/file/d/1kr_tXo4AfMNadqX51qbkQdxuoZCm_AT-/view?usp=drivesdk
670	10	work	2025-10-15 14:41:45.86	398	https://drive.google.com/file/d/1lp8LvAYRG-84zMT_UQ3J1LBWCm82_zo4/view?usp=drivesdk
671	10	ten	2025-10-15 14:41:47.836	398	https://drive.google.com/file/d/1coJgmt6ujAs8RDY9iFz744ZWkH4YBsTB/view?usp=drivesdk
672	10	tee	2025-10-15 14:41:52.246	398	https://drive.google.com/file/d/1H_y6-OewfxlIMCIePVaADfIw36Z3f54B/view?usp=drivesdk
673	10	ben	2025-10-15 14:41:59.177	398	https://drive.google.com/file/d/1Zvnerd1xXiQunSh5FebeGyGg5T2fKmsU/view?usp=drivesdk
674	10	sea	2025-10-15 14:44:40.683	398	https://drive.google.com/file/d/1PT6bLMykzJpFcoBho6NqQvobemVTI89G/view?usp=drivesdk
759	47	hog	2025-10-30 15:12:50.097	659	https://drive.google.com/file/d/1kVRFNA17EMS5EUU7V9nPIOBcrky0NaKi/view?usp=drivesdk
760	47	pig	2025-10-30 15:13:05.088	659	https://drive.google.com/file/d/1sAdJxRGpy2Zvx6eJ-eo5RLFhhVMMZO0t/view?usp=drivesdk
770	45	victim	2025-11-01 09:34:24.136	697	https://drive.google.com/file/d/1LGiG954cW19w_FAopCWAS-ub_4AGOrNv/view?usp=drivesdk
783	64	plan	2025-11-04 08:48:05.289	708	https://drive.google.com/file/d/1DkB20kdOX4uecuAtf1q1OYFqBOgaTp-y/view?usp=drivesdk
784	64	ear	2025-11-04 08:49:00.643	708	https://drive.google.com/file/d/1y-NcPbNF9aSyE5Mfjsu6jg0AQT6Fr1rp/view?usp=drivesdk
785	64	moral	2025-11-04 08:49:35.655	708	https://drive.google.com/file/d/1pGkpDWIWk0OERU689rjz5JJ9nB7rCFV7/view?usp=drivesdk
804	66	way	2025-11-07 02:57:46.768	730	https://drive.google.com/file/d/1gD-3foJy9HdMtf3AllFTUXmSQfoQX_SA/view?usp=drivesdk
817	66	work	2025-11-07 05:48:16.15	751	https://drive.google.com/file/d/1lp8LvAYRG-84zMT_UQ3J1LBWCm82_zo4/view?usp=drivesdk
830	66	ran	2025-11-07 07:51:54.581	767	https://drive.google.com/file/d/1SlaHYY2-k_GP6qGrLNdy8DihSKcsg1_Q/view?usp=drivesdk
831	66	talent	2025-11-07 07:53:57.852	767	https://drive.google.com/file/d/1xlYoxa8u5eKMjryFN_Vko1WcipduJuK_/view?usp=drivesdk
746	45	biga	2025-10-28 15:07:19.868	621	https://drive.google.com/file/d/1mJeXUjeyw3Cw9u_mX9OQr-7ofINWbh1z/view?usp=drivesdk
747	45	dry	2025-10-28 15:07:42.74	621	https://drive.google.com/file/d/1t-QmakzfhUFS8NVKunx0SMl3Cku6j7dE/view?usp=drivesdk
761	47	highway	2025-10-30 15:19:26.906	661	https://drive.google.com/file/d/1LM7MVi2p7wTEblk0RawpCSTnbC-Rpn0T/view?usp=drivesdk
771	45	male	2025-11-01 09:39:47.136	698	https://drive.google.com/file/d/1XMIRAn9AH7ArWmGvS3xjdrl59LNb-R3o/view?usp=drivesdk
786	10	toy	2025-11-04 11:11:07.523	709	https://drive.google.com/file/d/1VQ7yrz8eidzIqj9iM51bh7dKJLNUKSzf/view?usp=drivesdk
787	10	gifts	2025-11-04 11:11:21.2	709	https://drive.google.com/file/d/1CCdEuSffeo77GBTCDGRXmbgXNNUippr5/view?usp=drivesdk
805	66	cast	2025-11-07 03:11:46.698	732	https://drive.google.com/file/d/1jXrdbZfH99z9Kd1iFgaE3dpc5EYBRTO9/view?usp=drivesdk
818	66	saver	2025-11-07 06:00:04.661	752	https://drive.google.com/file/d/1zFHm9EshMUmaBjbTk0vqiOH_yIZGqgpp/view?usp=drivesdk
832	66	hero	2025-11-07 07:59:58.111	768	https://drive.google.com/file/d/1iih4w7IVYK3K1a2U97_U_Cd08HMV11NO/view?usp=drivesdk
737	2	shit	2025-10-22 06:27:59.345	614	https://drive.google.com/file/d/1qqRsGrX-z_i3erub8FrqwHah3AvxrxLc/view?usp=drivesdk
415	10	own	2025-09-26 05:57:42.11	229	https://drive.google.com/file/d/1VJmzIXe6W798TUgbIuSkI5Bhn_dHI6bn/view?usp=drivesdk
417	10	grow	2025-09-26 05:57:44.818	229	https://drive.google.com/file/d/1TSSfrefmGOHusmRb4DhhmaCRzR7dRhxn/view?usp=drivesdk
420	10	closes	2025-09-26 05:57:48.39	229	https://drive.google.com/file/d/1Suy9cj65Vz4r0iGVJpyZ-goNHS180vLr/view?usp=drivesdk
441	10	pens	2025-09-29 08:58:45.626	228	https://drive.google.com/file/d/1_vlm5lOGd7lgFKKfj9_AKL0tCR_wES4q/view?usp=drivesdk
442	10	closer	2025-09-29 09:16:31.258	229	https://drive.google.com/file/d/111xxYAr7Y45fzwk1-NlrQZoDiVjS9O8N/view?usp=drivesdk
446	10	love	2025-09-29 09:36:04.378	229	https://drive.google.com/file/d/1pSk78fhdpYqnW8slkSt80JoeX5j7q3lX/view?usp=drivesdk
454	10	cat	2025-09-29 13:52:23.383	228	https://drive.google.com/file/d/1SKHrVWSjAOQOOWbwNA8yVCcsf89QnNkE/view?usp=drivesdk
458	32	fact	2025-10-01 10:23:33.407	154	https://drive.google.com/file/d/1Iv8lsBmj6YSx-fj2MQEsKg8Zp3MSnCW6/view?usp=drivesdk
459	1	baby	2025-10-01 11:23:56.592	238	https://drive.google.com/file/d/10y-TOKpUj6tJ7SP7I3JCvkpqKhNm8T3T/view?usp=drivesdk
461	10	pens	2025-10-04 12:29:44.221	243	https://drive.google.com/file/d/1_vlm5lOGd7lgFKKfj9_AKL0tCR_wES4q/view?usp=drivesdk
464	10	tap	2025-10-04 12:30:34.41	243	https://drive.google.com/file/d/1NU_vKvkuAu86a295xeuUpqIXLNoq-fGg/view?usp=drivesdk
467	10	dot	2025-10-04 12:32:26.812	243	https://drive.google.com/file/d/1yHBhNBjXJti-GMLh-Z3yuEM8GGgZDbsd/view?usp=drivesdk
763	45	culture	2025-10-30 17:05:00.36	668	https://drive.google.com/file/d/1x24ZFRHW5FjcglqRs9cARglBiHfTvEQ7/view?usp=drivesdk
772	45	tin	2025-11-01 09:50:39.074	700	https://drive.google.com/file/d/1Va2ahWQG5m4-9xOXApqZxAamWv1qm-nV/view?usp=drivesdk
788	10	woo	2025-11-04 11:20:00.02	710	https://drive.google.com/file/d/1AlJ72C1N4yHoauv5bHs40vEU3DNcMugH/view?usp=drivesdk
789	10	vat	2025-11-04 11:20:26.339	710	https://drive.google.com/file/d/1vpoPviDexTFSwrsNnkoXiG3VCbHznp_q/view?usp=drivesdk
790	10	gin	2025-11-04 11:21:03.69	710	https://drive.google.com/file/d/1ydquIG9X0GXTLzb4bz4t3n9lfUSip35M/view?usp=drivesdk
738	2	ride	2025-10-22 06:29:56.683	614	https://drive.google.com/file/d/1qKSynDT-j2bnzRXfj6jH6IWASlIYPgtN/view?usp=drivesdk
476	10	due	2025-10-04 12:36:24.265	243	https://drive.google.com/file/d/1nCecJopDvCuE_JM5zZ_GMz9VEWAZBffv/view?usp=drivesdk
477	10	dues	2025-10-04 12:36:28.464	243	https://drive.google.com/file/d/1PplVokbxMy14D-ZRO0FrgGMZcAhG4Fe7/view?usp=drivesdk
749	45	fat	2025-10-28 19:09:24.288	643	https://drive.google.com/file/d/1BjVJhPKPjNoIX9b7bXVFJx3MET2n6cWZ/view?usp=drivesdk
479	10	hug	2025-10-04 12:40:07.785	243	https://drive.google.com/file/d/1h5WWQCrPqShRJwG753fCgMdSd00Jrhnu/view?usp=drivesdk
791	10	mas	2025-11-04 11:21:41.254	710	https://drive.google.com/file/d/1659JuxGTug-i9w34oeY-sjlWukfdw3aT/view?usp=drivesdk
806	66	cart	2025-11-07 03:34:40.987	736	https://drive.google.com/file/d/1Pi49KYkX7VlgT4vlnkgNBD8EaXI_Sbi7/view?usp=drivesdk
807	66	men	2025-11-07 03:36:47.622	736	https://drive.google.com/file/d/1V90ZpXHkV-fLQTEfQktlx7lyW_o1cQMt/view?usp=drivesdk
819	1	bob	2025-11-07 06:11:49.342	754	https://drive.google.com/file/d/1U8L2JTFgODYS6fsjAtP4kLZDfToxQV_Y/view?usp=drivesdk
833	66	port	2025-11-07 08:13:34.721	769	https://drive.google.com/file/d/1x2qzG-AodtCpBggYRCRExYAkrjn7KIlb/view?usp=drivesdk
496	10	curl	2025-10-04 12:50:11.987	136	https://drive.google.com/file/d/10YN4GFjrP2V6JaVWgn7uDA1S0O_6zqCr/view?usp=drivesdk
505	10	adult	2025-10-04 13:10:30.641	189	https://drive.google.com/file/d/1cDJRbCv6bjaQbRmMUgnsa_vZNPDuq23A/view?usp=drivesdk
506	10	adults	2025-10-04 13:10:39.592	189	https://drive.google.com/file/d/1-mJHKRoderePIDUttCaMwCjbvIfBvdbs/view?usp=drivesdk
508	1	rick	2025-10-05 09:03:44.556	208	https://drive.google.com/file/d/1Tkxqq5qwRvcporQOB-Q5uVsQBe8noMG9/view?usp=drivesdk
511	10	pose	2025-10-06 13:48:45.123	250	https://drive.google.com/file/d/1qOchmTglZfIrhjTEr6Y5vDmRaiwaeXpM/view?usp=drivesdk
516	10	seek	2025-10-07 09:17:58.128	255	https://drive.google.com/file/d/1Xwy-5SThl7lp2N5UUmUvxAdpvAQwSJQm/view?usp=drivesdk
517	10	deep	2025-10-07 09:20:20.077	243	https://drive.google.com/file/d/1wT8ktX61mzMxIbGcE-4jU4kacup4MAi_/view?usp=drivesdk
523	10	portals	2025-10-07 09:50:20.27	255	https://drive.google.com/file/d/16iFdjT4ayhRMPn3OnwJxbwSgH8DS3dxI/view?usp=drivesdk
524	10	seeks	2025-10-07 09:50:23.887	255	https://drive.google.com/file/d/1wxIP_aYYvTjVaGRct7U4BZahbzTpHtzJ/view?usp=drivesdk
553	10	law	2025-10-09 09:55:13.965	129	https://drive.google.com/file/d/1vZrmo8oHczCpWDpfRbq9--bYwE1335LF/view?usp=drivesdk
559	10	raw	2025-10-09 10:06:23.866	299	https://drive.google.com/file/d/1XE0zViSs-LOigQBI_WslSNZsKy91ewAI/view?usp=drivesdk
560	10	get	2025-10-09 10:06:57.342	299	https://drive.google.com/file/d/1fciB0HmFYJDU8lxg1Xvzthzb35qRtJDe/view?usp=drivesdk
561	10	dwarf	2025-10-09 10:09:30.484	299	https://drive.google.com/file/d/1nW2pyZ-wnjkgvHDe-WlwOCyg1hgD9m8e/view?usp=drivesdk
764	45	sensitize	2025-10-30 17:47:00.19	672	https://drive.google.com/file/d/1ho-gThpl7OBecVXF553k2LWOxlbP1N7w/view?usp=drivesdk
773	45	bio	2025-11-01 09:51:07.188	700	https://drive.google.com/file/d/1SQRA2h4fmQLt6-BXHDPylu-nJxMQRL2P/view?usp=drivesdk
774	45	cat	2025-11-01 09:52:36.282	700	https://drive.google.com/file/d/1SKHrVWSjAOQOOWbwNA8yVCcsf89QnNkE/view?usp=drivesdk
775	45	sion	2025-11-01 09:55:14.713	700	https://drive.google.com/file/d/1s6g7WVGvjbjgBiNCFMmwzrEZMfn77smP/view?usp=drivesdk
792	66	peat	2025-11-07 00:51:49.631	716	https://drive.google.com/file/d/1TDHUdSpt3_HH1yspkfe9rIgg1KH8tGFM/view?usp=drivesdk
793	66	duo	2025-11-07 00:51:50.924	716	https://drive.google.com/file/d/1VerG37oWtME9Q2SySsKJI6oDb3VkJnJF/view?usp=drivesdk
794	66	pear	2025-11-07 00:52:07.425	716	https://drive.google.com/file/d/17fP7UNPf-cGGQBP2j9H-lebMeTlp7uut/view?usp=drivesdk
795	66	birds	2025-11-07 00:53:30.912	717	https://drive.google.com/file/d/1GQzOPmtbQCVUY4IXs4nl4SJPZlRKQN1c/view?usp=drivesdk
796	66	god	2025-11-07 00:53:36.286	717	https://drive.google.com/file/d/1-vriV9tClTgSiC9uWrc4r31OcPqqRwu6/view?usp=drivesdk
808	66	noon	2025-11-07 03:39:37.263	737	https://drive.google.com/file/d/1MGPuJt3my4EqW89Wek9vUFDvUqJqFdzI/view?usp=drivesdk
820	66	war	2025-11-07 06:32:08.697	755	https://drive.google.com/file/d/12gzBZ75EI6RMmBUZRH5IIRvDqXrodZjE/view?usp=drivesdk
739	1	pets	2025-10-27 13:19:39.996	615	https://drive.google.com/file/d/1AWvmMkrsec7l7DfzYHq9mn5xW5xV8vJp/view?usp=drivesdk
834	66	health	2025-11-07 08:20:26.937	770	https://drive.google.com/file/d/1w90jkfBf1IlbDniJFZbrsxRaW5CP_PIf/view?usp=drivesdk
605	1	settling	2025-10-09 14:42:13.132	337	https://drive.google.com/file/d/1mgNpd1gL29a-V50DXMMEzfGmTAAYJNkr/view?usp=drivesdk
606	1	set	2025-10-09 14:42:18.946	337	https://drive.google.com/file/d/1p30xyO5OKNWeQemk7yz2tse39aDU73Nq/view?usp=drivesdk
608	1	pet	2025-10-09 14:42:42.258	337	https://drive.google.com/file/d/1kFFHOEDdvUiSLwdjGnS-Vp23T7I7ULDa/view?usp=drivesdk
609	1	pets	2025-10-09 14:42:44.189	337	https://drive.google.com/file/d/1AWvmMkrsec7l7DfzYHq9mn5xW5xV8vJp/view?usp=drivesdk
610	1	dwarf	2025-10-09 14:42:59.593	337	https://drive.google.com/file/d/1nW2pyZ-wnjkgvHDe-WlwOCyg1hgD9m8e/view?usp=drivesdk
776	61	corp	2025-11-01 13:21:38.628	701	https://drive.google.com/file/d/1RUfxFzQT2PMLycin7oaDBUbYXspERhES/view?usp=drivesdk
797	66	war	2025-11-07 01:08:22.502	718	https://drive.google.com/file/d/12gzBZ75EI6RMmBUZRH5IIRvDqXrodZjE/view?usp=drivesdk
809	66	provision	2025-11-07 03:47:37.499	738	https://drive.google.com/file/d/11hHET6zpu6xdebI0ETUVck72Wpsx7xBM/view?usp=drivesdk
821	66	bet	2025-11-07 06:51:01.956	757	https://drive.google.com/file/d/18yD-W1oZpweWpUxvsMbucsVA4O-y2Vrm/view?usp=drivesdk
822	66	met	2025-11-07 06:51:10.363	757	https://drive.google.com/file/d/1H_yK0RDXotFH1cO0OtcKuiNhbCyFjT9g/view?usp=drivesdk
823	66	par	2025-11-07 06:51:29.939	757	https://drive.google.com/file/d/1xiKKAKxAMlD-NVQWxe0_Z3eskS21-nBR/view?usp=drivesdk
835	66	grant	2025-11-07 08:51:50.495	773	https://drive.google.com/file/d/1Y3GAMTJj89tKSKgjHuVaGX4bTACit12F/view?usp=drivesdk
836	66	petal	2025-11-07 08:51:58.689	773	https://drive.google.com/file/d/1KEjml37aF5tY3Z-fo1y5VxUr9cBJ6Zbk/view?usp=drivesdk
\.


--
-- Data for Name: Game; Type: TABLE DATA; Schema: public; Owner: letterland_admin
--

COPY public."Game" (id, "userId", "gameTemplateId", "startedAt", "finishedAt", "isHintUsed", "isFinished", timer, "gameType") FROM stdin;
644	45	253	2025-10-28 20:05:16.18	2025-10-28 20:07:31.336	f	t	\N	WORD_SEARCH
691	60	291	2025-10-31 14:35:03.843	2025-10-31 14:38:44.891	f	t	300	WORD_SEARCH
652	45	255	2025-10-28 20:42:39.366	2025-10-28 20:48:36.597	t	t	\N	CROSSWORD_SEARCH
695	45	295	2025-10-31 15:17:58.358	2025-10-31 15:22:51.384	t	t	\N	WORD_SEARCH
139	2	77	2025-09-07 13:36:23.046	2025-09-07 13:49:33.978	f	t	\N	WORD_SEARCH
657	47	259	2025-10-29 04:41:29.78	2025-10-29 04:43:06.127	f	t	\N	WORD_SEARCH
662	45	264	2025-10-30 15:26:36.383	2025-10-30 15:27:35.023	f	t	\N	WORD_SEARCH
666	45	268	2025-10-30 16:18:07.348	2025-10-30 16:19:18.334	f	t	\N	WORD_SEARCH
670	45	272	2025-10-30 17:29:07.68	2025-10-30 17:31:07.134	f	t	\N	WORD_SEARCH
699	45	299	2025-11-01 09:43:53.205	2025-11-01 09:45:51.734	f	t	540	CROSSWORD_SEARCH
703	45	281	2025-11-01 13:31:11.374	2025-11-01 13:32:48.216	f	t	540	CROSSWORD_SEARCH
674	45	276	2025-10-30 18:19:55.469	2025-10-30 18:26:10.635	f	t	\N	WORD_SEARCH
154	32	88	2025-09-08 07:40:49.877	2025-09-08 07:42:10.652	f	t	\N	WORD_SEARCH
682	57	282	2025-10-31 11:01:34.197	2025-10-31 11:02:58.803	f	t	\N	WORD_SEARCH
686	45	286	2025-10-31 11:13:11.493	2025-10-31 11:17:48.248	f	t	\N	WORD_SEARCH
120	10	76	2025-09-05 11:23:38.124	2025-09-05 11:30:16.426	t	t	\N	WORD_SEARCH
690	60	290	2025-10-31 14:30:00.85	2025-10-31 14:31:31.229	f	t	420	WORD_SEARCH
707	63	288	2025-11-04 07:28:15.206	2025-11-04 07:33:16.102	f	t	300	WORD_SEARCH
752	66	328	2025-11-07 05:58:50.303	2025-11-07 06:01:08.206	f	t	\N	CROSSWORD_SEARCH
711	45	305	2025-11-06 13:40:17.709	2025-11-06 13:42:51.265	t	t	\N	WORD_SEARCH
715	66	261	2025-11-06 17:01:47.316	\N	f	f	300	CROSSWORD_SEARCH
128	1	81	2025-09-06 19:58:50.772	2025-09-06 20:01:41.083	t	t	300	WORD_SEARCH
724	10	306	2025-11-07 02:03:56.615	2025-11-07 02:05:34.657	f	t	\N	WORD_SEARCH
227	1	91	2025-09-06 06:13:46.329	2025-09-23 06:15:19.264	f	t	\N	WORD_SEARCH
143	29	81	2025-09-07 14:50:35.99	\N	f	f	\N	CROSSWORD_SEARCH
224	1	95	2025-09-19 18:40:27.002	2025-09-19 18:41:43.153	f	t	\N	WORD_SEARCH
730	66	312	2025-11-07 02:56:19.708	2025-11-07 02:58:29.346	f	t	300	WORD_SEARCH
734	66	315	2025-11-07 03:19:25.749	2025-11-07 03:21:04.524	f	t	300	CROSSWORD_SEARCH
616	2	228	2025-10-28 05:42:58.833	2025-10-28 05:45:13.113	f	t	\N	CROSSWORD_SEARCH
756	66	332	2025-11-07 06:38:14.094	2025-11-07 06:41:00.239	t	t	\N	CROSSWORD_SEARCH
140	2	81	2025-09-07 13:38:39.8	2025-09-07 13:41:55.738	t	t	\N	CROSSWORD_SEARCH
738	66	318	2025-11-07 03:46:39.541	2025-11-07 03:48:46.288	t	t	\N	WORD_SEARCH
742	66	318	2025-11-07 04:19:06.655	2025-11-07 04:22:18.968	t	t	\N	CROSSWORD_SEARCH
747	66	325	2025-11-07 05:00:12.159	2025-11-07 05:02:12.06	f	t	\N	WORD_SEARCH
137	10	83	2025-09-06 21:01:04.388	2025-09-06 21:04:30.504	t	t	300	WORD_SEARCH
751	66	327	2025-11-07 05:47:31.383	2025-11-07 05:48:43.691	f	t	\N	WORD_SEARCH
127	1	79	2025-09-06 19:51:01.093	2025-09-06 19:55:07.473	f	t	\N	CROSSWORD_SEARCH
760	66	335	2025-11-07 07:10:34.254	2025-11-07 07:11:40.405	f	t	\N	WORD_SEARCH
122	10	77	2025-09-06 09:29:39.632	2025-09-06 16:29:08.041	t	t	\N	WORD_SEARCH
238	1	96	2025-10-01 11:23:17.152	2025-10-01 11:24:00.33	f	t	\N	WORD_SEARCH
129	10	81	2025-09-06 20:42:11.977	2025-09-06 20:47:34.69	t	t	\N	CROSSWORD_SEARCH
548	1	81	2025-10-16 14:47:01.517	2025-10-16 15:33:14.437	t	t	300	CROSSWORD_SEARCH
142	29	81	2025-09-07 14:50:29.855	\N	f	f	\N	CROSSWORD_SEARCH
764	66	339	2025-11-07 07:34:42.945	2025-11-07 07:35:58.551	t	t	\N	WORD_SEARCH
150	29	81	2025-09-07 15:53:14.892	2025-09-07 15:59:17.144	f	t	\N	WORD_SEARCH
155	32	81	2025-09-08 07:43:29.972	2025-09-08 07:45:54.151	t	t	\N	WORD_SEARCH
136	10	82	2025-09-06 20:59:23.749	2025-09-07 14:33:01.704	t	t	\N	WORD_SEARCH
768	66	343	2025-11-07 07:58:59.604	2025-11-07 08:01:41.18	t	t	300	CROSSWORD_SEARCH
772	66	347	2025-11-07 08:44:47.672	2025-11-07 08:45:36.749	t	t	\N	WORD_SEARCH
777	66	332	2025-11-19 09:39:12.141	2025-11-19 09:44:01.882	t	t	300	WORD_SEARCH
576	1	202	2025-10-19 16:27:36.211	\N	f	f	300	WORD_SEARCH
619	2	225	2025-10-28 10:03:51.932	2025-10-28 10:09:09.545	t	t	\N	CROSSWORD_SEARCH
592	43	203	2025-10-20 10:02:47.291	2025-10-20 10:05:11.726	t	t	300	WORD_SEARCH
610	10	224	2025-10-20 19:02:06.872	2025-10-20 19:03:56.337	f	t	\N	WORD_SEARCH
692	60	292	2025-10-31 14:48:05.489	\N	f	f	300	WORD_SEARCH
653	46	91	2025-10-29 04:22:22.272	2025-10-29 04:23:23.774	f	t	60	WORD_SEARCH
696	45	296	2025-10-31 15:25:59.006	2025-10-31 15:28:43.018	t	t	540	WORD_SEARCH
658	47	260	2025-10-29 04:45:10.524	2025-10-29 04:47:18.578	t	t	\N	CROSSWORD_SEARCH
337	1	81	2025-10-09 14:41:04.818	2025-10-09 14:43:16.092	t	t	\N	WORD_SEARCH
121	1	77	2025-09-06 07:52:51.63	\N	f	f	300	CROSSWORD_SEARCH
663	45	265	2025-10-30 15:38:11.063	2025-10-30 15:40:21.815	f	t	\N	WORD_SEARCH
667	45	269	2025-10-30 16:20:43.174	2025-10-30 16:21:51.892	f	t	\N	WORD_SEARCH
671	45	273	2025-10-30 17:34:58.607	2025-10-30 17:36:50.142	f	t	540	WORD_SEARCH
228	10	95	2025-09-06 06:18:15.255	2025-09-23 06:18:58.22	t	t	10	CROSSWORD_SEARCH
675	45	277	2025-10-30 18:33:10.79	2025-10-30 18:35:12.321	f	t	300	WORD_SEARCH
700	45	300	2025-11-01 09:49:46.82	2025-11-01 09:59:53.244	t	t	\N	CROSSWORD_SEARCH
683	57	283	2025-10-31 11:03:56.551	2025-10-31 11:05:33.135	f	t	\N	WORD_SEARCH
687	45	287	2025-10-31 11:23:30.139	2025-10-31 11:26:16.44	f	t	\N	WORD_SEARCH
704	64	302	2025-11-04 07:10:10.687	2025-11-04 07:16:54.882	t	t	\N	CROSSWORD_SEARCH
708	64	303	2025-11-04 08:46:53.914	2025-11-04 08:50:19.127	f	t	540	CROSSWORD_SEARCH
712	66	264	2025-11-06 16:27:41.209	2025-11-06 16:30:35.392	f	t	\N	CROSSWORD_SEARCH
716	66	252	2025-11-07 00:51:35.038	2025-11-07 00:52:37.354	f	t	300	WORD_SEARCH
717	66	281	2025-11-07 00:53:17.365	2025-11-07 00:54:23.383	f	t	\N	CROSSWORD_SEARCH
218	1	91	2025-09-19 14:01:30.189	2025-09-19 14:31:10.533	t	t	\N	CROSSWORD_SEARCH
243	10	95	2025-10-04 10:00:09.028	2025-10-04 12:30:55.301	t	t	300	CROSSWORD_SEARCH
721	66	307	2025-11-07 01:24:17.285	2025-11-07 01:25:24.895	f	t	\N	WORD_SEARCH
145	29	79	2025-09-07 15:01:25.751	\N	f	f	\N	CROSSWORD_SEARCH
757	66	333	2025-11-07 06:49:57.771	2025-11-07 06:52:12.739	t	t	\N	WORD_SEARCH
126	1	80	2025-09-06 18:50:06.008	2025-09-06 18:58:29.882	t	t	300	WORD_SEARCH
225	1	95	2025-09-06 09:22:48.212	2025-09-06 09:24:04.655	f	t	300	CROSSWORD_SEARCH
726	66	310	2025-11-07 02:17:46.024	2025-11-07 02:18:39.551	f	t	300	WORD_SEARCH
144	29	81	2025-09-07 14:52:29.203	2025-09-07 14:58:32.382	f	t	\N	CROSSWORD_SEARCH
731	66	313	2025-11-07 03:05:38.944	2025-11-07 03:08:50.052	t	t	\N	CROSSWORD_SEARCH
149	29	81	2025-09-07 15:52:33.659	\N	f	f	\N	CROSSWORD_SEARCH
761	66	336	2025-11-07 07:19:27.072	2025-11-07 07:21:26.043	f	t	\N	WORD_SEARCH
735	66	302	2025-11-07 03:22:59.69	2025-11-07 03:24:01.863	t	t	300	WORD_SEARCH
739	66	319	2025-11-07 03:53:12.007	2025-11-07 03:54:28.27	f	t	\N	WORD_SEARCH
743	66	281	2025-11-07 04:23:23.714	2025-11-07 04:24:24.595	f	t	\N	WORD_SEARCH
748	66	318	2025-11-07 05:17:50.795	2025-11-07 05:18:46.907	f	t	\N	WORD_SEARCH
765	66	340	2025-11-07 07:38:28.368	2025-11-07 07:41:04.369	t	t	\N	CROSSWORD_SEARCH
769	66	344	2025-11-07 08:11:07.552	2025-11-07 08:15:46.525	t	t	\N	CROSSWORD_SEARCH
773	66	348	2025-11-07 08:51:07.547	2025-11-07 08:52:10.271	t	t	\N	WORD_SEARCH
778	66	315	2025-11-19 12:46:05.765	2025-11-19 12:47:05.303	t	t	420	WORD_SEARCH
147	29	85	2025-09-07 15:30:24.186	\N	t	f	300	CROSSWORD_SEARCH
250	10	95	2025-10-05 09:07:47.112	2025-10-06 13:48:59.657	t	t	300	CROSSWORD_SEARCH
242	10	95	2025-10-04 09:53:53.194	2025-10-09 10:24:26.092	f	t	\N	WORD_SEARCH
125	1	79	2025-09-06 18:41:21.836	2025-09-06 18:45:40.469	f	t	\N	WORD_SEARCH
396	10	125	2025-10-11 16:31:06.184	2025-10-11 16:31:47.19	t	t	\N	WORD_SEARCH
398	10	126	2025-10-11 16:46:34.778	2025-10-11 16:48:26.782	t	t	300	CROSSWORD_SEARCH
438	2	126	2025-10-12 12:51:33.027	2025-10-12 12:52:42.471	f	t	180	WORD_SEARCH
441	2	127	2025-10-12 13:37:26.4	2025-10-12 13:38:24.989	f	t	300	WORD_SEARCH
614	2	227	2025-10-22 06:27:13.835	2025-10-22 06:30:13.821	t	t	300	CROSSWORD_SEARCH
189	10	79	2025-09-09 14:25:21.964	2025-09-10 09:18:53.809	t	t	\N	CROSSWORD_SEARCH
693	60	293	2025-10-31 14:54:05.906	2025-10-31 15:00:24.462	f	t	\N	WORD_SEARCH
208	1	79	2025-09-28 14:17:26.225	2025-09-28 14:20:46.63	f	t	\N	CROSSWORD_SEARCH
697	45	297	2025-11-01 09:32:40.09	2025-11-01 09:34:25.83	f	t	\N	WORD_SEARCH
654	46	256	2025-10-29 04:25:32.799	2025-10-29 04:26:52.862	f	t	\N	WORD_SEARCH
701	61	301	2025-11-01 13:20:56.054	2025-11-01 13:21:51.934	f	t	540	WORD_SEARCH
659	47	261	2025-10-30 15:12:13.707	2025-10-30 15:14:32.058	t	t	\N	WORD_SEARCH
664	45	266	2025-10-30 15:43:02.713	2025-10-30 15:44:29.796	f	t	\N	WORD_SEARCH
668	45	270	2025-10-30 17:01:47.795	2025-10-30 17:05:36.052	f	t	\N	WORD_SEARCH
672	45	274	2025-10-30 17:42:17.634	2025-10-30 17:47:19.2	f	t	420	WORD_SEARCH
676	45	278	2025-10-30 18:50:09.922	\N	f	f	540	WORD_SEARCH
680	45	258	2025-10-31 07:37:45.528	\N	f	f	300	CROSSWORD_SEARCH
255	10	79	2025-10-07 08:38:08.975	2025-10-07 09:18:22.419	t	t	\N	WORD_SEARCH
684	45	284	2025-10-31 11:06:49.804	2025-10-31 11:09:21.873	f	t	\N	WORD_SEARCH
688	47	288	2025-10-31 11:28:32.104	2025-10-31 11:30:19.209	f	t	\N	WORD_SEARCH
555	1	201	2025-10-16 20:32:43.384	2025-10-16 20:33:59.22	t	t	300	WORD_SEARCH
754	1	330	2025-11-07 06:09:51.732	2025-11-07 06:12:00.452	f	t	\N	WORD_SEARCH
709	10	304	2025-11-04 11:10:37.214	2025-11-04 11:12:06.741	t	t	300	WORD_SEARCH
713	66	261	2025-11-06 16:30:53.908	2025-11-06 16:32:26.214	t	t	\N	CROSSWORD_SEARCH
196	1	77	2025-09-11 13:42:25.065	2025-09-11 13:43:45.624	t	t	\N	CROSSWORD_SEARCH
718	66	251	2025-11-07 01:06:07.091	2025-11-07 01:10:53.188	t	t	\N	CROSSWORD_SEARCH
758	66	334	2025-11-07 06:54:07.083	2025-11-07 06:57:30.745	t	t	\N	CROSSWORD_SEARCH
223	1	94	2025-09-19 17:54:58.569	2025-09-19 17:56:52.028	t	t	\N	WORD_SEARCH
727	66	304	2025-11-07 02:20:53.963	2025-11-07 02:23:02.891	t	t	420	CROSSWORD_SEARCH
728	10	304	2025-11-07 02:20:54.166	2025-11-07 02:23:16.156	t	t	420	CROSSWORD_SEARCH
220	1	91	2025-09-19 17:18:39.523	2025-09-19 17:19:47.298	t	t	\N	WORD_SEARCH
732	66	314	2025-11-07 03:11:15.115	2025-11-07 03:12:05.136	f	t	\N	WORD_SEARCH
762	66	337	2025-11-07 07:22:48.594	2025-11-07 07:24:58.938	t	t	\N	WORD_SEARCH
736	66	316	2025-11-07 03:33:10.31	2025-11-07 03:36:51.405	t	t	\N	CROSSWORD_SEARCH
740	66	320	2025-11-07 04:07:21.786	2025-11-07 04:09:17.653	f	t	\N	WORD_SEARCH
744	66	322	2025-11-07 04:31:34.589	2025-11-07 04:33:22.51	f	t	\N	WORD_SEARCH
229	10	94	2025-09-06 06:52:39.956	2025-09-06 06:54:54.902	t	t	300	CROSSWORD_SEARCH
745	66	323	2025-11-07 04:36:33.726	2025-11-07 04:38:48.462	t	t	\N	CROSSWORD_SEARCH
245	10	95	2025-10-04 12:57:47.687	\N	f	f	300	CROSSWORD_SEARCH
240	10	95	2025-10-04 09:23:41.82	2025-10-04 12:47:54.504	t	t	60	WORD_SEARCH
766	66	341	2025-11-07 07:42:58.479	2025-11-07 07:44:45.844	f	t	\N	WORD_SEARCH
749	66	310	2025-11-07 05:31:47.885	2025-11-07 05:33:19.631	t	t	\N	WORD_SEARCH
299	10	81	2025-10-09 10:05:34.675	2025-10-09 10:10:34.041	t	t	\N	CROSSWORD_SEARCH
770	66	345	2025-11-07 08:18:41.685	2025-11-07 08:20:44.23	t	t	\N	WORD_SEARCH
774	66	349	2025-11-07 09:06:47.916	2025-11-07 09:08:10.823	f	t	\N	WORD_SEARCH
779	66	306	2025-11-19 12:47:37.298	2025-11-19 12:49:57.921	f	t	420	WORD_SEARCH
593	43	203	2025-10-20 10:08:47.088	2025-10-20 10:10:21.025	t	t	180	WORD_SEARCH
375	2	79	2025-10-10 17:04:46.798	2025-10-10 17:06:15.941	f	t	180	WORD_SEARCH
608	10	223	2025-10-20 17:52:01.165	2025-10-20 17:53:26.134	f	t	\N	WORD_SEARCH
611	10	225	2025-10-20 19:24:48.956	2025-10-20 19:28:35.094	f	t	\N	WORD_SEARCH
571	2	199	2025-10-19 14:16:44.077	2025-10-19 14:16:50	f	t	\N	WORD_SEARCH
440	2	127	2025-10-12 13:35:34.115	2025-10-12 13:36:26.108	f	t	180	WORD_SEARCH
617	10	225	2025-10-28 09:07:51.676	2025-10-28 09:08:42.078	t	t	60	WORD_SEARCH
647	45	254	2025-10-28 20:10:49.537	2025-10-28 20:12:26.613	f	t	\N	WORD_SEARCH
643	45	252	2025-10-28 19:08:02.799	2025-10-28 19:10:13	f	t	\N	CROSSWORD_SEARCH
655	46	257	2025-10-29 04:28:06.625	2025-10-29 04:30:41.182	f	t	\N	WORD_SEARCH
660	47	262	2025-10-30 15:15:41.032	2025-10-30 15:16:27.514	f	t	\N	WORD_SEARCH
661	47	263	2025-10-30 15:17:39.345	2025-10-30 15:20:17.487	f	t	\N	WORD_SEARCH
665	45	267	2025-10-30 16:17:25.006	\N	f	f	\N	WORD_SEARCH
698	45	298	2025-11-01 09:39:12.263	2025-11-01 09:40:42.691	f	t	540	WORD_SEARCH
755	66	331	2025-11-07 06:29:33.801	2025-11-07 06:32:21.11	t	t	\N	CROSSWORD_SEARCH
681	57	281	2025-10-31 10:59:08.268	2025-10-31 11:00:52.355	f	t	\N	WORD_SEARCH
685	45	285	2025-10-31 11:10:21.208	2025-10-31 11:12:04.572	f	t	\N	WORD_SEARCH
689	59	289	2025-10-31 14:22:08.56	2025-10-31 14:26:51.382	f	t	540	WORD_SEARCH
710	10	293	2025-11-04 11:19:46.557	2025-11-04 11:21:41.517	t	t	420	CROSSWORD_SEARCH
719	66	306	2025-11-07 01:14:21.55	2025-11-07 01:15:37.662	f	t	300	WORD_SEARCH
759	66	327	2025-11-07 07:03:56.123	2025-11-07 07:06:57.541	t	t	\N	WORD_SEARCH
723	66	308	2025-11-07 01:52:01.431	2025-11-07 01:54:01.768	t	t	\N	WORD_SEARCH
729	66	311	2025-11-07 02:33:01.194	2025-11-07 02:35:12.027	f	t	\N	CROSSWORD_SEARCH
763	66	338	2025-11-07 07:33:46.833	\N	f	f	\N	WORD_SEARCH
737	66	317	2025-11-07 03:38:38.898	2025-11-07 03:41:04.236	f	t	\N	WORD_SEARCH
741	66	321	2025-11-07 04:16:24.851	2025-11-07 04:18:39.552	f	t	\N	WORD_SEARCH
746	66	324	2025-11-07 04:45:54.736	2025-11-07 04:51:20.344	t	t	\N	CROSSWORD_SEARCH
750	66	326	2025-11-07 05:40:07.615	2025-11-07 05:41:30.83	f	t	\N	WORD_SEARCH
767	66	342	2025-11-07 07:50:26.233	2025-11-07 07:53:59.69	t	t	\N	CROSSWORD_SEARCH
780	66	315	2025-11-21 06:45:47.67	2025-11-21 06:46:32.626	f	t	\N	CROSSWORD_SEARCH
594	43	203	2025-10-20 10:15:00.068	2025-10-20 10:16:25.087	t	t	\N	WORD_SEARCH
606	43	202	2025-10-20 11:38:45.152	2025-10-20 11:39:24.589	f	t	300	WORD_SEARCH
612	10	226	2025-10-20 19:29:34.013	2025-10-20 19:31:34.848	f	t	\N	WORD_SEARCH
615	1	81	2025-10-27 13:18:49.311	2025-10-27 13:19:53.916	f	t	60	WORD_SEARCH
621	45	230	2025-10-28 15:05:50.076	2025-10-28 15:08:02.526	f	t	300	WORD_SEARCH
\.


--
-- Data for Name: GameTemplate; Type: TABLE DATA; Schema: public; Owner: letterland_admin
--

COPY public."GameTemplate" (id, "gameTopic", difficulty, "isPublic", "imageUrl", "ownerId", "gameCode") FROM stdin;
253	Horror Franchise	C2	t	image_644_horror_franchise	45	PLM2HJ
286	Animalia Terms	C2	t	image_686_animalia_terms	45	RHJF3Y
95	Harry Potter	A2	t	image_222_harry_potter	10	FEXCYT
96	Cute Cats	A2	t	image_237_cute_cats	1	M8VR3K
83	Cinderella	A1	t	image_137_cinderella	10	H2K9YD
79	Rick and Morty	B1	t	image_125_rick_and_morty	10	E6U9KC
88	Computers	A2	t	image_154_computers	10	R8D6QM
87	Animal	A2	t	image_152_animal	10	W5C8TR
75	Government	C2	t	image_119_government	10	N9L7FV
82	Rapunzel	A1	t	image_136_rapunzel	10	V4M7HT
76	Computer Science	B2	t	image_120_computer_science	10	G3X2JP
80	Crayon Shin-chan	B1	t	image_126_crayon_shin-chan	10	Y1B4SZ
91	Mr. Bean	B2	t	image_201_mr._bean	10	M6X9TR
77	Cars	B1	t	image_121_cars	10	K3T8YU
85	Disney Frozen	A1	t	image_147_disney_frozen	10	H8W2QD
81	Snow White	C2	t	image_128_snow_white	10	R5J4LN
94	Restricted Content	A2	t	image_221_restricted_content	10	ZP7V3K
256	Car Features	B2	t	image_654_car_features	46	ZV7W95
257	Flower Facts	B1	t	image_655_flower_facts	46	2VF2RK
223	Online Safety	A2	t	image_608_online_safety	10	UXGY4P
260	French Revolution	A2	t	image_658_french_revolution	47	NALE4A
263	Car Evolution	B1	t	image_661_car_evolution	47	Q8ZG6K
266	Automotive Arc	C2	t	image_664_automotive_arc	45	RPMKZ8
269	Car Evolution	C2	t	image_667_car_evolution	45	MS2A6G
289	Pennywise	B1	t	image_689_pennywise	59	RJTKA7
292	Walking Dead	B1	t	image_692_walking_dead	60	L8GHUM
272	Elvis: Rock Icon	C2	t	image_670_elvis:_rock_icon	45	JCU9AP
295	Forrest Gump	C2	t	image_695_forrest_gump	45	HJEU7N
298	Pharaonic Horror	C2	t	image_698_pharaonic_horror	45	9E9MJH
278	Art of Sushi	B2	t	image_676_art_of_sushi	45	PSJVLK
281	Animals	A1	t	image_681_animals	57	U5TSEG
285	Animalia	C1	t	image_685_animalia	45	A2KC4M
301	DevOps Basics	B1	t	image_701_devops_basics	61	SYZXQF
304	Popmart Fun	A2	t	image_709_popmart_fun	10	QM95Z4
307	Food	B1	t	image_721_food	66	LLGNMP
310	Animals	A1	t	image_726_animals	66	5HPE73
313	Animal Kingdom	B2	t	image_731_animal_kingdom	66	YPCZ34
316	Anime Culture	B2	t	image_736_anime_culture	66	SQSUKP
319	Bakery Fun	A2	f	image_739_bakery_fun	66	\N
322	Music	A2	t	image_744_music	66	SKGX6G
325	Big Data Insights	B2	t	image_747_big_data_insights	66	U9K23D
328	Heroes	A2	t	image_752_heroes	66	MTZVJA
331	AI Systems	B2	t	image_755_ai_systems	66	92WREN
334	School Subjects	A2	t	image_758_school_subjects	66	MPH2CJ
337	Robotics	B1	f	image_762_robotics	66	\N
340	Fruit	A2	t	image_765_fruit	66	6GQWEF
343	Anime Stories	B1	t	image_768_anime_stories	66	BXQPZZ
346	Floral Words	B1	t	image_771_floral_words	66	V27GPD
349	Royal School	A2	t	image_774_royal_school	66	CH2WEG
125	Scooby-Doo!	A2	t	image_395_scooby-doo!	10	C8979E
126	Scooby-Doo Franchise	A2	t	image_397_scooby-doo_franchise	10	VPPFYM
127	Freddy Krueger	A2	t	image_399_freddy_krueger	10	HHB5QZ
254	The Scream	C1	t	image_647_the_scream	45	TD2JTF
200	Healthy Lifestyle Choices	B1	t	image_490_healthy_lifestyle_choices	10	KKKV25
201	Good Health Habits	A2	t	image_491_good_health_habits	10	WCCHCV
202	Be Well	A1	t	image_492_be_well	10	3RAXDF
199	The Universal Journey: Our Daily Commute	B1	t	image_489_the_universal_journey:_our_daily_commute	10	BZUT6Y
224	Farm Home	A2	t	image_610_farm_home	10	23PAX2
226	School Event	A2	t	image_612_school_event	10	AK7XPM
228	BUILDING BLOCKS	A2	t	image_616_building_blocks	2	LZS5BV
230	Small Steps	A1	t	image_621_small_steps	45	273YAF
258	Floral World	B1	t	image_656_floral_world	47	VBG3DC
261	Cars	A1	t	image_659_cars	47	K759MX
264	Car Evolution	B2	t	image_662_car_evolution	45	NTALMP
267	Car Evolution	C1	t	image_665_car_evolution	45	3SPEQB
270	Green Day: Punk	B2	t	image_668_green_day:_punk	45	KXPRCA
250	Terrifier Films	B1	t	image_641_terrifier_films	45	U7J5MR
252	Girl and Pearl	A2	t	image_643_girl_and_pearl	45	AZ88E9
273	Ancient China	B1	t	image_671_ancient_china	45	KDZWAF
276	Flame-Grilled Icon	C2	t	image_674_flame-grilled_icon	45	ZS3BWN
282	Animal World	A2	t	image_682_animal_world	57	JBA574
283	Animal Kingdom	B1	t	image_683_animal_kingdom	57	33BL3B
287	Car Evolution	C1	t	image_687_car_evolution	45	HTV2FC
290	The Shining	B1	t	image_690_the_shining	60	335524
293	Camp Secrets	A2	t	image_693_camp_secrets	60	DWQ8XC
296	Green Mile Saga	C1	t	image_696_green_mile_saga	45	CYF994
299	Networking Core	C1	t	image_699_networking_core	45	WMJUC8
302	Data Structures	B1	t	image_704_data_structures	64	FFSUNF
305	DP Solutions	B1	t	image_711_dp_solutions	45	PUVP5Q
308	My Computer Fun	A1	t	image_723_my_computer_fun	66	7V7N6Q
311	Food Basics	B1	t	image_729_food_basics	66	E4ZH35
314	Magic World	A2	t	image_732_magic_world	66	FB9S4Y
317	Bangkok City	B2	f	image_737_bangkok_city	66	\N
320	My Computer	A2	t	image_740_my_computer	66	SQPUFZ
323	Mixing Fun	A2	t	image_745_mixing_fun	66	XL3QQT
326	Artistic Realms	B2	t	image_750_artistic_realms	66	3CDU3G
329	Science Concepts	C2	t	image_753_science_concepts	1	WHT3EF
332	Marine Life	B2	t	image_756_marine_life	66	5P6L6C
335	Multimodal AI	B2	t	image_760_multimodal_ai	66	GZQ26A
338	Fruit Vocabulary	B2	t	\N	66	ZMKCYN
341	Famous Man	A2	t	image_766_famous_man	66	9MLU6Z
344	Sport	B1	t	image_769_sport	66	FG45DE
347	University	B2	f	image_772_university	66	\N
203	Achieving and Maintaining Good Health	B2	t	image_494_achieving_and_maintaining_good_health	1	CJ6ZGF
204	Strategies for Optimal Well-being and Health Maintenance	C1	t	image_495_strategies_for_optimal_well-being_and_health_maintenance	1	UW4PAA
206	Holistic Health and Preventative Lifestyles	C2	t	image_497_holistic_health_and_preventative_lifestyles	1	RYKGJB
207	Comprehensive Wellness Strategies	C2	t	image_501_comprehensive_wellness_strategies	1	T7N2GX
229	Thai Elephants	A2	t	image_620_thai_elephants	2	QP6Z3W
208	Strategies for Healthy Living	B2	t	image_502_strategies_for_healthy_living	1	Z4QH9M
255	Starry Night Art	B1	t	image_652_starry_night_art	45	MHWMX3
259	Bee World	B1	t	image_657_bee_world	47	WU4W7V
262	Car Journey	A2	t	image_660_car_journey	47	AMEXEX
265	Auto Evolution	C1	t	image_663_auto_evolution	45	WB3966
268	Vehicle Evolution	C1	t	image_666_vehicle_evolution	45	ASCKZ4
274	Camera Evolution	C1	t	image_672_camera_evolution	45	XXWBRC
277	Thai Food Flavors	B1	t	image_675_thai_food_flavors	45	27NQBB
288	Car History	A2	t	image_688_car_history	47	TPUEAU
284	Animal Kingdom	B2	t	image_684_animal_kingdom	45	5V4585
291	Scary Movie Fun	A2	t	image_691_scary_movie_fun	60	BZHW6B
297	Ghostface Horror	B1	t	image_697_ghostface_horror	45	XRG443
300	Digital Frontier	C2	t	image_700_digital_frontier	45	NK433L
303	Art of War	B1	t	image_708_art_of_war	64	2Q333J
306	Big Animal	A1	t	image_719_big_animal	66	PU54SM
309	West Journey	A2	t	image_725_west_journey	10	HCRWDN
312	MCU World	B2	t	image_730_mcu_world	66	JQWVC9
315	Cars	B2	t	image_734_cars	66	EP7ZRD
318	Food	B2	t	image_738_food	66	Y6F394
321	Animal World	A2	f	image_741_animal_world	66	\N
324	Arctic mammals	B1	t	image_746_arctic_mammals	66	WKASXG
327	SCHOOL LIFE	B2	t	image_751_school_life	66	VGMD3D
330	Everyday Food	A2	t	image_754_everyday_food	1	9ZSR7R
333	My School	A1	t	image_757_my_school	66	DLE9NJ
336	Yummy Food	A2	t	image_761_yummy_food	66	N26PFB
339	Fruit Facts	B2	t	image_764_fruit_facts	66	UMVHN4
342	Genshin Impact	B2	f	image_767_genshin_impact	66	\N
345	Food Focus	B1	t	image_770_food_focus	66	HNPBVQ
348	Flower Facts	B1	t	image_773_flower_facts	66	QLRQDY
225	CARS	A2	t	image_611_cars	10	QVW3HU
227	Oktoberfest Fun	A2	t	image_614_oktoberfest_fun	2	XFJD4M
251	Mona Lisa Story	B1	t	image_642_mona_lisa_story	45	XL5GVZ
\.


--
-- Data for Name: GameTemplateQuestion; Type: TABLE DATA; Schema: public; Owner: letterland_admin
--

COPY public."GameTemplateQuestion" ("gameTemplateId", "questionId", id) FROM stdin;
253	1719	1880
258	1752	1913
259	1758	1916
270	1816	1978
276	1854	2014
284	1896	2060
285	1907	2065
291	1941	2102
299	1982	2146
305	2023	2180
305	2018	2181
311	2056	2218
317	2089	2251
323	2127	2285
330	2164	2327
340	2220	2377
340	2221	2382
341	2223	2385
347	2259	2421
347	2260	2422
125	1036	1194
126	1041	1197
126	1037	1201
127	1044	1205
253	1722	1879
259	1754	1918
260	1763	1920
270	1821	1979
276	1851	2015
286	1909	2068
286	1911	2073
292	1946	2104
292	1949	2109
300	1990	2148
305	2022	2182
312	2060	2220
317	2088	2250
317	2090	2249
323	2125	2286
330	2169	2328
340	2218	2378
341	2227	2386
347	2262	2420
125	1032	1193
126	1038	1198
126	1042	1202
127	1048	1206
253	1723	1881
253	1721	1884
260	1764	1922
270	1817	1980
277	1860	2017
286	1908	2069
292	1945	2105
300	1988	2149
305	2021	2179
305	2020	2183
312	2064	2221
318	2097	2252
318	2093	2257
324	2129	2289
324	2128	2288
324	2130	2293
331	2170	2330
340	2222	2379
341	2226	2384
341	2224	2388
348	2267	2423
125	1035	1195
126	1039	1199
127	1047	1203
127	1046	1207
79	753	378
88	829	444
82	788	413
80	767	392
75	720	345
79	751	376
75	715	340
88	831	446
76	727	352
76	722	347
91	834	449
85	813	428
75	718	343
96	874	489
75	713	338
83	795	420
81	775	400
80	762	387
83	799	424
253	1724	1882
83	790	415
80	764	389
94	867	482
81	777	402
260	1761	1921
277	1862	2018
286	1913	2070
82	786	411
79	759	384
95	869	484
292	1948	2106
300	1989	2150
300	1992	2153
81	779	404
87	822	437
306	2027	2184
312	2061	2222
318	2094	2253
324	2132	2290
331	2173	2331
331	2172	2332
340	2219	2380
88	825	440
87	823	438
341	2225	2387
348	2266	2424
348	2264	2428
77	736	361
85	811	426
80	766	391
82	784	409
82	782	407
77	734	359
77	733	358
91	840	455
81	778	403
83	791	416
81	773	398
77	738	363
95	872	487
76	724	349
88	828	443
77	735	360
91	839	454
81	774	399
83	797	422
94	864	479
88	827	442
81	772	397
81	771	396
83	798	423
95	871	486
96	875	490
76	723	348
91	838	453
94	862	477
76	726	351
95	873	488
77	737	362
75	712	337
91	837	452
94	861	476
76	725	350
253	1720	1883
260	1762	1923
96	876	491
277	1857	2019
286	1910	2071
292	1944	2107
300	1993	2151
306	2026	2185
312	2063	2223
318	2096	2254
324	2133	2291
88	833	448
75	719	344
94	868	483
331	2171	2333
340	2217	2381
79	754	379
81	770	395
341	2228	2383
348	2268	2425
88	832	447
75	716	341
91	835	450
75	714	339
82	787	412
94	866	481
88	830	445
85	814	429
76	728	353
82	789	414
80	763	388
83	796	421
85	812	427
75	717	342
94	863	478
79	750	375
79	752	377
95	870	485
82	780	405
77	730	355
82	783	408
82	781	406
88	826	441
83	793	418
75	721	346
87	824	439
80	765	390
96	877	492
87	821	436
81	776	401
80	768	393
77	731	356
87	820	435
77	732	357
87	819	434
83	792	417
77	739	364
91	841	456
91	842	457
82	785	410
254	1729	1886
254	1730	1885
254	1726	1890
260	1760	1924
260	1765	1925
79	756	381
277	1858	2020
83	794	419
286	1912	2072
292	1947	2108
300	1991	2152
306	2025	2186
312	2062	2224
79	755	380
318	2092	2255
80	761	386
324	2131	2292
91	836	451
331	2174	2334
342	2234	2389
342	2231	2394
85	810	425
348	2265	2426
79	757	382
94	865	480
76	729	354
80	760	385
85	815	430
80	769	394
79	758	383
125	1033	1192
125	1034	1196
126	1040	1200
127	1045	1204
127	1043	1208
254	1728	1888
261	1766	1926
261	1768	1928
261	1770	1931
277	1861	2021
277	1859	2022
287	1916	2074
287	1919	2075
293	1955	2110
301	1994	2154
301	1995	2159
306	2024	2187
306	2029	2189
313	2067	2225
313	2070	2230
318	2095	2256
325	2139	2294
332	2175	2335
342	2229	2390
348	2263	2427
254	1725	1887
261	1771	1927
287	1915	2076
287	1914	2077
287	1917	2079
201	1484	1646
207	1516	1675
223	1544	1702
223	1542	1701
223	1539	1704
229	1576	1735
293	1953	2112
293	1952	2115
301	1998	2155
306	2028	2188
313	2069	2226
319	2100	2258
319	2102	2260
325	2134	2295
325	2137	2296
325	2138	2299
332	2176	2336
342	2230	2392
342	2233	2391
349	2274	2430
254	1727	1889
261	1767	1929
201	1485	1647
207	1513	1676
223	1541	1703
229	1575	1737
229	1577	1740
272	1828	1991
272	1833	1988
272	1830	1993
278	1864	2024
287	1918	2078
293	1951	2111
293	1954	2113
301	1997	2156
307	2034	2190
307	2031	2195
313	2068	2227
319	2101	2259
319	2099	2263
325	2136	2297
332	2177	2337
342	2232	2393
349	2270	2429
255	1733	1891
255	1736	1896
202	1491	1653
207	1518	1677
224	1546	1706
229	1579	1739
261	1769	1930
272	1832	1990
272	1831	1989
278	1863	2025
250	1703	1862
288	1924	2081
293	1950	2114
301	1996	2157
307	2030	2192
307	2032	2191
313	2065	2228
319	2098	2261
325	2135	2298
333	2183	2338
333	2180	2343
334	2189	2348
343	2237	2396
343	2236	2395
349	2269	2431
255	1732	1892
262	1774	1932
262	1776	1937
263	1778	1940
203	1495	1654
208	1523	1679
208	1521	1680
224	1548	1707
229	1580	1738
263	1781	1943
272	1829	1992
278	1865	2026
288	1920	2080
288	1921	2085
250	1701	1861
251	1708	1868
301	1999	2158
307	2035	2194
313	2066	2229
319	2103	2262
326	2144	2301
333	2181	2339
334	2187	2347
343	2235	2397
349	2273	2432
349	2272	2434
255	1734	1893
262	1777	1933
203	1497	1655
208	1520	1681
208	1524	1684
224	1549	1705
263	1783	1941
273	1837	1994
288	1922	2082
250	1702	1864
302	2001	2160
307	2033	2193
314	2076	2231
314	2073	2236
320	2106	2264
320	2105	2269
326	2143	2300
333	2178	2340
334	2184	2345
343	2239	2398
349	2271	2433
255	1735	1894
262	1775	1935
203	1496	1657
203	1494	1656
204	1501	1658
208	1522	1682
224	1547	1708
224	1550	1710
262	1773	1934
263	1782	1938
263	1779	1939
273	1839	1996
250	1705	1863
251	1709	1867
288	1923	2083
295	1961	2119
302	2005	2162
308	2041	2196
308	2036	2201
314	2075	2232
320	2109	2265
326	2142	2303
326	2140	2302
326	2141	2305
333	2179	2341
334	2186	2346
343	2238	2399
343	2240	2400
255	1731	1895
204	1500	1659
208	1519	1683
224	1545	1709
262	1772	1936
263	1780	1942
273	1835	1995
273	1838	1997
273	1836	1999
250	1704	1865
288	1925	2084
295	1960	2120
302	2004	2163
308	2038	2197
314	2072	2233
320	2104	2267
326	2145	2304
333	2182	2342
334	2188	2344
334	2185	2349
344	2245	2401
199	1473	1632
204	1498	1660
256	1739	1899
256	1740	1902
225	1552	1711
225	1556	1716
257	1746	1903
230	1582	1746
257	1745	1908
264	1786	1944
273	1834	1998
250	1706	1866
251	1710	1869
289	1926	2086
295	1959	2121
302	2003	2164
302	2002	2165
308	2037	2199
314	2071	2234
320	2108	2266
327	2146	2306
335	2190	2350
344	2241	2403
344	2242	2406
199	1470	1633
204	1502	1661
256	1742	1900
264	1784	1945
225	1554	1713
225	1555	1712
226	1560	1717
226	1559	1719
230	1581	1745
274	1840	2000
289	1931	2087
251	1707	1870
295	1962	2122
302	2000	2161
308	2039	2198
314	2074	2235
320	2107	2268
327	2148	2307
335	2191	2351
344	2243	2402
199	1475	1635
199	1474	1630
204	1499	1662
256	1738	1897
225	1553	1714
264	1787	1946
274	1842	2001
281	1878	2038
289	1929	2088
289	1930	2089
289	1927	2091
251	1711	1872
251	1712	1871
295	1963	2123
303	2006	2166
308	2040	2200
315	2082	2237
321	2110	2270
327	2149	2308
327	2151	2311
335	2194	2353
335	2193	2352
344	2244	2404
199	1471	1634
256	1741	1901
225	1551	1715
226	1558	1718
226	1557	1722
264	1788	1947
264	1789	1949
274	1841	2002
281	1879	2039
281	1880	2043
289	1928	2090
252	1716	1873
296	1968	2124
303	2011	2167
309	2045	2202
309	2042	2207
310	2051	2208
310	2050	2213
315	2078	2238
321	2112	2271
321	2111	2275
327	2147	2309
335	2192	2354
344	2246	2405
199	1472	1631
256	1737	1898
226	1562	1720
264	1785	1948
274	1844	2003
281	1882	2040
290	1934	2092
296	1969	2125
303	2009	2169
309	2046	2203
315	2080	2239
315	2081	2242
321	2113	2272
252	1717	1874
327	2150	2310
336	2198	2356
336	2195	2355
336	2200	2360
337	2201	2361
337	2204	2365
337	2203	2366
345	2252	2407
345	2248	2408
345	2249	2412
200	1478	1636
201	1487	1643
257	1747	1904
226	1561	1721
265	1793	1950
265	1791	1951
266	1796	1954
266	1797	1957
274	1843	2004
281	1883	2041
252	1718	1875
290	1937	2093
296	1966	2126
296	1967	2129
303	2010	2168
303	2008	2171
309	2047	2204
315	2077	2240
321	2114	2273
328	2157	2312
329	2158	2318
329	2162	2323
336	2199	2357
337	2202	2364
345	2247	2410
345	2251	2409
200	1479	1637
202	1489	1650
257	1744	1906
227	1565	1723
227	1567	1724
227	1563	1726
227	1566	1725
227	1568	1727
227	1564	1728
265	1792	1953
265	1790	1952
266	1795	1955
266	1794	1956
281	1881	2042
252	1713	1876
290	1932	2095
290	1933	2097
296	1964	2127
303	2007	2170
309	2044	2205
315	2079	2241
321	2115	2274
328	2154	2313
328	2155	2317
329	2159	2322
336	2196	2358
337	2206	2362
345	2250	2411
200	1481	1639
202	1493	1649
257	1743	1905
228	1570	1729
267	1798	1958
268	1805	1965
269	1813	1970
269	1815	1975
282	1884	2045
282	1887	2044
252	1714	1877
282	1886	2049
283	1893	2050
283	1891	2053
290	1936	2094
296	1965	2128
304	2013	2172
304	2014	2177
309	2043	2206
310	2053	2209
316	2085	2243
322	2120	2277
322	2116	2276
328	2156	2314
329	2160	2320
336	2197	2359
337	2205	2363
346	2256	2413
200	1480	1638
202	1490	1651
257	1748	1907
267	1799	1960
228	1569	1730
228	1572	1734
267	1800	1959
267	1803	1963
268	1807	1964
268	1809	1967
268	1808	1969
269	1814	1971
252	1715	1878
269	1810	1972
282	1885	2046
283	1894	2054
290	1935	2096
297	1974	2132
297	1972	2134
297	1970	2133
297	1971	2131
297	1973	2130
297	1975	2135
304	2016	2176
310	2052	2210
316	2086	2244
322	2119	2279
322	2118	2278
322	2121	2281
328	2152	2315
329	2161	2319
338	2207	2368
339	2212	2374
346	2253	2414
346	2254	2418
200	1477	1640
201	1486	1642
202	1488	1652
206	1512	1670
206	1509	1669
258	1753	1910
228	1574	1731
259	1756	1915
267	1801	1961
268	1806	1968
269	1812	1973
282	1889	2047
283	1890	2051
283	1892	2055
291	1938	2098
291	1940	2103
298	1976	2136
298	1981	2137
298	1978	2141
299	1984	2142
299	1985	2145
304	2017	2174
310	2048	2211
316	2083	2245
322	2117	2280
328	2153	2316
329	2163	2321
338	2211	2369
339	2213	2376
346	2255	2415
200	1476	1641
206	1510	1671
206	1511	1672
258	1749	1909
228	1573	1732
259	1759	1914
259	1755	1919
267	1802	1962
268	1804	1966
269	1811	1974
276	1852	2011
282	1888	2048
283	1895	2052
291	1939	2099
298	1979	2139
298	1977	2138
299	1987	2143
299	1986	2147
304	2012	2173
310	2049	2212
316	2084	2246
323	2122	2282
330	2165	2324
338	2208	2367
339	2216	2372
346	2257	2416
201	1483	1644
202	1492	1648
207	1517	1673
207	1515	1678
223	1543	1699
228	1571	1733
258	1751	1912
270	1820	1977
270	1818	1981
276	1856	2012
284	1897	2057
284	1898	2056
284	1899	2061
285	1906	2063
285	1903	2064
291	1942	2101
298	1980	2140
304	2015	2175
311	2059	2214
311	2057	2215
311	2055	2219
316	2087	2247
323	2124	2283
330	2168	2325
330	2167	2329
338	2209	2370
339	2215	2375
346	2258	2417
201	1482	1645
207	1514	1674
223	1540	1700
229	1578	1736
258	1750	1911
259	1757	1917
270	1819	1976
276	1855	2013
276	1853	2016
284	1901	2058
284	1900	2059
285	1905	2062
285	1902	2066
285	1904	2067
291	1943	2100
299	1983	2144
305	2019	2178
311	2054	2216
311	2058	2217
317	2091	2248
323	2123	2284
323	2126	2287
330	2166	2326
338	2210	2371
339	2214	2373
347	2261	2419
\.


--
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: letterland_admin
--

COPY public."Question" (id, name, answer, hint, "audioUrl") FROM stdin;
1724	Describing the initial, undeveloped state of certain narrative elements or characters.	INCHOATE	Rudimentary, nascent.	https://drive.google.com/file/d/1nXaiwoqHQyzDFWmTgk9tlNSTODWPHlih/view?usp=drivesdk
1719	A distinct stylistic Italian cinematic genre influencing the film's graphic violence.	GIALLO	Italian horror subgenre.	https://drive.google.com/file/d/1kscDWfkYDblH-an7lBNk5EJGxCCs_QIC/view?usp=drivesdk
1766	You ride in this thing.	CAR	It has wheels.	https://drive.google.com/file/d/1x7Jky7IegCS1_6cGGVKZa5rWgtlfc0nq/view?usp=drivesdk
1810	An impetus, encouraging advancement or development within vehicular innovation.	SPUR	Drive or stimulus.	https://drive.google.com/file/d/1yb6_SqrVzSgUhQdmR3ebK5Xc2BAL23TG/view?usp=drivesdk
1914	Priced reasonably, making goods accessible to a wider populace.	AFFORDABLE	Economically viable.	https://drive.google.com/file/d/17NsxDj-qZhuTn6ROpXZL7jpSGhbfbq4l/view?usp=drivesdk
1888	Small animal, like a bee.	INSECT	Bugs are this type.	https://drive.google.com/file/d/1ck1enobTK-MUPQfvArfSc7qAKwvrADoY/view?usp=drivesdk
712	The body that governs a country.	GOVERNMENT	Rules a nation	https://drive.google.com/file/d/1HN9dEsLWG810DP0ztu-pnW_6KbOVK8zg/view?usp=drivesdk
713	A system of political organization.	REGIME	Political system	https://drive.google.com/file/d/1SZpMSp92SKbXsPehSyCekezEQDSH1MZb/view?usp=drivesdk
721	The people's right to vote.	SUFFRAGE	Right to vote	https://drive.google.com/file/d/1AFVb_ncdavjHMLt35626vcU_lxWjPLGF/view?usp=drivesdk
714	The highest official in a country.	PRESIDENT	Leader of a nation	https://drive.google.com/file/d/1t8z6_i_pLMnblAI5YGwir791FcqoQLz1/view?usp=drivesdk
717	Related to the running of a country.	ideological	Concerning government	https://drive.google.com/file/d/1diY8qnd7C0BSP2sjG_PskYyArLQhFhXU/view?usp=drivesdk
715	A meeting of lawmakers.	deliberation	Legislative gathering	https://drive.google.com/file/d/1z76Urkx4p_ctLXfgulyCCwSdoDK4fBh4/view?usp=drivesdk
719	Having power or authority.	ascendant	In control	https://drive.google.com/file/d/19wbyT52iCuOEkB3qlRKAaMqZZc5W6A93/view?usp=drivesdk
720	A person's vote in an election.	plebiscite	Election choice	https://drive.google.com/file/d/156sylkFuKKHmAeO7wwtB8ZmPiMyClBNT/view?usp=drivesdk
718	People who make laws.	policymakers	Lawmakers	https://drive.google.com/file/d/1JU3EcpELOvWkq6sfy4J7Upfe0Hhue6AD/view?usp=drivesdk
716	To control or manage.	direct	To rule or administer	https://drive.google.com/file/d/1mTdYdH-to4sUlCMJQcQGFHPQAsxDVLJa/view?usp=drivesdk
791	Opposite of happy.	sad	Feeling unhappy	https://drive.google.com/file/d/14z4uAaOWvln3VgMCURHXsnkj_HKPGpb5/view?usp=drivesdk
793	A type of dance.	ball	A formal party with dancing	https://drive.google.com/file/d/1-TwLpFWeW47aJLYCBpLY3cnQp0T_dLQ_/view?usp=drivesdk
796	A type of plant that can help Cinderella.	flower	A plant with petals	https://drive.google.com/file/d/16iaQLZLfw98I-vCVY5P5M_XrZWa7B-mt/view?usp=drivesdk
794	To go away quickly.	run	To run away	https://drive.google.com/file/d/1ApLER-HJUm9qx3EKCNFEBtxh_2t07y3A/view?usp=drivesdk
790	A girl who loses her slipper.	cinderella	A fairy tale princess	https://drive.google.com/file/d/1xv-HuJwem2noS4IXeaGBhby5uj89Q6aJ/view?usp=drivesdk
797	Relating to a step family member.	step	Part of a family through marriage	https://drive.google.com/file/d/1zGu9ZrOytkZFcxyXDPgWn840WQw5Nvt-/view?usp=drivesdk
798	A covering for the foot.	slipper	Footwear	https://drive.google.com/file/d/1hObdYmW447RTHiuT11e5k7Vd5WRonMNG/view?usp=drivesdk
795	A type of vehicle.	coach	A large horse-drawn carriage	https://drive.google.com/file/d/1gpnjjs6bUF3FGdEqwfCW8d3_OTh6H5UK/view?usp=drivesdk
792	A magical being.	fairy	A small, magical creature	https://drive.google.com/file/d/16H3zF4gjBDCRNe7tRZZ1W6ryBeJhUKFf/view?usp=drivesdk
799	Opposite of ugly.	beautiful	Very pretty	https://drive.google.com/file/d/1F97T5S0ahYYJrJcOOvOgdCYFf4FKh4qx/view?usp=drivesdk
1890	The highest rank in classifying living things, like Animalia.	KINGDOM	Large biological group.	https://drive.google.com/file/d/1bDNUkREM_ayTnof91iH-eRXZC3DUS4YU/view?usp=drivesdk
1895	The natural home or environment where an animal usually lives.	HABITAT	Where an animal lives.	https://drive.google.com/file/d/1RnyrUiV3vaKXMlNA2fg12chZ9IbYJSNT/view?usp=drivesdk
1954	A movie you watch.	FILM	You see it at the cinema.	https://drive.google.com/file/d/1HSH8eLxbUprrS7dhf04nj-gJGpxmNr8y/view?usp=drivesdk
1997	The activity of writing computer instructions.	CODING	Computer language.	https://drive.google.com/file/d/14PlT7KAMmdAKxR5x_MzNdO4zomYY2Vmn/view?usp=drivesdk
2040	It is a square shape.	BOX	A computer can be like this.	https://drive.google.com/file/d/1eYO3HFdur6qSc_Df0g9A82GBFkTvAs9J/view?usp=drivesdk
2083	The way a story is presented, including its plot, events, and style.	NARRATIVE	The storytelling	https://drive.google.com/file/d/1Yb8dGk8AW3kZjNY7L8dBT8kBmaamBpWa/view?usp=drivesdk
2125	Red, blue, or yellow look.	COLOR	Paint has this.	https://drive.google.com/file/d/1fMTKRi_F4rRenYRCimek082himatFwbR/view?usp=drivesdk
2170	To create a model that imitates the behavior of a real-world system.	SIMULATE	Imitate reality	https://drive.google.com/file/d/1LRzOFFz5Jwr5kF-NPopQZdyiQNn5K_fh/view?usp=drivesdk
2229	To adjust character builds or team setups for maximum efficiency.	OPTIMIZE	Improve performance	https://drive.google.com/file/d/1NCFxYxNcBcP3-UxC4FebZ8u4TfcNTyv2/view?usp=drivesdk
2233	Special character abilities that can be leveled up to improve effectiveness.	TALENTS	Skills	https://drive.google.com/file/d/1-1fAouz17aJbK4R8u85O_26G1Pu9bJoW/view?usp=drivesdk
2274	A toy machine person.	ROBOT	Can move and talk.	https://drive.google.com/file/d/1KRkm3lkTcCt-6B_xaFqvMoxqLa7LY4Hh/view?usp=drivesdk
2269	Get new ideas in school.	LEARN	What students do.	https://drive.google.com/file/d/1ATkL4BVd-e-kprE2VyzkoAr6PG5eu8wN/view?usp=drivesdk
1038	Find answers for mysteries.	fix	Clear up	https://drive.google.com/file/d/13HxRidquK00WFBCy0yWz1mlGv4pHXMcK/view?usp=drivesdk
1720	The detailed lineage or origin story, soon to be unveiled for a central figure.	PEDIGREE	Character's ancestry.	https://drive.google.com/file/d/1cy8mLYXqiLbfMdh152vKA9XFRRcIi_59/view?usp=drivesdk
1767	A truck is very ___.	BIG	Not small.	https://drive.google.com/file/d/1UKQ8DY0xv4W4X-7Zl6L4ht9SwJ0r5Y1C/view?usp=drivesdk
1811	Having become pervasively present, signifying widespread automotive adoption across societal strata.	UBIQUITOUS	Found everywhere.	https://drive.google.com/file/d/19yQI3Nwn_neVwdkOjYRwggHd2QEJWUJB/view?usp=drivesdk
1915	Enacted laws by a governing body, significantly influencing vehicle development.	LEGISLATION	Regulatory framework.	https://drive.google.com/file/d/1x3O6DAKNDobY013ImEcLKEPmuW9jo0Zy/view?usp=drivesdk
1889	Animals get bigger this way.	GROW	To become larger.	https://drive.google.com/file/d/1TSSfrefmGOHusmRb4DhhmaCRzR7dRhxn/view?usp=drivesdk
1891	The preserved remains of plants or animals from very long ago.	FOSSIL	Old stone record.	https://drive.google.com/file/d/1MZc5DBv0SXAu9aO-CFZBI1WqEVs3WmXt/view?usp=drivesdk
727	A network of computers.	SYSTEM	Interconnected components	https://drive.google.com/file/d/17pEHnMVKeRkSPYHgzH2Ri4I8veOkNAMS/view?usp=drivesdk
724	A program's set of instructions.	encrypt	Written in a programming language	https://drive.google.com/file/d/1v9AaPRZ_D5eBpU4bmg3qzVXzadCc08Fz/view?usp=drivesdk
725	Information stored digitally.	DATA	Facts and figures	https://drive.google.com/file/d/1cOacqMSynF06MbmRNcYw4cNA1Gg40yVU/view?usp=drivesdk
722	A machine that processes information.	COMPUTER	Used for work and play	https://drive.google.com/file/d/10CxvN6LPpnhp2Q_m1h8dZMpZ9Oo7lGBS/view?usp=drivesdk
723	The study of computers.	SCIENCE	Systematic knowledge	https://drive.google.com/file/d/1Qjl4ZnA_Jbf-uWYU1Wo7lmQT4Fz-j2jO/view?usp=drivesdk
728	Solve a problem.	cipher	Calculate an answer	https://drive.google.com/file/d/1uJ8sSGWL6_LGyGmJLsTgDd2DqevUY9iT/view?usp=drivesdk
726	To find a fault.	debug	Fix a program error	https://drive.google.com/file/d/1fg_Qe8bojHHjSSN_XoE-pdH0KA9gtaBA/view?usp=drivesdk
729	A visual display.	test	Part of a computer	https://drive.google.com/file/d/15mKi6_i8IfqT4GjFoaux5B-9otB9BFrU/view?usp=drivesdk
1955	Big water with land around it.	LAKE	You can swim or boat here.	https://drive.google.com/file/d/10WdEOzasAvv1CWa2cxS17r9OZIbTVDre/view?usp=drivesdk
1998	Checking if something works as it should.	TESTING	Quality check.	https://drive.google.com/file/d/1B1hzLR1DipgcqblNu4DaHY1tqbw6uuvd/view?usp=drivesdk
1039	Brightly colored vehicle.	lead	Group's car	https://drive.google.com/file/d/1cDE4IENpGBRVidzoF96qbshMlXs6y-yb/view?usp=drivesdk
2041	Use your eyes to look.	SEE	What you do with a screen.	https://drive.google.com/file/d/16CQWwzK_ibh77i99HCbHlJrT5CaZEGRT/view?usp=drivesdk
2084	The artistic process of creating moving images from still drawings.	ANIMATION	What anime technically is	https://drive.google.com/file/d/1x1YG-G0OhqD_C8QNhyj2AoCMRsfAd-cU/view?usp=drivesdk
2126	Different things put together.	MIXED	Not separate.	https://drive.google.com/file/d/1nEGLfhoQal9wmpJtLrcT3lB88_RAjAS0/view?usp=drivesdk
2171	A fundamental structure for a conceptual system or software development.	FRAMEWORK	Basic structure	https://drive.google.com/file/d/1bgq3BK4hdUqhzcaHZTs2ArSF39BB-cXF/view?usp=drivesdk
2230	The overarching storyline and connected events that unfold throughout the game.	NARRATIVE	Storyline	https://drive.google.com/file/d/1Yb8dGk8AW3kZjNY7L8dBT8kBmaamBpWa/view?usp=drivesdk
2270	Help someone learn things.	TEACH	What teachers do.	https://drive.google.com/file/d/17xnRXmhrAIVmHklq2-QPn8-LhUlsbDjw/view?usp=drivesdk
730	A car with four doors, often for families.	saloon	A common family car	https://drive.google.com/file/d/1hDJGU3OmS6CXf4cdSneMz5fwUk8JyL3c/view?usp=drivesdk
731	Vehicles that run on electricity.	evs	Eco-friendly cars	https://drive.google.com/file/d/1LQkR7UxesK26M18TPAzSC-sSskveIh5F/view?usp=drivesdk
732	A large car, good for off-road driving.	4x4	A spacious vehicle	https://drive.google.com/file/d/1RI34eTBjvillfrmxy1IDUnA4zEVXsjAl/view?usp=drivesdk
737	Traffic is a common ______ in cities.	problem	A city challenge	https://drive.google.com/file/d/1vMWoOZMq4qE0_L3AqmtvjHcp0ldsmXuy/view?usp=drivesdk
733	Cars designed for speed and style.	sports	Fast and stylish cars	https://drive.google.com/file/d/1z8TkpQ-QVaIZLnIsxYzX0jv39hhXu7fx/view?usp=drivesdk
738	Cars show a person's ______.	style	Personal expression	https://drive.google.com/file/d/1i2foQEe6NreFceP2XLXehrBiuB3qV7zj/view?usp=drivesdk
735	Made cars affordable for many.	ford	Famous car maker	https://drive.google.com/file/d/1aTcBen96KoUcVs3EPwk7slIoqNGds_X1/view?usp=drivesdk
739	Fossil fuels cause ______.	pollution	Environmental damage	https://drive.google.com/file/d/1P29XqSS-NdqBAi5S5ErKcNT0XCBmBpV6/view?usp=drivesdk
734	The ability to travel easily.	mobility	Freedom to move around	https://drive.google.com/file/d/11_op4Xf6gMyimJqbMRznrGRLq1GfyLmf/view?usp=drivesdk
736	Invented the first gasoline car.	benz	Early car pioneer	https://drive.google.com/file/d/1VAsxdEu2MmwXGf09yE0j1B4H_JwRekxM/view?usp=drivesdk
810	A type of weather found in Arendelle.	snowfall	Cold, white precipitation	https://drive.google.com/file/d/1OxhoAxOZUu4bN0hXbZSKMXqsLXdrRKk5/view?usp=drivesdk
811	Elsa's magical power.	frost	Frozen water	https://drive.google.com/file/d/1dME8Zl8Fsk0mMNPeFicLoExUA-yi4kx6/view?usp=drivesdk
813	A popular Disney film.	cold	Animated movie about sisters	https://drive.google.com/file/d/1wKJVT4i52xQukmnomGM3zFdieUmbqb4_/view?usp=drivesdk
815	Elsa's home kingdom.	arendelle	A fictional kingdom	https://drive.google.com/file/d/1OHpTZ7iXpk75FfB4if_XgvJCY6wp3zj8/view?usp=drivesdk
814	Anna's friend, a snowman.	olaf	Loves summer	https://drive.google.com/file/d/1RH25R2HKwuFLy0Q59OiL_CVa6JvJ9DCA/view?usp=drivesdk
812	Anna's sister.	elsa	The Ice Queen	https://drive.google.com/file/d/1HrVuj1szfryrxUbI5ZNN_p7whVjmJhe1/view?usp=drivesdk
1721	The desired ultimate completion and full realization of the film franchise's narrative.	CONSUMMATION	Final fulfillment.	https://drive.google.com/file/d/1yjxN67CiqZLjAEsb42C94cHF0h18wsZY/view?usp=drivesdk
1768	This car is not old.	NEW	Just made.	https://drive.google.com/file/d/1dLXqN7bkBpNDPnh8fsrGU_8aQ4aQCCvw/view?usp=drivesdk
1813	A distinct, noteworthy period in automotive history or technological evolution.	EPOCH	An era.	https://drive.google.com/file/d/1eQhM95HbTIJ84C4wC-oOfHqn59dINdBd/view?usp=drivesdk
1040	Original broadcast channel.	network	First network	https://drive.google.com/file/d/1QRD_8y4zgimjskFl57YpwU2u1xkTLwoN/view?usp=drivesdk
1851	One who deliberately opposes or rejects prevailing opinions or trends.	CONTRARIAN	Opposing conventional views.	https://drive.google.com/file/d/11hBUJLqxrg4gB-I43kxbbpJzgtSKT6uA/view?usp=drivesdk
1853	An exclusive right or privilege, particularly to make choices.	PREROGATIVE	Special entitlement.	https://drive.google.com/file/d/1rBwJua2JSRHprIMUHKoqBubEBAodXToI/view?usp=drivesdk
1897	Organisms that primarily consume other animals for sustenance.	CARNIVORES	Meat-eaters.	https://drive.google.com/file/d/1wAfTBdzXJRHJtHxYypGuuxNUKsHUEJqv/view?usp=drivesdk
1896	The ability of an animal to move independently from one place to another.	LOCOMOTION	Movement.	https://drive.google.com/file/d/1EgIAO4KtnNU97Lw7vmg5kYadJMz4Yrr6/view?usp=drivesdk
1902	Describing animals selectively bred and adapted over generations for human utility.	DOMESTICATED	Tamed for human use.	https://drive.google.com/file/d/1ikUy29vTOa8b6e2CKMVegOtyb_9kTSCJ/view?usp=drivesdk
1916	The process of rapid oxidation, fundamental to internal engines.	COMBUSTION	Engine's power method.	https://drive.google.com/file/d/1yWBjxWelvJ-z7K5DL8KmdJ_R4oM1zxxp/view?usp=drivesdk
1918	Designed to optimize airflow and reduce drag, especially in vehicle design.	AERODYNAMIC	Streamlined shape.	https://drive.google.com/file/d/1IrAOmhE6kUj-sk5NZQpVIJPCRMWzQPSb/view?usp=drivesdk
2085	A new version of a literary work, especially for film or television.	ADAPTATION	Manga becomes this	https://drive.google.com/file/d/1RMirLvgPgkZR4nu-_yrxqcQEamEYPTgY/view?usp=drivesdk
1999	To make a new program ready for use.	DEPLOY	Put software live.	https://drive.google.com/file/d/1KMRR0aH5ED3oGN4E6hIq5QMpdzyoUuWW/view?usp=drivesdk
2047	They go far to find them.	BOOKS	Things you can read.	https://drive.google.com/file/d/18aSBWJ4s8nxmErd3KUF9y2SkEg25Ym-f/view?usp=drivesdk
2042	A man who prays.	MONK	He wears special clothes.	https://drive.google.com/file/d/110nZvxToIAGZ7yy3F-qlrrJp-uJjd7za/view?usp=drivesdk
2049	This farm animal is pink.	PIG	Likes mud.	https://drive.google.com/file/d/1sAdJxRGpy2Zvx6eJ-eo5RLFhhVMMZO0t/view?usp=drivesdk
2127	Make things hot with this.	HEAT	The sun gives this.	https://drive.google.com/file/d/1NgxxshC3baFVpy332WSyY0rnWcceC_EW/view?usp=drivesdk
2172	Describes mental processes such as understanding, reasoning, and remembering.	COGNITIVE	Mental abilities	https://drive.google.com/file/d/16JGM3Mf3YHufN5W3TfC6HzdUugMX3h74/view?usp=drivesdk
2231	The multi-stage process of elevating characters and gear to a superior power tier.	ASCENSION	Rank up	https://drive.google.com/file/d/1ll3tcsKIq4a5eKBtFJh0xptCuealiSwL/view?usp=drivesdk
2271	A king wears this.	CROWN	On a king's head.	https://drive.google.com/file/d/1w_A2ZZoVU3LUf-4Ek-qFRMb5Lz6WTfJ5/view?usp=drivesdk
1471	A way of doing things that happens regularly.	RITUAL	A daily habit or custom.	https://drive.google.com/file/d/1ZpVvK2HY5TMs6uHnWcr-JnTXxZ90Butu/view?usp=drivesdk
1722	The subtle foreshadowing present in earlier short films, hinting at the feature-length project.	ADUMBRATION	Faint premonition.	https://drive.google.com/file/d/1xcRT7rxl39ga0XG1QSSZy92Ea2kdg6K0/view?usp=drivesdk
1769	Cars can go very ___.	FAST	Not slow.	https://drive.google.com/file/d/12Hx0KCkkyzy4oq-5Ag6EHqcH_lmsAL3P/view?usp=drivesdk
1771	Cars drive on this.	ROAD	A path for cars.	https://drive.google.com/file/d/1gL13Wnzog6csigdwFt72fSIIpF-PQJ-3/view?usp=drivesdk
1812	Describing an early automobile or its foundational technology, now distinctly superseded.	ARCHAIC	Very old or outdated.	https://drive.google.com/file/d/13t4M1ijIIhmIrHAscU1OgI4odoxpV2Qq/view?usp=drivesdk
1815	The process of profound improvement or refinement observed in automotive design and function over time.	AMELIORATION	Act of making better.	https://drive.google.com/file/d/1vVrZfU_1qg4NjLUoAWDicLUij4UuNcZ1/view?usp=drivesdk
1852	To provoke or instigate, as rivals might.	GOAD	Stimulate a reaction.	https://drive.google.com/file/d/1LnLBWVMwXu-fUKfFbJ0oHLxkm5O5FxZB/view?usp=drivesdk
1898	Organisms with complex cells, including animals, fungi, and plants.	EUKARYOTA	Has a true nucleus.	https://drive.google.com/file/d/1nm2fDOPic65nwAMATKE7t4D3UHu8M0jQ/view?usp=drivesdk
1906	A critical hollow sphere of cells formed during early animal embryonic development.	BLASTULA	Embryo's initial cell ball.	https://drive.google.com/file/d/1ESJBYDohxjFGkvg_g_KNLUcOtu5tru86/view?usp=drivesdk
1917	The state of being widely prevalent or present everywhere.	UBIQUITY	Pervasive existence.	https://drive.google.com/file/d/1th-E060yQrXwvWAWBPOhdubZyRdjNp9T/view?usp=drivesdk
2087	A remarkable or unusual occurrence, such as anime's global popularity.	PHENOMENON	A widespread event	https://drive.google.com/file/d/1k3fhOajLCnQnSGIS0-6EcVTFC7D_J2fy/view?usp=drivesdk
2086	The collection of musical pieces specifically composed for a visual production.	SOUNDTRACK	The series' music	https://drive.google.com/file/d/1KYoxdTFYUTIJYZNYScI5jZJEvVlC002C/view?usp=drivesdk
2001	Something that is more important than other things.	PRIORITY	Level of importance.	https://drive.google.com/file/d/1Onl-nqr9mmMpc8ld5dLQIvg3W3A2HHdk/view?usp=drivesdk
2000	A record of past events or actions, like undoing a mistake.	HISTORY	What happened before.	https://drive.google.com/file/d/1Bfz_fQdFGFr1jo6Ui3r-JAgFz8c6nbPu/view?usp=drivesdk
2005	A set of connected parts that work together, like for messages.	SYSTEM	A group working as one.	https://drive.google.com/file/d/17pEHnMVKeRkSPYHgzH2Ri4I8veOkNAMS/view?usp=drivesdk
2044	A group of friends.	TEAM	They work together.	https://drive.google.com/file/d/1LYY4sbu1ktd-puL5Ye0W4gK9mF4E0KEM/view?usp=drivesdk
2133	This thick layer of fat helps Arctic animals stay warm.	BLUBBER	Fat layer	https://drive.google.com/file/d/1-ZQJrtVBywxy24hqh53a-8DDO7Qq6ycA/view?usp=drivesdk
2128	This Arctic whale is famous for its very long tusk.	NARWHAL	Unicorn whale	https://drive.google.com/file/d/1ejUFhC8RsxZTMuCehr_nsPxKF38Wz53B/view?usp=drivesdk
1041	Creator Ruby's name.	person	First name	https://drive.google.com/file/d/1Zmxj5w27ic2WFexX_edf1pQ-xhJqISkN/view?usp=drivesdk
1042	Scooby's dog breed.	citizen	Big dog	https://drive.google.com/file/d/1KUS6TtoHaWcPdQabJOeOoKyWRIz-66Nb/view?usp=drivesdk
2173	Technology applying self-operating machinery to production or service tasks.	AUTOMATION	Self-operating systems	https://drive.google.com/file/d/1PjnDYXO6xviU0aERYYLPRloRcJfRhxGo/view?usp=drivesdk
2232	An essential item equipped by characters to enhance their combat capabilities.	WEAPON	Sword or bow	https://drive.google.com/file/d/1bLIKLj0kmbPe6ztgWNS8oWhf-LjEy64j/view?usp=drivesdk
2272	Something about a king.	ROYAL	Like a king.	https://drive.google.com/file/d/1PUtQEyEImAmfMCiyeEdbulMvUhPqqanb/view?usp=drivesdk
750	Rick's grandson, often caught in crazy adventures.	morty	Rick's teenage companion	https://drive.google.com/file/d/1C6-Xu2GsJvfFNc1M9VTqFxYyQIiVKAi-/view?usp=drivesdk
755	Rick's catchphrase; joyful exclamation.	wubba	Part of a famous phrase	https://drive.google.com/file/d/1_44TkiGboflURrGVLXqZQZpsBlLEBHDt/view?usp=drivesdk
754	The family's home dimension.	bastion	A large, important place	https://drive.google.com/file/d/167MPIWZiWaQJRR635OvAM9MCp7G_mTw9/view?usp=drivesdk
753	A pickle-shaped Rick.	jam	A memorable episode	https://drive.google.com/file/d/1tPcox4YZ9qBxlxxkPmz9AqtfR3nVQJzr/view?usp=drivesdk
1723	An overwhelming sense of inescapable, tragic fate that permeates the narrative.	DOOM	Preordained destruction.	https://drive.google.com/file/d/1q9K7j99NOIA2jS4hk--HMBktBltDF60C/view?usp=drivesdk
752	Mad scientist, genius inventor.	wrick	Morty's grandfather	https://drive.google.com/file/d/1KtaU31WvASQ9X46QGa3H5BTFOyGech1s/view?usp=drivesdk
751	Rick's unusual and powerful weapon.	portal	Device for interdimensional travel	https://drive.google.com/file/d/1JuTc0pUBkMajGOZT12dJibxwFISPrypR/view?usp=drivesdk
756	The show's genre, often combined with humor.	scifi	Science fiction	https://drive.google.com/file/d/1wQQzZp_qUEVxsre4Nqmx_RLZwbQ45uAH/view?usp=drivesdk
758	The network where the show airs.	adultswim	Cable TV channel	https://drive.google.com/file/d/1QSP8Bvb_MQIZLLL8UkYUbpHW6sZW7dvR/view?usp=drivesdk
759	Small, wish-granting creatures.	meeseeks	They want to help you	https://drive.google.com/file/d/1N8UzpBJ6pHv0IkkQhu7a0UMHRKSNcDv2/view?usp=drivesdk
757	Rick's often-stated lack of care.	sorry	Starts a dismissive phrase	https://drive.google.com/file/d/1UdMEOYNJ8DrTdk7IUqROvvF1hT5WNq03/view?usp=drivesdk
1770	This car is not new.	OLD	From long ago.	https://drive.google.com/file/d/1W8y54s1ZhxLjMOT-RKt8e583Ye0AVmWc/view?usp=drivesdk
821	A sound a cat makes.	miaow	Cat's vocalization	https://drive.google.com/file/d/1RzCsyBymRMOBg1-AYOGbf_whVn8W-nSG/view?usp=drivesdk
1814	The manifest cleverness inherent in vehicular design progression and engineering solutions.	INGENUITY	Inventiveness.	https://drive.google.com/file/d/11GxDbOT_BUbuWjMBrB73GaoiXPaE49Ny/view?usp=drivesdk
819	The opposite of tame.	frantic	Not domesticated	https://drive.google.com/file/d/1UaijBCJyGGNe4-9KokpRleaS9hQ4ocAL/view?usp=drivesdk
820	A young cat or dog.	pup	A baby animal	https://drive.google.com/file/d/1fcbvYZPGrU2oZrUk3qu0cDMbasFEw5Tj/view?usp=drivesdk
822	What a dog does with its tail.	wags	Happy dog action	https://drive.google.com/file/d/16xH8gZLchpSI6dsqf58pi1TvCOWSvT7S/view?usp=drivesdk
1854	A vigorous verbal or written attack, often public.	POLEMIC	Strong dispute.	https://drive.google.com/file/d/1A82fX6qmZj8Ip1xpMly6ug_vghy2Y9rR/view?usp=drivesdk
823	Lives in the jungle.	scamp	Tree-dwelling primate	https://drive.google.com/file/d/1u7F-fWPpALsRbS9lgeoq78kn9nUniJ2s/view?usp=drivesdk
824	Has stripes and lives in Africa.	zebra	Striped African mammal	https://drive.google.com/file/d/16YALiuaNApQF4ADzkl5H9wV5gbYLKG67/view?usp=drivesdk
1899	A collection of traditional stories, often featuring animals with symbolic significance.	MYTHOLOGY	Ancient tales.	https://drive.google.com/file/d/1BlHZpIjL0ipOgB69pMFncqD4ZjpZjXYm/view?usp=drivesdk
1905	The scientific discipline focused on the objective study of animal behaviour.	ETHOLOGY	Study of animal actions.	https://drive.google.com/file/d/10RkeZLTKiHIMBzqJn2K5FSxUjH93tV81/view?usp=drivesdk
1919	The introduction of novel methods or products, driving technological progress.	INNOVATION	Creative advancement.	https://drive.google.com/file/d/15ytIsAcj1tidGBZPzjXvNm24TP7RYxyg/view?usp=drivesdk
1959	An inherent lack of cunning or deception, characterizing a pure spirit.	GUILLESSNESS	Relates to his pure heart.	https://drive.google.com/file/d/1GM725ZV7V_FqhZUQv6mzERY8yYPWUQy_/view?usp=drivesdk
2002	To remove something, for example, an item from a list.	DELETE	To take away.	https://drive.google.com/file/d/1JPgONMAXK0yc1SfOumrbv3csoJf_xZ0s/view?usp=drivesdk
2045	To battle or use power.	FIGHT	Use strength against bad things.	https://drive.google.com/file/d/1FcgkrXRLC5Vh8Smawhpb1n1J7r5gFQyx/view?usp=drivesdk
2088	A central point of activity or transportation within a larger area.	HUB	Think of a central connection point.	https://drive.google.com/file/d/18NakuK_XKYZwMSXtPLxyL-V2cx2oIT1r/view?usp=drivesdk
2130	To continue living, especially in a difficult environment.	SURVIVE	Stay alive	https://drive.google.com/file/d/1npK2---Q1TYfuqdu3AIOZnnsmvjP5RjT/view?usp=drivesdk
2174	A step-by-step set of instructions a computer follows to solve a problem.	ALGORITHM	Computer instructions	https://drive.google.com/file/d/1Ztl2bShOnkJ6Zh1OUoblTVFpDp2jWiGm/view?usp=drivesdk
2234	The fundamental currency for purchases and upgrades within the game world.	MORA	Gold	https://drive.google.com/file/d/11yPHItJ4zQ0K-XmQbsD_Mb27iA08jJBu/view?usp=drivesdk
1043	His special bladed weapon.	mitt	He wears it on his hand	https://drive.google.com/file/d/1GPYuGBKysRWrE2Esx-QqNwd6v9bNwt2v/view?usp=drivesdk
2273	A group of students.	CLASS	Your school group.	https://drive.google.com/file/d/1ZmKQMnVoHHF6Pl06uBq7dHt5DbGaPWTP/view?usp=drivesdk
760	Shin-chan's surname	nohara	Family name	https://drive.google.com/file/d/1MezSUEFVyGA7Aepcy3oS5UNdKv-cKRr4/view?usp=drivesdk
761	Shin-chan's age	quintet	Years old	https://drive.google.com/file/d/1sIGIhr96Y_z5cmmyWefmzXcESpa7cfVJ/view?usp=drivesdk
763	His dad's job	salaryman	Works for a company	https://drive.google.com/file/d/1yA3CZtr22PNHvr33P1WH20mEJlggVP2p/view?usp=drivesdk
762	Shin-chan's city	kasukabe	Where he lives	https://drive.google.com/file/d/1txSLJ9AemLyf3b18-ZTHuhcdr1w9lp-X/view?usp=drivesdk
767	Shin-chan's school	kindergarten	Preschool	https://drive.google.com/file/d/1CM1FFZ8diAG1zLDkewY7lqWrpp3_quph/view?usp=drivesdk
765	His baby sister	himawari	Younger sibling	https://drive.google.com/file/d/12cWVWs0wv6ZsF0XZ9j5p1pjwePylrBCB/view?usp=drivesdk
766	The family dog	shiro	Loyal pet	https://drive.google.com/file/d/1cKPuPlLyxiLGILjEuhfah2ThcJkorE-w/view?usp=drivesdk
769	Shin-chan's hero	actionmask	Superhero	https://drive.google.com/file/d/1G4HDiQ2GXzcMEB8YFLfaP1caBXd73_JP/view?usp=drivesdk
768	A favorite snack	biscuits	Sweet treats	https://drive.google.com/file/d/1q4D7KfPNoMuKcq2IDt7zfn-ey5JijOpz/view?usp=drivesdk
1725	The complete destruction or permanent removal of something.	OBLITERATION	Total eradication.	https://drive.google.com/file/d/1cgFrJy74aQfiDVDRdX5t0iVMytLUaBzY/view?usp=drivesdk
1729	The process of absorbing and integrating into a wider whole.	ASSIMILATION	Becoming part of.	https://drive.google.com/file/d/1UcjIT7EcT5085rw6ewTyi6bNXluLhKMx/view?usp=drivesdk
764	Shin-chan's mom	misae	Mother's name	https://drive.google.com/file/d/1277wYRO9Dmi60t4ApaJXEn_bsL3CvVXn/view?usp=drivesdk
828	You use this to show things on a computer.	display	What you look at	https://drive.google.com/file/d/1vi2Wwlw5XDhtvj8ogLzPXaXz3kvzVCZk/view?usp=drivesdk
830	To make a computer smaller.	reduce	To reduce size	https://drive.google.com/file/d/17u2xlv7dvwDYTBuRIR4g6mxRT9UQpMJu/view?usp=drivesdk
826	We use this to work online.	pc	A digital machine	https://drive.google.com/file/d/1a9lqsTcIC0CaOWNBY4OBzmdLZk4bbTqo/view?usp=drivesdk
832	To find something on a computer.	find	To look for	https://drive.google.com/file/d/1XRkgp6vGHoxEOBxVscmH0f1J0onW5SnK/view?usp=drivesdk
825	A type of computer you carry.	computer	Portable computer	https://drive.google.com/file/d/10CxvN6LPpnhp2Q_m1h8dZMpZ9Oo7lGBS/view?usp=drivesdk
831	Information on a computer.	facts	Facts and figures	https://drive.google.com/file/d/1siHARs9zZKUU6qd7x3m9jFph36oSmbgT/view?usp=drivesdk
1774	Cars need this to go.	FUEL	Gas for the engine.	https://drive.google.com/file/d/1KY0BQe_9NY-med9A0_MI47JvhBFvLJ76/view?usp=drivesdk
829	What you click with a mouse.	symbols	Small pictures	https://drive.google.com/file/d/1YSfKXGmChzkeW0UEIH3hTqD5H85TfinD/view?usp=drivesdk
827	A computer's brain.	cpu	The CPU	https://drive.google.com/file/d/15PmHz8JBaBcsEvNCQQZYJ6Pq5L9Z1dg3/view?usp=drivesdk
833	What you use to type.	keyboard	Input device	https://drive.google.com/file/d/1M4ki6Zvv4XUJJPjDYRRwkpMRsmawcX97/view?usp=drivesdk
1772	Cars move on this path.	ROAD	Place for cars.	https://drive.google.com/file/d/1gL13Wnzog6csigdwFt72fSIIpF-PQJ-3/view?usp=drivesdk
1783	A process where parts are put together.	ASSEMBLY	Ford used a special one.	https://drive.google.com/file/d/10EzhfU45h0ghVG_7VsZYLEAY1w3OMET7/view?usp=drivesdk
1778	A long trip from one place to another.	JOURNEY	It starts with J.	https://drive.google.com/file/d/1blQU32s0XPpimTVys1IPtlHTPRdUHfIB/view?usp=drivesdk
1821	American Idiot became a defining album for a specific group of people.	GENERATION	Age group living at the same time.	https://drive.google.com/file/d/1Tnmghx5AKN4fLuz4mqMmy_ylGWGszC7k/view?usp=drivesdk
1816	American Idiot directly questioned figures of power and traditional systems.	AUTHORITY	People in charge.	https://drive.google.com/file/d/1x5KqF91Ri-Lq2E6SZwTwULOTOLWEGnjM/view?usp=drivesdk
1855	Possessing a smell or taste reminiscent of burnt organic matter.	EMPYREUMATIC	Charred aroma.	https://drive.google.com/file/d/1c4nQOR354aP2ejlNDYR4nSbYpMUxfmRS/view?usp=drivesdk
1900	Domesticated animals raised in an agricultural setting for products or labor.	LIVESTOCK	Farm animals.	https://drive.google.com/file/d/15XRZPDslw8QdRxUNYvFPM-S8YtHrXhAI/view?usp=drivesdk
1044	The film series is in this scary genre.	horror	A frightening movie type	https://drive.google.com/file/d/1S_iFzennjbq6DXJsBHJu4lbMcEQKxYG4/view?usp=drivesdk
1907	Interdependent evolutionary changes occurring between two or more interacting species.	COEVOLUTIONS	Mutual species adaptation.	https://drive.google.com/file/d/1DSbfTHp83VpjHV-K1KOWb_m723WxZ0hP/view?usp=drivesdk
1904	A taxonomic group encompassing all descendants from a single common ancestor.	MONOPHYLETIC	One shared origin.	https://drive.google.com/file/d/1tNOE9UyTRWiKBSfktRrAx5qjNpk0t_R6/view?usp=drivesdk
1046	Robert _____, the actor who played Freddy.	englund	The actor playing Freddy	https://drive.google.com/file/d/1RitQV1P9ssTFV_sQUG696HnlYJSffb82/view?usp=drivesdk
1920	A short word for a car.	AUTO	Another name for a vehicle.	https://drive.google.com/file/d/1b0zdwHpSk2LpaSOTFO9rHtoZ802Cj7YG/view?usp=drivesdk
1960	A profound composure and mental stability despite life's travails.	EQUANIMITY	His calm demeanor through adversity.	https://drive.google.com/file/d/1Pti1_NPEzA7xdsW8ohrtVTzVJpUF5hgM/view?usp=drivesdk
2003	A group of connected things, like computers or friends.	NETWORK	Connects people or devices.	https://drive.google.com/file/d/1QRD_8y4zgimjskFl57YpwU2u1xkTLwoN/view?usp=drivesdk
2043	A long travel to a place.	TRIP	To go somewhere.	https://drive.google.com/file/d/14vM_vCQPOcI_3k1Wun8x_3KJ9l4xzed2/view?usp=drivesdk
2048	It says "woof."	DOG	Your playful pet.	https://drive.google.com/file/d/1-FAVbwNO-GROZTPBEGvJFb3Od1DcPT3o/view?usp=drivesdk
2050	It says "quack-quack."	DUCK	A bird that swims.	https://drive.google.com/file/d/1pfk3LEBlbEgXrGoQUzbXGBSG40WlwdON/view?usp=drivesdk
2089	A very large, important city that is often a regional center.	METROPOLIS	Another word for a major big city.	https://drive.google.com/file/d/1c64o57vkh4T2t0XBv0MoIdVzee-VxQdg/view?usp=drivesdk
2131	A small white whale that lives in Arctic waters.	BELUGA	White whale	https://drive.google.com/file/d/1uQyBXWK6D-wtpSxRTSXTfIdIWfa2X9fd/view?usp=drivesdk
2175	Describing marine life found in the open ocean, far from the coast.	PELAGIC	Open sea related	https://drive.google.com/file/d/1O2l_rq2BQHqvSfyKfSqhraF7UB5SmBaW/view?usp=drivesdk
1726	The central character in a narrative, artwork, or significant event.	PROTAGONIST	Main figure.	https://drive.google.com/file/d/1t7B4rFMLvbGcSztBiiIvXEpdXv2uCx9p/view?usp=drivesdk
1773	To begin your car trip.	START	First step to go.	https://drive.google.com/file/d/1Vh05LrEf4EMuVEAwemTrpJ5-oQeHCgJ9/view?usp=drivesdk
1780	Safety parts that inflate quickly in a car crash.	AIRBAGS	They protect you in an accident.	https://drive.google.com/file/d/1eQBzb3eBzgQjYx1bMudrQVHws744xw6O/view?usp=drivesdk
1817	Their music always contains an honest and genuine expression of feelings.	SINCERITY	Truthfulness in emotion.	https://drive.google.com/file/d/1yS0_yOT5ioIASM3Jda4CYMO_-nXRUBBO/view?usp=drivesdk
1856	The characteristic spirit or guiding beliefs of an organization.	ETHOS	Core values.	https://drive.google.com/file/d/1iOsDS82f1a9dyakkYNDekymXyUuhD3Ix/view?usp=drivesdk
1901	The scientific observation of how animals naturally act.	ETHOLOGY	Animal behavior study.	https://drive.google.com/file/d/10RkeZLTKiHIMBzqJn2K5FSxUjH93tV81/view?usp=drivesdk
1903	Describing deep-sea vents where unique ecosystems thrive on chemosynthesis.	HYDROTHERMAL	Hot water vents.	https://drive.google.com/file/d/1umIXlFntN9vLHOl7VBCDyiCPCAHpkLpM/view?usp=drivesdk
1921	You press this to stop.	BRAKE	Pedal to slow down.	https://drive.google.com/file/d/1pXndpB586u9b0Nmz6vbbo0v5fKqOpqoW/view?usp=drivesdk
1961	Uncompromising moral probity, guiding one's ethical conduct.	RECTITUDE	His unwavering honesty and kindness.	https://drive.google.com/file/d/1CpIrPRix8l4U7eJpJBNrqHW4JQr-ufk-/view?usp=drivesdk
2004	To look for information or data, often in a list.	SEARCH	To find something.	https://drive.google.com/file/d/1Rle2MmFoTOCgvr6CtzJxHNmcGs_mugFc/view?usp=drivesdk
2046	The direction of the sunset.	WEST	A main direction.	https://drive.google.com/file/d/14mfqSC6cGW_q3peO6FWqxH0XW8I0G9xw/view?usp=drivesdk
2091	The most important city, often governmental, of a country or region.	CAPITAL	Bangkok is this for Thailand.	https://drive.google.com/file/d/1AifyUEGReeSkY7bWn-Ep4BgYNKn8xCHQ/view?usp=drivesdk
2129	This large sea animal has long tusks on its face.	WALRUS	Tusks	https://drive.google.com/file/d/1zuElgrNlGrAq9x1ZqCKm7_dW4k7cx6aa/view?usp=drivesdk
2176	Someone who fishes using a rod and line.	ANGLER	A fisher	https://drive.google.com/file/d/18x_bwHPA6zKkGxXVGRiIDGER1XF2k9I-/view?usp=drivesdk
2236	Exciting events like fights or races happening in a story.	ACTION	Lots of movement.	https://drive.google.com/file/d/1TFCzx_PZWr9_3gsY6VF4J7mEnxohC4TE/view?usp=drivesdk
770	Snow White's jealous relative.	stepmother	Her wicked family member	https://drive.google.com/file/d/1vX_ThdImWjBJmFO2hMpx7vT1cpuJuKm9/view?usp=drivesdk
775	Snow White's defining characteristic.	peach	What caused the Queen's envy	https://drive.google.com/file/d/1J37mnYaqj0Q7KnrkXCrL-6zmR4c0OlUB/view?usp=drivesdk
771	The fruit that put Snow White to sleep.	maluspumila	Poisoned in the tale	https://drive.google.com/file/d/1DI-Vnk0QkiopKhjmCxELEaI6iJsU-qeK/view?usp=drivesdk
773	The prince's action that awakens her.	osculation	A magical act of love	https://drive.google.com/file/d/1_RhnLbKVt4grUJkQ4Vr6JNzf_BzxtyTv/view?usp=drivesdk
779	The emotion driving the Queen's actions.	jealousy	The Queen's negative feeling	https://drive.google.com/file/d/1tJP38xvnt-TQcQIRycn-WibGSEL2lMRI/view?usp=drivesdk
778	A word describing the original story's tone.	unsettling	Opposite of light-hearted	https://drive.google.com/file/d/1NTZGwd_RLxSL7J14bBSOjcuGKl143zzd/view?usp=drivesdk
774	The Brothers who collected the tale.	grimm	Famous fairy tale collectors	https://drive.google.com/file/d/1ypN9IhxCKLWiGjczanK2YDDkVZQ1FZRo/view?usp=drivesdk
772	The creatures who sheltered Snow White.	dwarfs	Seven of them in the story	https://drive.google.com/file/d/104ci0PqYt7iNN2uMFq0pOR4tjmDMOQeg/view?usp=drivesdk
776	The Queen's obsession in the story.	justice	She wanted to be 'the fairest'	https://drive.google.com/file/d/108HSehRCP8x1UGlXop6AyUtQlerP5Eqi/view?usp=drivesdk
777	The Queen's tool for checking her beauty.	mirror	Magic reflecting device	https://drive.google.com/file/d/1UCf2aIpFRsCTlk2moNfVnAoJRBsixDdk/view?usp=drivesdk
1045	Where Freddy attacks his victims.	ambition	What you do at night when you sleep	https://drive.google.com/file/d/1Fldb2rBXlqsAWZNoeMKLCgj4fNjIIkmJ/view?usp=drivesdk
835	The actor who plays Mr. Bean.	atkinson	Rowan ____	https://drive.google.com/file/d/12lhp66tUppB6m7Wm1Fok2zYddUIvNUrq/view?usp=drivesdk
1727	The state of being unsure or doubtful; a lack of predictability.	UNCERTAINTY	Feeling hesitant.	https://drive.google.com/file/d/1Lmeknnm8Mt7jrgeUo5T1DhA1PbXft1J6/view?usp=drivesdk
1775	This makes the car move.	ENGINE	Heart of the car.	https://drive.google.com/file/d/17UPUvZALx89oqT0etk3LC1toC7yaz4Ss/view?usp=drivesdk
1779	Liquid fuel used in most older cars.	GASOLINE	It powers many vehicles.	https://drive.google.com/file/d/1MsCjVeTuqgUtcQ0SsHMV376UzkXCl8I_/view?usp=drivesdk
1818	Green Day emerged from the underground punk scene, a distinct social group.	SUBCULTURE	A group within a larger culture.	https://drive.google.com/file/d/1X2Sz7gOOdqqdt5ihC_Utm37OSn8sZThn/view?usp=drivesdk
1857	The ideas and way of life of a country or group.	CULTURE	Traditions of a people.	https://drive.google.com/file/d/1x24ZFRHW5FjcglqRs9cARglBiHfTvEQ7/view?usp=drivesdk
1858	The different tastes that food has, like sweet or sour.	FLAVORS	What you taste in food.	https://drive.google.com/file/d/1zacL6IhF9yNa6UZRWH4gfyyQ7uC1lfrz/view?usp=drivesdk
1908	The academic discipline dedicated to discerning patterns of animal conduct.	ETHOLOGY	Behavior study	https://drive.google.com/file/d/10RkeZLTKiHIMBzqJn2K5FSxUjH93tV81/view?usp=drivesdk
1913	Any organism belonging to the Animalia kingdom; a multicellular animal.	METAZOAN	Kingdom member	https://drive.google.com/file/d/1Q7qKIEDkcKWrEbp_eXuRg_fzi8ZJMbBa/view?usp=drivesdk
1909	The overarching biological domain defined by cells with a true nucleus.	EUKARYOTA	Complex cells	https://drive.google.com/file/d/1nm2fDOPic65nwAMATKE7t4D3UHu8M0jQ/view?usp=drivesdk
1922	It is round and helps a car move.	WHEEL	A car has four of these.	https://drive.google.com/file/d/1vgfIO9xCcFs_-AfzUcIYwHVYqhMNjQpq/view?usp=drivesdk
1962	The unpredictable changes and fluctuations inherent in one's lifetime.	VICISSITUDES	Refers to life's ups and downs.	https://drive.google.com/file/d/1j_ntgjwxOGeRA-6WublOuFdsHkTEzLcO/view?usp=drivesdk
2007	Thinking carefully about what you will do.	PLANNING	Making arrangements for the future.	https://drive.google.com/file/d/1F_WIfmKGTsvOShnaPfXaiOitf-ToWgaW/view?usp=drivesdk
2051	It gives white milk.	COW	A big farm animal.	https://drive.google.com/file/d/1GZHYNzWxNT0UE5ZukkvnOv1HLN_LRXKH/view?usp=drivesdk
2090	Relating to a city or town area, as opposed to rural.	URBAN	Describes life in a city.	https://drive.google.com/file/d/1uk3qwlIaQq7__ZctatFZclpjelLkMFm8/view?usp=drivesdk
2132	A type of deer found in cold places, also called caribou.	REINDEER	Caribou	https://drive.google.com/file/d/1utrYK04KsBRqvP-k5fU3yBIGyqw7N4Xg/view?usp=drivesdk
2177	A natural underwater structure often made of coral.	REEF	Underwater home	https://drive.google.com/file/d/1wyoEQ_AtpYdxAGYVR3bU5z4K6gm1GF0T/view?usp=drivesdk
2237	The bad person in a story, often fighting the main character.	VILLAIN	They cause problems.	https://drive.google.com/file/d/1WNe8g-ugT98EN_5H3nQzLvTM1JvKkP7e/view?usp=drivesdk
837	Where Mr. Bean studied.	oxford	Famous English university	https://drive.google.com/file/d/1_jgYQ43SEkf6ZUZ2T9T2A8kcBUslU3DP/view?usp=drivesdk
782	A tall, slender tower.	tower	Where Rapunzel lived	https://drive.google.com/file/d/12vct1-iMzQEEOZPotfh3xOlEf-qPQnAL/view?usp=drivesdk
841	Country where Mr Bean is popular	england	Mr Bean's home country	https://drive.google.com/file/d/1mDK8NT_ORdnlhGcOiWAXC2fQAVvByvnR/view?usp=drivesdk
1728	The action of twisting or altering something from its true form.	DISTORTION	A warped view.	https://drive.google.com/file/d/1_jYc0HWG_mgT4lMphS9vv262UdOcZAlR/view?usp=drivesdk
1776	You do this in a car.	DRIVE	Make the car go.	https://drive.google.com/file/d/1uV_5crsAeCwiP4tvUpz8QNyBwcGvgUjY/view?usp=drivesdk
1781	A type of car that uses a battery for power.	ELECTRIC	It's good for the environment.	https://drive.google.com/file/d/17qMxjvu-FjBPR23TwFhwyl6sCqvYknkC/view?usp=drivesdk
1819	Green Day brought raw punk energy from obscure venues into this popular acceptance.	MAINSTREAM	Widely accepted by the public.	https://drive.google.com/file/d/1dyhqIeHOBQ28O2zhCwiKCVRC8wfYaWHC/view?usp=drivesdk
1859	To show or express something important, like a mirror.	REFLECTS	Shows or mirrors something.	https://drive.google.com/file/d/18ehFurbV7NyXG8oWK0qgRUs6gCppFYfZ/view?usp=drivesdk
1048	The last name of the main character.	krueger	Part of his full name	https://drive.google.com/file/d/13DvD08dqFbFMY1IirZaG_OUXVsAcEYep/view?usp=drivesdk
1910	The primary embryonic invagination marking the primordial mouth or anus.	BLASTOPORE	First opening	https://drive.google.com/file/d/1Lr_2lv4rwmZy5k-k__0y5izVUkveLjtN/view?usp=drivesdk
780	A girl with very long hair.	rapunzel	A fairytale princess	https://drive.google.com/file/d/128mm4dxuGy9pISJuNeHUQZHoodl3RVw6/view?usp=drivesdk
785	Hair's texture; not straight.	curly	Describes Rapunzel's hair	https://drive.google.com/file/d/1OICx1XlDYfAggOUeEQItCPnUOjp10tt1/view?usp=drivesdk
787	To make something happen.	cause	The prince's actions cause...	https://drive.google.com/file/d/16n2e4AE_0xTFeQZMf5fvZLdB1mzuLpnX/view?usp=drivesdk
788	A feeling of great love.	love	Rapunzel and Prince	https://drive.google.com/file/d/1pSk78fhdpYqnW8slkSt80JoeX5j7q3lX/view?usp=drivesdk
789	Opposite of beginning.	end	The story's conclusion	https://drive.google.com/file/d/1w_-zmMoDKnO0CJvVBS4w5Xl-WOBcj6g-/view?usp=drivesdk
786	A magical, healing substance	potion	Possibly used in the story	https://drive.google.com/file/d/1bfQfyFlPptudyjzVxSGbKy2rfc_IPhGi/view?usp=drivesdk
1923	Cars go on this flat path.	ROAD	Where you find cars.	https://drive.google.com/file/d/1gL13Wnzog6csigdwFt72fSIIpF-PQJ-3/view?usp=drivesdk
1924	What you do to make a car go.	DRIVE	To steer a vehicle.	https://drive.google.com/file/d/1uV_5crsAeCwiP4tvUpz8QNyBwcGvgUjY/view?usp=drivesdk
1963	Unwavering determination and firmness of purpose in arduous endeavors.	RESOLUTENESS	His persistent pursuit of Jenny and goals.	https://drive.google.com/file/d/1gOh7jcGTfC2S15J8M8jEu_XYwSHsBZbO/view?usp=drivesdk
2011	How happy and confident a group of people feels.	MORALE	It's important for a team's spirit.	https://drive.google.com/file/d/1bs_9q-24BKZ0jP_L6CGVuiWd4Z8X0vdA/view?usp=drivesdk
2006	When you win a competition or a battle.	VICTORY	The opposite of defeat.	https://drive.google.com/file/d/1a_atZJXhJdWN8lgTiEyvKq8HEiw9IgFi/view?usp=drivesdk
2052	It says "meow."	CAT	A small furry pet.	https://drive.google.com/file/d/1SKHrVWSjAOQOOWbwNA8yVCcsf89QnNkE/view?usp=drivesdk
2093	The cultural practice and art of selecting, preparing, and enjoying fine food.	GASTRONOMY	Food culture study.	https://drive.google.com/file/d/1jbQmnh3epA1GdnDEIr7GbaqEMzAAy0HB/view?usp=drivesdk
2092	Describing food that supplies substances vital for healthy development.	NUTRITIOUS	Healthy food quality.	https://drive.google.com/file/d/17vOx5zG8UMdl3ZMejsQELVc7EY9m4nPR/view?usp=drivesdk
2135	A structured collection of electronic information used for easy access and management.	DATABASE	Where data lives.	https://drive.google.com/file/d/1PPQJ5_3hpJ5tYiX-KbPV_tDUSzuiB1jk/view?usp=drivesdk
2134	The systematic computational examination of statistics to discover meaningful patterns.	ANALYTICS	Studying data trends.	https://drive.google.com/file/d/1kwo4ryVhwiCWBvCmqn0jdWWcqRrFkjs9/view?usp=drivesdk
2179	A space in house.	ROOM	Has walls and door.	https://drive.google.com/file/d/1r1CJEKJ9wtkJpVokNadtSESRC2ZVjJ9f/view?usp=drivesdk
2178	You write with this.	PEN	It makes marks.	https://drive.google.com/file/d/1zN3oTKHVbVZCNED9uPwbvNcHjxKXJf-m/view?usp=drivesdk
2189	You read stories in this.	BOOK	Pages with words.	https://drive.google.com/file/d/1FcCfWPy7aD8h5bs9rEA3cGKPVT7qxRYv/view?usp=drivesdk
2184	To know something new.	LEARN	Get knowledge.	https://drive.google.com/file/d/1ATkL4BVd-e-kprE2VyzkoAr6PG5eu8wN/view?usp=drivesdk
2238	A place where artists make films or TV shows.	STUDIO	Where movies are born.	https://drive.google.com/file/d/1GQ_C9gUGxSB8HUUQ4jBPZrdKhyRiCNWp/view?usp=drivesdk
783	To climb up something.	climb	How the prince got to Rapunzel	https://drive.google.com/file/d/1EivetJoThhd5Y-Mv3fJIcwi7047daWwK/view?usp=drivesdk
781	Opposite of short.	long	Describes Rapunzel's hair	https://drive.google.com/file/d/1VMyAvAlElbPquXTNiG4SHfv1M2zhJ1sT/view?usp=drivesdk
836	Mr. Bean's signature outerwear.	overcoat	He wears it often	https://drive.google.com/file/d/1LgnHGR6sByfG2Wien5VMsD5JeMwq3g2O/view?usp=drivesdk
1730	A large number or variety of diverse things or elements.	MULTIPLICITY	Many different parts.	https://drive.google.com/file/d/1HYwsDdd2ECux09RcPw7qutCqFkM6EGFl/view?usp=drivesdk
1777	A round part of a car.	WHEEL	It rolls on the road.	https://drive.google.com/file/d/1vgfIO9xCcFs_-AfzUcIYwHVYqhMNjQpq/view?usp=drivesdk
1782	Important roads connecting cities, often for fast travel.	HIGHWAYS	You drive fast on these.	https://drive.google.com/file/d/1toLVFbqbjtZAWZkVYCWnoVwVXkkeP-2_/view?usp=drivesdk
1820	Their music embodies a powerful refusal to accept dominant norms.	REBELLION	Defiance against rules.	https://drive.google.com/file/d/14Q3NEDrIpBuCQzRKp9Z1uQ72-j9cnWX-/view?usp=drivesdk
1860	When different parts are equal and work well together.	BALANCE	A good mix of things.	https://drive.google.com/file/d/1-yqhk13Ih8GxX1UIGqa3pTU1mvSWq7aw/view?usp=drivesdk
1911	A major protostome clade distinguished by the cyclical shedding of an exoskeleton.	ECDYSOZOA	Moulting group	https://drive.google.com/file/d/1KVY0EOqsJHVgpw6k0618NwcJTGyKKGCj/view?usp=drivesdk
1925	This gives power to a car.	FUEL	You put this in the tank.	https://drive.google.com/file/d/1KY0BQe_9NY-med9A0_MI47JvhBFvLJ76/view?usp=drivesdk
1047	Wes _____, the creator of Freddy.	cowardly	Freddy's creator	https://drive.google.com/file/d/1119xttE1TtryMh-2LYbwna8YjjCB1Yhk/view?usp=drivesdk
1964	The quality of having great intellectual or emotional depth.	PROFUNDITY	Deep insight.	https://drive.google.com/file/d/14V6O_GqsaUVgoV0ix1q2Vmt8t2hLnJ4V/view?usp=drivesdk
2008	Very old, from a long time ago.	ANCIENT	Describes something from the distant past.	https://drive.google.com/file/d/10dBwfh6oFWMpKIBdAnkxvQ_Rfypt61-b/view?usp=drivesdk
2053	It swims in water.	FISH	It has fins.	https://drive.google.com/file/d/13n4wwMBX3BNSULZpBhr1vVDm1D5R2VPT/view?usp=drivesdk
2094	Supplies of food and drink, especially for a special event or trip.	PROVISIONS	Food stock for journey.	https://drive.google.com/file/d/1F2lu1jRCUy5JEiE9-7Gv2ixQDOPb-Cqe/view?usp=drivesdk
2136	Valuable understanding gained from detailed examination of information.	INSIGHTS	Data reveals them.	https://drive.google.com/file/d/19TBnyrt5AGMdZir3GqcW3K0koy1GKjc0/view?usp=drivesdk
2180	A very big town.	CITY	Many houses are here.	https://drive.google.com/file/d/1Wg-KFLZR3OBmgYSqm0LwqNq_YAs6cLRf/view?usp=drivesdk
2188	You learn many things here.	CLASS	A group for learning.	https://drive.google.com/file/d/1ZmKQMnVoHHF6Pl06uBq7dHt5DbGaPWTP/view?usp=drivesdk
2235	Main good people in a story who do brave things.	HEROES	They save the day.	https://drive.google.com/file/d/1hkqb6if0qI8viUwotRGDc9aBtTCN1JEw/view?usp=drivesdk
2239	A type of story with magic, mythical creatures, and imaginary worlds.	FANTASY	Not real life.	https://drive.google.com/file/d/1eT7fa7xf0PG_c3A0uBFAcG4sHbqiSg8J/view?usp=drivesdk
1474	A large road used for fast travel between cities.	HIGHWAY	Cars drive on it quickly.	https://drive.google.com/file/d/1LM7MVi2p7wTEblk0RawpCSTnbC-Rpn0T/view?usp=drivesdk
1563	You eat this at the party.	FOOD	Often on a plate.	https://drive.google.com/file/d/1c8Dk8PimjbTIEsTCQpd6Wh1HtQm6g5hj/view?usp=drivesdk
1564	You hear this at the party.	MUSIC	You can sing along.	https://drive.google.com/file/d/1oY5cT9CAg9OJe5Pufu4YviDcTlcheE7a/view?usp=drivesdk
1731	A picture made using colours, often oil, on a canvas.	PAINTING	An artwork you can hang.	https://drive.google.com/file/d/1iEkBc-wWGSzTNdeScuSDpi8a_cFVrY5C/view?usp=drivesdk
1736	Relating to the present time, or a recent period.	MODERN	Not old or traditional.	https://drive.google.com/file/d/1Hmt7gD-3clkrwp5n2kXESm6J6NCPVjZZ/view?usp=drivesdk
1789	Economical enough for most people to purchase.	AFFORDABLE	Not too expensive.	https://drive.google.com/file/d/17NsxDj-qZhuTn6ROpXZL7jpSGhbfbq4l/view?usp=drivesdk
1784	Operating independently without human control.	AUTONOMOUS	Self-driving.	https://drive.google.com/file/d/1s5mWuzDOlnNV1ffMsQA8dVgP3B08EYXa/view?usp=drivesdk
1861	A spicy root used in Thai cooking, similar to ginger.	GALANGAL	A special root for spices.	https://drive.google.com/file/d/1vuJNL4ZhMnB29rnlZZRdbV43QBKQFwOw/view?usp=drivesdk
1912	The nascent, hollow cellular globule preceding gastrulation in animal embryogenesis.	BLASTULA	Early sphere	https://drive.google.com/file/d/1ESJBYDohxjFGkvg_g_KNLUcOtu5tru86/view?usp=drivesdk
1927	A thing that represents or stands for something else.	SYMBOL	Pennywise is a cultural one.	https://drive.google.com/file/d/1Qo3_lkBO6vI5wmm_zRD7_i1JKANhtP1_/view?usp=drivesdk
1926	Something that exists as a single, separate thing.	ENTITY	Pennywise is not just a clown.	https://drive.google.com/file/d/1CA4u-Q9tYqloxnHWQtBukFAUX370447v/view?usp=drivesdk
1965	A state or federal prison, particularly for serious offenders.	PENITENTIARY	Correctional facility.	https://drive.google.com/file/d/1Zodsq36k6jxU79dnwgSKH_DsJj3GQAw5/view?usp=drivesdk
1967	Exceeding ordinary limits; beyond the range of normal human experience.	TRANSCENDENT	Superior or spiritual.	https://drive.google.com/file/d/1reLTupRb-rW0f4rcDkUwjld3QOKykb0f/view?usp=drivesdk
2009	A leader with a high rank in the army.	GENERAL	An important military commander.	https://drive.google.com/file/d/1V3JSuY_gAD_mVV1dHQQTPsjlLvLOaGG2/view?usp=drivesdk
2010	A strong disagreement, often involving a fight.	CONFLICT	A problem between two sides.	https://drive.google.com/file/d/16xBHW1Q-1BDzW-6uBp1WMXl3z8ilXrpd/view?usp=drivesdk
2054	The main meal eaten in the evening.	DINNER	Evening meal.	https://drive.google.com/file/d/19HYKCuNeLNoU5a-4w6_lVVxFSjo5BtXZ/view?usp=drivesdk
2055	A nutrient found in meat, eggs, and beans.	PROTEIN	Essential nutrient.	https://drive.google.com/file/d/1lb7OKy4PgHWBPKlbryYh2AZCNJpxaDxq/view?usp=drivesdk
2095	A specific food item that combines with others to create a dish.	INGREDIENT	Component of a recipe.	https://drive.google.com/file/d/19tqXtP4skxAFQ2OJ4a5HP5JUB0RlD7ea/view?usp=drivesdk
2137	A supportive structure or basic system that provides guidance for development.	FRAMEWORK	A guiding structure.	https://drive.google.com/file/d/1bgq3BK4hdUqhzcaHZTs2ArSF39BB-cXF/view?usp=drivesdk
2181	You sit to work.	DESK	It has a flat top.	https://drive.google.com/file/d/1tOYkN7PhUaWbXxAn7M071jChqI4yCzCW/view?usp=drivesdk
2186	A short time to learn.	LESSON	A teaching period.	https://drive.google.com/file/d/1xdOOIxebf3Qak505gmR7EAHJYItDPdds/view?usp=drivesdk
2240	A set of TV shows or films with the same characters.	SERIES	Many episodes together.	https://drive.google.com/file/d/1U4ShjT01dq7WcI7c4VlrUA53k5VniChP/view?usp=drivesdk
784	A type of plant with a long stem.	flower	Part of the story	https://drive.google.com/file/d/16iaQLZLfw98I-vCVY5P5M_XrZWa7B-mt/view?usp=drivesdk
838	Type of comedy Mr. Bean uses.	farcical	Physical comedy	https://drive.google.com/file/d/1EatXNEd8ItMGcSQNR4yiHnxoIHMj3iJu/view?usp=drivesdk
1734	A tall, dark evergreen tree, often seen in the famous artwork.	CYPRESS	A specific type of tree.	https://drive.google.com/file/d/1KR6DN3nWFc8ocYrdwaM6C-P9Yb71Rjcd/view?usp=drivesdk
842	The number of original episodes	fifteen	A small number of shows	https://drive.google.com/file/d/1y5qiuImFzdx8IrZNbVzZqSnNetzRPZlz/view?usp=drivesdk
1785	A self-propelled road vehicle, typically with four wheels.	AUTOMOBILE	Another word for 'car'.	https://drive.google.com/file/d/1n4HBKdvcncjQQdYimn3ndZR9ddBHOV8G/view?usp=drivesdk
1928	To stop sleeping or become active again.	AWAKENS	Pennywise does this every 27 years.	https://drive.google.com/file/d/18OgB2icZsYydc2n8e4dO30DV2BgV_GME/view?usp=drivesdk
1862	A pleasant arrangement of parts that fit well together.	HARMONY	Things working well together.	https://drive.google.com/file/d/1BWUdipN6cIcmQJhedCrUYSBh4C-FiTOd/view?usp=drivesdk
1966	A perplexing and difficult problem or question.	CONUNDRUM	Intricate puzzle.	https://drive.google.com/file/d/1pCcZv1uvEmSLmH2wZ6SpwjMCZnYc8jc4/view?usp=drivesdk
2013	A place where you buy things.	SHOP	Go here to buy.	https://drive.google.com/file/d/1pYnN0zGHaiZ0f94T3YZrLO3Qp1FS-i4k/view?usp=drivesdk
2012	Present for a friend.	GIFT	Give this to someone.	https://drive.google.com/file/d/1SXmc7_r37mGmW40W6o0_pWY3qnLlVR5R/view?usp=drivesdk
2056	What you taste in food or drink.	FLAVOR	Food taste.	https://drive.google.com/file/d/1B1SPjyrNav_cwH3hLQ3Z9WFTbzK-tbIL/view?usp=drivesdk
2096	Describes food that decays rapidly if not preserved properly.	PERISHABLE	Easily spoils.	https://drive.google.com/file/d/1F6tq74AcEGow80YZA99-GS_zDZ1Ur5Ts/view?usp=drivesdk
2138	The act of performing operations on raw information to extract useful meaning.	PROCESSING	Manipulating raw data.	https://drive.google.com/file/d/1JBmVodmE0ri8hRuM1d5Jnn2j_-TpEuHe/view?usp=drivesdk
2182	Play here outside.	PARK	Has trees and grass.	https://drive.google.com/file/d/16I7TGhAYrhUaM8wezG0tcitIQ_QzGHFo/view?usp=drivesdk
2185	To read and learn.	STUDY	Work to learn.	https://drive.google.com/file/d/1oeBt3fLhTmHMgXimS1qay33r3AL5yBJS/view?usp=drivesdk
2242	Someone who teaches or helps a person prepare for sports.	TRAINER	A coach or instructor.	https://drive.google.com/file/d/13DhePdh2fuWYb7o1W4l8fdhL9EIJSAck/view?usp=drivesdk
2241	A large building or area with seats where people watch games.	STADIUM	Big sports venue.	https://drive.google.com/file/d/1pzij-csyIyLuy3LZGvsWSaY_JIt-ncfR/view?usp=drivesdk
1475	A pleasant feeling of rest and being free from worry.	COMFORT	What you want at home.	https://drive.google.com/file/d/1rN1cNpnQtq9YSm0nzBTXtWf86Q8C10oA/view?usp=drivesdk
1566	Fun machines at the fair.	RIDES	They go up and down.	https://drive.google.com/file/d/1iCcs8nuM-0qpwgb1SVzKx7QiMQP6FcWW/view?usp=drivesdk
1565	Big covers for people.	TENTS	Keep you dry.	https://drive.google.com/file/d/1aDBzL2BNIAJf2qTTHzcVCZq67O36fw72/view?usp=drivesdk
1567	A popular festival drink.	BEER	It is yellow or brown.	https://drive.google.com/file/d/1noWWqjV8wSwt8oB7JuczVJGmsVrxh55A/view?usp=drivesdk
1568	The city for this festival.	MUNICH	A German big city.	https://drive.google.com/file/d/1LxZakNmbOYpMZJ6BMCVY5dQ1Q7oKILLi/view?usp=drivesdk
1732	A place where people with mental health problems received care.	ASYLUM	A historical hospital type.	https://drive.google.com/file/d/1ArY0GqB_IcWKD1dFdcekB07qOo7AL1jA/view?usp=drivesdk
1786	A sudden, dramatic, and widespread change in how something works.	REVOLUTION	Major transformation.	https://drive.google.com/file/d/1LxVAIoOSd8PBKcGWHCsdN4x15XICFdAR/view?usp=drivesdk
1929	The bad character in a story, book, or film.	VILLAIN	Pennywise is one of these.	https://drive.google.com/file/d/1WNe8g-ugT98EN_5H3nQzLvTM1JvKkP7e/view?usp=drivesdk
1863	Stylish and sophisticated in appearance or manner.	ELEGANT	Graceful and refined.	https://drive.google.com/file/d/1UTXzGtBosCGGHXqrbums7o26r6WyjKgQ/view?usp=drivesdk
1968	Profound sympathetic pity and concern for the sufferings of others.	COMPASSION	Empathetic understanding.	https://drive.google.com/file/d/1pIMf8fZ_9AXOmmB7ZU6Sy_Z1OlfrAT9m/view?usp=drivesdk
2015	Give item for money.	SELL	Shops do this.	https://drive.google.com/file/d/130-VvFgCzuxoJNmf1IdL-_BobyLU0Z1h/view?usp=drivesdk
2057	Instructions showing how to cook something.	RECIPE	Cooking guide.	https://drive.google.com/file/d/1Rk43WCEsmW91kriqhB5dwILdgAvJrrOm/view?usp=drivesdk
2097	The natural physical desire to consume food.	APPETITE	Hunger feeling.	https://drive.google.com/file/d/10VmwvupCsU__t3AhSx6epb3O9dodEW7f/view?usp=drivesdk
2139	A set of specific instructions followed to solve a problem or complete a task.	ALGORITHM	Step-by-step process.	https://drive.google.com/file/d/1Ztl2bShOnkJ6Zh1OUoblTVFpDp2jWiGm/view?usp=drivesdk
2183	You read this book.	BOOK	It has many pages.	https://drive.google.com/file/d/1FcCfWPy7aD8h5bs9rEA3cGKPVT7qxRYv/view?usp=drivesdk
2187	A child who goes to school.	PUPIL	A young student.	https://drive.google.com/file/d/11r72KNAU9sOB5RePRgXaQ7TFmRB4WEKW/view?usp=drivesdk
839	Mr. Bean's film release year (first film)	nineteen	Part of 1997	https://drive.google.com/file/d/110UoMNdtrN423vRysgLSpUjhOaOA7u2h/view?usp=drivesdk
2243	A person who plays sports and is often very skilled.	ATHLETE	A sports participant.	https://drive.google.com/file/d/1t3wyDTP5Ay1Q838sON7aSz53sldvXlEn/view?usp=drivesdk
1473	An audio program downloaded to your device, like a radio show.	PODCAST	You listen to it.	https://drive.google.com/file/d/1KU27snuovY7ThxaWlXV9Sy_JOLrNFJoN/view?usp=drivesdk
1569	A paper with ideas.	PLAN	It helps you know what to do.	https://drive.google.com/file/d/1DkB20kdOX4uecuAtf1q1OYFqBOgaTp-y/view?usp=drivesdk
1572	To keep things for later.	STORE	You put items here.	https://drive.google.com/file/d/1fbvWmFYe5Haaa1RvLuZukZ5OpxUHsrTY/view?usp=drivesdk
1733	A small group of houses and buildings, often in the countryside.	VILLAGE	Smaller than a town.	https://drive.google.com/file/d/17oWUFSSBSmJdNj7FYIJ4zu6YVlSmT5OJ/view?usp=drivesdk
1787	A fuel made from petroleum, commonly used in early engines.	GASOLINE	Fuel for many cars.	https://drive.google.com/file/d/1MsCjVeTuqgUtcQ0SsHMV376UzkXCl8I_/view?usp=drivesdk
1930	The sound people make when they find something funny.	LAUGHTER	This often comes with a clown.	https://drive.google.com/file/d/1DlFeJJoq0n6ejsGn3GKJ5eTV3srr_4Og/view?usp=drivesdk
1864	Creative skill shown in making something.	ART	Like painting or drawing.	https://drive.google.com/file/d/178mduNH3fDOIEPVLxgn8irEXYp5Ws5T9/view?usp=drivesdk
1969	The act of being saved from error or sin, a key theme.	REDEMPTION	Salvation from past wrongs.	https://drive.google.com/file/d/1gACOljDeXeXuSZ5jVOhCKcLdPedDutrJ/view?usp=drivesdk
2016	How much money it costs.	PRICE	What you pay.	https://drive.google.com/file/d/1v25XY8NwmPND8RRguvjbCbq9oHg0eDSZ/view?usp=drivesdk
2059	A store where you buy food items.	GROCERY	Food shop.	https://drive.google.com/file/d/1RnIrtiw1u-pJj_ca1VptaNvPxa_CmWWs/view?usp=drivesdk
840	A word to describe Mr. Bean's humor	global	Understood globally	https://drive.google.com/file/d/1mJ76lkv9oKTWjOpwfe11-M6e7CH4tkQW/view?usp=drivesdk
2058	Describes food that is good for your body.	HEALTHY	Good for you.	https://drive.google.com/file/d/1xQqLtH4QBUCwENMOAjvc-m9NbqphcBZf/view?usp=drivesdk
2098	You eat this with butter.	BREAD	A common food made from flour.	https://drive.google.com/file/d/12j6ycbufp7TZiO4qlfr8dVU_t2LqYBo1/view?usp=drivesdk
2099	You make this before baking.	DOUGH	Soft mix for bread.	https://drive.google.com/file/d/1zsibItwkcpSRLugA2cJwFgQUXcUnz-XU/view?usp=drivesdk
2140	The branch of philosophy concerned with the nature of beauty and taste.	AESTHETICS	Study of beauty	https://drive.google.com/file/d/1I1mWLb2MRmBHLe0okmp9YBwffHmeT9Xq/view?usp=drivesdk
2141	To understand the value or significance of a complex work of art.	APPRECIATE	Value art deeply	https://drive.google.com/file/d/11qTMAz5eJgghMDoxDrlICUNO670jNihs/view?usp=drivesdk
2190	A specific piece of work or activity an agent completes.	TASK	Work or assignment.	https://drive.google.com/file/d/1UGI3fyK_ZkI1kPgsB5-xrxVjI7kp3w7d/view?usp=drivesdk
2244	Physical activity you do to stay healthy and strong.	EXERCISE	To work out.	https://drive.google.com/file/d/1bo8D8DXuU13jrLLnaVmuQb9MzJDnf3Ky/view?usp=drivesdk
1476	A disease where your body has too much sugar in its blood.	DIABETES	Linked to high blood sugar.	https://drive.google.com/file/d/1iVS3wfK0VIhu4xkz7WZOMDvMrPrKzHz1/view?usp=drivesdk
1482	The food you eat daily.	DIET	Good food is a good _____.	https://drive.google.com/file/d/1mXe0B2ReqnEB7U_S5n4qwjeFmQryjl1N/view?usp=drivesdk
1570	A piece you can build.	BLOCK	You connect these to make something.	https://drive.google.com/file/d/1Gf3okT1rJDb7tRCMuF_DqD130Zy_84cp/view?usp=drivesdk
1735	He received many letters from the artist, his close relative.	BROTHER	Male sibling.	https://drive.google.com/file/d/18BheNZeNBzOi4pvwG-B55f5L-bsREDCG/view?usp=drivesdk
1788	The introduction of new ideas, methods, or products.	INNOVATION	Creative advancement.	https://drive.google.com/file/d/15ytIsAcj1tidGBZPzjXvNm24TP7RYxyg/view?usp=drivesdk
1931	A strong feeling of fear, shock, or disgust.	HORROR	This genre often includes monsters.	https://drive.google.com/file/d/1S_iFzennjbq6DXJsBHJu4lbMcEQKxYG4/view?usp=drivesdk
1865	A professional cook, especially in a restaurant.	CHEF	He wears a tall hat.	https://drive.google.com/file/d/1BJo0Dql0zgNrQ8dRF75JH6_3wY96ieEB/view?usp=drivesdk
1975	A feeling of excitement or anxiety before something happens.	SUSPENSE	It keeps you on the edge of your seat.	https://drive.google.com/file/d/1NQkS1Tfofe3aeA8erxO-GQR7EdYVoRnt/view?usp=drivesdk
1971	Something unknown or kept secret, like in a book.	MYSTERY	It makes the story exciting.	https://drive.google.com/file/d/1bdwfZElsnYS4TOmkq1q0O-tMXdz9HCFc/view?usp=drivesdk
834	Mr. Bean's cuddly companion.	plushtoy	A stuffed bear	https://drive.google.com/file/d/16rXB8lNVxteM7C2YfZZ0KV_nCwK5SvOr/view?usp=drivesdk
2014	You pay with this.	MONEY	Coins and bills.	https://drive.google.com/file/d/1u5cIMY8PfRgR-iyb8_EnEOEzKLvS4Tz_/view?usp=drivesdk
2017	Kids play with these.	TOYS	Fun things for children.	https://drive.google.com/file/d/12xTREVJ4eP38f7U5k0bTRMv0stM0pVc8/view?usp=drivesdk
2060	The consistency of narrative elements throughout all projects.	CONTINUITY	Keeping the story flowing without contradictions.	https://drive.google.com/file/d/1f1VvB772VasEXp1EeKB07g-fP7qfi7AM/view?usp=drivesdk
2100	You bake food inside this.	OVEN	A hot place for cooking.	https://drive.google.com/file/d/1pvs_aTdG0jzySeEXKujiefBC4I0xJCdk/view?usp=drivesdk
2142	The act of conveying ideas or feelings through artistic creation.	EXPRESSION	Showing feelings	https://drive.google.com/file/d/1foBRLuQKcw1rgETa_pnjVf_ipgrNckiB/view?usp=drivesdk
2191	Different forms of communication an agent processes, like video or sound.	MEDIA	Information types.	https://drive.google.com/file/d/1X7PCnTGjVr0OmhZ_e_9UijHJria7Le-Z/view?usp=drivesdk
2245	To try to win against other people in a game or race.	COMPETE	To play to win.	https://drive.google.com/file/d/1vOL64qRrugJm--IXkhqvgozxw-Op0vB3/view?usp=drivesdk
1477	Feeling worried or anxious; can be bad for your health.	STRESS	Try yoga to reduce it.	https://drive.google.com/file/d/1t6O4ZxEBSX5UDfR4H5hGRh0hM1tepXCy/view?usp=drivesdk
1492	Have fun, like kids.	PLAY	Go outside to _______.	https://drive.google.com/file/d/1KK86mv8vn6gPWh0JcEtu4wM7Ir_zBVfn/view?usp=drivesdk
1571	To make something new.	BUILD	Like with bricks or toys.	https://drive.google.com/file/d/1J3uEXNQMpBEIwINmfgs6baeFESOo3FUr/view?usp=drivesdk
1712	This type of painting shows a person, often their face.	PORTRAIT	The Mona Lisa is a half-length ___.	https://drive.google.com/file/d/1t_L1uyOjYRV6dhoQaHlnz1cfy25iP6NL/view?usp=drivesdk
1741	The control panel with instruments and gauges in a vehicle.	DASHBOARD	Found in front of the driver.	https://drive.google.com/file/d/1Y0tInVLCJDh6GRqUklsaB0fFuGICMyGu/view?usp=drivesdk
1740	A powerful lamp positioned at the front of a vehicle.	HEADLIGHT	Illuminates the road ahead at night.	https://drive.google.com/file/d/1CWMF6svHz8oA6Kb0eF9smFS3dKXtdK-R/view?usp=drivesdk
1790	Operating independently without direct human control, as in driving.	AUTONOMOUSLY	Self-governing operation.	https://drive.google.com/file/d/1jCh-j9gzkVOXvZNiLdBhjoqdJlJihDVB/view?usp=drivesdk
1795	The formal commencement of an entirely new era of personal mobility.	INAUGURATION	Beginning.	https://drive.google.com/file/d/1pZR0ojBI6IgcGnNOIHzmfHs1wbQJDo1O/view?usp=drivesdk
1828	Describing his sound, a synthesis of disparate musical traditions.	AMALGAMATED	Blended	https://drive.google.com/file/d/1N2J2CGQQvj2KCPN2OBZiSYwzOGD9RkW6/view?usp=drivesdk
1829	Describing the King, debilitated by the relentless demands of stardom.	ENERVATED	Exhausted	https://drive.google.com/file/d/1taRl89-7MwpyOIyybZjXibAGclRy3B2C/view?usp=drivesdk
1933	Physical force used to hurt people.	VIOLENCE	The story includes this.	https://drive.google.com/file/d/1PlAGRdZFScCADOwGfZunRWc0ts59zf1s/view?usp=drivesdk
1970	People who suffer because of a crime or bad event.	VICTIMS	Ghostface targets them.	https://drive.google.com/file/d/166b3EliHoLxnaZgtnwKTPB_hJaSmO2jp/view?usp=drivesdk
2018	An organized list of facts or numbers, usually in rows and columns.	TABLES	You can find data organized this way.	https://drive.google.com/file/d/1VRGczfLoOLuD4K0_qbOEXYrats0q5fna/view?usp=drivesdk
2061	A collection of related media products sharing characters and settings.	FRANCHISE	Often includes films and TV shows.	https://drive.google.com/file/d/128I0H_dPLBs5Gxo_lppcEKoi6SuBE-KM/view?usp=drivesdk
2101	Sugar makes things taste this.	SWEET	A very nice taste.	https://drive.google.com/file/d/1oSan5QYfqEEbqkSphD1v6hShJOWHacLC/view?usp=drivesdk
2143	The imaginative power to produce original and innovative artistic works.	CREATIVITY	Artistic imagination	https://drive.google.com/file/d/1Cf9IFyjk1-sAqG3j_oljk-YLMdRssbXK/view?usp=drivesdk
2192	The information or results an artificial intelligence system produces.	OUTPUT	Produced results.	https://drive.google.com/file/d/1GPOHE8qu49ePVB3GI0SX9NXqEucTW5K4/view?usp=drivesdk
2246	A special prize, often a cup, given to the winner of a competition.	TROPHY	A winner's award.	https://drive.google.com/file/d/1-ZBRbXFDyMZstsqPSuwdWTMPyaOsBQeP/view?usp=drivesdk
1478	A regular visit to the doctor to ensure you are well.	CHECKUP	Annual medical examination.	https://drive.google.com/file/d/1TD1sIM2STKKydfYq0ge85ijIsk66s4KF/view?usp=drivesdk
1483	You close your eyes to rest.	SLEEP	It helps your body relax.	https://drive.google.com/file/d/1YQYujZ93hmjK5ygBC87WkAApYrnbpLeh/view?usp=drivesdk
1488	Not bad, but _______.	GOOD	You feel _______ today.	https://drive.google.com/file/d/1HAKG7qFw1QRAhjNvXxVya1ltV4G-n8gN/view?usp=drivesdk
1509	Deliberate measures taken to avert illness or undesirable health outcomes.	PROPHYLAXIS	Prevention	https://drive.google.com/file/d/1rF0l0OWvaKcXmExDJoHaHrJyLao3zXQf/view?usp=drivesdk
1512	The simultaneous manifestation of multiple afflictions within a single organism.	COMORBIDITY	Co-occurring conditions	https://drive.google.com/file/d/1vvceHKJyiPEcAE1k5IGkTpFTqo6dqps9/view?usp=drivesdk
1738	The system in an engine that starts combustion, often with a key.	IGNITION	Where you put the car key to start it.	https://drive.google.com/file/d/1caPITgcJ9ZjpgkcsJDgc7ODbR05D93ea/view?usp=drivesdk
1791	Describing practices that meet current needs without compromising future generations.	SUSTAINABLE	Environmentally enduring.	https://drive.google.com/file/d/1MEqXxhKA-vjYYb73hwKZqcxlLUQujzgw/view?usp=drivesdk
1794	The confluence of communications and computing defining smart vehicle functionality.	TELEMATICS	Car data systems.	https://drive.google.com/file/d/1sedj8PNt8ty8VTzKbVFKEf0VOZBafwSz/view?usp=drivesdk
1830	Serving as an archetypal exemplar of youth culture's metamorphosis.	PARADIGMATIC	Exemplary	https://drive.google.com/file/d/1tMYBkBEeHfmMe0OQahPqlrSxIEKb9ue8/view?usp=drivesdk
1932	A state of being very mentally ill or insane.	MADNESS	Jack fell into this.	https://drive.google.com/file/d/16AXpzVs27b82vBf9delk_8rFamyIIPon/view?usp=drivesdk
1973	Clothes or makeup that hide who you really are.	DISGUISE	Ghostface wears one.	https://drive.google.com/file/d/1lT-HryWJcLCDgw8B9h8-VhpfR5VGgW7i/view?usp=drivesdk
2023	Smaller groups that are part of a larger collection.	SUBSETS	Some items chosen from a bigger group.	https://drive.google.com/file/d/1BwaiS4IzZ1LTFgD1TNITJdKtIEvsmUQa/view?usp=drivesdk
2019	A strong bag that can be carried on your back.	KNAPSACK	You might put your lunch in one for a hike.	https://drive.google.com/file/d/1QV-s0aYe4-gyLqXvEOIlNaTyDQKAyYx2/view?usp=drivesdk
2062	The carefully planned approach for developing interconnected films.	STRATEGY	A method for achieving a goal.	https://drive.google.com/file/d/1HChXoW0TcQLWm4UoHFiUiPZUkfV7zpF2/view?usp=drivesdk
2103	This person makes yummy bread.	BAKER	A person who bakes.	https://drive.google.com/file/d/1NI4LqOGU7k1kQv0b9lOg6osGHWeY7b4G/view?usp=drivesdk
2102	This is a birthday dessert.	CAKE	Often eaten at celebrations.	https://drive.google.com/file/d/12m145tXpNVTc0eNGVl-tnHP14D4p0UHH/view?usp=drivesdk
2144	The way in which art is seen, understood, or interpreted.	PERCEPTION	Understanding art	https://drive.google.com/file/d/1rm-lK5Dvvqg9_F-qn5m1OtULPxZpUqoG/view?usp=drivesdk
2193	To combine various data types into a unified whole for understanding.	INTEGRATE	Combine elements.	https://drive.google.com/file/d/1dk_fz1L31PkD4EKkKwZgAWVr6i5kcuPz/view?usp=drivesdk
2248	You follow these written steps to make a meal.	RECIPE	Cooking guide	https://drive.google.com/file/d/1Rk43WCEsmW91kriqhB5dwILdgAvJrrOm/view?usp=drivesdk
2247	When food is good for your body, it is this.	HEALTHY	Good for you	https://drive.google.com/file/d/1xQqLtH4QBUCwENMOAjvc-m9NbqphcBZf/view?usp=drivesdk
2252	Sweet food often enjoyed after a main course.	DESSERT	Sweet treat	https://drive.google.com/file/d/1yjjXDhTrU2619Hzqx1Ql31rl3CSBYKVT/view?usp=drivesdk
1479	Important part of a healthy diet, like oats or rice.	GRAINS	Often found in bread.	https://drive.google.com/file/d/1zW4-moUj2GfEYe1hGa2vvqKd66Cly4tJ/view?usp=drivesdk
1510	The intricate biological mechanism underlying disease inception and progression.	PATHOGENESIS	Disease origin	https://drive.google.com/file/d/1Li8WZQcMYn0KXypmWyHPHuS5fJahuzPs/view?usp=drivesdk
1511	The therapeutic abatement of mental distress and apprehension through various modalities.	ANXIOLYSIS	Anxiety reduction	https://drive.google.com/file/d/1Gccs9-GKgL8TweX71YVDwT0ltQRwxU-7/view?usp=drivesdk
1574	The small pieces of a thing.	PARTS	A car has many of these.	https://drive.google.com/file/d/12lmzs4y6dwccihw2qU-vdEwMRMbB7oQ7/view?usp=drivesdk
1573	What something can do.	DOES	It shows its action.	https://drive.google.com/file/d/1E1dadKbXWK_SRn1X3PPRh-JTvbnPeWRw/view?usp=drivesdk
1739	A self-propelled passenger vehicle that moves on wheels.	AUTOMOBILE	Another word for a car.	https://drive.google.com/file/d/1n4HBKdvcncjQQdYimn3ndZR9ddBHOV8G/view?usp=drivesdk
1792	The efficiency and capability with which an engine or system functions.	PERFORMANCE	Operational output.	https://drive.google.com/file/d/19BJVuS_2bDmR3wNO52xS_73ATGnXKg7f/view?usp=drivesdk
1796	The continual process of enhancement improving vehicle performance and safety features.	AMELIORATION	Improvement.	https://drive.google.com/file/d/1vVrZfU_1qg4NjLUoAWDicLUij4UuNcZ1/view?usp=drivesdk
1831	Pervasively present; emblematic of his omnipresent cultural impact.	UBIQUITOUS	Everywhere	https://drive.google.com/file/d/19yQI3Nwn_neVwdkOjYRwggHd2QEJWUJB/view?usp=drivesdk
1934	A very strong feeling of fear.	TERROR	What the family felt.	https://drive.google.com/file/d/1_bLN3S2AN0akOPxcXy300mg-KNFD8_O9/view?usp=drivesdk
1974	Someone who takes another person's life.	KILLER	Often scary in movies.	https://drive.google.com/file/d/1LtNG3ip7sMM9tJbqAiymludyO0AShB-u/view?usp=drivesdk
2020	A specific way or system used to solve a problem.	METHOD	A step-by-step approach.	https://drive.google.com/file/d/18QZszC6tIkaF-K-fhu7KYYRj5PqSE601/view?usp=drivesdk
2063	An iconic character possessing extraordinary abilities.	SUPERHERO	Many in the MCU wear capes or special suits.	https://drive.google.com/file/d/1x9j8RwHL0YmUODJoo3SQTQVkyTIUzGeO/view?usp=drivesdk
2104	You play this for fun.	GAME	Many kids love these.	https://drive.google.com/file/d/1Fmf-nBtAoJBgFs604ZblbBASUeWE08af/view?usp=drivesdk
2105	Send a message on computer.	EMAIL	It goes very fast.	https://drive.google.com/file/d/1Ox7IuiYb7_XVwEG2sTy8S1MemzTS4jSO/view?usp=drivesdk
863	The opposite of 'child'.	adult	Mature, adult	https://drive.google.com/file/d/1cDJRbCv6bjaQbRmMUgnsa_vZNPDuq23A/view?usp=drivesdk
864	Something unsuitable.	improper	Not proper or acceptable	https://drive.google.com/file/d/1NYR3EdrOzDwtVHj0_FCIAa0pjnQkYBfw/view?usp=drivesdk
862	Material for grown-ups only.	grown	For mature audiences	https://drive.google.com/file/d/1yBqJ3UoxscxiBX9w5xlenIGX-53mpMAM/view?usp=drivesdk
865	Secret, hidden.	close	Not for public viewing	https://drive.google.com/file/d/18bVvr3VC8-F2ZKAQskqUpApY8xLzJA9d/view?usp=drivesdk
868	Not allowed for kids.	message	Material or subject matter	https://drive.google.com/file/d/17ZJQZ_464p_2vH3ZFrSd6d9UuPBhKCJK/view?usp=drivesdk
861	Something not suitable for work.	nsfw	Inappropriate for the workplace	https://drive.google.com/file/d/1-smgZ-ZJmPRKkZv8XL9qHTp3vtLnvJT8/view?usp=drivesdk
867	Something forbidden.	illegal	Not allowed	https://drive.google.com/file/d/1kzUm_d1eo4NxPhrxIFp-17dqMPiXufAN/view?usp=drivesdk
866	A type of movie.	movie	A motion picture	https://drive.google.com/file/d/1yhwmszdntoNumlk8LBTi_lnVB-7b7tmE/view?usp=drivesdk
2145	A public show where various works of art are displayed for viewing.	EXHIBITION	Art display event	https://drive.google.com/file/d/18-1ozgLSEpyau8eiEnh7fwfWCAXU09eE/view?usp=drivesdk
2194	Distinct channels or forms of sensory information an agent processes.	MODALITIES	Input types.	https://drive.google.com/file/d/1G8caxowrhMC63bnYlpVo8z2I0Ri3WPi-/view?usp=drivesdk
2251	This feeling tells you that your body needs food.	HUNGER	Empty stomach	https://drive.google.com/file/d/1z861novH7pUasKklGaJ4Vpfs9Udb_Fxl/view?usp=drivesdk
1480	A condition of being very overweight and unhealthy.	OBESITY	Can be caused by bad eating habits.	https://drive.google.com/file/d/1tmZGvhUTslYabFRJFrR5dNFXNUWBxzNH/view?usp=drivesdk
1491	You eat this every day.	FOOD	Apple, bread, rice are all ______.	https://drive.google.com/file/d/1c8Dk8PimjbTIEsTCQpd6Wh1HtQm6g5hj/view?usp=drivesdk
1737	The system supporting a vehicle, absorbing shocks from the road.	SUSPENSION	Smooths out bumps while driving.	https://drive.google.com/file/d/17TBD-fLZwmZfQDkN91FDV5OOkwZY93G1/view?usp=drivesdk
1793	The capability of devices to link and exchange information seamlessly.	CONNECTIVITY	Digital linking.	https://drive.google.com/file/d/1bpFAh07Lb8jcEqyfc3457bmvGjTZnz2v/view?usp=drivesdk
1797	The strategic effort to lessen environmental impact through innovative propulsion systems.	MITIGATION	Reduction.	https://drive.google.com/file/d/1TYUt9aD__WI4XTdaFBlbT09gLN1y3y9W/view?usp=drivesdk
1832	Epithet for an artist whose unorthodox performance shattered prevailing norms.	ICONOCLASTIC	Rule-breaker	https://drive.google.com/file/d/1KwJAUAUuG3tLzQQ7ZNeCZw0R26NzfpEO/view?usp=drivesdk
1935	Having special powers to know things.	PSYCHIC	Danny had this ability.	https://drive.google.com/file/d/1QkWu7uzFbrL63Llju4UKIwuAZHdLz6Oy/view?usp=drivesdk
1937	Invisible beings, like ghosts, in the hotel.	SPIRITS	They influenced Jack.	https://drive.google.com/file/d/1YIWIXvdUX7yDJh7BjhzPbyXUhegI_p64/view?usp=drivesdk
1972	The action of hurting someone because they hurt you.	REVENGE	A common motive for killers.	https://drive.google.com/file/d/12ZGkhBsScwjQpSB0J0zWy8auezWoQHDG/view?usp=drivesdk
2021	A rectangular arrangement of numbers or symbols.	MATRIX	Like a grid of values.	https://drive.google.com/file/d/1uSqte-0Sr_qrBxhDVCq1nugF8E4CFBJ0/view?usp=drivesdk
2064	The expansive, fictional setting where all MCU stories occur.	UNIVERSE	It's where heroes and villains meet.	https://drive.google.com/file/d/1XnooykuFqmx24meY4JvppY0NhFZmq_S4/view?usp=drivesdk
2106	What you watch on a computer.	SCREEN	It shows pictures.	https://drive.google.com/file/d/1WHOU7pW209CEniga12VgRCvsa9_rKR9n/view?usp=drivesdk
869	A boy who lives with his aunt and uncle.	harass	The main character's name	https://drive.google.com/file/d/1isGYT-BrqHncB0xQhehYArvpOSqEB8Sv/view?usp=drivesdk
873	The opposite of happy.	pensive	Feeling unhappy	https://drive.google.com/file/d/1cvnheGg6Gt5M0Keoxzd5vKV1DB4ZzGS1/view?usp=drivesdk
871	A place where magic is learned.	educate	Harry goes to this place	https://drive.google.com/file/d/1LRbyHKyvmsmfqS1ndqdXThWlST-aEeo_/view?usp=drivesdk
872	Something used for writing.	compose	Writing instrument	https://drive.google.com/file/d/1IVfaPtAfd0GhXry6L7kHmjNuG3r2aN2K/view?usp=drivesdk
870	A type of magic.	putter	Part of the main character's name	https://drive.google.com/file/d/1FyoX9lN4JR3tm1dx9w0eQeIwiIDWYg1U/view?usp=drivesdk
2146	The range or extent of subjects covered in a particular academic program.	SCOPE	Broad view	https://drive.google.com/file/d/1FrWO6MTHNx4cEBEgpg5kG_uq26c_dKTa/view?usp=drivesdk
2148	A specific aim or desired result that a student or lesson intends to achieve.	OBJECTIVE	Learning goal	https://drive.google.com/file/d/16A1CZR76zjNad-CxLtGsMWD0T2JJMMH1/view?usp=drivesdk
2195	You eat this with butter.	BREAD	A common food made from flour.	https://drive.google.com/file/d/12j6ycbufp7TZiO4qlfr8dVU_t2LqYBo1/view?usp=drivesdk
2196	You put food on this.	PLATE	You eat your dinner from this.	https://drive.google.com/file/d/1XhxoIRtYDhGlomyoV_ChZwLdnrkUA4vY/view?usp=drivesdk
2202	A device with moving parts that does work.	MACHINE	It can be big or small.	https://drive.google.com/file/d/1jcYzejmQY9P2S2TFFBtP5RukEs_HIPOi/view?usp=drivesdk
2250	Your desire or wish to eat food at a meal.	APPETITE	Desire to eat	https://drive.google.com/file/d/10VmwvupCsU__t3AhSx6epb3O9dodEW7f/view?usp=drivesdk
1481	Physical movement, like walking or sports, good for health.	ACTIVITY	Exercise is a form of this.	https://drive.google.com/file/d/1rdEd58oR2kWrHBcmXRKTTnJxGZBaUj6K/view?usp=drivesdk
1490	Sleep or sit still.	REST	Take a _______ after play.	https://drive.google.com/file/d/1F3bZ_lzbqBC9_oi6R9FUJ3PDpfgUuY61/view?usp=drivesdk
1742	Gases or fumes released into the atmosphere, often from vehicle engines.	EMISSIONS	Environmental concern from exhaust.	https://drive.google.com/file/d/1ikBT6jgeBnviYo1hoUyd9iY2kYktssAf/view?usp=drivesdk
1748	Yellow powder that helps flowers make seeds.	POLLEN	Carried by bees.	https://drive.google.com/file/d/1DAheZxDhQu5xA8XCftryq0ZuP3NAdsXp/view?usp=drivesdk
1743	Flowers help plants achieve this, avoiding death.	SURVIVAL	Staying alive.	https://drive.google.com/file/d/1iR3H38194hoeE0vOeW-G1K35hWmAMA3m/view?usp=drivesdk
1798	The state of being linked or interconnected, crucial for modern smart vehicle systems and communication.	CONNECTIVITY	Digital links.	https://drive.google.com/file/d/1bpFAh07Lb8jcEqyfc3457bmvGjTZnz2v/view?usp=drivesdk
1801	The system or force that drives a vehicle forward, such as electric motors or internal combustion engines.	PROPULSION	Driving force.	https://drive.google.com/file/d/10qKP8E8EljeZz4T1daP1jqlwaN1J-too/view?usp=drivesdk
1804	The dynamic process of introducing novel concepts or methodologies.	INNOVATION	Breakthrough ideas.	https://drive.google.com/file/d/15ytIsAcj1tidGBZPzjXvNm24TP7RYxyg/view?usp=drivesdk
1809	The meticulous process of improving or perfecting a design or system.	REFINEMENT	Enhancement process.	https://drive.google.com/file/d/120gwhudZ83a5a53Q_JrD9ZLHU7oLg7Zz/view?usp=drivesdk
1833	The spectacular return to prominence following a period of decline.	RESURGENCE	Revival	https://drive.google.com/file/d/1X_51-JCjVyCkiZI_MAiNEMvI_l9x4Loq/view?usp=drivesdk
1936	Jack Torrance's job before becoming caretaker.	WRITER	He tried to create stories.	https://drive.google.com/file/d/1bPlrIJqF9dsxZhhn3BHPxo4XpEWuLYHl/view?usp=drivesdk
876	The soft sound a happy cat makes in its throat.	whir	A cat's happy rumble.	https://drive.google.com/file/d/1rD0Lb8S7j6fcg5pbxEj28E3vMbh6-Q5r/view?usp=drivesdk
874	A common furry house animal that says 'meow'.	vomit	A popular pet.	https://drive.google.com/file/d/1vP2zxcjhhGlIkvm6VFwiRPvSTy9SL8MV/view?usp=drivesdk
877	Describes something beautiful, charming, or very pleasing to look at, like a sweet animal.	pretty	Very nice or pretty.	https://drive.google.com/file/d/1nHwiUyFAU5w0NW2VobrCn_90QTJ5JAYw/view?usp=drivesdk
875	A very small or young cat.	babycat	A baby cat.	https://drive.google.com/file/d/1bkU5yqkQOkDd3_np-Chv353ky7MYkCw6/view?usp=drivesdk
1976	The intricate process of restoring vital functions to an organism thought deceased.	REANIMATION	Revival.	https://drive.google.com/file/d/12Q0vphkWBhiaWc4jfevty1ev1rRm7h0F/view?usp=drivesdk
1978	An utterance of a solemn curse, often invoking divine wrath or misfortune.	MALEDICTION	Anathema.	https://drive.google.com/file/d/1A5rOsUEVRTdieaCsOBqUiZGZbyhWfQmi/view?usp=drivesdk
2022	The process of thinking about future actions and how to do them.	PLANNING	Before a trip, you do a lot of this.	https://drive.google.com/file/d/1F_WIfmKGTsvOShnaPfXaiOitf-ToWgaW/view?usp=drivesdk
2065	The natural home or environment of an animal or plant.	HABITAT	Animal's living place.	https://drive.google.com/file/d/1RnyrUiV3vaKXMlNA2fg12chZ9IbYJSNT/view?usp=drivesdk
2070	Describing an animal that feeds on both plants and other animals.	OMNIVOROUS	Eats everything.	https://drive.google.com/file/d/1JUnR5wWg7IoHGQvz7F55Y0-pb8gZCyHi/view?usp=drivesdk
2066	The seasonal movement of animals from one region to another.	MIGRATION	Long journey for seasons.	https://drive.google.com/file/d/1GKoEQYLvdL9qfyBoxSLVW0JehOcH8tbl/view?usp=drivesdk
2107	Your computer keeps facts.	DATA	It is information.	https://drive.google.com/file/d/1cOacqMSynF06MbmRNcYw4cNA1Gg40yVU/view?usp=drivesdk
2147	A strong preference or prejudice that can affect fair judgment in education.	BIAS	Unfair lean	https://drive.google.com/file/d/1Jn51d__d48V9VokNrJ56AGbs_AT-gw4i/view?usp=drivesdk
2197	You use water for this.	DRINK	What you do with juice or milk.	https://drive.google.com/file/d/15i-GHcEetJ-IDOcNxQqnKqKLOvgFXr1B/view?usp=drivesdk
2205	A set of instructions for a computer or robot.	PROGRAM	It tells the machine what to do.	https://drive.google.com/file/d/1gZAPr-pfGN2x7taKIFFInqfuHfXAYmLh/view?usp=drivesdk
2249	This is the room in a house where you prepare meals.	KITCHEN	Cooking place	https://drive.google.com/file/d/16VmRTzZpX89q2LbBbGpDkc596jQuwF0k/view?usp=drivesdk
1484	Being strong and not sick.	HEALTH	It's good to feel this way.	https://drive.google.com/file/d/1w90jkfBf1IlbDniJFZbrsxRaW5CP_PIf/view?usp=drivesdk
1513	The academic discipline rigorously investigating human movement and its physiological underpinnings.	KINESIOLOGY	Study of movement.	https://drive.google.com/file/d/1XaqRibpNY_gyYWHGNFa9_eNxIMYWAdM3/view?usp=drivesdk
1544	Stop something from getting in.	BLOCK	Close the path.	https://drive.google.com/file/d/1Gf3okT1rJDb7tRCMuF_DqD130Zy_84cp/view?usp=drivesdk
1541	A chance of something bad.	RISK	Danger.	https://drive.google.com/file/d/1RMMfEkQ3Ll3n7vEXy8rBgVDrWCBuTtoe/view?usp=drivesdk
1539	Keep something safe from harm.	GUARD	Watch over.	https://drive.google.com/file/d/1z8T5NjrNBklcIHh5q1PbtHHQAZqgfYy8/view?usp=drivesdk
1576	A country or big area.	LAND	Where people live.	https://drive.google.com/file/d/1hs7C9TICxim3LYNx_RIiVtZQA97qiDUc/view?usp=drivesdk
1575	A happy look on your face.	SMILE	You do this when glad.	https://drive.google.com/file/d/1q14EpdadB_IRJa5mwl5LMFaFeEaPUrVz/view?usp=drivesdk
1745	Flowers have changed and developed over millions of years.	EVOLVED	Changed over time.	https://drive.google.com/file/d/1FGVxs3VaRgyafFuTca5ry5kFFLTJxBeY/view?usp=drivesdk
1799	The process of introducing novel ideas or methods, significantly advancing the automobile industry.	INNOVATION	Breakthroughs.	https://drive.google.com/file/d/15ytIsAcj1tidGBZPzjXvNm24TP7RYxyg/view?usp=drivesdk
1807	Describing practices that meet current needs without compromising future generations.	SUSTAINABLE	Environmentally enduring.	https://drive.google.com/file/d/1MEqXxhKA-vjYYb73hwKZqcxlLUQujzgw/view?usp=drivesdk
1835	From a time long, long ago; very old.	ANCIENT	Opposite of modern.	https://drive.google.com/file/d/10dBwfh6oFWMpKIBdAnkxvQ_Rfypt61-b/view?usp=drivesdk
1834	An old trade route connecting China with the West.	SILKROAD	Famous trade path.	https://drive.google.com/file/d/1ZegEdwsVk-HXRKc_QCrBLO2rOMaHQIZn/view?usp=drivesdk
1938	Makes you feel afraid.	SCARY	Feeling fear.	https://drive.google.com/file/d/1m7pOVsaUes5c9CU7DbI8YrBO0Stc6wWg/view?usp=drivesdk
1977	Just recompense or requital for an offense committed; a severe punishment.	RETRIBUTION	Vengeance.	https://drive.google.com/file/d/1lve2JQ2-Na9VxUjtKcPUcVqbHAvTFtMx/view?usp=drivesdk
2024	Soft hair on an animal.	FUR	A warm coat for skin.	https://drive.google.com/file/d/1g6XHJrGRDUIsAb9LmQhb0aHN0ykVhWDM/view?usp=drivesdk
2067	An animal that is hunted and killed by another for food.	PREY	Often eaten.	https://drive.google.com/file/d/1VE88wRxzGioDrj76CTb-V2cHzkKlqtnh/view?usp=drivesdk
2108	A place to save your work.	FILE	Like a digital paper.	https://drive.google.com/file/d/1snU1SJ7o5hK245LAOanGVA5xYpaRUelK/view?usp=drivesdk
2149	The systematic process of evaluating student performance or understanding in school.	ASSESSMENT	Grading method	https://drive.google.com/file/d/1Hzf_Z45RltIGJC5T4lbteuGIWhZ2NI_i/view?usp=drivesdk
2198	Candy and cakes are like this.	SWEET	The opposite of sour or bitter.	https://drive.google.com/file/d/1oSan5QYfqEEbqkSphD1v6hShJOWHacLC/view?usp=drivesdk
2203	Parts of a robot that detect light, heat, or movement.	SENSORS	They help robots feel the world.	https://drive.google.com/file/d/1d6DY8xwl2mU6zwjyV97XFzCVRzfEi_td/view?usp=drivesdk
2253	The soft, colourful parts that make up a flower.	PETALS	Flower's showy parts.	https://drive.google.com/file/d/1eLGj5OEhxDqvH8JWoC1a80OgXpJvy4_I/view?usp=drivesdk
1485	A person who helps sick people.	DOCTOR	Go see them for a check.	https://drive.google.com/file/d/1OlV07slFwwIpc1Sny9t3bCCp005w1bCM/view?usp=drivesdk
1489	This is your whole self.	BODY	Head, arms, legs are parts of your _______.	https://drive.google.com/file/d/1a95kfSdkziXRL6FkbN8ORMGNnxCbcyPu/view?usp=drivesdk
1514	Measures rigorously implemented to prevent the onset or progression of disease.	PROPHYLAXIS	Preventive action.	https://drive.google.com/file/d/1rF0l0OWvaKcXmExDJoHaHrJyLao3zXQf/view?usp=drivesdk
1540	Not in danger or hurt.	SAFE	Away from harm.	https://drive.google.com/file/d/1Bsmp6PRIyPU0X_qlOTQTTOTddd6Ze27P/view?usp=drivesdk
1577	Trees, rivers, and animals.	NATURE	The outside world.	https://drive.google.com/file/d/1KLKdvqDs81NU58qZfq7MjL0F5EmzMdsO/view?usp=drivesdk
1744	These bright parts of a flower attract insects.	PETALS	Often colorful.	https://drive.google.com/file/d/1eLGj5OEhxDqvH8JWoC1a80OgXpJvy4_I/view?usp=drivesdk
1800	A manufacturing process where products move sequentially through various workstations, enhancing production.	ASSEMBLYLINE	Ford's method.	https://drive.google.com/file/d/1CAMAFher6STxJvHkuv7VH425d5j1f4W0/view?usp=drivesdk
1806	The seamless integration of disparate systems, particularly in modern vehicles.	CONNECTIVITY	Digital linking.	https://drive.google.com/file/d/1bpFAh07Lb8jcEqyfc3457bmvGjTZnz2v/view?usp=drivesdk
1836	This tool helps sailors find direction at sea.	COMPASS	North, South, East, West.	https://drive.google.com/file/d/1Y0tG53dC79d2pQuZfaDI-WHvZaZivfn6/view?usp=drivesdk
1940	Use it to call.	PHONE	Call a person.	https://drive.google.com/file/d/1MfgWg2JqrNCiQKmA4Moiu8hcbLaG-UCO/view?usp=drivesdk
1939	You watch this on a screen.	MOVIE	A film to watch.	https://drive.google.com/file/d/1yhwmszdntoNumlk8LBTi_lnVB-7b7tmE/view?usp=drivesdk
1979	An ancient priest or mystic, often interpreting arcane rites or esoteric mysteries.	HIEROPHANT	Initiate.	https://drive.google.com/file/d/1p27QQ2kZa5humkCC_HzBQJYHd12N_5o8/view?usp=drivesdk
1984	The underlying basis or principle upon which complex digital systems are built.	FOUNDATION	The bedrock of modern communication.	https://drive.google.com/file/d/1gjPkavupps_E0BjOmXyDpkcGSahAvIhl/view?usp=drivesdk
1985	The act of enhancing network efficiency for superior operational performance.	OPTIMISATION	Improving system effectiveness.	https://drive.google.com/file/d/1b6s6w-qJ8s96avJeJ62L5eYBMpy1Fttf/view?usp=drivesdk
2025	Like water on skin.	WET	After a bath.	https://drive.google.com/file/d/1hE_AefpfLr6Ea5EEWQgAroVecVDZZM20/view?usp=drivesdk
2068	To adjust to new conditions or a different environment.	ADAPT	Change over time.	https://drive.google.com/file/d/18xji94XuHNUR11lNfq8rWSBD0bjCSzSN/view?usp=drivesdk
2109	You move this with your hand.	MOUSE	It often has two buttons.	https://drive.google.com/file/d/1V_j_tzSFyfezbxxbXeU_AXVK7k3bFjN_/view?usp=drivesdk
2150	A basic conceptual structure used for organizing educational content or policy.	FRAMEWORK	Guiding structure	https://drive.google.com/file/d/1bgq3BK4hdUqhzcaHZTs2ArSF39BB-cXF/view?usp=drivesdk
2199	A red or green fruit.	APPLE	It can keep the doctor away.	https://drive.google.com/file/d/1KHqso_Kgq4cHepHl0AZRbKPiKoin-yjW/view?usp=drivesdk
2206	The time that is coming next, after today.	FUTURE	We don't know what it will bring.	https://drive.google.com/file/d/1huA0suKUeA1NKeahEulwR2Cd0O1oazF1/view?usp=drivesdk
2201	The ability to direct or manage something.	CONTROL	You have power over it.	https://drive.google.com/file/d/17l3bVdQoIFmSJLEK4FwIAlCFPaxDSNX1/view?usp=drivesdk
2254	The natural process of a plant getting larger and developing.	GROWTH	Getting bigger.	https://drive.google.com/file/d/1tuwHa9v5glVJvCWEwMmoYIl0qsv_4AGR/view?usp=drivesdk
1486	Sweet food like an apple.	FRUIT	It grows on trees.	https://drive.google.com/file/d/1LrAhnp80YV3GkOjNvVrlUx63IL4pDw3f/view?usp=drivesdk
1518	An orientation focusing on intrinsic factors sustaining human health and well-being.	SALUTOGENIC	Health-centric approach.	https://drive.google.com/file/d/1fKdqJfXQaNiXboA6hQZksoHva_7MRg6l/view?usp=drivesdk
1515	The medical science identifying and applying treatments for illness and injury.	THERAPEUTICS	Medical treatments.	https://drive.google.com/file/d/1vbj5pMpH5RGZ6SwKZPdL8-DcYHTYQ4Q4/view?usp=drivesdk
1542	Look at things closely.	WATCH	Use your eyes.	https://drive.google.com/file/d/1h28ucuJWQKKgI8gHlAVLWJeBEDX1znIf/view?usp=drivesdk
1580	A living thing, like a pet.	ANIMAL	Elephants are this.	https://drive.google.com/file/d/1H2C4urmjmKH__Rt3gF6zqzfpJe4NvO1d/view?usp=drivesdk
1578	Feeling good and glad.	HAPPY	The opposite of sad.	https://drive.google.com/file/d/1S9uRWfPZnfvdw-NvFjCwFp-_j2mcXOII/view?usp=drivesdk
1746	These are the male parts inside a flower.	STAMENS	They produce pollen.	https://drive.google.com/file/d/1H-zJm2MCP2jimQYxFVrAsGSIGoArP_kN/view?usp=drivesdk
1802	Describing vehicles capable of operating independently without human control, utilizing sophisticated AI.	AUTONOMOUS	Self-driving.	https://drive.google.com/file/d/1s5mWuzDOlnNV1ffMsQA8dVgP3B08EYXa/view?usp=drivesdk
1805	Operating independently without direct human control, particularly in vehicles.	AUTONOMOUS	Self-governing.	https://drive.google.com/file/d/1s5mWuzDOlnNV1ffMsQA8dVgP3B08EYXa/view?usp=drivesdk
1837	Large areas of land controlled by one ruler or country.	EMPIRES	Big kingdoms.	https://drive.google.com/file/d/12AIOTVD-VR4b1J117zwLnZdw_Z42uu-G/view?usp=drivesdk
1941	You wear this on your face.	MASK	Covers your face.	https://drive.google.com/file/d/1nw-ocACVIJzsrGgePpYRH3YSeMADa4wj/view?usp=drivesdk
1980	The egregious act of violating something sacred or revered, such as a burial site.	DESECRATION	Profanation.	https://drive.google.com/file/d/1HrTZMx76KOJO-KzKG8He56HyjLrv7h26/view?usp=drivesdk
1982	The fundamental design and structure that enables sophisticated network functionality.	ARCHITECTURE	The blueprint of a robust system.	https://drive.google.com/file/d/11QlFhtKkIgSkTm1xGLojHIvgGFMc9piV/view?usp=drivesdk
2026	Not small, very large.	BIG	Like an elephant.	https://drive.google.com/file/d/1UKQ8DY0xv4W4X-7Zl6L4ht9SwJ0r5Y1C/view?usp=drivesdk
2069	The complete disappearance of a species from Earth.	EXTINCTION	No longer existing.	https://drive.google.com/file/d/1MDeaRQujggMWfT16JVuZVpkcW_bejyZG/view?usp=drivesdk
2110	This animal has black stripes.	TIGER	A large striped cat.	https://drive.google.com/file/d/1cuXO_PIPsUIpp8vBBUb7B8KvyhCBn7vX/view?usp=drivesdk
2151	A carefully planned approach to achieve an educational goal or objective.	STRATEGY	Plan of action	https://drive.google.com/file/d/1HChXoW0TcQLWm4UoHFiUiPZUkfV7zpF2/view?usp=drivesdk
2200	To make food with heat.	COOK	What you do in the kitchen.	https://drive.google.com/file/d/1lqv0i8I1B1A0gJoBYgaR10RXCciY35i2/view?usp=drivesdk
2204	A person who designs and builds new technology.	ENGINEER	They create things like robots.	https://drive.google.com/file/d/14IMxV9ofbLuitngCpdJE0fuzlg5zw1rC/view?usp=drivesdk
2256	When flowers open up and show their colours fully.	BLOOMS	When a flower opens.	https://drive.google.com/file/d/1mpSKPjStXh9jIjacSTVJ0yEYgMSeUC4V/view?usp=drivesdk
2255	A fine, yellow powder found inside flowers, carried by bees.	POLLEN	Yellow flower powder.	https://drive.google.com/file/d/1DAheZxDhQu5xA8XCftryq0ZuP3NAdsXp/view?usp=drivesdk
1487	Moving your legs to go.	WALK	A simple exercise.	https://drive.google.com/file/d/1-IccW2GUw6T4AzOcwNNyM7-rulf_dhmD/view?usp=drivesdk
1516	The amelioration of symptoms or distress; a definitive cure being infeasible.	PALLIATION	Symptom relief.	https://drive.google.com/file/d/1NOO9chfaMtcFNMhKwAlv-Fl0YPy_otP4/view?usp=drivesdk
1543	A bad program for computers.	VIRUS	Makes computers sick.	https://drive.google.com/file/d/1TY0yPHYuikT4ynkUkohsmNoNQ4iySdMX/view?usp=drivesdk
1579	A spot or an area.	PLACE	Thailand is a nice _____.	https://drive.google.com/file/d/1RWox31i1Ib5jLUzQPjg0SbbaCFKQPoZv/view?usp=drivesdk
1714	This house shows old art.	MUSEUM	Place for art.	https://drive.google.com/file/d/1hX4RFBY3cpPPeUqYuohQqwwwtgx_Fb5K/view?usp=drivesdk
1747	The period when fruit trees are covered with flowers.	BLOSSOM	Happens in spring.	https://drive.google.com/file/d/1o8g5T9TLTVv16O-vjiu6Zed3WjTjBPCr/view?usp=drivesdk
1803	How well a car executes its functions, encompassing speed, handling, and overall operational efficacy.	PERFORMANCE	Vehicle capability.	https://drive.google.com/file/d/19BJVuS_2bDmR3wNO52xS_73ATGnXKg7f/view?usp=drivesdk
1808	The judicious use of resources to achieve maximum productivity with minimal waste.	EFFICIENCY	Optimal resource use.	https://drive.google.com/file/d/1RPHvxNnoyhyV8tQK1OnhrvFrglw24sc5/view?usp=drivesdk
1838	A series of rulers from the same family.	DYNASTY	Royal family.	https://drive.google.com/file/d/1o83JBvkppQR8BLgCg2da2W12ZcHEcEb-/view?usp=drivesdk
1942	A white, floating spirit.	GHOST	Not a real person.	https://drive.google.com/file/d/1-TCve89FvycTiGH_dmY1saiOdPUTjzwO/view?usp=drivesdk
1981	A formal prohibition or ban, typically imposed by authoritative decree.	INTERDICTION	Prohibition.	https://drive.google.com/file/d/1C60HwLnRdJ8XPVJeXklfZ03eXjqfUv_Z/view?usp=drivesdk
1983	The state of being able to link various systems and devices digitally.	CONNECTIVITY	Essential for global digital interaction.	https://drive.google.com/file/d/1bpFAh07Lb8jcEqyfc3457bmvGjTZnz2v/view?usp=drivesdk
2027	To put food in mouth.	EAT	Animals do this.	https://drive.google.com/file/d/1M2N03KT8JjGYwDejNriNSL6RHPcBKO66/view?usp=drivesdk
2029	A small body of water.	POND	Ducks swim here.	https://drive.google.com/file/d/1JunSeJaXk6vKM9PCwCE0lWlVnI-ZLCn6/view?usp=drivesdk
2076	A big old house.	CASTLE	CA_TLE	https://drive.google.com/file/d/1Ek8WiFAOAacdhWPXwVvxs6UAQ2y_yXGJ/view?usp=drivesdk
2071	To move in the air.	FLYING	FL_ING	https://drive.google.com/file/d/1B9BUMKHWtQ8mvFXOhGDmio3vvR3r0Spq/view?usp=drivesdk
2111	A big furry forest animal.	BEAR	Eats honey.	https://drive.google.com/file/d/18FSti5Kl0-AlD1EGUjKwb2UI5ob71IzN/view?usp=drivesdk
2157	Heroes often do this action.	FIGHT	Punch and kick.	https://drive.google.com/file/d/1FcgkrXRLC5Vh8Smawhpb1n1J7r5gFQyx/view?usp=drivesdk
2152	Many people work together.	TEAM	Not alone.	https://drive.google.com/file/d/1LYY4sbu1ktd-puL5Ye0W4gK9mF4E0KEM/view?usp=drivesdk
2160	A prevailing system of knowledge or understanding within a specific era.	EPISTEME	Knowledge system	https://drive.google.com/file/d/1pl1AKfbBG1xVklMvT9q11uq6XKo29D2X/view?usp=drivesdk
2207	The soft, fleshy interior of a fruit, often juicy.	PULP	Inner fruit part.	\N
2216	The soft, fleshy part inside many fruits.	PULP	Soft part	https://drive.google.com/file/d/1makBE_CRDe_vDbthCTfKLNUnDUAG8xhr/view?usp=drivesdk
2257	A shop or person who sells and arranges different flowers.	FLORIST	Sells flowers.	https://drive.google.com/file/d/1LNO5KzLw4TfG4_ubS1kWTpjgUcwif5vE/view?usp=drivesdk
1493	Move legs slowly.	WALK	Not run, but _______.	https://drive.google.com/file/d/1-IccW2GUw6T4AzOcwNNyM7-rulf_dhmD/view?usp=drivesdk
1517	The intricate biological origin and progressive development of a specific disease.	PATHOGENESIS	Disease development.	https://drive.google.com/file/d/1Li8WZQcMYn0KXypmWyHPHuS5fJahuzPs/view?usp=drivesdk
1545	It helps you do something.	USEFUL	Something that is good to have.	https://drive.google.com/file/d/1lTmaMD1fFaInNDXho0kfdPX-H5uxyYrb/view?usp=drivesdk
1581	You get the prize.	WIN	To be first.	https://drive.google.com/file/d/1V6-dCOyjlEEhcPtsANaQNZPYMVbVMkB4/view?usp=drivesdk
1717	Vermeer was from this country.	DUTCH	From Holland.	https://drive.google.com/file/d/1DIMJxNN0KpIJfLOCG0bkgjTyX8Txubhq/view?usp=drivesdk
1750	Another word for a flower, especially on a fruit tree.	BLOSSOM	In ______.	https://drive.google.com/file/d/1o8g5T9TLTVv16O-vjiu6Zed3WjTjBPCr/view?usp=drivesdk
1749	Small creatures like bees that help flowers reproduce.	INSECTS	Many have wings.	https://drive.google.com/file/d/1DcV3UEl-WOTZ5iA7MW833lFk2U48RIdH/view?usp=drivesdk
1756	Sweet liquid collected from flowers by bees to make honey.	NECTAR	Bees turn this into their food.	https://drive.google.com/file/d/1e_L8JX5IjRgDKQGSXwDqDatrhBBn0S61/view?usp=drivesdk
1757	The sharp part of a bee that can cause pain if it stings you.	STINGER	Used for defense against danger.	https://drive.google.com/file/d/18pEW_k-qwDdD24FtJUuZh236DaLk3_2Y/view?usp=drivesdk
1839	Military leaders who control different areas.	WARLORDS	Fighting chiefs.	https://drive.google.com/file/d/1wY-lbe5Vlg8-UWJn9ADL18248yckEoKC/view?usp=drivesdk
1943	Run after someone quickly.	CHASE	Go after fast.	https://drive.google.com/file/d/1jM3EfL5WXnuc7nEX5wq9TqfZxk1mOVDf/view?usp=drivesdk
1986	The consistent performance and unwavering dependability of a complex network system.	RELIABILITY	Trustworthiness in operation.	https://drive.google.com/file/d/1dPdLMR4Dd1yol5dXhyKySQldQvHSQx2G/view?usp=drivesdk
2028	Move in the water.	SWIM	Fish can do this.	https://drive.google.com/file/d/1jS9ENuaQ4lBw4KJkiB7ZmpjV-KBUkzCr/view?usp=drivesdk
2072	A person you like much.	FRIEND	FRI_ND	https://drive.google.com/file/d/130qdTT0sEu0E9ADka0AIwEAdP39YiDka/view?usp=drivesdk
2113	Fish do this in water.	SWIM	Move in water.	https://drive.google.com/file/d/1jS9ENuaQ4lBw4KJkiB7ZmpjV-KBUkzCr/view?usp=drivesdk
2112	A big yellow cat.	LION	King of the jungle.	https://drive.google.com/file/d/1RcUmbwi-InNvJENuRG2t-NZC6O-KDIwU/view?usp=drivesdk
2153	To help someone in danger.	SAVE	What heroes do.	https://drive.google.com/file/d/1zpuFAISV3sV8UOnngcRQ7Vk9ub4KP_Ne/view?usp=drivesdk
2159	An intuitive, experiential approach to problem-solving, not guaranteed optimal.	HEURISTIC	Rule of thumb	https://drive.google.com/file/d/1SThkC2KSKBmzhpojUf6WjULClxPlGmSW/view?usp=drivesdk
2209	The season or act of gathering ripe crops, especially fruits.	HARVEST	Picking time.	\N
2212	Essential substances like vitamins and minerals found abundantly in fruits.	NUTRIENTS	Healthy compounds	https://drive.google.com/file/d/1PUN8NmMy2ROMCCP9ScHKIp40SuhGwWLL/view?usp=drivesdk
2258	An outdoor area where people grow plants and flowers.	GARDEN	Place for plants.	https://drive.google.com/file/d/1UBT3zt5XHvjCsqMjsoPiBLirqwYJNyn9/view?usp=drivesdk
1494	A physical and mental practice mentioned for reducing tension and improving well-being.	YOGA	A meditative exercise.	https://drive.google.com/file/d/1CAK6_ihPWnzxAtES4dM1i-f39RL47wAP/view?usp=drivesdk
1498	Describing a type of fat molecule with at least one double bond, considered healthy.	UNSATURATED	Healthy fat characteristic.	https://drive.google.com/file/d/1PZu6WdORuM8HFZjRXcKigBoBWvQSdgum/view?usp=drivesdk
1520	A medical professional qualified to practice medicine, often a general doctor.	PHYSICIAN	Doctor	https://drive.google.com/file/d/1BBlvqCPgX56OTkMzNQDMEPNFHksgjxlM/view?usp=drivesdk
1519	A carefully planned approach or method to achieve a goal.	STRATEGY	Tactic	https://drive.google.com/file/d/1HChXoW0TcQLWm4UoHFiUiPZUkfV7zpF2/view?usp=drivesdk
1550	Animals you have at home.	PETS	Like a cat or a dog.	https://drive.google.com/file/d/1AWvmMkrsec7l7DfzYHq9mn5xW5xV8vJp/view?usp=drivesdk
1546	A small part inside a house.	ROOM	Like a bedroom or kitchen.	https://drive.google.com/file/d/1r1CJEKJ9wtkJpVokNadtSESRC2ZVjJ9f/view?usp=drivesdk
1582	What you want to get.	GOAL	Your dream.	https://drive.google.com/file/d/1SdSz0LPcBpWhsy5ZKmuUy7_9RLCFomzW/view?usp=drivesdk
1715	She wears this hat on her head.	TURBAN	A special head cover.	https://drive.google.com/file/d/1nETjeBzmJQ6Gvcdz1VDFpsTY86GnAbLs/view?usp=drivesdk
1751	The main job or purpose of something, like a flower.	FUNCTION	What it does.	https://drive.google.com/file/d/1u7nC8a7OsHtEKPj9d0In0NYY7ri836-R/view?usp=drivesdk
1758	A large group of bees living together in a hive.	COLONY	They live as a big community.	https://drive.google.com/file/d/10ItL5IpuizHWUfh45wN623a_h81U56FK/view?usp=drivesdk
1754	A colorful plant part that bees visit for food.	FLOWER	Often smells nice and attracts insects.	https://drive.google.com/file/d/16iaQLZLfw98I-vCVY5P5M_XrZWa7B-mt/view?usp=drivesdk
1840	An optical component used to frame and focus a photographic composition.	VIEWFINDER	What you look through.	https://drive.google.com/file/d/1AoRhGXrkTzfwhT6CYWN2jB0Oza3aHhoR/view?usp=drivesdk
1878	It has wings.	BIRD	It can fly.	https://drive.google.com/file/d/1GMu_8vHu1LFtTN9ZIxybX9fLaKcrtTsa/view?usp=drivesdk
1883	A pet that barks.	DOG	It says woof.	https://drive.google.com/file/d/1-FAVbwNO-GROZTPBEGvJFb3Od1DcPT3o/view?usp=drivesdk
1947	Rick Grimes worked as this police officer before the world changed.	SHERIFF	Local police boss.	https://drive.google.com/file/d/1IYUNKexWDyo0JgQj8k1JTv-WXVsXxSV1/view?usp=drivesdk
1944	The name given to the undead creatures in this story.	WALKERS	Slow-moving monsters.	https://drive.google.com/file/d/1AQYOrul6hOMr7Qxwky0k-tRFEMz_hsIv/view?usp=drivesdk
1987	The process of sending data or signals across an advanced communication channel.	TRANSMISSION	Moving information from one point to another.	https://drive.google.com/file/d/1RFO7I5MPrnprIoc583LNGovjWox5pLNZ/view?usp=drivesdk
2030	A common breakfast food often eaten with milk.	CEREAL	Morning grains.	https://drive.google.com/file/d/1TORB2ftKgyJNYHysDJD7BIAEQqjpQWhv/view?usp=drivesdk
2034	A shop where you buy food and household items.	GROCERY	Food store.	https://drive.google.com/file/d/1RnIrtiw1u-pJj_ca1VptaNvPxa_CmWWs/view?usp=drivesdk
2073	A magic word to use.	SPELL	S_ELL	https://drive.google.com/file/d/1fYghFN1SxuMEy9qNPIiB9c0_SYPFO_98/view?usp=drivesdk
2114	Birds use these to fly.	WINGS	What birds have.	https://drive.google.com/file/d/13DKBBOxsIwsDPzMJ3ysY9--Cj1Hn_c0K/view?usp=drivesdk
2154	A hero wears this on face.	MASK	To hide identity.	https://drive.google.com/file/d/1nw-ocACVIJzsrGgePpYRH3YSeMADa4wj/view?usp=drivesdk
2158	A state of continuous transformation or instability within a dynamic system.	FLUX	Constant change	https://drive.google.com/file/d/15BNHQNVjJEylTKacuvsUxlbDJntVSkvg/view?usp=drivesdk
2163	Discrete, indivisible units of energy or matter at the subatomic level.	QUANTA	Quantum units	https://drive.google.com/file/d/1C8p5ffFcworpPl4tb3i1qvQIp7Alb1X9/view?usp=drivesdk
2210	The process of obtaining essential food for health and growth.	NUTRITION	What healthy food provides.	\N
2213	Food and drink providing strength and health, which fruits reliably offer.	SUSTENANCE	Basic food source	https://drive.google.com/file/d/1GKJ-AL02DG0ho-c_cCTgVnD_b_9FhetB/view?usp=drivesdk
2259	A university's teaching staff, or an academic department within the institution.	FACULTY	Teachers or division.	https://drive.google.com/file/d/1ES17MoIO-TVtkveTKPd8KNn3fbBT_15n/view?usp=drivesdk
1495	A medical condition characterized by excessive body fat accumulation.	OBESITY	Being very overweight.	https://drive.google.com/file/d/1tmZGvhUTslYabFRJFrR5dNFXNUWBxzNH/view?usp=drivesdk
1521	The ability to sustain physical or mental effort for extended periods.	ENDURANCE	Stamina	https://drive.google.com/file/d/1gtc5rNufaStp3y2YWaJ-Bomht6antfsd/view?usp=drivesdk
1547	To make food to eat.	COOK	You do this in the kitchen.	https://drive.google.com/file/d/1lqv0i8I1B1A0gJoBYgaR10RXCciY35i2/view?usp=drivesdk
1752	Representing an idea or quality, like a red rose for love.	SYMBOLIC	Has a meaning.	https://drive.google.com/file/d/1TclxByo_GE8-p-Qd_v2YepDxgOi7ZDtf/view?usp=drivesdk
1755	The female bee that does most of the jobs in the hive.	WORKER	Not the queen or a male bee.	https://drive.google.com/file/d/1tRAA0d5Ag6_njK70Jlu2jBuxcSITtC-k/view?usp=drivesdk
1841	A thing that has been replaced or succeeded by another.	PREDECESSOR	Camera obscura's role.	https://drive.google.com/file/d/1Bpv5EQBNzR1nrEk8Xo8SV-6KyayA7Rzv/view?usp=drivesdk
1879	It lives in water.	FISH	It can swim.	https://drive.google.com/file/d/13n4wwMBX3BNSULZpBhr1vVDm1D5R2VPT/view?usp=drivesdk
1945	A situation where harm or injury is possible.	DANGER	Not safe.	https://drive.google.com/file/d/1j7LFnNIVKfD1Gl5i1fLLRdBfAP1zBTsK/view?usp=drivesdk
1988	The pivotal essence of an effective security protocol.	CRUX	Core element.	https://drive.google.com/file/d/1o6K5dWzsBuFPg95SSvChOM7iwzVyD9ra/view?usp=drivesdk
2031	Food that is good for your body and helps you stay strong.	HEALTHY	Good for you.	https://drive.google.com/file/d/1xQqLtH4QBUCwENMOAjvc-m9NbqphcBZf/view?usp=drivesdk
2074	You read stories in this.	BOOK	B_OK	https://drive.google.com/file/d/1FcCfWPy7aD8h5bs9rEA3cGKPVT7qxRYv/view?usp=drivesdk
2115	People can ride this animal.	HORSE	A farm animal.	https://drive.google.com/file/d/1RpnEs5zCieZ5qiWP86RMH5gKHjCxmSRp/view?usp=drivesdk
2155	Special strength or ability.	POWER	A hero's magic.	https://drive.google.com/file/d/1rFnIrP94LUc4ITvMVSeTg9WCbPpvzMuI/view?usp=drivesdk
2162	The theory of interpretation, especially of complex scientific discourse.	HERMENEUTICS	Interpretive method	https://drive.google.com/file/d/1OIRxJecq68x0q-3onTVXC_tUurFUECIL/view?usp=drivesdk
2208	A type of acidic fruit with a thick skin, like oranges and lemons.	CITRUS	Zesty fruit category.	\N
2214	The outer skin of some fruits, often removed before eating.	PEEL	Fruit's skin	https://drive.google.com/file/d/1FTH9GbPJg6mXxKY46toy2URpEDpLmtlt/view?usp=drivesdk
2260	Systematic investigation to establish facts and reach new conclusions at university.	RESEARCH	Academic study.	https://drive.google.com/file/d/1hub1ZfaIarsTa7UDCZQmKCq587plLAEp/view?usp=drivesdk
2261	An academic qualification awarded after successfully completing university study.	DEGREE	Your final certificate.	https://drive.google.com/file/d/1Whfd3PNiMnthE9EP5lbBwR6OVU2wMxLD/view?usp=drivesdk
1496	The healthcare professional responsible for your general medical check-ups.	PHYSICIAN	Your main doctor.	https://drive.google.com/file/d/1BBlvqCPgX56OTkMzNQDMEPNFHksgjxlM/view?usp=drivesdk
1522	A metabolic disease causing high blood sugar due to insulin issues.	DIABETES	Blood sugar disorder	https://drive.google.com/file/d/1iVS3wfK0VIhu4xkz7WZOMDvMrPrKzHz1/view?usp=drivesdk
1548	A building where you live.	HOUSE	It has walls and a roof.	https://drive.google.com/file/d/1hXzw7Aa97tQRX9w0YjmPVxgELqpOdPM_/view?usp=drivesdk
1701	To make something new, like a character or a story.	CREATED	Made	https://drive.google.com/file/d/1G-JBWN-NZxh_Mx7VW3-3-CDmPuXvVhof/view?usp=drivesdk
1718	The artist uses this for his art.	PAINT	A colorful liquid.	https://drive.google.com/file/d/1hQGm5zSXad6bNvHMEuzE_tKwIIVemCR0/view?usp=drivesdk
1713	She is the young person in the picture.	GIRL	Young female.	https://drive.google.com/file/d/1ncey1vZfMtQ5dG9QOvOST6Bxo14Emmiq/view?usp=drivesdk
1716	This white jewel is on her ear.	PEARL	A round, shiny gem.	https://drive.google.com/file/d/1Q9uxnZnVJuethabq1N2aeTczPLlxu9YR/view?usp=drivesdk
1753	The colorful parts of a flower that attract insects.	PETALS	Often soft.	https://drive.google.com/file/d/1eLGj5OEhxDqvH8JWoC1a80OgXpJvy4_I/view?usp=drivesdk
1842	A photographic film coating, often made of gelatin with silver halides.	EMULSION	Light-reactive layer.	https://drive.google.com/file/d/1-dgEnZMz6Lt4qA2ISvMs8IhLHPEorDG3/view?usp=drivesdk
1880	A hen lays it.	EGG	You can eat it.	https://drive.google.com/file/d/1UWwqNYW3cA8aKr9OLYSi9RGe1XoDR6VR/view?usp=drivesdk
1946	The act of staying alive in a very difficult situation.	SURVIVAL	Living through hard times.	https://drive.google.com/file/d/1iR3H38194hoeE0vOeW-G1K35hWmAMA3m/view?usp=drivesdk
1032	Scooby and his friends solve these problems.	puzzle	A puzzle to solve	https://drive.google.com/file/d/121jHCvRB_fWIVEDtGXtECFBB0cs99kxy/view?usp=drivesdk
1991	A surreptitious or abrupt digital penetration by an unauthorized entity.	INCURSION	Invasive entry.	https://drive.google.com/file/d/1B8UfP8xMf_jd5zBKecZlPtu361LNlMSg/view?usp=drivesdk
1989	A conspicuous void or critical oversight in a system's defenses.	LACUNA	Missing piece.	https://drive.google.com/file/d/1xWX46Wo1ALG975zzy1xkqsGJYWox44AW/view?usp=drivesdk
2032	Instructions that tell you how to cook a dish.	RECIPE	Cooking guide.	https://drive.google.com/file/d/1Rk43WCEsmW91kriqhB5dwILdgAvJrrOm/view?usp=drivesdk
2075	A small stick for magic.	WAND	W_ND	https://drive.google.com/file/d/1l1HATyMypL_nDa2-Kr8KFSKEZ8g_jkKw/view?usp=drivesdk
2116	A short piece of music.	SONG	You can learn words for this.	https://drive.google.com/file/d/1QhPdlRa5Jb6Aed5hnYRcuzzUXxrsszfd/view?usp=drivesdk
2120	Move your body to music.	DANCE	People do this at parties.	https://drive.google.com/file/d/1ifIT_nFWT1xmSNKqv6D86mHaloSOC6Ja/view?usp=drivesdk
2156	Another name for a movie.	FILM	You watch it.	https://drive.google.com/file/d/1HSH8eLxbUprrS7dhf04nj-gJGpxmNr8y/view?usp=drivesdk
2161	The philosophical study concerning purpose or ultimate causes in natural phenomena.	TELEOLOGY	Study of purpose	https://drive.google.com/file/d/1FQmcl1jvPjRJGErAngqURuGpMakFkVmV/view?usp=drivesdk
2211	Describes fruits that thrive in warm, humid climates, like mangoes.	TROPICAL	Warm climate fruits.	\N
1497	Mental or emotional strain often linked to various health disorders.	STRESS	A feeling of pressure.	https://drive.google.com/file/d/1t6O4ZxEBSX5UDfR4H5hGRh0hM1tepXCy/view?usp=drivesdk
1523	A common mental health disorder characterized by persistent sadness and loss of interest.	DEPRESSION	Melancholy	https://drive.google.com/file/d/1jCOnHhiP5A7sZJ06cMqgrsvPlIkwASkC/view?usp=drivesdk
1549	A place with fields and animals.	FARM	Where cows and pigs live.	https://drive.google.com/file/d/1dPAHHrFDCktB08tjNZQC4s5TCurf49Ol/view?usp=drivesdk
2215	The season or act of gathering ripe fruits from plants.	HARVEST	Collecting season	https://drive.google.com/file/d/10RH7pYPcbGui-SnRkcBSHREiHTUefnY-/view?usp=drivesdk
2262	A senior administrator, often head of a specific university department or college.	DEAN	University leader.	https://drive.google.com/file/d/1ZE4GbSWTG9o1t9-8Ym0tL4RJq54ijB-K/view?usp=drivesdk
1702	When a person unlawfully kills another person.	MURDERS	Kills	https://drive.google.com/file/d/1VXfimkI2RgNqhRG2i2v8teJeH5f1h-Vr/view?usp=drivesdk
1759	Yellow dust bees carry that helps plants make seeds.	POLLEN	It is important for plant reproduction.	https://drive.google.com/file/d/1DAheZxDhQu5xA8XCftryq0ZuP3NAdsXp/view?usp=drivesdk
1760	To attack a large, strong building.	STORM	Like a strong wind.	https://drive.google.com/file/d/1a3jMO2NNRkr_mRKP0ZNbd8O6F982sgze/view?usp=drivesdk
1843	Pertaining to historical records, often requiring long-term preservation.	ARCHIVAL	Keeping old photos safe.	https://drive.google.com/file/d/1UJucBy-mYQZflhUzyIl5UjQWK_3E9W8X/view?usp=drivesdk
1881	A farm animal.	COW	It gives milk.	https://drive.google.com/file/d/1GZHYNzWxNT0UE5ZukkvnOv1HLN_LRXKH/view?usp=drivesdk
1033	The group travels in the Mystery _____.	truck	Their vehicle	https://drive.google.com/file/d/1Vyamx73E-OWXrw41m1Nq19eTb_xhrj8n/view?usp=drivesdk
1948	A strong feeling of fear, often used to describe this type of story.	HORROR	Scary movie feeling.	https://drive.google.com/file/d/1S_iFzennjbq6DXJsBHJu4lbMcEQKxYG4/view?usp=drivesdk
1990	The scrupulous tracing of data's origin, crucial for its unassailable integrity.	PROVENANCE	Source record.	https://drive.google.com/file/d/17fk42a1HyQqGxlrIPVZ1uSCAUUUW5O2y/view?usp=drivesdk
2033	A substance in food that helps your body grow.	NUTRIENT	Body builder.	https://drive.google.com/file/d/1lYUJyZBWPiQBWUkTUS8uoMbLHtzgc_c-/view?usp=drivesdk
2077	A common term for a self-propelled road vehicle with an engine.	AUTOMOBILE	Another word for a car.	https://drive.google.com/file/d/1n4HBKdvcncjQQdYimn3ndZR9ddBHOV8G/view?usp=drivesdk
2078	The panel in front of the driver, displaying instruments and controls.	DASHBOARD	Where gauges are.	https://drive.google.com/file/d/1Y0tInVLCJDh6GRqUklsaB0fFuGICMyGu/view?usp=drivesdk
2117	Many people play music together.	BAND	A group that performs music.	https://drive.google.com/file/d/1jLS3H_YvHNsMuJTWtr8pjYbe7jQBe6Yn/view?usp=drivesdk
2164	Hot liquid food in a bowl.	SOUP	Good to eat when cold.	https://drive.google.com/file/d/1UHn6Six0UeS106LksrvMkoMjcc83JnES/view?usp=drivesdk
2165	A white drink from a cow.	MILK	Good for your bones.	https://drive.google.com/file/d/1HnKuC0JDzIPF0ai4pHKmXBsYpmP5Z0oi/view?usp=drivesdk
2217	Small round fruit, often purple.	GRAPE	Grows on a vine	https://drive.google.com/file/d/11HXjS0sp9zRJzJ7ZGfTqKRRYi5FT7cET/view?usp=drivesdk
2218	This fruit is yellow or green.	PEAR	Like an apple's cousin	https://drive.google.com/file/d/17fP7UNPf-cGGQBP2j9H-lebMeTlp7uut/view?usp=drivesdk
2227	You use this to buy things.	MONEY	Coins and bills.	https://drive.google.com/file/d/1u5cIMY8PfRgR-iyb8_EnEOEzKLvS4Tz_/view?usp=drivesdk
1500	A common and serious medical illness negatively affecting how one feels and acts.	DEPRESSION	Mood disorder.	https://drive.google.com/file/d/1jCOnHhiP5A7sZJ06cMqgrsvPlIkwASkC/view?usp=drivesdk
1524	The quality of being able to move or be moved freely.	MOBILITY	Movement ability	https://drive.google.com/file/d/11_op4Xf6gMyimJqbMRznrGRLq1GfyLmf/view?usp=drivesdk
1551	To make a car go.	DRIVE	You do this with a car.	https://drive.google.com/file/d/1uV_5crsAeCwiP4tvUpz8QNyBwcGvgUjY/view?usp=drivesdk
1553	Cars move on this.	ROAD	It is long and hard.	https://drive.google.com/file/d/1gL13Wnzog6csigdwFt72fSIIpF-PQJ-3/view?usp=drivesdk
2264	Everything in the world not made by people, including plants and animals.	NATURE	The environment around us.	https://drive.google.com/file/d/1KLKdvqDs81NU58qZfq7MjL0F5EmzMdsO/view?usp=drivesdk
2263	The fine yellow powder found inside flowers, carried by bees.	POLLEN	It helps new flowers to grow.	https://drive.google.com/file/d/1DAheZxDhQu5xA8XCftryq0ZuP3NAdsXp/view?usp=drivesdk
1703	A full-length film, usually shown in cinemas.	FEATURE	Movie	https://drive.google.com/file/d/1yC2NFevekPf55byrZ6CMfteKmQXd44Qw/view?usp=drivesdk
1709	The well-known museum in Paris where it is displayed.	LOUVRE	It's a very famous art gallery.	https://drive.google.com/file/d/1IRd7rhmeloT5aDKVGrzJQ1nFr_z4U81p/view?usp=drivesdk
1762	Big fights between different groups.	WARS	Soldiers fight in these.	https://drive.google.com/file/d/19XzAZ32dQhLwmGGp3_TkjigOAwI2Hroa/view?usp=drivesdk
1761	The country where this story happens.	FRANCE	It's a European country.	https://drive.google.com/file/d/1Yr-EhXbcw7KcUBUzPM3HVnHtdkSGrYWd/view?usp=drivesdk
1844	Made a material reactive to light through a chemical process.	SENSITIZED	Plate preparation step.	https://drive.google.com/file/d/1UKKIbxK8IkgQFecNKm-if5RRLUWCgKlK/view?usp=drivesdk
1882	A small furry pet.	CAT	It likes milk.	https://drive.google.com/file/d/1SKHrVWSjAOQOOWbwNA8yVCcsf89QnNkE/view?usp=drivesdk
1035	The name of the talking dog in the show.	pet	Famous dog	https://drive.google.com/file/d/1kFFHOEDdvUiSLwdjGnS-Vp23T7I7ULDa/view?usp=drivesdk
1949	What happened to civilization when the disaster began.	COLLAPSE	To fall apart.	https://drive.google.com/file/d/12ymLnL0ZUJVvddpCQn6eTgeTQZZtCwIG/view?usp=drivesdk
1992	To utterly eradicate malicious software from compromised digital infrastructure.	EXTIRPATE	Root out.	https://drive.google.com/file/d/1_LFZDLPmOsSXfJIRVWLN2ZACJN1o9wsd/view?usp=drivesdk
2035	A sweet course eaten at the end of a meal.	DESSERT	After dinner treat.	https://drive.google.com/file/d/1yjjXDhTrU2619Hzqx1Ql31rl3CSBYKVT/view?usp=drivesdk
2079	Gases released into the air from a car's exhaust system.	EMISSION	Car pollution.	https://drive.google.com/file/d/1xy3duYwkJo7-ZT2T2u6_JBZXUwY-66Vs/view?usp=drivesdk
2118	A big musical keyboard.	PIANO	You press white and black keys.	https://drive.google.com/file/d/1TH8SS3VBa61xOUqXbVVXuhqg-6kEjnfy/view?usp=drivesdk
2166	Sweet food for a party.	CAKE	Often has candles on it.	https://drive.google.com/file/d/12m145tXpNVTc0eNGVl-tnHP14D4p0UHH/view?usp=drivesdk
2219	You drink this from fruits.	JUICE	Fruit drink	https://drive.google.com/file/d/1R6vRDEzTX-sEyIfLR_MtnHrMN125rzHP/view?usp=drivesdk
2223	A big place with many homes.	CITY	New York is one.	https://drive.google.com/file/d/1Wg-KFLZR3OBmgYSqm0LwqNq_YAs6cLRf/view?usp=drivesdk
2228	You do this for money.	WORK	It's your job.	https://drive.google.com/file/d/1lp8LvAYRG-84zMT_UQ3J1LBWCm82_zo4/view?usp=drivesdk
2265	A place outside where many different plants and flowers grow.	GARDEN	You might plant seeds here.	https://drive.google.com/file/d/1UBT3zt5XHvjCsqMjsoPiBLirqwYJNyn9/view?usp=drivesdk
1499	Describing an action or medicine primarily intended to prevent disease or illness.	PROPHYLACTIC	Preventive measure.	https://drive.google.com/file/d/1CVKBtFwKgoAU8iyZbEoDN4ezv4FOeJR0/view?usp=drivesdk
1552	Stop and leave your car.	PARK	Place for cars to wait.	https://drive.google.com/file/d/16I7TGhAYrhUaM8wezG0tcitIQ_QzGHFo/view?usp=drivesdk
1708	Leonardo da Vinci's home country was ______.	ITALIAN	He was a famous ___ painter.	https://drive.google.com/file/d/1qtkTKLfC2omWMPqY2wDB_MaQHSMKj9hQ/view?usp=drivesdk
1704	The most important or main part of something.	PRIMARY	Main	https://drive.google.com/file/d/1R8ntQ-IIUGYLgdHfOTjYiO97TUW18VkY/view?usp=drivesdk
1763	Many men, women, and children.	PEOPLE	Everyone living in a place.	https://drive.google.com/file/d/1CJ0yhjfpx9eSnYyCGJy1UxxLAvCWNahO/view?usp=drivesdk
1951	Something you wear on your face.	MASK	Can hide who you are.	https://drive.google.com/file/d/1nw-ocACVIJzsrGgePpYRH3YSeMADa4wj/view?usp=drivesdk
1950	A fun place to stay outside.	CAMP	Often has tents and a fire.	https://drive.google.com/file/d/1tg9boeGudX8x1zvR6_4ww9QJ2UG6LovZ/view?usp=drivesdk
1034	The franchise also has many shows and _____.	show	Movies	https://drive.google.com/file/d/1S9avXWFjNrHs7Vj02cH_Yx4o8XYY-Z-X/view?usp=drivesdk
1885	Some animals eat this green thing.	PLANT	Food for many animals.	https://drive.google.com/file/d/1_cGiMKpOGFk-1xWYpUkln-Id2da29eYD/view?usp=drivesdk
1884	What an animal does every day.	LIVES	To be alive.	https://drive.google.com/file/d/11C5zPdjC31dqx2mlhV6Zoh-XtLLBu3Iy/view?usp=drivesdk
1894	A small creature with six legs, like a bee or an ant.	INSECT	A common bug.	https://drive.google.com/file/d/1ck1enobTK-MUPQfvArfSc7qAKwvrADoY/view?usp=drivesdk
1993	The protective patronage or support afforded by robust cybersecurity measures.	AEGIS	Protective shield.	https://drive.google.com/file/d/1NcVVdrPmmc0UZpUCepSaQKRP8DpOmL6h/view?usp=drivesdk
2037	You play this for fun.	GAME	Kids like this on a tablet.	https://drive.google.com/file/d/1Fmf-nBtAoJBgFs604ZblbBASUeWE08af/view?usp=drivesdk
2036	It is bright, not dark.	LIT	The screen is always ___.	https://drive.google.com/file/d/1zv5FlVknAkBpVxNmeUqlDzoKOTN0JDkC/view?usp=drivesdk
2080	The system in a car that helps drivers find their way to a destination.	NAVIGATION	Map guidance.	https://drive.google.com/file/d/1xEddTdeVM6ssivbPiWpGlxxH8M3FadkR/view?usp=drivesdk
2119	Make sounds using your voice.	SING	You do this with your mouth.	https://drive.google.com/file/d/185-0dhfaINb_nRoQ-pgcO8WnQudDJ5US/view?usp=drivesdk
2167	You make toast from this.	BREAD	Often eaten with butter.	https://drive.google.com/file/d/12j6ycbufp7TZiO4qlfr8dVU_t2LqYBo1/view?usp=drivesdk
2220	A red or green round fruit.	APPLE	Common tree fruit	https://drive.google.com/file/d/1KHqso_Kgq4cHepHl0AZRbKPiKoin-yjW/view?usp=drivesdk
1502	A complex biological response to harmful stimuli, often causing redness and swelling.	INFLAMMATION	Body's defensive reaction.	https://drive.google.com/file/d/1BNQBUn-wer-KJtnW6rlTVRL_pAkLWBcR/view?usp=drivesdk
2224	To be the boss.	LEAD	Show the way for others.	https://drive.google.com/file/d/1cDE4IENpGBRVidzoF96qbshMlXs6y-yb/view?usp=drivesdk
1554	You pay to ride here.	TAXI	Often yellow car.	https://drive.google.com/file/d/1PTnVCDrAOGjAT47VUk_fU8gfyC-BVVhY/view?usp=drivesdk
1558	A special planned day or party.	EVENT	A happening or celebration.	https://drive.google.com/file/d/105_FPaElwaEzcAxKzfUp4CnJtAAIEyXy/view?usp=drivesdk
2266	The soft, colorful parts of a flower that attract insects.	PETALS	They often have bright colors.	https://drive.google.com/file/d/1eLGj5OEhxDqvH8JWoC1a80OgXpJvy4_I/view?usp=drivesdk
1705	Took the place of someone or something else.	REPLACED	Swapped	https://drive.google.com/file/d/1bTnOTHZnI7aYzxhpXIupldoImwN88uIz/view?usp=drivesdk
1764	The ruler of the country then.	KING	He wears a crown.	https://drive.google.com/file/d/1hHiOwE2AmBLgYIX_8z3O2JGwrscZzct9/view?usp=drivesdk
1952	Dark time after the day.	NIGHT	You can see the stars then.	https://drive.google.com/file/d/14zBun0K77A_H6t-Nhj8PToVmitTlZNxw/view?usp=drivesdk
1886	Animals need it to eat.	FOOD	What you eat.	https://drive.google.com/file/d/1c8Dk8PimjbTIEsTCQpd6Wh1HtQm6g5hj/view?usp=drivesdk
1892	An animal that hunts and kills other animals for its food.	PREDATOR	A hunter animal.	https://drive.google.com/file/d/11wVnB0IW6_H3g1FGQWsL6wOfxJ3N1ad0/view?usp=drivesdk
1994	A set of connected parts that work together.	SYSTEM	Computer ________.	https://drive.google.com/file/d/17pEHnMVKeRkSPYHgzH2Ri4I8veOkNAMS/view?usp=drivesdk
1996	A method or series of actions to achieve a goal.	PROCESS	Step-by-step method.	https://drive.google.com/file/d/14s2XWcvqzp6TnCdvZanlcx-EudexKGCh/view?usp=drivesdk
1036	Joe _____, one of the cartoon's creators.	cherry	A creator's last name	https://drive.google.com/file/d/1yvZfcXxu2uvJKh7-FlVQLigIgMh2qDDd/view?usp=drivesdk
2038	You push this on a board.	KEY	It helps you make words.	https://drive.google.com/file/d/1NIDNlnz34XiSAlmho8A2EEfOelu76XeI/view?usp=drivesdk
2081	The system of springs and shock absorbers that supports the car.	SUSPENSION	Smooth ride mechanism.	https://drive.google.com/file/d/17TBD-fLZwmZfQDkN91FDV5OOkwZY93G1/view?usp=drivesdk
2121	Use your ears to hear sounds.	LISTEN	You do this to music.	https://drive.google.com/file/d/1bPl_9616ZKJP04wafdcijWjGeQCXRq8l/view?usp=drivesdk
2123	Round air in water.	BUBBLE	They pop!	https://drive.google.com/file/d/1yOTMR6nPnDho0WlSvI2vWwPix9wK35N8/view?usp=drivesdk
2122	Drink this clear liquid.	WATER	It is wet.	https://drive.google.com/file/d/1ZxZ8C1SVCLlUoVqctFJcCRHtLzSOg6YJ/view?usp=drivesdk
2168	A red or green fruit.	APPLE	Often crunchy and sweet.	https://drive.google.com/file/d/1KHqso_Kgq4cHepHl0AZRbKPiKoin-yjW/view?usp=drivesdk
2221	Many fruits taste like this.	SWEET	Opposite of sour	https://drive.google.com/file/d/1oSan5QYfqEEbqkSphD1v6hShJOWHacLC/view?usp=drivesdk
2226	A very tall place.	TOWER	It goes high into the sky.	https://drive.google.com/file/d/12vct1-iMzQEEOZPotfh3xOlEf-qPQnAL/view?usp=drivesdk
2267	Having a sweet and pleasant smell, like many flowers.	FRAGRANT	Roses are a good example.	https://drive.google.com/file/d/1k8bcS4mE7mykuPtqjOfUt8gvXTeS29s1/view?usp=drivesdk
1470	Your regular journey to work or school.	COMMUTE	Think about daily travel.	https://drive.google.com/file/d/1Z0imADeEakCtqVbvKS3AfAGaQ5AMo7T8/view?usp=drivesdk
1501	The action of reducing the severity, seriousness, or painfulness of something like stress.	MITIGATION	Alleviating harm.	https://drive.google.com/file/d/1TYUt9aD__WI4XTdaFBlbT09gLN1y3y9W/view?usp=drivesdk
1555	A round part of a car.	WHEEL	It helps a car roll.	https://drive.google.com/file/d/1vgfIO9xCcFs_-AfzUcIYwHVYqhMNjQpq/view?usp=drivesdk
1560	Many people working together.	GROUP	More than one person.	https://drive.google.com/file/d/1gwYzpUdkgTV5j9Gy5s_9x5UWJ9OHYDwn/view?usp=drivesdk
1561	What a clock tells you.	TIME	Hours and minutes.	https://drive.google.com/file/d/1x0lAB4lLBjHXO-UWH9t1n_BjVZNR0Ml9/view?usp=drivesdk
1557	A small stand to show things.	BOOTH	Like a small market stall.	https://drive.google.com/file/d/1bYvL1SFnxdV_d48ZCc7RK8725d0H2Gfc/view?usp=drivesdk
1706	When something was first seen or came into view.	APPEARED	Showed up	https://drive.google.com/file/d/1vC6SWI1QLCsSZ26xs5Xp2KNdFVTWLb8t/view?usp=drivesdk
1710	The woman's smile is seen as a great ______.	MYSTERY	People often wonder about her secret ___.	https://drive.google.com/file/d/1bdwfZElsnYS4TOmkq1q0O-tMXdz9HCFc/view?usp=drivesdk
1765	A group of soldiers who fight.	ARMY	They protect their country.	https://drive.google.com/file/d/15kqO8wQ1K3PX1a4gcxjj6SAtJC2NouLZ/view?usp=drivesdk
1953	It makes you feel afraid.	SCARY	Like a monster or a ghost.	https://drive.google.com/file/d/1m7pOVsaUes5c9CU7DbI8YrBO0Stc6wWg/view?usp=drivesdk
1887	A very big ocean animal.	WHALE	Swims in the sea.	https://drive.google.com/file/d/1dJ8EEw38jho25GNxhwbqHqv0ae482sGc/view?usp=drivesdk
1037	Teenager named Jones.	man	Male gang member	https://drive.google.com/file/d/1wV5eIGUfdQpToZ_Z8yll9Uaa5Bmo5EbD/view?usp=drivesdk
1893	A group of similar living things that can have babies together.	SPECIES	Unique type of animal.	https://drive.google.com/file/d/1hp8ZFUogYRnJTirCA9-PtrZwReHMuKKJ/view?usp=drivesdk
1995	Information given about a product to make it better.	FEEDBACK	Useful opinions.	https://drive.google.com/file/d/1jWpgzoXh7fpIYOQNFM2vwWtfw7RfLJWI/view?usp=drivesdk
2039	You look at words to know.	READ	I ___ a book every night.	https://drive.google.com/file/d/1QUBcnPbre1p9vOZIxsFMESJ7nSldTmUV/view?usp=drivesdk
2082	Essential lights at the front of a vehicle, providing illumination at night.	HEADLIGHTS	Night vision for a car.	https://drive.google.com/file/d/18BxAnfi1ZsNSoT-_0XeE4vDtmCWHsosm/view?usp=drivesdk
2124	Try something new to see.	TEST	You do this in school.	https://drive.google.com/file/d/15mKi6_i8IfqT4GjFoaux5B-9otB9BFrU/view?usp=drivesdk
2169	Drink this when you are thirsty.	WATER	Clear and has no taste.	https://drive.google.com/file/d/1ZxZ8C1SVCLlUoVqctFJcCRHtLzSOg6YJ/view?usp=drivesdk
2222	A round, bright citrus fruit.	ORANGE	Also a color	https://drive.google.com/file/d/1qn4W1HZ3lJqv1-KqbrcFxW4mqDKwIZ9s/view?usp=drivesdk
2225	See and talk to a person.	MEET	To get together with someone.	https://drive.google.com/file/d/1NwBa2kSwIU3hfbPlupErV11U144z9X_T/view?usp=drivesdk
2268	When a flower opens up and shows its beauty.	BLOSSOM	It means to develop or flourish.	https://drive.google.com/file/d/1o8g5T9TLTVv16O-vjiu6Zed3WjTjBPCr/view?usp=drivesdk
1472	The happy feeling when something bad or difficult ends.	RELIEF	What you feel after stress.	https://drive.google.com/file/d/1DVPlISWG5UZWnBTeEkkleDlSc5fczKDQ/view?usp=drivesdk
1556	What a car needs to run.	FUEL	It is like food for cars.	https://drive.google.com/file/d/1KY0BQe_9NY-med9A0_MI47JvhBFvLJ76/view?usp=drivesdk
1562	A specific day on a calendar.	DATE	It tells you 'when'.	https://drive.google.com/file/d/1hUuf79iuXa-G7OqchrXS1Sq_bsmWOIAn/view?usp=drivesdk
1559	Food eaten in the middle of the day.	LUNCH	A meal after morning.	https://drive.google.com/file/d/1VZeBqburRBMEQEawvLGsefNvapCNsoPc/view?usp=drivesdk
1707	The person who created the famous painting.	ARTIST	Leonardo da Vinci was the ___.	https://drive.google.com/file/d/156f6HFtcLxbA74hGbspJ6vS1wDK0N3AD/view?usp=drivesdk
1711	The painting was illegally taken from the museum in 1911.	STOLEN	It was ___ for two years.	https://drive.google.com/file/d/116CZW6W-ioYrWMMtzt25P0ZuzGVks-yK/view?usp=drivesdk
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: letterland_admin
--

COPY public."User" (id, username, email, password, age, "englishLevel", coin, hint, created_at, total_playtime) FROM stdin;
53	yellow	yellow@gmail.com	$2b$10$ocbqAw.Hk9/b.ElcXnmymucnyzTPddIrgQzwhiDBWWPU5Ch.bzbkK	36	B2	0	3	2025-10-30 19:55:05.109	0
54	donna	donna@gmail.com	$2b$10$S6HVPREzzO/6EFI9rJzQeO/cEY6gnpopjgaSuzB50OXEnM2XAuuVu	0	A1	0	3	2025-10-31 06:09:29.348	0
2	testuser2	testuser2@example.com	$2b$10$hQA7/jPNc8uizen5ASG9Y.AvzVMOhcNz/GZQbhNjXpwmHQ4ZgaBSG	888	A2	8617	15	2025-08-05 04:58:15.738	230996
55	barney	barney@gmail.com	$2b$10$btQBBYRRA.b1wDkmbYvHHODWoxeq8z1x1N6mB5IZ0y00fwKif1BW.	59	B1	0	3	2025-10-31 06:37:12.407	0
56	john	john@gmail.com	$2b$10$2xfLVmSXf612qgIiUKreSeZsSUP6LvvkVzZ/PrvbzfmrDjcrfrqau	0	A1	0	3	2025-10-31 06:38:18.208	0
4	phing	phing@gmail.com	$2b$10$DshhaDjcYxmUkTJ6fElIXO/ae5mJiP31jPkKpw4KIOqWFTfkkAaae	0	A1	0	3	2025-08-13 12:44:44.214	0
48	user3	user3@example.com	$2b$10$Ks2aSu8XDIdoNCbkHEmN9eVYMpZuKOmB62R4oG/GGAT3qkh.LaTZu	0	A1	0	3	2025-10-29 07:06:03.663	0
49	testaddMoreWord	testaddmoreword@example.com	$2b$10$WFgPrz4AS6umf9rYmXnO4OrMqHvpot9M4eTTkWx1MVXO05o7IxeXq	0	A1	0	3	2025-10-29 07:26:10.451	0
47	min	min@gmail.com	$2b$10$dwlj8gRItdFXZjSXc94qB.PGhYJlv9zphRFxuUTRIbJ95J7F4yOau	10	B1	306	1	2025-10-29 04:38:36.645	634
61	arthur	arthur@gmail.com	$2b$10$1c0bJiR80jPOE9M8YBXe4eX2Vv9OfsPGRrREXrFpSU56rvuJjzsNK	38	B1	71	3	2025-11-01 13:15:46.283	152
60	wood	wood@gmail.com	$2b$10$NmA2dT9miONVdbuycBfrMeFFxR6KKKuxm4BabjxYXl.jHmnikSRKW	37	B1	191	3	2025-10-31 14:28:43.535	135
45	willy	willy@gmail.com	$2b$10$2xL2QUeuO0bhHJf9s8BEjerOutXhJYLl9ojTQzH3KUf.nviELl9kC	20	B1	1315	5	2025-10-28 14:53:02.598	3815
5	testuser4	testuser4@example.com	$2b$10$99bZAly6iDQLjjCogR3CVeXc1YsHG374lquFcWQVn/YuyBzN9MPgG	57	A2	0	3	2025-08-13 16:50:33.663	0
57	bud	bud@gmail.com	$2b$10$W1W1cy5ROD2ZtHjYENslVOzVX50ZrFVrPG2NaJAswLyDsHdnplUBG	4	B2	151	3	2025-10-31 10:42:45.828	149
46	mikely	mike@gmail.com	$2b$10$U.XzaKkPzIDFMieSODKJzeFHSbpBIB5DFF5JR2CGM.9EC7e1ZrG3y	21	B2	106	3	2025-10-29 04:20:29.794	273
58	marshal	marshal@gmail.com	$2b$10$Dg3llr5BTMVIb9YUfMwFd.cybhvuHemzJiURQ1Lkhjppl3zfuLuxm	0	A1	0	3	2025-10-31 13:59:54.675	0
62	ossy	ossy@example.com	$2b$10$3r3T4AvWEzrn6TIguM0C0uM3mJUYfKgTXHZIjPiVSWPMvyA4tUBve	0	A1	0	3	2025-11-04 07:01:21.768	0
50	nelson	nelson@gmail.com	$2b$10$EiFrFfe7ahkuszst0nhpF.nuPes/MdeRbFUtNCGni6uIyIHrgG.Oy	0	A1	0	3	2025-10-30 19:10:29.722	0
67	mark	mark@gmail.com	$2b$10$kiZ4aolIDJjGBqAuo/exb.fCbZI1CJLZV2.d3Clstd6JrMewShWv2	55	B2	0	3	2025-11-07 02:38:53.553	0
59	starry	starry@gmail.com	$2b$10$JyEvBDtVBfmUAiom.Mvmkux.ZwoBMDVghA0fUbp5fBn4eS4TAa51C	13	B1	71	3	2025-10-31 14:03:43.03	101
52	winner	winner@gmail.com	$2b$10$wNXQTm6SCHe2QheqRkX0SepgQQZO1FYuLT3k5TYoDsCjzD.F/KSrm	80	B1	0	3	2025-10-30 19:28:25.45	0
63	virun	virun@gmail.com	$2b$10$SwRMhUbjKJuE7HVmvoMp2.utKi1dkH.yYcuSVMKfaW3TEX8ci2HGK	17	A2	3	3	2025-11-04 07:01:39.756	600
66	honey	honey@gmail.com	$2b$10$kPU9E2dVtnQ2Xeir/pIfX.z1JEWpIU1JepZgGgfm0N2XIQ2jHhd3C	18	B2	865	4	2025-11-06 16:25:26.299	6460
1	testuser	testuser@example.com	$2b$10$A7Qjh5RpWXjYNkbwPi6DuegDoj/hSigUwgasb1DJ2Ra11cduZ6nSq	50	C2	3331	0	2025-08-04 03:33:52.852	734279
64	noob	noobmaster69@gmail.com	$2b$10$F2vv0fLzgUku1In7AUKH0ex2.IsCwhJayTXvrkdY8hpPMQlUKGFLK	69	B1	124	1	2025-11-04 07:04:18.392	585
51	wick	wick@gmail.com	$2b$10$CP0.VzNg6a7UfHJbtdFp1.3cNxM9PtGFB7An3Pod.aOuSeC2Vf/vu	68	B2	500	3	2025-10-30 19:18:39.838	0
10	lek	lek@gmail.com	$2b$10$WUzrJSHB4476f2q20.WJ4uu70vanoOpND9PVlnt96SpogIAAG9/Qq	20	A2	10335	18	2025-08-13 17:24:55.685	199199
68	non	non@gmail.com	$2b$10$2OsLWYpF7OfOTfS2x8QVr.cz3DuPK/eM5hCXCIpFtcW1GtQfcBcxu	30	B2	0	3	2025-11-21 06:16:44.232	0
38	BrianKorean	briankorean@example.com	$2b$10$5qq/P26M.j9CFR.W7ts6ZOqA2or9Hxjp.ckNhwa8jKkqy.SRX1ARW	24	A2	162	2	2025-10-05 09:21:15.111	142
29	ananTeera	ananteera@example.com	$2b$10$dnh8S1Fu9GDx90knyF0/BeRvcwENlVf3JVM9urLz7kYEmn776/yyO	67	A2	290	2	2025-09-07 14:45:30.106	0
37	Bob	bob@example.com	$2b$10$Q0lSW2rUctYYxvhV1MPwcOQleGCa73BnCtiWXr6nIRHkASRdOsLKy	68	B1	0	3	2025-10-01 15:35:51.502	0
3	testuser3	testuser3@example.com	$2b$10$Lkn1r.6HmZ7jFJo5CaC44uN4On5SzuQQLG66C4HostKE5jFNt56F.	99999	B1	5150	23	2025-08-07 08:08:31.762	0
32	kate	kate@gmail.com	$2b$10$O9EsY/2nszbO7TfMPN1aBOxpw5lxtTFKyVcvmKNFNej6MZDWB9Sk.	5	A2	201	2	2025-09-08 07:38:26.913	41
42	virunpat	pp@gmail.com	$2b$10$jhfR.hvXhvX5rA/DKQn6w.ioOHojDBULsbBpq6KiBlD0LvueQ9aQe	15	A2	100	2	2025-10-20 09:40:14.546	191
43	leklek	leklek@gmail.com	$2b$10$QyTS0gB8elGJV7kyrEY40OEV7xkxYnaw6yV0NCbf0g0Px0W5d.Bg6	18	B2	433	0	2025-10-20 09:57:04.931	426
44	yyy	yyy@gmail.com	$2b$10$6NQOiKWIGEvcXvfJdhEo3uG98bVWB1IVoa8n8raK3B.6YbYQm1AGq	29	B2	0	3	2025-10-20 16:34:45.706	0
\.


--
-- Data for Name: UserAchievement; Type: TABLE DATA; Schema: public; Owner: letterland_admin
--

COPY public."UserAchievement" (id, "userId", "achievementId", "isCompleted", "earnedAt", "isClaimed") FROM stdin;
320	47	6	f	2025-10-29 04:39:29.416	f
321	47	12	f	2025-10-29 04:39:29.419	f
324	47	7	f	2025-10-29 04:39:29.433	f
325	47	8	f	2025-10-29 04:39:29.437	f
326	47	13	f	2025-10-29 04:39:29.44	f
327	47	16	f	2025-10-29 04:39:29.446	f
328	47	19	f	2025-10-29 04:39:29.45	f
329	47	9	f	2025-10-29 04:39:29.454	f
314	47	1	t	2025-10-29 04:43:26.059	f
40	37	2	f	2025-10-01 15:36:10.079	f
41	37	3	f	2025-10-01 15:36:10.171	f
42	37	1	f	2025-10-01 15:36:10.223	f
44	38	3	f	2025-10-05 09:22:38.112	f
2	1	1	t	2025-09-04 16:34:27.671	t
315	47	4	t	2025-10-29 04:43:26.063	f
323	47	18	t	2025-10-29 04:43:26.071	f
3	1	3	t	2025-09-06 18:47:04.535	t
1	1	2	t	2025-09-06 18:47:04.336	t
317	47	2	t	2025-10-29 04:47:42.027	f
322	47	15	t	2025-10-29 04:47:42.037	f
354	49	1	f	2025-10-29 09:08:23.354	f
355	49	4	f	2025-10-29 09:08:23.358	f
356	49	5	f	2025-10-29 09:08:23.364	f
357	49	2	f	2025-10-29 09:08:23.369	f
5	10	1	t	2025-09-06 20:41:08.698	t
358	49	3	f	2025-10-29 09:08:23.372	f
8	2	1	t	2025-09-07 13:43:37.233	t
7	2	2	t	2025-09-07 13:43:37.229	t
359	49	11	f	2025-10-29 09:08:23.376	f
360	49	6	f	2025-10-29 09:08:23.378	f
361	49	12	f	2025-10-29 09:08:23.382	f
362	49	15	f	2025-10-29 09:08:23.384	f
363	49	18	f	2025-10-29 09:08:23.387	f
364	49	7	f	2025-10-29 09:08:23.39	f
18	29	1	t	2025-09-07 14:58:46.913	f
17	29	3	t	2025-09-07 15:59:52.774	f
16	29	2	t	2025-09-07 14:58:46.908	t
365	49	8	f	2025-10-29 09:08:23.392	f
366	49	13	f	2025-10-29 09:08:23.395	f
367	49	16	f	2025-10-29 09:08:23.399	f
368	49	19	f	2025-10-29 09:08:23.402	f
369	49	9	f	2025-10-29 09:08:23.404	f
370	49	10	f	2025-10-29 09:08:23.406	f
43	38	2	t	2025-10-09 07:11:54.607	t
45	38	1	t	2025-10-09 07:11:54.612	t
371	49	17	f	2025-10-29 09:08:23.408	f
372	49	20	f	2025-10-29 09:08:23.41	f
26	32	3	f	2025-09-08 07:38:59.643	f
316	47	5	t	2025-10-30 15:14:34.825	f
25	32	2	t	2025-09-08 07:46:09.794	t
27	32	1	t	2025-09-08 07:42:55.565	t
6	10	3	t	2025-09-06 20:41:08.702	t
318	47	3	t	2025-10-30 15:14:34.838	f
319	47	11	t	2025-10-30 15:21:10.289	f
4	10	2	t	2025-09-06 20:41:08.694	t
386	50	13	f	2025-10-30 19:17:29.863	f
55	2	20	f	2025-10-12 09:34:42.042	f
57	2	9	f	2025-10-12 09:34:42.142	f
58	2	16	f	2025-10-12 09:34:42.167	f
59	2	13	f	2025-10-12 09:34:42.197	f
61	2	7	f	2025-10-12 09:34:42.273	f
64	2	6	f	2025-10-12 09:34:42.364	f
65	2	10	f	2025-10-12 09:34:42.393	f
66	2	14	f	2025-10-12 09:34:42.419	f
69	2	17	f	2025-10-12 09:34:42.504	f
387	50	16	f	2025-10-30 19:17:29.867	f
388	50	19	f	2025-10-30 19:17:29.871	f
60	2	15	t	2025-10-12 10:44:45.249	t
71	2	18	t	2025-10-12 10:44:45.3	t
56	2	11	t	2025-10-12 09:34:42.102	t
9	2	3	t	2025-10-10 17:06:25.54	t
73	1	11	t	2025-10-12 14:17:57.219	f
389	50	9	f	2025-10-30 19:17:29.875	f
82	1	10	f	2025-10-12 14:17:57.238	f
83	1	14	f	2025-10-12 14:17:57.24	f
390	50	10	f	2025-10-30 19:17:29.877	f
99	10	10	f	2025-10-12 15:10:20.161	f
100	10	14	f	2025-10-12 15:10:20.163	f
391	50	17	f	2025-10-30 19:17:29.88	f
392	50	20	f	2025-10-30 19:17:29.884	f
393	50	14	f	2025-10-30 19:17:29.888	f
414	52	1	f	2025-10-30 19:54:09.14	f
415	52	4	f	2025-10-30 19:54:09.152	f
416	52	5	f	2025-10-30 19:54:09.154	f
417	52	2	f	2025-10-30 19:54:09.159	f
418	52	3	f	2025-10-30 19:54:09.162	f
424	52	7	f	2025-10-30 19:54:09.186	f
454	54	1	f	2025-10-31 06:28:31.014	f
455	54	4	f	2025-10-31 06:28:31.023	f
456	54	5	f	2025-10-31 06:28:31.025	f
457	54	2	f	2025-10-31 06:28:31.028	f
458	54	3	f	2025-10-31 06:28:31.031	f
459	54	11	f	2025-10-31 06:28:31.033	f
460	54	6	f	2025-10-31 06:28:31.036	f
468	54	19	f	2025-10-31 06:28:31.073	f
469	54	9	f	2025-10-31 06:28:31.099	f
470	54	10	f	2025-10-31 06:28:31.102	f
471	54	17	f	2025-10-31 06:28:31.105	f
472	54	20	f	2025-10-31 06:28:31.107	f
104	10	5	t	2025-10-14 10:34:01.038	t
98	10	6	t	2025-10-14 10:34:01.135	t
102	10	12	t	2025-10-14 10:34:01.165	t
105	10	18	t	2025-10-14 10:34:01.222	t
95	10	7	t	2025-10-14 10:34:01.276	t
97	10	8	t	2025-10-14 10:34:01.335	t
90	10	11	t	2025-10-12 15:10:20.135	t
101	10	19	t	2025-10-14 10:34:01.463	t
67	2	19	t	2025-10-21 07:56:06.601	f
103	10	17	t	2025-10-14 10:34:01.575	t
89	10	20	t	2025-10-14 10:34:01.618	t
91	10	9	t	2025-10-14 10:34:01.515	t
92	10	16	t	2025-10-14 10:34:01.421	t
96	10	4	t	2025-10-14 10:34:00.99	t
93	10	13	t	2025-10-14 10:34:01.386	t
70	2	5	t	2025-10-14 16:52:37.577	f
79	1	4	t	2025-10-14 17:08:31.156	f
87	1	5	t	2025-10-14 17:08:31.204	f
85	1	12	t	2025-10-14 17:08:31.391	f
77	1	15	t	2025-10-14 17:08:31.425	f
88	1	18	t	2025-10-14 17:08:31.492	f
78	1	7	t	2025-10-14 17:08:31.629	f
80	1	8	t	2025-10-14 17:08:31.671	f
76	1	13	t	2025-10-14 17:08:31.717	f
75	1	16	t	2025-10-14 17:08:31.761	f
84	1	19	t	2025-10-14 17:08:31.795	f
74	1	9	t	2025-10-14 17:08:31.854	f
86	1	17	t	2025-10-14 17:08:31.902	f
72	1	20	t	2025-10-14 17:08:31.94	f
62	2	4	t	2025-10-14 16:52:37.574	t
68	2	12	t	2025-10-28 05:45:25.516	f
63	2	8	t	2025-10-28 05:45:25.522	f
330	47	10	f	2025-10-29 04:39:29.459	f
331	47	17	f	2025-10-29 04:39:29.462	f
332	47	20	f	2025-10-29 04:39:29.464	f
333	47	14	f	2025-10-29 04:39:29.467	f
373	49	14	f	2025-10-29 09:08:23.417	f
394	51	1	f	2025-10-30 19:26:21.457	f
140	38	20	f	2025-10-13 20:19:07.504	f
141	38	11	f	2025-10-13 20:19:07.512	f
142	38	9	f	2025-10-13 20:19:07.518	f
143	38	16	f	2025-10-13 20:19:07.52	f
144	38	13	f	2025-10-13 20:19:07.522	f
146	38	7	f	2025-10-13 20:19:07.526	f
147	38	4	f	2025-10-13 20:19:07.527	f
148	38	8	f	2025-10-13 20:19:07.529	f
149	38	6	f	2025-10-13 20:19:07.53	f
150	38	10	f	2025-10-13 20:19:07.532	f
151	38	14	f	2025-10-13 20:19:07.534	f
152	38	19	f	2025-10-13 20:19:07.535	f
153	38	12	f	2025-10-13 20:19:07.537	f
154	38	17	f	2025-10-13 20:19:07.541	f
155	38	5	f	2025-10-13 20:19:07.542	f
156	38	18	f	2025-10-13 20:19:07.547	f
157	32	20	f	2025-10-14 10:13:44.562	f
158	32	11	f	2025-10-14 10:13:44.567	f
159	32	9	f	2025-10-14 10:13:44.569	f
160	32	16	f	2025-10-14 10:13:44.57	f
161	32	13	f	2025-10-14 10:13:44.572	f
162	32	15	f	2025-10-14 10:13:44.574	f
163	32	7	f	2025-10-14 10:13:44.575	f
164	32	4	f	2025-10-14 10:13:44.577	f
165	32	8	f	2025-10-14 10:13:44.579	f
166	32	6	f	2025-10-14 10:13:44.58	f
167	32	10	f	2025-10-14 10:13:44.592	f
168	32	14	f	2025-10-14 10:13:44.595	f
169	32	19	f	2025-10-14 10:13:44.597	f
170	32	12	f	2025-10-14 10:13:44.6	f
171	32	17	f	2025-10-14 10:13:44.603	f
172	32	5	f	2025-10-14 10:13:44.606	f
173	32	18	f	2025-10-14 10:13:44.61	f
94	10	15	t	2025-10-14 10:34:01.195	t
145	38	15	t	2025-10-14 16:42:24.196	f
395	51	4	f	2025-10-30 19:26:21.462	f
396	51	5	f	2025-10-30 19:26:21.466	f
397	51	2	f	2025-10-30 19:26:21.47	f
398	51	3	f	2025-10-30 19:26:21.474	f
399	51	11	f	2025-10-30 19:26:21.477	f
400	51	6	f	2025-10-30 19:26:21.48	f
401	51	12	f	2025-10-30 19:26:21.484	f
402	51	15	f	2025-10-30 19:26:21.486	f
403	51	18	f	2025-10-30 19:26:21.49	f
404	51	7	f	2025-10-30 19:26:21.493	f
405	51	8	f	2025-10-30 19:26:21.497	f
406	51	13	f	2025-10-30 19:26:21.499	f
407	51	16	f	2025-10-30 19:26:21.502	f
408	51	19	f	2025-10-30 19:26:21.505	f
409	51	9	f	2025-10-30 19:26:21.51	f
410	51	10	f	2025-10-30 19:26:21.513	f
411	51	17	f	2025-10-30 19:26:21.526	f
419	52	11	f	2025-10-30 19:54:09.166	f
420	52	6	f	2025-10-30 19:54:09.172	f
421	52	12	f	2025-10-30 19:54:09.175	f
422	52	15	f	2025-10-30 19:54:09.178	f
81	1	6	t	2025-10-14 17:08:31.344	f
194	3	1	f	2025-10-17 17:06:55.981	f
195	3	4	f	2025-10-17 17:06:55.995	f
196	3	5	f	2025-10-17 17:06:55.999	f
197	3	2	f	2025-10-17 17:06:56.001	f
198	3	3	f	2025-10-17 17:06:56.004	f
199	3	11	f	2025-10-17 17:06:56.007	f
200	3	6	f	2025-10-17 17:06:56.012	f
201	3	12	f	2025-10-17 17:06:56.014	f
202	3	15	f	2025-10-17 17:06:56.017	f
203	3	18	f	2025-10-17 17:06:56.019	f
204	3	7	f	2025-10-17 17:06:56.021	f
205	3	8	f	2025-10-17 17:06:56.024	f
206	3	13	f	2025-10-17 17:06:56.027	f
207	3	16	f	2025-10-17 17:06:56.03	f
208	3	19	f	2025-10-17 17:06:56.033	f
209	3	9	f	2025-10-17 17:06:56.034	f
210	3	10	f	2025-10-17 17:06:56.041	f
211	3	17	f	2025-10-17 17:06:56.044	f
212	3	20	f	2025-10-17 17:06:56.046	f
213	3	14	f	2025-10-17 17:06:56.048	f
215	42	4	f	2025-10-20 09:41:03.932	f
216	42	5	f	2025-10-20 09:41:03.934	f
217	42	2	f	2025-10-20 09:41:03.936	f
218	42	3	f	2025-10-20 09:41:03.938	f
219	42	11	f	2025-10-20 09:41:03.94	f
220	42	6	f	2025-10-20 09:41:03.942	f
221	42	12	f	2025-10-20 09:41:03.944	f
222	42	15	f	2025-10-20 09:41:03.946	f
224	42	7	f	2025-10-20 09:41:03.952	f
225	42	8	f	2025-10-20 09:41:03.954	f
226	42	13	f	2025-10-20 09:41:03.956	f
227	42	16	f	2025-10-20 09:41:03.959	f
228	42	19	f	2025-10-20 09:41:03.964	f
229	42	9	f	2025-10-20 09:41:03.966	f
230	42	10	f	2025-10-20 09:41:03.969	f
231	42	17	f	2025-10-20 09:41:03.97	f
232	42	20	f	2025-10-20 09:41:03.973	f
233	42	14	f	2025-10-20 09:41:03.975	f
236	43	5	f	2025-10-20 09:59:20.56	f
239	43	11	f	2025-10-20 09:59:20.565	f
240	43	6	f	2025-10-20 09:59:20.567	f
241	43	12	f	2025-10-20 09:59:20.569	f
242	43	15	f	2025-10-20 09:59:20.574	f
244	43	7	f	2025-10-20 09:59:20.578	f
245	43	8	f	2025-10-20 09:59:20.579	f
246	43	13	f	2025-10-20 09:59:20.581	f
247	43	16	f	2025-10-20 09:59:20.583	f
248	43	19	f	2025-10-20 09:59:20.585	f
249	43	9	f	2025-10-20 09:59:20.589	f
250	43	10	f	2025-10-20 09:59:20.593	f
251	43	17	f	2025-10-20 09:59:20.596	f
252	43	20	f	2025-10-20 09:59:20.598	f
253	43	14	f	2025-10-20 09:59:20.601	f
243	43	18	t	2025-10-20 10:06:01.631	t
238	43	3	t	2025-10-20 10:16:41.778	t
235	43	4	t	2025-10-20 10:16:41.773	f
214	42	1	t	2025-10-20 10:41:24.673	f
234	43	1	t	2025-10-20 10:06:01.618	t
223	42	18	t	2025-10-20 10:41:24.688	f
237	43	2	t	2025-10-20 11:39:39.512	f
254	44	1	f	2025-10-20 16:35:00.035	f
255	44	4	f	2025-10-20 16:35:00.04	f
256	44	5	f	2025-10-20 16:35:00.042	f
257	44	2	f	2025-10-20 16:35:00.045	f
258	44	3	f	2025-10-20 16:35:00.048	f
259	44	11	f	2025-10-20 16:35:00.05	f
260	44	6	f	2025-10-20 16:35:00.053	f
261	44	12	f	2025-10-20 16:35:00.055	f
262	44	15	f	2025-10-20 16:35:00.057	f
263	44	18	f	2025-10-20 16:35:00.058	f
264	44	7	f	2025-10-20 16:35:00.061	f
265	44	8	f	2025-10-20 16:35:00.067	f
266	44	13	f	2025-10-20 16:35:00.071	f
267	44	16	f	2025-10-20 16:35:00.076	f
268	44	19	f	2025-10-20 16:35:00.081	f
269	44	9	f	2025-10-20 16:35:00.083	f
270	44	10	f	2025-10-20 16:35:00.085	f
271	44	17	f	2025-10-20 16:35:00.087	f
272	44	20	f	2025-10-20 16:35:00.089	f
273	44	14	f	2025-10-20 16:35:00.091	f
280	45	6	f	2025-10-28 14:56:36.798	f
284	45	7	f	2025-10-28 14:56:36.812	f
286	45	13	f	2025-10-28 14:56:36.819	f
287	45	16	f	2025-10-28 14:56:36.822	f
290	45	10	f	2025-10-28 14:56:36.831	f
291	45	17	f	2025-10-28 14:56:36.838	f
293	45	14	f	2025-10-28 14:56:36.844	f
276	45	5	t	2025-10-30 17:47:24.734	t
277	45	2	t	2025-10-28 17:44:42.42	t
294	46	1	t	2025-10-29 04:24:37.033	f
283	45	18	t	2025-10-28 15:09:09.721	t
278	45	3	t	2025-10-28 18:29:31.947	t
282	45	15	t	2025-10-28 17:44:42.533	f
279	45	11	t	2025-10-28 20:48:57.37	t
281	45	12	t	2025-10-30 18:26:15.602	t
299	46	11	f	2025-10-29 04:21:12.472	f
300	46	6	f	2025-10-29 04:21:12.476	f
301	46	12	f	2025-10-29 04:21:12.479	f
302	46	15	f	2025-10-29 04:21:12.485	f
304	46	7	f	2025-10-29 04:21:12.49	f
305	46	8	f	2025-10-29 04:21:12.493	f
306	46	13	f	2025-10-29 04:21:12.497	f
307	46	16	f	2025-10-29 04:21:12.5	f
308	46	19	f	2025-10-29 04:21:12.504	f
309	46	9	f	2025-10-29 04:21:12.506	f
310	46	10	f	2025-10-29 04:21:12.51	f
311	46	17	f	2025-10-29 04:21:12.513	f
312	46	20	f	2025-10-29 04:21:12.516	f
313	46	14	f	2025-10-29 04:21:12.52	f
303	46	18	t	2025-10-29 04:24:37.043	f
295	46	4	t	2025-10-29 04:27:29.493	f
297	46	2	t	2025-10-29 04:27:29.501	f
296	46	5	t	2025-10-29 04:30:53.444	f
298	46	3	t	2025-10-29 04:30:53.449	f
334	48	1	f	2025-10-29 07:20:57.867	f
335	48	4	f	2025-10-29 07:20:57.873	f
336	48	5	f	2025-10-29 07:20:57.879	f
337	48	2	f	2025-10-29 07:20:57.883	f
338	48	3	f	2025-10-29 07:20:57.887	f
339	48	11	f	2025-10-29 07:20:57.889	f
340	48	6	f	2025-10-29 07:20:57.892	f
341	48	12	f	2025-10-29 07:20:57.896	f
342	48	15	f	2025-10-29 07:20:57.9	f
343	48	18	f	2025-10-29 07:20:57.902	f
344	48	7	f	2025-10-29 07:20:57.907	f
345	48	8	f	2025-10-29 07:20:57.909	f
346	48	13	f	2025-10-29 07:20:57.912	f
347	48	16	f	2025-10-29 07:20:57.914	f
348	48	19	f	2025-10-29 07:20:57.916	f
349	48	9	f	2025-10-29 07:20:57.919	f
350	48	10	f	2025-10-29 07:20:57.921	f
351	48	17	f	2025-10-29 07:20:57.923	f
352	48	20	f	2025-10-29 07:20:57.925	f
353	48	14	f	2025-10-29 07:20:57.928	f
285	45	8	t	2025-10-30 15:44:36.507	f
288	45	19	t	2025-10-30 17:31:13.299	f
289	45	9	t	2025-10-31 15:22:58.059	f
292	45	20	t	2025-10-31 15:28:46.756	f
374	50	1	f	2025-10-30 19:17:29.821	f
375	50	4	f	2025-10-30 19:17:29.829	f
376	50	5	f	2025-10-30 19:17:29.833	f
377	50	2	f	2025-10-30 19:17:29.835	f
378	50	3	f	2025-10-30 19:17:29.838	f
379	50	11	f	2025-10-30 19:17:29.841	f
380	50	6	f	2025-10-30 19:17:29.843	f
381	50	12	f	2025-10-30 19:17:29.846	f
382	50	15	f	2025-10-30 19:17:29.848	f
383	50	18	f	2025-10-30 19:17:29.85	f
384	50	7	f	2025-10-30 19:17:29.855	f
385	50	8	f	2025-10-30 19:17:29.861	f
412	51	20	f	2025-10-30 19:26:21.528	f
413	51	14	f	2025-10-30 19:26:21.532	f
423	52	18	f	2025-10-30 19:54:09.182	f
425	52	8	f	2025-10-30 19:54:09.202	f
426	52	13	f	2025-10-30 19:54:09.206	f
427	52	16	f	2025-10-30 19:54:09.21	f
428	52	19	f	2025-10-30 19:54:09.214	f
429	52	9	f	2025-10-30 19:54:09.217	f
430	52	10	f	2025-10-30 19:54:09.221	f
431	52	17	f	2025-10-30 19:54:09.225	f
432	52	20	f	2025-10-30 19:54:09.226	f
433	52	14	f	2025-10-30 19:54:09.229	f
434	53	1	f	2025-10-30 20:01:56.282	f
435	53	4	f	2025-10-30 20:01:56.29	f
436	53	5	f	2025-10-30 20:01:56.295	f
437	53	2	f	2025-10-30 20:01:56.299	f
438	53	3	f	2025-10-30 20:01:56.302	f
439	53	11	f	2025-10-30 20:01:56.307	f
440	53	6	f	2025-10-30 20:01:56.311	f
441	53	12	f	2025-10-30 20:01:56.313	f
442	53	15	f	2025-10-30 20:01:56.32	f
443	53	18	f	2025-10-30 20:01:56.322	f
444	53	7	f	2025-10-30 20:01:56.34	f
445	53	8	f	2025-10-30 20:01:56.346	f
446	53	13	f	2025-10-30 20:01:56.35	f
447	53	16	f	2025-10-30 20:01:56.353	f
448	53	19	f	2025-10-30 20:01:56.357	f
449	53	9	f	2025-10-30 20:01:56.36	f
450	53	10	f	2025-10-30 20:01:56.362	f
451	53	17	f	2025-10-30 20:01:56.364	f
452	53	20	f	2025-10-30 20:01:56.366	f
453	53	14	f	2025-10-30 20:01:56.368	f
461	54	12	f	2025-10-31 06:28:31.049	f
462	54	15	f	2025-10-31 06:28:31.054	f
463	54	18	f	2025-10-31 06:28:31.058	f
464	54	7	f	2025-10-31 06:28:31.06	f
465	54	8	f	2025-10-31 06:28:31.064	f
466	54	13	f	2025-10-31 06:28:31.067	f
467	54	16	f	2025-10-31 06:28:31.07	f
473	54	14	f	2025-10-31 06:28:31.11	f
474	55	1	f	2025-10-31 06:37:47.67	f
475	55	4	f	2025-10-31 06:37:47.676	f
476	55	5	f	2025-10-31 06:37:47.681	f
477	55	2	f	2025-10-31 06:37:47.683	f
478	55	3	f	2025-10-31 06:37:47.685	f
479	55	11	f	2025-10-31 06:37:47.689	f
480	55	6	f	2025-10-31 06:37:47.692	f
481	55	12	f	2025-10-31 06:37:47.695	f
482	55	15	f	2025-10-31 06:37:47.697	f
483	55	18	f	2025-10-31 06:37:47.7	f
484	55	7	f	2025-10-31 06:37:47.704	f
485	55	8	f	2025-10-31 06:37:47.708	f
486	55	13	f	2025-10-31 06:37:47.712	f
487	55	16	f	2025-10-31 06:37:47.727	f
488	55	19	f	2025-10-31 06:37:47.73	f
489	55	9	f	2025-10-31 06:37:47.732	f
490	55	10	f	2025-10-31 06:37:47.737	f
491	55	17	f	2025-10-31 06:37:47.74	f
492	55	20	f	2025-10-31 06:37:47.743	f
493	55	14	f	2025-10-31 06:37:47.746	f
494	56	1	f	2025-10-31 10:42:18.175	f
495	56	4	f	2025-10-31 10:42:18.18	f
496	56	5	f	2025-10-31 10:42:18.193	f
497	56	2	f	2025-10-31 10:42:18.198	f
498	56	3	f	2025-10-31 10:42:18.201	f
499	56	11	f	2025-10-31 10:42:18.205	f
500	56	6	f	2025-10-31 10:42:18.208	f
501	56	12	f	2025-10-31 10:42:18.214	f
502	56	15	f	2025-10-31 10:42:18.217	f
503	56	18	f	2025-10-31 10:42:18.222	f
504	56	7	f	2025-10-31 10:42:18.227	f
505	56	8	f	2025-10-31 10:42:18.23	f
506	56	13	f	2025-10-31 10:42:18.234	f
507	56	16	f	2025-10-31 10:42:18.238	f
508	56	19	f	2025-10-31 10:42:18.242	f
509	56	9	f	2025-10-31 10:42:18.246	f
510	56	10	f	2025-10-31 10:42:18.251	f
511	56	17	f	2025-10-31 10:42:18.255	f
512	56	20	f	2025-10-31 10:42:18.257	f
513	56	14	f	2025-10-31 10:42:18.26	f
516	57	5	f	2025-10-31 10:56:01.842	f
519	57	11	f	2025-10-31 10:56:01.856	f
520	57	6	f	2025-10-31 10:56:01.859	f
521	57	12	f	2025-10-31 10:56:01.864	f
522	57	15	f	2025-10-31 10:56:01.867	f
524	57	7	f	2025-10-31 10:56:01.874	f
525	57	8	f	2025-10-31 10:56:01.878	f
526	57	13	f	2025-10-31 10:56:01.886	f
527	57	16	f	2025-10-31 10:56:01.889	f
528	57	19	f	2025-10-31 10:56:01.893	f
529	57	9	f	2025-10-31 10:56:01.897	f
530	57	10	f	2025-10-31 10:56:01.901	f
531	57	17	f	2025-10-31 10:56:01.904	f
532	57	20	f	2025-10-31 10:56:01.91	f
533	57	14	f	2025-10-31 10:56:01.915	f
514	57	1	t	2025-10-31 11:00:59.33	f
523	57	18	t	2025-10-31 11:00:59.346	f
515	57	4	t	2025-10-31 11:03:08.624	f
517	57	2	t	2025-10-31 11:03:08.629	f
518	57	3	t	2025-10-31 11:05:39.998	f
274	45	1	t	2025-10-28 15:09:09.709	t
275	45	4	t	2025-10-28 15:09:09.714	t
534	58	1	f	2025-10-31 14:03:15.218	f
535	58	4	f	2025-10-31 14:03:15.224	f
536	58	5	f	2025-10-31 14:03:15.228	f
537	58	2	f	2025-10-31 14:03:15.234	f
538	58	3	f	2025-10-31 14:03:15.237	f
539	58	11	f	2025-10-31 14:03:15.241	f
540	58	6	f	2025-10-31 14:03:15.247	f
541	58	12	f	2025-10-31 14:03:15.252	f
542	58	15	f	2025-10-31 14:03:15.257	f
543	58	18	f	2025-10-31 14:03:15.26	f
544	58	7	f	2025-10-31 14:03:15.263	f
545	58	8	f	2025-10-31 14:03:15.265	f
546	58	13	f	2025-10-31 14:03:15.271	f
547	58	16	f	2025-10-31 14:03:15.274	f
548	58	19	f	2025-10-31 14:03:15.277	f
549	58	9	f	2025-10-31 14:03:15.281	f
550	58	10	f	2025-10-31 14:03:15.284	f
551	58	17	f	2025-10-31 14:03:15.29	f
552	58	20	f	2025-10-31 14:03:15.293	f
553	58	14	f	2025-10-31 14:03:15.297	f
556	59	5	f	2025-10-31 14:08:20.264	f
557	59	2	f	2025-10-31 14:08:20.267	f
558	59	3	f	2025-10-31 14:08:20.271	f
559	59	11	f	2025-10-31 14:08:20.273	f
560	59	6	f	2025-10-31 14:08:20.275	f
561	59	12	f	2025-10-31 14:08:20.278	f
562	59	15	f	2025-10-31 14:08:20.281	f
564	59	7	f	2025-10-31 14:08:20.29	f
565	59	8	f	2025-10-31 14:08:20.294	f
566	59	13	f	2025-10-31 14:08:20.297	f
567	59	16	f	2025-10-31 14:08:20.3	f
568	59	19	f	2025-10-31 14:08:20.302	f
569	59	9	f	2025-10-31 14:08:20.304	f
570	59	10	f	2025-10-31 14:08:20.306	f
571	59	17	f	2025-10-31 14:08:20.309	f
572	59	20	f	2025-10-31 14:08:20.313	f
573	59	14	f	2025-10-31 14:08:20.315	f
554	59	1	t	2025-10-31 14:27:02.663	f
555	59	4	t	2025-10-31 14:27:02.667	f
563	59	18	t	2025-10-31 14:27:02.682	f
576	60	5	f	2025-10-31 14:28:55.434	f
579	60	11	f	2025-10-31 14:28:55.443	f
580	60	6	f	2025-10-31 14:28:55.448	f
581	60	12	f	2025-10-31 14:28:55.452	f
582	60	15	f	2025-10-31 14:28:55.455	f
584	60	7	f	2025-10-31 14:28:55.46	f
585	60	8	f	2025-10-31 14:28:55.463	f
586	60	13	f	2025-10-31 14:28:55.469	f
587	60	16	f	2025-10-31 14:28:55.473	f
588	60	19	f	2025-10-31 14:28:55.475	f
589	60	9	f	2025-10-31 14:28:55.477	f
590	60	10	f	2025-10-31 14:28:55.48	f
591	60	17	f	2025-10-31 14:28:55.482	f
592	60	20	f	2025-10-31 14:28:55.486	f
593	60	14	f	2025-10-31 14:28:55.488	f
574	60	1	t	2025-10-31 14:32:27.056	f
583	60	18	t	2025-10-31 14:32:27.071	f
575	60	4	t	2025-10-31 14:38:48.015	f
577	60	2	t	2025-10-31 14:38:48.021	f
578	60	3	t	2025-10-31 15:00:30.409	f
596	61	5	f	2025-11-01 13:20:06.395	f
597	61	2	f	2025-11-01 13:20:06.398	f
598	61	3	f	2025-11-01 13:20:06.403	f
599	61	11	f	2025-11-01 13:20:06.409	f
600	61	6	f	2025-11-01 13:20:06.412	f
601	61	12	f	2025-11-01 13:20:06.415	f
602	61	15	f	2025-11-01 13:20:06.417	f
604	61	7	f	2025-11-01 13:20:06.424	f
605	61	8	f	2025-11-01 13:20:06.426	f
606	61	13	f	2025-11-01 13:20:06.429	f
607	61	16	f	2025-11-01 13:20:06.432	f
608	61	19	f	2025-11-01 13:20:06.434	f
609	61	9	f	2025-11-01 13:20:06.438	f
610	61	10	f	2025-11-01 13:20:06.444	f
611	61	17	f	2025-11-01 13:20:06.447	f
612	61	20	f	2025-11-01 13:20:06.449	f
613	61	14	f	2025-11-01 13:20:06.453	f
594	61	1	t	2025-11-01 13:28:04.731	f
595	61	4	t	2025-11-01 13:28:04.734	f
603	61	18	t	2025-11-01 13:28:04.741	f
616	63	5	f	2025-11-04 07:02:21.326	f
617	63	2	f	2025-11-04 07:02:21.329	f
618	63	3	f	2025-11-04 07:02:21.331	f
619	63	11	f	2025-11-04 07:02:21.335	f
620	63	6	f	2025-11-04 07:02:21.338	f
621	63	12	f	2025-11-04 07:02:21.34	f
615	63	4	t	2025-11-04 07:33:59.045	f
622	63	15	f	2025-11-04 07:02:21.342	f
624	63	7	f	2025-11-04 07:02:21.35	f
625	63	8	f	2025-11-04 07:02:21.352	f
626	63	13	f	2025-11-04 07:02:21.355	f
627	63	16	f	2025-11-04 07:02:21.357	f
628	63	19	f	2025-11-04 07:02:21.368	f
629	63	9	f	2025-11-04 07:02:21.371	f
630	63	10	f	2025-11-04 07:02:21.373	f
631	63	17	f	2025-11-04 07:02:21.377	f
632	63	20	f	2025-11-04 07:02:21.379	f
633	63	14	f	2025-11-04 07:02:21.382	f
634	62	1	f	2025-11-04 07:02:46.141	f
635	62	4	f	2025-11-04 07:02:46.145	f
636	62	5	f	2025-11-04 07:02:46.151	f
637	62	2	f	2025-11-04 07:02:46.154	f
638	62	3	f	2025-11-04 07:02:46.165	f
639	62	11	f	2025-11-04 07:02:46.169	f
640	62	6	f	2025-11-04 07:02:46.172	f
641	62	12	f	2025-11-04 07:02:46.175	f
642	62	15	f	2025-11-04 07:02:46.18	f
643	62	18	f	2025-11-04 07:02:46.183	f
644	62	7	f	2025-11-04 07:02:46.187	f
645	62	8	f	2025-11-04 07:02:46.19	f
646	62	13	f	2025-11-04 07:02:46.195	f
647	62	16	f	2025-11-04 07:02:46.197	f
648	62	19	f	2025-11-04 07:02:46.199	f
649	62	9	f	2025-11-04 07:02:46.202	f
650	62	10	f	2025-11-04 07:02:46.205	f
651	62	17	f	2025-11-04 07:02:46.208	f
652	62	20	f	2025-11-04 07:02:46.22	f
653	62	14	f	2025-11-04 07:02:46.224	f
656	64	5	f	2025-11-04 07:04:28.561	f
658	64	3	f	2025-11-04 07:04:28.57	f
659	64	11	f	2025-11-04 07:04:28.572	f
660	64	6	f	2025-11-04 07:04:28.574	f
661	64	12	f	2025-11-04 07:04:28.576	f
663	64	18	f	2025-11-04 07:04:28.582	f
664	64	7	f	2025-11-04 07:04:28.588	f
665	64	8	f	2025-11-04 07:04:28.59	f
666	64	13	f	2025-11-04 07:04:28.594	f
667	64	16	f	2025-11-04 07:04:28.598	f
668	64	19	f	2025-11-04 07:04:28.6	f
669	64	9	f	2025-11-04 07:04:28.603	f
670	64	10	f	2025-11-04 07:04:28.605	f
671	64	17	f	2025-11-04 07:04:28.61	f
672	64	20	f	2025-11-04 07:04:28.612	f
673	64	14	f	2025-11-04 07:04:28.614	f
654	64	1	t	2025-11-04 07:17:00.658	f
655	64	4	t	2025-11-04 07:17:00.666	f
662	64	15	t	2025-11-04 07:17:00.672	f
614	63	1	t	2025-11-04 07:33:59.04	f
623	63	18	t	2025-11-04 07:33:59.059	f
657	64	2	t	2025-11-04 08:50:35.385	f
716	66	7	f	2025-11-06 16:26:52.47	f
725	66	14	f	2025-11-06 16:26:52.499	f
753	68	12	f	2025-11-21 06:18:24.982	f
754	68	15	f	2025-11-21 06:18:24.987	f
755	68	18	f	2025-11-21 06:18:24.989	f
756	68	7	f	2025-11-21 06:18:24.992	f
757	68	8	f	2025-11-21 06:18:24.994	f
758	68	13	f	2025-11-21 06:18:24.996	f
759	68	16	f	2025-11-21 06:18:24.998	f
760	68	19	f	2025-11-21 06:18:25.001	f
761	68	9	f	2025-11-21 06:18:25.003	f
726	67	1	f	2025-11-07 02:39:25.914	f
727	67	4	f	2025-11-07 02:39:25.921	f
728	67	5	f	2025-11-07 02:39:25.924	f
729	67	2	f	2025-11-07 02:39:25.927	f
730	67	3	f	2025-11-07 02:39:25.929	f
731	67	11	f	2025-11-07 02:39:25.933	f
732	67	6	f	2025-11-07 02:39:25.936	f
733	67	12	f	2025-11-07 02:39:25.939	f
734	67	15	f	2025-11-07 02:39:25.941	f
735	67	18	f	2025-11-07 02:39:25.944	f
736	67	7	f	2025-11-07 02:39:25.946	f
737	67	8	f	2025-11-07 02:39:25.95	f
738	67	13	f	2025-11-07 02:39:25.953	f
739	67	16	f	2025-11-07 02:39:25.955	f
740	67	19	f	2025-11-07 02:39:25.963	f
741	67	9	f	2025-11-07 02:39:25.969	f
742	67	10	f	2025-11-07 02:39:25.971	f
743	67	17	f	2025-11-07 02:39:25.974	f
744	67	20	f	2025-11-07 02:39:25.976	f
745	67	14	f	2025-11-07 02:39:25.979	f
706	66	1	t	2025-11-06 16:30:38.322	t
762	68	10	f	2025-11-21 06:18:25.005	f
720	66	19	t	2025-11-07 03:48:56.896	f
721	66	9	t	2025-11-07 03:48:56.899	f
707	66	4	t	2025-11-07 00:52:55.56	t
763	68	17	f	2025-11-21 06:18:25.007	f
719	66	16	t	2025-11-07 04:22:36.545	f
708	66	5	t	2025-11-07 00:54:26.889	t
718	66	13	t	2025-11-07 05:33:35.602	f
724	66	20	t	2025-11-07 05:49:11.771	f
709	66	2	t	2025-11-06 16:32:28.207	t
711	66	11	t	2025-11-07 01:11:34.515	t
713	66	12	t	2025-11-07 03:21:46.493	t
710	66	3	t	2025-11-07 00:52:55.565	t
712	66	6	t	2025-11-07 04:22:36.534	t
722	66	10	t	2025-11-07 07:45:00.212	f
723	66	17	t	2025-11-07 08:16:00.582	f
714	66	15	t	2025-11-06 16:30:38.336	t
715	66	18	t	2025-11-07 00:52:55.574	t
717	66	8	t	2025-11-07 01:25:42.236	t
746	68	1	f	2025-11-21 06:18:24.901	f
747	68	4	f	2025-11-21 06:18:24.967	f
748	68	5	f	2025-11-21 06:18:24.97	f
749	68	2	f	2025-11-21 06:18:24.973	f
750	68	3	f	2025-11-21 06:18:24.975	f
751	68	11	f	2025-11-21 06:18:24.977	f
752	68	6	f	2025-11-21 06:18:24.98	f
764	68	20	f	2025-11-21 06:18:25.009	f
765	68	14	f	2025-11-21 06:18:25.026	f
\.


--
-- Data for Name: WordFound; Type: TABLE DATA; Schema: public; Owner: letterland_admin
--

COPY public."WordFound" (id, "userId", "questionId", word, "foundAt", "gameId") FROM stdin;
1768	45	1736	modern	2025-10-28 20:48:36.599	652
1769	45	1732	asylum	2025-10-28 20:48:36.599	652
1770	45	1731	painting	2025-10-28 20:48:36.599	652
1771	45	1733	village	2025-10-28 20:48:36.599	652
1772	45	1735	brother	2025-10-28 20:48:36.599	652
1773	45	1734	cypress	2025-10-28 20:48:36.599	652
1812	47	1775	engine	2025-10-30 15:16:27.514	660
1813	47	1773	start	2025-10-30 15:16:27.514	660
1814	47	1772	road	2025-10-30 15:16:27.514	660
1815	47	1777	wheel	2025-10-30 15:16:27.514	660
1816	47	1776	drive	2025-10-30 15:16:27.514	660
1817	47	1774	fuel	2025-10-30 15:16:27.514	660
1856	45	1831	ubiquitous	2025-10-30 17:31:07.139	670
1857	45	1829	enervated	2025-10-30 17:31:07.139	670
1858	45	1832	iconoclastic	2025-10-30 17:31:07.139	670
1859	45	1830	paradigmatic	2025-10-30 17:31:07.139	670
1860	45	1833	resurgence	2025-10-30 17:31:07.139	670
1861	45	1828	amalgamated	2025-10-30 17:31:07.139	670
1909	45	1904	monophyletic	2025-10-31 11:12:04.583	685
1910	45	1905	ethology	2025-10-31 11:12:04.583	685
1911	45	1902	domesticated	2025-10-31 11:12:04.583	685
1912	45	1903	hydrothermal	2025-10-31 11:12:04.583	685
1913	45	1906	blastula	2025-10-31 11:12:04.583	685
1914	45	1907	coevolutions	2025-10-31 11:12:04.583	685
1957	45	1963	resoluteness	2025-10-31 15:22:51.373	695
1958	45	1962	vicissitudes	2025-10-31 15:22:51.373	695
1959	45	1959	guillessness	2025-10-31 15:22:51.373	695
1960	45	1960	equanimity	2025-10-31 15:22:51.373	695
1961	45	1961	rectitude	2025-10-31 15:22:51.373	695
1992	61	1994	system	2025-11-01 13:21:51.919	701
1993	61	1999	deploy	2025-11-01 13:21:51.919	701
1994	61	1997	coding	2025-11-01 13:21:51.919	701
1995	61	1996	process	2025-11-01 13:21:51.919	701
1996	61	1998	testing	2025-11-01 13:21:51.919	701
1997	61	1995	feedback	2025-11-01 13:21:51.919	701
2026	10	1950	camp	2025-11-04 11:21:41.508	710
1756	45	1720	pedigree	2025-10-28 20:07:31.347	644
1757	45	1723	doom	2025-10-28 20:07:31.347	644
1758	45	1722	adumbration	2025-10-28 20:07:31.347	644
1759	45	1721	consummation	2025-10-28 20:07:31.347	644
1760	45	1724	inchoate	2025-10-28 20:07:31.347	644
1761	45	1719	giallo	2025-10-28 20:07:31.347	644
2027	10	1955	lake	2025-11-04 11:21:41.508	710
2028	10	1954	film	2025-11-04 11:21:41.508	710
2029	10	1953	scary	2025-11-04 11:21:41.508	710
2030	10	1952	night	2025-11-04 11:21:41.508	710
2031	10	1951	mask	2025-11-04 11:21:41.508	710
2080	66	2036	lit	2025-11-07 01:54:01.762	723
2081	66	2040	box	2025-11-07 01:54:01.762	723
2082	66	2039	read	2025-11-07 01:54:01.762	723
2083	66	2037	game	2025-11-07 01:54:01.762	723
2084	66	2038	key	2025-11-07 01:54:01.762	723
2085	66	2041	see	2025-11-07 01:54:01.762	723
2127	66	2074	book	2025-11-07 03:12:05.143	732
2128	66	2075	wand	2025-11-07 03:12:05.143	732
2129	66	2076	castle	2025-11-07 03:12:05.143	732
2130	66	2073	spell	2025-11-07 03:12:05.143	732
2131	66	2072	friend	2025-11-07 03:12:05.143	732
2132	66	2071	flying	2025-11-07 03:12:05.143	732
2172	66	2112	lion	2025-11-07 04:18:39.551	741
2173	66	2115	horse	2025-11-07 04:18:39.551	741
2174	66	2110	tiger	2025-11-07 04:18:39.551	741
2175	66	2113	swim	2025-11-07 04:18:39.551	741
2176	66	2114	wings	2025-11-07 04:18:39.551	741
2177	66	2111	bear	2025-11-07 04:18:39.551	741
2178	66	2093	gastronomy	2025-11-07 04:22:18.973	742
2179	66	2095	ingredient	2025-11-07 04:22:18.973	742
1021	1	751	portal	2025-09-16 14:20:46.778	208
1022	1	759	meeseeks	2025-09-16 14:20:46.778	208
1023	1	757	sorry	2025-09-16 14:20:46.778	208
1024	1	755	wubba	2025-09-16 14:20:46.778	208
1025	1	750	morty	2025-09-16 14:20:46.778	208
1026	1	752	wrick	2025-09-16 14:20:46.778	208
1027	1	756	scifi	2025-09-16 14:20:46.778	208
1028	1	754	bastion	2025-09-16 14:20:46.778	208
1029	1	753	jam	2025-09-16 14:20:46.778	208
1030	1	758	adultswim	2025-09-16 14:20:46.778	208
2180	66	2092	nutritious	2025-11-07 04:22:18.973	742
2181	66	2097	appetite	2025-11-07 04:22:18.973	742
2182	66	2094	provisions	2025-11-07 04:22:18.973	742
2183	66	2096	perishable	2025-11-07 04:22:18.973	742
2214	66	2097	appetite	2025-11-07 05:18:46.908	748
2215	66	2093	gastronomy	2025-11-07 05:18:46.908	748
2216	66	2094	provisions	2025-11-07 05:18:46.908	748
2217	66	2096	perishable	2025-11-07 05:18:46.908	748
2218	66	2092	nutritious	2025-11-07 05:18:46.908	748
2219	66	2095	ingredient	2025-11-07 05:18:46.908	748
2244	1	2164	soup	2025-11-07 06:12:00.444	754
2245	1	2169	water	2025-11-07 06:12:00.444	754
2246	1	2165	milk	2025-11-07 06:12:00.444	754
2247	1	2167	bread	2025-11-07 06:12:00.444	754
2248	1	2166	cake	2025-11-07 06:12:00.444	754
2249	1	2168	apple	2025-11-07 06:12:00.444	754
2264	66	2189	book	2025-11-07 06:57:30.754	758
2265	66	2185	study	2025-11-07 06:57:30.754	758
2266	66	2184	learn	2025-11-07 06:57:30.754	758
2267	66	2187	pupil	2025-11-07 06:57:30.754	758
2268	66	2186	lesson	2025-11-07 06:57:30.754	758
2269	66	2188	class	2025-11-07 06:57:30.754	758
2287	66	2201	control	2025-11-07 07:24:58.947	762
2288	66	2204	engineer	2025-11-07 07:24:58.947	762
2289	66	2203	sensors	2025-11-07 07:24:58.947	762
2290	66	2202	machine	2025-11-07 07:24:58.947	762
2291	66	2206	future	2025-11-07 07:24:58.947	762
2292	66	2205	program	2025-11-07 07:24:58.947	762
2298	66	2220	apple	2025-11-07 07:41:04.38	765
2299	66	2217	grape	2025-11-07 07:41:04.38	765
2300	66	2221	sweet	2025-11-07 07:41:04.38	765
2301	66	2222	orange	2025-11-07 07:41:04.38	765
2302	66	2218	pear	2025-11-07 07:41:04.38	765
2303	66	2219	juice	2025-11-07 07:41:04.38	765
2310	66	2234	mora	2025-11-07 07:53:59.7	767
2311	66	2231	ascension	2025-11-07 07:53:59.7	767
2312	66	2230	narrative	2025-11-07 07:53:59.7	767
2313	66	2232	weapon	2025-11-07 07:53:59.7	767
2314	66	2229	optimize	2025-11-07 07:53:59.7	767
2315	66	2233	talents	2025-11-07 07:53:59.7	767
2321	66	2236	action	2025-11-07 08:01:41.187	768
2322	66	2245	compete	2025-11-07 08:15:46.537	769
1762	45	1729	assimilation	2025-10-28 20:12:26.62	647
1763	45	1728	distortion	2025-10-28 20:12:26.62	647
1774	46	834	plushtoy	2025-10-29 04:23:23.789	653
1775	46	840	global	2025-10-29 04:23:23.789	653
1776	46	837	oxford	2025-10-29 04:23:23.789	653
1777	46	839	nineteen	2025-10-29 04:23:23.789	653
1778	46	838	farcical	2025-10-29 04:23:23.789	653
1779	46	835	atkinson	2025-10-29 04:23:23.789	653
1764	45	1726	protagonist	2025-10-28 20:12:26.62	647
1765	45	1730	multiplicity	2025-10-28 20:12:26.62	647
1766	45	1725	obliteration	2025-10-28 20:12:26.62	647
1767	45	1727	uncertainty	2025-10-28 20:12:26.62	647
1780	46	841	england	2025-10-29 04:23:23.789	653
1781	46	842	fifteen	2025-10-29 04:23:23.789	653
1649	43	1495	obesity	2025-10-20 10:16:25.091	594
1650	43	1497	stress	2025-10-20 10:16:25.091	594
1651	43	1494	yoga	2025-10-20 10:16:25.091	594
1652	43	1496	physician	2025-10-20 10:16:25.091	594
1671	10	1539	guard	2025-10-20 17:53:26.153	608
1672	10	1540	safe	2025-10-20 17:53:26.153	608
1673	10	1541	risk	2025-10-20 17:53:26.153	608
1674	10	1543	virus	2025-10-20 17:53:26.153	608
1675	10	1542	watch	2025-10-20 17:53:26.153	608
1676	10	1544	block	2025-10-20 17:53:26.153	608
1818	47	1779	gasoline	2025-10-30 15:20:17.497	661
1819	47	1783	assembly	2025-10-30 15:20:17.497	661
1820	47	1782	highways	2025-10-30 15:20:17.497	661
1821	47	1780	airbags	2025-10-30 15:20:17.497	661
1822	47	1781	electric	2025-10-30 15:20:17.497	661
1823	47	1778	journey	2025-10-30 15:20:17.497	661
1708	2	1570	block	2025-10-28 05:45:13.114	616
1709	2	1571	build	2025-10-28 05:45:13.114	616
1710	2	1569	plan	2025-10-28 05:45:13.114	616
1711	2	1574	parts	2025-10-28 05:45:13.114	616
1712	2	1572	store	2025-10-28 05:45:13.114	616
1713	2	1573	does	2025-10-28 05:45:13.114	616
1726	2	1552	park	2025-10-28 10:09:09.554	619
1727	2	1556	fuel	2025-10-28 10:09:09.554	619
1728	2	1555	wheel	2025-10-28 10:09:09.554	619
1729	2	1551	drive	2025-10-28 10:09:09.554	619
1730	2	1553	road	2025-10-28 10:09:09.554	619
1731	2	1554	taxi	2025-10-28 10:09:09.554	619
1862	45	1839	warlords	2025-10-30 17:36:50.151	671
1863	45	1835	ancient	2025-10-30 17:36:50.151	671
1864	45	1838	dynasty	2025-10-30 17:36:50.151	671
1865	45	1837	empires	2025-10-30 17:36:50.151	671
1866	45	1836	compass	2025-10-30 17:36:50.151	671
1867	45	1834	silkroad	2025-10-30 17:36:50.151	671
1750	45	1716	pearl	2025-10-28 19:10:13.095	643
1751	45	1714	museum	2025-10-28 19:10:13.095	643
1752	45	1717	dutch	2025-10-28 19:10:13.095	643
1753	45	1718	paint	2025-10-28 19:10:13.095	643
1754	45	1715	turban	2025-10-28 19:10:13.095	643
1755	45	1713	girl	2025-10-28 19:10:13.095	643
1915	45	1908	ethology	2025-10-31 11:17:48.221	686
1916	45	1913	metazoan	2025-10-31 11:17:48.221	686
1917	45	1910	blastopore	2025-10-31 11:17:48.221	686
1918	45	1909	eukaryota	2025-10-31 11:17:48.221	686
1919	45	1911	ecdysozoa	2025-10-31 11:17:48.221	686
1920	45	1912	blastula	2025-10-31 11:17:48.221	686
1962	45	1968	compassion	2025-10-31 15:28:43.02	696
1963	45	1969	redemption	2025-10-31 15:28:43.02	696
1964	45	1964	profundity	2025-10-31 15:28:43.02	696
1965	45	1965	penitentiary	2025-10-31 15:28:43.02	696
1966	45	1967	transcendent	2025-10-31 15:28:43.02	696
1967	45	1966	conundrum	2025-10-31 15:28:43.02	696
1998	45	1878	bird	2025-11-01 13:32:48.223	703
1999	45	1879	fish	2025-11-01 13:32:48.223	703
2000	45	1880	egg	2025-11-01 13:32:48.223	703
2001	45	1883	dog	2025-11-01 13:32:48.223	703
2002	45	1882	cat	2025-11-01 13:32:48.223	703
2003	45	1881	cow	2025-11-01 13:32:48.223	703
2032	45	2018	tables	2025-11-06 13:42:51.286	711
2033	45	2023	subsets	2025-11-06 13:42:51.286	711
2034	45	2019	knapsack	2025-11-06 13:42:51.286	711
2035	45	2022	planning	2025-11-06 13:42:51.286	711
2036	45	2021	matrix	2025-11-06 13:42:51.286	711
2037	45	2020	method	2025-11-06 13:42:51.286	711
2086	10	2027	eat	2025-11-07 02:05:34.656	724
2087	10	2026	big	2025-11-07 02:05:34.656	724
2088	10	2029	pond	2025-11-07 02:05:34.656	724
2089	10	2028	swim	2025-11-07 02:05:34.656	724
2090	10	2025	wet	2025-11-07 02:05:34.656	724
2091	10	2024	fur	2025-11-07 02:05:34.656	724
2133	66	2077	automobile	2025-11-07 03:21:04.531	734
2134	66	2078	dashboard	2025-11-07 03:21:04.531	734
2135	66	2079	emission	2025-11-07 03:21:04.531	734
2136	66	2080	navigation	2025-11-07 03:21:04.531	734
2137	66	2081	suspension	2025-11-07 03:21:04.531	734
2138	66	2082	headlights	2025-11-07 03:21:04.531	734
2139	66	2005	system	2025-11-07 03:24:01.869	735
2140	66	2001	priority	2025-11-07 03:24:01.869	735
2141	66	2004	search	2025-11-07 03:24:01.869	735
2142	66	2003	network	2025-11-07 03:24:01.869	735
2143	66	2002	delete	2025-11-07 03:24:01.869	735
2144	66	2000	history	2025-11-07 03:24:01.869	735
2184	66	1883	dog	2025-11-07 04:24:24.6	743
2185	66	1881	cow	2025-11-07 04:24:24.6	743
2186	66	1882	cat	2025-11-07 04:24:24.6	743
2187	66	1880	egg	2025-11-07 04:24:24.6	743
2188	66	1879	fish	2025-11-07 04:24:24.6	743
2189	66	1878	bird	2025-11-07 04:24:24.6	743
2220	66	2048	dog	2025-11-07 05:33:19.635	749
2221	66	2051	cow	2025-11-07 05:33:19.635	749
2222	66	2050	duck	2025-11-07 05:33:19.635	749
2223	66	2049	pig	2025-11-07 05:33:19.635	749
2224	66	2053	fish	2025-11-07 05:33:19.635	749
2225	66	2052	cat	2025-11-07 05:33:19.635	749
2250	66	2170	simulate	2025-11-07 06:32:21.124	755
2251	66	2173	automation	2025-11-07 06:32:21.124	755
2252	66	2172	cognitive	2025-11-07 06:32:21.124	755
2253	66	2171	framework	2025-11-07 06:32:21.124	755
2254	66	2174	algorithm	2025-11-07 06:32:21.124	755
2270	66	2146	scope	2025-11-07 07:06:57.532	759
2271	66	2150	framework	2025-11-07 07:06:57.532	759
2272	66	2147	bias	2025-11-07 07:06:57.532	759
2273	66	2151	strategy	2025-11-07 07:06:57.532	759
2274	66	2149	assessment	2025-11-07 07:06:57.532	759
2275	66	2148	objective	2025-11-07 07:06:57.532	759
2293	66	2213	sustenance	2025-11-07 07:35:58.56	764
2294	66	2212	nutrients	2025-11-07 07:35:58.56	764
1782	46	1740	headlight	2025-10-29 04:26:52.87	654
1783	46	1739	automobile	2025-10-29 04:26:52.87	654
1784	46	1742	emissions	2025-10-29 04:26:52.87	654
1785	46	1737	suspension	2025-10-29 04:26:52.87	654
1786	46	1738	ignition	2025-10-29 04:26:52.87	654
1787	46	1741	dashboard	2025-10-29 04:26:52.87	654
1824	45	1787	gasoline	2025-10-30 15:27:35.029	662
1825	45	1784	autonomous	2025-10-30 15:27:35.029	662
1826	45	1786	revolution	2025-10-30 15:27:35.029	662
1827	45	1788	innovation	2025-10-30 15:27:35.029	662
1828	45	1789	affordable	2025-10-30 15:27:35.029	662
1829	45	1785	automobile	2025-10-30 15:27:35.029	662
1868	45	1843	archival	2025-10-30 17:47:19.214	672
1869	45	1844	sensitized	2025-10-30 17:47:19.214	672
1870	45	1841	predecessor	2025-10-30 17:47:19.214	672
1871	45	1842	emulsion	2025-10-30 17:47:19.214	672
1872	45	1840	viewfinder	2025-10-30 17:47:19.214	672
1921	45	1916	combustion	2025-10-31 11:26:16.454	687
1922	45	1919	innovation	2025-10-31 11:26:16.454	687
1923	45	1915	legislation	2025-10-31 11:26:16.454	687
1924	45	1914	affordable	2025-10-31 11:26:16.454	687
1925	45	1917	ubiquity	2025-10-31 11:26:16.454	687
1926	45	1918	aerodynamic	2025-10-31 11:26:16.454	687
1968	45	1974	killer	2025-11-01 09:34:25.816	697
1969	45	1971	mystery	2025-11-01 09:34:25.816	697
1970	45	1975	suspense	2025-11-01 09:34:25.816	697
1114	1	835	atkinson	2025-09-19 14:31:10.642	218
1115	1	837	oxford	2025-09-19 14:31:10.642	218
1116	1	841	england	2025-09-19 14:31:10.642	218
1117	1	836	overcoat	2025-09-19 14:31:10.642	218
1118	1	838	farcical	2025-09-19 14:31:10.642	218
1119	1	842	fifteen	2025-09-19 14:31:10.642	218
1120	1	839	nineteen	2025-09-19 14:31:10.642	218
1121	1	840	global	2025-09-19 14:31:10.642	218
1122	1	834	plushtoy	2025-09-19 14:31:10.642	218
1123	1	835	atkinson	2025-09-19 17:19:47.431	220
1124	1	837	oxford	2025-09-19 17:19:47.431	220
1125	1	841	england	2025-09-19 17:19:47.431	220
1126	1	836	overcoat	2025-09-19 17:19:47.431	220
1127	1	838	farcical	2025-09-19 17:19:47.431	220
1128	1	842	fifteen	2025-09-19 17:19:47.431	220
1129	1	839	nineteen	2025-09-19 17:19:47.431	220
1130	1	840	global	2025-09-19 17:19:47.431	220
1131	1	834	plushtoy	2025-09-19 17:19:47.431	220
1132	1	863	adult	2025-09-19 17:56:52.355	223
1133	1	864	improper	2025-09-19 17:56:52.355	223
1134	1	862	grown	2025-09-19 17:56:52.355	223
1135	1	867	illegal	2025-09-19 17:56:52.355	223
1136	1	865	close	2025-09-19 17:56:52.355	223
1137	1	868	message	2025-09-19 17:56:52.355	223
1138	1	861	nsfw	2025-09-19 17:56:52.355	223
1139	1	866	movie	2025-09-19 17:56:52.355	223
1140	1	869	harass	2025-09-19 18:41:43.231	224
1141	1	873	pensive	2025-09-19 18:41:43.231	224
1142	1	871	educate	2025-09-19 18:41:43.231	224
1143	1	872	compose	2025-09-19 18:41:43.231	224
1144	1	870	putter	2025-09-19 18:41:43.231	224
1145	1	869	harass	2025-09-22 09:24:04.762	225
1146	1	872	compose	2025-09-22 09:24:04.762	225
1147	1	871	educate	2025-09-22 09:24:04.762	225
1148	1	873	pensive	2025-09-22 09:24:04.762	225
1149	1	870	putter	2025-09-22 09:24:04.762	225
1150	1	835	atkinson	2025-09-23 06:15:19.651	227
1151	1	837	oxford	2025-09-23 06:15:19.651	227
1152	1	841	england	2025-09-23 06:15:19.651	227
1153	1	836	overcoat	2025-09-23 06:15:19.651	227
1154	1	838	farcical	2025-09-23 06:15:19.651	227
1155	1	842	fifteen	2025-09-23 06:15:19.651	227
1156	1	839	nineteen	2025-09-23 06:15:19.651	227
1157	1	840	global	2025-09-23 06:15:19.651	227
1158	1	834	plushtoy	2025-09-23 06:15:19.651	227
1159	10	869	harass	2025-09-23 06:18:58.292	228
1160	10	873	pensive	2025-09-23 06:18:58.292	228
1161	10	871	educate	2025-09-23 06:18:58.292	228
1162	10	872	compose	2025-09-23 06:18:58.292	228
1163	10	870	putter	2025-09-23 06:18:58.292	228
1164	10	863	adult	2025-09-23 06:54:54.909	229
1165	10	864	improper	2025-09-23 06:54:54.909	229
1166	10	862	grown	2025-09-23 06:54:54.909	229
1167	10	868	message	2025-09-23 06:54:54.909	229
1168	10	867	illegal	2025-09-23 06:54:54.909	229
1169	10	861	nsfw	2025-09-23 06:54:54.909	229
1170	10	866	movie	2025-09-23 06:54:54.909	229
1171	10	865	close	2025-09-23 06:54:54.909	229
1178	32	832	find	2025-10-01 10:23:59.361	154
1179	32	826	pc	2025-10-01 10:23:59.361	154
1180	32	825	computer	2025-10-01 10:23:59.361	154
1181	32	831	facts	2025-10-01 10:23:59.361	154
1182	32	833	keyboard	2025-10-01 10:23:59.361	154
1183	32	830	reduce	2025-10-01 10:23:59.361	154
1184	32	828	display	2025-10-01 10:23:59.361	154
1185	32	829	symbols	2025-10-01 10:23:59.361	154
1186	32	827	cpu	2025-10-01 10:23:59.361	154
1187	1	874	vomit	2025-10-01 11:24:00.465	238
1188	1	877	pretty	2025-10-01 11:24:00.465	238
1189	1	876	whir	2025-10-01 11:24:00.465	238
1190	1	875	babycat	2025-10-01 11:24:00.465	238
1191	10	782	tower	2025-10-04 12:51:04.088	136
1192	10	780	rapunzel	2025-10-04 12:51:04.088	136
1193	10	785	curly	2025-10-04 12:51:04.088	136
1194	10	787	cause	2025-10-04 12:51:04.088	136
1195	10	788	love	2025-10-04 12:51:04.088	136
1196	10	784	flower	2025-10-04 12:51:04.088	136
1197	10	783	climb	2025-10-04 12:51:04.088	136
1198	10	781	long	2025-10-04 12:51:04.088	136
1199	10	786	potion	2025-10-04 12:51:04.088	136
1200	10	789	end	2025-10-04 12:51:04.088	136
1201	10	869	harass	2025-10-04 13:09:27.56	243
1202	10	873	pensive	2025-10-04 13:09:27.56	243
1203	10	871	educate	2025-10-04 13:09:27.56	243
1204	10	872	compose	2025-10-04 13:09:27.56	243
1205	10	870	putter	2025-10-04 13:09:27.56	243
1206	10	750	morty	2025-10-04 13:10:54.963	189
1207	10	755	wubba	2025-10-04 13:10:54.963	189
1208	10	754	bastion	2025-10-04 13:10:54.963	189
1209	10	753	jam	2025-10-04 13:10:54.963	189
1210	10	752	wrick	2025-10-04 13:10:54.963	189
1211	10	751	portal	2025-10-04 13:10:54.963	189
1212	10	756	scifi	2025-10-04 13:10:54.963	189
1213	10	758	adultswim	2025-10-04 13:10:54.963	189
1214	10	759	meeseeks	2025-10-04 13:10:54.963	189
1215	10	757	sorry	2025-10-04 13:10:54.963	189
1216	10	869	harass	2025-10-06 13:48:59.646	250
1217	10	872	compose	2025-10-06 13:48:59.646	250
1218	10	873	pensive	2025-10-06 13:48:59.646	250
1219	10	871	educate	2025-10-06 13:48:59.646	250
1220	10	870	putter	2025-10-06 13:48:59.646	250
1788	46	1747	blossom	2025-10-29 04:30:41.186	655
1789	46	1744	petals	2025-10-29 04:30:41.186	655
1790	46	1745	evolved	2025-10-29 04:30:41.186	655
1791	46	1743	survival	2025-10-29 04:30:41.186	655
1792	46	1746	stamens	2025-10-29 04:30:41.186	655
1793	46	1748	pollen	2025-10-29 04:30:41.186	655
1830	45	1791	sustainable	2025-10-30 15:40:21.813	663
1831	45	1792	performance	2025-10-30 15:40:21.813	663
1832	45	1790	autonomously	2025-10-30 15:40:21.813	663
1833	45	1793	connectivity	2025-10-30 15:40:21.813	663
1231	10	753	jam	2025-10-07 09:18:22.734	255
1232	10	751	portal	2025-10-07 09:18:22.734	255
1233	10	759	meeseeks	2025-10-07 09:18:22.734	255
1234	10	754	bastion	2025-10-07 09:18:22.734	255
1235	10	750	morty	2025-10-07 09:18:22.734	255
1236	10	752	wrick	2025-10-07 09:18:22.734	255
1237	10	756	scifi	2025-10-07 09:18:22.734	255
1238	10	755	wubba	2025-10-07 09:18:22.734	255
1239	10	757	sorry	2025-10-07 09:18:22.734	255
1240	10	758	adultswim	2025-10-07 09:18:22.734	255
1873	45	1851	contrarian	2025-10-30 18:26:10.644	674
1874	45	1852	goad	2025-10-30 18:26:10.644	674
1875	45	1856	ethos	2025-10-30 18:26:10.644	674
1876	45	1855	empyreumatic	2025-10-30 18:26:10.644	674
1877	45	1853	prerogative	2025-10-30 18:26:10.644	674
1878	45	1854	polemic	2025-10-30 18:26:10.644	674
1927	47	1923	road	2025-10-31 11:30:19.215	688
1928	47	1924	drive	2025-10-31 11:30:19.215	688
1929	47	1925	fuel	2025-10-31 11:30:19.215	688
1930	47	1922	wheel	2025-10-31 11:30:19.215	688
1931	47	1920	auto	2025-10-31 11:30:19.215	688
1932	47	1921	brake	2025-10-31 11:30:19.215	688
1971	45	1973	disguise	2025-11-01 09:34:25.816	697
1972	45	1970	victims	2025-11-01 09:34:25.816	697
1973	45	1972	revenge	2025-11-01 09:34:25.816	697
2004	64	2003	network	2025-11-04 07:16:54.889	704
2005	64	2005	system	2025-11-04 07:16:54.889	704
2006	64	2001	priority	2025-11-04 07:16:54.889	704
2007	64	2004	search	2025-11-04 07:16:54.889	704
2008	64	2002	delete	2025-11-04 07:16:54.889	704
2009	64	2000	history	2025-11-04 07:16:54.889	704
2038	66	1786	revolution	2025-11-06 16:30:35.407	712
2039	66	1787	gasoline	2025-11-06 16:30:35.407	712
2040	66	1788	innovation	2025-11-06 16:30:35.407	712
2041	66	1789	affordable	2025-11-06 16:30:35.407	712
2042	66	1785	automobile	2025-11-06 16:30:35.407	712
2043	66	1784	autonomous	2025-11-06 16:30:35.407	712
2044	66	1766	car	2025-11-06 16:32:26.225	713
2045	66	1768	new	2025-11-06 16:32:26.225	713
2046	66	1770	old	2025-11-06 16:32:26.225	713
2047	66	1771	road	2025-11-06 16:32:26.225	713
2048	66	1767	big	2025-11-06 16:32:26.225	713
2049	66	1769	fast	2025-11-06 16:32:26.225	713
2092	66	2049	pig	2025-11-07 02:18:39.564	726
1275	10	779	jealousy	2025-10-09 10:10:34.055	299
1276	10	773	osculation	2025-10-09 10:10:34.055	299
1277	10	776	justice	2025-10-09 10:10:34.055	299
1278	10	774	grimm	2025-10-09 10:10:34.055	299
1279	10	775	peach	2025-10-09 10:10:34.055	299
1280	10	777	mirror	2025-10-09 10:10:34.055	299
1281	10	772	dwarfs	2025-10-09 10:10:34.055	299
1282	10	778	unsettling	2025-10-09 10:10:34.055	299
1283	10	771	maluspumila	2025-10-09 10:10:34.055	299
1284	10	770	stepmother	2025-10-09 10:10:34.055	299
2093	66	2051	cow	2025-11-07 02:18:39.564	726
2094	66	2052	cat	2025-11-07 02:18:39.564	726
2095	66	2050	duck	2025-11-07 02:18:39.564	726
2096	66	2053	fish	2025-11-07 02:18:39.564	726
2097	66	2048	dog	2025-11-07 02:18:39.564	726
2098	66	2013	shop	2025-11-07 02:23:02.79	727
2099	66	2014	money	2025-11-07 02:23:02.79	727
2100	66	2017	toys	2025-11-07 02:23:02.79	727
2101	66	2012	gift	2025-11-07 02:23:02.79	727
2102	66	2015	sell	2025-11-07 02:23:02.79	727
2103	66	2016	price	2025-11-07 02:23:02.79	727
2104	10	2013	shop	2025-11-07 02:23:16.168	728
2105	10	2014	money	2025-11-07 02:23:16.168	728
2106	10	2017	toys	2025-11-07 02:23:16.168	728
2107	10	2012	gift	2025-11-07 02:23:16.168	728
2108	10	2016	price	2025-11-07 02:23:16.168	728
2109	10	2015	sell	2025-11-07 02:23:16.168	728
2145	66	2083	narrative	2025-11-07 03:36:51.417	736
2146	66	2084	animation	2025-11-07 03:36:51.417	736
2147	66	2085	adaptation	2025-11-07 03:36:51.417	736
2148	66	2086	soundtrack	2025-11-07 03:36:51.417	736
2149	66	2087	phenomenon	2025-11-07 03:36:51.417	736
2150	66	2089	metropolis	2025-11-07 03:41:04.248	737
2151	66	2088	hub	2025-11-07 03:41:04.248	737
2152	66	2090	urban	2025-11-07 03:41:04.248	737
2153	66	2091	capital	2025-11-07 03:41:04.248	737
2190	66	2116	song	2025-11-07 04:33:22.515	744
2191	66	2118	piano	2025-11-07 04:33:22.515	744
2192	66	2117	band	2025-11-07 04:33:22.515	744
2193	66	2119	sing	2025-11-07 04:33:22.515	744
2194	66	2120	dance	2025-11-07 04:33:22.515	744
2195	66	2121	listen	2025-11-07 04:33:22.515	744
2226	66	2142	expression	2025-11-07 05:41:30.834	750
2227	66	2140	aesthetics	2025-11-07 05:41:30.834	750
2228	66	2145	exhibition	2025-11-07 05:41:30.834	750
2229	66	2141	appreciate	2025-11-07 05:41:30.834	750
2230	66	2143	creativity	2025-11-07 05:41:30.834	750
2231	66	2144	perception	2025-11-07 05:41:30.834	750
2255	66	2177	reef	2025-11-07 06:41:00.249	756
2256	66	2175	pelagic	2025-11-07 06:41:00.249	756
2257	66	2176	angler	2025-11-07 06:41:00.249	756
2276	66	2192	output	2025-11-07 07:11:40.418	760
2277	66	2191	media	2025-11-07 07:11:40.418	760
2278	66	2193	integrate	2025-11-07 07:11:40.418	760
2279	66	2194	modalities	2025-11-07 07:11:40.418	760
2280	66	2190	task	2025-11-07 07:11:40.418	760
2295	66	2214	peel	2025-11-07 07:35:58.56	764
2296	66	2216	pulp	2025-11-07 07:35:58.56	764
1794	47	1759	pollen	2025-10-29 04:43:06.135	657
1795	47	1755	worker	2025-10-29 04:43:06.135	657
1796	47	1756	nectar	2025-10-29 04:43:06.135	657
1797	47	1754	flower	2025-10-29 04:43:06.135	657
1798	47	1758	colony	2025-10-29 04:43:06.135	657
1799	47	1757	stinger	2025-10-29 04:43:06.135	657
1834	45	1797	mitigation	2025-10-30 15:44:29.809	664
1835	45	1796	amelioration	2025-10-30 15:44:29.809	664
1836	45	1795	inauguration	2025-10-30 15:44:29.809	664
1837	45	1794	telematics	2025-10-30 15:44:29.809	664
1879	45	1858	flavors	2025-10-30 18:35:12.326	675
1880	45	1861	galangal	2025-10-30 18:35:12.326	675
1881	45	1859	reflects	2025-10-30 18:35:12.326	675
1882	45	1862	harmony	2025-10-30 18:35:12.326	675
1883	45	1857	culture	2025-10-30 18:35:12.326	675
1884	45	1860	balance	2025-10-30 18:35:12.326	675
1933	59	1930	laughter	2025-10-31 14:26:51.391	689
1934	59	1927	symbol	2025-10-31 14:26:51.391	689
1935	59	1928	awakens	2025-10-31 14:26:51.391	689
1936	59	1929	villain	2025-10-31 14:26:51.391	689
1937	59	1931	horror	2025-10-31 14:26:51.391	689
1938	59	1926	entity	2025-10-31 14:26:51.391	689
1939	60	1937	spirits	2025-10-31 14:31:31.232	690
1940	60	1936	writer	2025-10-31 14:31:31.232	690
1941	60	1932	madness	2025-10-31 14:31:31.232	690
1942	60	1933	violence	2025-10-31 14:31:31.232	690
1943	60	1935	psychic	2025-10-31 14:31:31.232	690
1944	60	1934	terror	2025-10-31 14:31:31.232	690
1974	45	1977	retribution	2025-11-01 09:40:42.701	698
1975	45	1978	malediction	2025-11-01 09:40:42.701	698
1976	45	1979	hierophant	2025-11-01 09:40:42.701	698
1977	45	1981	interdiction	2025-11-01 09:40:42.701	698
1978	45	1980	desecration	2025-11-01 09:40:42.701	698
1979	45	1976	reanimation	2025-11-01 09:40:42.701	698
2010	63	1924	drive	2025-11-04 07:33:16.111	707
2011	63	1922	wheel	2025-11-04 07:33:16.111	707
2012	63	1923	road	2025-11-04 07:33:16.111	707
2013	63	1925	fuel	2025-11-04 07:33:16.111	707
2050	66	1717	dutch	2025-11-07 00:52:37.354	716
2051	66	1716	pearl	2025-11-07 00:52:37.354	716
2052	66	1718	paint	2025-11-07 00:52:37.354	716
2053	66	1713	girl	2025-11-07 00:52:37.354	716
2054	66	1714	museum	2025-11-07 00:52:37.354	716
2055	66	1715	turban	2025-11-07 00:52:37.354	716
2056	66	1878	bird	2025-11-07 00:54:23.391	717
2057	66	1879	fish	2025-11-07 00:54:23.391	717
2058	66	1880	egg	2025-11-07 00:54:23.391	717
2059	66	1883	dog	2025-11-07 00:54:23.391	717
2060	66	1881	cow	2025-11-07 00:54:23.391	717
2061	66	1882	cat	2025-11-07 00:54:23.391	717
1383	1	774	grimm	2025-10-09 14:43:16.427	337
1384	1	771	maluspumila	2025-10-09 14:43:16.427	337
1385	1	773	osculation	2025-10-09 14:43:16.427	337
1386	1	776	justice	2025-10-09 14:43:16.427	337
1387	1	778	unsettling	2025-10-09 14:43:16.427	337
1388	1	777	mirror	2025-10-09 14:43:16.427	337
1389	1	779	jealousy	2025-10-09 14:43:16.427	337
1390	1	775	peach	2025-10-09 14:43:16.427	337
1391	1	772	dwarfs	2025-10-09 14:43:16.427	337
1392	1	770	stepmother	2025-10-09 14:43:16.427	337
2110	66	2054	dinner	2025-11-07 02:35:12.038	729
2111	66	2055	protein	2025-11-07 02:35:12.038	729
2112	66	2056	flavor	2025-11-07 02:35:12.038	729
2113	66	2057	recipe	2025-11-07 02:35:12.038	729
2114	66	2058	healthy	2025-11-07 02:35:12.038	729
2115	66	2059	grocery	2025-11-07 02:35:12.038	729
2154	66	2094	provisions	2025-11-07 03:48:46.289	738
2155	66	2097	appetite	2025-11-07 03:48:46.289	738
2156	66	2096	perishable	2025-11-07 03:48:46.289	738
2157	66	2095	ingredient	2025-11-07 03:48:46.289	738
2158	66	2092	nutritious	2025-11-07 03:48:46.289	738
2159	66	2093	gastronomy	2025-11-07 03:48:46.289	738
2196	66	2127	heat	2025-11-07 04:38:48.466	745
2197	66	2125	color	2025-11-07 04:38:48.466	745
2198	66	2122	water	2025-11-07 04:38:48.466	745
2199	66	2124	test	2025-11-07 04:38:48.466	745
2200	66	2123	bubble	2025-11-07 04:38:48.466	745
2201	66	2126	mixed	2025-11-07 04:38:48.466	745
2232	66	2151	strategy	2025-11-07 05:48:43.698	751
2233	66	2146	scope	2025-11-07 05:48:43.698	751
2234	66	2148	objective	2025-11-07 05:48:43.698	751
2235	66	2149	assessment	2025-11-07 05:48:43.698	751
2236	66	2147	bias	2025-11-07 05:48:43.698	751
2237	66	2150	framework	2025-11-07 05:48:43.698	751
1677	10	1546	room	2025-10-20 19:03:56.34	610
1678	10	1548	house	2025-10-20 19:03:56.34	610
1679	10	1549	farm	2025-10-20 19:03:56.34	610
1680	10	1550	pets	2025-10-20 19:03:56.34	610
1681	10	1545	useful	2025-10-20 19:03:56.34	610
1682	10	1547	cook	2025-10-20 19:03:56.34	610
1701	2	1567	beer	2025-10-22 06:30:13.313	614
1702	2	1563	food	2025-10-22 06:30:13.313	614
1703	2	1565	tents	2025-10-22 06:30:13.313	614
1704	2	1566	rides	2025-10-22 06:30:13.313	614
1705	2	1568	munich	2025-10-22 06:30:13.313	614
1706	2	1564	music	2025-10-22 06:30:13.313	614
1714	10	1556	fuel	2025-10-28 09:08:42.073	617
1715	10	1554	taxi	2025-10-28 09:08:42.073	617
1716	10	1552	park	2025-10-28 09:08:42.073	617
1717	10	1555	wheel	2025-10-28 09:08:42.073	617
1718	10	1551	drive	2025-10-28 09:08:42.073	617
1719	10	1553	road	2025-10-28 09:08:42.073	617
1443	2	751	portal	2025-10-10 17:06:16.292	375
1444	2	753	jam	2025-10-10 17:06:16.292	375
1445	2	759	meeseeks	2025-10-10 17:06:16.292	375
1446	2	754	bastion	2025-10-10 17:06:16.292	375
1447	2	750	morty	2025-10-10 17:06:16.292	375
1448	2	752	wrick	2025-10-10 17:06:16.292	375
1449	2	756	scifi	2025-10-10 17:06:16.292	375
1450	2	757	sorry	2025-10-10 17:06:16.292	375
1451	2	758	adultswim	2025-10-10 17:06:16.292	375
1452	2	755	wubba	2025-10-10 17:06:16.292	375
1460	10	1036	cherry	2025-10-11 16:31:47.198	396
1461	10	1034	show	2025-10-11 16:31:47.198	396
1462	10	1035	pet	2025-10-11 16:31:47.198	396
1463	10	1033	truck	2025-10-11 16:31:47.198	396
1464	10	1032	puzzle	2025-10-11 16:31:47.198	396
1465	10	1041	person	2025-10-11 16:48:26.788	398
1466	10	1037	man	2025-10-11 16:48:26.788	398
1467	10	1038	fix	2025-10-11 16:48:26.788	398
1468	10	1042	citizen	2025-10-11 16:48:26.788	398
1469	10	1039	lead	2025-10-11 16:48:26.788	398
1470	10	1040	network	2025-10-11 16:48:26.788	398
1471	2	1038	fix	2025-10-12 12:52:42.664	438
1472	2	1042	citizen	2025-10-12 12:52:42.664	438
1473	2	1039	lead	2025-10-12 12:52:42.664	438
1474	2	1040	network	2025-10-12 12:52:42.664	438
1475	2	1037	man	2025-10-12 12:52:42.664	438
1476	2	1041	person	2025-10-12 12:52:42.664	438
1477	2	1044	horror	2025-10-12 13:36:26.536	440
1478	2	1048	krueger	2025-10-12 13:36:26.536	440
1479	2	1047	cowardly	2025-10-12 13:36:26.536	440
1480	2	1046	englund	2025-10-12 13:36:26.536	440
1481	2	1045	ambition	2025-10-12 13:36:26.536	440
1482	2	1043	mitt	2025-10-12 13:36:26.536	440
1483	2	1044	horror	2025-10-12 13:38:25.203	441
1484	2	1047	cowardly	2025-10-12 13:38:25.203	441
1485	2	1046	englund	2025-10-12 13:38:25.203	441
1486	2	1045	ambition	2025-10-12 13:38:25.203	441
1487	2	1043	mitt	2025-10-12 13:38:25.203	441
1488	2	1048	krueger	2025-10-12 13:38:25.203	441
1800	47	1763	people	2025-10-29 04:47:18.586	658
1801	47	1764	king	2025-10-29 04:47:18.586	658
1802	47	1761	france	2025-10-29 04:47:18.586	658
1803	47	1762	wars	2025-10-29 04:47:18.586	658
1804	47	1760	storm	2025-10-29 04:47:18.586	658
1805	47	1765	army	2025-10-29 04:47:18.586	658
1838	45	1807	sustainable	2025-10-30 16:19:18.355	666
1839	45	1809	refinement	2025-10-30 16:19:18.355	666
1840	45	1808	efficiency	2025-10-30 16:19:18.355	666
1841	45	1806	connectivity	2025-10-30 16:19:18.355	666
1842	45	1805	autonomous	2025-10-30 16:19:18.355	666
1843	45	1804	innovation	2025-10-30 16:19:18.355	666
1844	45	1815	amelioration	2025-10-30 16:21:51.899	667
1845	45	1813	epoch	2025-10-30 16:21:51.899	667
1846	45	1814	ingenuity	2025-10-30 16:21:51.899	667
1847	45	1810	spur	2025-10-30 16:21:51.899	667
1848	45	1811	ubiquitous	2025-10-30 16:21:51.899	667
1849	45	1812	archaic	2025-10-30 16:21:51.899	667
1885	57	1883	dog	2025-10-31 11:00:52.355	681
1886	57	1879	fish	2025-10-31 11:00:52.355	681
1887	57	1878	bird	2025-10-31 11:00:52.355	681
1888	57	1881	cow	2025-10-31 11:00:52.355	681
1889	57	1882	cat	2025-10-31 11:00:52.355	681
1890	57	1880	egg	2025-10-31 11:00:52.355	681
1891	57	1885	plant	2025-10-31 11:02:58.814	682
1892	57	1889	grow	2025-10-31 11:02:58.814	682
1893	57	1887	whale	2025-10-31 11:02:58.814	682
1894	57	1888	insect	2025-10-31 11:02:58.814	682
1895	57	1886	food	2025-10-31 11:02:58.814	682
1896	57	1884	lives	2025-10-31 11:02:58.814	682
1897	57	1891	fossil	2025-10-31 11:05:33.137	683
1898	57	1893	species	2025-10-31 11:05:33.137	683
1899	57	1894	insect	2025-10-31 11:05:33.137	683
1900	57	1890	kingdom	2025-10-31 11:05:33.137	683
1901	57	1892	predator	2025-10-31 11:05:33.137	683
1902	57	1895	habitat	2025-10-31 11:05:33.137	683
1945	60	1942	ghost	2025-10-31 14:38:44.766	691
1946	60	1943	chase	2025-10-31 14:38:44.766	691
1947	60	1939	movie	2025-10-31 14:38:44.766	691
1948	60	1940	phone	2025-10-31 14:38:44.766	691
1949	60	1938	scary	2025-10-31 14:38:44.766	691
1950	60	1941	mask	2025-10-31 14:38:44.766	691
1980	45	1984	foundation	2025-11-01 09:45:51.743	699
1981	45	1983	connectivity	2025-11-01 09:45:51.743	699
1982	45	1986	reliability	2025-11-01 09:45:51.743	699
1983	45	1985	optimisation	2025-11-01 09:45:51.743	699
1984	45	1987	transmission	2025-11-01 09:45:51.743	699
1985	45	1982	architecture	2025-11-01 09:45:51.743	699
2014	64	2006	victory	2025-11-04 08:50:19.131	708
2015	64	2009	general	2025-11-04 08:50:19.131	708
2016	64	2007	planning	2025-11-04 08:50:19.131	708
2017	64	2011	morale	2025-11-04 08:50:19.131	708
2018	64	2008	ancient	2025-11-04 08:50:19.131	708
2019	64	2010	conflict	2025-11-04 08:50:19.131	708
2062	66	1708	italian	2025-11-07 01:10:53.202	718
2063	66	1709	louvre	2025-11-07 01:10:53.202	718
2064	66	1707	artist	2025-11-07 01:10:53.202	718
2065	66	1712	portrait	2025-11-07 01:10:53.202	718
2066	66	1711	stolen	2025-11-07 01:10:53.202	718
2067	66	1710	mystery	2025-11-07 01:10:53.202	718
2068	66	2026	big	2025-11-07 01:15:37.666	719
2069	66	2024	fur	2025-11-07 01:15:37.666	719
2070	66	2029	pond	2025-11-07 01:15:37.666	719
2071	66	2028	swim	2025-11-07 01:15:37.666	719
2072	66	2025	wet	2025-11-07 01:15:37.666	719
2073	66	2027	eat	2025-11-07 01:15:37.666	719
2116	66	2060	continuity	2025-11-07 02:58:29.355	730
2117	66	2063	superhero	2025-11-07 02:58:29.355	730
2118	66	2064	universe	2025-11-07 02:58:29.355	730
2119	66	2062	strategy	2025-11-07 02:58:29.355	730
2120	66	2061	franchise	2025-11-07 02:58:29.355	730
2160	66	2098	bread	2025-11-07 03:54:28.283	739
2161	66	2099	dough	2025-11-07 03:54:28.283	739
2162	66	2101	sweet	2025-11-07 03:54:28.283	739
2163	66	2102	cake	2025-11-07 03:54:28.283	739
2164	66	2100	oven	2025-11-07 03:54:28.283	739
2165	66	2103	baker	2025-11-07 03:54:28.283	739
2202	66	2131	beluga	2025-11-07 04:51:20.353	746
2203	66	2132	reindeer	2025-11-07 04:51:20.353	746
2204	66	2128	narwhal	2025-11-07 04:51:20.353	746
2205	66	2129	walrus	2025-11-07 04:51:20.353	746
2206	66	2133	blubber	2025-11-07 04:51:20.353	746
2207	66	2130	survive	2025-11-07 04:51:20.353	746
1620	1	773	osculation	2025-10-16 15:33:14.451	548
1621	1	770	stepmother	2025-10-16 15:33:14.451	548
1622	1	778	unsettling	2025-10-16 15:33:14.451	548
1623	1	772	dwarfs	2025-10-16 15:33:14.451	548
1624	1	771	maluspumila	2025-10-16 15:33:14.451	548
1625	1	774	grimm	2025-10-16 15:33:14.451	548
1626	1	776	justice	2025-10-16 15:33:14.451	548
1627	1	777	mirror	2025-10-16 15:33:14.451	548
1641	43	1495	obesity	2025-10-20 10:05:11.729	592
1642	43	1497	stress	2025-10-20 10:05:11.729	592
1643	43	1496	physician	2025-10-20 10:05:11.729	592
1644	43	1494	yoga	2025-10-20 10:05:11.729	592
1683	10	1552	park	2025-10-20 19:28:35.149	611
1806	47	1770	old	2025-10-30 15:14:32.05	659
1807	47	1769	fast	2025-10-30 15:14:32.05	659
1808	47	1768	new	2025-10-30 15:14:32.05	659
1809	47	1766	car	2025-10-30 15:14:32.05	659
1810	47	1767	big	2025-10-30 15:14:32.05	659
1811	47	1771	road	2025-10-30 15:14:32.05	659
1850	45	1818	subculture	2025-10-30 17:05:36.066	668
1851	45	1821	generation	2025-10-30 17:05:36.066	668
1852	45	1819	mainstream	2025-10-30 17:05:36.066	668
1853	45	1816	authority	2025-10-30 17:05:36.066	668
1854	45	1820	rebellion	2025-10-30 17:05:36.066	668
1855	45	1817	sincerity	2025-10-30 17:05:36.066	668
1903	45	1898	eukaryota	2025-10-31 11:09:21.885	684
1904	45	1899	mythology	2025-10-31 11:09:21.885	684
1905	45	1896	locomotion	2025-10-31 11:09:21.885	684
1906	45	1901	ethology	2025-10-31 11:09:21.885	684
1907	45	1897	carnivores	2025-10-31 11:09:21.885	684
1908	45	1900	livestock	2025-10-31 11:09:21.885	684
1951	60	1955	lake	2025-10-31 15:00:24.476	693
1952	60	1951	mask	2025-10-31 15:00:24.476	693
1953	60	1952	night	2025-10-31 15:00:24.476	693
1954	60	1954	film	2025-10-31 15:00:24.476	693
1955	60	1950	camp	2025-10-31 15:00:24.476	693
1956	60	1953	scary	2025-10-31 15:00:24.476	693
1986	45	1990	provenance	2025-11-01 09:59:53.251	700
1987	45	1991	incursion	2025-11-01 09:59:53.251	700
1988	45	1992	extirpate	2025-11-01 09:59:53.251	700
1989	45	1988	crux	2025-11-01 09:59:53.251	700
1990	45	1989	lacuna	2025-11-01 09:59:53.251	700
1991	45	1993	aegis	2025-11-01 09:59:53.251	700
2020	10	2017	toys	2025-11-04 11:12:06.746	709
2021	10	2012	gift	2025-11-04 11:12:06.746	709
2022	10	2015	sell	2025-11-04 11:12:06.746	709
2023	10	2014	money	2025-11-04 11:12:06.746	709
2024	10	2016	price	2025-11-04 11:12:06.746	709
2025	10	2013	shop	2025-11-04 11:12:06.746	709
2074	66	2035	dessert	2025-11-07 01:25:24.895	721
2075	66	2034	grocery	2025-11-07 01:25:24.895	721
2076	66	2032	recipe	2025-11-07 01:25:24.895	721
2077	66	2031	healthy	2025-11-07 01:25:24.895	721
2078	66	2030	cereal	2025-11-07 01:25:24.895	721
2079	66	2033	nutrient	2025-11-07 01:25:24.895	721
2121	66	2065	habitat	2025-11-07 03:08:50.053	731
2122	66	2069	extinction	2025-11-07 03:08:50.053	731
2123	66	2066	migration	2025-11-07 03:08:50.053	731
2124	66	2067	prey	2025-11-07 03:08:50.053	731
2125	66	2068	adapt	2025-11-07 03:08:50.053	731
2126	66	2070	omnivorous	2025-11-07 03:08:50.053	731
2166	66	2109	mouse	2025-11-07 04:09:17.664	740
2167	66	2104	game	2025-11-07 04:09:17.664	740
2168	66	2105	email	2025-11-07 04:09:17.664	740
2169	66	2106	screen	2025-11-07 04:09:17.664	740
2170	66	2107	data	2025-11-07 04:09:17.664	740
2171	66	2108	file	2025-11-07 04:09:17.664	740
2208	66	2139	algorithm	2025-11-07 05:02:12.072	747
2209	66	2134	analytics	2025-11-07 05:02:12.072	747
2210	66	2136	insights	2025-11-07 05:02:12.072	747
2211	66	2137	framework	2025-11-07 05:02:12.072	747
2212	66	2138	processing	2025-11-07 05:02:12.072	747
2213	66	2135	database	2025-11-07 05:02:12.072	747
2238	66	2153	save	2025-11-07 06:01:08.217	752
2239	66	2155	power	2025-11-07 06:01:08.217	752
2240	66	2156	film	2025-11-07 06:01:08.217	752
2241	66	2152	team	2025-11-07 06:01:08.217	752
2242	66	2157	fight	2025-11-07 06:01:08.217	752
2243	66	2154	mask	2025-11-07 06:01:08.217	752
2258	66	2183	book	2025-11-07 06:52:12.738	757
2259	66	2179	room	2025-11-07 06:52:12.738	757
2260	66	2178	pen	2025-11-07 06:52:12.738	757
2261	66	2180	city	2025-11-07 06:52:12.738	757
2262	66	2182	park	2025-11-07 06:52:12.738	757
2263	66	2181	desk	2025-11-07 06:52:12.738	757
2281	66	2197	drink	2025-11-07 07:21:26.054	761
2282	66	2198	sweet	2025-11-07 07:21:26.054	761
2283	66	2200	cook	2025-11-07 07:21:26.054	761
2284	66	2195	bread	2025-11-07 07:21:26.054	761
2285	66	2199	apple	2025-11-07 07:21:26.054	761
2286	66	2196	plate	2025-11-07 07:21:26.054	761
2297	66	2215	harvest	2025-11-07 07:35:58.56	764
2304	66	2223	city	2025-11-07 07:44:45.836	766
2305	66	2226	tower	2025-11-07 07:44:45.836	766
2306	66	2225	meet	2025-11-07 07:44:45.836	766
2307	66	2228	work	2025-11-07 07:44:45.836	766
2308	66	2224	lead	2025-11-07 07:44:45.836	766
2309	66	2227	money	2025-11-07 07:44:45.836	766
2316	66	2237	villain	2025-11-07 08:01:41.187	768
2317	66	2235	heroes	2025-11-07 08:01:41.187	768
2318	66	2239	fantasy	2025-11-07 08:01:41.187	768
2319	66	2240	series	2025-11-07 08:01:41.187	768
2320	66	2238	studio	2025-11-07 08:01:41.187	768
1628	1	1486	fruit	2025-10-16 20:33:59.233	555
1629	1	1483	sleep	2025-10-16 20:33:59.233	555
1630	1	1484	health	2025-10-16 20:33:59.233	555
1631	1	1487	walk	2025-10-16 20:33:59.233	555
1632	1	1482	diet	2025-10-16 20:33:59.233	555
1633	1	1485	doctor	2025-10-16 20:33:59.233	555
1645	43	1495	obesity	2025-10-20 10:10:21.027	593
1646	43	1497	stress	2025-10-20 10:10:21.027	593
1647	43	1496	physician	2025-10-20 10:10:21.027	593
1648	43	1494	yoga	2025-10-20 10:10:21.027	593
1665	43	1491	food	2025-10-20 11:39:24.596	606
1666	43	1493	walk	2025-10-20 11:39:24.596	606
1667	43	1489	body	2025-10-20 11:39:24.596	606
1668	43	1490	rest	2025-10-20 11:39:24.596	606
1669	43	1488	good	2025-10-20 11:39:24.596	606
1670	43	1492	play	2025-10-20 11:39:24.596	606
1684	10	1556	fuel	2025-10-20 19:28:35.149	611
1685	10	1554	taxi	2025-10-20 19:28:35.149	611
1686	10	1555	wheel	2025-10-20 19:28:35.149	611
1687	10	1553	road	2025-10-20 19:28:35.149	611
1688	10	1551	drive	2025-10-20 19:28:35.149	611
1689	10	1557	booth	2025-10-20 19:31:34.865	612
1690	10	1559	lunch	2025-10-20 19:31:34.865	612
1691	10	1558	event	2025-10-20 19:31:34.865	612
1692	10	1562	date	2025-10-20 19:31:34.865	612
1693	10	1560	group	2025-10-20 19:31:34.865	612
1694	10	1561	time	2025-10-20 19:31:34.865	612
1707	1	775	peach	2025-10-27 13:19:53.925	615
1736	45	1582	goal	2025-10-28 15:08:02.527	621
1737	45	1581	win	2025-10-28 15:08:02.527	621
2323	66	2241	stadium	2025-11-07 08:15:46.537	769
2324	66	2242	trainer	2025-11-07 08:15:46.537	769
2325	66	2243	athlete	2025-11-07 08:15:46.537	769
2326	66	2244	exercise	2025-11-07 08:15:46.537	769
2327	66	2246	trophy	2025-11-07 08:15:46.537	769
2328	66	2252	dessert	2025-11-07 08:20:44.237	770
2329	66	2250	appetite	2025-11-07 08:20:44.237	770
2330	66	2249	kitchen	2025-11-07 08:20:44.237	770
2331	66	2247	healthy	2025-11-07 08:20:44.237	770
2332	66	2248	recipe	2025-11-07 08:20:44.237	770
2333	66	2251	hunger	2025-11-07 08:20:44.237	770
2334	66	2259	faculty	2025-11-07 08:45:36.742	772
2335	66	2260	research	2025-11-07 08:45:36.742	772
2336	66	2262	dean	2025-11-07 08:45:36.742	772
2337	66	2261	degree	2025-11-07 08:45:36.742	772
2338	66	2267	fragrant	2025-11-07 08:52:10.281	773
2339	66	2266	petals	2025-11-07 08:52:10.281	773
2340	66	2264	nature	2025-11-07 08:52:10.281	773
2341	66	2268	blossom	2025-11-07 08:52:10.281	773
2342	66	2265	garden	2025-11-07 08:52:10.281	773
2343	66	2263	pollen	2025-11-07 08:52:10.281	773
2344	66	2274	robot	2025-11-07 09:08:10.834	774
2345	66	2270	teach	2025-11-07 09:08:10.834	774
2346	66	2269	learn	2025-11-07 09:08:10.834	774
2347	66	2273	class	2025-11-07 09:08:10.834	774
2348	66	2272	royal	2025-11-07 09:08:10.834	774
2349	66	2271	crown	2025-11-07 09:08:10.834	774
2367	66	2175	pelagic	2025-11-19 09:44:01.881	777
2368	66	2176	angler	2025-11-19 09:44:01.881	777
2369	66	2177	reef	2025-11-19 09:44:01.881	777
2370	66	2082	headlights	2025-11-19 12:47:05.316	778
2371	66	2080	navigation	2025-11-19 12:47:05.316	778
2372	66	2081	suspension	2025-11-19 12:47:05.316	778
2373	66	2079	emission	2025-11-19 12:47:05.316	778
2374	66	2078	dashboard	2025-11-19 12:47:05.316	778
2375	66	2077	automobile	2025-11-19 12:47:05.316	778
2376	66	2026	big	2025-11-19 12:49:57.931	779
2377	66	2028	swim	2025-11-19 12:49:57.931	779
2378	66	2024	fur	2025-11-19 12:49:57.931	779
2379	66	2025	wet	2025-11-19 12:49:57.931	779
2380	66	2027	eat	2025-11-19 12:49:57.931	779
2381	66	2029	pond	2025-11-19 12:49:57.931	779
2382	66	2080	navigation	2025-11-21 06:46:32.633	780
2383	66	2077	automobile	2025-11-21 06:46:32.633	780
2384	66	2081	suspension	2025-11-21 06:46:32.633	780
2385	66	2079	emission	2025-11-21 06:46:32.633	780
2386	66	2078	dashboard	2025-11-21 06:46:32.633	780
2387	66	2082	headlights	2025-11-21 06:46:32.633	780
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: letterland_admin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b5718e45-703d-4578-b643-fc842f11ff63	3e3b360aa0208c23d5c72bbfcf916a2be6f04b9f4ce36e0aa387634913bc1c4d	2025-03-26 08:13:29.427054+00	20250326081329_init	\N	\N	2025-03-26 08:13:29.120357+00	1
50cde87d-f99b-41cc-93d0-77d6211a1c1b	84fc06f1a013baacdced44a453d0a528ae49e2dd9fa0ffc5caab14f11ee65c5c	2025-04-17 06:42:57.501457+00	20250417064257_update_game_template_and_remove_play_session	\N	\N	2025-04-17 06:42:57.42247+00	1
280247f6-a6ca-4ade-b1ff-3cad9eaae4e4	669d2c3bbd5af64c850d52d14dbe6a8493d97f9c2d8cc1958952a6d616c78def	2025-05-07 13:51:37.713501+00	20250507135136_add_timer_to_game	\N	\N	2025-05-07 13:51:36.996399+00	1
c3d8d9fe-ea27-442d-acff-b07464c08b6d	4a29138210cb6b0906799aab3c2ab1000aa4b87dfe85165a587a5f029f50ea9c	2025-08-26 06:44:49.64332+00	20250826064449_add_image_and_audio_url	\N	\N	2025-08-26 06:44:49.594109+00	1
fe438c1d-9328-44b6-859b-bcc267c46558	c171eaafc1b80e64a5dc440a60c7010cf2ab0f1919c750c7b23aa2a0885b9d51	2025-09-03 15:57:22.2868+00	20250903155721_add_achievement_imageurl_and_unique_gamecode	\N	\N	2025-09-03 15:57:22.102495+00	1
69c1c721-4d11-44de-83d7-ad945adf8878	78d4f253ada0ef7cd03bcdf83e11c3b89c8e6de1a2e31ff2e1e556542908d82f	2025-09-04 12:06:06.880524+00	0_baseline		\N	2025-09-04 12:06:06.880524+00	0
8b64ba2a-4d96-4a36-bc45-d958c3cd7faa	d8fe2f75314f6c955c0ba460247d6963a297045330d15850016c66a1d2a56679	2025-09-04 12:16:39.642878+00	20250904_add_isClaimed_to_userachievement		\N	2025-09-04 12:16:39.642878+00	0
3bb7072a-d3df-4032-b3f8-8b88fb5d2a6e	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	2025-09-11 16:53:06.927811+00	20250911235232_baseline		\N	2025-09-11 16:53:06.927811+00	0
055b549f-17f3-4e1e-be1b-bb2e8a52fca4	4691661eb3b1479fd81a549cf433e6e8d0a43cdf61e27727e9049d1e76959233	2025-09-11 17:09:28.26887+00	20250912000904_baseline		\N	2025-09-11 17:09:28.26887+00	0
\.


--
-- Name: Achievement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: letterland_admin
--

SELECT pg_catalog.setval('public."Achievement_id_seq"', 1, false);


--
-- Name: ExtraWordFound_id_seq; Type: SEQUENCE SET; Schema: public; Owner: letterland_admin
--

SELECT pg_catalog.setval('public."ExtraWordFound_id_seq"', 844, true);


--
-- Name: GameTemplateQuestion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: letterland_admin
--

SELECT pg_catalog.setval('public."GameTemplateQuestion_id_seq"', 2434, true);


--
-- Name: GameTemplate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: letterland_admin
--

SELECT pg_catalog.setval('public."GameTemplate_id_seq"', 349, true);


--
-- Name: Game_id_seq; Type: SEQUENCE SET; Schema: public; Owner: letterland_admin
--

SELECT pg_catalog.setval('public."Game_id_seq"', 780, true);


--
-- Name: Question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: letterland_admin
--

SELECT pg_catalog.setval('public."Question_id_seq"', 2274, true);


--
-- Name: UserAchievement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: letterland_admin
--

SELECT pg_catalog.setval('public."UserAchievement_id_seq"', 765, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: letterland_admin
--

SELECT pg_catalog.setval('public."User_id_seq"', 68, true);


--
-- Name: WordFound_id_seq; Type: SEQUENCE SET; Schema: public; Owner: letterland_admin
--

SELECT pg_catalog.setval('public."WordFound_id_seq"', 2387, true);


--
-- Name: Achievement Achievement_pkey; Type: CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."Achievement"
    ADD CONSTRAINT "Achievement_pkey" PRIMARY KEY (id);


--
-- Name: ExtraWordFound ExtraWordFound_pkey; Type: CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."ExtraWordFound"
    ADD CONSTRAINT "ExtraWordFound_pkey" PRIMARY KEY (id);


--
-- Name: GameTemplateQuestion GameTemplateQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."GameTemplateQuestion"
    ADD CONSTRAINT "GameTemplateQuestion_pkey" PRIMARY KEY (id);


--
-- Name: GameTemplate GameTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."GameTemplate"
    ADD CONSTRAINT "GameTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Game Game_pkey; Type: CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_pkey" PRIMARY KEY (id);


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- Name: UserAchievement UserAchievement_pkey; Type: CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WordFound WordFound_pkey; Type: CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."WordFound"
    ADD CONSTRAINT "WordFound_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ExtraWordFound_gameId_userId_foundAt_idx; Type: INDEX; Schema: public; Owner: letterland_admin
--

CREATE INDEX "ExtraWordFound_gameId_userId_foundAt_idx" ON public."ExtraWordFound" USING btree ("gameId", "userId", "foundAt");


--
-- Name: ExtraWordFound_gameId_userId_word_key; Type: INDEX; Schema: public; Owner: letterland_admin
--

CREATE UNIQUE INDEX "ExtraWordFound_gameId_userId_word_key" ON public."ExtraWordFound" USING btree ("gameId", "userId", word);


--
-- Name: GameTemplateQuestion_gameTemplateId_idx; Type: INDEX; Schema: public; Owner: letterland_admin
--

CREATE INDEX "GameTemplateQuestion_gameTemplateId_idx" ON public."GameTemplateQuestion" USING btree ("gameTemplateId");


--
-- Name: GameTemplateQuestion_gameTemplateId_questionId_key; Type: INDEX; Schema: public; Owner: letterland_admin
--

CREATE UNIQUE INDEX "GameTemplateQuestion_gameTemplateId_questionId_key" ON public."GameTemplateQuestion" USING btree ("gameTemplateId", "questionId");


--
-- Name: GameTemplateQuestion_questionId_idx; Type: INDEX; Schema: public; Owner: letterland_admin
--

CREATE INDEX "GameTemplateQuestion_questionId_idx" ON public."GameTemplateQuestion" USING btree ("questionId");


--
-- Name: GameTemplate_gameCode_key; Type: INDEX; Schema: public; Owner: letterland_admin
--

CREATE UNIQUE INDEX "GameTemplate_gameCode_key" ON public."GameTemplate" USING btree ("gameCode");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: letterland_admin
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: letterland_admin
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: WordFound_gameId_userId_foundAt_idx; Type: INDEX; Schema: public; Owner: letterland_admin
--

CREATE INDEX "WordFound_gameId_userId_foundAt_idx" ON public."WordFound" USING btree ("gameId", "userId", "foundAt");


--
-- Name: WordFound_gameId_userId_questionId_key; Type: INDEX; Schema: public; Owner: letterland_admin
--

CREATE UNIQUE INDEX "WordFound_gameId_userId_questionId_key" ON public."WordFound" USING btree ("gameId", "userId", "questionId");


--
-- Name: ExtraWordFound ExtraWordFound_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."ExtraWordFound"
    ADD CONSTRAINT "ExtraWordFound_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExtraWordFound ExtraWordFound_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."ExtraWordFound"
    ADD CONSTRAINT "ExtraWordFound_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GameTemplateQuestion GameTemplateQuestion_gameTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."GameTemplateQuestion"
    ADD CONSTRAINT "GameTemplateQuestion_gameTemplateId_fkey" FOREIGN KEY ("gameTemplateId") REFERENCES public."GameTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GameTemplateQuestion GameTemplateQuestion_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."GameTemplateQuestion"
    ADD CONSTRAINT "GameTemplateQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GameTemplate GameTemplate_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."GameTemplate"
    ADD CONSTRAINT "GameTemplate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Game Game_gameTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_gameTemplateId_fkey" FOREIGN KEY ("gameTemplateId") REFERENCES public."GameTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Game Game_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserAchievement UserAchievement_achievementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES public."Achievement"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserAchievement UserAchievement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WordFound WordFound_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."WordFound"
    ADD CONSTRAINT "WordFound_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WordFound WordFound_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."WordFound"
    ADD CONSTRAINT "WordFound_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WordFound WordFound_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: letterland_admin
--

ALTER TABLE ONLY public."WordFound"
    ADD CONSTRAINT "WordFound_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: letterland_admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

