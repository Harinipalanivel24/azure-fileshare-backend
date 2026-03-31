const appInsights = require('applicationinsights');

const initMonitor = () => {
  const connString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!connString || connString === 'YOUR_VALUE_HERE') {
    console.warn('⚠️  Application Insights not configured — monitoring skipped.');
    return;
  }
  appInsights
    .setup(connString)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setSendLiveMetrics(true)
    .start();
  console.log('✅ Azure Monitor / Application Insights started.');
};

module.exports = { initMonitor };
