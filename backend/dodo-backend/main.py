from flask import Flask, jsonify ,request
import requests
import os
from flask_cors import CORS
from dodopayments import DodoPayments
import psycopg2
from dotenv import load_dotenv
from db import insert_payment, get_db , db_get_all_users,get_all_user_purchases,db_get_all_payments,insert_Subscriptions,get_subscription
import os


DODO_API_URL = "https://test.dodopayments.com/products"
DODO_API_KEY = os.getenv("VITE_DODO_API_KEY")

client = DodoPayments(
    bearer_token=DODO_API_KEY,
    environment="test_mode"
)


app = Flask(__name__)
CORS(app)  #

@app.route("/products", methods=["GET"])
def get_products():
    try:
        # Fetch product list (paginated)
        page = client.products.list()

        # Loop all items and convert to dict
        
        products = [p.model_dump() for p in page.items]

        return jsonify({"items": products})

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route("/checkout_sessions", methods=["POST"])
def create_checkout():
    try:
        data = request.get_json()   # Read JSON body
        product_id = data.get("product_id")

        if not product_id:
            return jsonify({"error": "product_id is required"}), 400

        # Create checkout session using the SDK
        checkout_session = client.checkout_sessions.create(
            product_cart=[
                {
                    "product_id": product_id,
                    "quantity": 1,
                }
            ],
            feature_flags={
                "allow_discount_code": True
            })

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
        email = data.get("email")
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
        email = data.get("email")
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
        
        subscription = get_subscription(email)

        return jsonify({
            "success": True,
            "subscriptions": subscription
        }), 200

    except Exception as e:
        print("ERROR LINE TRACE:")
        import traceback
        traceback.print_exc()     # 🔥 EXACT LINE OF ERROR

        print("Error fetching Subscription:", e)
        return jsonify({"success": False, "error": str(e)}), 500




if __name__ == "__main__":
    app.run(port=5000, debug=True)


