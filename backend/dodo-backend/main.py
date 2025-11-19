from flask import Flask, jsonify ,request
import requests
import os
from flask_cors import CORS
from dodopayments import DodoPayments





app = Flask(__name__)
CORS(app)  # allow frontend to access this server

DODO_API_URL = "https://test.dodopayments.com/products"
#test
#DODO_API_KEY = "rcWF2oBx2WhZQgQL.TP9-F_L9BJZkS28WEE1PceOtF0HBk_oq98IMOjO5e2gTI7xx" # load from environment
#live
DODO_API_KEY = "Bfsb8COPTHesfa06.eg0LrQdch_wKAb6a2aWxya78-1f8qxgRmpj90OvGSR32uLt0"

client = DodoPayments(
    bearer_token=DODO_API_KEY,
    environment="live_mode"
)

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
            }
            
)

        return jsonify({
            "session_id": checkout_session.session_id,
            "checkout_url": checkout_session.checkout_url
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == "__main__":
    app.run(port=5000, debug=True)
