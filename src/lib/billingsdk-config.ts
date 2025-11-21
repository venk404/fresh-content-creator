export interface Plan {
  id: string;
  product_id: string;
  title: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  buttonText: string;
  features: Array<{
    name: string;
    icon: 'check' | 'x';
  }>;
  currency: string;
  payment_frequency_interval: string;
}

export interface CurrentPlan {
  plan: Plan;
  type: 'monthly' | 'weekly' | 'daily';
  price: string;
  nextBillingDate: string;
  paymentMethod: string;
  status: 'active' | 'inactive' | 'cancelled';
}

// Helper function to format price from cents/paisa to dollars/rupees
export const formatPrice = (price: number, currency: string): string => {
  const amount = price / 100;
  const currencySymbol = currency === 'USD' ? '$' : currency === 'INR' ? '₹' : currency;
  return `${currencySymbol}${amount.toFixed(2)}`;
};

// Fetch plans dynamically from API
export const fetchPlans = async (): Promise<Plan[]> => {
  try {
    const response = await fetch('http://localhost:5000/products');
    const data = await response.json();
    // Filter only recurring products (subscriptions)
    const recurringProducts = data.items.filter((product: any) => product.price_detail.type === 'recurring_price');
    
    // Map to Plan format
    const plans: Plan[] = recurringProducts.map((product: any) => {
      const priceDetail = product.price_detail;
      const interval = priceDetail.payment_frequency_interval.toLowerCase();
      
      // Determine plan type (daily/weekly/monthly)
      let planId = 'monthly';
      if (interval === 'day') planId = 'daily';
      else if (interval === 'week') planId = 'weekly';
      else if (interval === 'month') planId = 'monthly';
      
      // Format prices
      const price = formatPrice(product.price, product.currency);
      
      return {
        id: planId,
        product_id: product.product_id,
        title: product.name,
        description: product.description,
        monthlyPrice: price,
        yearlyPrice: price, // You can calculate yearly if needed
        buttonText: `Subscribe ${interval}`,
        features: [
          { name: `${interval} billing`, icon: 'check' },
          { name: 'Cancel anytime', icon: 'check' },
        ],
        currency: product.currency,
        payment_frequency_interval: priceDetail.payment_frequency_interval
      };
    });
    
    // Sort by interval: daily -> weekly -> monthly
    const order = { 'daily': 1, 'weekly': 2, 'monthly': 3 };
    plans.sort((a, b) => order[a.id] - order[b.id]);
    
    return plans;
  } catch (error) {
    console.error('Error fetching plans:', error);
    // Return default plans as fallback
    return getDefaultPlans();
  }
};

// Default plans as fallback
export const getDefaultPlans = (): Plan[] => [
  {
    id: 'daily',
    product_id: '',
    title: 'Daily Plan',
    description: 'Perfect for short-term needs',
    monthlyPrice: '$10',
    yearlyPrice: '$100',
    buttonText: 'Subscribe Daily',
    features: [
      { name: 'Daily billing', icon: 'check' },
      { name: 'Cancel anytime', icon: 'check' },
    ],
    currency: 'USD',
    payment_frequency_interval: 'Day'
  },
  {
    id: 'weekly',
    product_id: '',
    title: 'Weekly Plan',
    description: 'Great for weekly commitment',
    monthlyPrice: '$50',
    yearlyPrice: '$500',
    buttonText: 'Subscribe Weekly',
    features: [
      { name: 'Weekly billing', icon: 'check' },
      { name: 'Better value', icon: 'check' },
      { name: 'Cancel anytime', icon: 'check' },
    ],
    currency: 'USD',
    payment_frequency_interval: 'Week'
  },
  {
    id: 'monthly',
    product_id: '',
    title: 'Monthly Plan',
    description: 'Best value for regular users',
    monthlyPrice: '$100',
    yearlyPrice: '$1000',
    buttonText: 'Subscribe Monthly',
    features: [
      { name: 'Monthly billing', icon: 'check' },
      { name: 'Best value', icon: 'check' },
      { name: 'Priority support', icon: 'check' },
      { name: 'Cancel anytime', icon: 'check' },
    ],
    currency: 'USD',
    payment_frequency_interval: 'Month'
  }
];

// Initialize plans - export this as the default
export let plans: Plan[] = getDefaultPlans();

// Call this function on app initialization
export const initializePlans = async () => {
  plans = await fetchPlans();
  return plans;
};