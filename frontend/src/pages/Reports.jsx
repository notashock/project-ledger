import React from 'react';

export default function Reports() {
  return (
    <div className="p-container-margin flex-1 space-y-section-gap max-w-[1400px] mx-auto w-full">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant pb-8">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Analytics & Reports</h2>
          <p className="font-body-lg text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">assessment</span> Insights and performance metrics
          </p>
        </div>
      </section>
      <div className="bg-surface-container-lowest border-2 border-[#000000] p-12 text-center text-on-surface-variant flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-[48px] text-primary-container mb-4">analytics</span>
        <p className="font-body-lg text-on-surface">Analytics dashboard coming soon.</p>
      </div>
    </div>
  );
}
