import React from 'react'
import { assets } from '../assets/assets';

function Footer() {
  return (
        <footer className="w-full  text-gray-800">
            <div className="max-w-7xl mx-auto px-6 py-2 flex flex-col items-center">
                <div className="flex items-center space-x-3 mb-6">
                    <img alt="logo" className="h-11"
                        src={assets.logo} />
                </div>
                <p className="text-center max-w-xl text-sm font-normal leading-relaxed">
                    Empowering creators worldwide with the most advanced AI content creation tools. Transform your ideas
                    into reality.
                </p>
            </div>
            <div className="border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-2 text-center text-sm font-normal">
                    <a href="https://prebuiltui.com">Axon Flow</a> ©2025. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer