--
-- PostgreSQL database dump
--

\restrict IaAqBwahLUiyn35gTkCfxxIReJKeJbyQFy3jFGrEcKTmIUocDeWDimwNfuEpVKt

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-01-09 15:37:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 24577)
-- Name: blacklisted_password; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blacklisted_password (
    id integer NOT NULL,
    user_id integer NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.blacklisted_password OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24576)
-- Name: blacklisted_password_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blacklisted_password_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blacklisted_password_id_seq OWNER TO postgres;

--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 223
-- Name: blacklisted_password_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blacklisted_password_id_seq OWNED BY public.blacklisted_password.id;


--
-- TOC entry 226 (class 1259 OID 24597)
-- Name: blacklisted_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blacklisted_tokens (
    id integer NOT NULL,
    user_id integer,
    token text NOT NULL,
    reason text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.blacklisted_tokens OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24596)
-- Name: blacklisted_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blacklisted_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blacklisted_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 225
-- Name: blacklisted_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blacklisted_tokens_id_seq OWNED BY public.blacklisted_tokens.id;


--
-- TOC entry 236 (class 1259 OID 32811)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    category character varying(255) NOT NULL,
    path_thumbnails character varying(500),
    path_json character varying(500),
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    title character varying(255),
    CONSTRAINT categories_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'deleted'::character varying])::text[])))
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 32810)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 235
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 238 (class 1259 OID 32830)
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid(),
    "json" jsonb NOT NULL,
    id_template integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying,
    CONSTRAINT documents_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'deleted'::character varying])::text[])))
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 32829)
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.documents ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 16389)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16388)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 234 (class 1259 OID 24701)
-- Name: template_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_versions (
    id integer NOT NULL,
    id_template integer,
    name_version character varying(50) NOT NULL,
    build_number numeric(4,2) NOT NULL,
    path_thumbnails character varying(255),
    path_json character varying(255),
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    status character varying(20) DEFAULT 'active'::character varying,
    uuid uuid DEFAULT gen_random_uuid()
);


ALTER TABLE public.template_versions OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 24700)
-- Name: template_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.template_versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.template_versions_id_seq OWNER TO postgres;

--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 233
-- Name: template_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.template_versions_id_seq OWNED BY public.template_versions.id;


--
-- TOC entry 230 (class 1259 OID 24640)
-- Name: templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.templates (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    name character varying(100),
    description text,
    open_date timestamp without time zone DEFAULT now(),
    id_workspace integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying,
    uuid uuid DEFAULT gen_random_uuid()
);


ALTER TABLE public.templates OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 24639)
-- Name: templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.templates_id_seq OWNER TO postgres;

--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 229
-- Name: templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.templates_id_seq OWNED BY public.templates.id;


--
-- TOC entry 232 (class 1259 OID 24672)
-- Name: user_workspaces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_workspaces (
    id integer NOT NULL,
    user_id integer,
    workspace_id integer,
    is_owner boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_workspaces OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 24671)
-- Name: user_workspaces_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_workspaces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_workspaces_id_seq OWNER TO postgres;

--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 231
-- Name: user_workspaces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_workspaces_id_seq OWNED BY public.user_workspaces.id;


--
-- TOC entry 222 (class 1259 OID 16402)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    last_name character varying(100),
    email character varying(150) NOT NULL,
    password character varying(255),
    photo text,
    country character varying(100),
    zip_code character varying(20),
    last_connection timestamp without time zone DEFAULT now(),
    status character varying(20) DEFAULT 'active'::character varying,
    id_rol integer DEFAULT 2 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    failed_attempts integer DEFAULT 0,
    access_expiration date DEFAULT (CURRENT_DATE + '365 days'::interval),
    uuid uuid DEFAULT gen_random_uuid()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16401)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 228 (class 1259 OID 24614)
-- Name: workspaces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workspaces (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    icon character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    uuid uuid DEFAULT gen_random_uuid()
);


ALTER TABLE public.workspaces OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24613)
-- Name: workspaces_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workspaces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workspaces_id_seq OWNER TO postgres;

--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 227
-- Name: workspaces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workspaces_id_seq OWNED BY public.workspaces.id;


--
-- TOC entry 4913 (class 2604 OID 24580)
-- Name: blacklisted_password id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_password ALTER COLUMN id SET DEFAULT nextval('public.blacklisted_password_id_seq'::regclass);


--
-- TOC entry 4915 (class 2604 OID 24600)
-- Name: blacklisted_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_tokens ALTER COLUMN id SET DEFAULT nextval('public.blacklisted_tokens_id_seq'::regclass);


--
-- TOC entry 4935 (class 2604 OID 32814)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 16392)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4931 (class 2604 OID 24704)
-- Name: template_versions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_versions ALTER COLUMN id SET DEFAULT nextval('public.template_versions_id_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 24643)
-- Name: templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates ALTER COLUMN id SET DEFAULT nextval('public.templates_id_seq'::regclass);


--
-- TOC entry 4927 (class 2604 OID 24675)
-- Name: user_workspaces id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workspaces ALTER COLUMN id SET DEFAULT nextval('public.user_workspaces_id_seq'::regclass);


--
-- TOC entry 4904 (class 2604 OID 16405)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4917 (class 2604 OID 24617)
-- Name: workspaces id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces ALTER COLUMN id SET DEFAULT nextval('public.workspaces_id_seq'::regclass);


--
-- TOC entry 5148 (class 0 OID 24577)
-- Dependencies: 224
-- Data for Name: blacklisted_password; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blacklisted_password (id, user_id, password, created_at) FROM stdin;
\.


--
-- TOC entry 5150 (class 0 OID 24597)
-- Dependencies: 226
-- Data for Name: blacklisted_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blacklisted_tokens (id, user_id, token, reason, created_at) FROM stdin;
\.


--
-- TOC entry 5160 (class 0 OID 32811)
-- Dependencies: 236
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, uuid, category, path_thumbnails, path_json, status, created_at, updated_at, title) FROM stdin;
1	b82b45cb-c492-40a5-a4a9-19c0442a4bf2	diplomas	/uploads/categories/thumbnails/diploma_1.png	/uploads/categories/templates/diploma_1.json	active	2025-12-08 10:28:22.018124	2025-12-08 10:28:22.018124	Diploma para cursos
2	5f622f7f-f2f5-4f85-a5bb-4b1aada6d175	diplomas	/uploads/categories/thumbnails/diploma_2.png	/uploads/categories/templates/diploma_2.json	active	2025-12-08 10:28:22.018124	2025-12-08 10:28:22.018124	Diploma de preescolar
3	eda4964b-b2fa-4a99-9700-0b5d875c57d1	diplomas	/uploads/categories/thumbnails/diploma_3.png	/uploads/categories/templates/diploma_3.json	active	2025-12-08 10:28:22.018124	2025-12-08 10:28:22.018124	Diploma de agradecimiento
4	5ba0ce1e-731a-4745-bf92-d07d61f5f1c4	constancias	/uploads/categories/thumbnails/constancia_1.png	/uploads/categories/templates/constancia_1.json	active	2025-12-08 10:28:22.018124	2025-12-08 10:28:22.018124	Constancia de trabajo 
5	8abf439c-e390-4eed-90a4-3367d09fa8fd	constancias	/uploads/categories/thumbnails/constancia_2.png	/uploads/categories/templates/constancia_2.json	active	2025-12-08 10:28:22.018124	2025-12-08 10:28:22.018124	Constancia de estudió 
\.


--
-- TOC entry 5162 (class 0 OID 32830)
-- Dependencies: 238
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, uuid, "json", id_template, created_at, updated_at, status) FROM stdin;
32	97de28e0-60df-4c05-a55e-32f74573156e	{"fecha": "04 de junio de 20XX", "nombre": "Cecilio Casanova\\n", "apellido": "Bolivar", "nombre_fecha": "Fecha", "nombre_firma": "María Zelaya, profesora", "correo_destino": ["cebolivarbarrios@gmail.com", "jtorres@solucioneslaser.com", "gromero@solucioneslaser.com", "yumaira_gomez@solucioneslaser.com", "hramirez@solucioneslaser.com"]}	150	2025-12-15 17:00:51.016141-04	2025-12-15 17:00:51.016141-04	active
33	24a5862f-d244-4c40-b241-9dfe33c9e410	{"fecha": "04 de junio de 20XX", "nombre": "Yumaira\\n", "apellido": "Gomaz", "nombre_fecha": "Fecha", "nombre_firma": "María Zelaya, profesora", "correo_destino": ["cebolivarbarrios@gmail.com", "jtorres@solucioneslaser.com", "gromero@solucioneslaser.com", "yumaira_gomez@solucioneslaser.com", "hramirez@solucioneslaser.com"]}	150	2025-12-15 17:02:22.063793-04	2025-12-15 17:02:22.063793-04	active
35	e4ed49ab-2112-4a6d-9350-d7af4d9e69b9	{"fecha": "04 de junio de 20XX", "nombre": "Juan", "apellido": "Osio", "nombre_fecha": "Fecha", "nombre_firma": "María Zelaya, profesora", "correo_destino": ["cebolivarbarrios@gmail.com", "josio@solucioneslaser.com", "elvis.munoz@sybven.com"]}	150	2025-12-16 10:47:12.456598-04	2025-12-16 10:47:12.456598-04	active
36	051b27b2-8f25-4172-8438-4b55a76cea14	{"edad": 15, "fecha": "04 de junio de 20XX", "nombre": "Juan", "apellido": "Osio", "validador": true, "nombre_fecha": "Fecha", "nombre_firma": "María Zelaya, profesora", "correo_destino": ["cebolivarbarrios@gmail.com", "josio@solucioneslaser.com", "elvis.munoz@sybven.com"]}	150	2025-12-22 10:50:26.350993-04	2025-12-22 10:50:26.350993-04	active
\.


--
-- TOC entry 5144 (class 0 OID 16389)
-- Dependencies: 220
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, created_at, updated_at) FROM stdin;
1	Admin	2025-10-30 13:28:59.313447	2025-10-30 13:28:59.313447
2	User	2025-10-30 13:30:26.638615	2025-10-30 13:30:26.638615
\.


--
-- TOC entry 5158 (class 0 OID 24701)
-- Dependencies: 234
-- Data for Name: template_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.template_versions (id, id_template, name_version, build_number, path_thumbnails, path_json, created_by, created_at, status, uuid) FROM stdin;
327	149	1.00	1.00	/thumbnails/u43-w48-t149-v1_00.png	/uploads/templates/u43-w48-t149-v1_00.json	43	2025-12-15 16:56:23.351822	active	714c24fa-99c7-47c9-8996-22f816b3030a
328	150	1.00	1.00	/thumbnails/u43-w47-t150-v1_00.png	/uploads/templates/u43-w47-t150-v1_00.json	43	2025-12-15 16:57:29.305466	active	7f8e50da-c6fd-4cf9-89fd-c2cbdcb9be6c
329	150	1.01	1.01	/thumbnails/u43-w47-t150-v1_01.png	/uploads/templates/u43-w47-t150-v1_01.json	43	2025-12-15 16:58:53.424281	active	3ac9fe40-c533-4132-b814-3becdb7a971d
330	151	1.00	1.00	/thumbnails/u43-w47-t151-v1_00.png	/uploads/templates/u43-w47-t151-v1_00.json	43	2025-12-15 17:02:53.405101	active	de78072e-031d-4169-a20a-7675106c3be5
332	153	1.00	1.00	/thumbnails/u43-w48-t153-v1_00.png	/uploads/templates/u43-w48-t153-v1_00.json	43	2025-12-15 17:12:00.344157	active	d5f94942-73f2-49e2-8d75-b60dc66626b6
333	154	1.00	1.00	/thumbnails/u43-w48-t154-v1_00.png	/uploads/templates/u43-w48-t154-v1_00.json	43	2025-12-15 17:12:41.102139	active	791a593e-58f0-455f-93e4-ad0a1749b5c7
334	155	1.00	1.00	/thumbnails/u43-w47-t155-v1_00.png	/uploads/templates/u43-w47-t155-v1_00.json	43	2025-12-15 17:13:51.705489	active	75733998-6a82-422a-a0b8-9c2dbf5882a0
338	157	1.00	1.00	/thumbnails/u43-w48-t157-v1_00.png	/uploads/templates/u43-w48-t157-v1_00.json	43	2025-12-15 17:29:54.541651	active	0b6c018f-2325-4439-869a-ecaab86d2429
341	150	1.02	1.02	/thumbnails/u43-w47-t150-v1_02.png	/uploads/templates/u43-w47-t150-v1_02.json	43	2025-12-16 10:45:13.991892	active	e388d3fd-6d89-4a28-a3b9-adbe3de8807d
342	158	1.00	1.00	/thumbnails/u44-w49-t158-v1_00.png	/uploads/templates/u44-w49-t158-v1_00.json	44	2025-12-16 13:20:50.452924	active	950b6a2f-79dd-4d0d-93a5-7ac234b6c8b4
343	159	1.00	1.00	/thumbnails/u43-w48-t159-v1_00.png	/uploads/templates/u43-w48-t159-v1_00.json	43	2025-12-16 15:47:06.961733	active	d67b4cc2-d9b1-488c-8221-44501348c720
344	160	1.00	1.00	/thumbnails/u44-w49-t160-v1_00.png	/uploads/templates/u44-w49-t160-v1_00.json	44	2025-12-16 15:50:46.244659	active	88f46eca-4c06-4776-b9b9-4ebbe125d065
345	159	1.01	1.01	/thumbnails/u43-w48-t159-v1_01.png	/uploads/templates/u43-w48-t159-v1_01.json	43	2025-12-16 16:57:37.191096	active	f74baa1f-c7e1-43e6-b087-4fec367745ea
346	159	1.02	1.02	/thumbnails/u43-w48-t159-v1_02.png	/uploads/templates/u43-w48-t159-v1_02.json	43	2025-12-16 17:00:08.325647	active	15310a96-7ffa-4025-82ec-4b497b6cfb13
347	159	1.03	1.03	/thumbnails/u43-w48-t159-v1_03.png	/uploads/templates/u43-w48-t159-v1_03.json	43	2025-12-16 17:00:20.016077	active	7d8b07d1-107b-4302-8026-a83c6aa7ba06
348	159	1.04	1.04	/thumbnails/u43-w48-t159-v1_04.png	/uploads/templates/u43-w48-t159-v1_04.json	43	2025-12-16 17:00:33.841184	active	7e9d3a8d-d076-445e-afd5-1745b09c9bbf
349	159	1.05	1.05	/thumbnails/u43-w48-t159-v1_05.png	/uploads/templates/u43-w48-t159-v1_05.json	43	2025-12-16 17:00:46.990902	active	c964b8fc-b94e-415d-a7b2-351b708aeb38
350	159	1.06	1.06	/thumbnails/u43-w48-t159-v1_06.png	/uploads/templates/u43-w48-t159-v1_06.json	43	2025-12-16 17:16:56.041059	active	cd749edb-1538-4335-a619-78225af319a0
351	159	1.07	1.07	/thumbnails/u43-w48-t159-v1_07.png	/uploads/templates/u43-w48-t159-v1_07.json	43	2025-12-16 17:20:39.173401	active	8bdd5628-709a-40ad-9c99-8e414509e13b
352	159	1.08	1.08	/thumbnails/u43-w48-t159-v1_08.png	/uploads/templates/u43-w48-t159-v1_08.json	43	2025-12-16 17:22:05.893024	active	94335667-9f56-47a3-a50b-94271014dfb5
353	159	1.09	1.09	/thumbnails/u43-w48-t159-v1_09.png	/uploads/templates/u43-w48-t159-v1_09.json	43	2025-12-16 17:24:03.379427	active	83011934-6841-48c7-8baa-b20cb978004a
354	159	1.10	1.10	/thumbnails/u43-w48-t159-v1_10.png	/uploads/templates/u43-w48-t159-v1_10.json	43	2025-12-16 17:24:36.500573	active	02be35e0-4a2a-4ceb-aee8-14934743755b
355	159	1.11	1.11	/thumbnails/u43-w48-t159-v1_11.png	/uploads/templates/u43-w48-t159-v1_11.json	43	2025-12-16 17:24:48.3939	active	54d44de7-dd27-402d-94f8-6f14f2f78e36
356	159	1.12	1.12	/thumbnails/u43-w48-t159-v1_12.png	/uploads/templates/u43-w48-t159-v1_12.json	43	2025-12-16 17:25:28.150715	active	4f191630-e127-4809-9bdc-4e5f4f23c2a2
357	159	1.13	1.13	/thumbnails/u43-w48-t159-v1_13.png	/uploads/templates/u43-w48-t159-v1_13.json	43	2025-12-16 17:27:40.42378	active	b13e7ae2-199d-4366-9860-55e1dfd0b2a5
358	159	1.14	1.14	/thumbnails/u43-w48-t159-v1_14.png	/uploads/templates/u43-w48-t159-v1_14.json	43	2025-12-16 17:30:06.403852	active	08ffcef8-e97c-445b-8fe1-8885296a11fe
359	159	1.15	1.15	/thumbnails/u43-w48-t159-v1_15.png	/uploads/templates/u43-w48-t159-v1_15.json	43	2025-12-16 17:40:07.858204	active	8152f8f6-ce0f-4d4f-81b8-f055560a5f7a
360	159	1.16	1.16	/thumbnails/u43-w48-t159-v1_16.png	/uploads/templates/u43-w48-t159-v1_16.json	43	2025-12-16 17:40:31.408062	active	04276c47-ac09-4ee1-91bb-58640883119c
361	159	1.17	1.17	/thumbnails/u43-w48-t159-v1_17.png	/uploads/templates/u43-w48-t159-v1_17.json	43	2025-12-16 18:08:47.371009	active	53de4d96-32ba-43b5-b8c0-d24ba3034701
362	159	1.18	1.18	/thumbnails/u43-w48-t159-v1_18.png	/uploads/templates/u43-w48-t159-v1_18.json	43	2025-12-16 18:14:00.19393	active	4b699e58-95d2-45bd-b81e-571019717bf6
363	159	1.19	1.19	/thumbnails/u43-w48-t159-v1_19.png	/uploads/templates/u43-w48-t159-v1_19.json	43	2025-12-16 18:16:19.925304	active	ebcce812-cc90-4941-9724-67d02f189366
364	159	1.20	1.20	/thumbnails/u43-w48-t159-v1_20.png	/uploads/templates/u43-w48-t159-v1_20.json	43	2025-12-16 18:18:34.651257	active	e94405e4-2480-4e41-827c-93ec942565ef
365	159	1.21	1.21	/thumbnails/u43-w48-t159-v1_21.png	/uploads/templates/u43-w48-t159-v1_21.json	43	2025-12-16 18:22:47.197801	active	5f708e61-b410-45a2-98af-fd4f7cd8ae76
366	159	1.22	1.22	/thumbnails/u43-w48-t159-v1_22.png	/uploads/templates/u43-w48-t159-v1_22.json	43	2025-12-16 18:25:32.783304	active	d5de77b2-68d2-4148-b376-976d596ddda7
367	159	1.23	1.23	/thumbnails/u43-w48-t159-v1_23.png	/uploads/templates/u43-w48-t159-v1_23.json	43	2025-12-16 18:36:05.822096	active	e2d8785b-d5e1-4f70-bdd3-9330785f4d1a
368	159	1.24	1.24	/thumbnails/u43-w48-t159-v1_24.png	/uploads/templates/u43-w48-t159-v1_24.json	43	2025-12-16 18:36:38.858451	active	7764d49e-1cb4-4848-86df-c383ef28fd64
369	159	1.25	1.25	/thumbnails/u43-w48-t159-v1_25.png	/uploads/templates/u43-w48-t159-v1_25.json	43	2025-12-16 18:56:29.289613	active	9af61536-5c2e-4f6d-a793-b5635207672d
370	159	1.26	1.26	/thumbnails/u43-w48-t159-v1_26.png	/uploads/templates/u43-w48-t159-v1_26.json	43	2025-12-16 19:01:40.549877	active	d46b748e-2873-4287-b275-b6700e45d33e
371	159	1.27	1.27	/thumbnails/u43-w48-t159-v1_27.png	/uploads/templates/u43-w48-t159-v1_27.json	43	2025-12-16 19:04:21.745879	active	4e6b9a73-295c-40a7-add0-3a1273b07a90
372	159	1.28	1.28	/thumbnails/u43-w48-t159-v1_28.png	/uploads/templates/u43-w48-t159-v1_28.json	43	2025-12-16 19:05:26.118029	active	fab1adfc-c7be-485b-9fe6-3a40fca6f575
373	159	1.29	1.29	/thumbnails/u43-w48-t159-v1_29.png	/uploads/templates/u43-w48-t159-v1_29.json	43	2025-12-16 19:07:22.746546	active	92cd8469-bdaa-4a79-8eb3-599f762d4186
374	159	1.30	1.30	/thumbnails/u43-w48-t159-v1_30.png	/uploads/templates/u43-w48-t159-v1_30.json	43	2025-12-16 20:39:17.588891	active	f128f8c3-31a0-4e75-9e71-652dfb58d187
375	159	1.31	1.31	/thumbnails/u43-w48-t159-v1_31.png	/uploads/templates/u43-w48-t159-v1_31.json	43	2025-12-16 20:44:20.99196	active	ecccd065-3c0f-4fad-a447-8dd15db59898
376	159	1.32	1.32	/thumbnails/u43-w48-t159-v1_32.png	/uploads/templates/u43-w48-t159-v1_32.json	43	2025-12-16 20:45:17.002398	active	a5cf2d69-6255-4405-8ff7-5996b26c9bd4
377	159	1.33	1.33	/thumbnails/u43-w48-t159-v1_33.png	/uploads/templates/u43-w48-t159-v1_33.json	43	2025-12-16 20:52:20.460951	active	1f7b8226-ab2b-40f9-9acd-0fd18835afaa
378	159	1.34	1.34	/thumbnails/u43-w48-t159-v1_34.png	/uploads/templates/u43-w48-t159-v1_34.json	43	2025-12-16 20:52:57.59847	active	427faa86-b00d-4928-a47a-aa2b38b9005b
379	159	1.35	1.35	/thumbnails/u43-w48-t159-v1_35.png	/uploads/templates/u43-w48-t159-v1_35.json	43	2025-12-16 20:56:02.322222	active	a7a0a3e7-cfc4-4464-b568-1e7659a74760
380	159	1.36	1.36	/thumbnails/u43-w48-t159-v1_36.png	/uploads/templates/u43-w48-t159-v1_36.json	43	2025-12-16 20:59:20.065375	active	950f45a9-a04f-416b-8411-ce27f2e51734
381	159	1.37	1.37	/thumbnails/u43-w48-t159-v1_37.png	/uploads/templates/u43-w48-t159-v1_37.json	43	2025-12-16 21:01:56.623097	active	42ded308-1a52-4dab-be51-1dde5eec9a0d
382	159	1.38	1.38	/thumbnails/u43-w48-t159-v1_38.png	/uploads/templates/u43-w48-t159-v1_38.json	43	2025-12-16 21:03:05.371984	active	cedb4413-9a11-4329-9ba5-42c58e9ccb47
383	159	1.39	1.39	/thumbnails/u43-w48-t159-v1_39.png	/uploads/templates/u43-w48-t159-v1_39.json	43	2025-12-16 21:06:44.426651	active	7f13a19b-cc2b-4bad-bb23-19376e70b689
384	159	1.40	1.40	/thumbnails/u43-w48-t159-v1_40.png	/uploads/templates/u43-w48-t159-v1_40.json	43	2025-12-16 21:09:45.476643	active	45ee7e18-8e57-4cf1-9882-d81694ae5471
385	159	1.41	1.41	/thumbnails/u43-w48-t159-v1_41.png	/uploads/templates/u43-w48-t159-v1_41.json	43	2025-12-16 21:26:13.078855	active	167a3d23-c48b-47b0-acc1-659c35735d80
386	159	1.42	1.42	/thumbnails/u43-w48-t159-v1_42.png	/uploads/templates/u43-w48-t159-v1_42.json	43	2025-12-16 21:27:50.721776	active	48c349f0-1d4a-4b0d-bd9c-83f1f47ba4f0
387	159	1.43	1.43	/thumbnails/u43-w48-t159-v1_43.png	/uploads/templates/u43-w48-t159-v1_43.json	43	2025-12-16 21:28:41.20742	active	e950765d-bffd-4d97-80da-356dc898beef
388	159	1.44	1.44	/thumbnails/u43-w48-t159-v1_44.png	/uploads/templates/u43-w48-t159-v1_44.json	43	2025-12-16 21:38:11.146739	active	b4750be6-9b7c-4c6a-8c6e-2e4806410c1e
389	159	1.45	1.45	/thumbnails/u43-w48-t159-v1_45.png	/uploads/templates/u43-w48-t159-v1_45.json	43	2025-12-16 21:49:49.175248	active	a7800c9d-6280-4abd-9ace-ba7d271e3e5b
390	159	1.46	1.46	/thumbnails/u43-w48-t159-v1_46.png	/uploads/templates/u43-w48-t159-v1_46.json	43	2025-12-16 21:50:43.450708	active	f69c95c0-49bc-4c8d-8dcb-3e88250eedc3
391	159	1.47	1.47	/thumbnails/u43-w48-t159-v1_47.png	/uploads/templates/u43-w48-t159-v1_47.json	43	2025-12-16 21:58:54.721175	active	02aa6041-ed70-49d6-8ede-8d5d3f5f2fc1
392	159	1.48	1.48	/thumbnails/u43-w48-t159-v1_48.png	/uploads/templates/u43-w48-t159-v1_48.json	43	2025-12-16 22:00:25.389487	active	8046322a-0daa-46be-9ff1-f6b57a4cc205
393	159	1.49	1.49	/thumbnails/u44-w48-t159-v1_49.png	/uploads/templates/u44-w48-t159-v1_49.json	44	2025-12-17 09:24:46.556309	active	c8ec1eed-818a-400f-8096-215b0b8667c9
394	159	1.50	1.50	/thumbnails/u44-w48-t159-v1_50.png	/uploads/templates/u44-w48-t159-v1_50.json	44	2025-12-17 09:32:22.571098	active	071a4839-8c73-4d17-9126-c0915223615d
395	159	1.51	1.51	/thumbnails/u44-w48-t159-v1_51.png	/uploads/templates/u44-w48-t159-v1_51.json	44	2025-12-17 09:32:39.229758	active	73e221b3-71d1-4adc-a5c8-752f1a9c7ebe
396	159	1.52	1.52	/thumbnails/u44-w48-t159-v1_52.png	/uploads/templates/u44-w48-t159-v1_52.json	44	2025-12-17 09:35:45.783998	active	bc7f1d96-9799-4737-8f3f-f53697caf0c5
397	159	1.53	1.53	/thumbnails/u44-w48-t159-v1_53.png	/uploads/templates/u44-w48-t159-v1_53.json	44	2025-12-17 09:38:44.046048	active	d29f2ed8-3e3e-4f20-b46f-0bec03ee839c
398	159	1.54	1.54	/thumbnails/u44-w48-t159-v1_54.png	/uploads/templates/u44-w48-t159-v1_54.json	44	2025-12-17 09:48:51.968386	active	64b64b32-1115-4afb-b0fc-28b1cf94538d
399	159	1.55	1.55	/thumbnails/u44-w48-t159-v1_55.png	/uploads/templates/u44-w48-t159-v1_55.json	44	2025-12-17 10:16:14.674686	active	b32574da-19c3-4476-950d-9dbbba9e4654
400	159	1.56	1.56	/thumbnails/u44-w48-t159-v1_56.png	/uploads/templates/u44-w48-t159-v1_56.json	44	2025-12-17 10:17:19.381008	active	a31e3a80-442f-4c58-a052-9360a38f4217
401	159	1.57	1.57	/thumbnails/u44-w48-t159-v1_57.png	/uploads/templates/u44-w48-t159-v1_57.json	44	2025-12-17 10:23:32.005198	active	2c87db7d-afb3-4e75-8972-b3d74cdf98e6
402	159	1.58	1.58	/thumbnails/u44-w48-t159-v1_58.png	/uploads/templates/u44-w48-t159-v1_58.json	44	2025-12-17 10:27:30.426492	active	1b8e3efe-8814-40f2-a9e2-4fe47e8a1469
403	159	1.59	1.59	/thumbnails/u44-w48-t159-v1_59.png	/uploads/templates/u44-w48-t159-v1_59.json	44	2025-12-17 10:37:28.020431	active	f433d382-8131-4d96-8830-64889128b9c3
404	159	1.60	1.60	/thumbnails/u44-w48-t159-v1_60.png	/uploads/templates/u44-w48-t159-v1_60.json	44	2025-12-17 10:44:19.284468	active	9a9b7b7a-161e-4bee-876a-30fe07bffc1e
405	159	1.61	1.61	/thumbnails/u44-w48-t159-v1_61.png	/uploads/templates/u44-w48-t159-v1_61.json	44	2025-12-17 10:50:38.336662	active	0335ddd1-60fe-48dd-a59d-a9714ffcbfa5
406	159	1.62	1.62	/thumbnails/u44-w48-t159-v1_62.png	/uploads/templates/u44-w48-t159-v1_62.json	44	2025-12-17 10:56:30.979648	active	c2f18442-47ee-4eb7-8bc0-a48ca1dbba67
407	159	1.63	1.63	/thumbnails/u44-w48-t159-v1_63.png	/uploads/templates/u44-w48-t159-v1_63.json	44	2025-12-17 11:13:45.546056	active	cbeb5683-535f-41d2-8f81-d8cd0026e072
408	159	1.64	1.64	/thumbnails/u44-w48-t159-v1_64.png	/uploads/templates/u44-w48-t159-v1_64.json	44	2025-12-17 11:16:41.752068	active	46e080d1-0d21-48b2-94e7-27abcf9c4167
409	159	1.65	1.65	/thumbnails/u44-w48-t159-v1_65.png	/uploads/templates/u44-w48-t159-v1_65.json	44	2025-12-17 11:22:16.660261	active	ff4ecd9a-8db0-4591-a373-2ce12380e441
410	159	1.66	1.66	/thumbnails/u44-w48-t159-v1_66.png	/uploads/templates/u44-w48-t159-v1_66.json	44	2025-12-17 11:31:39.047646	active	fd6d271d-85ec-44d9-afa9-4b971782486b
411	159	1.67	1.67	/thumbnails/u44-w48-t159-v1_67.png	/uploads/templates/u44-w48-t159-v1_67.json	44	2025-12-17 11:40:47.782953	active	66187a6c-28ea-4afd-a850-9efbe4decea8
412	159	1.68	1.68	/thumbnails/u44-w48-t159-v1_68.png	/uploads/templates/u44-w48-t159-v1_68.json	44	2025-12-17 11:45:33.384034	active	37050a4a-071c-4596-8ef8-aaabbc1708a1
413	159	1.69	1.69	/thumbnails/u44-w48-t159-v1_69.png	/uploads/templates/u44-w48-t159-v1_69.json	44	2025-12-17 13:27:38.270162	active	ec749df3-aff4-477b-b941-43652131f4fa
414	159	1.70	1.70	/thumbnails/u44-w48-t159-v1_70.png	/uploads/templates/u44-w48-t159-v1_70.json	44	2025-12-17 13:33:50.709492	active	fac7c5c7-f448-4bb5-b22e-df7f75bd9e9a
415	159	1.71	1.71	/thumbnails/u44-w48-t159-v1_71.png	/uploads/templates/u44-w48-t159-v1_71.json	44	2025-12-17 14:03:29.742824	active	5f5c5d9d-2075-412a-bb97-bb02f3a4e3d1
416	159	1.72	1.72	/thumbnails/u44-w48-t159-v1_72.png	/uploads/templates/u44-w48-t159-v1_72.json	44	2025-12-17 14:04:39.91074	active	e4abe1ac-e829-406d-b8fb-e502e184757b
417	155	1.01	1.01	/thumbnails/u43-w47-t155-v1_01.png	/uploads/templates/u43-w47-t155-v1_01.json	43	2025-12-17 14:38:57.667483	active	e447a03c-a810-418f-b5cb-11d231bbd057
418	161	1.00	1.00	/thumbnails/u44-w49-t161-v1_00.png	/uploads/templates/u44-w49-t161-v1_00.json	44	2025-12-17 15:22:04.10175	active	ee5bcefe-9298-44c8-9ddb-c7c3b18e9686
419	159	1.73	1.73	/thumbnails/u43-w48-t159-v1_73.png	/uploads/templates/u43-w48-t159-v1_73.json	43	2025-12-17 16:15:16.641113	active	87092a06-0904-4d23-81dc-9769b5818fa5
420	159	1.74	1.74	/thumbnails/u43-w48-t159-v1_74.png	/uploads/templates/u43-w48-t159-v1_74.json	43	2025-12-17 16:27:10.810541	active	6a336eab-1d8a-48c1-be8c-d71ffb6187c8
421	159	1.75	1.75	/thumbnails/u43-w48-t159-v1_75.png	/uploads/templates/u43-w48-t159-v1_75.json	43	2025-12-17 16:36:30.074519	active	cef3178f-bdd5-4fe4-ba52-f8cf05b2ad29
422	159	1.76	1.76	/thumbnails/u43-w48-t159-v1_76.png	/uploads/templates/u43-w48-t159-v1_76.json	43	2025-12-17 16:38:08.091455	active	62aeac76-17d6-44db-a2f6-f56baa164a74
423	159	1.77	1.77	/thumbnails/u43-w48-t159-v1_77.png	/uploads/templates/u43-w48-t159-v1_77.json	43	2025-12-17 16:46:15.091663	active	e53cda9a-d5cb-45cf-8616-6bc42529dba3
424	159	1.78	1.78	/thumbnails/u44-w48-t159-v1_78.png	/uploads/templates/u44-w48-t159-v1_78.json	44	2025-12-18 09:40:36.28015	active	80dc1fa0-ae22-4beb-b642-6b1086b7e5f6
425	159	1.79	1.79	/thumbnails/u44-w48-t159-v1_79.png	/uploads/templates/u44-w48-t159-v1_79.json	44	2025-12-18 09:41:25.30946	active	e59f3758-2c9b-4f1d-a37a-b41185de808c
426	159	1.80	1.80	/thumbnails/u44-w48-t159-v1_80.png	/uploads/templates/u44-w48-t159-v1_80.json	44	2025-12-18 09:42:12.594474	active	2bea31b6-9f3d-43b1-abce-70aade0a3300
427	159	1.81	1.81	/thumbnails/u44-w48-t159-v1_81.png	/uploads/templates/u44-w48-t159-v1_81.json	44	2025-12-18 09:43:47.936312	active	5fb35f81-118d-4efd-8423-9dbef7476ab2
428	159	1.82	1.82	/thumbnails/u44-w48-t159-v1_82.png	/uploads/templates/u44-w48-t159-v1_82.json	44	2025-12-18 09:54:47.040277	active	3a681cac-4ee4-4dd6-806b-e3aad9d116fa
429	159	1.83	1.83	/thumbnails/u44-w48-t159-v1_83.png	/uploads/templates/u44-w48-t159-v1_83.json	44	2025-12-18 10:04:48.82116	active	a1a5b1c5-efdc-4aa8-93bb-f42e44784e52
430	159	1.84	1.84	/thumbnails/u44-w48-t159-v1_84.png	/uploads/templates/u44-w48-t159-v1_84.json	44	2025-12-18 10:07:30.173335	active	f7cefcd8-e787-4d91-949d-25403c97d7ad
431	159	1.85	1.85	/thumbnails/u44-w48-t159-v1_85.png	/uploads/templates/u44-w48-t159-v1_85.json	44	2025-12-18 10:12:01.556669	active	6671671f-4e31-4269-8407-fe1153e31885
432	159	1.86	1.86	/thumbnails/u44-w48-t159-v1_86.png	/uploads/templates/u44-w48-t159-v1_86.json	44	2025-12-18 10:17:40.018813	active	bcf659f4-2116-418e-a770-51d12255cb36
433	159	1.87	1.87	/thumbnails/u44-w48-t159-v1_87.png	/uploads/templates/u44-w48-t159-v1_87.json	44	2025-12-18 10:21:25.867212	active	dae18d92-a3bf-406c-849c-f24eceba49bf
434	159	1.88	1.88	/thumbnails/u44-w48-t159-v1_88.png	/uploads/templates/u44-w48-t159-v1_88.json	44	2025-12-18 10:30:10.30773	active	9c8acdfa-625f-42ac-81a0-f4d3f9b58c4b
435	159	1.89	1.89	/thumbnails/u44-w48-t159-v1_89.png	/uploads/templates/u44-w48-t159-v1_89.json	44	2025-12-18 10:32:58.04051	active	70c65a59-68d5-4aaa-b818-67f3a3849fb4
436	159	1.90	1.90	/thumbnails/u44-w48-t159-v1_90.png	/uploads/templates/u44-w48-t159-v1_90.json	44	2025-12-18 10:56:15.494915	active	596dad0a-bb51-402d-b335-c106797f15b1
437	159	1.91	1.91	/thumbnails/u44-w48-t159-v1_91.png	/uploads/templates/u44-w48-t159-v1_91.json	44	2025-12-18 11:42:42.956918	active	57582835-d4ee-486d-8e67-386c9278c06d
438	159	1.92	1.92	/thumbnails/u44-w48-t159-v1_92.png	/uploads/templates/u44-w48-t159-v1_92.json	44	2025-12-18 11:53:37.248122	active	5ba9527a-ce07-4b30-8031-94f4d0a053bc
439	159	1.93	1.93	/thumbnails/u44-w48-t159-v1_93.png	/uploads/templates/u44-w48-t159-v1_93.json	44	2025-12-18 12:15:04.559177	active	ad414e73-1061-4c6f-8767-51bfdc6c8a49
440	159	1.94	1.94	/thumbnails/u44-w48-t159-v1_94.png	/uploads/templates/u44-w48-t159-v1_94.json	44	2025-12-18 12:22:26.268301	active	e0e64364-9e5e-4a43-9ea5-d89820dcef99
441	159	1.95	1.95	/thumbnails/u43-w48-t159-v1_95.png	/uploads/templates/u43-w48-t159-v1_95.json	43	2025-12-18 12:31:55.580221	active	98132f06-3791-4be3-bb5d-50b3111501d4
442	159	1.96	1.96	/thumbnails/u43-w48-t159-v1_96.png	/uploads/templates/u43-w48-t159-v1_96.json	43	2025-12-18 12:32:37.616299	active	c208835c-a0b7-449d-b6ff-63d0238cf680
443	159	1.97	1.97	/thumbnails/u43-w48-t159-v1_97.png	/uploads/templates/u43-w48-t159-v1_97.json	43	2025-12-18 13:00:46.667905	active	1c1c154d-b4b3-4e6f-896c-39839976cfff
444	159	1.98	1.98	/thumbnails/u43-w48-t159-v1_98.png	/uploads/templates/u43-w48-t159-v1_98.json	43	2025-12-18 13:04:20.089823	active	d53bd2dc-4b77-479b-acf0-d9ef60880113
445	159	1.99	1.99	/thumbnails/u43-w48-t159-v1_99.png	/uploads/templates/u43-w48-t159-v1_99.json	43	2025-12-18 13:07:21.655919	active	90ee6041-5cf7-4e77-afe6-9269f9ac31e1
446	159	2.00	2.00	/thumbnails/u43-w48-t159-v2_00.png	/uploads/templates/u43-w48-t159-v2_00.json	43	2025-12-18 13:07:26.05276	active	9e7f831d-6f9c-4a93-a025-5f9cab3d4479
447	162	1.00	1.00	/thumbnails/u43-w48-t162-v1_00.png	/uploads/templates/u43-w48-t162-v1_00.json	43	2025-12-18 13:08:48.222895	active	2e4f4931-93e2-4544-83e3-238eeabee228
448	159	2.01	2.01	/thumbnails/u43-w48-t159-v2_01.png	/uploads/templates/u43-w48-t159-v2_01.json	43	2025-12-18 13:12:01.393681	active	5cc677e5-32e1-4140-b411-790bea6eb4de
449	162	1.01	1.01	/thumbnails/u43-w48-t162-v1_01.png	/uploads/templates/u43-w48-t162-v1_01.json	43	2025-12-18 13:13:52.909464	active	e8ad1265-0043-40cc-a212-eb524fe7f0ac
450	162	1.02	1.02	/thumbnails/u43-w48-t162-v1_02.png	/uploads/templates/u43-w48-t162-v1_02.json	43	2025-12-18 13:14:00.162841	active	1e8aee24-d5c4-401c-a4e8-871e17101054
451	162	1.03	1.03	/thumbnails/u43-w48-t162-v1_03.png	/uploads/templates/u43-w48-t162-v1_03.json	43	2025-12-18 13:15:32.990569	active	172c5eb3-82c2-42d5-9498-14f73a6f21e1
452	163	1.00	1.00	/thumbnails/u43-w48-t163-v1_00.png	/uploads/templates/u43-w48-t163-v1_00.json	43	2025-12-18 13:16:26.38132	active	018d2818-b729-4cea-909b-0c6fc3bd462c
453	163	1.01	1.01	/thumbnails/u43-w48-t163-v1_01.png	/uploads/templates/u43-w48-t163-v1_01.json	43	2025-12-18 13:18:35.312102	active	acc0a650-90a9-4691-9de0-fe7e8289aebb
454	163	1.02	1.02	/thumbnails/u43-w48-t163-v1_02.png	/uploads/templates/u43-w48-t163-v1_02.json	43	2025-12-18 13:18:44.346682	active	d4d0a0bd-f3c6-4712-bab4-0ddc9b595628
455	163	1.03	1.03	/thumbnails/u43-w48-t163-v1_03.png	/uploads/templates/u43-w48-t163-v1_03.json	43	2025-12-18 13:18:53.810123	active	39586e8b-a246-416a-a9f7-e3a15547f1ae
456	163	1.04	1.04	/thumbnails/u43-w48-t163-v1_04.png	/uploads/templates/u43-w48-t163-v1_04.json	43	2025-12-18 13:18:59.708688	active	442ba003-857d-479c-a0fe-7845893cc78c
457	162	1.04	1.04	/thumbnails/u43-w48-t162-v1_04.png	/uploads/templates/u43-w48-t162-v1_04.json	43	2025-12-18 13:19:45.11954	active	edad9d62-0a33-48c0-aff8-1b77a72e7cee
458	163	1.05	1.05	/thumbnails/u43-w48-t163-v1_05.png	/uploads/templates/u43-w48-t163-v1_05.json	43	2025-12-18 13:20:49.945831	active	4fe700a9-3ee8-423d-a1f8-36f814167213
459	162	1.05	1.05	/thumbnails/u43-w48-t162-v1_05.png	/uploads/templates/u43-w48-t162-v1_05.json	43	2025-12-18 13:29:31.492966	active	c9391f14-3612-476d-ab14-bcff79d06911
460	162	1.06	1.06	/thumbnails/u43-w48-t162-v1_06.png	/uploads/templates/u43-w48-t162-v1_06.json	43	2025-12-18 13:51:18.583364	active	eedb4c42-3f6a-4210-9ea9-8c1c5bf26ebb
461	162	1.07	1.07	/thumbnails/u43-w48-t162-v1_07.png	/uploads/templates/u43-w48-t162-v1_07.json	43	2025-12-18 13:57:46.181858	active	938edcd4-a100-4da9-9098-703a2934d5dc
462	162	1.08	1.08	/thumbnails/u43-w48-t162-v1_08.png	/uploads/templates/u43-w48-t162-v1_08.json	43	2025-12-18 14:02:18.262933	active	3136db78-201e-43eb-8673-a2173c1d4ecf
463	162	1.09	1.09	/thumbnails/u43-w48-t162-v1_09.png	/uploads/templates/u43-w48-t162-v1_09.json	43	2025-12-18 14:09:42.877383	active	5bdcace1-b827-46c9-8ff2-325a222f1519
464	162	1.10	1.10	/thumbnails/u43-w48-t162-v1_10.png	/uploads/templates/u43-w48-t162-v1_10.json	43	2025-12-18 14:18:24.331876	active	d15638d2-0c8d-4bf9-8589-ac30efbb0634
465	162	1.11	1.11	/thumbnails/u43-w48-t162-v1_11.png	/uploads/templates/u43-w48-t162-v1_11.json	43	2025-12-18 14:20:36.616883	active	8d50b87c-92d1-4bf8-b03c-6e633b1b11a9
466	163	1.06	1.06	/thumbnails/u44-w48-t163-v1_06.png	/uploads/templates/u44-w48-t163-v1_06.json	44	2025-12-18 14:21:34.092898	active	7410176a-1373-4094-b62c-a4894a27feca
467	162	1.12	1.12	/thumbnails/u43-w48-t162-v1_12.png	/uploads/templates/u43-w48-t162-v1_12.json	43	2025-12-18 14:23:18.114625	active	83624f52-7107-4850-b829-985de6b06406
468	162	1.13	1.13	/thumbnails/u43-w48-t162-v1_13.png	/uploads/templates/u43-w48-t162-v1_13.json	43	2025-12-18 14:27:21.046803	active	8f899139-93e2-437b-8b0b-7273b13f971e
469	163	1.07	1.07	/thumbnails/u44-w48-t163-v1_07.png	/uploads/templates/u44-w48-t163-v1_07.json	44	2025-12-18 14:29:26.911123	active	91361101-3baf-42a9-9867-44a6a020981a
470	162	1.14	1.14	/thumbnails/u43-w48-t162-v1_14.png	/uploads/templates/u43-w48-t162-v1_14.json	43	2025-12-18 14:30:27.078897	active	47911c3b-8aab-4abc-92b2-a5edcf90e346
471	163	1.08	1.08	/thumbnails/u44-w48-t163-v1_08.png	/uploads/templates/u44-w48-t163-v1_08.json	44	2025-12-18 14:33:36.868457	active	1aabfae2-b64e-4a68-8047-d6942f153a7c
472	162	1.15	1.15	/thumbnails/u43-w48-t162-v1_15.png	/uploads/templates/u43-w48-t162-v1_15.json	43	2025-12-18 14:34:57.374196	active	2fa706ca-e75e-46f0-925b-5aecd6ed7157
473	163	1.09	1.09	/thumbnails/u44-w48-t163-v1_09.png	/uploads/templates/u44-w48-t163-v1_09.json	44	2025-12-18 14:35:26.242513	active	d10b2493-0b2a-45a4-8140-64b473a2d4fa
474	162	1.16	1.16	/thumbnails/u43-w48-t162-v1_16.png	/uploads/templates/u43-w48-t162-v1_16.json	43	2025-12-18 14:36:39.279761	active	ca2fcfbe-ad15-408a-90a6-3ec3ee4e5778
475	163	1.10	1.10	/thumbnails/u44-w48-t163-v1_10.png	/uploads/templates/u44-w48-t163-v1_10.json	44	2025-12-18 14:36:44.27776	active	fe5afe34-8491-4a68-b952-c1fcf25f8d01
476	162	1.17	1.17	/thumbnails/u43-w48-t162-v1_17.png	/uploads/templates/u43-w48-t162-v1_17.json	43	2025-12-18 14:43:23.76496	active	cc2fcced-ba6d-49e1-8781-ca626664bb84
477	162	1.18	1.18	/thumbnails/u43-w48-t162-v1_18.png	/uploads/templates/u43-w48-t162-v1_18.json	43	2025-12-18 14:43:41.46336	active	3ee85c78-df1c-499b-9268-8c0f8c880874
478	163	1.11	1.11	/thumbnails/u44-w48-t163-v1_11.png	/uploads/templates/u44-w48-t163-v1_11.json	44	2025-12-18 14:53:53.058757	active	c726660a-b60e-4b86-8740-4831ac8c4b48
479	163	1.12	1.12	/thumbnails/u44-w48-t163-v1_12.png	/uploads/templates/u44-w48-t163-v1_12.json	44	2025-12-18 14:54:24.101495	active	64b3484c-a35d-4e64-bb61-659e4e1710a8
480	162	1.19	1.19	/thumbnails/u43-w48-t162-v1_19.png	/uploads/templates/u43-w48-t162-v1_19.json	43	2025-12-18 14:55:09.072107	active	65a42ce4-ba8f-448e-bbbb-baec46c258e7
481	162	1.20	1.20	/thumbnails/u43-w48-t162-v1_20.png	/uploads/templates/u43-w48-t162-v1_20.json	43	2025-12-18 14:55:16.426819	active	4d7b546b-31bf-463f-b3f0-e904fd16c4aa
482	162	1.21	1.21	/thumbnails/u43-w48-t162-v1_21.png	/uploads/templates/u43-w48-t162-v1_21.json	43	2025-12-18 14:56:21.95757	active	61517c19-3a0f-4a87-b2c0-77bc4a777842
483	163	1.13	1.13	/thumbnails/u44-w48-t163-v1_13.png	/uploads/templates/u44-w48-t163-v1_13.json	44	2025-12-18 15:00:22.201802	active	7d4a59dd-f1d8-43b9-bcd9-632e3e083ceb
484	162	1.22	1.22	/thumbnails/u43-w48-t162-v1_22.png	/uploads/templates/u43-w48-t162-v1_22.json	43	2025-12-18 15:06:07.698181	active	ea803b33-a947-46cd-9cac-139c85527966
485	162	1.23	1.23	/thumbnails/u43-w48-t162-v1_23.png	/uploads/templates/u43-w48-t162-v1_23.json	43	2025-12-18 15:18:22.303192	active	76e22ace-6fea-4d4f-b2a5-cd2e707a7a2f
486	163	1.14	1.14	/thumbnails/u44-w48-t163-v1_14.png	/uploads/templates/u44-w48-t163-v1_14.json	44	2025-12-18 15:25:04.372429	active	cb16e65c-e13b-499b-9bc0-4632faaec580
487	162	1.24	1.24	/thumbnails/u43-w48-t162-v1_24.png	/uploads/templates/u43-w48-t162-v1_24.json	43	2025-12-18 15:26:18.317647	active	f1a30ed5-f4cf-470d-ada5-827c24a307d5
488	163	1.15	1.15	/thumbnails/u44-w48-t163-v1_15.png	/uploads/templates/u44-w48-t163-v1_15.json	44	2025-12-18 15:30:41.605574	active	5ce6fcee-edbc-4b31-8b0f-904ab0d15fb6
489	163	1.16	1.16	/thumbnails/u44-w48-t163-v1_16.png	/uploads/templates/u44-w48-t163-v1_16.json	44	2025-12-18 15:49:28.757798	active	2b620cf3-4035-4cc1-b960-8ab7d5c70a21
490	163	1.17	1.17	/thumbnails/u44-w48-t163-v1_17.png	/uploads/templates/u44-w48-t163-v1_17.json	44	2025-12-18 15:51:42.527958	active	f4afcaf5-e0cc-491b-ac5b-2aa0900a63b6
491	163	1.18	1.18	/thumbnails/u44-w48-t163-v1_18.png	/uploads/templates/u44-w48-t163-v1_18.json	44	2025-12-18 15:54:24.280709	active	9420d46b-0ac4-427d-8f91-ce69d4af42e3
492	163	1.19	1.19	/thumbnails/u44-w48-t163-v1_19.png	/uploads/templates/u44-w48-t163-v1_19.json	44	2025-12-18 15:55:57.364564	active	7afbc7e2-d163-4aa3-b29b-170bf14db87c
493	163	1.20	1.20	/thumbnails/u44-w48-t163-v1_20.png	/uploads/templates/u44-w48-t163-v1_20.json	44	2025-12-18 16:19:24.320367	active	c61af6d7-cd8b-4001-acb1-6f834bc7bd92
494	163	1.21	1.21	/thumbnails/u44-w48-t163-v1_21.png	/uploads/templates/u44-w48-t163-v1_21.json	44	2025-12-18 16:21:39.336181	active	3cf903ca-391a-4576-85bc-d8d1bb4121d9
495	163	1.22	1.22	/thumbnails/u44-w48-t163-v1_22.png	/uploads/templates/u44-w48-t163-v1_22.json	44	2025-12-18 16:31:19.546114	active	7a2b9254-9979-47bc-bea7-5b9f5e4691c1
496	163	1.23	1.23	/thumbnails/u44-w48-t163-v1_23.png	/uploads/templates/u44-w48-t163-v1_23.json	44	2025-12-18 16:34:02.798928	active	316c6e69-5fa9-4a67-b632-dc6c352e2e66
497	163	1.24	1.24	/thumbnails/u44-w48-t163-v1_24.png	/uploads/templates/u44-w48-t163-v1_24.json	44	2025-12-18 16:42:10.57519	active	f1275925-301e-4324-9e5d-6031f25c6bbf
498	163	1.25	1.25	/thumbnails/u44-w48-t163-v1_25.png	/uploads/templates/u44-w48-t163-v1_25.json	44	2025-12-18 16:58:42.268553	active	c9eda64e-0fd5-4e53-9fc9-4fe8efa31cd7
499	163	1.26	1.26	/thumbnails/u44-w48-t163-v1_26.png	/uploads/templates/u44-w48-t163-v1_26.json	44	2025-12-18 17:01:33.388282	active	a003dcde-2f4d-4091-a775-5fb300a6a7d3
500	162	1.25	1.25	/thumbnails/u43-w48-t162-v1_25.png	/uploads/templates/u43-w48-t162-v1_25.json	43	2025-12-18 19:20:07.379918	active	f93c8978-c00c-4a9e-9ef1-1adf7f8c0888
501	162	1.26	1.26	/thumbnails/u43-w48-t162-v1_26.png	/uploads/templates/u43-w48-t162-v1_26.json	43	2025-12-18 19:21:35.774604	active	b2fa3d6b-781f-4922-a5dd-ddfb3af1669e
502	162	1.27	1.27	/thumbnails/u43-w48-t162-v1_27.png	/uploads/templates/u43-w48-t162-v1_27.json	43	2025-12-18 19:23:34.104518	active	fe4e5076-83d6-4538-83a9-114bada90409
503	162	1.28	1.28	/thumbnails/u43-w48-t162-v1_28.png	/uploads/templates/u43-w48-t162-v1_28.json	43	2025-12-18 19:30:30.832509	active	1f5f192e-6f5e-4ec1-8d3e-e471201adff2
504	163	1.27	1.27	/thumbnails/u43-w48-t163-v1_27.png	/uploads/templates/u43-w48-t163-v1_27.json	43	2025-12-18 19:37:23.099692	active	ee7d7501-0e17-4d9c-af43-f2ac416e8f07
505	163	1.28	1.28	/thumbnails/u43-w48-t163-v1_28.png	/uploads/templates/u43-w48-t163-v1_28.json	43	2025-12-18 19:37:29.286081	active	ebe67e9a-5edd-4723-84bd-e2b5c86c5628
506	162	1.29	1.29	/thumbnails/u43-w48-t162-v1_29.png	/uploads/templates/u43-w48-t162-v1_29.json	43	2025-12-18 19:39:33.650416	active	47906182-79d1-41fd-a81b-a023994cc5ec
507	162	1.30	1.30	/thumbnails/u43-w48-t162-v1_30.png	/uploads/templates/u43-w48-t162-v1_30.json	43	2025-12-18 19:39:40.503196	active	e56c510d-bc03-4aaa-a1bb-f31436609854
508	163	1.29	1.29	/thumbnails/u43-w48-t163-v1_29.png	/uploads/templates/u43-w48-t163-v1_29.json	43	2025-12-18 19:43:17.988372	active	1093aca9-b4d0-48ab-9e04-459984d8dd46
509	163	1.30	1.30	/thumbnails/u43-w48-t163-v1_30.png	/uploads/templates/u43-w48-t163-v1_30.json	43	2025-12-18 19:43:25.05319	active	79b81189-5c5b-4f27-8cc3-36c071d25dc8
510	163	1.31	1.31	/thumbnails/u43-w48-t163-v1_31.png	/uploads/templates/u43-w48-t163-v1_31.json	43	2025-12-18 19:48:53.989749	active	dba6a363-a648-4b49-a65c-a2be24b49a57
511	163	1.32	1.32	/thumbnails/u43-w48-t163-v1_32.png	/uploads/templates/u43-w48-t163-v1_32.json	43	2025-12-18 20:00:33.14179	active	a51627a5-b517-4577-9674-e2319a403a67
512	159	2.02	2.02	/thumbnails/u44-w48-t159-v2_02.png	/uploads/templates/u44-w48-t159-v2_02.json	44	2025-12-19 10:16:46.533428	active	a55356e3-cdb4-420c-b4d9-227ee8d7a89a
513	159	2.03	2.03	/thumbnails/u44-w48-t159-v2_03.png	/uploads/templates/u44-w48-t159-v2_03.json	44	2025-12-19 10:22:13.220359	active	36821302-953b-4837-8cca-187262b06489
514	159	2.04	2.04	/thumbnails/u44-w48-t159-v2_04.png	/uploads/templates/u44-w48-t159-v2_04.json	44	2025-12-19 10:40:54.642072	active	0e26198a-8113-4d2a-bff9-0be04ac24b35
515	159	2.05	2.05	/thumbnails/u44-w48-t159-v2_05.png	/uploads/templates/u44-w48-t159-v2_05.json	44	2025-12-19 10:44:50.860128	active	24e26c50-5457-4d06-8c8d-54b1394e8ff9
516	159	2.06	2.06	/thumbnails/u44-w48-t159-v2_06.png	/uploads/templates/u44-w48-t159-v2_06.json	44	2025-12-19 10:52:22.102257	active	0469084a-8c71-4c9b-af49-5adec85931cb
517	159	2.07	2.07	/thumbnails/u44-w48-t159-v2_07.png	/uploads/templates/u44-w48-t159-v2_07.json	44	2025-12-19 10:55:35.716146	active	8890286c-50b4-4ba1-a9bd-1db2d17d996a
518	159	2.08	2.08	/thumbnails/u44-w48-t159-v2_08.png	/uploads/templates/u44-w48-t159-v2_08.json	44	2025-12-19 10:59:50.164789	active	3ad07a8d-e54d-4394-8dc5-a74221391c47
519	159	2.09	2.09	/thumbnails/u44-w48-t159-v2_09.png	/uploads/templates/u44-w48-t159-v2_09.json	44	2025-12-19 11:02:54.74594	active	684a9659-45ce-4be7-b4ec-f7286000caa4
520	150	1.03	1.03	/thumbnails/u43-w47-t150-v1_03.png	/uploads/templates/u43-w47-t150-v1_03.json	43	2025-12-19 11:04:58.846685	active	487bebc9-3c3e-4a03-aff6-c1e995fafe89
521	159	2.10	2.10	/thumbnails/u44-w48-t159-v2_10.png	/uploads/templates/u44-w48-t159-v2_10.json	44	2025-12-19 11:05:46.416292	active	91f27229-1409-4df3-b7b6-b4863df1dc8a
522	159	2.11	2.11	/thumbnails/u44-w48-t159-v2_11.png	/uploads/templates/u44-w48-t159-v2_11.json	44	2025-12-19 11:19:49.38763	active	56259d72-7b0b-451e-b6e6-40e654aac389
523	150	1.04	1.04	/thumbnails/u43-w47-t150-v1_04.png	/uploads/templates/u43-w47-t150-v1_04.json	43	2025-12-19 11:20:12.662234	active	1b06c720-0a4a-47ce-b38a-f4c1a33a2aec
524	159	2.12	2.12	/thumbnails/u44-w48-t159-v2_12.png	/uploads/templates/u44-w48-t159-v2_12.json	44	2025-12-19 11:20:54.568831	active	04742b6e-eb5b-42d6-a81e-668584bcbad9
525	150	1.05	1.05	/thumbnails/u43-w47-t150-v1_05.png	/uploads/templates/u43-w47-t150-v1_05.json	43	2025-12-19 11:27:01.587938	active	af20c002-54ea-4924-a19e-dc81202a08a8
526	159	2.13	2.13	/thumbnails/u44-w48-t159-v2_13.png	/uploads/templates/u44-w48-t159-v2_13.json	44	2025-12-19 11:35:59.382135	active	63e5c47a-6195-4c12-a5bf-3e9d03ade9ad
527	159	2.14	2.14	/thumbnails/u44-w48-t159-v2_14.png	/uploads/templates/u44-w48-t159-v2_14.json	44	2025-12-19 11:46:03.003295	active	cc5b500d-b27b-44ec-87d2-d689ad1435a1
528	159	2.15	2.15	/thumbnails/u44-w48-t159-v2_15.png	/uploads/templates/u44-w48-t159-v2_15.json	44	2025-12-19 11:51:12.325135	active	5d5b67ad-f8f1-4767-84d1-06deb8f34741
529	159	2.16	2.16	/thumbnails/u44-w48-t159-v2_16.png	/uploads/templates/u44-w48-t159-v2_16.json	44	2025-12-19 13:31:17.628761	active	d5e5436f-b67e-46c5-9134-8cf38cbfb64e
530	159	2.17	2.17	/thumbnails/u44-w48-t159-v2_17.png	/uploads/templates/u44-w48-t159-v2_17.json	44	2025-12-22 08:36:01.524855	active	95c2e11b-6951-4dda-a597-5c938546f084
531	159	2.18	2.18	/thumbnails/u44-w48-t159-v2_18.png	/uploads/templates/u44-w48-t159-v2_18.json	44	2025-12-22 08:56:25.598769	active	a35c7677-f2bb-4640-9800-1756392b0010
532	159	2.19	2.19	/thumbnails/u44-w48-t159-v2_19.png	/uploads/templates/u44-w48-t159-v2_19.json	44	2025-12-22 09:03:30.352397	active	83a0fb32-9900-4b32-81d2-e812bc4a3f0b
533	159	2.20	2.20	/thumbnails/u44-w48-t159-v2_20.png	/uploads/templates/u44-w48-t159-v2_20.json	44	2025-12-22 09:06:28.46428	active	655f5318-8476-4161-875d-7a943d9435fa
534	159	2.21	2.21	/thumbnails/u44-w48-t159-v2_21.png	/uploads/templates/u44-w48-t159-v2_21.json	44	2025-12-22 09:09:55.265561	active	cdd3df10-5a4a-4724-8b55-e5251c84ede3
535	159	2.22	2.22	/thumbnails/u44-w48-t159-v2_22.png	/uploads/templates/u44-w48-t159-v2_22.json	44	2025-12-22 09:17:10.43932	active	cb50baba-d9ea-4a35-b15a-2128e719817e
536	159	2.23	2.23	/thumbnails/u44-w48-t159-v2_23.png	/uploads/templates/u44-w48-t159-v2_23.json	44	2025-12-22 09:18:52.14571	active	fa43e84a-ab41-4846-a26e-c9d774ded157
537	159	2.24	2.24	/thumbnails/u44-w48-t159-v2_24.png	/uploads/templates/u44-w48-t159-v2_24.json	44	2025-12-22 09:23:50.242315	active	e099b6e2-56fb-4d77-9951-91728d116c5f
538	159	2.25	2.25	/thumbnails/u44-w48-t159-v2_25.png	/uploads/templates/u44-w48-t159-v2_25.json	44	2025-12-22 11:37:17.694843	active	376062f8-593a-4a52-ac45-c738e10e6db7
539	150	1.06	1.06	/thumbnails/u43-w47-t150-v1_06.png	/uploads/templates/u43-w47-t150-v1_06.json	43	2026-01-07 18:34:13.435591	active	01bcf803-6bc6-491a-858e-7a474c9cda27
540	150	1.07	1.07	/thumbnails/u43-w47-t150-v1_07.png	/uploads/templates/u43-w47-t150-v1_07.json	43	2026-01-07 18:43:10.054204	active	eb90096c-208a-4ef2-8fad-c367e0626cfa
541	150	1.08	1.08	/thumbnails/u43-w47-t150-v1_08.png	/uploads/templates/u43-w47-t150-v1_08.json	43	2026-01-07 18:45:43.090288	active	53a3ddb8-d034-4fdf-a50a-80ca4bad2cc6
542	150	1.09	1.09	/thumbnails/u43-w47-t150-v1_09.png	/uploads/templates/u43-w47-t150-v1_09.json	43	2026-01-07 19:05:14.930954	active	4d3ac321-76d0-4c5d-91e7-03088cba2215
543	150	1.10	1.10	/thumbnails/u43-w47-t150-v1_10.png	/uploads/templates/u43-w47-t150-v1_10.json	43	2026-01-07 19:06:14.256045	active	64a5bea8-ca06-4ee1-b324-c76870ac5ebd
544	150	1.11	1.11	/thumbnails/u43-w47-t150-v1_11.png	/uploads/templates/u43-w47-t150-v1_11.json	43	2026-01-07 19:06:32.24649	active	d3337382-5b2c-4b00-9a25-dcb76052f87e
545	150	1.12	1.12	/thumbnails/u43-w47-t150-v1_12.png	/uploads/templates/u43-w47-t150-v1_12.json	43	2026-01-07 19:08:37.30718	active	5039b8e8-8d67-455e-b9ff-e17e79be4a0a
546	150	1.13	1.13	/thumbnails/u43-w47-t150-v1_13.png	/uploads/templates/u43-w47-t150-v1_13.json	43	2026-01-07 19:10:01.072495	active	f4ee5b3c-6f60-4a1f-9b28-2cd13b8cef36
547	150	1.14	1.14	/thumbnails/u43-w47-t150-v1_14.png	/uploads/templates/u43-w47-t150-v1_14.json	43	2026-01-07 19:30:25.528608	active	13450042-454c-4931-b22c-dd1db8f32859
\.


--
-- TOC entry 5154 (class 0 OID 24640)
-- Dependencies: 230
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.templates (id, title, name, description, open_date, id_workspace, created_at, updated_at, status, uuid) FROM stdin;
150	diploma 	diploma_	diploma	2025-12-15 16:57:29.286633	47	2025-12-15 16:57:29.286633-04	2025-12-15 16:57:29.286633-04	active	b0217ead-b670-473c-899e-cc8700dab7fb
155	Factura	diploma	Template Generado	2025-12-15 17:13:51.690689	47	2025-12-15 17:13:51.690689-04	2025-12-15 17:13:51.690689-04	active	c60f249e-cfd4-4fee-997e-694e7e533bbb
154	COnstancia de estudio	constancia_de_estudio	ejemplo	2025-12-15 17:12:41.078533	48	2025-12-15 17:12:41.078533-04	2025-12-15 17:31:30.916871-04	deleted	aa0de51e-2f52-4ed1-9553-e828657577a2
153	COnstancia de estudio	constancia_de_estudio	ejemplo	2025-12-15 17:12:00.329216	48	2025-12-15 17:12:00.329216-04	2025-12-16 10:40:01.818324-04	deleted	c720cb9b-5e68-4a0a-9d22-2de41627a08b
157	constancia de estudio	constancia_de_estudio	ejemplo	2025-12-15 17:29:54.53284	48	2025-12-15 17:29:54.53284-04	2025-12-16 10:40:11.797564-04	deleted	0a45a8ae-72c7-4938-9178-cdef8bae8947
149	Constancia de trabajo	constancia_de_trabajo	Constancia	2025-12-15 16:56:23.333669	48	2025-12-15 16:56:23.333669-04	2025-12-16 10:40:17.084104-04	deleted	4932f544-3e0c-4a7d-a682-d55a3cf3465c
151	hoja en blanco	hoja_en_blanco	hoja en blanco	2025-12-15 17:02:53.395389	47	2025-12-15 17:02:53.395389-04	2025-12-16 10:40:20.947974-04	deleted	00e2c826-c2d9-416c-b4be-b388deda1d9f
158	Primer documento	primer_documento	test	2025-12-16 13:20:50.436404	49	2025-12-16 13:20:50.436404-04	2025-12-16 13:20:50.436404-04	active	9f9f0ea8-2acc-47cb-869b-7ad27a77f376
159	Pacifico	pacifico	Documento de prueba de pacifico	2025-12-16 15:47:06.943332	48	2025-12-16 15:47:06.943332-04	2025-12-16 15:47:06.943332-04	active	0c7b8a44-4b7b-4644-b5df-a39fe90d3e9b
160	Pacifico	pacifico	prueba	2025-12-16 15:50:46.236361	49	2025-12-16 15:50:46.236361-04	2025-12-16 15:50:46.236361-04	active	a8ee1300-0a93-4242-b6a9-fbc0565a6c73
161	Prueba texto	prueba_texto	test	2025-12-17 15:22:04.082469	49	2025-12-17 15:22:04.082469-04	2025-12-17 15:22:04.082469-04	active	f55dc00a-b1d4-46ba-986a-98d0276f5361
162	Pacifico 10 al 7	pacifico_10_al_7	paginas 10 al 7	2025-12-18 13:08:48.201809	48	2025-12-18 13:08:48.201809-04	2025-12-18 13:08:48.201809-04	active	2c0c5ac1-ef1f-4134-b5e0-9af67f05216f
163	Pacifico 1 al 9	pacifico_1_al_9	pagina 1 al 9	2025-12-18 13:16:26.369003	48	2025-12-18 13:16:26.369003-04	2025-12-18 13:16:26.369003-04	active	5dd4e4b5-e03f-42b7-97a2-549ad3d8ca5b
\.


--
-- TOC entry 5156 (class 0 OID 24672)
-- Dependencies: 232
-- Data for Name: user_workspaces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_workspaces (id, user_id, workspace_id, is_owner, created_at, updated_at) FROM stdin;
66	43	47	t	2025-12-15 16:53:40.855536	2025-12-15 16:53:40.855536
67	43	48	t	2025-12-15 16:54:05.647081	2025-12-15 16:54:05.647081
68	44	49	t	2025-12-16 13:20:10.8604	2025-12-16 13:20:10.8604
69	44	48	f	2025-12-17 08:29:56.755578	2025-12-17 08:29:56.755578
\.


--
-- TOC entry 5146 (class 0 OID 16402)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, last_name, email, password, photo, country, zip_code, last_connection, status, id_rol, created_at, updated_at, failed_attempts, access_expiration, uuid) FROM stdin;
44	Kewin	Barboza	kewin.barboza@sybven.com	$2b$10$ikh3UGBbhS2Le5dmCdPpH.vanxccxoosSW/3gjQyamu0ScLvvlDgS	\N	PY	100	2026-01-07 13:01:29.464	\N	2	2025-12-16 13:20:10.846271	2025-12-16 13:20:10.846271	0	2026-12-16	18c60533-2f9c-49b3-ae1e-aafd4b3f47e6
43	Carlos	Bolivar	carlos_ebb@outlook.com	$2b$10$5p2QdhuJLmKvtLoWSddg6ueiXVh24eykPJdO8zTqjCYwEhkrDmMWK	/uploads/img_perfil/4f94e6b8-0927-48be-8686-356bd1fc336f.jpg	VE	1203	2026-01-07 18:33:46.354	\N	2	2025-12-15 16:53:40.834798	2025-12-15 16:53:40.834798	0	2026-12-15	092b4707-5610-41e5-ab2d-b7a5871dab6a
\.


--
-- TOC entry 5152 (class 0 OID 24614)
-- Dependencies: 228
-- Data for Name: workspaces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workspaces (id, name, icon, created_at, updated_at, uuid) FROM stdin;
47	Espacio de trabajado	icon-folder	2025-12-15 16:53:40.855536-04	2025-12-15 16:53:40.855536-04	e1645750-7e75-45fc-8e8e-5ff920ec5386
48	Ponte Creativo	CloudSun	2025-12-15 16:54:05.647081-04	2025-12-15 16:54:05.647081-04	d4c614f5-c092-4afb-a016-bcf983b38a5e
49	Espacio de trabajado	icon-folder	2025-12-16 13:20:10.8604-04	2025-12-16 13:20:10.8604-04	d7edf806-be6a-43de-83e8-70eb93a83598
\.


--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 223
-- Name: blacklisted_password_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blacklisted_password_id_seq', 3, true);


--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 225
-- Name: blacklisted_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blacklisted_tokens_id_seq', 3, true);


--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 235
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 5, true);


--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 237
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documents_id_seq', 36, true);


--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 233
-- Name: template_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_versions_id_seq', 547, true);


--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 229
-- Name: templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.templates_id_seq', 163, true);


--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 231
-- Name: user_workspaces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_workspaces_id_seq', 69, true);


--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 44, true);


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 227
-- Name: workspaces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workspaces_id_seq', 49, true);


--
-- TOC entry 4960 (class 2606 OID 24588)
-- Name: blacklisted_password blacklisted_password_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_password
    ADD CONSTRAINT blacklisted_password_pkey PRIMARY KEY (id);


--
-- TOC entry 4962 (class 2606 OID 24607)
-- Name: blacklisted_tokens blacklisted_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_tokens
    ADD CONSTRAINT blacklisted_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4980 (class 2606 OID 32826)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4982 (class 2606 OID 32828)
-- Name: categories categories_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_uuid_key UNIQUE (uuid);


--
-- TOC entry 4984 (class 2606 OID 32844)
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- TOC entry 4986 (class 2606 OID 32846)
-- Name: documents documents_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uuid_key UNIQUE (uuid);


--
-- TOC entry 4947 (class 2606 OID 16400)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 4949 (class 2606 OID 16398)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 2606 OID 24713)
-- Name: template_versions template_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_versions
    ADD CONSTRAINT template_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 32792)
-- Name: template_versions template_versions_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_versions
    ADD CONSTRAINT template_versions_uuid_key UNIQUE (uuid);


--
-- TOC entry 4968 (class 2606 OID 24650)
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- TOC entry 4970 (class 2606 OID 32802)
-- Name: templates templates_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_uuid_key UNIQUE (uuid);


--
-- TOC entry 4972 (class 2606 OID 24678)
-- Name: user_workspaces user_workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workspaces
    ADD CONSTRAINT user_workspaces_pkey PRIMARY KEY (id);


--
-- TOC entry 4974 (class 2606 OID 24680)
-- Name: user_workspaces user_workspaces_user_id_workspace_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workspaces
    ADD CONSTRAINT user_workspaces_user_id_workspace_id_key UNIQUE (user_id, workspace_id);


--
-- TOC entry 4954 (class 2606 OID 16420)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4956 (class 2606 OID 16418)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 32770)
-- Name: users users_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uuid_key UNIQUE (uuid);


--
-- TOC entry 4964 (class 2606 OID 24621)
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- TOC entry 4966 (class 2606 OID 32784)
-- Name: workspaces workspaces_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_uuid_key UNIQUE (uuid);


--
-- TOC entry 4950 (class 1259 OID 16426)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4951 (class 1259 OID 16428)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (id_rol);


--
-- TOC entry 4952 (class 1259 OID 16427)
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- TOC entry 4988 (class 2606 OID 24589)
-- Name: blacklisted_password blacklisted_password_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_password
    ADD CONSTRAINT blacklisted_password_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4989 (class 2606 OID 24608)
-- Name: blacklisted_tokens blacklisted_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklisted_tokens
    ADD CONSTRAINT blacklisted_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4995 (class 2606 OID 32847)
-- Name: documents documents_id_template_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_id_template_fkey FOREIGN KEY (id_template) REFERENCES public.templates(id) ON DELETE CASCADE;


--
-- TOC entry 4987 (class 2606 OID 16421)
-- Name: users fk_user_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_user_role FOREIGN KEY (id_rol) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4993 (class 2606 OID 24719)
-- Name: template_versions template_versions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_versions
    ADD CONSTRAINT template_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4994 (class 2606 OID 24714)
-- Name: template_versions template_versions_id_template_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_versions
    ADD CONSTRAINT template_versions_id_template_fkey FOREIGN KEY (id_template) REFERENCES public.templates(id) ON DELETE CASCADE;


--
-- TOC entry 4990 (class 2606 OID 24651)
-- Name: templates templates_id_workspace_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_id_workspace_fkey FOREIGN KEY (id_workspace) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- TOC entry 4991 (class 2606 OID 24681)
-- Name: user_workspaces user_workspaces_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workspaces
    ADD CONSTRAINT user_workspaces_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4992 (class 2606 OID 24686)
-- Name: user_workspaces user_workspaces_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_workspaces
    ADD CONSTRAINT user_workspaces_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


-- Completed on 2026-01-09 15:37:44

--
-- PostgreSQL database dump complete
--

\unrestrict IaAqBwahLUiyn35gTkCfxxIReJKeJbyQFy3jFGrEcKTmIUocDeWDimwNfuEpVKt

