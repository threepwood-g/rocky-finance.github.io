import React, { ReactElement } from "react"

import { TOKENS_MAP } from "../../constants"
import { useTranslation } from "react-i18next"
import {
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
} from "@material-ui/core"

interface Props {
  symbol: string
  icon: string
  max?: string
  inputValue: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function TokenInput({
  symbol,
  max,
  inputValue,
  onChange,
  disabled,
}: Props): ReactElement {
  const { t } = useTranslation()
  function onClickMax(e: React.MouseEvent<HTMLButtonElement>): void {
    e.preventDefault()
    onChange(String(max))
  }
  function onChangeInput(e: React.ChangeEvent<HTMLInputElement>): void {
    const { decimals } = TOKENS_MAP[symbol]
    const parsedValue = parseFloat("0" + e.target.value)
    const periodIndex = e.target.value.indexOf(".")
    const isValidInput = e.target.value === "" || !isNaN(parsedValue)
    const isValidPrecision =
      periodIndex === -1 || e.target.value.length - 1 - periodIndex <= decimals
    if (isValidInput && isValidPrecision) {
      // don't allow input longer than the token allows
      onChange(e.target.value)
    }
  }

  return (
    <FormControl fullWidth>
      <OutlinedInput
        autoComplete="off"
        autoCorrect="off"
        id="amount"
        type="text"
        fullWidth
        value={inputValue}
        placeholder={max || "0"}
        spellCheck="false"
        onChange={onChangeInput}
        onFocus={(e): void => {
          e.target.select()
        }}
        disabled={disabled ? true : false}
        endAdornment={
          max != null && (
            <InputAdornment position="end">
              <Button
                disableElevation
                variant="contained"
                color="secondary"
                disabled={disabled}
                onClick={onClickMax}
              >
                {t("max")}
              </Button>
            </InputAdornment>
          )
        }
      />
    </FormControl>
  )
}