// "use client";

// import { CodeBlock } from "@/components/code-block";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Copy, Key, Plus, Trash2 } from "lucide-react";
// import { useEffect, useState } from "react";

// import {
//   APIKey,
//   createApiKey,
//   deleteApiKey,
//   getApiKeys,
// } from "@/services/api-service";

// const usageData = {
//   currentMonth: {
//     requests: 15234,
//     cost: 76.17,
//     quota: 20000,
//   },
//   history: [
//     { month: "Jun", requests: 12000 },
//     { month: "Jul", requests: 13500 },
//     { month: "Aug", requests: 14200 },
//     { month: "Sep", requests: 15100 },
//     { month: "Oct", requests: 15234 },
//   ],
// };

// const sampleCode = {
//   curl: `curl -X POST ${process.env.NEXT_PUBLIC_API_URL}/v1/check-image \\
//   -H "Authorization: Bearer YOUR_API_KEY" \\
//   -H "Content-Type: application/json" \\
//   -d '{
//     "image_url": "https://example.com/image.jpg"
//   }'`,
//   python: `import requests

// response = requests.post(
//     '${process.env.NEXT_PUBLIC_API_URL}/v1/check-image',
//     headers={
//         'Authorization': 'Bearer YOUR_API_KEY',
//         'Content-Type': 'application/json'
//     },
//     json={
//         'image_url': 'https://example.com/image.jpg'
//     }
// )

// result = response.json()
// print(result)`,
//   node: `const axios = require('axios');

// const checkImage = async () => {
//   try {
//     const response = await axios.post(
//       '${process.env.NEXT_PUBLIC_API_URL}/v1/check-image',
//       {
//         image_url: 'https://example.com/image.jpg'
//       },
//       {
//         headers: {
//           'Authorization': 'Bearer YOUR_API_KEY',
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     console.log(response.data);
//   } catch (error) {
//     console.error(error);
//   }
// }`,
// };

// const REQUEST_COST = 0.005; // cost per request in USD
// const REQUEST_QUOTA = 20000; // Example quota

// export default function BusinessDashboard() {
//   const [userId, setUserId] = useState<string | null>(null);
//   const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
//   const [totalRequests, setTotalRequests] = useState<number>(0);

//   useEffect(() => {
//     async function fetchUser() {
//       try {
//         const res = await fetch("/api/auth/user"); // Fetch user session
//         if (res.ok) {
//           const data = await res.json();
//           setUserId(data); // Set user state
//         }
//       } catch (error) {
//         console.error("Failed to fetch user:", error);
//       }
//     }
//     fetchUser();
//   }, []);

//   useEffect(() => {
//     const fetchApiKeys = async () => {
//       if (!userId) return;

//       try {
//         const keys = await getApiKeys(userId);
//         setApiKeys(keys);
//         setTotalRequests(
//           keys.reduce((sum: number, key: APIKey) => sum + (key.usage_count || 0), 0)
//         );
//       } catch (error) {
//         console.error("Error fetching API keys:", error);
//       }
//     };
//     fetchApiKeys();
//   }, [userId]);

//   const handleAddKey = async () => {
//     if (!userId) return;

//     try {
//       const { key } = await createApiKey(
//         userId,
//         `API Key ${apiKeys.length + 1}`
//       );
//       setApiKeys([
//         ...apiKeys,
//         {
//           id: apiKeys.length + 1,
//           name: `API Key ${apiKeys.length + 1}`,
//           key,
//           created_at: new Date().toISOString(),
//           last_used: null,
//         },
//       ]);
//     } catch (error) {
//       console.error("Error creating API key:", error);
//     }
//   };

//   const handleRevokeKey = async (id: number) => {
//     try {
//       await deleteApiKey(id);
//       setApiKeys(apiKeys.filter((key) => key.id !== id));
//     } catch (error) {
//       console.error("Error deleting API key:", error);
//     }
//   };

//   if (!userId) return null;

//   return (
//     <div className="overflow-x-hidden">
//       <div className="max-w-[calc(100vw-2rem)] mx-auto p-6 flex flex-col gap-4">
//         <div className="mb-8">
//           <h1 className="text-3xl font-semibold">API Management</h1>
//           <p className="text-muted-foreground mt-2">
//             Manage your API keys and monitor usage
//           </p>
//         </div>

//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           <Card>
//             <CardHeader>
//               <CardTitle>API Usage</CardTitle>
//               <CardDescription>Current month statistics</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm">Requests</span>
//                   <span className="font-medium">
//                     {totalRequests} / {REQUEST_QUOTA}
//                   </span>
//                 </div>
//                 <div className="h-2 rounded-full bg-secondary">
//                   <div
//                     className="h-2 rounded-full bg-primary"
//                     style={{
//                       width: `${(totalRequests / REQUEST_QUOTA) * 100}%`,
//                     }}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Current Cost</CardTitle>
//               <CardDescription>Based on usage this month</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 ${(totalRequests * REQUEST_COST).toFixed(2)}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 ${REQUEST_COST} per request
//               </p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Request Trend</CardTitle>
//               <CardDescription>Last 5 months</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="h-[80px] flex items-end gap-2">
//                 {usageData.history.map((month) => (
//                   <div
//                     key={month.month}
//                     className="flex-1 bg-primary"
//                     style={{
//                       height: `${(month.requests / 20000) * 100}%`,
//                     }}
//                   />
//                 ))}
//               </div>
//               <div className="flex justify-between mt-2">
//                 {usageData.history.map((month) => (
//                   <div key={month.month} className="text-xs">
//                     {month.month}
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>API Keys</CardTitle>
//                 <CardDescription>
//                   Manage your API keys for authentication
//                 </CardDescription>
//               </div>
//               <Button onClick={handleAddKey}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 Add Key
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Key</TableHead>
//                   <TableHead>Created</TableHead>
//                   <TableHead>Last Used</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {apiKeys.map((key) => (
//                   <TableRow key={key.id}>
//                     <TableCell>{key.name}</TableCell>
//                     <TableCell>
//                       <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
//                         {key.key}
//                       </code>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="ml-2"
//                         onClick={() => navigator.clipboard.writeText(key.key)}
//                       >
//                         <Copy className="h-4 w-4" />
//                       </Button>
//                     </TableCell>
//                     <TableCell>{key.created_at}</TableCell>
//                     <TableCell>{key.last_used || "-"}</TableCell>
//                     <TableCell>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleRevokeKey(key.id)}
//                       >
//                         <Trash2 className="h-4 w-4 text-destructive" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>API Documentation</CardTitle>
//             <CardDescription>
//               Examples of how to use the CloudCheck API
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Alert>
//               <Key className="h-4 w-4" />
//               <AlertTitle>Authentication</AlertTitle>
//               <AlertDescription>
//                 All API requests require authentication using your API key in
//                 the Authorization header.
//               </AlertDescription>
//             </Alert>

//             <div className="mt-6 overflow-x-auto">
//               <Tabs defaultValue="curl" className="w-full">
//                 <TabsList>
//                   <TabsTrigger value="curl">cURL</TabsTrigger>
//                   <TabsTrigger value="python">Python</TabsTrigger>
//                   <TabsTrigger value="node">Node.js</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="curl">
//                   <CodeBlock code={sampleCode.curl} language="bash" />
//                 </TabsContent>
//                 <TabsContent value="python">
//                   <CodeBlock code={sampleCode.python} language="python" />
//                 </TabsContent>
//                 <TabsContent value="node">
//                   <CodeBlock code={sampleCode.node} language="javascript" />
//                 </TabsContent>
//               </Tabs>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }


"use client";

import { CodeBlock } from "@/components/code-block";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Key, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import {
  APIKey,
  createApiKey,
  deleteApiKey,
  getApiKeys,
} from "@/services/api-service";

import { authClient } from "@/lib/auth-client";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";


const usageData = {
  currentMonth: {
    requests: 15234,
    cost: 76.17,
    quota: 20000,
  },
  history: [
    { month: "Jun", requests: 12000 },
    { month: "Jul", requests: 13500 },
    { month: "Aug", requests: 14200 },
    { month: "Sep", requests: 15100 },
    { month: "Oct", requests: 15234 },
  ],
};
const sampleCode = {
  curl: `# Get inventory for your food stall
curl -X GET ${process.env.NEXT_PUBLIC_API_URL}/v1/inventory \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Add a new food item to your inventory
curl -X POST ${process.env.NEXT_PUBLIC_API_URL}/v1/inventory \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "item_name": "Fried Rice",
    "quantity": 50,
    "price": 5.99
  }'

# Remove a food item
curl -X DELETE ${process.env.NEXT_PUBLIC_API_URL}/v1/inventory \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "item_id": "ITEM_ID"
  }'`,

  python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

# Get inventory
get_response = requests.get('${process.env.NEXT_PUBLIC_API_URL}/v1/inventory', headers=headers)
print("Inventory:", get_response.json())

# Add new item
add_response = requests.post('${process.env.NEXT_PUBLIC_API_URL}/v1/inventory', headers=headers, json={
    'item_name': 'Fried Rice',
    'quantity': 50,
    'price': 5.99
})
print("Add Item Response:", add_response.json())

# Remove item
delete_response = requests.delete('${process.env.NEXT_PUBLIC_API_URL}/v1/inventory', headers=headers, json={
    'item_id': 'ITEM_ID'
})
print("Delete Item Response:", delete_response.json())`,

  node: `const axios = require('axios');

const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
};

// Get inventory
const getInventory = async () => {
  const res = await axios.get('${process.env.NEXT_PUBLIC_API_URL}/v1/inventory', { headers });
  console.log("Inventory:", res.data);
};

// Add item
const addItem = async () => {
  const res = await axios.post('${process.env.NEXT_PUBLIC_API_URL}/v1/inventory', {
    item_name: 'Fried Rice',
    quantity: 50,
    price: 5.99
  }, { headers });
  console.log("Added Item:", res.data);
};

// Delete item
const deleteItem = async () => {
  const res = await axios.delete('${process.env.NEXT_PUBLIC_API_URL}/v1/inventory', {
    headers,
    data: { item_id: 'ITEM_ID' }
  });
  console.log("Deleted Item:", res.data);
};

getInventory();
addItem();
deleteItem();`,
};

const REQUEST_COST = 0.005; // cost per request in USD
const REQUEST_QUOTA = 20000; // Example quota

export default function BusinessDashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [totalRequests, setTotalRequests] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [creatingKey, setCreatingKey] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      console.log("fetchData function called"); // Log when fetchData is called
      try {
        const { data: session } = await authClient.getSession();
        console.log("Fetched session data:", session); // Log session data
        setUserId(session?.user?.id || "");
      } catch (error) {
        console.error("Failed to fetch session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pathname]);

  useEffect(() => {
    const fetchApiKeys = async () => {
      if (!userId) return;

      try {
        console.log("Fetching API keys for userId:", userId); // Log userId
        const keys = await getApiKeys(userId);
        setApiKeys(keys);
        setTotalRequests(
          keys.reduce((sum: number, key: APIKey) => sum + (key.usage_count || 0), 0)
        );
      } catch (error) {
        console.error("Error fetching API keys:", error);
      }
    };
    fetchApiKeys();
  }, [userId]);

  const handleAddKey = async () => {
    if (!userId) return;
    setCreatingKey(true); // Show loader/modal

    try {
      const { key, id, created_at, expiresAt, usageCount } = await createApiKey(userId);
      console.log("New API Key:", key)
      setApiKeys((prevKeys) => [
        ...prevKeys,
        {
          id,
          key,
          created_at,
          expires_at: expiresAt,
          usage_count: usageCount,
          last_used: null,
        },
      ]);
      setShowSuccess(true); // Show success message
      setTimeout(() => setShowSuccess(false), 3000); // Hide success message after 3 seconds

    } catch (error) {
      console.error("Error creating API key:", error);
    } finally {
      setCreatingKey(false); // Hide loader/modal
    }
  };

  const handleRevokeKey = async (keyString: string) => {
    try {
      await deleteApiKey(keyString);
      setApiKeys(apiKeys.filter((key) => key.key !== keyString));
    } catch (error) {
      console.error("Error deleting API key:", error);
    }
  };

  const updateUsageCount = async (key: string) => {
    try {
      const response = await fetch("/api/api-key", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update usage count: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Key Usage Updated:", data);

      // Update the local state with the new usage count
      setApiKeys((prevKeys) =>
        prevKeys.map((apiKey) =>
          apiKey.key === key ? { ...apiKey, usage_count: data.usageCount } : apiKey
        )
      );
    } catch (error) {
      console.error("Error updating usage count:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // or a loading spinner
  }

  if (!userId) {
    console.log("User ID is null, not rendering the component."); // Log when userId is null
    return <div>User not logged in</div>; // or redirect to login page
  }

  return (
    <div className="overflow-x-hidden">
      <div className="max-w-[calc(100vw-2rem)] mx-auto p-6 flex flex-col gap-4">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">API Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your API keys and monitor usage
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>API Usage</CardTitle>
              <CardDescription>Current month statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Requests</span>
                  <span className="font-medium">
                    {totalRequests} / {REQUEST_QUOTA}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${(totalRequests / REQUEST_QUOTA) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Cost</CardTitle>
              <CardDescription>Based on usage this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(totalRequests * REQUEST_COST).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                ${REQUEST_COST} per request
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Trend</CardTitle>
              <CardDescription>Last 5 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[80px] flex items-end gap-2">
                {usageData.history.map((month) => (
                  <div
                    key={month.month}
                    className="flex-1 bg-primary"
                    style={{
                      height: `${(month.requests / 20000) * 100}%`,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {usageData.history.map((month) => (
                  <div key={month.month} className="text-xs">
                    {month.month}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage your API keys for authentication
                </CardDescription>
              </div>
              <Button onClick={handleAddKey}>
                <Plus className="mr-2 h-4 w-4" />
                Add Key
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {apiKeys.length === 0 ? (
              <p className="text-gray-600">No active API Keys.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead>Name</TableHead> */}
                    <TableHead>Key</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      {/* <TableCell>{key.name}</TableCell> */}
                      <TableCell>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          {key.key}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => navigator.clipboard.writeText(key.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell>{key.created_at}</TableCell>
                      <TableCell>{key.last_used || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeKey(key.key)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        {creatingKey && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              <p>Generating API key...</p>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center gap-2">
              <p>API key created successfully!</p>
              <Button onClick={() => setShowSuccess(false)}>Close</Button>
            </div>
          </div>
        )}


        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              Examples of how to use the API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Key className="h-4 w-4" />
              <AlertTitle>Authentication</AlertTitle>
              <AlertDescription>
                All API requests require authentication using your API key in
                the Authorization header.
              </AlertDescription>
            </Alert>

            <div className="mt-6 overflow-x-auto">
              <Tabs defaultValue="curl" className="w-full">
                <TabsList>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="node">Node.js</TabsTrigger>
                </TabsList>
                <TabsContent value="curl">
                  <SyntaxHighlighter language="bash" style={coy}>
                    {sampleCode.curl}
                  </SyntaxHighlighter>
                </TabsContent>
                <TabsContent value="python">
                  <SyntaxHighlighter language="python" style={coy}>
                    {sampleCode.python}
                  </SyntaxHighlighter>
                </TabsContent>
                <TabsContent value="node">
                  <SyntaxHighlighter language="javascript" style={coy}>
                    {sampleCode.node}
                  </SyntaxHighlighter>
                </TabsContent>
                {/* <TabsList>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="node">Node.js</TabsTrigger>
                  </TabsList>
                  <TabsContent value="curl">
                    <CodeBlock code={sampleCode.curl} language="bash" />
                  </TabsContent>
                  <TabsContent value="python">
                    <CodeBlock code={sampleCode.python} language="python" />
                  </TabsContent>
                  <TabsContent value="node">
                    <CodeBlock code={sampleCode.node} language="javascript" />
                  </TabsContent> */}
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}