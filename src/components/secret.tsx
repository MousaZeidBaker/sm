import React from 'react'
import VisibilityIcon from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import Button from '@material-ui/core/Button'
import { CopyContentIcon } from '../icons/content_copy-icon'
import { makeStyles } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles({
  button: {
    marginRight: 16
  }
})

interface Props {
  secret: string
}

export function Secret (props: Props): JSX.Element {
  const [ showSecret, setShowSecret ] = React.useState<boolean>(false)
  const classes = useStyles()

  return (
    <>
      <Button
        className={classes.button}
        size='small'
        variant='contained'
        color='default'
        title={showSecret ? 'Hide' : 'Show'}
        onClick={() => setShowSecret(!showSecret)}
      >
        {showSecret ? < VisibilityOff/> : <VisibilityIcon />}
      </Button>

      <Button
        className={classes.button}
        size='small'
        variant='contained'
        color='default'
        title='Copy'
        onClick={() => navigator.clipboard.writeText(props.secret)}
        >
          <CopyContentIcon/>
        </Button>

      {showSecret && <>
        <Typography paragraph>{props.secret}</Typography>
      </>}
      {!showSecret && <>
        <Typography paragraph>{props.secret.replace(/.?/g, '\u2022')}</Typography>
      </>}
    </>
  )
}
