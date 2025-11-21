from flask import Flask, jsonify ,request
import requests
import os
from flask_cors import CORS
from dodopayments import DodoPayments
import psycopg2
from dotenv import load_dotenv
from db import get_db, db_get_all_users, get_all_user_purchases, db_get_all_payments, get_subscription
import time

# Load environment variables
load_dotenv()

DODO_API_URL = "https://test.dodopayments.com/products"
# Prefer server-side key; fall back to Vite key if present
DODO_API_KEY = os.getenv("DODO_API_KEY") or os.getenv("VITE_DODO_API_KEY")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:8081")

client = DodoPayments(
    bearer_token=DODO_API_KEY,
    environment="test_mode"
)


app = Flask(__name__)
CORS(app)  #

@app.route("/products", methods=["GET"])
def get_products():
    try:
        page = client.products.list()

        # FIXED: use JSON mode to avoid serializer warnings
        products = [p.model_dump(mode="json") for p in page.items]

        return jsonify({"items": products})

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route("/checkout_sessions", methods=["POST"])
def create_checkout():
    try:
        data = request.get_json()   # Read JSON body
        product_id = data.get("product_id")
        email = data.get("email")  # optional - attach known customer
        if not product_id:
            return jsonify({"error": "product_id is required"}), 400

        # Normalize email to lowercase (Dodo sends customer_email in lowercase)
        customer_block = None
        if email:
            email = (email or "").strip().lower()
            # Per docs: provide a new_customer with email to ensure session is linked
            customer_block = {
                "email": email
            }

        # Create checkout session using the SDK
        checkout_session = client.checkout_sessions.create(
            product_cart=[
                {
                    "product_id": product_id,
                    "quantity": 1,
                }
            ],
            customer=customer_block if customer_block else None,
            show_saved_payment_methods=True,  # show saved PMs for returning customers
            feature_flags={
                "allow_discount_code": True
            },
            return_url=f"{FRONTEND_BASE_URL}/dashboard",
        )

        return jsonify({
            "session_id": checkout_session.session_id,
            "checkout_url": checkout_session.checkout_url
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "email and password required"}), 400

        conn = get_db()
        cur = conn.cursor()

        cur.execute("SELECT id FROM users WHERE email=%s", (email,))
        exists = cur.fetchone()

        if exists:
            return jsonify({"error": "user already exists"}), 400

        cur.execute("""
            INSERT INTO users (email, password)
            VALUES (%s, %s)
            RETURNING id
        """, (email, password))

        user_id = cur.fetchone()[0]

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "signup successful", "user_id": user_id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/signin", methods=["POST"])
def signin():
    try:
        data = request.get_json()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        conn = get_db()
        cur = conn.cursor()

        cur.execute("""
            SELECT id, email, user_type
            FROM users
            WHERE email=%s AND password=%s
        """, (email, password))

        user = cur.fetchone()

        cur.close()
        conn.close()

        if not user:
            return jsonify({"error": "invalid email or password"}), 401

        return jsonify({
            "message": "login successful",
            "user_id": user[0],
            "email": user[1],
            "user_type": user[2]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route("/getpurchases", methods=["GET"])
def get_all_purchases_route():
    try:
        email = request.args.get("email")

        if not email:
            return jsonify({"success": False, "error": "Missing email"}), 400

        # Normalize email to lowercase to match stored customer_email casing
        email = (email or "").strip().lower()
        purchases = get_all_user_purchases(email)

        return jsonify({"success": True, "purchases": purchases}), 200

    except Exception as e:
        print("Error fetching purchases:", e)
        return jsonify({"success": False, "error": str(e)}), 500
    


@app.route("/getallusers", methods=["GET"])
def getallusers_route():
    try:

        users = db_get_all_users()
        return jsonify({
            "success": True,
            "users": users
        }), 200

    except Exception as e:
        print("Error fetching users:", e)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/getallpayments", methods=["GET"])
def getallpayments_route():
    try:
        payments = db_get_all_payments()
        return jsonify({
            "success": True,
            "payments": payments
        }), 200

    except Exception as e:
        print("Error fetching payments:", e)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500





# @app.route("/getsubscription", methods=["GET"])
# def getsubscription():
#     try:
#         subscription = client.subscriptions.list()

#         # Convert each SubscriptionListResponse object into a dict
#         subscription_list = [item.model_dump() for item in subscription.items]

#         print("DEBUG: total subscriptions:", len(subscription_list))

#         for idx, sub in enumerate(subscription_list):
#             print(f"\n---- Inserting subscription #{idx} ----")
#             print("DEBUG subscription_id:", sub.get("subscription_id"))

#             insert_Subscriptions(sub)   # FIXED: insert one at a time

#         return jsonify({
#             "success": True,
#             "subscriptions": subscription_list
#         }), 200

#     except Exception as e:
#         print("ERROR LINE TRACE:")
#         import traceback
#         traceback.print_exc()     # 🔥 EXACT LINE OF ERROR

#         print("Error fetching Subscription:", e)
#         return jsonify({"success": False, "error": str(e)}), 500


    


@app.route("/getsubscription", methods=["GET"])
def getsubscription():
    try:
        email = request.args.get("email")

        if not email:
            return jsonify({"success": False, "error": "Missing email"}), 400
        
        # Normalize before lookup (DB stores/compares lowercase)
        email = (email or "").strip().lower()
        subscription = get_subscription(email)
        
        # Wrap single subscription in array for frontend compatibility
        subscriptions = [subscription] if subscription else []
        
        return jsonify({
            "success": True,
            "subscriptions": subscriptions
        }), 200

    except Exception as e:
        print("ERROR LINE TRACE:")
        import traceback
        traceback.print_exc()

        print("Error fetching Subscription:", e)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/get_payment_method", methods=["GET"])
def get_payment_method():
    try:
        payment_method_id = request.args.get("payment_method_id")
        customer_id = request.args.get("customer_id")
        response = client.customers.retrieve_payment_methods(
            customer_id=customer_id,
        )

        for item in response.items:
            if item.payment_method_id==payment_method_id:
                return jsonify({"payment_methods": item.payment_method}), 200
        return jsonify({"error": "Payment method not found"}), 404


    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/updatesubscription", methods=["POST"])
def update_subscription_plan():
    """
    Change plan for the user's active subscription using DodoPayments SDK
    with proration mode 'prorated_immediately'.
    Body: { "email": "user@example.com", "product_id": "prod_..." }
    """
    try:
        data = request.get_json() or {}
        email = (data.get("email") or "").strip().lower()
        product_id = data.get("product_id")

        if not email or not product_id:
            return jsonify({"success": False, "error": "email and product_id are required"}), 400

        # Retrieve current active subscription for this user from DB
        sub = get_subscription(email)
        if not sub or not sub.get("subscription_id"):
            return jsonify({"success": False, "error": "No active subscription found"}), 404

        subscription_id = sub["subscription_id"]

        # Call DodoPayments Python SDK
        # Docs via Context7 (validated): POST /subscriptions/{subscription_id}/change-plan
        # Params: product_id, proration_billing_mode, quantity, addons (optional)
        client.subscriptions.change_plan(
            subscription_id=subscription_id,
            product_id=product_id,
            proration_billing_mode="prorated_immediately",
            quantity=1,
            addons=[]
        )

        return jsonify({"success": True}), 200

    except Exception as e:
        print("Error updating subscription plan:", e)
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/subscription/upgrade", methods=["POST"])
def upgrade_subscription():
    """
    Explicit Upgrade endpoint.
    Body: { "email": "user@example.com", "product_id": "prod_new" }
    Effect: change_plan(prorated_immediately)
    """
    try:
        data = request.get_json() or {}
        email = (data.get("email") or "").strip().lower()
        product_id = data.get("product_id")

        if not email or not product_id:
            return jsonify({"success": False, "error": "email and product_id are required"}), 400

        sub = get_subscription(email)
        if not sub or not sub.get("subscription_id"):
            return jsonify({"success": False, "error": "No active subscription found"}), 404

        client.subscriptions.change_plan(
            subscription_id=sub["subscription_id"],
            product_id=product_id,
            proration_billing_mode="prorated_immediately",
            quantity=1,
            addons=[]
        )
        return jsonify({"success": True}), 200

    except Exception as e:
        print("Error upgrading subscription:", e)
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/subscription/downgrade", methods=["POST"])
def downgrade_subscription():
    """
    Explicit Downgrade endpoint.
    Body: { "email": "user@example.com", "product_id": "prod_new" }
    Effect: change_plan(prorated_immediately)
    """
    try:
        data = request.get_json() or {}
        email = (data.get("email") or "").strip().lower()
        product_id = data.get("product_id")

        if not email or not product_id:
            return jsonify({"success": False, "error": "email and product_id are required"}), 400

        sub = get_subscription(email)
        if not sub or not sub.get("subscription_id"):
            return jsonify({"success": False, "error": "No active subscription found"}), 404

        client.subscriptions.change_plan(
            subscription_id=sub["subscription_id"],
            product_id=product_id,
            proration_billing_mode="prorated_immediately",
            quantity=1,
            addons=[]
        )
        return jsonify({"success": True}), 200

    except Exception as e:
        print("Error downgrading subscription:", e)
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/subscription/cancel", methods=["POST"])
def cancel_subscription():
    """
    Cancel subscription for user (Dodo + local DB).
    Body: { "email": "user@example.com", "mode": "period_end" | "immediately" }
    Default mode = "period_end"
    """
    try:
        data = request.get_json() or {}
        email = (data.get("email") or "").strip().lower()
        mode = (data.get("mode") or "period_end").strip().lower()

        if not email:
            return jsonify({"success": False, "error": "email is required"}), 400

        sub = get_subscription(email)
        if not sub or not sub.get("subscription_id"):
            return jsonify({"success": False, "error": "No active subscription found"}), 404

        subscription_id = sub["subscription_id"]

        # First cancel in Dodo Payments using official update endpoint

        if mode == "immediately":
            client.subscriptions.update(
                subscription_id=subscription_id,
                status="cancelled"
            )
        else:
            client.subscriptions.update(
                subscription_id=subscription_id,
                cancel_at_next_billing_date=True
            )

        # Then update local DB to reflect the chosen mode
        #cancel_subscription_db(subscription_id, mode)

        # Return minimal info; webhook will finalize authoritative state
        return jsonify({
            "success": True,
            "subscription_id": subscription_id,
            "mode": mode
        }), 200

    except Exception as e:
        print("Error cancelling subscription:", e)
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)

