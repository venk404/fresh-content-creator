import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Package } from "lucide-react";
import { SubscriptionManagement } from "@/components/billingsdk/subscription-management";
import { type CurrentPlan, type Plan, fetchPlans, formatPrice } from "@/lib/billingsdk-config";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/signin");
  }, [user, navigate]);

  // Load plans and user data
useEffect(() => {
  if (!user) return;

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch plans first
      const fetchedPlans = await fetchPlans();
      setPlans(fetchedPlans);

      // Fetch purchases
      const purchasesRes = await fetch(`http://localhost:5000/getpurchases?email=${user.email}`);
      const purchasesData = await purchasesRes.json();
      if (purchasesData.success) setPurchases(purchasesData.purchases);

      // Fetch subscriptions
      const subscriptionRes = await fetch(
        `http://localhost:5000/getsubscription?email=${user.email}`
      );
      const subscriptionData = await subscriptionRes.json();

      if (
        subscriptionData.success &&
        subscriptionData.subscriptions &&
        subscriptionData.subscriptions.length > 0
      ) {
        const sub = subscriptionData.subscriptions[0];

        // Map payment_frequency_interval to plan type
        const intervalMap = {
          Day: "daily",
          Week: "weekly",
          Month: "monthly",
        } as const;
        const planType = intervalMap[sub.payment_frequency_interval] || "monthly";

        // Find matching plan
        const plan = fetchedPlans.find((p) => p.id === planType);
        if (!plan) {
          setCurrentPlan(null);
          return;
        }

        // Convert cents/paisa to formatted currency
        const formattedPrice = formatPrice(
          parseFloat(sub.recurring_pre_tax_amount),
          sub.currency
        );

        // --- FETCH PAYMENT METHOD TYPE ---
        let paymentMethodLabel = "Unknown";
        if (sub.payment_method_id) {
          const methodRes = await fetch(
            `http://localhost:5000/get_payment_method?customer_id=${sub.customer_id}&payment_method_id=${sub.payment_method_id}`
          );

          const methodData = await methodRes.json();
          if (methodData.payment_methods) {
            paymentMethodLabel =
              methodData.payment_methods.charAt(0).toUpperCase() +
              methodData.payment_methods.slice(1); // google_pay, apple_pay, upi_collect, etc.
          }else{
            paymentMethodLabel = "Unknown";
          }
        }

        // --- SET CURRENT PLAN ---
        setCurrentPlan({
          plan: plan,
          type: planType,
          price: formattedPrice,
          nextBillingDate: sub.next_billing_date
            ? new Date(sub.next_billing_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "N/A",
          paymentMethod: paymentMethodLabel,
          status:
            sub.status === "active"
              ? "active"
              : sub.status === "cancelled"
              ? "cancelled"
              : "inactive",
        });
      } else {
        setCurrentPlan(null);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [user]);

  const handlePlanUpdate = async (planId: string) => {
    try {
      // Map selected planId (daily/weekly/monthly) to product_id from plans
      const selected = plans.find((p) => p.id === planId);
      if (!selected || !selected.product_id) {
        alert("Selected plan not found");
        return;
      }

      const product_id = selected.product_id;

      // Decide upgrade vs downgrade based on simple tier order
      const tierOrder: Record<string, number> = { daily: 1, weekly: 2, monthly: 3 };
      const currentTier = currentPlan ? tierOrder[currentPlan.plan.id] ?? 0 : 0;
      const newTier = tierOrder[planId] ?? 0;

      const endpoint =
        newTier >= currentTier
          ? "http://localhost:5000/subscription/upgrade"
          : "http://localhost:5000/subscription/downgrade";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email?.toLowerCase(),
          product_id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Subscription updated successfully!");
        window.location.reload();
      } else {
        alert("Failed to update subscription: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error updating subscription:", err);
      alert("Error updating subscription");
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const res = await fetch("http://localhost:5000/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email?.toLowerCase(),
          mode: "period_end", // default cancel at period end
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Subscription cancelled successfully!");
        window.location.reload();
      } else {
        alert("Failed to cancel subscription: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      alert("Error cancelling subscription");
    }
  };

  const handleKeepSubscription = () => {
    console.log("User chose to keep subscription");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")} variant="ghost">
              Home
            </Button>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Manage your subscriptions and purchases</p>
        </div>

        {/* Active Subscription */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">Active Subscription</h3>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading subscription...
              </CardContent>
            </Card>
          ) : !currentPlan ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No active subscription</p>
                <Button onClick={() => navigate("/")}>Browse Plans</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-3xl">
              <SubscriptionManagement
                className="w-full"
                currentPlan={currentPlan}
                updatePlan={{
                  currentPlan: currentPlan.plan,
                  plans: plans,
                  onPlanChange: handlePlanUpdate,
                  triggerText: "Upgrade",
                }}
                updatePlanSecondary={{
                  currentPlan: currentPlan.plan,
                  plans: plans.filter((p) => {
                    const order: Record<string, number> = { daily: 1, weekly: 2, monthly: 3 };
                    return (order[p.id] ?? 0) < (order[currentPlan.plan.id] ?? 0);
                  }),
                  onPlanChange: handlePlanUpdate,
                  triggerText: "Downgrade",
                }}
                cancelSubscription={{
                  title: "Cancel",
                  description: "Are you sure you want to cancel your subscription?",
                  plan: currentPlan.plan,
                  warningTitle: "You will lose access to premium features",
                  warningText:
                    "If you cancel your subscription, you will lose access to all premium features and your data may be limited.",
                  onCancel: handleCancelSubscription,
                  onKeepSubscription: handleKeepSubscription,
                }}
              />
            </div>
          )}
        </div>

        {/* Purchases */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">My Purchases</h3>
          </div>

          {purchases.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No purchases yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((purchase) => (
                <Card key={purchase.payment_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2">{purchase.product_name}</CardTitle>

                      <Badge
                        variant="outline"
                        className={
                          purchase.status?.toLowerCase() === "failed"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        }
                      >
                        {purchase.status}
                      </Badge>
                    </div>

                    <CardDescription>
                      Purchased on {new Date(purchase.purchase_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm">Price Paid:</span>
                        <span className="text-xl font-bold text-primary">
                          {purchase.currency} {purchase.amount}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;