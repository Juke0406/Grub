"use client";

import { useState, FormEvent } from 'react';

export default function InventoryPage() {
  // State to hold form inputs
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    quantity: '',
  });

  // State for showing a response message
  const [responseMessage, setResponseMessage] = useState('');

  // Update state when form fields change
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
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity, 10),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create inventory item');
      }

      const data = await res.json();
      setResponseMessage(data.message || 'Inventory item created successfully!');

      // Optionally clear the form
      setFormData({ itemName: '', description: '', quantity: '' });
    } catch (error) {
      console.error(error);
      setResponseMessage('Error creating inventory item. Please try again.');
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-medium mb-6">Inventory Management</h1>
      <p>
        Manage your inventory levels, track stock, and set up alerts for low
        inventory.
      </p>

      {/* --- New Inventory Form --- */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-md">
        <div>
          <label htmlFor="itemName" className="block mb-1 font-semibold">
            Item Name
          </label>
          <input
            type="text"
            id="itemName"
            name="itemName"
            value={formData.itemName}
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

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
        >
          Add Inventory
        </button>
      </form>

      {responseMessage && (
        <p className="mt-4 font-semibold">{responseMessage}</p>
      )}
    </div>
  );
}