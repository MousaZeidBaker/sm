import Button from '@material-ui/core/Button'
import {
  green,
  red,
} from '@material-ui/core/colors'
import { withStyles, Theme } from '@material-ui/core/styles';

export const GreenButton = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.getContrastText(green[300]),
    backgroundColor: green[300],
    '&:hover': {
      backgroundColor: green[500]
    }
  }
}))(Button)

export const RedButton = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.getContrastText(red[300]),
    backgroundColor: red[300],
    '&:hover': {
      backgroundColor: red[500]
    }
  }
}))(Button)
