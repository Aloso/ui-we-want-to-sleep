import HCaptcha from "@hcaptcha/react-hcaptcha";
import { SerializedError } from "@reduxjs/toolkit";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { WWTSButton } from "../components/Button";
import { useCurrentLanguage } from "../hooks/useCurrentLanguage";
import { Ballot } from "../models";
import { selectUIStore } from "../stores/ui";
import styles from "./VotingSection.module.scss";

interface VotingSectionProps {
  onTokenReceive: (token: string) => void;
  ballot: {
    ballot: Ballot | undefined;
    ballotLoading: boolean | undefined;
    ballotError: SerializedError | undefined;
  };
  onVote: (identifier: string) => void;
}

export const VotingSection = ({
  onTokenReceive,
  ballot,
  onVote,
}: VotingSectionProps) => {
  const languageIdentifier = useCurrentLanguage();
  const [captchaSaved, setCaptchaSaved] = useState(false);
  const { cookieConsent } = useSelector(selectUIStore);
  const { t } = useTranslation();

  const handleTokenReceive = useCallback(
    (token: string) => {
      if (!token) {
        setCaptchaSaved(false);
      }
      onTokenReceive(token);
      setCaptchaSaved(true);
    },
    [onTokenReceive]
  );

  return (
    <section className={styles.container}>
      <div className={styles.votingSection}>
        <h4 className={styles.question}>
          {ballot.ballot?.question[languageIdentifier]}
        </h4>
        <p className={styles.description}>{t("voting.description")}</p>
        {!captchaSaved && cookieConsent == "accepted" && (
          <div className={styles.captchaContainer}>
            <div style={{ marginBottom: "-7px" }}>
              {/* for vertical alignment */}
              <HCaptcha
                sitekey="acdc86a2-5971-49dc-a6e9-ee96e5776e44"
                onVerify={handleTokenReceive}
              />
            </div>
          </div>
        )}

        {captchaSaved && (
          <div className={styles.buttonContainer}>
            {ballot.ballot?.options.map((option) => (
              <WWTSButton
                key={option.identifier}
                className={styles.voteButton}
                onClick={() => onVote(option.identifier)}
              >
                {option.label[languageIdentifier]}
              </WWTSButton>
            ))}
          </div>
        )}
        {ballot.ballotError && <p>{t("voting.error")}</p>}
      </div>
    </section>
  );
};
