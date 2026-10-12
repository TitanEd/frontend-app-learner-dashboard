import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Dropdown, Icon, IconButton } from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';

import EmailSettingsModal from 'containers/EmailSettingsModal/CustomEmailSettingsModal';
import UnenrollConfirmModal from 'containers/UnenrollConfirmModal';
import { useCourseData, useIsMasquerading } from 'hooks';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import SocialShareMenu from './SocialShareMenu';
import {
  useEmailSettings,
  useUnenrollData,
  useHandleToggleDropdown,
  useOptionVisibility,
  useCardSocialSettingsData,
} from './hooks';

import messages from './messages';

export const testIds = {
  unenrollModalToggle: 'unenrollModalToggle',
};

export const CourseCardMenu = ({ cardId }) => {
  const { formatMessage } = useIntl();
  const courseData = useCourseData(cardId);

  const isEmailEnabled = courseData?.enrollment?.isEmailEnabled ?? false;
  const allowUnenrollment = courseData?.enrollment?.allowUnenrollment;

  const { facebook, twitter } = useCardSocialSettingsData(cardId);
  const hasOtherItems = isEmailEnabled || facebook.isEnabled || twitter.isEnabled;

  const emailSettings = useEmailSettings();
  const unenrollModal = useUnenrollData();
  const handleToggleDropdown = useHandleToggleDropdown(cardId);
  // Same rule as the stock menu (active enrollment, no earned certificate).
  // The learner-home API has no enrollment.allowUnenrollment field; it is only
  // honoured as an extra veto when a backend explicitly sends `false`.
  const { shouldShowUnenrollItem, shouldShowDropdown } = useOptionVisibility(cardId);
  const showUnenrollItem = shouldShowUnenrollItem && allowUnenrollment !== false;
  const isMasquerading = useIsMasquerading();

  // No toggle when the menu would be empty.
  if (!shouldShowDropdown || !(showUnenrollItem || hasOtherItems)) {
    return null;
  }

  return (
    <>
      <Dropdown onToggle={handleToggleDropdown}>
        <PluginSlot
          id="custom_unenroll_icon_plugin_slot"
          pluginProps={{
            cardId,
            IconButton,
            Icon,
            altValue: formatMessage(messages.dropdownAlt),
          }}
        >
          <Dropdown.Toggle
            id={`course-actions-dropdown-${cardId}`}
            as={IconButton}
            src={MoreVert}
            iconAs={Icon}
            variant="primary"
            alt={formatMessage(messages.dropdownAlt)}
          />
        </PluginSlot>

        <Dropdown.Menu>
          {showUnenrollItem && (
            <Dropdown.Item
              disabled={isMasquerading}
              onClick={unenrollModal.show}
              data-testid={testIds.unenrollModalToggle}
            >
              {formatMessage(messages.unenroll)}
            </Dropdown.Item>
          )}
          <SocialShareMenu cardId={cardId} emailSettings={emailSettings} />
        </Dropdown.Menu>
      </Dropdown>

      <UnenrollConfirmModal
        show={unenrollModal.isVisible}
        closeModal={unenrollModal.hide}
        cardId={cardId}
      />
      {isEmailEnabled && (
        <EmailSettingsModal
          show={emailSettings.isVisible}
          closeModal={emailSettings.hide}
          cardId={cardId}
        />
      )}
    </>
  );
};
CourseCardMenu.propTypes = {
  cardId: PropTypes.string.isRequired,
};

export default CourseCardMenu;
