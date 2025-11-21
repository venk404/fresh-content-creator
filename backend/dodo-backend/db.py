from flask import Flask, jsonify ,request
import requests
import os
from flask_cors import CORS
from dodopayments import DodoPayments
import psycopg2
from decimal import Decimal
from dotenv import load_dotenv
from psycopg2.extras import Json
from psycopg2.extras import RealDictCursor
import json

load_dotenv()

def get_db():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        database=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        port=os.getenv("POSTGRES_PORT", "5432")
    )



def get_all_user_purchases(email):
    conn = get_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    query = """
        SELECT 
            p.id AS payment_id,
            p.status,
            p.amount,
            p.currency,
            p.created_at AS purchase_date,

            pr.id AS product_id,
            pr.name AS product_name,
            pr.price AS original_price,
            pr.currency AS product_currency

        FROM payments p
        LEFT JOIN products pr ON p.product_id = pr.id
        WHERE p.customer_email = %s
        ORDER BY p.created_at DESC;
    """

    cursor.execute(query, (email,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return rows


def insert_payment(payload: dict):
    data = payload.get("data", {}) or {}

    # Customer info
    customer = data.get("customer", {}) or {}

    # Product info from cart (Dodo product_id)
    product_cart = data.get("product_cart") or []
    dodo_product_id = product_cart[0].get("product_id") if product_cart else None

    # Convert minor units → major
    amount = Decimal(data.get("total_amount", 0)) / Decimal(100)

    sql = """
        INSERT INTO payments (
            payment_id,
            brand_id,

            user_ref,
            product_ref,
            subscription_ref,

            user_id,
            product_id,
            subscription_id,

            status,
            amount,
            currency,
            payment_method,
            payment_method_type,

            customer_id,
            customer_name,
            customer_email,
            customer_phone,

            digital_products_delivered,
            metadata,
            created_at
        )
        VALUES (
            %(payment_id)s,
            %(brand_id)s,

            %(user_ref)s,
            %(product_ref)s,
            %(subscription_ref)s,

            %(user_id)s,
            %(product_id)s,
            %(subscription_id)s,

            %(status)s,
            %(amount)s,
            %(currency)s,
            %(payment_method)s,
            %(payment_method_type)s,

            %(customer_id)s,
            %(customer_name)s,
            %(customer_email)s,
            %(customer_phone)s,

            %(digital_products_delivered)s,
            %(metadata)s,
            %(created_at)s
        );
    """

    values = {
        # Dodo Payment Identifiers
        "payment_id": data.get("payment_id"),
        "brand_id": data.get("brand_id"),

        # Dodo references (string)
        "user_ref": customer.get("customer_id"),   # if needed
        "product_ref": dodo_product_id,
        "subscription_ref": data.get("subscription_id"),

        # Internal IDs (numeric) → set NULL for now unless you map
        "user_id": None,
        "product_id": None,
        "subscription_id": None,

        # Payment details
        "status": data.get("status"),
        "amount": amount,
        "currency": data.get("currency"),
        "payment_method": data.get("payment_method"),
        "payment_method_type": data.get("payment_method_type"),

        # Customer fields
        "customer_id": customer.get("customer_id"),
        "customer_name": customer.get("name"),
        "customer_email": customer.get("email"),
        "customer_phone": customer.get("phone_number"),

        # Flags
        "digital_products_delivered": data.get("digital_products_delivered"),

        # Metadata JSONB
        "metadata": Json(data.get("metadata") or {}),

        # Timestamp
        "created_at": data.get("created_at"),
    }
    db_conn = get_db()
    with db_conn.cursor() as cur:
        cur.execute(sql, values)
        db_conn.commit()

    return True

def db_get_all_users():
    conn = get_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""
    SELECT *
    FROM users
    ORDER BY 
        CASE 
            WHEN user_type = 'admin' THEN 0 
            ELSE 1 
        END,
        created_at ASC;
""")
    rows = cursor.fetchall()

    cursor.close()
    conn.close()
    return rows



def db_get_all_payments():
    conn = get_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("SELECT * FROM payments;")
    rows = cursor.fetchall()

    cursor.close()
    conn.close()
    return rows


def check_if_subscription_exists(subscription_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 1
        FROM subscriptions
        WHERE subscription_id = %s and status = 'active'
        LIMIT 1;
    """, (subscription_id,))

    exists = cursor.fetchone() is not None

    cursor.close()
    conn.close()
    if exists:
        return True
    else:
        return False

def insert_Subscriptions(data):
    try:
        # Convert dict fields to JSON strings
        metadata = json.dumps(data.get("metadata", {}))
        billing = json.dumps(data.get("billing", {}))
        customer = json.dumps(data.get("customer", {}))

        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        query = """
            INSERT INTO subscriptions(
                subscription_id,
                product_id,
                status,
                start_date,
                end_date,
                billing_city,
                billing_country,
                billing_state,
                billing_street,
                billing_zipcode,
                cancel_at_next_billing_date,
                cancelled_at,
                currency,
                customer_id,
                customer_email,
                customer_name,
                customer_phone_number,
                customer_metadata,
                discount_cycles_remaining,
                discount_id,
                metadata,
                next_billing_date,
                previous_billing_date,
                on_demand,
                payment_frequency_count,
                payment_frequency_interval,
                payment_method_id,
                quantity,
                recurring_pre_tax_amount,
                subscription_period_count,
                subscription_period_interval,
                tax_id,
                tax_inclusive,
                trial_period_days
            )
            VALUES (
                %(subscription_id)s,
                %(product_id)s,
                %(status)s,
                %(created_at)s,
                %(next_billing_date)s,
                %(billing_city)s,
                %(billing_country)s,
                %(billing_state)s,
                %(billing_street)s,
                %(billing_zipcode)s,
                %(cancel_at_next_billing_date)s,
                %(cancelled_at)s,
                %(currency)s,
                %(customer_id)s,
                %(customer_email)s,
                %(customer_name)s,
                %(customer_phone_number)s,
                %(customer_metadata)s,
                %(discount_cycles_remaining)s,
                %(discount_id)s,
                %(metadata)s,
                %(next_billing_date)s,
                %(previous_billing_date)s,
                %(on_demand)s,
                %(payment_frequency_count)s,
                %(payment_frequency_interval)s,
                %(payment_method_id)s,
                %(quantity)s,
                %(recurring_pre_tax_amount)s,
                %(subscription_period_count)s,
                %(subscription_period_interval)s,
                %(tax_id)s,
                %(tax_inclusive)s,
                %(trial_period_days)s
            );
        """

        # Prepare params
        params = {
            "subscription_id": data.get("subscription_id"),
            "product_id": data.get("product_id"),
            "status": data.get("status"),
            "created_at": data.get("created_at"),
            "next_billing_date": data.get("next_billing_date"),
            "billing_city": data.get("billing", {}).get("city"),
            "billing_country": data.get("billing", {}).get("country"),
            "billing_state": data.get("billing", {}).get("state"),
            "billing_street": data.get("billing", {}).get("street"),
            "billing_zipcode": data.get("billing", {}).get("zipcode"),
            "cancel_at_next_billing_date": data.get("cancel_at_next_billing_date"),
            "cancelled_at": data.get("cancelled_at"),
            "currency": data.get("currency"),
            "customer_id": data.get("customer", {}).get("customer_id"),
            "customer_email": data.get("customer", {}).get("email"),
            "customer_name": data.get("customer", {}).get("name"),
            "customer_phone_number": data.get("customer", {}).get("phone_number"),
            "customer_metadata": json.dumps(data.get("customer", {}).get("metadata", {})),
            "discount_cycles_remaining": data.get("discount_cycles_remaining"),
            "discount_id": data.get("discount_id"),
            "metadata": metadata,
            "previous_billing_date": data.get("previous_billing_date"),
            "on_demand": data.get("on_demand"),
            "payment_frequency_count": data.get("payment_frequency_count"),
            "payment_frequency_interval": data.get("payment_frequency_interval"),
            "payment_method_id": data.get("payment_method_id"),
            "quantity": data.get("quantity"),
            "recurring_pre_tax_amount": data.get("recurring_pre_tax_amount"),
            "subscription_period_count": data.get("subscription_period_count"),
            "subscription_period_interval": data.get("subscription_period_interval"),
            "tax_id": data.get("tax_id"),
            "tax_inclusive": data.get("tax_inclusive"),
            "trial_period_days": data.get("trial_period_days")
        }

        if check_if_subscription_exists(data.get("subscription_id")):
            print(f"Subscription {data.get('subscription_id')} already exists. Skipping insert.")
        else:
            cursor.execute(query, params)
        conn.commit()
        cursor.close()

        return True

    except Exception as e:
        print("Insert error:", e)
        import traceback
        traceback.print_exc()
        return False



def subscription_exists(subscription_id: str) -> bool:
    """
    Check existence of a subscription by subscription_id regardless of status.
    """
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT 1 FROM subscriptions WHERE subscription_id = %s LIMIT 1;",
            (subscription_id,),
        )
        return cursor.fetchone() is not None
    finally:
        cursor.close()
        conn.close()


def upsert_subscription_enforced(data: dict) -> bool:
    """
    Upsert a subscription row and enforce only one active subscription per customer_email.
    - If the subscription exists, update it.
    - If it doesn't exist, insert it.
    - If resulting status is 'active', cancel any other active subscriptions for the same customer_email.
    """
    try:
        # Normalize params similar to insert_Subscriptions
        metadata = json.dumps(data.get("metadata", {}))
        billing = data.get("billing", {}) or {}
        customer = data.get("customer", {}) or {}

        params = {
            "subscription_id": data.get("subscription_id"),
            "product_id": data.get("product_id"),
            "status": data.get("status"),
            "created_at": data.get("created_at"),
            "next_billing_date": data.get("next_billing_date"),
            "billing_city": billing.get("city"),
            "billing_country": billing.get("country"),
            "billing_state": billing.get("state"),
            "billing_street": billing.get("street"),
            "billing_zipcode": billing.get("zipcode"),
            "cancel_at_next_billing_date": data.get("cancel_at_next_billing_date"),
            "cancelled_at": data.get("cancelled_at"),
            "currency": data.get("currency"),
            "customer_id": customer.get("customer_id"),
            "customer_email": customer.get("email"),
            "customer_name": customer.get("name"),
            "customer_phone_number": customer.get("phone_number"),
            "customer_metadata": json.dumps(customer.get("metadata", {})),
            "discount_cycles_remaining": data.get("discount_cycles_remaining"),
            "discount_id": data.get("discount_id"),
            "metadata": metadata,
            "previous_billing_date": data.get("previous_billing_date"),
            "on_demand": data.get("on_demand"),
            "payment_frequency_count": data.get("payment_frequency_count"),
            "payment_frequency_interval": data.get("payment_frequency_interval"),
            "payment_method_id": data.get("payment_method_id"),
            "quantity": data.get("quantity"),
            "recurring_pre_tax_amount": data.get("recurring_pre_tax_amount"),
            "subscription_period_count": data.get("subscription_period_count"),
            "subscription_period_interval": data.get("subscription_period_interval"),
            "tax_id": data.get("tax_id"),
            "tax_inclusive": data.get("tax_inclusive"),
            "trial_period_days": data.get("trial_period_days"),
        }

        conn = get_db()
        with conn:
            with conn.cursor() as cursor:
                # Decide insert vs update
                if subscription_exists(params["subscription_id"]):
                    # Update existing record
                    update_sql = """
                        UPDATE subscriptions
                        SET
                            product_id = %(product_id)s,
                            status = %(status)s,
                            start_date = %(created_at)s,
                            end_date = %(next_billing_date)s,
                            billing_city = %(billing_city)s,
                            billing_country = %(billing_country)s,
                            billing_state = %(billing_state)s,
                            billing_street = %(billing_street)s,
                            billing_zipcode = %(billing_zipcode)s,
                            cancel_at_next_billing_date = %(cancel_at_next_billing_date)s,
                            cancelled_at = %(cancelled_at)s,
                            currency = %(currency)s,
                            customer_id = %(customer_id)s,
                            customer_email = %(customer_email)s,
                            customer_name = %(customer_name)s,
                            customer_phone_number = %(customer_phone_number)s,
                            customer_metadata = %(customer_metadata)s,
                            discount_cycles_remaining = %(discount_cycles_remaining)s,
                            discount_id = %(discount_id)s,
                            metadata = %(metadata)s,
                            next_billing_date = %(next_billing_date)s,
                            previous_billing_date = %(previous_billing_date)s,
                            on_demand = %(on_demand)s,
                            payment_frequency_count = %(payment_frequency_count)s,
                            payment_frequency_interval = %(payment_frequency_interval)s,
                            payment_method_id = %(payment_method_id)s,
                            quantity = %(quantity)s,
                            recurring_pre_tax_amount = %(recurring_pre_tax_amount)s,
                            subscription_period_count = %(subscription_period_count)s,
                            subscription_period_interval = %(subscription_period_interval)s,
                            tax_id = %(tax_id)s,
                            tax_inclusive = %(tax_inclusive)s,
                            trial_period_days = %(trial_period_days)s
                        WHERE subscription_id = %(subscription_id)s;
                    """
                    cursor.execute(update_sql, params)
                else:
                    # Insert new record
                    insert_sql = """
                        INSERT INTO subscriptions(
                            subscription_id,
                            product_id,
                            status,
                            start_date,
                            end_date,
                            billing_city,
                            billing_country,
                            billing_state,
                            billing_street,
                            billing_zipcode,
                            cancel_at_next_billing_date,
                            cancelled_at,
                            currency,
                            customer_id,
                            customer_email,
                            customer_name,
                            customer_phone_number,
                            customer_metadata,
                            discount_cycles_remaining,
                            discount_id,
                            metadata,
                            next_billing_date,
                            previous_billing_date,
                            on_demand,
                            payment_frequency_count,
                            payment_frequency_interval,
                            payment_method_id,
                            quantity,
                            recurring_pre_tax_amount,
                            subscription_period_count,
                            subscription_period_interval,
                            tax_id,
                            tax_inclusive,
                            trial_period_days
                        )
                        VALUES (
                            %(subscription_id)s,
                            %(product_id)s,
                            %(status)s,
                            %(created_at)s,
                            %(next_billing_date)s,
                            %(billing_city)s,
                            %(billing_country)s,
                            %(billing_state)s,
                            %(billing_street)s,
                            %(billing_zipcode)s,
                            %(cancel_at_next_billing_date)s,
                            %(cancelled_at)s,
                            %(currency)s,
                            %(customer_id)s,
                            %(customer_email)s,
                            %(customer_name)s,
                            %(customer_phone_number)s,
                            %(customer_metadata)s,
                            %(discount_cycles_remaining)s,
                            %(discount_id)s,
                            %(metadata)s,
                            %(next_billing_date)s,
                            %(previous_billing_date)s,
                            %(on_demand)s,
                            %(payment_frequency_count)s,
                            %(payment_frequency_interval)s,
                            %(payment_method_id)s,
                            %(quantity)s,
                            %(recurring_pre_tax_amount)s,
                            %(subscription_period_count)s,
                            %(subscription_period_interval)s,
                            %(tax_id)s,
                            %(tax_inclusive)s,
                            %(trial_period_days)s
                        );
                    """
                    cursor.execute(insert_sql, params)

                # Enforce single active subscription per customer_email
                if params.get("status") == "active" and params.get("customer_email"):
                    cursor.execute(
                        """
                        UPDATE subscriptions
                        SET status = 'cancelled',
                            cancelled_at = COALESCE(cancelled_at, NOW())
                        WHERE customer_email = %s
                          AND subscription_id <> %s
                          AND status = 'active';
                        """,
                        (params["customer_email"], params["subscription_id"]),
                    )

        return True

    except Exception as e:
        print("Upsert/Enforcement error:", e)
        import traceback
        traceback.print_exc()
        return False
    
def get_subscription(email):
    conn = get_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
            SELECT *
            FROM subscriptions
            WHERE LOWER(customer_email) = LOWER(%s)
            AND status = 'active'
            LIMIT 1;
        """, (email,))

                        
        row = cursor.fetchone()
        print(row)
        return row

    except Exception as e:
        print("DB Error:", e)
        return None

    finally:
        cursor.close()
        conn.close()

