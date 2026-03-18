/**
 * Product Line Configuration
 * Controls demo data, terminology, and labels for each product line.
 * Toggle between L&A (Life & Annuity) and P&C (Property and Casualty) in the Actions Menu.
 */

export const PRODUCT_LINES = {
  LA: 'la',
  PC: 'pc',
  TRAVEL: 'travel'
};

export const productLineConfig = {
  [PRODUCT_LINES.LA]: {
    id: 'la',
    label: 'Life & Annuity',
    shortLabel: 'L&A',
    icon: 'favorite',
    color: '#0F4470',
    terms: {
      insured: 'Insured',
      claimant: 'Beneficiary',
      dateOfLoss: 'Date of Death',
      causeOfLoss: 'Cause of Death',
      lossEvent: 'Death Event',
      coverageVerification: 'Death Verification',
      coverageLimit: 'Face Amount',
      primaryDocument: 'Death Certificate',
      stpLabel: 'STP',
      stpFull: 'Straight Through Processing',
      routingLabel: 'STP Routing',
      fastTrackMetric: 'STP Eligible',
      fastTrackPct: 'STP %',
      claimsLabel: 'Life Claims',
      workbenchTitle: 'Life Claims Workbench',
      partyRoles: ['Insured', 'Primary Beneficiary', 'Contingent Beneficiary', 'Notifier'],
      policyTypeLabel: 'Policy Type',
      interestLabel: 'Post-Mortem Interest (PMI)',
      reserveLabel: 'Reserve',
      deductibleLabel: 'Deductible'
    },
    claimTypeLabels: {
      death: 'Death',
      maturity: 'Maturity',
      disability: 'Disability',
      surrender: 'Surrender',
      withdrawal: 'Withdrawal'
    },
    dashboardSections: {
      inventory: 'Department Inventory',
      openClaims: 'Open Claims',
      closedClaims: 'Closed Claims'
    }
  },

  [PRODUCT_LINES.PC]: {
    id: 'pc',
    label: 'Property and Casualty',
    shortLabel: 'P&C',
    icon: 'directions_car',
    color: '#1B75BB',
    terms: {
      insured: 'Policyholder',
      claimant: 'Claimant',
      dateOfLoss: 'Date of Loss',
      causeOfLoss: 'Cause of Loss',
      lossEvent: 'Loss Event',
      coverageVerification: 'Coverage Verification',
      coverageLimit: 'Coverage Limit',
      primaryDocument: 'Police Report / Damage Photos',
      stpLabel: 'STP',
      stpFull: 'STP (Straight Through Processing)',
      routingLabel: 'STP Routing',
      fastTrackMetric: 'STP',
      fastTrackPct: 'STP %',
      claimsLabel: 'P&C Claims',
      workbenchTitle: 'P&C Claims Workbench',
      partyRoles: ['Policyholder', 'Claimant', 'Third Party', 'Adjuster'],
      policyTypeLabel: 'Coverage Type',
      interestLabel: 'Pre-Judgment Interest',
      reserveLabel: 'Reserve',
      deductibleLabel: 'Deductible'
    },
    claimTypeLabels: {
      auto_collision: 'Auto Collision',
      auto_comprehensive: 'Auto Comprehensive',
      homeowners: 'Homeowners',
      commercial_property: 'Commercial Property',
      auto_liability: 'Auto Liability',
      workers_comp: 'Workers Compensation'
    },
    dashboardSections: {
      inventory: 'Department Inventory',
      openClaims: 'Open Claims',
      closedClaims: 'Closed Claims'
    }
  },

  [PRODUCT_LINES.TRAVEL]: {
    id: 'travel',
    label: 'Travel',
    shortLabel: 'Travel',
    icon: 'flight',
    color: '#0D7A5F',
    terms: {
      insured: 'Traveler',
      claimant: 'Claimant',
      dateOfLoss: 'Date of Incident',
      causeOfLoss: 'Cause of Loss',
      lossEvent: 'Travel Incident',
      coverageVerification: 'Policy Coverage Verification',
      coverageLimit: 'Coverage Limit',
      primaryDocument: 'Travel Itinerary / Booking Confirmation',
      stpLabel: 'STP',
      stpFull: 'STP (Straight Through Processing)',
      routingLabel: 'STP Routing',
      fastTrackMetric: 'STP',
      fastTrackPct: 'STP %',
      claimsLabel: 'Travel Claims',
      workbenchTitle: 'Travel Claims Workbench',
      partyRoles: ['Insured Traveler', 'Co-Traveler', 'Emergency Contact', 'Third-Party Claimant'],
      policyTypeLabel: 'Plan Type',
      interestLabel: 'Pre-Judgment Interest',
      reserveLabel: 'Reserve',
      deductibleLabel: 'Deductible'
    },
    claimTypeLabels: {
      trip_cancellation: 'Trip Cancellation',
      trip_interruption: 'Trip Interruption',
      medical_emergency: 'Medical Emergency',
      baggage_loss: 'Baggage Loss',
      baggage_delay: 'Baggage Delay',
      flight_delay: 'Flight Delay',
      travel_accident: 'Travel Accident'
    },
    dashboardSections: {
      inventory: 'Department Inventory',
      openClaims: 'Open Claims',
      closedClaims: 'Closed Claims'
    }
  }
};

/**
 * Get config for a product line
 */
export const getProductLineConfig = (productLine) =>
  productLineConfig[productLine] || productLineConfig[PRODUCT_LINES.LA];

/**
 * Get a terminology label for a product line
 */
export const getTerm = (productLine, key) => {
  const config = getProductLineConfig(productLine);
  return config.terms[key] || key;
};

/**
 * Get the display label for a claim type
 */
export const getClaimTypeLabel = (productLine, type) => {
  const config = getProductLineConfig(productLine);
  return config.claimTypeLabels[type] || type;
};

export default productLineConfig;
