import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-bg-secondary py-8 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <h4 className="font-heading font-bold tracking-tight text-primary text-sm">
            PanelGPT Debate Simulator
          </h4>
          <p className="text-xs text-muted">
            Final Year Major Project. All rights reserved. &copy; {new Date().getFullYear()}
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-secondary font-medium font-heading">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
