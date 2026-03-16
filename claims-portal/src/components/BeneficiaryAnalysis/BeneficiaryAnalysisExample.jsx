/**
 * Beneficiary Analysis Example Component
 *
 * Demonstrates how to trigger and display beneficiary analysis
 * from ServiceNow worknotes using the corrected implementation
 */

import React, { useState } from 'react';
import beneficiaryAnalyzerService from '../../services/api/beneficiaryAnalyzerService';
import './BeneficiaryAnalysis.css';

const BeneficiaryAnalysisExample = ({ fnolSysId, claimNumber }) => {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [beneficiaryData, setBeneficiaryData] = useState(null);

  /**
   * Trigger complete beneficiary analysis workflow
   * 1. Gets data from worknotes
   * 2. Triggers analyzer subflow
   */
  const handleTriggerAnalysis = async () => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      console.log('Triggering beneficiary analysis for FNOL:', fnolSysId);

      // This method handles the complete workflow:
      // 1. Fetches beneficiary data from worknotes
      // 2. Triggers the ServiceNow subflow with correct parameters
      const result = await beneficiaryAnalyzerService.triggerServiceNowAnalysis(fnolSysId);

      setAnalysisResult(result);
      console.log('Analysis completed successfully:', result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch beneficiary data from worknotes only (no subflow trigger)
   */
  const handleFetchBeneficiaryData = async () => {
    setLoading(true);
    setError(null);
    setBeneficiaryData(null);

    try {
      console.log('Fetching beneficiary data from worknotes:', fnolSysId);

      const data = await beneficiaryAnalyzerService.getBeneficiaryDataFromServiceNow(fnolSysId);

      setBeneficiaryData(data);
      console.log('Beneficiary data retrieved:', data);
    } catch (err) {
      console.error('Failed to fetch beneficiary data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render beneficiary comparison results
   */
  const renderBeneficiaryComparison = () => {
    if (!beneficiaryData?.Output) return null;

    const output = beneficiaryData.Output;
    const dmsData = output.find(item => item.DMS)?.DMS || [];
    const pasData = output.find(item => item.PAS)?.PAS || [];
    const summary = output.find(item => item.Summary)?.Summary || '';
    const scoring = output.find(item => item.BeneScoring)?.BeneScoring || [];

    return (
      <div className="beneficiary-comparison">
        <h3>Beneficiary Analysis Results</h3>

        {/* Summary */}
        <div className="analysis-summary">
          <h4>Summary</h4>
          <p>{summary}</p>
        </div>

        {/* DMS vs PAS Comparison */}
        <div className="comparison-grid">
          <div className="comparison-section">
            <h4>DMS Beneficiaries</h4>
            {dmsData.map((bene, index) => (
              <div key={index} className="beneficiary-card">
                <p><strong>Name:</strong> {bene.FirstBeneficiaryName || bene.SecondBeneficiaryName || bene.ThirdBeneficiaryName || bene.FourthBeneficiaryName}</p>
                <p><strong>DOB:</strong> {bene.beneficiaryDOB}</p>
                <p><strong>Type:</strong> {bene.beneficiaryType}</p>
                <p><strong>Percentage:</strong> {bene.beneficiaryPercentage}</p>
              </div>
            ))}
          </div>

          <div className="comparison-section">
            <h4>PAS Beneficiaries</h4>
            {pasData.map((bene, index) => (
              <div key={index} className="beneficiary-card">
                <p><strong>Name:</strong> {bene.FirstBeneficiaryName || bene.SecondBeneficiaryName || bene.ThirdBeneficiaryName || bene.FourthBeneficiaryName}</p>
                <p><strong>DOB:</strong> {bene.beneficiaryDOB}</p>
                <p><strong>Type:</strong> {bene.beneficiaryType}</p>
                <p><strong>Percentage:</strong> {bene.beneficiaryPercentage}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring */}
        {scoring.length > 0 && (
          <div className="scoring-section">
            <h4>Match Scoring</h4>
            {scoring.map((score, index) => {
              // Check if it's a beneficiary score or total shares
              if (score.totalBeneficiaryShares) {
                return (
                  <div key={index} className="shares-summary">
                    <h5>Total Beneficiary Shares</h5>
                    {score.totalBeneficiaryShares.map((share, idx) => (
                      <div key={idx}>
                        {share.PrimaryShares && (
                          <p>
                            Primary: DMS {share.PrimaryShares.DMS} | PAS {share.PrimaryShares.PAS}
                            <span className={`match-badge ${share.PrimaryShares.Match === 'MATCH' ? 'match' : 'mismatch'}`}>
                              {share.PrimaryShares.Match}
                            </span>
                          </p>
                        )}
                        {share.ContingentShares && (
                          <p>
                            Contingent: DMS {share.ContingentShares.DMS} | PAS {share.ContingentShares.PAS}
                            <span className={`match-badge ${share.ContingentShares.Match === 'MATCH' ? 'match' : 'mismatch'}`}>
                              {share.ContingentShares.Match}
                            </span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              }

              // Individual beneficiary scoring
              const name = score.FirstBeneficiaryName || score.SecondBeneficiaryName ||
                          score.ThirdBeneficiaryName || score.FourthBeneficiaryName;

              return (
                <div key={index} className="score-card">
                  <p><strong>Name Match:</strong> <span className="score">{name || 'N/A'}</span></p>
                  <p><strong>DOB Match:</strong> <span className="score">{score.beneficiaryDOB}</span></p>
                  <p><strong>Percentage Match:</strong> <span className="score">{score.beneficiaryPercentage}</span></p>
                  <p><strong>Type Match:</strong> <span className="score">{score.beneficiaryType}</span></p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="beneficiary-analysis-container">
      <div className="analysis-header">
        <h2>Beneficiary Analysis</h2>
        <p>Claim: {claimNumber}</p>
        <p>FNOL Sys ID: {fnolSysId}</p>
      </div>

      <div className="analysis-actions">
        <button
          onClick={handleFetchBeneficiaryData}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Fetching...' : 'Fetch Beneficiary Data from Worknotes'}
        </button>

        <button
          onClick={handleTriggerAnalysis}
          disabled={loading}
          className="btn-secondary"
        >
          {loading ? 'Processing...' : 'Trigger Complete Analysis'}
        </button>
      </div>

      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Processing beneficiary analysis...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h4>Error</h4>
          <p>{error}</p>
        </div>
      )}

      {beneficiaryData && (
        <div className="analysis-results">
          <h3>Beneficiary Data from Worknotes</h3>
          {renderBeneficiaryComparison()}
        </div>
      )}

      {analysisResult && (
        <div className="analysis-results">
          <h3>Complete Analysis Results</h3>
          <div className="result-details">
            <p><strong>Status:</strong> {analysisResult.success ? '✓ Success' : '✗ Failed'}</p>
            <p><strong>FNOL:</strong> {analysisResult.fnolSysId}</p>

            {analysisResult.beneficiaryData && (
              <>
                <h4>Extracted Data:</h4>
                {renderBeneficiaryComparison()}
              </>
            )}

            {analysisResult.subflowResult && (
              <>
                <h4>Subflow Execution Result:</h4>
                <pre>{JSON.stringify(analysisResult.subflowResult, null, 2)}</pre>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BeneficiaryAnalysisExample;
