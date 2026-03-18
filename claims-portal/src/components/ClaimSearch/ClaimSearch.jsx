import { iconEl } from '../../utils/iconEl';
import { useState } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcTextInput,
  DxcSelect,
  DxcTable,
  DxcBadge,
  DxcInset
} from '@dxc-technology/halstack-react';
import STPBadge from '../shared/STPBadge';
import './ClaimSearch.css';

/**
 * SA-013: Claim Search Component
 *
 * Advanced claim search with multiple criteria:
 * - Claim number, policy number, SSN
 * - Insured/claimant name
 * - Status, type, routing
 * - Date ranges
 * - Examiner assignment
 *
 * Features:
 * - Real-time search results
 * - Sorting and pagination
 * - Quick filters
 * - Export results
 */
const ClaimSearch = ({ onSelectClaim, onClose }) => {
  const [searchCriteria, setSearchCriteria] = useState({
    claimNumber: '',
    policyNumber: '',
    insuredName: '',
    ssn: '',
    status: '',
    claimType: '',
    routing: '',
    dateFrom: '',
    dateTo: '',
    examiner: ''
  });

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Status options
  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'New', value: 'NEW' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Pending Info', value: 'PENDING_INFO' },
    { label: 'Closed', value: 'CLOSED' }
  ];

  // Routing options
  const routingOptions = [
    { label: 'All Routing Types', value: '' },
    { label: 'STP', value: 'STP' },
    { label: 'Standard', value: 'STANDARD' }
  ];

  // Claim type options
  const claimTypeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Death', value: 'DEATH' },
    { label: 'Disability', value: 'DISABILITY' },
    { label: 'Surrender', value: 'SURRENDER' }
  ];

  const handleInputChange = (field, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock search results (would come from cmA API)
      const mockResults = [
        {
          id: 'claim-1',
          claimNumber: 'CLM-000001',
          policyNumber: 'POL-123456',
          insuredName: 'John Smith',
          claimantName: 'Jane Smith',
          status: 'UNDER_REVIEW',
          type: 'DEATH',
          routing: 'STP',
          claimAmount: 250000,
          createdAt: '2026-01-20',
          examiner: 'Sarah Johnson',
          daysOpen: 6
        },
        {
          id: 'claim-2',
          claimNumber: 'CLM-000002',
          policyNumber: 'POL-789012',
          insuredName: 'Robert Brown',
          claimantName: 'Mary Brown',
          status: 'NEW',
          type: 'DEATH',
          routing: 'STANDARD',
          claimAmount: 500000,
          createdAt: '2026-01-22',
          examiner: 'Michael Lee',
          daysOpen: 4
        }
      ];

      // Filter based on search criteria
      let filtered = mockResults;

      if (searchCriteria.claimNumber) {
        filtered = filtered.filter(c =>
          c.claimNumber.toLowerCase().includes(searchCriteria.claimNumber.toLowerCase())
        );
      }

      if (searchCriteria.policyNumber) {
        filtered = filtered.filter(c =>
          c.policyNumber.toLowerCase().includes(searchCriteria.policyNumber.toLowerCase())
        );
      }

      if (searchCriteria.insuredName) {
        filtered = filtered.filter(c =>
          c.insuredName.toLowerCase().includes(searchCriteria.insuredName.toLowerCase())
        );
      }

      if (searchCriteria.status) {
        filtered = filtered.filter(c => c.status === searchCriteria.status);
      }

      if (searchCriteria.routing) {
        filtered = filtered.filter(c => c.routing === searchCriteria.routing);
      }

      setSearchResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchCriteria({
      claimNumber: '',
      policyNumber: '',
      insuredName: '',
      ssn: '',
      status: '',
      claimType: '',
      routing: '',
      dateFrom: '',
      dateTo: '',
      examiner: ''
    });
    setSearchResults([]);
    setHasSearched(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <DxcContainer
      padding="var(--spacing-padding-m)"
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {/* Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ color: 'var(--color-fg-primary-stronger)', fontSize: '24px' }}>
              search
            </span>
            <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold">
              Claim Search
            </DxcTypography>
          </DxcFlex>
          {onClose && (
            <DxcButton
              mode="tertiary"
              icon={iconEl("close")}
              onClick={onClose}
            />
          )}
        </DxcFlex>

        {/* Search Criteria */}
        <DxcContainer
          padding="var(--spacing-padding-m)"
          style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
              Search Criteria
            </DxcTypography>

            {/* Row 1: Claim & Policy Numbers */}
            <div className="search-form-grid">
              <DxcTextInput
                label="Claim Number"
                value={searchCriteria.claimNumber}
                onChange={(value) => handleInputChange('claimNumber', value)}
                placeholder="CLM-XXXXXX"
                size="fillParent"
              />

              <DxcTextInput
                label="Policy Number"
                value={searchCriteria.policyNumber}
                onChange={(value) => handleInputChange('policyNumber', value)}
                placeholder="POL-XXXXXX"
                size="fillParent"
              />

              <DxcTextInput
                label="Insured Name"
                value={searchCriteria.insuredName}
                onChange={(value) => handleInputChange('insuredName', value)}
                placeholder="First Last"
                size="fillParent"
              />

              <DxcTextInput
                label="SSN"
                value={searchCriteria.ssn}
                onChange={(value) => handleInputChange('ssn', value)}
                placeholder="XXX-XX-XXXX"
                size="fillParent"
              />
            </div>

            {/* Row 2: Filters */}
            <div className="search-form-grid">
              <DxcSelect
                label="Status"
                value={searchCriteria.status}
                onChange={(value) => handleInputChange('status', value)}
                options={statusOptions}
                size="fillParent"
              />

              <DxcSelect
                label="Claim Type"
                value={searchCriteria.claimType}
                onChange={(value) => handleInputChange('claimType', value)}
                options={claimTypeOptions}
                size="fillParent"
              />

              <DxcSelect
                label="Routing"
                value={searchCriteria.routing}
                onChange={(value) => handleInputChange('routing', value)}
                options={routingOptions}
                size="fillParent"
              />

              <DxcTextInput
                label="Examiner"
                value={searchCriteria.examiner}
                onChange={(value) => handleInputChange('examiner', value)}
                placeholder="Examiner name"
                size="fillParent"
              />
            </div>

            {/* Row 3: Date Range */}
            <div className="search-form-grid">
              <DxcTextInput
                label="Date From"
                value={searchCriteria.dateFrom}
                onChange={(value) => handleInputChange('dateFrom', value)}
                type="date"
                size="fillParent"
              />

              <DxcTextInput
                label="Date To"
                value={searchCriteria.dateTo}
                onChange={(value) => handleInputChange('dateTo', value)}
                type="date"
                size="fillParent"
              />
            </div>

            {/* Action Buttons */}
            <DxcFlex gap="var(--spacing-gap-s)">
              <DxcButton
                label="Search"
                mode="primary"
                icon={iconEl("search")}
                onClick={handleSearch}
                disabled={isSearching}
              />
              <DxcButton
                label="Clear"
                mode="tertiary"
                onClick={handleClear}
              />
            </DxcFlex>
          </DxcFlex>
        </DxcContainer>

        {/* Search Results */}
        {hasSearched && (
          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  Search Results ({searchResults.length})
                </DxcTypography>
                {searchResults.length > 0 && (
                  <DxcButton
                    label="Export Results"
                    mode="secondary"
                    size="small"
                    icon={iconEl("download")}
                  />
                )}
              </DxcFlex>

              {searchResults.length > 0 ? (
                <div className="search-results-container">
                  {searchResults.map((claim) => (
                    <DxcContainer
                      key={claim.id}
                      padding="var(--spacing-padding-m)"
                      style={{
                        backgroundColor: 'var(--color-bg-neutral-lightest)',
                        cursor: 'pointer'
                      }}
                      onClick={() => onSelectClaim && onSelectClaim(claim)}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        {/* Claim Header */}
                        <DxcFlex justifyContent="space-between" alignItems="center">
                          <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                              {claim.claimNumber}
                            </DxcTypography>
                            <DxcBadge label={claim.status} />
                            <STPBadge routing={claim.routing} size="small" />
                          </DxcFlex>
                          <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                              Days Open: {claim.daysOpen}
                            </DxcTypography>
                          </DxcFlex>
                        </DxcFlex>

                        {/* Claim Details */}
                        <div className="claim-result-grid">
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                              Insured
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                              {claim.insuredName}
                            </DxcTypography>
                          </DxcFlex>

                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                              Policy Number
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                              {claim.policyNumber}
                            </DxcTypography>
                          </DxcFlex>

                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                              Claim Amount
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                              {formatCurrency(claim.claimAmount)}
                            </DxcTypography>
                          </DxcFlex>

                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                              Examiner
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                              {claim.examiner}
                            </DxcTypography>
                          </DxcFlex>

                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                              Created Date
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-01">
                              {formatDate(claim.createdAt)}
                            </DxcTypography>
                          </DxcFlex>
                        </div>
                      </DxcFlex>
                    </DxcContainer>
                  ))}
                </div>
              ) : (
                <DxcInset>
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
                    <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-fg-neutral-stronger)' }}>
                      search_off
                    </span>
                    <DxcTypography color="var(--color-fg-neutral-strong)">
                      No claims found matching your search criteria
                    </DxcTypography>
                  </DxcFlex>
                </DxcInset>
              )}
            </DxcFlex>
          </DxcContainer>
        )}
      </DxcFlex>
    </DxcContainer>
  );
};

export default ClaimSearch;
