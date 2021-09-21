import React from 'react'
import { Layout } from '../components/layout'
import useSession from '../components/useSession'
import TextField from '@material-ui/core/TextField'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionActions from '@material-ui/core/AccordionActions'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import CancelIcon from '@material-ui/icons/Cancel'
import SaveIcon from '@material-ui/icons/Save'
import { useSnackbar } from 'notistack'

interface ChangePasswordFormValues {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export default function Page(): JSX.Element {
  const initialFormValues: ChangePasswordFormValues = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  }

  const [formValues, setFormValues] = React.useState<ChangePasswordFormValues>({currentPassword: '', newPassword: '', confirmNewPassword: ''})
  const [disableSaveButton, setDisableSaveButton] = React.useState<boolean>(false)

  const passwordHelperText = 'Password must be at least 8 characters'
  const [currentPasswordHelperText, setCurrentPasswordHelperText] = React.useState<string>(passwordHelperText)

  const [currentPasswordError, setCurrentPasswordError] = React.useState<boolean>(false)
  const [newPasswordError, setNewPasswordError] = React.useState<boolean>(false)
  const [confirmNewPasswordError, setConfirmNewPasswordError] = React.useState<boolean>(false)

  const [accordionExpanded, setAccordionExpanded] = React.useState(false);

  const { session, changePassword } = useSession()
  const { enqueueSnackbar } = useSnackbar()

  // Determine if save button should be disabled
  React.useEffect(() => {
    const disableEnableSaveButton = async () => {
      let disable = false

      // Disable button if one of the fields are wrong
      if (currentPasswordError || newPasswordError || confirmNewPasswordError) disable = true

      // Disable button if one of the fields are empty
      Object.values(formValues).forEach(item => {
        if (item === '') disable = true
      })

      setDisableSaveButton(disable)
    }
    disableEnableSaveButton()
  },[formValues])

  /**
   * Handles form value change event
   * 
   * @param {keyof FormValues} key
   * @param {string} value
   * 
   * @return {void}
   */
  const handleChange = (key: keyof ChangePasswordFormValues, value: string): void => {
    setFormValues({ ...formValues, [key]: value })
    validateInput(key as keyof ChangePasswordFormValues, value)
  }

  /**
   * Validate form input
   * 
   * @param {keyof ChangePasswordFormValues} key
   * @param {string} value
   * 
   * @return {void}
   */
    const validateInput = (key: keyof ChangePasswordFormValues, value: string): void => {
      const pattern = new RegExp(/^[\S]{8,}$/gm)
      switch(key) {
        case 'currentPassword': {
          if (value?.match(pattern)) {
            setCurrentPasswordError(false)
          } else {
            setCurrentPasswordError(true)
          }
          return
        }
        case 'newPassword': {
          if (value?.match(pattern)) {
            setNewPasswordError(false)
          } else {
            setNewPasswordError(true)
          }
          return
        }
        case 'confirmNewPassword': {
          if (value?.match(pattern) && value === formValues.newPassword) {
            setConfirmNewPasswordError(false)
          } else {
            setConfirmNewPasswordError(true)
          }
          return
        }
        default: {
          return
        }
      }
    }

  /**
   * Restore the form to its initial state
   * 
   * @return {void}
   */
  const restoreForm = (): void => {
    // Restore form values to their initial value
    setFormValues(initialFormValues)

    // Restore text field error indicator
    setCurrentPasswordHelperText(passwordHelperText)
    setCurrentPasswordError(false)
    setNewPasswordError(false)
    setConfirmNewPasswordError(false)

    // collapse the accordion
    setAccordionExpanded(false)
  }

  /**
   * Handles cancel event
   * 
   * @return {void}
   */
  const handleCancel = (): void => {
    restoreForm()
  }

  /**
   * Handles save event
   * 
   * @return {void}
   */
  const handleSave = async (): Promise<void> => {
    setDisableSaveButton(true)
    try {
      await changePassword(formValues.currentPassword, formValues.newPassword)
    } catch (err: any) {
      switch(err.name) {
        case 'NotAuthorizedException': {
          setCurrentPasswordError(true)
          setCurrentPasswordHelperText('Incorrect password. Try again.')
          return
        }
        default: {
          restoreForm()
          enqueueSnackbar("Error! Couldn't update password.", { variant: 'error' })
          return
        }
      }
    }

    restoreForm()
    enqueueSnackbar('Successfully update password.', { variant: 'success' })
  }

  return (
    <Layout
      showSearchBar={false}
      handleSearchChange={() => {}}
    >
      <Typography variant='h6'>Profile</Typography>
      {/* Username text filed */}
      <TextField
        fullWidth
        margin='dense'
        id='username'
        label='Username'
        InputLabelProps={{
          shrink: true
        }}
        type='text'
        value={session?.user.username}
        disabled={true}
      />
      {/* Email text filed */}
      <TextField
        fullWidth
        margin='dense'
        id='email'
        label='Email'
        InputLabelProps={{
          shrink: true
        }}
        type='text'
        value={session?.user.attributes.email}
        disabled={true}
      />
      <Accordion
        expanded={accordionExpanded}
        onChange={() => setAccordionExpanded(!accordionExpanded)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel1a-content'
          id='panel1a-header'
        >
          <Typography variant='subtitle1'>Change password</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant='subtitle2'>Choose a strong password to protect your account</Typography>
        </AccordionDetails>
        <AccordionDetails>
          {/* CurrentPassword text filed */}
          <TextField
            fullWidth
            margin='dense'
            id='currentPassword'
            label='Current Password'
            type='password'
            error={currentPasswordError}
            helperText={currentPasswordHelperText}
            value={formValues.currentPassword}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('currentPassword', event.target.value)}
          />
          </AccordionDetails>
          <AccordionDetails>
          {/* NewPassword text filed */}
          <TextField
            fullWidth
            margin='dense'
            id='newPassword'
            label='New Password'
            type='password'
            error={newPasswordError}
            helperText={passwordHelperText}
            value={formValues.newPassword}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('newPassword', event.target.value)}
          />
          </AccordionDetails>
          <AccordionDetails>
          {/* ConfirmNewPassword text filed */}
          <TextField
            fullWidth
            margin='dense'
            id='confirmNewPassword'
            label='Confirm New Password'
            type='password'
            error={confirmNewPasswordError}
            value={formValues.confirmNewPassword}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('confirmNewPassword', event.target.value)}
          />
        </AccordionDetails>
        <Divider />
        <AccordionActions>
          {/* Cancel button */}
          <Button
            size='small'
            variant='contained'
            color='default'
            title='Cancel'
            startIcon={<CancelIcon />}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          {/* Save button */}
          <Button
            size='small'
            variant='contained'
            color='primary'
            title='Save'
            disabled={disableSaveButton}
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save
          </Button>
        </AccordionActions>
      </Accordion>
    </Layout>
  )
}
