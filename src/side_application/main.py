import tkinter as tk
from tkinter import ttk
from datetime import datetime, timedelta
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
APP_URL = os.getenv('APP_URL', 'http://localhost:3000')

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

def generate_sku():
    """Generate a random SKU following the same format as the API"""
    import random
    return f"SKU{str(random.randint(0, 999999)).zfill(6)}"

def demo_action():
    print("Demo button clicked")
    # Sample list of products expiring within 1 week
    products = [
        {
            "SKU": generate_sku(),
            "name": "Fresh Organic Apples",
            "description": "Sweet and crisp organic apples from local farms",
            "originalPrice": 5.99,
            "discountedPrice": 4.49,
            "category": "produce",
            "imageUrl": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
            "inventory": {
                "quantity": 30,
                "expirationDate": (datetime.now() + timedelta(days=7)).isoformat()
            }
        },
        {
            "SKU": generate_sku(),
            "name": "Whole Grain Bread",
            "description": "Freshly baked whole grain bread",
            "originalPrice": 4.99,
            "discountedPrice": 3.99,
            "category": "bread",
            "imageUrl": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73",
            "inventory": {
                "quantity": 20,
                "expirationDate": (datetime.now() + timedelta(days=3)).isoformat()
            }
        },
        {
            "SKU": generate_sku(),
            "name": "Free-Range Eggs",
            "description": "Farm fresh free-range eggs",
            "originalPrice": 6.99,
            "discountedPrice": 5.99,
            "category": "dairy",
            "imageUrl": "https://images.unsplash.com/photo-1506976785307-8732e854ad03",
            "inventory": {
                "quantity": 40,
                "expirationDate": (datetime.now() + timedelta(days=14)).isoformat()
            }
        },
        {
            "SKU": generate_sku(),
            "name": "Chicken Breast",
            "description": "Premium boneless skinless chicken breast",
            "originalPrice": 12.99,
            "discountedPrice": 9.99,
            "category": "meat",
            "imageUrl": "https://images.unsplash.com/photo-1604503468506-a8da13d82791",
            "inventory": {
                "quantity": 25,
                "expirationDate": (datetime.now() + timedelta(days=5)).isoformat()
            }
        },
        {
            "SKU": generate_sku(),
            "name": "Fresh Basil",
            "description": "Organic fresh basil bunch",
            "originalPrice": 2.99,
            "discountedPrice": 2.49,
            "category": "produce",
            "imageUrl": "https://images.unsplash.com/photo-1538596313828-41d729090199",
            "inventory": {
                "quantity": 30,
                "expirationDate": (datetime.now() + timedelta(days=5)).isoformat()
            }
        }
    ]

    # Display the products in the console
    for product in products:
        print("Product details:")
        print(f"  SKU: {product['SKU']}")
        print(f"  Name: {product['name']}")
        print(f"  Description: {product['description']}")
        print(f"  Original Price: ${product['originalPrice']}")
        print(f"  Discounted Price: ${product['discountedPrice']}")
        print(f"  Category: {product['category']}")
        print(f"  Image URL: {product['imageUrl']}")
        print(f"  Inventory:")
        print(f"    Quantity: {product['inventory']['quantity']}")
        print(f"    Expiry Date: {product['inventory']['expirationDate']}")
        print("-" * 40)

    # Get API key from input
    api_key = api_key_var.get()
    if not api_key:
        print("API Key is required")
        return

    # Send a POST request to the API with API key
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key
    }
    
    products_url = f"{APP_URL}/api/products"

    # Send each product individually
    for product in products:
        response = requests.post(products_url, json=product, headers=headers)
        print(f"Adding {product['name']}...")
        print(f"Response: {response.json()}")
        print("-" * 40)

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
