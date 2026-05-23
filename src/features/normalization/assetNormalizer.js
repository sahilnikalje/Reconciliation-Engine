const assetAliases = {
  btc: "Bitcoin",
  bitcoin: "Bitcoin",
  eth: "Ethereum",
  ethereum: "Ethereum",
  usdt: "Tether",
  tether: "Tether",
  bnb: "BinanceCoin",
  binancecoin: "BinanceCoin",
  sol: "Solana",
  solana: "Solana",
  xrp: "XRP",
  doge: "Dogecoin",
  dogecoin: "Dogecoin",
};

const normalizeAsset = (asset) => {
  if (!asset) return null;
  const key = asset.trim().toLowerCase();
  return assetAliases[key] || asset.trim();
};

module.exports = { normalizeAsset }