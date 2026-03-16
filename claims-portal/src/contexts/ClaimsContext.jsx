/**
 * Claims Context
 * Centralized claims data and operations management
 * - Claims list and filtering
 * - Current claim state
 * - Claim CRUD operations
 * - Integration with cmA service
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import cmaService from '../services/api/cmaService';
import { handleAPIError } from '../services/utils/errorHandler';
import eventBus, { EventTypes } from '../services/sync/eventBus';
import { ClaimStatus } from '../types/claim.types';
import { useApp } from './AppContext';

const ClaimsContext = createContext(null);

export const ClaimsProvider = ({ children }) => {
  const { productLine } = useApp();

  // Claims List State
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState(null);

  // Current Claim State
  const [currentClaim, setCurrentClaim] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    status: null,
    claimType: null,
    assignedTo: null,
    routing: null,
    searchQuery: ''
  });

  // Pagination State
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });

  /**
   * Fetch Claims List
   */
  const fetchClaims = useCallback(async (customFilters = {}) => {
    try {
      setClaimsLoading(true);
      setClaimsError(null);

      const mergedFilters = { ...filters, ...customFilters };
      const claimsList = await cmaService.getClaims(mergedFilters);

      setClaims(claimsList);

      // Update pagination
      setPagination(prev => ({
        ...prev,
        totalItems: claimsList.length,
        totalPages: Math.ceil(claimsList.length / prev.pageSize)
      }));

      return claimsList;

    } catch (error) {
      const apiError = handleAPIError(error, 'ClaimsContext.fetchClaims');
      setClaimsError(apiError);
      throw error;
    } finally {
      setClaimsLoading(false);
    }
  }, [filters]);

  /**
   * Fetch Single Claim
   */
  const fetchClaim = useCallback(async (claimId, bypassCache = false) => {
    try {
      setClaimLoading(true);
      setClaimError(null);

      const claim = await cmaService.getClaim(claimId, bypassCache);

      setCurrentClaim(claim);

      return claim;

    } catch (error) {
      const apiError = handleAPIError(error, 'ClaimsContext.fetchClaim');
      setClaimError(apiError);
      throw error;
    } finally {
      setClaimLoading(false);
    }
  }, []);

  /**
   * Create New Claim
   */
  const createClaim = useCallback(async (claimData) => {
    try {
      setClaimLoading(true);
      setClaimError(null);

      const newClaim = await cmaService.createClaim(claimData);

      // Add to claims list
      setClaims(prev => [newClaim, ...prev]);

      // Update current claim
      setCurrentClaim(newClaim);

      return newClaim;

    } catch (error) {
      const apiError = handleAPIError(error, 'ClaimsContext.createClaim');
      setClaimError(apiError);
      throw error;
    } finally {
      setClaimLoading(false);
    }
  }, []);

  /**
   * Update Claim
   */
  const updateClaim = useCallback(async (claimId, updates) => {
    try {
      setClaimLoading(true);
      setClaimError(null);

      const updatedClaim = await cmaService.updateClaim(claimId, updates);

      // Update in claims list
      setClaims(prev =>
        prev.map(c => (c.id === claimId ? updatedClaim : c))
      );

      // Update current claim if it's the same
      if (currentClaim?.id === claimId) {
        setCurrentClaim(updatedClaim);
      }

      return updatedClaim;

    } catch (error) {
      const apiError = handleAPIError(error, 'ClaimsContext.updateClaim');
      setClaimError(apiError);
      throw error;
    } finally {
      setClaimLoading(false);
    }
  }, [currentClaim]);

  /**
   * Update Claim Status
   */
  const updateClaimStatus = useCallback(async (claimId, newStatus) => {
    return updateClaim(claimId, { status: newStatus });
  }, [updateClaim]);

  /**
   * Assign Claim
   */
  const assignClaim = useCallback(async (claimId, userId) => {
    return updateClaim(claimId, { assignedTo: userId });
  }, [updateClaim]);

  /**
   * Filter Actions
   */

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      status: null,
      claimType: null,
      assignedTo: null,
      routing: null,
      searchQuery: ''
    });
  }, []);

  /**
   * Pagination Actions
   */

  const setPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setPageSize = useCallback((size) => {
    setPagination(prev => ({
      ...prev,
      pageSize: size,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / size)
    }));
  }, []);

  /**
   * Utility Functions
   */

  const getClaimById = useCallback((claimId) => {
    return claims.find(c => c.id === claimId);
  }, [claims]);

  const refreshClaim = useCallback(async (claimId) => {
    return fetchClaim(claimId, true);
  }, [fetchClaim]);

  const refreshClaims = useCallback(async () => {
    return fetchClaims();
  }, [fetchClaims]);

  /**
   * Re-fetch claims when product line switches (L&A ↔ P&C)
   */
  useEffect(() => {
    setClaims([]);
    setCurrentClaim(null);
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productLine]);

  /**
   * Subscribe to Claim Events
   */
  useEffect(() => {
    // Subscribe to claim created events
    const unsubscribeCreated = eventBus.subscribe(EventTypes.CLAIM_CREATED, (event) => {
      // Claim is already added via createClaim
    });

    // Subscribe to claim updated events
    const unsubscribeUpdated = eventBus.subscribe(EventTypes.CLAIM_UPDATED, (event) => {

      const { claimId, claim } = event.data;

      // Update in claims list
      setClaims(prev =>
        prev.map(c => (c.id === claimId ? claim : c))
      );

      // Update current claim if it's the same
      if (currentClaim?.id === claimId) {
        setCurrentClaim(claim);
      }
    });

    // Subscribe to claim status changed events
    const unsubscribeStatusChanged = eventBus.subscribe(EventTypes.CLAIM_STATUS_CHANGED, (event) => {
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeStatusChanged();
    };
  }, [currentClaim]);

  /**
   * Context Value
   */
  const value = {
    // Claims List
    claims,
    claimsLoading,
    claimsError,

    // Current Claim
    currentClaim,
    claimLoading,
    claimError,
    setCurrentClaim,

    // Claim Actions
    fetchClaims,
    fetchClaim,
    createClaim,
    updateClaim,
    updateClaimStatus,
    assignClaim,
    refreshClaim,
    refreshClaims,

    // Filters
    filters,
    updateFilters,
    resetFilters,

    // Pagination
    pagination,
    setPage,
    setPageSize,

    // Utility
    getClaimById
  };

  return <ClaimsContext.Provider value={value}>{children}</ClaimsContext.Provider>;
};

/**
 * Hook to use Claims Context
 */
export const useClaims = () => {
  const context = useContext(ClaimsContext);
  if (!context) {
    throw new Error('useClaims must be used within ClaimsProvider');
  }
  return context;
};

export default ClaimsContext;
