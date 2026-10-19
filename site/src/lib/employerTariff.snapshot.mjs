// GetJobMe employer tariff (Sep 2026). Single source of truth for the
// website premium page, Razorpay orders, receipts, admin confirmation and
// the WhatsApp TARIFF reply. All fees are before GST.

export const EMPLOYER_GST_RATE = 18;

// Candidate contact unlocks: bought in steps of ₹500. Bigger purchases get
// more unlocks per ₹500 and a longer validity.
export const UNLOCK_STEP = 500;
export const UNLOCK_MIN_AMOUNT = 500;
export const UNLOCK_MAX_AMOUNT = 10000;
export const UNLOCK_TIERS = Object.freeze([
    Object.freeze({ minAmount: 500, maxAmount: 1500, unlocksPerStep: 35, validityDays: 30 }),
    Object.freeze({ minAmount: 2000, maxAmount: 4500, unlocksPerStep: 40, validityDays: 45 }),
    Object.freeze({ minAmount: 5000, maxAmount: 10000, unlocksPerStep: 45, validityDays: 60 }),
]);

// Expired credits stay frozen this long and return if the employer buys again.
export const CREDIT_GRACE_DAYS = 15;
// Wrong-number credit back: report window and cap per purchased credits.
export const WRONG_NUMBER_REPORT_HOURS = 48;
export const WRONG_NUMBER_MAX_PERCENT = 10;
export const FREE_DATABASE_VIEWS = 5;
// Recruitment fees fall due this many days after the candidate joins.
export const RECRUITMENT_FEE_DUE_DAYS = 5;
export const MARKET_SURVEY_REPORT_DAYS = 10;
// Assisted services start only after an advance is paid. An accepted
// agreement lapses if the advance is not paid within this many days.
export const ADVANCE_PAYMENT_DAYS = 3;
// If GetJobMe cannot deliver, the advance becomes a credit note for other
// GetJobMe services (never a cash refund). Recruitment: no candidates shared
// within this many days of the advance.
export const RECRUITMENT_DELIVERY_DAYS = 30;

// Extra contacts a tier gives over the first tier, in whole percent (0, 14, 29).
export const tierBonusPercent = tier => Math.round((tier.unlocksPerStep / UNLOCK_TIERS[0].unlocksPerStep - 1) * 100);

export const unlockTierFor = amount => UNLOCK_TIERS.find(tier => amount >= tier.minAmount && amount <= tier.maxAmount) || null;

// Returns the quote for a contact-unlock purchase, or null when the amount is
// not a whole multiple of ₹500 between the minimum and maximum.
export const quoteUnlockPurchase = value => {
    const amount = Number(value);
    if (!Number.isInteger(amount) || amount < UNLOCK_MIN_AMOUNT || amount > UNLOCK_MAX_AMOUNT || amount % UNLOCK_STEP) return null;
    const tier = unlockTierFor(amount);
    const credits = (amount / UNLOCK_STEP) * tier.unlocksPerStep;
    return {
        baseFee: amount,
        credits,
        validityDays: tier.validityDays,
        perUnlock: Math.round((amount / credits) * 100) / 100,
    };
};

// Assisted services. None of these are bought online and none of them change
// the employer's contact credits.
export const EMPLOYER_SERVICES = Object.freeze({
    PRO_RECRUITMENT: Object.freeze({
        code: 'PRO_RECRUITMENT', name: 'Pro Recruitment', group: 'recruitment',
        salaryPercent: 50, minimumFee: 6000, unit: 'per joined candidate (one time)',
        advance: 3000, advancePer: 'position',
        summary: '50% of the joined candidate\'s gross monthly salary, one time per candidate',
    }),
    RECRUITMENT_PRO_MAX: Object.freeze({
        code: 'RECRUITMENT_PRO_MAX', name: 'Recruitment Pro Max', group: 'recruitment',
        salaryPercent: 100, minimumFee: 12000, unit: 'per joined candidate (one time)',
        advance: 5000, advancePer: 'position',
        summary: 'One month\'s gross salary of the joined candidate, one time per candidate',
    }),
    EXTRA_TRAINING_DAY: Object.freeze({
        code: 'EXTRA_TRAINING_DAY', name: 'Additional Training Day', group: 'recruitment',
        unitFee: 1000, unit: 'per day',
        summary: '₹1,000 per extra day requested by the employer, plus actual stay, food and travel',
    }),
    BUSINESS_GROWTH: Object.freeze({
        code: 'BUSINESS_GROWTH', name: 'Business Growth', group: 'business',
        unitFee: 50000, unit: 'per month', minimumTermMonths: 6,
        advance: 50000, advanceLabel: 'first month\'s fee',
        summary: '₹50,000 per month, minimum 6 months, billed monthly, market survey included',
    }),
    MARKET_SURVEY: Object.freeze({
        code: 'MARKET_SURVEY', name: 'Market Survey', group: 'business',
        unitFee: 10000, unit: 'per market (one time)',
        advance: 5000, advanceLabel: '50% of the fee',
        summary: 'One city/district + one business category, report in 10 days',
    }),
});

// Service fee before GST. `grossMonthlySalary` is used by the recruitment
// plans; `quantity` is days, months or markets for the others.
export const serviceFee = (code, { grossMonthlySalary, quantity = 1 } = {}) => {
    const service = EMPLOYER_SERVICES[code];
    if (!service) return null;
    if (service.salaryPercent) {
        const salary = Number(grossMonthlySalary);
        if (!Number.isFinite(salary) || salary <= 0) return null;
        return Math.max(Math.round(salary * service.salaryPercent) / 100, service.minimumFee);
    }
    const units = Number(quantity);
    if (!Number.isInteger(units) || units < 1) return null;
    return service.unitFee * units;
};

export const withGst = baseFee => {
    const gstAmount = Math.round(baseFee * EMPLOYER_GST_RATE) / 100;
    return { baseFee, gstRate: EMPLOYER_GST_RATE, gstAmount, totalPayable: Math.round((baseFee + gstAmount) * 100) / 100 };
};

// Advance before GST for an agreement. Recruitment advances are per position.
export const agreementAdvance = (code, positions = 1) => {
    const service = EMPLOYER_SERVICES[code];
    if (!service?.advance) return null;
    if (service.advancePer !== 'position') return service.advance;
    const count = Number(positions);
    return Number.isInteger(count) && count >= 1 ? service.advance * count : null;
};
