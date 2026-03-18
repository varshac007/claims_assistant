/**
 * cmA (Claims Management Accelerator) Service
 * Claims System of Record Integration
 *
 * cmA is authoritative for:
 * - Claim records
 * - Party records (beneficiaries)
 * - Financial transactions (reserves, payments)
 * - Tax withholding
 * - GL posting
 */

import apiClient from './apiClient';
import cacheManager from '../utils/cacheManager';
import { handleAPIError } from '../utils/errorHandler';
import eventBus, { EventTypes } from '../sync/eventBus';
import demoData from '../../data/demoData';
import { getPCDemoData } from '../../data/demoDataPC';
import { getTravelDemoData } from '../../data/demoDataTravel';

const getActiveDemoData = () => {
  const line = localStorage.getItem('demoProductLine');
  if (line === 'pc') return getPCDemoData();
  if (line === 'travel') return getTravelDemoData();
  return demoData;
};

const CMA_BASE_PATH = '/cma';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const USE_DEMO_DATA = true; // Toggle for demo mode

/**
 * Claim Management
 */

/**
 * Create new claim in cmA
 * @param {Object} claimData - Claim data
 * @returns {Promise<Object>} Created claim
 */
export const createClaim = async (claimData) => {
  try {
    console.log('[cmA] Creating claim:', claimData);

    const claim = await apiClient.post(`${CMA_BASE_PATH}/claims`, claimData);

    // Publish event
    eventBus.publish(EventTypes.CLAIM_CREATED, { claim });

    return claim;
  } catch (error) {
    throw handleAPIError(error, 'cmA.createClaim');
  }
};

/**
 * Get claim by ID
 * @param {string} claimId - Claim ID
 * @param {boolean} bypassCache - Bypass cache
 * @returns {Promise<Object>} Claim data
 */
export const getClaim = async (claimId, bypassCache = false) => {
  try {
    // DEMO MODE: Return demo data
    if (USE_DEMO_DATA) {
      console.log(`[cmA] Getting demo claim: ${claimId}`);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const claim = getActiveDemoData().claims.find(c =>
        c.id === claimId || c.claimNumber === claimId
      );

      if (!claim) {
        throw new Error(`Claim not found: ${claimId}`);
      }

      return claim;
    }

    const cacheKey = cacheManager.generateKey('cma:claim', { claimId });

    if (!bypassCache) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    console.log(`[cmA] Getting claim: ${claimId}`);

    const claim = await apiClient.get(`${CMA_BASE_PATH}/claims/${claimId}`);

    cacheManager.set(cacheKey, claim, CACHE_TTL);

    return claim;
  } catch (error) {
    throw handleAPIError(error, 'cmA.getClaim');
  }
};

/**
 * Update claim
 * @param {string} claimId - Claim ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated claim
 */
export const updateClaim = async (claimId, updates) => {
  try {
    console.log(`[cmA] Updating claim: ${claimId}`, updates);

    const claim = await apiClient.patch(`${CMA_BASE_PATH}/claims/${claimId}`, updates);

    // Invalidate cache
    const cacheKey = cacheManager.generateKey('cma:claim', { claimId });
    cacheManager.delete(cacheKey);

    // Publish event
    eventBus.publish(EventTypes.CLAIM_UPDATED, { claimId, claim });

    return claim;
  } catch (error) {
    throw handleAPIError(error, 'cmA.updateClaim');
  }
};

/**
 * Get claims list with filters
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} List of claims
 */
export const getClaims = async (filters = {}) => {
  try {
    // DEMO MODE: Return demo data
    if (USE_DEMO_DATA) {
      console.log('[cmA] Returning demo claims data');

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredClaims = [...getActiveDemoData().claims];

      // Apply filters if provided
      if (filters.status) {
        filteredClaims = filteredClaims.filter(c => c.status === filters.status);
      }
      if (filters.claimType) {
        filteredClaims = filteredClaims.filter(c => c.type === filters.claimType);
      }
      if (filters.routing) {
        filteredClaims = filteredClaims.filter(c => c.routing?.type === filters.routing);
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredClaims = filteredClaims.filter(c =>
          c.claimNumber?.toLowerCase().includes(query) ||
          c.policy?.policyNumber?.toLowerCase().includes(query) ||
          c.claimant?.name?.toLowerCase().includes(query)
        );
      }

      return filteredClaims;
    }

    const cacheKey = cacheManager.generateKey('cma:claims', filters);
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log('[cmA] Getting claims with filters:', filters);

    const claims = await apiClient.get(`${CMA_BASE_PATH}/claims`, { params: filters });

    cacheManager.set(cacheKey, claims, CACHE_TTL);

    return claims;
  } catch (error) {
    throw handleAPIError(error, 'cmA.getClaims');
  }
};

/**
 * Party Management
 */

/**
 * Create party record
 * @param {Object} partyData - Party data
 * @returns {Promise<Object>} Created party
 */
export const createParty = async (partyData) => {
  try {
    console.log('[cmA] Creating party:', partyData);

    const party = await apiClient.post(`${CMA_BASE_PATH}/parties`, partyData);

    return party;
  } catch (error) {
    throw handleAPIError(error, 'cmA.createParty');
  }
};

/**
 * Link party to claim
 * @param {string} claimId - Claim ID
 * @param {string} partyId - Party ID
 * @returns {Promise<Object>} Link result
 */
export const linkPartyToClaim = async (claimId, partyId) => {
  try {
    console.log(`[cmA] Linking party ${partyId} to claim ${claimId}`);

    const result = await apiClient.post(`${CMA_BASE_PATH}/claims/${claimId}/parties/${partyId}`);

    // Invalidate claim cache
    const cacheKey = cacheManager.generateKey('cma:claim', { claimId });
    cacheManager.delete(cacheKey);

    return result;
  } catch (error) {
    throw handleAPIError(error, 'cmA.linkPartyToClaim');
  }
};

/**
 * Financial Management
 */

/**
 * Create reserve
 * @param {string} claimId - Claim ID
 * @param {number} amount - Reserve amount
 * @returns {Promise<Object>} Reserve record
 */
export const createReserve = async (claimId, amount) => {
  try {
    console.log(`[cmA] Creating reserve for claim ${claimId}: $${amount}`);

    const reserve = await apiClient.post(`${CMA_BASE_PATH}/claims/${claimId}/reserves`, { amount });

    return reserve;
  } catch (error) {
    throw handleAPIError(error, 'cmA.createReserve');
  }
};

/**
 * Update reserve
 * @param {string} claimId - Claim ID
 * @param {number} amount - New reserve amount
 * @returns {Promise<Object>} Updated reserve
 */
export const updateReserve = async (claimId, amount) => {
  try {
    console.log(`[cmA] Updating reserve for claim ${claimId}: $${amount}`);

    const reserve = await apiClient.put(`${CMA_BASE_PATH}/claims/${claimId}/reserves`, { amount });

    return reserve;
  } catch (error) {
    throw handleAPIError(error, 'cmA.updateReserve');
  }
};

/**
 * Create payment record
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Payment record
 */
export const createPayment = async (paymentData) => {
  try {
    console.log('[cmA] Creating payment:', paymentData);

    const payment = await apiClient.post(`${CMA_BASE_PATH}/payments`, paymentData);

    // Publish event
    eventBus.publish(EventTypes.PAYMENT_SCHEDULED, { payment });

    return payment;
  } catch (error) {
    throw handleAPIError(error, 'cmA.createPayment');
  }
};

/**
 * Execute payment (ACH/Check)
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Execution result
 */
export const executePayment = async (paymentId) => {
  try {
    console.log(`[cmA] Executing payment: ${paymentId}`);

    const result = await apiClient.post(`${CMA_BASE_PATH}/payments/${paymentId}/execute`);

    // Publish event
    eventBus.publish(EventTypes.PAYMENT_EXECUTED, { paymentId, result });

    return result;
  } catch (error) {
    // Publish failure event
    eventBus.publish(EventTypes.PAYMENT_FAILED, { paymentId, error: error.message });

    throw handleAPIError(error, 'cmA.executePayment');
  }
};

/**
 * Get payment history for claim
 * @param {string} claimId - Claim ID
 * @returns {Promise<Array>} Payment history
 */
export const getPaymentHistory = async (claimId) => {
  try {
    const cacheKey = cacheManager.generateKey('cma:payments', { claimId });
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    console.log(`[cmA] Getting payment history for claim: ${claimId}`);

    const payments = await apiClient.get(`${CMA_BASE_PATH}/claims/${claimId}/payments`);

    cacheManager.set(cacheKey, payments, CACHE_TTL);

    return payments;
  } catch (error) {
    throw handleAPIError(error, 'cmA.getPaymentHistory');
  }
};

/**
 * Tax & GL
 */

/**
 * Calculate tax withholding
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Tax calculation
 */
export const calculateTaxWithholding = async (paymentData) => {
  try {
    console.log('[cmA] Calculating tax withholding:', paymentData);

    const taxCalc = await apiClient.post(`${CMA_BASE_PATH}/tax/calculate`, paymentData);

    return taxCalc;
  } catch (error) {
    throw handleAPIError(error, 'cmA.calculateTaxWithholding');
  }
};

/**
 * Generate 1099 forms
 * @param {string} claimId - Claim ID
 * @returns {Promise<Object>} Generated 1099
 */
export const generate1099 = async (claimId) => {
  try {
    console.log(`[cmA] Generating 1099 for claim: ${claimId}`);

    const form1099 = await apiClient.post(`${CMA_BASE_PATH}/claims/${claimId}/1099`);

    return form1099;
  } catch (error) {
    throw handleAPIError(error, 'cmA.generate1099');
  }
};

/**
 * Post transaction to GL System
 * @param {Object} transaction - Transaction data
 * @returns {Promise<Object>} GL posting result
 */
export const postToGL = async (transaction) => {
  try {
    console.log('[cmA] Posting to GL:', transaction);

    const result = await apiClient.post(`${CMA_BASE_PATH}/gl/post`, transaction);

    return result;
  } catch (error) {
    throw handleAPIError(error, 'cmA.postToGL');
  }
};

/**
 * Cache Invalidation
 */

/**
 * Invalidate all claim-related cache
 * @param {string} claimId - Claim ID
 */
export const invalidateClaimCache = (claimId) => {
  cacheManager.delete(cacheManager.generateKey('cma:claim', { claimId }));
  cacheManager.delete(cacheManager.generateKey('cma:payments', { claimId }));
  console.log(`[cmA] Cache invalidated for claim: ${claimId}`);
};

export default {
  // Claim Management
  createClaim,
  getClaim,
  updateClaim,
  getClaims,

  // Party Management
  createParty,
  linkPartyToClaim,

  // Financial Management
  createReserve,
  updateReserve,
  createPayment,
  executePayment,
  getPaymentHistory,

  // Tax & GL
  calculateTaxWithholding,
  generate1099,
  postToGL,

  // Cache
  invalidateClaimCache
};
