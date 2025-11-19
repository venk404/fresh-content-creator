from standardwebhooks.webhooks import Webhook
from flask import Flask, request, jsonify
import json
from dotenv import load_dotenv
import os
from db import insert_payment, get_db


app = Flask(__name__)


load_dotenv()

webhook_secret_key = os.getenv("dodopayment_webhook_secret")
wh = Webhook(webhook_secret_key)

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
        event_type = data.get('type', '')
        match event_type:
            case 'payment.succeeded':
                insert_payment(get_db(),payload=data)
                print(f"Payment successful: {event_data.get('payment_id')}")
            case 'payment.failed':
                insert_payment(get_db(),payload=data)
                print(f"Payment failed: {event_data.get('payment_id')}")
            case 'payment.processing':
                insert_payment(get_db(),payload=data)
                print(f"Payment processing: {event_data.get('payment_id')}")
            case 'payment.cancelled':
                insert_payment(get_db(),payload=data)
                print(f"Payment cancelled: {event_data.get('payment_id')}")
            case 'subscription.active':
                print(f"Subscription active: {event_data.get('subscription_id')}")
            case 'subscription.on_hold':
                print(f"Subscription on hold: {event_data.get('subscription_id')}")
            case 'subscription.renewed':
                print(f"Subscription renewed: {event_data.get('subscription_id')}")
            case 'subscription.plan_changed':
                print(f"Subscription plan changed: {event_data.get('subscription_id')}")
            case 'subscription.cancelled':
                print(f"Subscription cancelled: {event_data.get('subscription_id')}")
            case 'subscription.failed':
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