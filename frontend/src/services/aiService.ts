import { DashboardSummary, Business } from '../types';

export const aiService = {
  /**
   * Generates a marketing description for an offer based on input parameters.
   */
  generateOfferDescription: async (title: string, category: string, businessType: string): Promise<string> => {
    // Artificial loading transition
    await new Promise(resolve => setTimeout(resolve, 800));

    const intro = `Transform your routine with our exclusive new ${category.toLowerCase()} experience at Slotify.`;
    const descriptions: Record<string, string[]> = {
      Gym: [
        `Unlock your body's full potential! This offer gives you premium access to our state-of-the-art facilities, certified trainers, and custom workout strategies. Join a community dedicated to crushing goals and building sustainable wellness.`,
        `Ready to take your fitness to the next level? Get access to advanced workout tracking, high-energy group classes, and recovery zones. Perfect for beginners and seasoned athletes alike.`
      ],
      Restaurant: [
        `Embark on a culinary journey crafted by expert chefs. We source fresh, organic ingredients to create balanced, mouth-watering plates that delight the senses. Perfect for date nights, celebrations, or nourishing weeknight dinners.`,
        `Savor premium flavors without compromise. Enjoy custom seasonal menus, expert-selected wine pairings, and a welcoming, high-end atmosphere designed to create lasting dining memories.`
      ],
      Salon: [
        `Elevate your style and confidence with a tailored styling treatment. Our senior specialists consult with you to design a look that enhances your natural features using top-tier, organic care products. Step out refreshed, glowing, and revitalized.`,
        `Treat yourself to the ultimate self-care session. Includes scalp massage, advanced treatment therapies, and professional blow-dry styling by award-winning specialists.`
      ],
      Spa: [
        `Sink into pure serenity. Our specialized therapy melts away muscle tension, improves circulation, and calms the mind. Complemented by aromatic essential oils, steam therapy, and custom herbal teas for full mind-body restoration.`,
        `Recharge your spirit in our quiet sanctuary. Features a combination of ancient relaxation techniques and modern skincare therapies designed to renew your vitality from head to toe.`
      ]
    };

    const typeKey = businessType as keyof typeof descriptions;
    const pool = descriptions[typeKey] || [
      `Experience premier quality tailored to your schedule. We combine top-tier customer service, highly experienced practitioners, and advanced facilities to deliver results that exceed expectations. Book your slot today to lock in this limited-time pricing.`
    ];
    const pickedBody = pool[Math.floor(Math.random() * pool.length)];

    return `${intro} ${pickedBody}\n\n✨ What's included:\n• Premium access to all facilities\n• 1-on-1 personalized attention\n• Complimentary refreshments\n• Free parking & high-speed Wi-Fi`;
  },

  /**
   * Generates smart pricing suggestions based on the original price and business type.
   */
  getSmartPricingSuggestions: async (originalPrice: number, businessType: string): Promise<{
    recommendedPrice: number;
    discountPercentage: number;
    suggestions: { tier: string; price: number; discount: number; reason: string }[];
    marketInsight: string;
  }> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const roundToNine = (val: number) => {
      const rounded = Math.round(val);
      return rounded - 0.01;
    };

    let peakDiscount = 0.4; // 40%
    let budgetDiscount = 0.55; // 55%
    let premiumDiscount = 0.25; // 25%
    let marketInsight = '';

    switch (businessType) {
      case 'Gym':
        peakDiscount = 0.45;
        marketInsight = 'Gym passes see a 68% increase in conversions when priced at a 40-50% discount for weekly options. Add a personal training assessment to maintain high perceived value.';
        break;
      case 'Salon':
      case 'Spa':
        peakDiscount = 0.35;
        marketInsight = 'Wellness and beauty services convert best around 30-40% discount. Deep discounting (>50%) occasionally lowers perceived luxury and brand trust in this sector.';
        break;
      case 'Restaurant':
        peakDiscount = 0.5;
        marketInsight = 'Dining experiences show highly elastic demand. Mid-week slots priced at a flat 45-55% off fill vacant dinner tables, boosting overall beverage margins.';
        break;
      default:
        peakDiscount = 0.3;
        marketInsight = 'Local service listings show high engagement when initial bookings are discounted between 25% and 35% to drive organic reviews and repeat subscriptions.';
        break;
    }

    const recPrice = roundToNine(originalPrice * (1 - peakDiscount));
    const budgetPrice = roundToNine(originalPrice * (1 - budgetDiscount));
    const premiumPrice = roundToNine(originalPrice * (1 - premiumDiscount));

    return {
      recommendedPrice: recPrice,
      discountPercentage: Math.round(peakDiscount * 100),
      marketInsight,
      suggestions: [
        {
          tier: 'Aggressive Volume Builder',
          price: budgetPrice,
          discount: Math.round(budgetDiscount * 100),
          reason: 'Best for empty hours. Drives high traffic, builds immediate local awareness, and secures early reviews.'
        },
        {
          tier: 'Optimized Sweet Spot (Recommended)',
          price: recPrice,
          discount: Math.round(peakDiscount * 100),
          reason: 'Balanced margin and demand. Maximizes overall revenue and matches customer expectation for quality.'
        },
        {
          tier: 'Premium Retainer Tier',
          price: premiumPrice,
          discount: Math.round(premiumDiscount * 100),
          reason: 'Preserves premium brand integrity. Best for peak weekend slots when occupancy is already stable.'
        }
      ]
    };
  },

  /**
   * Generates AI analytics insights based on current dashboard summary metrics.
   */
  getAiAnalyticsInsights: (summary: DashboardSummary, business: Business): {
    headline: string;
    score: number; // overall booking health score
    recommendations: { type: 'success' | 'warning' | 'info'; title: string; desc: string; actionText?: string; actionCode?: string }[];
  } => {
    const utilizationRate = summary.totalCapacity > 0 ? (summary.bookedSeats / summary.totalCapacity) * 100 : 0;
    
    let score = 50;
    let headline = 'Awaiting initial booking data to compile AI recommendations.';
    const recommendations: { type: 'success' | 'warning' | 'info'; title: string; desc: string; actionText?: string; actionCode?: string }[] = [];

    if (summary.totalBookings === 0) {
      return {
        headline: 'Launch your first active offer to generate booking insights!',
        score: 0,
        recommendations: [
          {
            type: 'info',
            title: 'Create an Active Offer',
            desc: `Navigate to Offers, click 'Create Offer' and design a 35% off promotion for ${business.type === 'Gym' ? 'off-peak workout passes' : 'afternoon slots'}.`,
            actionText: 'Create Offer Now'
          }
        ]
      };
    }

    // Scoring calculation
    score = Math.round((utilizationRate * 0.4) + (summary.conversionRate * 0.4) + (Math.min(10, summary.totalOffers) * 2));
    score = Math.min(100, Math.max(10, score));

    if (score > 80) {
      headline = 'Outstanding performance! Demand is high and your slots are booking efficiently.';
    } else if (score > 50) {
      headline = 'Stable slot booking. Opportunities exist to optimize off-peak hours and increase conversions.';
    } else {
      headline = 'Below-average booking velocity. We recommend immediate pricing and promotion adjustments.';
    }

    // Capacity check
    if (utilizationRate < 35) {
      recommendations.push({
        type: 'warning',
        title: 'Low Seat Utilization Detected',
        desc: `Currently, only ${Math.round(utilizationRate)}% of your slots are filled. Off-peak morning slots are especially quiet.`,
        actionText: 'Apply Smart Pricing suggestions to Draft offers'
      });
    } else if (utilizationRate > 85) {
      recommendations.push({
        type: 'success',
        title: 'High Occupancy Warning',
        desc: `Your slots are running at ${Math.round(utilizationRate)}% capacity. Consider raising prices on future weekend offers by 10-15%.`,
        actionText: 'Review top performing offers'
      });
    }

    // Conversion rate check
    if (summary.conversionRate < 45) {
      recommendations.push({
        type: 'warning',
        title: 'Booking Funnel Drop-off',
        desc: `Only ${summary.conversionRate}% of users checkout after viewing. Customers are abandoning checkout during detail pages.`,
        actionText: 'Inject trust badge elements and clear terms'
      });
    } else {
      recommendations.push({
        type: 'success',
        title: 'High Checkout Efficiency',
        desc: `Your conversion rate of ${summary.conversionRate}% is in the top 10% of local ${business.type.toLowerCase()} businesses.`,
      });
    }

    // Dynamic offer strategy suggestions
    const activeOffers = summary.activeOffers;
    if (activeOffers === 0) {
      recommendations.push({
        type: 'warning',
        title: 'No Active Offers Live',
        desc: 'All current campaigns are expired or in draft. Customers cannot make bookings.',
        actionText: 'Activate Draft Offer'
      });
    }

    // Waitlist and Coupon Insights
    const bookings = summary.totalBookings;
    if (bookings > 0) {
      recommendations.push({
        type: 'info',
        title: 'Smart Promotion recommendation',
        desc: `Create a Tuesday-special discount code to fill empty evening slots. Salon/Gym bookings peak on Thursdays but slump mid-week.`,
        actionText: 'Generate Coupon Code: SAVE15',
        actionCode: 'SAVE15'
      });
    }

    return {
      headline,
      score,
      recommendations
    };
  }
};
