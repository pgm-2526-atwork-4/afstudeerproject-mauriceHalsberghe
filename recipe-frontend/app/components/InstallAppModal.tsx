import AppleLogo from "@/public/apple_logo.svg"
import AndroidLogo from "@/public/android_logo.svg"
import WindowsLogo from "@/public/windows_logo.svg"
import CloseIcon from "@/public/cross.svg"

import ButtonStyles from '@/app/styles/components/button.module.css';
import InstallAppModalStyles from "@/app/styles/components/installappmodal.module.css"

import { useState } from 'react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  const [activeTab, setActiveTab] = useState('ios');

  if (!isOpen) return null;

  const tabs = [
    { id: 'ios', label: 'iOS', icon: AppleLogo },
    { id: 'android', label: 'Android', icon: AndroidLogo },
    { id: 'windows', label: 'Windows', icon: WindowsLogo },
    { id: 'macos', label: 'macOS', icon: AppleLogo },
  ];

  const instructions = {
    ios: {
      title: 'Install on iOS (iPhone/iPad)',
      steps: [
        {
          step: 1,
          title: 'Open Mealio in Safari',
        },
        {
          step: 2,
          title: 'Tap the Share button',
        },
        {
          step: 3,
          title: 'Press "Add to Home Screen"',
        },
        {
          step: 4,
          title: 'Confirm installation',
        },
      ],
    },
    android: {
      title: 'Install on Android',
      steps: [
        {
          step: 1,
          title: 'Open Mealio in Chrome',
        },
        {
          step: 2,
          title: 'Tap the menu (three dots)',
        },
        {
          step: 3,
          title: 'Select "Add to Home screen" or "Install app"',
        },
        {
          step: 4,
          title: 'Confirm installation',
        },
      ],
    },
    windows: {
      title: 'Install on Windows',
      steps: [
        {
          step: 1,
          title: 'Open Mealio in Chrome or Edge',
        },
        {
          step: 2,
          title: 'Click the install icon',
        },
        {
          step: 3,
          title: 'Click "Install"',
        },
        {
          step: 4,
          title: 'Launch the app',
        },
      ],
    },
    macos: {
      title: 'Install on macOS',
      steps: [
        {
          step: 1,
          title: 'Open Mealio in Chrome or Safari',
        },
        {
          step: 2,
          title: 'Chrome: Click the install icon. Safari: Go to Share > Add to Dock',
        },
        {
          step: 3,
          title: 'Click "Install"',
        },
        {
          step: 4,
          title: 'Launch from Dock',
        },
      ],
    },
  };

  const currentInstructions = instructions[activeTab as keyof typeof instructions];

  return (
    <div className={InstallAppModalStyles.modalOverlay}>
      <div className={InstallAppModalStyles.modal}>

        <div className={InstallAppModalStyles.header}>
          <h2 className={InstallAppModalStyles.title}>Install Mealio</h2>
          <button
            onClick={onClose}
            className={InstallAppModalStyles.close}
          >
            <CloseIcon />
          </button>
        </div>

        <div className={InstallAppModalStyles.options}>

          <div className={InstallAppModalStyles.nav}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${InstallAppModalStyles.option} ${
                    activeTab === tab.id
                      ? InstallAppModalStyles.optionCurrent
                      : ''
                  }`}
                >
                  <Icon className={InstallAppModalStyles.icon} />
                  <span className={InstallAppModalStyles.label}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={InstallAppModalStyles.content}>
          <h3 className={InstallAppModalStyles.subtitle}>
            {currentInstructions.title}
          </h3>

          <div className={InstallAppModalStyles.instructions}>
            {currentInstructions.steps.map((instruction) => (
              <div key={instruction.step} className={InstallAppModalStyles.instruction}>
                <div className={InstallAppModalStyles.number}>
                  {instruction.step}.
                </div>
                
                  <p className={InstallAppModalStyles.instructionText}>
                    {instruction.title}
                  </p>

              </div>
            ))}
          </div>

        </div>

        <button
            onClick={onClose}
            className={ButtonStyles.button}
        >
            Got it!
        </button>
      </div>
    </div>
  );
}
