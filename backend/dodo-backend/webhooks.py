from standardwebhooks.webhooks import Webhook
from flask import Flask, request, jsonify
import json
from dotenv import load_dotenv
import os
from dodopayments import DodoPayments
from db import insert_payment, get_db, upsert_subscription_enforced


app = Flask(__name__)


load_dotenv()

webhook_secret_key = os.getenv("DODO_PAYMENTS_WEBHOOK_SECRET") or os.getenv("dodopayment_webhook_secret")
if not webhook_secret_key:
    raise ValueError("Missing DODO_PAYMENTS_WEBHOOK_SECRET (or dodopayment_webhook_secret) in environment")
wh = Webhook(webhook_secret_key)

# Initialize DodoPayments SDK client for robust subscription fetch on plan changes
DODO_API_KEY = os.getenv("VITE_DODO_API_KEY")
client = None
if DODO_API_KEY:
    try:
        client = DodoPayments(bearer_token=DODO_API_KEY, environment="test_mode")
    except Exception as _:
        client = None

@app.route('/webhook/dodo-payments', methods=['POST'])
def dodo_payments_webhook():
    try:
        
        payload = request.get_data(as_text=True)
        headers = request.headers
        if not wh.verify(payload, headers):
            return jsonify({'error': 'Invalid webhook signature'}), 401

        try:
            
            data = json.loads(payload)
            event_data = data.get('data', {})
        except json.JSONDecodeError as e:
            print(f'Error parsing JSON payload: {e}')
            return jsonify({'error': 'Invalid JSON payload'}), 400
        
        payload_type = event_data.get('payload_type', '')
        event_type = data.get('type', '')
        match event_type:
            case 'payment.succeeded':
                insert_payment(payload=data)
                print(f"Payment successful: {event_data.get('payment_id')}")
            case 'payment.failed':
                insert_payment(payload=data)
                print(f"Payment failed: {event_data.get('payment_id')}")
            case 'payment.processing':
                insert_payment(payload=data)
                print(f"Payment processing: {event_data.get('payment_id')}")
            case 'payment.cancelled':
                insert_payment(payload=data)
                print(f"Payment cancelled: {event_data.get('payment_id')}")
            case 'subscription.active':
                # On activation, ensure DB reflects the latest subscription state
                sub_id = event_data.get('subscription_id')
                used_fresh = False
                if client and sub_id:
                    try:
                        details = client.subscriptions.retrieve(subscription_id=sub_id)
                        sub_data = details.model_dump(mode="json") if hasattr(details, "model_dump") else details.__dict__
                        upsert_subscription_enforced(sub_data)
                        used_fresh = True
                    except Exception as _:
                        pass
                if not used_fresh:
                    upsert_subscription_enforced(event_data)
                print(f"Subscription active: {event_data.get('subscription_id')}")

            case 'subscription.on_hold':
                upsert_subscription_enforced(event_data)
                print(f"Subscription on hold: {event_data.get('subscription_id')}")

            case 'subscription.renewed':
                # On renewal, fetch latest dates/amounts to keep DB consistent
                sub_id = event_data.get('subscription_id')
                used_fresh = False
                if client and sub_id:
                    try:
                        details = client.subscriptions.retrieve(subscription_id=sub_id)
                        sub_data = details.model_dump(mode="json") if hasattr(details, "model_dump") else details.__dict__
                        upsert_subscription_enforced(sub_data)
                        used_fresh = True
                    except Exception as _:
                        pass
                if not used_fresh:
                    upsert_subscription_enforced(event_data)
                print(f"Subscription renewed: {event_data.get('subscription_id')}")

            case 'subscription.plan_changed':
                # Upgrade/Downgrade: fetch the latest subscription snapshot to capture new product, proration, dates
                sub_id = event_data.get('subscription_id')
                used_fresh = False
                if client and sub_id:
                    try:
                        details = client.subscriptions.retrieve(subscription_id=sub_id)
                        sub_data = details.model_dump(mode="json") if hasattr(details, "model_dump") else details.__dict__
                        upsert_subscription_enforced(sub_data)
                        used_fresh = True
                    except Exception as e:
                        print(f"Fetch subscription failed, falling back to event payload: {e}")
                if not used_fresh:
                    upsert_subscription_enforced(event_data)
                print(f"Subscription plan changed: {event_data.get('subscription_id')}")

            case 'subscription.cancelled':
                # Prefer fresh snapshot to capture final state (dates, flags)
                sub_id = event_data.get('subscription_id')
                used_fresh = False
                if client and sub_id:
                    try:
                        details = client.subscriptions.retrieve(subscription_id=sub_id)
                        sub_data = details.model_dump(mode="json") if hasattr(details, "model_dump") else details.__dict__
                        upsert_subscription_enforced(sub_data)
                        used_fresh = True
                    except Exception as e:
                        print(f"Fetch subscription failed on cancelled, falling back to event payload: {e}")
                if not used_fresh:
                    upsert_subscription_enforced(event_data)
                print(f"Subscription cancelled: {event_data.get('subscription_id')}")

            case 'subscription.expired':
                # Mark the subscription as expired in DB
                upsert_subscription_enforced(event_data)
                print(f"Subscription expired: {event_data.get('subscription_id')}")

            case 'subscription.failed':
                # Record a failed state for visibility (e.g., dunning)
                upsert_subscription_enforced(event_data)
                print(f"Subscription failed: {event_data.get('subscription_id')}")
            case _:
                print(f"Unhandled event type: ({event_type}): {event_data}")

        return jsonify({'received': True}), 200

    except ValueError as e:
        print(f'Webhook verification failed: {e}')
        return jsonify({'error': 'Invalid webhook signature'}), 401
    except Exception as e:
        print(f'Error processing webhook: {e}')
        return jsonify({'error': 'Webhook handler failed'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8003, debug=True)