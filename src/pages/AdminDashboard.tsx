import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package, Users, CreditCard, ShoppingBag, Plus } from "lucide-react";

interface Product {
  product_id: string;
  name: string;
  description: string;
  pricing: any;
}

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "" });

  // USERS
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);


  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

useEffect(() => {
  if (!isAdmin) {
    navigate("/");
    return;
  }
  fetchProducts();
  fetchUsers();
  getallpayments(); // ✅ Add this
}, [isAdmin, navigate]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      setProducts(data.items || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/getallusers");
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setUsersLoading(false);
    }
  };


const getallpayments = async () => {
  try {
    const res = await fetch("http://localhost:5000/getallpayments");
    const data = await res.json();

    if (data.success) {
      setPayments(data.payments || data.items || []);
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to fetch payments",
      variant: "destructive",
    });
  } finally {
    setPaymentsLoading(false);
  }
};


  const handleAddProduct = async () => {
    toast({
      title: "Product Added",
      description: `${newProduct.name} has been added successfully.`,
    });
    setNewProduct({ name: "", description: "", price: "" });
  };

  const [activeSection, setActiveSection] = useState("products");

  const mockSubscriptions = [
    { id: "1", user: "user1@example.com", plan: "Pro Monthly", amount: "$29/mo", status: "active", startDate: "2024-01-15", nextBilling: "2024-03-15" },
    { id: "2", user: "user2@example.com", plan: "Premium Annual", amount: "$299/yr", status: "active", startDate: "2024-01-20", nextBilling: "2025-01-20" },
  ];

  const navItems = [
    { id: "products", label: "Products", icon: Package },
    { id: "users", label: "Users", icon: Users },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "subscriptions", label: "Subscriptions", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button onClick={logout} variant="outline">Logout</Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 border-r border-border bg-card min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{products.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{users.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{payments.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">$447</p>
              </CardContent>
            </Card>
          </div>

          {/* PRODUCTS */}
          {activeSection === "products" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Products</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddProduct} className="w-full">Add Product</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-center py-8">Loading...</div>
                ) : products.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">No products found</div>
                ) : (
                  products.map((product) => (
                    <Card key={product.product_id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">ID: {product.product_id}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                          <Button size="sm" variant="outline" className="flex-1">Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* USERS */}
          {activeSection === "users" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Users</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usersLoading ? (
                  <div className="col-span-full text-center py-8">Loading...</div>
                ) : users.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  users.map((usr) => (
                    <Card key={usr.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {usr.email.split("@")[0]}
                          </CardTitle>

                          <Badge variant={usr.user_type === "admin" ? "default" : "secondary"}>
                            {usr.user_type}
                          </Badge>
                        </div>
                        <CardDescription>{usr.email}</CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-2 text-sm">

                          {/* --- Status row (ADDED BACK EXACTLY LIKE BEFORE) --- */}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              active
                            </Badge>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Joined:</span>
                            <span>{new Date(usr.created_at).toLocaleDateString()}</span>
                          </div>

                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}

              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {activeSection === "payments" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Payments</h2>

              {paymentsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No payments found</div>
              ) : (
                <div className="overflow-auto rounded-lg border border-border">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left">Payment ID</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Product</th>
                        <th className="px-4 py-3 text-left">Amount</th>
                        <th className="px-4 py-3 text-left">Method</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {payments.map((p: any) => (
                        <tr key={p.id} className="border-t hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{p.payment_id || p.id}</td>
                          <td className="px-4 py-3">{p.customer_name || "N/A"}</td>
                          <td className="px-4 py-3">{p.customer_email || "N/A"}</td>
                          <td className="px-4 py-3">{p.product_ref || p.product_id || "N/A"}</td>

                          <td className="px-4 py-3 font-semibold">
                            {p.currency} {p.amount}
                          </td>

                          <td className="px-4 py-3">
                            <Badge variant="outline">{p.payment_method || p.payment_method_type || "N/A"}</Badge>
                          </td>

                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={
                                p.status === "completed"
                                  ? "text-green-600 border-green-600"
                                  : p.status === "failed"
                                    ? "text-red-600 border-red-600"
                                    : "text-yellow-600 border-yellow-600"
                              }
                            >
                              {p.status}
                            </Badge>
                          </td>

                          <td className="px-4 py-3">
                            {new Date(p.created_at).toLocaleDateString()} <br />
                            <span className="text-xs text-muted-foreground">
                              {new Date(p.created_at).toLocaleTimeString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}


          {/* SUBSCRIPTIONS */}
          {activeSection === "subscriptions" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Subscriptions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{subscription.plan}</CardTitle>
                        <Badge variant="outline" className="text-green-600 border-green-600">{subscription.status}</Badge>
                      </div>
                      <CardDescription>{subscription.user}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-muted-foreground text-sm">Amount:</span>
                          <span className="text-xl font-bold">{subscription.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Started:</span>
                          <span>{subscription.startDate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Next Billing:</span>
                          <span>{subscription.nextBilling}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
