const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

let secretClient = null;

/**
 * Initialise the Azure Key Vault SecretClient.
 * Call this once during app startup.
 */
const initKeyVault = () => {
  const vaultUrl = process.env.KEY_VAULT_URL;
  if (!vaultUrl || vaultUrl === 'YOUR_VALUE_HERE') {
    console.warn('⚠️  KEY_VAULT_URL not set — Key Vault integration skipped.');
    return;
  }
  const credential = new DefaultAzureCredential();
  secretClient = new SecretClient(vaultUrl, credential);
  console.log('✅ Key Vault client initialised.');
};

/**
 * Retrieve a secret value from Azure Key Vault.
 * Returns null when Key Vault is not configured.
 */
const getSecret = async (secretName) => {
  if (!secretClient) return null;
  try {
    const secret = await secretClient.getSecret(secretName);
    return secret.value;
  } catch (err) {
    console.error(`❌ Failed to get secret "${secretName}":`, err.message);
    return null;
  }
};

module.exports = { initKeyVault, getSecret };
