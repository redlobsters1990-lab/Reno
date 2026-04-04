--
-- PostgreSQL database dump
--

\restrict lmDYD1uSnvornyxgVOYC5R5KsvDT0VxdT8pCNl0fcpxvkR2HNXxFGhere2XDXUg

-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

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
-- Name: ChatRole; Type: TYPE; Schema: public; Owner: chozengone
--

CREATE TYPE public."ChatRole" AS ENUM (
    'user',
    'assistant',
    'system'
);


ALTER TYPE public."ChatRole" OWNER TO chozengone;

--
-- Name: EstimateConfidence; Type: TYPE; Schema: public; Owner: chozengone
--

CREATE TYPE public."EstimateConfidence" AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public."EstimateConfidence" OWNER TO chozengone;

--
-- Name: FileType; Type: TYPE; Schema: public; Owner: chozengone
--

CREATE TYPE public."FileType" AS ENUM (
    'floor_plan',
    'quote',
    'inspiration',
    'other'
);


ALTER TYPE public."FileType" OWNER TO chozengone;

--
-- Name: MemoryStatus; Type: TYPE; Schema: public; Owner: chozengone
--

CREATE TYPE public."MemoryStatus" AS ENUM (
    'active',
    'resolved',
    'dismissed'
);


ALTER TYPE public."MemoryStatus" OWNER TO chozengone;

--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: chozengone
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'active',
    'archived'
);


ALTER TYPE public."ProjectStatus" OWNER TO chozengone;

--
-- Name: QuoteStatus; Type: TYPE; Schema: public; Owner: chozengone
--

CREATE TYPE public."QuoteStatus" AS ENUM (
    'draft',
    'parsed',
    'reviewed'
);


ALTER TYPE public."QuoteStatus" OWNER TO chozengone;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: chozengone
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO chozengone;

--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: chozengone
--

CREATE TABLE public."ChatMessage" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "projectId" text NOT NULL,
    role public."ChatRole" NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata text
);


ALTER TABLE public."ChatMessage" OWNER TO chozengone;

--
-- Name: ContractorQuote; Type: TABLE; Schema: public; Owner: chozengone
--

CREATE TABLE public."ContractorQuote" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "contractorName" text NOT NULL,
    "totalAmount" double precision,
    currency text DEFAULT 'SGD'::text NOT NULL,
    status public."QuoteStatus" DEFAULT 'draft'::public."QuoteStatus" NOT NULL,
    notes text,
    "parsingSummary" text,
    warnings text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ContractorQuote" OWNER TO chozengone;

--
-- Name: CostEstimate; Type: TABLE; Schema: public; Owner: chozengone
--

CREATE TABLE public."CostEstimate" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "leanMin" double precision NOT NULL,
    "leanMax" double precision NOT NULL,
    "realisticMin" double precision NOT NULL,
    "realisticMax" double precision NOT NULL,
    "stretchMin" double precision NOT NULL,
    "stretchMax" double precision NOT NULL,
    confidence public."EstimateConfidence" NOT NULL,
    assumptions text NOT NULL,
    "costDrivers" text NOT NULL,
    "estimatorInputs" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CostEstimate" OWNER TO chozengone;

--
-- Name: Project; Type: TABLE; Schema: public; Owner: chozengone
--

CREATE TABLE public."Project" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    "propertyType" text NOT NULL,
    "roomCount" integer,
    budget double precision,
    "stylePreference" text,
    notes text,
    status public."ProjectStatus" DEFAULT 'active'::public."ProjectStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Project" OWNER TO chozengone;

--
-- Name: ProjectSession; Type: TABLE; Schema: public; Owner: chozengone
--

CREATE TABLE public."ProjectSession" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "projectId" text NOT NULL,
    "openclawSessionKey" text NOT NULL,
    "lastActiveAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProjectSession" OWNER TO chozengone;

--
-- Name: ProjectShortTermMemory; Type: TABLE; Schema: public; Owner: chozengone
--

CREATE TABLE public."ProjectShortTermMemory" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "projectId" text NOT NULL,
    "memoryType" text NOT NULL,
    note text NOT NULL,
    status public."MemoryStatus" DEFAULT 'active'::public."MemoryStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProjectShortTermMemory" OWNER TO chozengone;

--
-- Name: QuoteLineItem; Type: TABLE; Schema: public; Owner: chozengone
--

CREATE TABLE public."QuoteLineItem" (
    id text NOT NULL,
    "quoteId" text NOT NULL,
    description text NOT NULL,
    quantity double precision,
    unit text,
    "unitPrice" double precision,
    "totalPrice" double precision,
    category text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."QuoteLineItem" OWNER TO chozengone;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: chozengone
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO chozengone;

--
-- Name: UploadedFile; Type: TABLE; Schema: public; Owner: chozengone
--

CREATE TABLE public."UploadedFile" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "fileType" public."FileType" NOT NULL,
    "filePath" text NOT NULL,
    "originalName" text NOT NULL,
    "mimeType" text NOT NULL,
    "sizeBytes" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UploadedFile" OWNER TO chozengone;

--
-- Name: User; Type: TABLE; Schema: public; Owner: chozengone
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    "passwordHash" text,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO chozengone;

--
-- Name: UserLongTermMemory; Type: TABLE; Schema: public; Owner: chozengone
--

CREATE TABLE public."UserLongTermMemory" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "memoryKey" text NOT NULL,
    "memoryValue" text NOT NULL,
    confidence double precision DEFAULT 0.7 NOT NULL,
    source text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserLongTermMemory" OWNER TO chozengone;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: chozengone
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO chozengone;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: chozengone
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: chozengone
--

COPY public."ChatMessage" (id, "userId", "projectId", role, content, "createdAt", metadata) FROM stdin;
cmnidd3he0007efpsfjt4nzvw	cmnidd3gy0000efpsr0z5tu82	cmnidd3h50002efpsgvgku967	user	Hi, I need help planning my HDB renovation.	2026-04-03 03:54:01.058	\N
cmnidd3he0008efps7b38nryz	cmnidd3gy0000efpsr0z5tu82	cmnidd3h50002efpsgvgku967	assistant	Hello! I'd be happy to help you plan your HDB renovation. What specific areas are you looking to renovate?	2026-04-03 03:54:01.058	\N
\.


--
-- Data for Name: ContractorQuote; Type: TABLE DATA; Schema: public; Owner: chozengone
--

COPY public."ContractorQuote" (id, "projectId", "contractorName", "totalAmount", currency, status, notes, "parsingSummary", warnings, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CostEstimate; Type: TABLE DATA; Schema: public; Owner: chozengone
--

COPY public."CostEstimate" (id, "projectId", "leanMin", "leanMax", "realisticMin", "realisticMax", "stretchMin", "stretchMax", confidence, assumptions, "costDrivers", "estimatorInputs", "createdAt") FROM stdin;
cmnidd3hh000aefps0b005gog	cmnidd3h50002efpsgvgku967	35000	45000	45000	60000	60000	75000	medium	Property type: HDB BTO\nStyle tier: standard\nKitchen redo: Yes\nBathrooms: 2\nCarpentry level: medium\nElectrical scope: moderate\nPainting: Yes\nAssumed area: 90 sqm	Kitchen renovation, 2 bathrooms, custom carpentry	{"propertyType":"HDB BTO","styleTier":"standard","kitchenRedo":true,"bathroomCount":2,"carpentryLevel":"medium","electricalScope":"moderate","painting":true}	2026-04-03 03:54:01.061
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: chozengone
--

COPY public."Project" (id, "userId", title, "propertyType", "roomCount", budget, "stylePreference", notes, status, "createdAt", "updatedAt") FROM stdin;
cmnidd3h50002efpsgvgku967	cmnidd3gy0000efpsr0z5tu82	Sample HDB Renovation	HDB BTO	3	50000	Modern Minimalist	This is a sample project for testing purposes.	active	2026-04-03 03:54:01.049	2026-04-03 03:54:01.049
\.


--
-- Data for Name: ProjectSession; Type: TABLE DATA; Schema: public; Owner: chozengone
--

COPY public."ProjectSession" (id, "userId", "projectId", "openclawSessionKey", "lastActiveAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProjectShortTermMemory; Type: TABLE DATA; Schema: public; Owner: chozengone
--

COPY public."ProjectShortTermMemory" (id, "userId", "projectId", "memoryType", note, status, "createdAt", "updatedAt") FROM stdin;
cmnidd3hb0006efpsdmk7ijtc	cmnidd3gy0000efpsr0z5tu82	cmnidd3h50002efpsgvgku967	design_assumption	Assuming open concept kitchen layout	active	2026-04-03 03:54:01.055	2026-04-03 03:54:01.055
\.


--
-- Data for Name: QuoteLineItem; Type: TABLE DATA; Schema: public; Owner: chozengone
--

COPY public."QuoteLineItem" (id, "quoteId", description, quantity, unit, "unitPrice", "totalPrice", category, notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: chozengone
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: UploadedFile; Type: TABLE DATA; Schema: public; Owner: chozengone
--

COPY public."UploadedFile" (id, "projectId", "fileType", "filePath", "originalName", "mimeType", "sizeBytes", "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: chozengone
--

COPY public."User" (id, name, email, "emailVerified", "passwordHash", image, "createdAt", "updatedAt") FROM stdin;
cmnidd3gy0000efpsr0z5tu82	Test User	test@example.com	\N	$2a$12$ousbDtclmSZa8K4ux65AxeoRTARe1Mmew869kkKVOUqhLa/9eOOMu	\N	2026-04-03 03:54:01.042	2026-04-03 03:54:01.042
cmnidnjvf0000b1uu0hsgojr3	Test	test2@example.com	\N	$2a$12$dU1kY4.82yWntgf6gT59cuM8MEIOzcDUFxib0RNYauh7YwoGJVfaW	\N	2026-04-03 04:02:08.859	2026-04-03 04:02:08.859
\.


--
-- Data for Name: UserLongTermMemory; Type: TABLE DATA; Schema: public; Owner: chozengone
--

COPY public."UserLongTermMemory" (id, "userId", "memoryKey", "memoryValue", confidence, source, "updatedAt", "createdAt") FROM stdin;
cmnidd3h90004efpstzirlgcq	cmnidd3gy0000efpsr0z5tu82	style_preference	Prefers modern minimalist design with clean lines	0.8	seed	2026-04-03 03:54:01.053	2026-04-03 03:54:01.053
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: chozengone
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: ContractorQuote ContractorQuote_pkey; Type: CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."ContractorQuote"
    ADD CONSTRAINT "ContractorQuote_pkey" PRIMARY KEY (id);


--
-- Name: CostEstimate CostEstimate_pkey; Type: CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."CostEstimate"
    ADD CONSTRAINT "CostEstimate_pkey" PRIMARY KEY (id);


--
-- Name: ProjectSession ProjectSession_pkey; Type: CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."ProjectSession"
    ADD CONSTRAINT "ProjectSession_pkey" PRIMARY KEY (id);


--
-- Name: ProjectShortTermMemory ProjectShortTermMemory_pkey; Type: CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."ProjectShortTermMemory"
    ADD CONSTRAINT "ProjectShortTermMemory_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: QuoteLineItem QuoteLineItem_pkey; Type: CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."QuoteLineItem"
    ADD CONSTRAINT "QuoteLineItem_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: UploadedFile UploadedFile_pkey; Type: CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."UploadedFile"
    ADD CONSTRAINT "UploadedFile_pkey" PRIMARY KEY (id);


--
-- Name: UserLongTermMemory UserLongTermMemory_pkey; Type: CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."UserLongTermMemory"
    ADD CONSTRAINT "UserLongTermMemory_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: ChatMessage_projectId_createdAt_idx; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE INDEX "ChatMessage_projectId_createdAt_idx" ON public."ChatMessage" USING btree ("projectId", "createdAt");


--
-- Name: ContractorQuote_projectId_createdAt_idx; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE INDEX "ContractorQuote_projectId_createdAt_idx" ON public."ContractorQuote" USING btree ("projectId", "createdAt");


--
-- Name: CostEstimate_projectId_createdAt_idx; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE INDEX "CostEstimate_projectId_createdAt_idx" ON public."CostEstimate" USING btree ("projectId", "createdAt");


--
-- Name: ProjectSession_openclawSessionKey_key; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE UNIQUE INDEX "ProjectSession_openclawSessionKey_key" ON public."ProjectSession" USING btree ("openclawSessionKey");


--
-- Name: ProjectSession_projectId_lastActiveAt_idx; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE INDEX "ProjectSession_projectId_lastActiveAt_idx" ON public."ProjectSession" USING btree ("projectId", "lastActiveAt");


--
-- Name: ProjectSession_userId_projectId_key; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE UNIQUE INDEX "ProjectSession_userId_projectId_key" ON public."ProjectSession" USING btree ("userId", "projectId");


--
-- Name: ProjectShortTermMemory_projectId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE INDEX "ProjectShortTermMemory_projectId_status_createdAt_idx" ON public."ProjectShortTermMemory" USING btree ("projectId", status, "createdAt");


--
-- Name: ProjectShortTermMemory_userId_projectId_idx; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE INDEX "ProjectShortTermMemory_userId_projectId_idx" ON public."ProjectShortTermMemory" USING btree ("userId", "projectId");


--
-- Name: Project_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE INDEX "Project_userId_createdAt_idx" ON public."Project" USING btree ("userId", "createdAt");


--
-- Name: QuoteLineItem_quoteId_category_idx; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE INDEX "QuoteLineItem_quoteId_category_idx" ON public."QuoteLineItem" USING btree ("quoteId", category);


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: UploadedFile_projectId_fileType_createdAt_idx; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE INDEX "UploadedFile_projectId_fileType_createdAt_idx" ON public."UploadedFile" USING btree ("projectId", "fileType", "createdAt");


--
-- Name: UserLongTermMemory_userId_memoryKey_key; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE UNIQUE INDEX "UserLongTermMemory_userId_memoryKey_key" ON public."UserLongTermMemory" USING btree ("userId", "memoryKey");


--
-- Name: UserLongTermMemory_userId_updatedAt_idx; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE INDEX "UserLongTermMemory_userId_updatedAt_idx" ON public."UserLongTermMemory" USING btree ("userId", "updatedAt");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: chozengone
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessage ChatMessage_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessage ChatMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractorQuote ContractorQuote_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."ContractorQuote"
    ADD CONSTRAINT "ContractorQuote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CostEstimate CostEstimate_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."CostEstimate"
    ADD CONSTRAINT "CostEstimate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectSession ProjectSession_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."ProjectSession"
    ADD CONSTRAINT "ProjectSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectSession ProjectSession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."ProjectSession"
    ADD CONSTRAINT "ProjectSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectShortTermMemory ProjectShortTermMemory_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."ProjectShortTermMemory"
    ADD CONSTRAINT "ProjectShortTermMemory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectShortTermMemory ProjectShortTermMemory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."ProjectShortTermMemory"
    ADD CONSTRAINT "ProjectShortTermMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Project Project_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuoteLineItem QuoteLineItem_quoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."QuoteLineItem"
    ADD CONSTRAINT "QuoteLineItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES public."ContractorQuote"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UploadedFile UploadedFile_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."UploadedFile"
    ADD CONSTRAINT "UploadedFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserLongTermMemory UserLongTermMemory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chozengone
--

ALTER TABLE ONLY public."UserLongTermMemory"
    ADD CONSTRAINT "UserLongTermMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict lmDYD1uSnvornyxgVOYC5R5KsvDT0VxdT8pCNl0fcpxvkR2HNXxFGhere2XDXUg

