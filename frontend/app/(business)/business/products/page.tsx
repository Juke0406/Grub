"use client"; // This file is a client component so we can use state and event handlers

import { useState, FormEvent } from 'react';

export default function ProductsPage() {
  // State to hold form inputs with the new fields
  const [formData, setFormData] = useState({
    SKU: '',
    imageUrl: '',
    name: '',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    quantity: '',
    category: '',
    userID: '',
    expirationDate: '',
  });

  // State to show a response message
  const [responseMessage, setResponseMessage] = useState('');

  // Handle form field changes
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          SKU: formData.SKU,
          imageUrl: formData.imageUrl,
          name: formData.name,
          description: formData.description,
          originalPrice: parseFloat(formData.originalPrice),
          discountedPrice: parseFloat(formData.discountedPrice),
          quantity: parseInt(formData.quantity, 10),
          category: formData.category,
          userID: formData.userID,
          expirationDate: formData.expirationDate,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create product');
      }

      const data = await res.json();
      setResponseMessage(data.message || 'Product created successfully!');

      // Optionally clear the form
      setFormData({
        SKU: '',
        imageUrl: '',
        name: '',
        description: '',
        originalPrice: '',
        discountedPrice: '',
        quantity: '',
        category: '',
        userID: '',
        expirationDate: '',
      });
    } catch (error) {
      console.error(error);
      setResponseMessage('Error creating product. Please try again.');
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-medium mb-6">Product Management</h1>
      <p>
        Add and manage your products, set prices, and update product details.
        Create bundles and manage discounts for items nearing expiration.
      </p>

      {/* --- Product Creation Form --- */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-md">
        <div>
          <label htmlFor="SKU" className="block mb-1 font-semibold">
            SKU
          </label>
          <input
            type="text"
            id="SKU"
            name="SKU"
            value={formData.SKU}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block mb-1 font-semibold">
            Image URL
          </label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="name" className="block mb-1 font-semibold">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="description" className="block mb-1 font-semibold">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="originalPrice" className="block mb-1 font-semibold">
            Original Price
          </label>
          <input
            type="number"
            step="0.01"
            id="originalPrice"
            name="originalPrice"
            value={formData.originalPrice}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="discountedPrice" className="block mb-1 font-semibold">
            Discounted Price
          </label>
          <input
            type="number"
            step="0.01"
            id="discountedPrice"
            name="discountedPrice"
            value={formData.discountedPrice}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block mb-1 font-semibold">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="category" className="block mb-1 font-semibold">
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="userID" className="block mb-1 font-semibold">
            User ID
          </label>
          <input
            type="text"
            id="userID"
            name="userID"
            value={formData.userID}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="expirationDate" className="block mb-1 font-semibold">
            Expiration Date
          </label>
          <input
            type="date"
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
        >
          Create Product
        </button>
      </form>

      {responseMessage && (
        <p className="mt-4 font-semibold">{responseMessage}</p>
      )}
    </div>
  );
}