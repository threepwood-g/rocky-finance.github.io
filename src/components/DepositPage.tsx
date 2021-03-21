import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"
import ConfirmTransaction from "./material/ConfirmTransaction"
import { DepositTransaction } from "../interfaces/transactions"
import { HistoricalPoolDataType } from "../hooks/useHistoricalPoolData"
import LPStakingBanner from "./material/LPStakingBanner"
import MyActivityCard from "./MyActivityCard"
import MyShareCard from "./material/MyShareCard"
import PoolInfoCard from "./material/PoolInfoCard"
import { REFS } from "../constants"
import ReviewDeposit from "./material/ReviewDeposit"
import { formatBNToPercentString } from "../utils"
import { logEvent } from "../utils/googleAnalytics"
import { useTranslation } from "react-i18next"
import {
  Button,
  Container,
  createStyles,
  Grid,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core"
import AdvancedPanel from "./material/AdvancedPanel"
import DepositForm from "./material/DepositForm"
import { BigNumber } from "@ethersproject/bignumber"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  title: string
  tokens: Array<{
    symbol: string
    name: string
    icon: string
    max: string
    isZeroBalance: boolean
    inputValue: string
  }>
  selected?: { [key: string]: any }
  poolData: PoolDataType | null
  historicalPoolData: HistoricalPoolDataType | null
  myShareData: UserShareType | null
  transactionData: DepositTransaction
  canDeposit: boolean
  onConfirmTransaction: () => Promise<void>
  onChangeTokenInputValue: (tokenSymbol: string, value: string) => void
  exceedsWallet: (tokenSymbol: string) => boolean
}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      flexGrow: 1,
    },
    bonus: {
      color: theme.palette.success.main,
    },
    warn: {
      color: theme.palette.warning.main,
    },
  }),
)

/* eslint-enable @typescript-eslint/no-explicit-any */
const DepositPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const classes = useStyles()
  const {
    tokens,
    poolData,
    historicalPoolData,
    myShareData,
    transactionData,
    canDeposit,
    exceedsWallet,
    onChangeTokenInputValue,
    onConfirmTransaction,
  } = props

  const [currentModal, setCurrentModal] = useState<string | null>(null)

  return (
    <Container maxWidth="md">
      <Grid container direction="column" spacing={2}>
        {myShareData?.lpTokenBalance.gt(0) && (
          <Grid container item>
            <Grid item xs={12} component={LPStakingBanner} />
          </Grid>
        )}
        <Grid
          item
          container
          direction="row"
          className={classes.root}
          spacing={2}
        >
          <Grid item xs={12} md container>
            <Paper variant="outlined" className={classes.paper}>
              <DepositForm
                exceedsWallet={exceedsWallet}
                tokens={tokens}
                onChangeTokenInputValue={onChangeTokenInputValue}
              />
            </Paper>
          </Grid>
          {myShareData ? (
            <Grid item xs={12} md={6} container>
              <Paper variant="outlined" className={classes.paper}>
                <MyShareCard data={myShareData} />
              </Paper>
            </Grid>
          ) : null}
          {historicalPoolData ? (
            <Grid item xs={12} container>
              <Paper variant="outlined" className={classes.paper}>
                <MyActivityCard historicalPoolData={historicalPoolData} />
              </Paper>
            </Grid>
          ) : null}
          {poolData ? (
            <Grid item xs={12} container>
              <Paper variant="outlined" className={classes.paper}>
                <PoolInfoCard data={poolData} />
              </Paper>
            </Grid>
          ) : null}
        </Grid>
        <Grid container item>
          <AdvancedPanel
            actionComponent={
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                disableElevation
                onClick={(): void => {
                  setCurrentModal("review")
                }}
                disabled={!canDeposit}
              >
                {t("deposit")}
              </Button>
            }
          >
            <Grid item xs>
              <Typography
                color="inherit"
                component="div"
                className={
                  transactionData.priceImpact.gte(0)
                    ? classes.bonus
                    : classes.warn
                }
              >
                {transactionData.priceImpact.gte(0)
                  ? `${t("bonus")}: ${formatBNToPercentString(
                      transactionData.priceImpact,
                      18,
                      4,
                    )}`
                  : `${t("priceImpact")}: ${formatBNToPercentString(
                      transactionData.priceImpact,
                      18,
                      4,
                    )}`}
              </Typography>
            </Grid>
            {poolData?.keepApr && (
              <Grid item xs>
                <Typography color="inherit" component="div">
                  <a
                    href={REFS.TRANSACTION_INFO}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{`${t("totalAPY")}: `}</span>
                  </a>
                  <span className="value">
                    {formatBNToPercentString(
                      poolData.totalAPY ? poolData.totalAPY : BigNumber.from(0),
                      18,
                    )}
                  </span>
                </Typography>
              </Grid>
            )}
          </AdvancedPanel>
        </Grid>
      </Grid>
      {currentModal === "review" && (
        <ReviewDeposit
          open
          onClose={(): void => setCurrentModal(null)}
          onDeposit={async (): Promise<void> => {
            setCurrentModal("confirm")
            logEvent("deposit", (poolData && { pool: poolData?.name }) || {})
            await onConfirmTransaction?.()
            setCurrentModal(null)
          }}
          data={transactionData}
        />
      )}
      {currentModal === "confirm" && (
        <ConfirmTransaction open onClose={(): void => setCurrentModal(null)} />
      )}
    </Container>
  )
}

export default DepositPage
