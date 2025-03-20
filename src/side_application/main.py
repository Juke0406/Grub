import tkinter as tk
from tkinter import ttk
from datetime import datetime, timedelta
import requests

def setup_action():
    print("Setup button clicked")
    print("API Key:", api_key_var.get())
    print("Database Name:", db_name_var.get())
    print("Table Name:", table_name_var.get())
    print("Scan Frequency:", scan_freq_var.get())
    print("Best Before Date:", best_before_var.get())
    print("Apply Discount Value:", discount_var.get(), "%")

    # close the window
    root.destroy()

def demo_action():
    print("Demo button clicked")
    # Sample list of products expiring within 1 week
    products = [
        {
            "SKU": "001",
            "imageUrl": "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13062328_XL1_20230707.jpg?w=400&q=70",
            "name": "GreenField Whole Milk",
            "originalPrice": 8.99,
            "discountedPrice": 7.99,
            "quantity": 10,
            "description": "1 gallon of whole milk",
            "category": "Dairy",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d')
        },
        {
            "SKU": "002",
            "imageUrl": "https://images.cdn.saveonfoods.com/zoom/00068721722540.jpg",
            "name": "Whole Wheat Bread",
            "originalPrice": 2.99,
            "discountedPrice": 2.49,
            "quantity": 15,
            "description": "Loaf of whole wheat bread",
            "category": "Bakery",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d')
        },
        {
            "SKU": "003",
            "imageUrl": "https://www.packagingstrategies.com/ext/resources/2017-Postings/New-Packages/Eggs-1-for-web.png",
            "name": "Organic Eggs",
            "originalPrice": 3.49,
            "discountedPrice": 2.99,
            "quantity": 8,
            "description": "Dozen organic eggs",
            "category": "Dairy",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=6)).strftime('%Y-%m-%d')
        },
        {
            "SKU": "004",
            "imageUrl": "https://digitalcontent.api.tesco.com/v2/media/ghs/96df02e6-a3cf-45a2-b059-c9fcff8adf0e/938c1d1a-9a21-406d-8486-4c80867da498.jpeg?h=960&w=960",
            "name": "Little Gem Lettuce",
            "originalPrice": 1.29,
            "discountedPrice": 0.99,
            "quantity": 20,
            "description": "Fresh lettuce",
            "category": "Produce",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d')
        },
        {
            "SKU": "005",
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdm9HJa4wsKjXuI14LuFm-jCeXsfklqp5Y_Q&s",
            "name": "Chicken Breast",
            "originalPrice": 5.99,
            "discountedPrice": 4.99,
            "quantity": 12,
            "description": "Boneless skinless chicken breast",
            "category": "Meat",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=4)).strftime('%Y-%m-%d')
        },
        {
            "SKU": "006",
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ6Fk1w0Gv-NZmfDmr3GrdZFysq832JJnTdA&s",
            "name": "Pasta",
            "originalPrice": 1.99,
            "discountedPrice": 1.49,
            "quantity": 30,
            "description": "1 lb of pasta",
            "category": "Cooking",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d')
        },
        {
            "SKU": "007",
            "imageUrl": "https://m.media-amazon.com/images/I/81SwbUNiUQL._AC_UF1000,1000_QL80_.jpg",
            "name": "Tomato Sauce",
            "originalPrice": 2.49,
            "discountedPrice": 1.99,
            "quantity": 10,
            "description": "Jar of tomato sauce",
            "category": "Cooking",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=6)).strftime('%Y-%m-%d')
        },
        {
            "SKU": "008",
            "imageUrl": "https://m.media-amazon.com/images/I/81Ml0P+qqnL.jpg",
            "name": "Toilet Paper",
            "originalPrice": 6.99,
            "discountedPrice": 5.99,
            "quantity": 25,
            "description": "12-pack of toilet paper",
            "category": "Household",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        },
        {
            "SKU": "009",
            "imageUrl": "https://m.media-amazon.com/images/I/81BleDYuugL.jpg",
            "name": "Hand Soap",
            "originalPrice": 3.49,
            "discountedPrice": 2.99,
            "quantity": 15,
            "description": "8 oz bottle of hand soap",
            "category": "Household",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d')
        },
        {
            "SKU": "010",
            "imageUrl": "https://www.slhfreshfruits.sg/cdn/shop/products/76.png?v=1661949183",
            "name": "Apples (each)",
            "originalPrice": 2.49,
            "discountedPrice": 1.99,
            "quantity": 200,
            "description": "Freshest apples from the orchard",
            "category": "Produce",
            "userID": "user-test",
            "expirationDate": (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d')
        }
    ]

    # Display the products in the console
    for product in products:
        print(f"SKU: {product['SKU']}")
        print(f"Image URL: {product['imageUrl']}")
        print(f"Name: {product['name']}")
        print(f"Price: ${product['originalPrice']}")
        print(f"Discounted Price: ${product['discountedPrice']}")
        print(f"Quantity: {product['quantity']}")
        print(f"Description: {product['description']}")
        print(f"Category: {product['category']}")
        print(f"Expiry Date: {product['expirationDate']}")
        print("-" * 40)

    # Send a POST request to the API
    url = "http://localhost:3000/api/products"
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, json=products, headers=headers)
    print("Response:", response.json())

    api_key = api_key_var.get()
    if not api_key:
        print("API Key is required for update")
        return
    
    # send a patch request to the API
    print(api_key)
    for product in products:
        url = "http://localhost:3000/api/api-key"
        headers = {"Content-Type": "application/json"}
        response = requests.patch(url, json={"key": api_key}, headers=headers)
        print("Response:", response)

# Initialize main window
root = tk.Tk()
root.title("Database Configuration")
root.geometry("500x500")  # Increased window size
root.configure(padx=20, pady=20)  # Added padding to the main window

# API Key
api_key_var = tk.StringVar()
tk.Label(root, text="API Key:").pack(anchor='w', pady=2)
tk.Entry(root, textvariable=api_key_var, width=40).pack(pady=2)

# Database Name
db_name_var = tk.StringVar()
tk.Label(root, text="Database Name:").pack(anchor='w', pady=2)
tk.Entry(root, textvariable=db_name_var, width=40).pack(pady=2)

# Table Name
table_name_var = tk.StringVar()
tk.Label(root, text="Table Name:").pack(anchor='w', pady=2)
tk.Entry(root, textvariable=table_name_var, width=40).pack(pady=2)

# Scan Frequency
scan_freq_var = tk.StringVar()
tk.Label(root, text="Scan Frequency:").pack(anchor='w', pady=2)
scan_options = ["Every day", "Every week", "Every month"]
ttk.Combobox(root, textvariable=scan_freq_var, values=scan_options, state="readonly").pack(pady=2)

# Best Before Date
best_before_var = tk.StringVar()
tk.Label(root, text="Best Before Date:").pack(anchor='w', pady=2)
best_before_options = ["Less than 1 day", "Less than 1 week", "2 weeks", "3 weeks", "1 month"]
ttk.Combobox(root, textvariable=best_before_var, values=best_before_options, state="readonly").pack(pady=2)

# Apply Discount Value
discount_var = tk.StringVar()
tk.Label(root, text="Apply Discount Value (%):").pack(anchor='w', pady=2)
discount_options = [str(i) for i in range(1, 101)]
ttk.Combobox(root, textvariable=discount_var, values=discount_options, state="readonly").pack(pady=2)

# Buttons
tk.Button(root, text="Setup", command=setup_action).pack(pady=5)
tk.Button(root, text="Demo", command=demo_action).pack(pady=5)

# Run the application
root.mainloop()
