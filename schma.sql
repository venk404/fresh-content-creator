-- Adminer 5.4.1 PostgreSQL 15.15 dump

\connect "skillacedamy";

DROP TABLE IF EXISTS "events";
DROP SEQUENCE IF EXISTS events_id_seq;
CREATE SEQUENCE events_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."events" (
    "id" integer DEFAULT nextval('events_id_seq') NOT NULL,
    "event_type" character varying(100) NOT NULL,
    "event_payload" jsonb NOT NULL,
    "received_at" timestamp DEFAULT now(),
    "processed" boolean DEFAULT false,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


DROP TABLE IF EXISTS "payments";
DROP SEQUENCE IF EXISTS payments_id_seq;
CREATE SEQUENCE payments_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 22 CACHE 1;

CREATE TABLE "public"."payments" (
    "id" integer DEFAULT nextval('payments_id_seq') NOT NULL,
    "payment_id" character varying(255),
    "subscription_ref" character varying(255),
    "brand_id" character varying(255),
    "user_ref" character varying(255),
    "product_ref" character varying(255),
    "subscription_ref2" character varying(255),
    "user_id" integer,
    "product_id" integer,
    "subscription_id" integer,
    "status" character varying(50) NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "currency" character varying(10) NOT NULL,
    "payment_method" character varying(255),
    "payment_method_type" character varying(255),
    "customer_id" character varying(255),
    "customer_name" character varying(255),
    "customer_email" character varying(255),
    "customer_phone" character varying(50),
    "digital_products_delivered" boolean DEFAULT false,
    "metadata" jsonb DEFAULT '{}',
    "created_at" timestamp NOT NULL,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX payments_payment_id_key ON public.payments USING btree (payment_id);

CREATE INDEX idx_payments_user_id ON public.payments USING btree (user_id);


DROP TABLE IF EXISTS "products";
DROP SEQUENCE IF EXISTS products_id_seq;
CREATE SEQUENCE products_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."products" (
    "id" integer DEFAULT nextval('products_id_seq') NOT NULL,
    "product_id" character varying(255),
    "name" character varying(255) NOT NULL,
    "description" text,
    "price" numeric(10,2) NOT NULL,
    "currency" character varying(10) DEFAULT 'USD',
    "is_active" boolean DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX idx_products_dodo_product_id ON public.products USING btree (product_id);


DROP TABLE IF EXISTS "subscriptions";
DROP SEQUENCE IF EXISTS subscriptions_id_seq;
CREATE SEQUENCE subscriptions_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 46 CACHE 1;

CREATE TABLE "public"."subscriptions" (
    "id" integer DEFAULT nextval('subscriptions_id_seq') NOT NULL,
    "subscription_id" character varying(255),
    "user_id" integer,
    "product_id" character varying(255) NOT NULL,
    "status" character varying(20) DEFAULT 'active' NOT NULL,
    "start_date" timestamp DEFAULT now(),
    "end_date" timestamp,
    "billing_city" character varying(255),
    "billing_country" character varying(10),
    "billing_state" character varying(255),
    "billing_street" text,
    "billing_zipcode" character varying(20),
    "cancel_at_next_billing_date" boolean DEFAULT false,
    "cancelled_at" timestamp,
    "currency" character varying(10),
    "customer_id" character varying(255),
    "customer_email" character varying(255),
    "customer_name" character varying(255),
    "customer_phone_number" character varying(50),
    "customer_metadata" jsonb DEFAULT '{}',
    "discount_cycles_remaining" integer,
    "discount_id" character varying(255),
    "metadata" jsonb DEFAULT '{}',
    "next_billing_date" timestamp,
    "previous_billing_date" timestamp,
    "on_demand" boolean DEFAULT false,
    "payment_frequency_count" integer,
    "payment_frequency_interval" character varying(50),
    "payment_method_id" character varying(255),
    "quantity" integer DEFAULT '1',
    "recurring_pre_tax_amount" numeric(12,2),
    "subscription_period_count" integer,
    "subscription_period_interval" character varying(50),
    "tax_id" character varying(255),
    "tax_inclusive" boolean DEFAULT false,
    "trial_period_days" integer,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX idx_subscriptions_dodo_subscription_id ON public.subscriptions USING btree (subscription_id);


DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS users_id_seq;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 7 CACHE 1;

CREATE TABLE "public"."users" (
    "id" integer DEFAULT nextval('users_id_seq') NOT NULL,
    "email" character varying(255) NOT NULL,
    "password" text NOT NULL,
    "user_type" character varying(20) DEFAULT 'user' NOT NULL,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


ALTER TABLE ONLY "public"."payments" ADD CONSTRAINT "payments_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL NOT DEFERRABLE;
ALTER TABLE ONLY "public"."payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL NOT DEFERRABLE;
ALTER TABLE ONLY "public"."payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL NOT DEFERRABLE;

ALTER TABLE ONLY "public"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE NOT DEFERRABLE;

-- 2025-11-21 11:02:13 UTC