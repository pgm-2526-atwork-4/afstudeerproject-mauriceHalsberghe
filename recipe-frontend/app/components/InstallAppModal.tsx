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
          description: 'Make sure you are using Safari browser (not Chrome or other browsers)',
        },
        {
          step: 2,
          title: 'Tap the Share button',
          description: 'Look for the share icon at the bottom of the screen (square with an arrow pointing up)',
        },
        {
          step: 3,
          title: 'Scroll and find "Add to Home Screen"',
          description: 'Scroll down in the share menu until you see "Add to Home Screen" and tap it',
        },
        {
          step: 4,
          title: 'Confirm installation',
          description: 'Tap "Add" in the top right corner. The app will now appear on your home screen',
        },
      ],
    },
    android: {
      title: 'Install on Android',
      steps: [
        {
          step: 1,
          title: 'Open Mealio in Chrome',
          description: 'Navigate to Mealio using Google Chrome browser',
        },
        {
          step: 2,
          title: 'Tap the menu (three dots)',
          description: 'Tap the three-dot menu icon in the top right corner of the browser',
        },
        {
          step: 3,
          title: 'Select "Add to Home screen" or "Install app"',
          description: 'Look for either "Add to Home screen" or "Install app" option in the menu',
        },
        {
          step: 4,
          title: 'Confirm installation',
          description: 'Tap "Install" or "Add" when prompted. The app will be added to your home screen',
        },
      ],
    },
    windows: {
      title: 'Install on Windows',
      steps: [
        {
          step: 1,
          title: 'Open Mealio in Chrome or Edge',
          description: 'Navigate to Mealio using Google Chrome or Microsoft Edge browser',
        },
        {
          step: 2,
          title: 'Click the install icon',
          description: 'Look for the install icon (computer with down arrow) in the address bar on the right',
        },
        {
          step: 3,
          title: 'Click "Install"',
          description: 'A popup will appear asking if you want to install Mealio. Click "Install"',
        },
        {
          step: 4,
          title: 'Launch the app',
          description: 'The app will open in its own window and be added to your Start Menu and taskbar',
        },
      ],
    },
    macos: {
      title: 'Install on macOS',
      steps: [
        {
          step: 1,
          title: 'Open Mealio in Chrome or Safari',
          description: 'Navigate to Mealio using Google Chrome or Safari browser',
        },
        {
          step: 2,
          title: 'Access the install option',
          description: 'Chrome: Click the install icon in the address bar. Safari: Go to File > Add to Dock',
        },
        {
          step: 3,
          title: 'Click "Install"',
          description: 'Confirm the installation when prompted',
        },
        {
          step: 4,
          title: 'Launch from Dock',
          description: 'The app will be added to your Dock and Applications folder for easy access',
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
