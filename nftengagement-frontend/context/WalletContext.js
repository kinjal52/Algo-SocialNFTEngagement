'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const peraWallet = new PeraWalletConnect({ network: 'testnet' });

  const connectWallet = async () => {
    try {
      const accounts = await peraWallet.connect();
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await peraWallet.disconnect();
      setAccount(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  useEffect(() => {
    peraWallet.reconnectSession().then(accounts => {
      if (accounts.length) setAccount(accounts[0]);
    }).catch(err => console.log('Reconnect failed:', err));
  }, []);

  return (
    <WalletContext.Provider value={{ account, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}