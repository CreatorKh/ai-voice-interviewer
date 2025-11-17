import React, { useState } from 'react';
import { AppRoute } from '../types';
import Button from './Button';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface EarningsPageProps {
  setRoute: (r: AppRoute) => void;
}

type ModalState = 'closed' | 'provider' | 'country';

const EarningsPage: React.FC<EarningsPageProps> = ({ setRoute }) => {
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [selectedCountry, setSelectedCountry] = useState('United States');

  const payments: any[] = [];
  
  const countries = [
    "United States", "Canada", "United Kingdom", "Germany", "France", "Australia", 
    "Uzbekistan", "India", "Brazil", "Japan", "Nigeria", "South Africa"
  ];

  const renderModalContent = () => {
    if (modalState === 'provider') {
      return (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Select Payment Provider</h2>
          <p className="text-neutral-400 mb-6">For <span className="text-white font-medium">{selectedCountry}</span></p>
          <button onClick={() => setModalState('closed')} className="w-full text-left p-4 rounded-lg border border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
            <p className="font-bold text-white">Stripe</p>
            <p className="text-sm text-neutral-300">Fast, secure payments with instant payouts</p>
          </button>
          <Button variant="outline" className="w-full mt-4 py-3" onClick={() => setModalState('country')}>Change Country</Button>
        </div>
      );
    }

    if (modalState === 'country') {
      return (
        <div className="text-left">
          <div className="flex items-center mb-4">
            <button onClick={() => setModalState('provider')} className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white mr-2">
              <ArrowLeftIcon />
            </button>
            <h2 className="text-xl font-bold">Select Your Country</h2>
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto pr-2">
            {countries.map(country => (
              <button
                key={country}
                onClick={() => {
                  setSelectedCountry(country);
                  setModalState('provider');
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                {country}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return null;
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-neutral-400">Your total earnings to date are <span className="text-white font-semibold">$0.00</span>. <button onClick={() => setRoute({name: 'explore'})} className="text-cyan-400 hover:underline">Explore open roles →</button></p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 text-right sm:text-left">No payment method connected</p>
          <Button onClick={() => setModalState('provider')} className="bg-indigo-600 hover:bg-indigo-700 text-white mt-1 w-full sm:w-auto">Connect provider</Button>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
          <h3 className="font-semibold">Earnings Over Time</h3>
          <div className="flex items-center gap-2">
            <input type="text" readOnly value="Billing Date: Nov 1 - Nov 13, 2025" className="input-field text-sm w-48" />
            <select className="input-field text-sm w-32"><option>Contracts</option></select>
            <select className="input-field text-sm w-24"><option>Type</option></select>
          </div>
        </div>
        <div className="h-64 bg-black/20 rounded-lg flex items-center justify-center text-neutral-500">
          Chart Area
        </div>
        <div className="flex justify-end gap-4 text-xs mt-2 text-neutral-400">
            <span>Paid Earnings</span>
            <span>Pending Earnings</span>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="font-semibold mb-4">Payments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-400 uppercase border-b border-white/10">
              <tr>
                <th className="p-2 font-medium">Payout date</th>
                <th className="p-2 font-medium">Type</th>
                <th className="p-2 font-medium">Description</th>
                <th className="p-2 font-medium">Status</th>
                <th className="p-2 font-medium">Hours</th>
                <th className="p-2 font-medium text-right">Earned</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-neutral-500">
                    No payments yet.
                  </td>
                </tr>
              ) : (
                <></>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalState !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setModalState('closed')}>
          <div className="bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
            {renderModalContent()}
          </div>
        </div>
      )}

      <style>{`.input-field { background-color: rgb(38 38 38 / 1); border: 1px solid rgb(64 64 64 / 1); border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; line-height: 1.25rem; appearance: none; }`}</style>
    </div>
  );
};

export default EarningsPage;