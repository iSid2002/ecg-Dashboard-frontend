import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
  Slider,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [loading, setLoading] = useState({
    generateECG: false,
    trainModel: false,
    viewChart: false,
    calculateRisk: false,
  });
  const [error, setError] = useState(null);
  const [ecgData, setEcgData] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [ecgChart, setEcgChart] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [abnormalityLevel, setAbnormalityLevel] = useState(0.5);

  const handleGenerateECG = async () => {
    setLoading(prev => ({ ...prev, generateECG: true }));
    setError(null);
    try {
      const response = await axios.post('/api/generate-ecg');
      setEcgData(response.data);
    } catch (err) {
      setError('Failed to generate ECG data');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, generateECG: false }));
    }
  };

  const handleTrainModel = async () => {
    setLoading(prev => ({ ...prev, trainModel: true }));
    setError(null);
    try {
      const response = await axios.post('/api/train-model');
      setModelMetrics(response.data);
    } catch (err) {
      setError('Failed to train model');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, trainModel: false }));
    }
  };

  const handleCalculateRisk = async () => {
    if (!ecgData) {
      setError('Please generate ECG data first');
      return;
    }
    
    setLoading(prev => ({ ...prev, calculateRisk: true }));
    setError(null);
    try {
      const ecgSignal = activeTab === 0 ? ecgData.normal_ecg : ecgData.abnormal_ecg;
      const response = await axios.post('/api/calculate-heart-failure-risk', ecgSignal);
      setRiskData(response.data);
    } catch (err) {
      setError('Failed to calculate heart failure risk');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, calculateRisk: false }));
    }
  };

  const handleViewChart = async () => {
    setLoading(prev => ({ ...prev, viewChart: true }));
    setError(null);
    try {
      const response = await axios.get('/api/plot-ecg');
      setEcgChart(response.data);
    } catch (err) {
      setError('Failed to fetch ECG chart');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, viewChart: false }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setRiskData(null); // Clear risk data when switching tabs
  };

  const handleAbnormalityLevelChange = async (event, newValue) => {
    setAbnormalityLevel(newValue);
    try {
      await axios.post('/api/set-abnormality-level', { level: newValue });
    } catch (err) {
      setError('Failed to set abnormality level');
      console.error(err);
    }
  };

  // Create chart data only when ecgData is available
  const chartData = ecgData ? ecgData.time.map((time, index) => ({
    time,
    amplitude: activeTab === 0 ? ecgData.normal_ecg[index] : ecgData.abnormal_ecg[index]
  })) : [];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Action Buttons */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleGenerateECG}
                  disabled={loading.generateECG}
                >
                  {loading.generateECG ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Generate ECG'
                  )}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleTrainModel}
                  disabled={loading.trainModel}
                >
                  {loading.trainModel ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Train Model'
                  )}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCalculateRisk}
                  disabled={loading.calculateRisk || !ecgData}
                >
                  {loading.calculateRisk ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Calculate Heart Failure Risk'
                  )}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleViewChart}
                  disabled={loading.viewChart}
                >
                  {loading.viewChart ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'View ECG Chart'
                  )}
                </Button>
              </Box>
              
              {/* Abnormality Level Slider */}
              <Box sx={{ width: '100%', maxWidth: 400 }}>
                <Typography gutterBottom>
                  Abnormality Level: {(abnormalityLevel * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={abnormalityLevel}
                  onChange={handleAbnormalityLevelChange}
                  min={0}
                  max={1}
                  step={0.01}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 0.5, label: '50%' },
                    { value: 1, label: '100%' }
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ECG Data Display */}
        {ecgData && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ECG Data
                </Typography>
                <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                  <Tab label="Normal ECG" />
                  <Tab label="Abnormal ECG" />
                </Tabs>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amplitude"
                        stroke="#8884d8"
                        name="ECG Signal"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Signal Type: {activeTab === 0 ? 'Normal' : 'Abnormal'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Risk Assessment */}
        {riskData && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Heart Failure Risk Assessment
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" color={
                    riskData.risk_level === "High" ? "error" :
                    riskData.risk_level === "Moderate" ? "warning.main" : "success.main"
                  }>
                    {riskData.heart_failure_probability}% Risk
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Risk Level: {riskData.risk_level}
                  </Typography>
                </Box>
                {riskData.risk_factors.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Risk Factors:
                    </Typography>
                    <ul>
                      {riskData.risk_factors.map((factor, index) => (
                        <li key={index}>
                          <Typography variant="body2">{factor}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Recommendations:
                  </Typography>
                  <ul>
                    {riskData.recommendations.map((rec, index) => (
                      <li key={index}>
                        <Typography variant="body2">{rec}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Model Metrics */}
        {modelMetrics && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Model Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Accuracy
                      </Typography>
                      <Typography variant="h6">
                        {(modelMetrics.accuracy * 100).toFixed(2)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        F1 Score
                      </Typography>
                      <Typography variant="h6">
                        {(modelMetrics.f1 * 100).toFixed(2)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ROC AUC
                      </Typography>
                      <Typography variant="h6">
                        {(modelMetrics.roc_auc * 100).toFixed(2)}%
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* ECG Chart */}
        {ecgChart && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ECG Chart
                </Typography>
                <Box
                  component="img"
                  src={`data:image/png;base64,${ecgChart}`}
                  alt="ECG Chart"
                  sx={{
                    width: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard; 