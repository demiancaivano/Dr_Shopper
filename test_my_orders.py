import requests
import json

# Configuración
BASE_URL = "http://localhost:5000/api"
LOGIN_URL = f"{BASE_URL}/auth/login"

def test_my_orders():
    """Test My Orders functionality"""
    
    # Test data (adjust according to your database)
    login_data = {
        "email": "test@example.com",  # Change to a real user
        "password": "password123"      # Change to real password
    }
    
    try:
        # 1. Login to get token
        print("🔐 Logging in...")
        login_response = requests.post(LOGIN_URL, json=login_data)
        
        if login_response.status_code != 200:
            print(f"❌ Login error: {login_response.status_code}")
            print(login_response.text)
            return
        
        token = login_response.json().get('access_token')
        if not token:
            print("❌ No access token obtained")
            return
        
        print("✅ Login successful")
        
        # 2. Get user orders
        print("\n📦 Getting orders...")
        headers = {'Authorization': f'Bearer {token}'}
        orders_response = requests.get(f"{BASE_URL}/orders", headers=headers)
        
        if orders_response.status_code == 200:
            orders_data = orders_response.json()
            print(f"✅ Orders obtained: {len(orders_data.get('orders', []))} orders")
            
            # Show order details
            for i, order in enumerate(orders_data.get('orders', [])):
                print(f"\n📋 Order #{order['id']}")
                print(f"   Status: {order['status']}")
                print(f"   Total: ${order['total_amount']}")
                print(f"   Date: {order['creation_date']}")
                print(f"   Items: {len(order.get('items', []))}")
                
                for item in order.get('items', []):
                    product = item.get('product', {})
                    print(f"     - {product.get('name', 'Product')} x{item['quantity']} = ${item['price']}")
        else:
            print(f"❌ Error getting orders: {orders_response.status_code}")
            print(orders_response.text)
        
        # 3. Test review creation (if there are products)
        print("\n⭐ Testing review creation...")
        if orders_data.get('orders'):
            # Take first product from first order
            first_order = orders_data['orders'][0]
            if first_order.get('items'):
                first_item = first_order['items'][0]
                product_id = first_item.get('product_id')
                
                review_data = {
                    "rating": 5,
                    "title": "Excellent product",
                    "comment": "Very satisfied with the purchase"
                }
                
                review_response = requests.post(
                    f"{BASE_URL}/products/{product_id}/reviews",
                    headers=headers,
                    json=review_data
                )
                
                if review_response.status_code == 201:
                    print("✅ Review created successfully")
                else:
                    print(f"❌ Error creating review: {review_response.status_code}")
                    print(review_response.text)
            else:
                print("⚠️ No items in orders to test reviews")
        else:
            print("⚠️ No orders to test reviews")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error. Make sure the backend is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    print("🧪 Starting My Orders tests...")
    test_my_orders()
    print("\n✅ Tests completed") 