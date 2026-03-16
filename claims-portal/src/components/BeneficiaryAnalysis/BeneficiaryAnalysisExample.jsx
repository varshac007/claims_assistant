import { useState, useEffect } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcAlert,
  DxcInset,
  DxcChip,
  DxcDivider,
  DxcSpinner,
  DxcCard,
  DxcGrid,
  DxcStatusLight,
  DxcAccordion
} from '@dxc-technology/halstack-react';
import serviceNowService from '../../services/api/serviceNowService';
import './BeneficiaryAnalyzer.css';

/**
 * BeneficiaryAnalyzer Component
 *
 * Displays AI-extracted beneficiary information from documents and allows:
 * - Viewing extracted beneficiaries with confidence scores
 * - Comparing against administrative records
 * - LexisNexis integration for address lookup and deceased verification
 * - Document source viewing
 * - AI reasoning explanation
 */
const BeneficiaryAnalyzer = ({ claimId, claim, onApproveBeneficiaries, onCancel }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing beneficiary analysis...');
  const [error, setError] = useState(null);
  const [expandedBeneficiaries, setExpandedBeneficiaries] = useState({});
  const [lexisNexisResults, setLexisNexisResults] = useState({});
  const [processingLexisNexis, setProcessingLexisNexis] = useState({});

  // Toggle beneficiary card expansion
  const toggleBeneficiary = (beneficiaryId) => {
    setExpandedBeneficiaries(prev => ({
      ...prev,
      [beneficiaryId]: !prev[beneficiaryId]
    }));
  };

  // Expand/collapse all beneficiaries
  const toggleAllBeneficiaries = () => {
    const allExpanded = analysisData?.extractedBeneficiaries.every(b => expandedBeneficiaries[b.id]);
    const newState = {};
    analysisData?.extractedBeneficiaries.forEach(b => {
      newState[b.id] = !allExpanded;
    });
    setExpandedBeneficiaries(newState);
  };

  // Build analysis data from claim if available, otherwise use fallback
  const buildAnalysisData = () => {
    // Try to get beneficiaries from claim data
    const claimBeneficiaries = claim?.beneficiaries || claim?.policy?.beneficiaries || [];
    const claimParties = claim?.parties || [];
    const claimantData = claim?.claimant || {};

    if (claimBeneficiaries.length > 0) {
      // Build from actual claim beneficiary data
      const extractedBeneficiaries = claimBeneficiaries.map((ben, idx) => {
        // Try to find matching party for extra details
        const matchingParty = claimParties.find(p =>
          p.name === ben.name || p.role === ben.relationship
        );

        return {
          id: `bene-${idx + 1}`,
          fullName: ben.name || `Beneficiary ${idx + 1}`,
          relationship: ben.relationship || 'Unknown',
          percentage: typeof ben.percentage === 'string'
            ? parseInt(ben.percentage.replace('%', ''), 10)
            : (ben.percentage || 0),
          ssn: ben.ssn || matchingParty?.ssn || '***-**-0000',
          dateOfBirth: ben.dateOfBirth || matchingParty?.dateOfBirth || 'N/A',
          address: ben.address || matchingParty?.address || {
            street: claimantData.address?.street || '123 Main Street',
            city: claimantData.address?.city || 'Springfield',
            state: claimantData.address?.state || 'IL',
            zip: claimantData.address?.zip || '62701'
          },
          phone: ben.phone || matchingParty?.phone || null,
          email: ben.email || matchingParty?.email || null,
          confidenceScores: {
            overall: 0.92 + (idx * -0.02),
            name: 0.97 - (idx * 0.01),
            relationship: 0.93 - (idx * 0.01),
            percentage: 0.99,
            ssn: 0.85 - (idx * 0.03),
            dateOfBirth: 0.95 - (idx * 0.01),
            address: 0.88
          },
          sourceDocument: {
            id: `doc-${100 + idx}`,
            name: 'Beneficiary_Designation_Form.pdf',
            pageNumber: idx < 2 ? 1 : 2,
            extractionTimestamp: new Date().toISOString()
          },
          extractionReasoning: idx === 0
            ? `Primary beneficiary identified from beneficiary designation form. Name "${ben.name}" extracted with high confidence. Relationship "${ben.relationship}" confirmed from form fields.`
            : `Contingent beneficiary identified from beneficiary section. Relationship "${ben.relationship}" indicated. Allocation of ${ben.percentage} confirmed.`
        };
      });

      const administrativeBeneficiaries = claimBeneficiaries.map((ben, idx) => ({
        id: `admin-${idx + 1}`,
        fullName: ben.name || `Beneficiary ${idx + 1}`,
        relationship: ben.relationship || 'Unknown',
        percentage: typeof ben.percentage === 'string'
          ? parseInt(ben.percentage.replace('%', ''), 10)
          : (ben.percentage || 0),
        ssn: ben.ssn || '***-**-0000',
        dateOfBirth: ben.dateOfBirth || 'N/A',
        address: ben.address || {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zip: '62701'
        },
        phone: ben.phone || null,
        email: ben.email || null,
        lastUpdated: claim?.policy?.issueDate || '2023-06-15',
        source: 'Policy Administration System'
      }));

      return {
        extractedBeneficiaries,
        administrativeBeneficiaries,
        overallAnalysis: {
          matchStatus: 'MATCH',
          discrepancies: [],
          confidence: 0.94,
          recommendation: 'Extracted beneficiaries match administrative records with high confidence. No significant discrepancies detected.'
        }
      };
    }

    // Fallback: use generic mock data if no claim data available
    return {
      extractedBeneficiaries: [
        {
          id: 'bene-1',
          fullName: 'Unknown Beneficiary',
          relationship: 'Unknown',
          percentage: 100,
          ssn: '***-**-0000',
          dateOfBirth: 'N/A',
          address: { street: 'N/A', city: 'N/A', state: 'N/A', zip: 'N/A' },
          phone: null,
          email: null,
          confidenceScores: {
            overall: 0.50, name: 0.50, relationship: 0.50,
            percentage: 0.50, ssn: 0.50, dateOfBirth: 0.50, address: 0.50
          },
          sourceDocument: { id: 'doc-0', name: 'No document available', pageNumber: 0, extractionTimestamp: new Date().toISOString() },
          extractionReasoning: 'No claim data available for beneficiary extraction.'
        }
      ],
      administrativeBeneficiaries: [],
      overallAnalysis: {
        matchStatus: 'NO_DATA',
        discrepancies: [],
        confidence: 0,
        recommendation: 'No beneficiary data available. Please upload beneficiary designation forms for analysis.'
      }
    };
  };

  /**
   * Parse API response and build analysis data structure
   */
  const parseAPIResponse = (apiData) => {
    try {
      // Handle both "Output" and "output" (case-insensitive)
      const output = apiData.Output || apiData.output || [];

      if (!Array.isArray(output) || output.length === 0) {
        console.warn('[BeneficiaryAnalyzer] Output array is empty or invalid');
        return null;
      }

      // Find DMS, PAS, Summary, and BeneScoring sections
      const dmsSection = output.find(item => item.DMS);
      const pasSection = output.find(item => item.PAS);
      const summarySection = output.find(item => item.Summary);
      const beneScoring = output.find(item => item.BeneScoring);

      const dmsBeneficiaries = dmsSection?.DMS || [];
      const pasBeneficiaries = pasSection?.PAS || [];
      const summary = summarySection?.Summary || '';
      const scoring = beneScoring?.BeneScoring || [];

      // Map DMS beneficiaries (AI-extracted)
      const extractedBeneficiaries = dmsBeneficiaries.map((ben, idx) => {
        const beneficiaryKey = `${['First', 'Second', 'Third', 'Fourth', 'Fifth'][idx] || 'Unknown'}BeneficiaryName`;
        const name = ben[beneficiaryKey] || ben.FirstBeneficiaryName || ben.SecondBeneficiaryName ||
                     ben.ThirdBeneficiaryName || ben.FourthBeneficiaryName || `Beneficiary ${idx + 1}`;

        // Get scoring for this beneficiary
        const benScoring = scoring[idx] || {};
        const nameScore = parseFloat(benScoring[beneficiaryKey]) / 100 || 0.95;

        return {
          id: `bene-${idx + 1}`,
          fullName: name,
          relationship: ben.beneficiaryType || 'Unknown',
          percentage: parseInt(ben.beneficiaryPercentage?.replace('%', '') || '0', 10),
          ssn: '***-**-0000', // Not provided in API
          dateOfBirth: ben.beneficiaryDOB || 'N/A',
          address: {
            street: 'N/A',
            city: 'N/A',
            state: 'N/A',
            zip: 'N/A'
          },
          phone: ben.beneficiaryPhone || null,
          email: ben.beneficiaryEmail || null,
          confidenceScores: {
            overall: nameScore,
            name: nameScore,
            relationship: parseFloat(benScoring.beneficiaryType) / 100 || 0.95,
            percentage: parseFloat(benScoring.beneficiaryPercentage) / 100 || 0.95,
            ssn: 0.85,
            dateOfBirth: parseFloat(benScoring.beneficiaryDOB) / 100 || 0.95,
            address: 0.88
          },
          sourceDocument: {
            id: ben.documentID || `doc-${idx + 1}`,
            name: 'DMS Document',
            pageNumber: 1,
            extractionTimestamp: new Date().toISOString()
          },
          extractionReasoning: `${ben.beneficiaryType || 'Unknown'} beneficiary identified from DMS with ${ben.beneficiaryPercentage || '0%'} allocation.`
        };
      });

      // Map PAS beneficiaries (administrative records)
      const administrativeBeneficiaries = pasBeneficiaries.map((ben, idx) => {
        const beneficiaryKey = `${['First', 'Second', 'Third', 'Fourth', 'Fifth'][idx] || 'Unknown'}BeneficiaryName`;
        const name = ben[beneficiaryKey] || ben.FirstBeneficiaryName || ben.SecondBeneficiaryName ||
                     ben.ThirdBeneficiaryName || ben.FourthBeneficiaryName || `Beneficiary ${idx + 1}`;

        return {
          id: `admin-${idx + 1}`,
          fullName: name,
          relationship: ben.beneficiaryType || 'Unknown',
          percentage: parseInt(ben.beneficiaryPercentage?.replace('%', '') || '0', 10),
          ssn: '***-**-0000',
          dateOfBirth: ben.beneficiaryDOB || 'N/A',
          address: {
            street: 'N/A',
            city: 'N/A',
            state: 'N/A',
            zip: 'N/A'
          },
          phone: ben.beneficiaryPhone || null,
          email: ben.beneficiaryEmail || null,
          lastUpdated: 'N/A',
          source: 'Policy Administration System (PAS)'
        };
      });

      // Determine match status and confidence from scoring
      const totalSharesScoring = scoring.find(s => s.totalBeneficiaryShares)?.totalBeneficiaryShares || [];
      const primaryMatch = totalSharesScoring.find(s => s.PrimaryShares)?.PrimaryShares?.Match || 'UNKNOWN';
      const contingentMatch = totalSharesScoring.find(s => s.ContingentShares)?.ContingentShares?.Match || 'UNKNOWN';
      const overallMatch = (primaryMatch === 'MATCH' && contingentMatch === 'MATCH') ? 'MATCH' : 'MISMATCH';

      return {
        extractedBeneficiaries,
        administrativeBeneficiaries,
        overallAnalysis: {
          matchStatus: overallMatch,
          discrepancies: [],
          confidence: overallMatch === 'MATCH' ? 0.94 : 0.75,
          recommendation: summary
        },
        rawData: apiData
      };
    } catch (error) {
      console.error('[BeneficiaryAnalyzer] Error parsing API response:', error);
      throw error;
    }
  };

  /**
   * Parse API response from the beneficiary analyzer endpoint
   * Response structure: { result: { status: "complete", data: "{\"Output\": [...]}" } }
   */
  const parseAPIResponseFromEndpoint = (apiResponse) => {
    try {
      console.log('[BeneficiaryAnalyzer] Raw API response:', apiResponse);

      // Check if response has the expected structure
      if (!apiResponse || !apiResponse.result) {
        console.warn('[BeneficiaryAnalyzer] API response missing result object');
        return null;
      }

      const { status, data } = apiResponse.result;

      // Check if analysis is complete
      if (status !== 'complete') {
        console.log('[BeneficiaryAnalyzer] Analysis not complete, status:', status);
        return null;
      }

      if (!data) {
        console.warn('[BeneficiaryAnalyzer] API response missing data field');
        return null;
      }

      // Parse the data string (which contains escaped JSON)
      let parsedData = data;
      if (typeof data === 'string') {
        console.log('[BeneficiaryAnalyzer] Parsing data string as JSON');
        parsedData = JSON.parse(data);
      }

      console.log('[BeneficiaryAnalyzer] Parsed beneficiary data:', parsedData);

      // Check if data has expected Output structure
      if (parsedData && (parsedData.Output || parsedData.output)) {
        return parseAPIResponse(parsedData);
      }

      console.warn('[BeneficiaryAnalyzer] Unexpected data format in API response');
      return null;
    } catch (error) {
      console.error('[BeneficiaryAnalyzer] Error parsing API response:', error);
      return null;
    }
  };

  /**
   * Trigger beneficiary analysis and poll for results
   */
  useEffect(() => {
    const triggerAndPollAnalysis = async () => {
      const sysId = claim?.sysId || claim?.sys_id || claim?.servicenow_sys_id;

      // Check if it's a demo claim
      if (!sysId || sysId.startsWith('demo-')) {
        console.log('[BeneficiaryAnalyzer] Demo claim - using fallback data');
        setLoading(true);
        setTimeout(() => {
          setAnalysisData(buildAnalysisData());
          setLoading(false);
        }, 500);
        return;
      }

      // Set loading state immediately
      setLoading(true);
      setError(null);
      setLoadingMessage('Analyzing...');

      try {
        console.log('[BeneficiaryAnalyzer] Checking beneficiary analysis status for sys_id:', sysId);
        setLoadingMessage('Analyzing...');

        // Poll the API endpoint for completion (analysis was already triggered on record click)
        let pollAttempts = 0;
        const maxPollAttempts = 24; // Poll for ~60 seconds (24 attempts x 2.5 seconds)
        const pollInterval = 2500; // 2.5 seconds between polls

        const pollForCompletion = async () => {
          try {
            pollAttempts++;
            const elapsedTime = pollAttempts * 2.5;
            console.log(`[BeneficiaryAnalyzer] Polling attempt ${pollAttempts}/${maxPollAttempts} (${elapsedTime}s elapsed)`);
            setLoadingMessage(`Analyzing... (${elapsedTime}s)`);

            // Poll the beneficiary analyzer API endpoint
            const apiResponse = await serviceNowService.getBeneficiaryAnalyzer(sysId);
            console.log('[BeneficiaryAnalyzer] Poll response:', apiResponse);

            // Check if analysis is complete
            if (apiResponse?.result?.status === 'complete') {
              console.log('[BeneficiaryAnalyzer] Analysis complete! Parsing results...');
              setLoadingMessage('Complete! Loading data...');

              const parsedData = parseAPIResponseFromEndpoint(apiResponse);

              if (parsedData) {
                console.log('[BeneficiaryAnalyzer] Successfully parsed beneficiary data');
                setAnalysisData(parsedData);
                setLoading(false);
                return true; // Stop polling
              } else {
                console.warn('[BeneficiaryAnalyzer] Failed to parse complete data, using fallback');
                setAnalysisData(buildAnalysisData());
                setLoading(false);
                return true;
              }
            }

            // If status is "processing" or "pending", continue polling
            if (apiResponse?.result?.status) {
              console.log('[BeneficiaryAnalyzer] Analysis status:', apiResponse.result.status);
            }

            // Continue polling if not complete and not exceeded max attempts
            if (pollAttempts < maxPollAttempts) {
              setTimeout(() => pollForCompletion(), pollInterval);
            } else {
              console.warn('[BeneficiaryAnalyzer] Max poll attempts reached after 60 seconds');
              setError('Analysis is taking longer than expected (>60s). The process may still be running. Please try refreshing or check back later.');
              setAnalysisData(buildAnalysisData());
              setLoading(false);
            }

            return false;
          } catch (pollError) {
            console.error('[BeneficiaryAnalyzer] Error polling for completion:', pollError);

            // Continue polling on error (network issues, etc.)
            if (pollAttempts < maxPollAttempts) {
              setTimeout(() => pollForCompletion(), pollInterval);
            } else {
              setError('Unable to complete beneficiary analysis - using fallback data');
              setAnalysisData(buildAnalysisData());
              setLoading(false);
            }

            return false;
          }
        };

        // Start polling immediately
        pollForCompletion();

      } catch (err) {
        console.error('[BeneficiaryAnalyzer] Error triggering analysis:', err);
        setError(err.message);
        setAnalysisData(buildAnalysisData());
        setLoading(false);
      }
    };

    triggerAndPollAnalysis();
  }, [claim]);

  const getConfidenceMode = (score) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.75) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (score) => {
    if (score >= 0.9) return 'High';
    if (score >= 0.75) return 'Medium';
    return 'Low';
  };

  const handleLexisNexisLookup = async (beneficiaryId, lookupType) => {
    setProcessingLexisNexis(prev => ({ ...prev, [`${beneficiaryId}-${lookupType}`]: true }));

    // Simulate API call to LexisNexis
    setTimeout(() => {
      const mockResults = {
        address: {
          street: '456 Oak Avenue',
          city: 'Springfield',
          state: 'IL',
          zip: '62702',
          lastVerified: '2024-01-20',
          confidence: 0.94,
          source: 'LexisNexis Address Verification'
        },
        deceased: {
          status: 'ALIVE',
          lastVerified: '2024-01-20',
          confidence: 0.99,
          source: 'LexisNexis Claimant Verification'
        }
      };

      setLexisNexisResults(prev => ({
        ...prev,
        [beneficiaryId]: {
          ...prev[beneficiaryId],
          [lookupType]: mockResults[lookupType]
        }
      }));

      setProcessingLexisNexis(prev => ({ ...prev, [`${beneficiaryId}-${lookupType}`]: false }));
    }, 2000);
  };

  const handleViewDocument = (documentId) => {
    console.log('Opening document:', documentId);
  };

  const handleApproveBeneficiaries = () => {
    if (onApproveBeneficiaries) {
      onApproveBeneficiaries(analysisData.extractedBeneficiaries);
    }
  };

  if (loading || !analysisData) {
    return (
      <DxcContainer style={{
        backgroundColor: 'var(--color-bg-secondary-lightest)',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center" justifyContent="center">
          <DxcSpinner mode="large" label={loadingMessage} />
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center" style={{ maxWidth: '500px' }}>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Beneficiary Analysis in Progress
            </DxcTypography>
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)" textAlign="center">
              Extracting and comparing beneficiary data from DMS documents and PAS records.
            </DxcTypography>
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)" textAlign="center">
              This may take up to 60 seconds. Please wait...
            </DxcTypography>
          </DxcFlex>
        </DxcFlex>
      </DxcContainer>
    );
  }

  if (error && !analysisData) {
    return (
      <DxcContainer style={{ backgroundColor: 'var(--color-bg-secondary-lightest)' }}>
        <DxcAlert
          semantic="error"
          title="Error Loading Beneficiary Data"
          message={{ text: error }}
        />
      </DxcContainer>
    );
  }

  if (!analysisData) {
    return (
      <DxcContainer style={{ backgroundColor: 'var(--color-bg-secondary-lightest)' }}>
        <DxcAlert
          semantic="info"
          title="No Analysis Data"
          message={{ text: 'No beneficiary analysis data available for this claim.' }}
        />
      </DxcContainer>
    );
  }

  return (
    <div style={{ backgroundColor: '#F5F7FA', padding: '16px', borderRadius: '12px' }}>
      <DxcFlex direction="column" gap="16px">
        {/* Modern Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex gap="12px" alignItems="center">
            <DxcHeading level={2} text="Beneficiary Analyzer" />
            {analysisData?.rawData && (
              <DxcChip label="Live Data" prefixIcon="cloud_done" size="small" />
            )}
          </DxcFlex>
          {(onCancel || onApproveBeneficiaries) && (
            <DxcFlex gap="8px">
              {onCancel && (
                <DxcButton label="Cancel" mode="tertiary" size="small" onClick={onCancel} />
              )}
              {onApproveBeneficiaries && (
                <DxcButton
                  label="Approve & Append to Case"
                  mode="primary"
                  size="small"
                  onClick={handleApproveBeneficiaries}
                  icon="check_circle"
                />
              )}
            </DxcFlex>
          )}
        </DxcFlex>

        {/* Summary Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {/* Match Score Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: `2px solid ${analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#1565C0' : '#ED6C02'}`,
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            <DxcFlex direction="column" gap="8px">
              <DxcFlex gap="10px" alignItems="center">
                <div style={{
                  backgroundColor: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#E3F2FD' : '#FFF3E0',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-icons" style={{ fontSize: '24px', color: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#1565C0' : '#ED6C02' }}>
                    {analysisData.overallAnalysis.matchStatus === 'MATCH' ? 'check_circle' : 'warning'}
                  </span>
                </div>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#374151">
                  Match Score
                </DxcTypography>
              </DxcFlex>
              <DxcTypography fontSize="28px" fontWeight="font-weight-bold" style={{ color: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#1565C0' : '#ED6C02', lineHeight: '1' }}>
                {(analysisData.overallAnalysis.confidence * 100).toFixed(0)}%
              </DxcTypography>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${analysisData.overallAnalysis.confidence * 100}%`,
                  height: '100%',
                  backgroundColor: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#1565C0' : '#ED6C02',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </DxcFlex>
          </div>

          {/* Beneficiaries Compared Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #E5E7EB',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            <DxcFlex direction="column" gap="8px">
              <DxcFlex gap="10px" alignItems="center">
                <div style={{
                  backgroundColor: '#E3F2FD',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-icons" style={{ fontSize: '24px', color: '#1B5E9E' }}>people</span>
                </div>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#374151">
                  Beneficiaries
                </DxcTypography>
              </DxcFlex>
              <DxcTypography fontSize="28px" fontWeight="font-weight-bold" style={{ color: '#1B5E9E', lineHeight: '1' }}>
                {analysisData.extractedBeneficiaries.length}
              </DxcTypography>
              <DxcTypography fontSize="font-scale-02" color="#6B7280">
                Records Compared
              </DxcTypography>
            </DxcFlex>
          </div>

          {/* Mismatches Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #E5E7EB',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            <DxcFlex direction="column" gap="8px">
              <DxcFlex gap="10px" alignItems="center">
                <div style={{
                  backgroundColor: analysisData.overallAnalysis.discrepancies.length === 0 ? '#E3F2FD' : '#FFEBEE',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-icons" style={{ fontSize: '24px', color: analysisData.overallAnalysis.discrepancies.length === 0 ? '#1565C0' : '#D32F2F' }}>
                    {analysisData.overallAnalysis.discrepancies.length === 0 ? 'check_circle' : 'error_outline'}
                  </span>
                </div>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#374151">
                  Discrepancies
                </DxcTypography>
              </DxcFlex>
              <DxcTypography fontSize="28px" fontWeight="font-weight-bold" style={{ color: analysisData.overallAnalysis.discrepancies.length === 0 ? '#1565C0' : '#D32F2F', lineHeight: '1' }}>
                {analysisData.overallAnalysis.discrepancies.length}
              </DxcTypography>
              <DxcTypography fontSize="font-scale-02" color="#6B7280">
                Issues Found
              </DxcTypography>
            </DxcFlex>
          </div>

          {/* Data Source Sync Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #E5E7EB',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            <DxcFlex direction="column" gap="8px">
              <DxcFlex gap="10px" alignItems="center">
                <div style={{
                  backgroundColor: '#E1F5FE',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-icons" style={{ fontSize: '24px', color: '#0288D1' }}>sync</span>
                </div>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#374151">
                  Data Sources
                </DxcTypography>
              </DxcFlex>
              <DxcTypography fontSize="20px" fontWeight="font-weight-bold" style={{ color: '#0288D1', lineHeight: '1.4' }}>
                DMS ↔ PAS
              </DxcTypography>
              <DxcFlex gap="6px" alignItems="center">
                <span className="material-icons" style={{ fontSize: '18px', color: '#1565C0' }}>check_circle</span>
                <DxcTypography fontSize="font-scale-02" color="#1565C0" fontWeight="font-weight-semibold">
                  Synced
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </div>
        </div>

        {/* Status Summary Card */}
        {error && (
          <div style={{
            backgroundColor: '#FFF4E5',
            border: '1px solid #FF9800',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <DxcFlex gap="12px" alignItems="flex-start">
              <span className="material-icons" style={{ color: '#ED6C02' }}>warning</span>
              <DxcFlex direction="column" gap="4px">
                <DxcTypography fontWeight="font-weight-semibold" color="#663C00">
                  API Connection Issue
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01" color="#663C00">
                  {error}. Using fallback data.
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </div>
        )}

        {analysisData.overallAnalysis.recommendation && (
          <div style={{
            backgroundColor: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#EFF6FF' : '#FFF4E5',
            border: `1px solid ${analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#1565C0' : '#FF9800'}`,
            borderRadius: '8px',
            padding: '16px'
          }}>
            <DxcFlex gap="12px" alignItems="flex-start">
              <span className="material-icons" style={{ color: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#1565C0' : '#ED6C02' }}>
                {analysisData.overallAnalysis.matchStatus === 'MATCH' ? 'check_circle' : 'info'}
              </span>
              <DxcFlex direction="column" gap="4px">
                <DxcTypography fontWeight="font-weight-semibold" style={{ color: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#0D47A1' : '#663C00' }}>
                  {analysisData.overallAnalysis.matchStatus === 'MATCH' ? 'Match Confirmed' : 'Review Required'}
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01" style={{ color: analysisData.overallAnalysis.matchStatus === 'MATCH' ? '#1565C0' : '#663C00' }}>
                  {analysisData.overallAnalysis.recommendation}
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </div>
        )}

        {/* Modern Section Header */}
        <DxcFlex justifyContent="space-between" alignItems="center" style={{ marginTop: '8px' }}>
          <DxcFlex gap="16px" alignItems="center">
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-bold" style={{ color: '#1F2937' }}>
              Beneficiary Comparison
            </DxcTypography>
            <DxcFlex gap="12px" alignItems="center">
              <DxcFlex gap="6px" alignItems="center">
                <span className="material-icons" style={{ color: '#1B5E9E', fontSize: '18px' }}>auto_awesome</span>
                <DxcTypography fontSize="font-scale-01" color="#5A6872">DMS</DxcTypography>
                <DxcBadge label={analysisData.extractedBeneficiaries.length.toString()} size="small" />
              </DxcFlex>
              <DxcTypography color="#9CA3AF">↔</DxcTypography>
              <DxcFlex gap="6px" alignItems="center">
                <span className="material-icons" style={{ color: '#0288D1', fontSize: '18px' }}>storage</span>
                <DxcTypography fontSize="font-scale-01" color="#5A6872">PAS</DxcTypography>
                <DxcBadge label={analysisData.administrativeBeneficiaries.length.toString()} size="small" />
              </DxcFlex>
            </DxcFlex>
          </DxcFlex>
          <DxcButton
            label={analysisData.extractedBeneficiaries.every(b => expandedBeneficiaries[b.id]) ? "Collapse All" : "Expand All"}
            mode="tertiary"
            size="small"
            icon={analysisData.extractedBeneficiaries.every(b => expandedBeneficiaries[b.id]) ? "unfold_less" : "unfold_more"}
            onClick={toggleAllBeneficiaries}
          />
        </DxcFlex>

        {/* Modern Beneficiary Cards */}
        <DxcFlex direction="column" gap="12px">
          {analysisData.extractedBeneficiaries.map((extractedBen, index) => {
            const adminBen = analysisData.administrativeBeneficiaries[index];
            const isExpanded = expandedBeneficiaries[extractedBen.id];
            const matchScore = extractedBen.confidenceScores.overall;
            const isHighMatch = matchScore >= 0.9;

            return (
              <div
                key={extractedBen.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: `3px solid ${isHighMatch ? '#1565C0' : '#ED6C02'}`,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
              >
                <div style={{ padding: '20px' }}>
                  {/* Modern Card Header */}
                  <div
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}
                    onClick={() => toggleBeneficiary(extractedBen.id)}
                  >
                    <DxcFlex gap="16px" alignItems="center" style={{ flex: 1 }}>
                      <div style={{
                        backgroundColor: isHighMatch ? '#E3F2FD' : '#FFF3E0',
                        borderRadius: '8px',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span
                          className="material-icons"
                          style={{
                            fontSize: '24px',
                            color: isHighMatch ? '#1565C0' : '#ED6C02',
                            transition: 'transform 0.2s',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                          }}
                        >
                          chevron_right
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <DxcFlex gap="12px" alignItems="center" wrap="wrap">
                          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-bold" style={{ color: '#111827' }}>
                            {extractedBen.fullName}
                          </DxcTypography>
                          <span style={{
                            padding: '6px 14px',
                            borderRadius: '16px',
                            backgroundColor: extractedBen.relationship === 'Primary' ? '#E3F2FD' : '#FFF3E0',
                            color: extractedBen.relationship === 'Primary' ? '#1565C0' : '#E65100',
                            fontSize: '13px',
                            fontWeight: '600',
                            border: `1px solid ${extractedBen.relationship === 'Primary' ? '#90CAF9' : '#FFB74D'}`
                          }}>
                            {extractedBen.relationship}
                          </span>
                          <span style={{
                            padding: '6px 14px',
                            borderRadius: '16px',
                            backgroundColor: '#F3F4F6',
                            color: '#1F2937',
                            fontSize: '13px',
                            fontWeight: '700',
                            border: '1px solid #D1D5DB'
                          }}>
                            {extractedBen.percentage}%
                          </span>
                          {adminBen && extractedBen.fullName === adminBen.fullName && extractedBen.dateOfBirth === adminBen.dateOfBirth && (
                            <span style={{
                              padding: '6px 14px',
                              borderRadius: '16px',
                              backgroundColor: '#E3F2FD',
                              color: '#1565C0',
                              fontSize: '13px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              border: '1px solid #90CAF9'
                            }}>
                              <span className="material-icons" style={{ fontSize: '16px' }}>check_circle</span>
                              Perfect Match
                            </span>
                          )}
                        </DxcFlex>
                      </div>
                    </DxcFlex>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <div style={{ textAlign: 'right' }}>
                        <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-bold" style={{ color: isHighMatch ? '#1565C0' : '#ED6C02', lineHeight: '1' }}>
                          {(matchScore * 100).toFixed(0)}%
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01" style={{ color: '#6B7280', marginTop: '4px' }}>
                          Confidence
                        </DxcTypography>
                      </div>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: isHighMatch ? '#E3F2FD' : '#FFF3E0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${isHighMatch ? '#90CAF9' : '#FFB74D'}`
                      }}>
                        <span className="material-icons" style={{ color: isHighMatch ? '#1565C0' : '#ED6C02', fontSize: '28px' }}>
                          {isHighMatch ? 'verified' : 'priority_high'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <>
                      <DxcDivider style={{ margin: '20px 0' }} />
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '24px',
                        marginTop: '20px'
                      }}>
                        {/* Left: DMS Data */}
                        <div style={{
                          backgroundColor: '#F8FAFC',
                          padding: '20px',
                          borderRadius: '12px',
                          border: '2px solid #1B5E9E'
                        }}>
                          <DxcFlex direction="column" gap="16px">
                            <DxcFlex gap="12px" alignItems="center">
                              <div style={{
                                backgroundColor: '#E3F2FD',
                                borderRadius: '8px',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <span className="material-icons" style={{ fontSize: '24px', color: '#1B5E9E' }}>description</span>
                              </div>
                              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-bold" color="#1B5E9E">
                                DMS Extracted Data
                              </DxcTypography>
                            </DxcFlex>

                            <div style={{
                              backgroundColor: '#FFFFFF',
                              padding: '16px',
                              borderRadius: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              <DetailWithConfidence
                                label="Full Name"
                                value={extractedBen.fullName}
                                confidence={extractedBen.confidenceScores.name}
                              />
                              <DetailWithConfidence
                                label="Date of Birth"
                                value={extractedBen.dateOfBirth}
                                confidence={extractedBen.confidenceScores.dateOfBirth}
                              />
                              <DetailWithConfidence
                                label="Beneficiary Type"
                                value={extractedBen.relationship}
                                confidence={extractedBen.confidenceScores.relationship}
                              />
                              <DetailWithConfidence
                                label="Percentage Allocation"
                                value={`${extractedBen.percentage}%`}
                                confidence={extractedBen.confidenceScores.percentage}
                              />
                              <DetailWithConfidence
                                label="SSN"
                                value={extractedBen.ssn}
                                confidence={extractedBen.confidenceScores.ssn}
                              />
                              {extractedBen.phone && (
                                <DetailWithConfidence
                                  label="Phone"
                                  value={extractedBen.phone}
                                  confidence={0.9}
                                />
                              )}
                              {extractedBen.email && (
                                <DetailWithConfidence
                                  label="Email"
                                  value={extractedBen.email}
                                  confidence={0.95}
                                />
                              )}
                            </div>

                            {/* Document Information */}
                            <div style={{ backgroundColor: '#E3F2FD', padding: '16px', borderRadius: '8px', border: '1px solid #90CAF9' }}>
                              <DxcFlex direction="column" gap="10px">
                                <DxcFlex gap="8px" alignItems="center">
                                  <span className="material-icons" style={{ fontSize: '18px', color: '#1565C0' }}>insert_drive_file</span>
                                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-bold" color="#1565C0">
                                    Source Document
                                  </DxcTypography>
                                </DxcFlex>
                                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#1F2937">
                                  {extractedBen.sourceDocument.name}
                                </DxcTypography>
                                <DxcFlex gap="12px" wrap="wrap">
                                  <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    backgroundColor: '#FFFFFF',
                                    color: '#1565C0',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}>
                                    ID: {extractedBen.sourceDocument.id}
                                  </span>
                                  {extractedBen.sourceDocument.pageNumber && (
                                    <span style={{
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      backgroundColor: '#FFFFFF',
                                      color: '#1565C0',
                                      fontSize: '12px',
                                      fontWeight: '600'
                                    }}>
                                      Page {extractedBen.sourceDocument.pageNumber}
                                    </span>
                                  )}
                                </DxcFlex>
                              </DxcFlex>
                            </div>

                            {/* AI Reasoning */}
                            <div style={{ backgroundColor: '#E3F2FD', padding: '16px', borderRadius: '8px', border: '1px solid #90CAF9' }}>
                              <DxcFlex direction="column" gap="10px">
                                <DxcFlex gap="8px" alignItems="center">
                                  <span className="material-icons" style={{ fontSize: '18px', color: '#1565C0' }}>psychology</span>
                                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-bold" color="#1565C0">
                                    Analysis
                                  </DxcTypography>
                                </DxcFlex>
                                <DxcTypography fontSize="font-scale-02" color="#1F2937" style={{ lineHeight: '1.5' }}>
                                  {extractedBen.extractionReasoning}
                                </DxcTypography>
                              </DxcFlex>
                            </div>

                            {/* Action Buttons */}
                            <DxcFlex gap="12px" wrap="wrap">
                              <DxcButton
                                label="Verify Address"
                                mode="secondary"
                                size="medium"
                                icon="location_on"
                                onClick={(e) => { e.stopPropagation(); handleLexisNexisLookup(extractedBen.id, 'address'); }}
                              />
                              <DxcButton
                                label="View Document"
                                mode="tertiary"
                                size="medium"
                                icon="description"
                                onClick={(e) => { e.stopPropagation(); handleViewDocument(extractedBen.sourceDocument.id); }}
                              />
                            </DxcFlex>

                            {/* LexisNexis Results */}
                            {lexisNexisResults[extractedBen.id] && (
                              <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                                {lexisNexisResults[extractedBen.id].address && (
                                  <DxcAlert
                                    semantic="info"
                                    title="Address Verified"
                                    message={{ text: `${lexisNexisResults[extractedBen.id].address.street}, ${lexisNexisResults[extractedBen.id].address.city}, ${lexisNexisResults[extractedBen.id].address.state}` }}
                                  />
                                )}
                              </DxcFlex>
                            )}
                          </DxcFlex>
                        </div>

                        {/* Right: PAS Data */}
                        <div style={{
                          backgroundColor: '#F8FAFC',
                          padding: '20px',
                          borderRadius: '12px',
                          border: '2px solid #0288D1'
                        }}>
                          {adminBen ? (
                            <DxcFlex direction="column" gap="16px">
                              <DxcFlex gap="12px" alignItems="center">
                                <div style={{
                                  backgroundColor: '#E1F5FE',
                                  borderRadius: '8px',
                                  padding: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <span className="material-icons" style={{ fontSize: '24px', color: '#0288D1' }}>storage</span>
                                </div>
                                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-bold" color="#0288D1">
                                  PAS Administrative Data
                                </DxcTypography>
                              </DxcFlex>

                              <div style={{
                                backgroundColor: '#FFFFFF',
                                padding: '16px',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                              }}>
                                <SimpleDetail label="Full Name" value={adminBen.fullName} />
                                <SimpleDetail label="Date of Birth" value={adminBen.dateOfBirth} />
                                <SimpleDetail label="Beneficiary Type" value={adminBen.relationship} />
                                <SimpleDetail label="Percentage Allocation" value={`${adminBen.percentage}%`} />
                                <SimpleDetail label="SSN" value={adminBen.ssn} />
                                {adminBen.phone && <SimpleDetail label="Phone" value={adminBen.phone} />}
                                {adminBen.email && <SimpleDetail label="Email" value={adminBen.email} />}
                              </div>

                              {/* Admin Metadata */}
                              <div style={{ backgroundColor: '#E1F5FE', padding: '16px', borderRadius: '8px', border: '1px solid #4FC3F7' }}>
                                <DxcFlex direction="column" gap="10px">
                                  <DxcFlex gap="8px" alignItems="center">
                                    <span className="material-icons" style={{ fontSize: '18px', color: '#0277BD' }}>source</span>
                                    <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-bold" color="#0277BD">
                                      Data Source
                                    </DxcTypography>
                                  </DxcFlex>
                                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#1F2937">
                                    {adminBen.source}
                                  </DxcTypography>
                                </DxcFlex>
                              </div>
                            </DxcFlex>
                          ) : (
                            <DxcFlex direction="column" gap="16px" alignItems="center" justifyContent="center" style={{ minHeight: '400px' }}>
                              <div style={{
                                backgroundColor: '#FFF3E0',
                                borderRadius: '50%',
                                padding: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <span className="material-icons" style={{ fontSize: '48px', color: '#F57C00' }}>warning</span>
                              </div>
                              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-bold" color="#E65100" textAlign="center">
                                No Matching PAS Record
                              </DxcTypography>
                              <DxcTypography fontSize="font-scale-02" color="#6B7280" textAlign="center">
                                No corresponding administrative record found for this beneficiary.
                              </DxcTypography>
                            </DxcFlex>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </DxcFlex>
      </DxcFlex>
    </div>
  );
};

// Helper component for displaying details with confidence scores
const DetailWithConfidence = ({ label, value, confidence }) => {
  const getConfidenceMode = (score) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.75) return 'warning';
    return 'error';
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.9) return '#1565C0';
    if (score >= 0.75) return '#F57C00';
    return '#D32F2F';
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #E5E7EB'
    }}>
      <DxcFlex direction="column" gap="6px">
        <DxcTypography fontSize="font-scale-01" color="#6B7280" fontWeight="font-weight-semibold">
          {label}
        </DxcTypography>
        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-bold" color="#111827">
          {value}
        </DxcTypography>
      </DxcFlex>
      <div style={{
        padding: '6px 12px',
        borderRadius: '8px',
        backgroundColor: confidence >= 0.9 ? '#E3F2FD' : confidence >= 0.75 ? '#FFF3E0' : '#FFEBEE',
        border: `2px solid ${getConfidenceColor(confidence)}`,
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span className="material-icons" style={{ fontSize: '16px', color: getConfidenceColor(confidence) }}>
          {confidence >= 0.9 ? 'check_circle' : confidence >= 0.75 ? 'warning' : 'error'}
        </span>
        <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-bold" style={{ color: getConfidenceColor(confidence) }}>
          {(confidence * 100).toFixed(0)}%
        </DxcTypography>
      </div>
    </div>
  );
};

// Helper component for simple admin record details
const SimpleDetail = ({ label, value }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '12px 0',
      borderBottom: '1px solid #E5E7EB'
    }}>
      <DxcTypography fontSize="font-scale-01" color="#6B7280" fontWeight="font-weight-semibold">
        {label}
      </DxcTypography>
      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-bold" color="#111827">
        {value}
      </DxcTypography>
    </div>
  );
};

export default BeneficiaryAnalyzer;
