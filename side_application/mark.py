import tkinter as tk
from tkinter import ttk
from datetime import datetime, timedelta
import requests

def test_overordered_action():
    print("Test Overordered button clicked")
    # Create a list of overordered products (quantity > threshold, e.g. >10)
    products = [
        {
            "SKU": "101",
            "imageUrl": "https://example.com/101.jpg",
            "name": "Product 101 Potato",
            "originalPrice": 9.99,
            "discountedPrice": 7.99,
            "quantity": 20,  # over threshold
            "description": "Test product 101",
            "category": "Category A",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        },
        {
            "SKU": "102",
            "imageUrl": "https://example.com/102.jpg",
            "name": "Product 102 Tomato",
            "originalPrice": 5.99,
            "discountedPrice": 4.99,
            "quantity": 25,  # over threshold
            "description": "Test product 102",
            "category": "Category B",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=8)).strftime('%Y-%m-%d')
        },
        {
            "SKU": "103",
            "imageUrl": "https://example.com/103.jpg",
            "name": "Product 103 Rice",
            "originalPrice": 3.99,
            "discountedPrice": 2.99,
            "quantity": 30,  # over threshold
            "description": "Test product 103",
            "category": "Category C",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=9)).strftime('%Y-%m-%d')
        },
        {
            "SKU": "104",
            "imageUrl": "https://example.com/104.jpg",
            "name": "Product 104 Onion",
            "originalPrice": 8.99,
            "discountedPrice": 6.99,
            "quantity": 18,  # over threshold
            "description": "Test product 104",
            "category": "Category A",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=10)).strftime('%Y-%m-%d')
        },
        {
            "SKU": "105",
            "imageUrl": "https://example.com/105.jpg",
            "name": "Product 105 Carrot",
            "originalPrice": 4.99,
            "discountedPrice": 3.99,
            "quantity": 22,  # over threshold
            "description": "Test product 105",
            "category": "Category B",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=11)).strftime('%Y-%m-%d')
        }
    ]

    # Display the products in the console for verification
    for product in products:
        print(f"SKU: {product['SKU']}")
        print(f"Image URL: {product['imageUrl']}")
        print(f"Name: {product['name']}")
        print(f"Original Price: ${product['originalPrice']}")
        print(f"Discounted Price: ${product['discountedPrice']}")
        print(f"Quantity: {product['quantity']}")
        print(f"Description: {product['description']}")
        print(f"Category: {product['category']}")
        print(f"Expiry Date: {product['expirationDate']}")
        print("-" * 40)

    # Try to insert the overordered products into your API
    url = "http://localhost:3001/api/products"
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(url, json=products, headers=headers)
        print("Insertion Response:", response.json())
    except Exception as e:
        print("Error inserting products:", e)

# Initialize main window
root = tk.Tk()
root.title("Test Overordered Insertion & Prediction")
root.geometry("500x300")
root.configure(padx=20, pady=20)

# Button to trigger test action
test_button = tk.Button(root, text="Test Overordered Products & Predictions", command=test_overordered_action)
test_button.pack(pady=20)

root.mainloop()