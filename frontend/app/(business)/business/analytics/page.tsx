"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

interface Prediction {
  SKU: string;
  name: string;
  currentQuantity: number;
  recommendation: string;
}

export default function AnalyticsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Example threshold to determine color coding
  const threshold = 10;

  useEffect(() => {
    async function fetchPredictions() {
      try {
        const res = await fetch("/api/prediction");
        if (!res.ok) {
          throw new Error(`Failed to fetch predictions (status ${res.status})`);
        }
        const data = await res.json();
        setPredictions(data.predictions || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load predictions");
      } finally {
        setLoading(false);
      }
    }
    fetchPredictions();
  }, []);

  // Determine bar color based on how far above the threshold the quantity is
  const getBarColor = (quantity: number, thresh: number) => {
    if (quantity <= thresh) {
      return "#10B981"; // green
    } else if (quantity <= thresh * 1.5) {
      return "#FBBF24"; // yellow
    } else {
      return "#EF4444"; // red
    }
  };

  // Create a custom legend to explain color coding
  const renderCustomLegend = () => {
    return (
      <div className="text-sm text-gray-600 mt-2">
        <p>
          <span
            className="inline-block w-3 h-3 mr-1 rounded"
            style={{ backgroundColor: "#10B981" }}
          ></span>
          Quantity at or below threshold
        </p>
        <p>
          <span
            className="inline-block w-3 h-3 mr-1 rounded"
            style={{ backgroundColor: "#FBBF24" }}
          ></span>
          Quantity up to 1.5x threshold
        </p>
        <p>
          <span
            className="inline-block w-3 h-3 mr-1 rounded"
            style={{ backgroundColor: "#EF4444" }}
          ></span>
          Quantity well above threshold
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">Business Analytics</h1>
      <p className="text-gray-700 mb-6">
        View detailed analytics about your business performance, including sales
        trends, popular items, and food waste reduction metrics. Get insights to
        optimize your inventory and pricing strategies.
      </p>

      {loading ? (
        <p className="text-gray-600">Loading predictions...</p>
      ) : error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : predictions.length === 0 ? (
        <p className="text-gray-600">No prediction data available.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Current Inventory</h2>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                {/* layout="vertical" makes the chart horizontal */}
                <BarChart layout="vertical" data={predictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150} // Adjust for longer names
                  />
                  <Tooltip />
                  {/* We'll rely on our custom legend for color explanation */}
                  <Legend content={() => null} />
                  <Bar dataKey="currentQuantity" name="Current Quantity">
                    {predictions.map((entry) => (
                      <Cell
                        key={entry.SKU}
                        fill={getBarColor(entry.currentQuantity, threshold)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {renderCustomLegend()}
          </div>

          {/* Recommendations Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                      Product
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                      Recommendation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((item, index) => (
                    <tr
                      key={item.SKU}
                      className={index % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="px-4 py-2 border-b text-gray-700">
                        {item.name}
                      </td>
                      <td className="px-4 py-2 border-b text-gray-700">
                        {item.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}