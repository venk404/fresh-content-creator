export interface Plan {
  id: string;
  title: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  buttonText: string;
  features: Array<{
    name: string;
    icon: 'check' | 'x';
  }>;
}

export interface CurrentPlan {
  plan: Plan;
  type: 'monthly' | 'weekly' | 'daily';
  price: string;
  nextBillingDate: string;
  paymentMethod: string;
  status: 'active' | 'inactive' | 'cancelled';
}

export const plans: Plan[] = [
  {
    id: 'daily',
    title: 'Daily Plan',
    description: 'Perfect for short-term needs',
    monthlyPrice: '$10',
    yearlyPrice: '$100',
    buttonText: 'Subscribe Daily',
    features: [
      { name: 'Daily billing', icon: 'check' },
      { name: 'Cancel anytime', icon: 'check' },
    ]
  },
  {
    id: 'weekly',
    title: 'Weekly Plan',
    description: 'Great for weekly commitment',
    monthlyPrice: '$50',
    yearlyPrice: '$500',
    buttonText: 'Subscribe Weekly',
    features: [
      { name: 'Weekly billing', icon: 'check' },
      { name: 'Better value', icon: 'check' },
      { name: 'Cancel anytime', icon: 'check' },
    ]
  },
  {
    id: 'monthly',
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
    ]
  }
];