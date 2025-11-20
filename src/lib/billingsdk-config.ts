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
  type: 'monthly' | 'yearly';
  price: string;
  nextBillingDate: string;
  paymentMethod: string;
  status: 'active' | 'inactive' | 'cancelled';
}

export const plans: Plan[] = [
  {
    id: 'free',
    title: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    buttonText: 'Current Plan',
    features: [
      { name: 'Basic features', icon: 'check' },
      { name: 'Community support', icon: 'check' },
    ]
  },
  {
    id: 'pro',
    title: 'Pro',
    description: 'For professionals and teams',
    monthlyPrice: '$29',
    yearlyPrice: '$290',
    buttonText: 'Upgrade to Pro',
    features: [
      { name: 'All Free features', icon: 'check' },
      { name: 'Advanced analytics', icon: 'check' },
      { name: 'Priority support', icon: 'check' },
      { name: 'Custom integrations', icon: 'check' },
    ]
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: '$99',
    yearlyPrice: '$990',
    buttonText: 'Contact Sales',
    features: [
      { name: 'All Pro features', icon: 'check' },
      { name: 'Dedicated support', icon: 'check' },
      { name: 'Custom SLA', icon: 'check' },
      { name: 'Advanced security', icon: 'check' },
    ]
  }
];
