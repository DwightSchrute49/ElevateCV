import React from "react";
import { SiGithub, SiGoogle } from "react-icons/si";

const providerConfig = {
  google: {
    label: "Continue with Google",
    Icon: SiGoogle,
  },
  github: {
    label: "Continue with GitHub",
    Icon: SiGithub,
  },
};

const OAuthButton = ({ provider, onClick }) => {
  const config = providerConfig[provider];

  if (!config) {
    return null;
  }

  const { Icon, label } = config;

  return (
    <button
      type="button"
      className={`social-btn social-btn--${provider}`}
      onClick={onClick}
      aria-label={label}
    >
      <span className="social-btn__content">
        <Icon className="social-icon" aria-hidden="true" />
        <span>{label}</span>
      </span>
    </button>
  );
};

export default OAuthButton;