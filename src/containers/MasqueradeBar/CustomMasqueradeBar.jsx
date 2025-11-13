/* eslint-disable linebreak-style */
/* eslint-disable react/prop-types */
import React from 'react';
import {
  Chip,
  FormControl,
  FormControlFeedback,
  FormGroup,
  StatefulButton,
  Icon,
} from '@openedx/paragon';
import { Close, PersonSearch } from '@openedx/paragon/icons';

import messages from './messages';
import './CustomMasqueradeBar.scss';

const CustomMasqueradeBar = ({
  canMasquerade,
  isMasquerading,
  isMasqueradingFailed,
  isMasqueradingPending,
  masqueradeInput,
  masqueradeErrorMessage,
  handleMasqueradeInputChange,
  handleClearMasquerade,
  handleMasqueradeSubmit,
  formatMessage,
}) => {
  if (!canMasquerade) { return null; }

  return (
    <div className="custom-masquerade-bar">
      {isMasquerading ? (
        <div className="custom-masquerade-bar__viewing">
          <div className="custom-masquerade-bar__label">
            <Icon src={PersonSearch} className="custom-masquerade-bar__icon" />
            <span>{formatMessage(messages.ViewingAs)}</span>
          </div>
          <Chip
            className="custom-masquerade-bar__chip"
            iconAfter={Close}
            onClick={handleClearMasquerade}
          >
            {masqueradeInput}
          </Chip>
        </div>
      ) : (
        <div className="custom-masquerade-bar__form">
          <div className="custom-masquerade-bar__label">
            <Icon src={PersonSearch} className="custom-masquerade-bar__icon" />
            <span>{formatMessage(messages.ViewAs)}</span>
          </div>
          <div className="custom-masquerade-bar__input-wrapper">
            <FormGroup isInvalid={isMasqueradingFailed} className="custom-masquerade-bar__input-group">
              <FormControl
                value={masqueradeInput}
                onChange={handleMasqueradeInputChange}
                placeholder={formatMessage(messages.StudentNameInput)}
                aria-label={formatMessage(messages.StudentNameInput)}
                size="sm"
                className="custom-masquerade-bar__input"
              />
              {isMasqueradingFailed && (
                <FormControlFeedback type="invalid" hasIcon={false} className="custom-masquerade-bar__error">
                  {formatMessage(masqueradeErrorMessage)}
                </FormControlFeedback>
              )}
            </FormGroup>
          </div>
          <StatefulButton
            disabled={!masqueradeInput.length}
            variant="primary"
            onClick={handleMasqueradeSubmit(masqueradeInput)}
            labels={{
              default: formatMessage(messages.SubmitButton),
            }}
            size="sm"
            // className="custom-masquerade-bar__submit"
            state={isMasqueradingPending ? 'pending' : 'default'}
            type="submit"
          />
        </div>
      )}
    </div>
  );
};

export default CustomMasqueradeBar;
